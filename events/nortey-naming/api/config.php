<?php
/**
 * Baby Nortey Naming Ceremony - Database Configuration
 *
 * Database connection, CORS headers, sanitization helpers.
 */

// ── Database Credentials ──────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'nortey_naming');
define('DB_USER', 'nortey_user');
define('DB_PASS', 'N0rt3y_Baby2026!');

// ── Admin Credentials ─────────────────────────────────────────────────
define('ADMIN_USER', 'admin');
define('ADMIN_PASS_HASH', password_hash('NorteyBaby2026!', PASSWORD_BCRYPT));

// ── CORS Headers ──────────────────────────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── PDO Connection ────────────────────────────────────────────────────
/**
 * Returns a PDO connection to the nortey_naming database.
 *
 * @return PDO
 */
function getDB(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'Database connection failed. Please try again later.'
            ]);
            error_log('DB Connection Error: ' . $e->getMessage());
            exit();
        }
    }

    return $pdo;
}

// ── Helpers ───────────────────────────────────────────────────────────
/**
 * Sanitize user input - trim, strip tags, encode special chars.
 *
 * @param  string $input
 * @return string
 */
function sanitize(string $input): string
{
    $input = trim($input);
    $input = strip_tags($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

/**
 * Return a JSON response and exit.
 *
 * @param array $data
 * @param int   $statusCode
 */
function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Get client IP address (supports proxies).
 *
 * @return string
 */
function getClientIP(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return $_SERVER['HTTP_X_REAL_IP'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
