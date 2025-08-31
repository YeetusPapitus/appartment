<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Allow CORS if needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'Database.php';

$pdo = Database::getInstance();  // Singleton DB connection

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT IDAmenity, Title FROM amenity ORDER BY Title ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'amenities' => $rows]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch amenities.']);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['Title'] ?? '');

    if ($title === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Title is required.']);
        exit;
    }

    try {
        $check = $pdo->prepare("SELECT IDAmenity FROM amenity WHERE Title = ? LIMIT 1");
        $check->execute([$title]);
        if ($check->fetchColumn()) {
            echo json_encode(['success' => false, 'error' => 'Amenity already exists.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO amenity (Title) VALUES (:t)");
        $stmt->execute([':t' => $title]);
        $id = (int)$pdo->lastInsertId();

        echo json_encode(['success' => true, 'IDAmenity' => $id]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create amenity.']);
        exit;
    }
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid id.']);
        exit;
    }

    try {
        $pdo->prepare("DELETE FROM roomamenity WHERE AmenityID = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM amenity WHERE IDAmenity = ?")->execute([$id]);

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete amenity.']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
