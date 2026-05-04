<?php
/**
 * Baby Nortey Naming Ceremony - Database Setup Script
 *
 * Run this script ONCE to:
 *   1. Create the nortey_naming database
 *   2. Create the nortey_user MySQL user
 *   3. Create all required tables
 *   4. Seed default wishes
 *
 * Uses root user with empty password for initial setup.
 * After running, this file should be deleted or access-restricted.
 */

header('Content-Type: text/html; charset=UTF-8');

$rootHost = 'localhost';
$rootUser = 'root';
$rootPass = '';

$dbName   = 'nortey_naming';
$dbUser   = 'nortey_user';
$dbPass   = 'N0rt3y_Baby2026!';

$messages = [];
$errors   = [];

try {
    // ── Connect as root ───────────────────────────────────────────────
    $pdo = new PDO(
        "mysql:host={$rootHost};charset=utf8mb4",
        $rootUser,
        $rootPass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    $messages[] = 'Connected to MySQL as root.';

    // ── 1. Create database ────────────────────────────────────────────
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $messages[] = "Database '{$dbName}' created (or already exists).";

    // ── 2. Create user and grant privileges ───────────────────────────
    // Drop user if exists to avoid conflicts, then recreate
    $pdo->exec("DROP USER IF EXISTS '{$dbUser}'@'localhost'");
    $pdo->exec("CREATE USER '{$dbUser}'@'localhost' IDENTIFIED BY '{$dbPass}'");
    $pdo->exec("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO '{$dbUser}'@'localhost'");
    $pdo->exec("FLUSH PRIVILEGES");
    $messages[] = "User '{$dbUser}' created with full privileges on '{$dbName}'.";

    // ── Switch to the new database ────────────────────────────────────
    $pdo->exec("USE `{$dbName}`");

    // ── 3. Create tables ──────────────────────────────────────────────

    // -- wishes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `wishes` (
            `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name`       VARCHAR(100)  NOT NULL,
            `message`    TEXT          NOT NULL,
            `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `ip_address` VARCHAR(45)   DEFAULT NULL,
            INDEX `idx_wishes_created` (`created_at`),
            INDEX `idx_wishes_ip` (`ip_address`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $messages[] = "Table 'wishes' created.";

    // -- rsvps table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `rsvps` (
            `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name`       VARCHAR(100)  NOT NULL,
            `phone`      VARCHAR(20)   NOT NULL,
            `guests`     TINYINT UNSIGNED NOT NULL DEFAULT 1,
            `attending`  ENUM('yes','no','maybe') NOT NULL DEFAULT 'yes',
            `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `ip_address` VARCHAR(45)   DEFAULT NULL,
            UNIQUE INDEX `idx_rsvps_phone` (`phone`),
            INDEX `idx_rsvps_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $messages[] = "Table 'rsvps' created.";

    // -- admin_sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_sessions` (
            `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `token`      VARCHAR(128)  NOT NULL,
            `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `expires_at` DATETIME      NOT NULL,
            UNIQUE INDEX `idx_sessions_token` (`token`),
            INDEX `idx_sessions_expires` (`expires_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $messages[] = "Table 'admin_sessions' created.";

    // ── 4. Seed default wishes ────────────────────────────────────────
    $checkStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM wishes");
    $count = (int)$checkStmt->fetch()['cnt'];

    if ($count === 0) {
        $defaultWishes = [
            [
                'name'    => 'Aunty Ama Mensah',
                'message' => 'Welcome to the world, little one! May your life be filled with endless joy, laughter, and the warm embrace of family. God bless you abundantly, Baby Nortey!',
            ],
            [
                'name'    => 'Uncle Kwame Asante',
                'message' => 'What a beautiful blessing you are to the Nortey family! May you grow in wisdom, strength, and grace. The ancestors smile upon your arrival. Akwaaba!',
            ],
            [
                'name'    => 'Grandma Efua Nortey',
                'message' => 'My precious grandchild, you are the answer to so many prayers. May the Lord guide your every step, protect you always, and fill your days with His love. We have waited so long for you!',
            ],
            [
                'name'    => 'Sister Abena Osei',
                'message' => 'Congratulations Michael and Sarah! Your little princess is absolutely gorgeous. May she bring even more love and happiness into your home. Cannot wait to spoil her!',
            ],
            [
                'name'    => 'Pastor Daniel Tetteh',
                'message' => 'The Lord has blessed this family with a wonderful gift. May Baby Nortey grow up knowing the love of God and the strength of community. Psalms 127:3 - Children are a heritage from the Lord.',
            ],
        ];

        $stmt = $pdo->prepare(
            "INSERT INTO wishes (name, message, ip_address, created_at)
             VALUES (:name, :message, '127.0.0.1', NOW() - INTERVAL :offset MINUTE)"
        );

        foreach ($defaultWishes as $i => $wish) {
            $stmt->execute([
                ':name'    => $wish['name'],
                ':message' => $wish['message'],
                ':offset'  => ($i * 15)  // stagger times by 15 min
            ]);
        }

        $messages[] = '5 default wishes inserted.';
    } else {
        $messages[] = "Wishes table already has {$count} entries. Skipping seed.";
    }

    $messages[] = '';
    $messages[] = 'Setup completed successfully!';

} catch (PDOException $e) {
    $errors[] = 'Setup Error: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baby Nortey - Database Setup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #FFF9F2 0%, #FDEBD3 50%, #F8D7DA 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .setup-card {
            background: white;
            border-radius: 16px;
            padding: 2.5rem;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(139, 111, 94, 0.15);
        }
        h1 {
            font-size: 1.6rem;
            color: #8B6F5E;
            margin-bottom: 0.5rem;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: #B8A090;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
        }
        .msg {
            padding: 0.5rem 0.75rem;
            margin: 0.3rem 0;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        .msg.success {
            background: #D4E7CF;
            color: #4a7a3f;
            border-left: 4px solid #A8C5A0;
        }
        .msg.error {
            background: #F8D7DA;
            color: #a94442;
            border-left: 4px solid #E88FA0;
        }
        .msg.empty {
            background: transparent;
            border: none;
            height: 0.5rem;
        }
        .warning {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #FFF3CD;
            border-radius: 8px;
            border-left: 4px solid #C9A227;
            color: #856404;
            font-size: 0.85rem;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: #E8956A;
            text-decoration: none;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="setup-card">
        <h1>Baby Nortey Database Setup</h1>
        <p class="subtitle">Naming Ceremony Backend Installation</p>

        <?php foreach ($messages as $msg): ?>
            <?php if (empty($msg)): ?>
                <div class="msg empty"></div>
            <?php else: ?>
                <div class="msg success"><?= htmlspecialchars($msg) ?></div>
            <?php endif; ?>
        <?php endforeach; ?>

        <?php foreach ($errors as $err): ?>
            <div class="msg error"><?= htmlspecialchars($err) ?></div>
        <?php endforeach; ?>

        <?php if (empty($errors)): ?>
            <div class="warning">
                <strong>Security Notice:</strong> Delete this file (<code>setup.php</code>) immediately after setup
                is complete, or ensure the <code>.htaccess</code> rules are in place to block direct access.
            </div>
        <?php endif; ?>

        <a class="back-link" href="../index.html">Back to Ceremony Page</a>
    </div>
</body>
</html>
