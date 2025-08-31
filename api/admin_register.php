<?php
// add_admin.php

// Configuration for database connection
$host = 'localhost';
$db   = 'appartment';
$user = 'root';
$pass = '';
$dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";

// Hardcoded values for the new admin
$username = 'markosego';  // Specify the admin username here
$password = 'nopass';  // Specify the admin password here

// Hash the password using PHP's password_hash function
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    // Establish the PDO connection to the database
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Prepare SQL query to insert a new admin
    $stmt = $pdo->prepare("INSERT INTO admin (Username, Password) VALUES (:username, :password)");
    $stmt->execute([
        ':username' => $username,
        ':password' => $hashedPassword
    ]);

    echo "Admin user '$username' added successfully!";
} catch (Exception $e) {
    echo "Failed to add admin: " . $e->getMessage();
}
?>
