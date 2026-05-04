<?php
// Database setup script - run once on server
// Usage: php setup.php

$host = 'localhost';
$rootUser = 'root';
$rootPass = ''; // Set MySQL root password here when running

try {
    $pdo = new PDO("mysql:host=$host", $rootUser, $rootPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS attapanyin_memorial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created.\n";

    // Create user
    $pdo->exec("CREATE USER IF NOT EXISTS 'attapanyin_user'@'localhost' IDENTIFIED BY 'M3m0r1al_2026!Krofah'");
    $pdo->exec("GRANT ALL PRIVILEGES ON attapanyin_memorial.* TO 'attapanyin_user'@'localhost'");
    $pdo->exec("FLUSH PRIVILEGES");
    echo "User created.\n";

    // Use database
    $pdo->exec("USE attapanyin_memorial");

    // Create condolences table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS condolences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            relation VARCHAR(255) DEFAULT 'Well-wisher',
            message TEXT NOT NULL,
            likes INT DEFAULT 0,
            is_approved TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) DEFAULT NULL
        ) ENGINE=InnoDB
    ");
    echo "Condolences table created.\n";

    // Create RSVP table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rsvps (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            guests INT DEFAULT 1,
            event_type VARCHAR(100) DEFAULT 'one-week',
            requirements TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) DEFAULT NULL
        ) ENGINE=InnoDB
    ");
    echo "RSVP table created.\n";

    // Create admin sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        ) ENGINE=InnoDB
    ");
    echo "Admin sessions table created.\n";

    // Insert default condolence messages
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM condolences");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $defaults = [
            ['Kwame Asante', 'Family Friend', 'Atta Panin was a true pillar of our community. His wisdom and kindness touched many lives. May his soul rest in perfect peace.', 12, '2026-02-24 10:00:00'],
            ['Akosua Mensah', 'Neighbor', 'We will forever cherish the memories of Atta Panin. He was always there to offer guidance and support. The Bretuo family has lost a great leader.', 8, '2026-02-23 14:00:00'],
            ['Kofi Adjei', 'Church Member', 'A man of great faith and integrity. His legacy will live on through the many lives he touched. Condolences to the entire family.', 15, '2026-02-22 09:00:00'],
            ['Abena Osei', 'Grandchild', 'Grandpa, your stories and laughter will forever echo in our hearts. You taught us the meaning of family, honour, and perseverance. Rest well, Atta Panin.', 23, '2026-02-21 16:00:00'],
            ['Dr. Emmanuel Boateng', 'Colleague', 'Working alongside Atta Panin for over two decades was a privilege. His dedication to community service and his unwavering integrity inspired us all. Ghana has lost a great leader.', 18, '2026-02-20 11:00:00'],
        ];

        $stmt = $pdo->prepare("INSERT INTO condolences (name, relation, message, likes, created_at) VALUES (?, ?, ?, ?, ?)");
        foreach ($defaults as $msg) {
            $stmt->execute($msg);
        }
        echo "Default condolence messages inserted.\n";
    }

    echo "\nSetup complete! You can now delete this file.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
