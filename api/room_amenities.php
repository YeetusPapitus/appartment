<?php

// room_amenities.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'Database.php';

$pdo = Database::getInstance();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT 
                ra.IDRoomAmenity,
                ra.RoomID,
                ra.AmenityID,
                r.Title AS RoomTitle,
                a.Title AS AmenityTitle
            FROM roomamenity ra
            JOIN room r ON r.IDRoom = ra.RoomID
            JOIN amenity a ON a.IDAmenity = ra.AmenityID
            ORDER BY a.Title ASC, r.Title ASC, ra.IDRoomAmenity DESC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'mappings' => $rows]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch mappings.']);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $amenityId = (int)($input['AmenityID'] ?? 0);
    $roomIds = $input['RoomIDs'] ?? [];

    if ($amenityId <= 0 || !is_array($roomIds) || count($roomIds) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'AmenityID and RoomIDs are required.']);
        exit;
    }

    try {
        $ins = $pdo->prepare("INSERT INTO roomamenity (RoomID, AmenityID) VALUES (?, ?)");
        foreach ($roomIds as $rid) {
            $rid = (int)$rid;
            if ($rid <= 0) continue;

            try {
                $ins->execute([$rid, $amenityId]);
            } catch (Exception $e) {
            }
        }
        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to assign amenities.']);
        exit;
    }
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $amenityId = isset($_GET['amenityId']) ? (int)$_GET['amenityId'] : 0;
    $roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;

    try {
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM roomamenity WHERE IDRoomAmenity = ?");
            $stmt->execute([$id]);
        } elseif ($amenityId > 0 && $roomId > 0) {
            $stmt = $pdo->prepare("DELETE FROM roomamenity WHERE AmenityID = ? AND RoomID = ?");
            $stmt->execute([$amenityId, $roomId]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid parameters.']);
            exit;
        }

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to unassign amenity.']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
