<?php

// index.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'Database.php';
require_once 'auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

switch ($requestUri) {
    case '/appartment/api/apartments.php':
        require_once 'apartments.php';
        break;

    case '/appartment/api/admin_login.php':
        require_once 'admin_login.php';
        break;

    case '/appartment/api/reservations.php':
        require_once 'reservations.php';
        break;

    case '/appartment/api/images.php':
        require_once 'images.php';
        break;

    case '/appartment/api/room_amenities.php':
        require_once 'room_amenities.php';
        break;

    case '/appartment/api/unavailable_dates.php':
        require_once 'unavailable_dates.php';
        break;

    case '/appartment/api/availability.php':
        require_once 'availability.php';
        break;

    default:
        echo json_encode(["success" => false, "error" => "Endpoint not found."]);
        break;
}
?>
