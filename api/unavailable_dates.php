<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'Database.php';

$pdo = Database::getInstance();  // Singleton DB connection

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT 
                u.IDUnavailableDate,
                DATE_FORMAT(u.`Date`, '%d/%m/%Y') AS DateFormatted,
                u.`Date`,
                u.RoomID,
                r.Title AS RoomTitle
            FROM unavailabledate u
            LEFT JOIN room r ON r.IDRoom = u.RoomID
            ORDER BY u.`Date` DESC, u.IDUnavailableDate DESC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'dates' => $rows]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch unavailable dates.']);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $date = trim($input['Date'] ?? '');
    $roomId = isset($input['RoomID']) ? intval($input['RoomID']) : 0;

    if (!$date || !$roomId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'RoomID and Date are required.']);
        exit;
    }

    try {
        $check = $pdo->prepare("SELECT 1 FROM unavailabledate WHERE RoomID = ? AND `Date` = ? LIMIT 1");
        $check->execute([$roomId, $date]);
        if ($check->fetchColumn()) {
            echo json_encode(['success' => false, 'error' => 'This date is already marked unavailable for the selected room.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO unavailabledate (`Date`, RoomID) VALUES (:d, :rid)");
        $stmt->execute([':d' => $date, ':rid' => $roomId]);

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to add unavailable date.']);
        exit;
    }
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid id.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM unavailabledate WHERE IDUnavailableDate = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete unavailable date.']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
