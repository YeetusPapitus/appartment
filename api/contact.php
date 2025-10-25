<?php

// contact.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'Database.php';

$pdo = Database::getInstance();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name    = trim($input['name']    ?? '');
    $email   = trim($input['email']   ?? '');
    $message = trim($input['message'] ?? '');

    if (!$name || !$email || !$message) {
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
          INSERT INTO `Contact` (`Name`, `Email`, `Message`, `Status`)
          VALUES (:name, :email, :message, 'Pending')
        ");
        $stmt->execute([
            ':name'    => $name,
            ':email'   => $email,
            ':message' => $message
        ]);

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Database error.']);
        exit;
    }

} elseif ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT IDContact, Name, Email, Message, Status, Timestamp FROM Contact ORDER BY IDContact DESC");
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'contacts' => $contacts]);
        exit;
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Failed to fetch contacts.']);
        exit;
    }

} elseif ($method === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $status = trim($input['Status'] ?? '');

    if (!in_array($status, ['Pending', 'Read'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid status value']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE Contact SET Status = :status WHERE IDContact = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);

        echo json_encode(['success' => true]);
        exit;
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Failed to update status']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
