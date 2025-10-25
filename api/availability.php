<?php

// availability.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'Database.php';

$pdo = Database::getInstance();

$roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;
$start = isset($_GET['start']) ? $_GET['start'] : '';
$end = isset($_GET['end']) ? $_GET['end'] : '';

if ($roomId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'roomId is required']);
    exit;
}

if (!$start || !$end) {
    $first = new DateTime('first day of this month 00:00:00');
    $last = new DateTime('last day of this month 00:00:00');
    $start = $first->format('Y-m-d');
    $end = $last->format('Y-m-d');
}

try {
    $startDt = new DateTime($start);
    $endDt = new DateTime($end);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid date range']);
    exit;
}

$blocked = [];

try {
    $sql = "
    SELECT d FROM (
        SELECT
            RoomID,
            CASE
                WHEN `Date` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN DATE(`Date`)
                WHEN `Date` REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN STR_TO_DATE(`Date`, '%d/%m/%Y')
                ELSE NULL
            END AS d
        FROM unavailabledate
        WHERE RoomID = :rid
    ) AS x
    WHERE d BETWEEN :s AND :e
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':rid' => $roomId,
        ':s' => $startDt->format('Y-m-d'),
        ':e' => $endDt->format('Y-m-d'),
    ]);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($row['d']) {
            $blocked[(new DateTime($row['d']))->format('Y-m-d')] = true;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch unavailable dates.']);
    exit;
}

try {
    $sql = "
    SELECT ci, co FROM (
        SELECT
            RoomID,
            Status,
            CASE
                WHEN CheckIn  REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN DATE(CheckIn)
                WHEN CheckIn  REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN STR_TO_DATE(CheckIn,  '%d/%m/%Y')
                ELSE NULL
            END AS ci,
            CASE
                WHEN CheckOut REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN DATE(CheckOut)
                WHEN CheckOut REGEXP '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN STR_TO_DATE(CheckOut, '%d/%m/%Y')
                ELSE NULL
            END AS co
        FROM reservation
        WHERE RoomID = :rid
    ) r
    WHERE Status = 'Accepted'
      AND ci IS NOT NULL AND co IS NOT NULL
      AND ci <= :e AND co >= :s
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':rid' => $roomId,
        ':s' => $startDt->format('Y-m-d'),
        ':e' => $endDt->format('Y-m-d'),
    ]);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $ci = new DateTime($row['ci']);
        $co = new DateTime($row['co']);

        if ($ci < $startDt) $ci = clone $startDt;
        if ($co > $endDt) $co = clone $endDt;

        $cursor = clone $ci;
        while ($cursor < $co) {
            $blocked[$cursor->format('Y-m-d')] = true;
            $cursor->modify('+1 day');
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch reservations.']);
    exit;
}

echo json_encode(['success' => true, 'dates' => array_keys($blocked)]);
?>
