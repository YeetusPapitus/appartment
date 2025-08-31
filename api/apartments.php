<?php
// api/apartments.php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/Database.php';
$pdo = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM room ORDER BY IDRoom DESC");
        echo json_encode(['success' => true, 'apartments' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $pdo->prepare("
            INSERT INTO room (Title, Description, Price, Guests, BedType, BedQuantity)
            VALUES (:t,:d,:p,:g,:bt,:bq)
        ");
        $stmt->execute([
            ':t'=>$data['Title'] ?? '',
            ':d'=>$data['Description'] ?? '',
            ':p'=>$data['Price'] ?? 0,
            ':g'=>$data['Guests'] ?? 0,
            ':bt'=>$data['BedType'] ?? '',
            ':bq'=>$data['BedQuantity'] ?? 0,
        ]);
        echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) { echo json_encode(['success'=>false,'error'=>'Missing ID']); exit; }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $pdo->prepare("
           UPDATE room
           SET Title=:t, Description=:d, Price=:p, Guests=:g, BedType=:bt, BedQuantity=:bq
           WHERE IDRoom=:id
        ");
        $stmt->execute([
            ':t'=>$data['Title'] ?? '',
            ':d'=>$data['Description'] ?? '',
            ':p'=>$data['Price'] ?? 0,
            ':g'=>$data['Guests'] ?? 0,
            ':bt'=>$data['BedType'] ?? '',
            ':bq'=>$data['BedQuantity'] ?? 0,
            ':id'=>$id,
        ]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) { echo json_encode(['success'=>false,'error'=>'Missing ID']); exit; }

        // BLOCK deletion if there are active reservations
        $rs = $pdo->prepare("SELECT COUNT(*) FROM reservation WHERE RoomID = ? AND Status IN ('Pending','Accepted')");
        $rs->execute([$id]);
        if ((int)$rs->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success'=>false,'error'=>'Room has active reservations; delete or update them first.']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            // 1) delete roomamenity links
            $pdo->prepare("DELETE FROM roomamenity WHERE RoomID = ?")->execute([$id]);

            // 2) delete unavailable dates
            $pdo->prepare("DELETE FROM unavailabledate WHERE RoomID = ?")->execute([$id]);

            // 3) delete images (and files) OR set to NULL if your FK allows it
            //   If your current FK is RESTRICT, delete rows and files:
            $sel = $pdo->prepare("SELECT IDImage, ImageURL FROM image WHERE RoomID = ?");
            $sel->execute([$id]);
            $images = $sel->fetchAll(PDO::FETCH_ASSOC);

            foreach ($images as $img) {
                $filePath = rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') . DIRECTORY_SEPARATOR . ltrim($img['ImageURL'], '/\\');
                if (is_file($filePath)) { @unlink($filePath); }
                $pdo->prepare("DELETE FROM image WHERE IDImage = ?")->execute([(int)$img['IDImage']]);
            }

            // 4) finally delete the room
            $pdo->prepare("DELETE FROM room WHERE IDRoom = ?")->execute([$id]);

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Throwable $t) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success'=>false,'error'=>'Failed to delete room']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Server error']);
}
