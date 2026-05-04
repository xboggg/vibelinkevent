<?php
/**
 * Baby Nortey Naming Ceremony - Wishes / Blessings API
 *
 * GET  /api/wishes.php         - Retrieve all wishes (newest first)
 * POST /api/wishes.php         - Submit a new wish / blessing
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Retrieve all wishes ──────────────────────────────────────────
if ($method === 'GET') {
    try {
        $db   = getDB();
        $stmt = $db->query(
            'SELECT id, name, message, created_at
             FROM wishes
             ORDER BY created_at DESC'
        );
        $wishes = $stmt->fetchAll();

        // Format dates
        foreach ($wishes as &$wish) {
            $wish['created_at'] = date('d M Y', strtotime($wish['created_at']));
        }
        unset($wish);

        jsonResponse([
            'success' => true,
            'count'   => count($wishes),
            'data'    => $wishes
        ]);

    } catch (PDOException $e) {
        error_log('Wishes GET error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Failed to retrieve wishes.'], 500);
    }
}

// ── POST: Create a new wish ───────────────────────────────────────────
if ($method === 'POST') {
    // Parse input (JSON body or form data)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }

    $name    = isset($input['name'])    ? sanitize($input['name'])    : '';
    $message = isset($input['message']) ? sanitize($input['message']) : '';

    // ── Validation ────────────────────────────────────────────────────
    if (empty($name) || empty($message)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Both "name" and "message" are required.'
        ], 400);
    }

    if (mb_strlen($name) > 100) {
        jsonResponse([
            'success' => false,
            'error'   => 'Name must be 100 characters or fewer.'
        ], 400);
    }

    if (mb_strlen($message) > 1000) {
        jsonResponse([
            'success' => false,
            'error'   => 'Message must be 1000 characters or fewer.'
        ], 400);
    }

    // ── Rate limit: 10 wishes per hour per IP ─────────────────────────
    try {
        $db = getDB();
        $ip = getClientIP();

        $stmt = $db->prepare(
            'SELECT COUNT(*) AS cnt
             FROM wishes
             WHERE ip_address = :ip
               AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
        );
        $stmt->execute([':ip' => $ip]);
        $row = $stmt->fetch();

        if ((int)$row['cnt'] >= 10) {
            jsonResponse([
                'success' => false,
                'error'   => 'You have reached the limit of 10 wishes per hour. Please try again later.'
            ], 429);
        }

        // ── Insert the wish ───────────────────────────────────────────
        $stmt = $db->prepare(
            'INSERT INTO wishes (name, message, ip_address, created_at)
             VALUES (:name, :message, :ip, NOW())'
        );
        $stmt->execute([
            ':name'    => $name,
            ':message' => $message,
            ':ip'      => $ip
        ]);

        $newId = $db->lastInsertId();

        jsonResponse([
            'success' => true,
            'message' => 'Your blessing has been added! Thank you.',
            'data'    => [
                'id'         => (int)$newId,
                'name'       => $name,
                'message'    => $message,
                'created_at' => date('d M Y')
            ]
        ], 201);

    } catch (PDOException $e) {
        error_log('Wishes POST error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Failed to save your wish. Please try again.'], 500);
    }
}

// ── Unsupported method ────────────────────────────────────────────────
jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
