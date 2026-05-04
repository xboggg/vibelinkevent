<?php
/**
 * Baby Nortey Naming Ceremony - RSVP API
 *
 * GET  /api/rsvp.php  - Return RSVP stats (total confirmed, total guests)
 * POST /api/rsvp.php  - Create or update an RSVP (dedup by phone number)
 */

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: RSVP Statistics ──────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $db = getDB();

        $stmt = $db->query(
            'SELECT COUNT(*) AS total_confirmed,
                    COALESCE(SUM(guests), 0) AS total_guests
             FROM rsvps'
        );
        $stats = $stmt->fetch();

        jsonResponse([
            'success' => true,
            'data'    => [
                'total_confirmed' => (int)$stats['total_confirmed'],
                'total_guests'    => (int)$stats['total_guests']
            ]
        ]);

    } catch (PDOException $e) {
        error_log('RSVP GET error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Failed to retrieve RSVP stats.'], 500);
    }
}

// ── POST: Create / Update RSVP ───────────────────────────────────────
if ($method === 'POST') {
    // Parse input (JSON body or form data)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }

    $name      = isset($input['name'])      ? sanitize($input['name'])      : '';
    $phone     = isset($input['phone'])     ? sanitize($input['phone'])     : '';
    $guests    = isset($input['guests'])    ? (int)$input['guests']         : 1;
    $attending = isset($input['attending']) ? sanitize($input['attending']) : 'yes';

    // ── Validation ────────────────────────────────────────────────────
    if (empty($name)) {
        jsonResponse([
            'success' => false,
            'error'   => '"name" is required.'
        ], 400);
    }

    if (empty($phone)) {
        jsonResponse([
            'success' => false,
            'error'   => '"phone" is required.'
        ], 400);
    }

    if (mb_strlen($name) > 100) {
        jsonResponse([
            'success' => false,
            'error'   => 'Name must be 100 characters or fewer.'
        ], 400);
    }

    if (mb_strlen($phone) > 20) {
        jsonResponse([
            'success' => false,
            'error'   => 'Phone number must be 20 characters or fewer.'
        ], 400);
    }

    // Guests must be between 1 and 20
    if ($guests < 1)  $guests = 1;
    if ($guests > 20) $guests = 20;

    // Validate attending value
    if (!in_array($attending, ['yes', 'no', 'maybe'])) {
        $attending = 'yes';
    }

    try {
        $db = getDB();
        $ip = getClientIP();

        // ── Check for existing RSVP by phone (deduplication) ──────────
        $stmt = $db->prepare('SELECT id FROM rsvps WHERE phone = :phone LIMIT 1');
        $stmt->execute([':phone' => $phone]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update existing RSVP
            $stmt = $db->prepare(
                'UPDATE rsvps
                 SET name       = :name,
                     guests     = :guests,
                     attending    = :attending,
                     ip_address = :ip
                 WHERE phone = :phone'
            );
            $stmt->execute([
                ':name'    => $name,
                ':guests'  => $guests,
                ':attending' => $attending,
                ':ip'      => $ip,
                ':phone'   => $phone
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'Your RSVP has been updated successfully!',
                'data'    => [
                    'id'      => (int)$existing['id'],
                    'name'    => $name,
                    'phone'   => $phone,
                    'guests'  => $guests,
                    'attending' => $attending,
                    'updated' => true
                ]
            ]);

        } else {
            // Create new RSVP
            $stmt = $db->prepare(
                'INSERT INTO rsvps (name, phone, guests, attending, ip_address, created_at)
                 VALUES (:name, :phone, :guests, :attending, :ip, NOW())'
            );
            $stmt->execute([
                ':name'    => $name,
                ':phone'   => $phone,
                ':guests'  => $guests,
                ':attending' => $attending,
                ':ip'      => $ip
            ]);

            $newId = $db->lastInsertId();

            jsonResponse([
                'success' => true,
                'message' => 'Thank you for your RSVP! We look forward to celebrating with you.',
                'data'    => [
                    'id'      => (int)$newId,
                    'name'    => $name,
                    'phone'   => $phone,
                    'guests'  => $guests,
                    'attending' => $attending,
                    'updated' => false
                ]
            ], 201);
        }

    } catch (PDOException $e) {
        error_log('RSVP POST error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => 'Failed to save your RSVP. Please try again.'], 500);
    }
}

// ── Unsupported method ────────────────────────────────────────────────
jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
