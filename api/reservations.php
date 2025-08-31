<?php
// reservations.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Allow OPTIONS method for preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include Database Singleton class
require_once 'Database.php';

// Get the PDO instance from the Singleton
$pdo = Database::getInstance();

// Routing Logic
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetReservations($pdo);
        break;

    case 'POST':
        handlePostReservation($pdo);
        break;

    case 'PATCH':
        handlePatchReservation($pdo);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

/**
 * Handle GET requests for listing reservations.
 */
function handleGetReservations($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                r.IDReservation,
                DATE_FORMAT(r.CheckIn, '%d/%m/%Y') AS CheckIn,
                DATE_FORMAT(r.CheckOut, '%d/%m/%Y') AS CheckOut,
                r.Guests,
                r.RoomID,
                room.Title AS RoomName,
                r.Name,
                r.Email,
                r.PhoneNumber,
                r.Message,
                r.Status,
                r.Timestamp
            FROM reservation r
            LEFT JOIN room ON r.RoomID = room.IDRoom
            ORDER BY r.IDReservation DESC
        ");
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'reservations' => $reservations]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch reservations.']);
    }
}

/**
 * Handle POST requests to create a new reservation.
 */
function handlePostReservation($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input fields and pass $pdo to the validation function
    $fieldErrors = validateReservation($input, $pdo);

    if (!empty($fieldErrors)) {
        echo json_encode(['success' => false, 'fieldErrors' => $fieldErrors]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO reservation 
            (CheckIn, CheckOut, Guests, RoomID, Name, Email, PhoneNumber, Message, Status)
            VALUES (:checkIn, :checkOut, :guests, :roomId, :name, :email, :phone, :message, 'Pending')
        ");
        $stmt->execute([
            ':checkIn'  => $input['CheckIn'],
            ':checkOut' => $input['CheckOut'],
            ':guests'   => $input['Guests'],
            ':roomId'   => $input['RoomID'],
            ':name'     => $input['Name'],
            ':email'    => $input['Email'],
            ':phone'    => $input['PhoneNumber'],
            ':message'  => $input['Message']
        ]);

        echo json_encode([
            'success'  => true,
            'message'  => 'Reservation submitted successfully.'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database insert failed.']);
    }
}

/**
 * Handle PATCH requests to update reservation status.
 */
function handlePatchReservation($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = intval($input['IDReservation'] ?? 0);
    $status = trim($input['Status'] ?? '');

    if ($id <= 0 || !in_array($status, ['Pending', 'Accepted', 'Denied'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid ID or status']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE reservation SET Status = ? WHERE IDReservation = ?");
        $stmt->execute([$status, $id]);
        echo json_encode(['success' => true, 'message' => 'Reservation status updated.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update status.']);
    }
}

/**
 * Validate reservation data and check room capacity.
 */
function validateReservation($input, $pdo) {
    $fieldErrors = [];

    if (empty($input['CheckIn'])) $fieldErrors['CheckIn'] = 'CheckIn is required';
    if (empty($input['CheckOut'])) $fieldErrors['CheckOut'] = 'CheckOut is required';
    if (strtotime($input['CheckIn']) >= strtotime($input['CheckOut'])) $fieldErrors['CheckOut'] = 'Check-out must be after check-in';
    if ($input['Guests'] <= 0) $fieldErrors['Guests'] = 'Number of guests is required';
    if ($input['RoomID'] <= 0) $fieldErrors['RoomID'] = 'Invalid room ID';
    if (empty($input['Name'])) $fieldErrors['Name'] = 'Name is required';
    if (empty($input['Email'])) $fieldErrors['Email'] = 'Email is required';
    if (!filter_var($input['Email'], FILTER_VALIDATE_EMAIL)) $fieldErrors['Email'] = 'Invalid email address';
    if (empty($input['PhoneNumber'])) $fieldErrors['PhoneNumber'] = 'Phone number is required';

    // Check room capacity
    if ($input['RoomID'] > 0) {
        $stmt = $pdo->prepare("SELECT Guests FROM room WHERE IDRoom = ?");
        $stmt->execute([$input['RoomID']]);
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($room && $input['Guests'] > $room['Guests']) {
            $fieldErrors['Guests'] = 'Guests exceed room capacity';
        }
    }

    return $fieldErrors;
}
?>
