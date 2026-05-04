<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getRSVPStats();
        break;
    case 'POST':
        createRSVP();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getRSVPStats() {
    $db = getDB();

    $stmt = $db->query("SELECT COUNT(*) as total_rsvps, COALESCE(SUM(guests), 0) as total_guests FROM rsvps");
    $stats = $stmt->fetch();

    echo json_encode([
        'confirmed' => intval($stats['total_rsvps']),
        'total_guests' => intval($stats['total_guests'])
    ]);
}

function createRSVP() {
    $db = getDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['name']) || empty($data['phone'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and phone are required']);
        return;
    }

    $name = sanitize($data['name']);
    $phone = sanitize($data['phone']);
    $guests = max(1, intval($data['guests'] ?? 1));
    $eventType = sanitize($data['event'] ?? 'one-week');
    $requirements = sanitize($data['requirements'] ?? '');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // Check for duplicate phone
    $stmt = $db->prepare("SELECT id FROM rsvps WHERE phone = ?");
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        // Update existing RSVP
        $stmt = $db->prepare("UPDATE rsvps SET name = ?, guests = ?, event_type = ?, requirements = ? WHERE phone = ?");
        $stmt->execute([$name, $guests, $eventType, $requirements, $phone]);
        echo json_encode(['success' => true, 'message' => 'RSVP updated successfully']);
        return;
    }

    $stmt = $db->prepare("INSERT INTO rsvps (name, phone, guests, event_type, requirements, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $phone, $guests, $eventType, $requirements, $ip]);

    echo json_encode([
        'success' => true,
        'id' => $db->lastInsertId(),
        'message' => 'RSVP confirmed successfully'
    ]);
}
