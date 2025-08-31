<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include necessary files
require_once 'Database.php';
require_once 'auth.php';  // Assuming you have an auth file for login and token validation

// Get the API request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Routing based on request URI and method
switch ($requestUri) {
    case '/appartment/api/apartments.php':
        require_once 'apartments.php';  // Handle apartments API
        break;

    case '/appartment/api/admin_login.php':
        require_once 'admin_login.php';  // Handle admin login
        break;

    case '/appartment/api/reservations.php':
        require_once 'reservations.php';  // Handle reservations API
        break;

    case '/appartment/api/images.php':
        require_once 'images.php';  // Handle images API
        break;

    case '/appartment/api/room_amenities.php':
        require_once 'room_amenities.php';  // Handle room amenities API
        break;

    case '/appartment/api/unavailable_dates.php':
        require_once 'unavailable_dates.php';  // Handle unavailable dates API
        break;

    case '/appartment/api/availability.php':
        require_once 'availability.php';
        break;

    default:
        echo json_encode(["success" => false, "error" => "Endpoint not found."]);
        break;
}
?>
