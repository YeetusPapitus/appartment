<?php

// images.php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/Database.php';
$pdo = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET': {
            $stmt = $pdo->query("
              SELECT i.IDImage, i.ImageURL, i.RoomID, i.IsPrimary, i.SortOrder, r.Title AS RoomTitle
              FROM image i
              LEFT JOIN room r ON i.RoomID = r.IDRoom
              ORDER BY COALESCE(i.RoomID, 0), i.SortOrder DESC, i.IDImage DESC
            ");
            $images = $stmt->fetch(PDO::FETCH_ASSOC) ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            echo json_encode(['success' => true, 'images' => $images]);
            exit;
        }

        case 'POST': {
            if (!isset($_FILES['image'])) {
                echo json_encode(['success' => false, 'error' => 'No file uploaded']);
                exit;
            }

            $file   = $_FILES['image'];
            $roomId = isset($_POST['roomId']) ? (int)$_POST['roomId'] : 0;

            if ($file['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['success' => false, 'error' => 'Upload error']);
                exit;
            }

            $allowed = [
                'image/jpeg' => '.jpg',
                'image/png'  => '.png',
                'image/gif'  => '.gif',
                'image/webp' => '.webp',
            ];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime  = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!isset($allowed[$mime])) {
                echo json_encode(['success' => false, 'error' => 'Invalid image type']);
                exit;
            }
            $maxBytes = 5 * 1024 * 1024;
            if ($file['size'] > $maxBytes) {
                echo json_encode(['success' => false, 'error' => 'File too large (max 5MB)']);
                exit;
            }

            $ext       = $allowed[$mime];
            $filename  = time() . '_' . bin2hex(random_bytes(6)) . $ext;
            $uploadDir = dirname(__DIR__) . '/uploads';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $targetPath = $uploadDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT COALESCE(MAX(SortOrder), 0) FROM image WHERE RoomID = ?");
            $stmt->execute([$roomId]);
            $sortOrder = ((int)$stmt->fetchColumn()) + 1;

            $publicUrl = '/appartment/uploads/' . $filename;

            $stmt = $pdo->prepare("
                INSERT INTO image (ImageURL, RoomID, IsPrimary, SortOrder)
                VALUES (:url, :roomId, 0, :sortOrder)
            ");
            $stmt->execute([
                ':url'       => $publicUrl,
                ':roomId'    => $roomId,
                ':sortOrder' => $sortOrder,
            ]);

            echo json_encode([
                'success' => true,
                'image'   => [
                    'IDImage'   => (int)$pdo->lastInsertId(),
                    'ImageURL'  => $publicUrl,
                    'RoomID'    => $roomId,
                    'IsPrimary' => 0,
                    'SortOrder' => $sortOrder,
                ],
            ]);
            exit;
        }

        case 'PUT': {
            parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
            $id = isset($q['id']) ? (int)$q['id'] : 0;
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'Missing id']);
                exit;
            }

            $input  = json_decode(file_get_contents('php://input'), true) ?? [];
            $action = $input['action'] ?? '';

            if ($action === 'assign') {
                $roomId = isset($input['roomId']) ? (int)$input['roomId'] : 0;

                $stmt = $pdo->prepare("SELECT COALESCE(MAX(SortOrder), 0) FROM image WHERE RoomID = ?");
                $stmt->execute([$roomId]);
                $sortOrder = ((int)$stmt->fetchColumn()) + 1;

                $stmt = $pdo->prepare("UPDATE image SET RoomID = :rid, SortOrder = :so WHERE IDImage = :id");
                $stmt->execute([':rid' => $roomId, ':so' => $sortOrder, ':id' => $id]);

                $stmt = $pdo->prepare("SELECT IsPrimary FROM image WHERE IDImage = ?");
                $stmt->execute([$id]);
                $isPrimary = (int)$stmt->fetchColumn();
                if ($isPrimary) {
                    $stmt = $pdo->prepare("UPDATE image SET IsPrimary = 0 WHERE RoomID = :rid AND IDImage <> :id");
                    $stmt->execute([':rid' => $roomId, ':id' => $id]);
                }

                echo json_encode(['success' => true]);
                exit;
            }

            if ($action === 'set_primary') {
                $isPrimary = !empty($input['isPrimary']) ? 1 : 0;

                $stmt = $pdo->prepare("SELECT RoomID FROM image WHERE IDImage = ?");
                $stmt->execute([$id]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$row) {
                    echo json_encode(['success' => false, 'error' => 'Image not found']);
                    exit;
                }
                $roomId = (int)$row['RoomID'];

                if ($isPrimary) {
                    $stmt = $pdo->prepare("UPDATE image SET IsPrimary = 0 WHERE RoomID = :rid");
                    $stmt->execute([':rid' => $roomId]);
                }

                $stmt = $pdo->prepare("UPDATE image SET IsPrimary = :is WHERE IDImage = :id");
                $stmt->execute([':is' => $isPrimary, ':id' => $id]);

                echo json_encode(['success' => true]);
                exit;
            }

            if ($action === 'reorder') {
                $direction = $input['direction'] ?? '';
                if (!in_array($direction, ['up', 'down'], true)) {
                    echo json_encode(['success' => false, 'error' => 'Invalid direction']);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT RoomID, SortOrder FROM image WHERE IDImage = ?");
                $stmt->execute([$id]);
                $curr = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$curr) {
                    echo json_encode(['success' => false, 'error' => 'Image not found']);
                    exit;
                }

                $roomId    = $curr['RoomID'];
                $currOrder = (int)$curr['SortOrder'];

                if ($direction === 'up') {
                    $stmt = $pdo->prepare("
                      SELECT IDImage, SortOrder
                      FROM image
                      WHERE COALESCE(RoomID,0) = COALESCE(:rid,0) AND SortOrder > :so
                      ORDER BY SortOrder ASC
                      LIMIT 1
                    ");
                    $stmt->execute([':rid' => $roomId, ':so' => $currOrder]);
                } else {
                    $stmt = $pdo->prepare("
                      SELECT IDImage, SortOrder
                      FROM image
                      WHERE COALESCE(RoomID,0) = COALESCE(:rid,0) AND SortOrder < :so
                      ORDER BY SortOrder DESC
                      LIMIT 1
                    ");
                    $stmt->execute([':rid' => $roomId, ':so' => $currOrder]);
                }

                $neighbor = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$neighbor) {
                    echo json_encode(['success' => false, 'error' => 'No neighbor to swap with']);
                    exit;
                }

                $pdo->beginTransaction();
                try {
                    $stmt = $pdo->prepare("UPDATE image SET SortOrder = :so WHERE IDImage = :id");
                    $stmt->execute([':so' => (int)$neighbor['SortOrder'], ':id' => $id]);
                    $stmt->execute([':so' => $currOrder, ':id' => (int)$neighbor['IDImage']]);
                    $pdo->commit();
                    echo json_encode(['success' => true]);
                } catch (Throwable $t) {
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'error' => 'Reorder failed']);
                }
                exit;
            }

            echo json_encode(['success' => false, 'error' => 'Unknown action']);
            exit;
        }

        case 'DELETE': {
            parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
            $id = isset($q['id']) ? (int)$q['id'] : 0;
            if ($id <= 0) {
                echo json_encode(['success' => false, 'error' => 'Missing id']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT ImageURL FROM image WHERE IDImage = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                echo json_encode(['success' => false, 'error' => 'Image not found']);
                exit;
            }

            $imageUrl = $row['ImageURL'];
            $filePath = rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') . DIRECTORY_SEPARATOR . ltrim($imageUrl, '/\\');
            if (is_file($filePath)) {
                @unlink($filePath);
            }

            $stmt = $pdo->prepare("DELETE FROM image WHERE IDImage = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
            exit;
        }

        default: {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
    exit;
}
