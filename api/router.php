<?php

require_once 'admin_login.php';
require_once 'reservations.php';
require_once 'apartments.php';
require_once 'images.php';
require_once 'room_amenities.php';
require_once 'unavailable_dates.php';

// This function will handle the routing logic based on the request URI
function routeRequest($url) {
    switch ($url) {
        case '/admin/login':
            require_once 'admin_login.php';
            break;
        case '/reservations':
            require_once 'reservations.php';
            break;
        case '/apartments':
            require_once 'apartments.php';
            break;
        case '/images':
            require_once 'images.php';
            break;
        case '/room_amenities':
            require_once 'room_amenities.php';
            break;
        case '/unavailable_dates':
            require_once 'unavailable_dates.php';
            break;
        case '/availability':
            require_once 'availability.php';
            break;
        default:
            header("HTTP/1.1 404 Not Found");
            echo json_encode(['message' => 'Route not found']);
            break;
    }
}

$url = $_SERVER['REQUEST_URI'];
routeRequest($url);
?>
