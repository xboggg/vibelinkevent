<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getCondolences();
        break;
    case 'POST':
        $action = $_GET['action'] ?? 'create';
        if ($action === 'like') {
            toggleLike();
        } else {
            createCondolence();
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getCondolences() {
    $db = getDB();
    $page = max(1, intval($_GET['page'] ?? 1));
    $perPage = max(1, min(50, intval($_GET['per_page'] ?? 2)));
    $filter = $_GET['filter'] ?? 'all';

    $offset = ($page - 1) * $perPage;

    // Get total count
    $countStmt = $db->query("SELECT COUNT(*) FROM condolences WHERE is_approved = 1");
    $total = $countStmt->fetchColumn();

    // Get messages
    $query = "SELECT id, name, relation, message, likes, created_at FROM condolences WHERE is_approved = 1";

    if ($filter === 'recent') {
        $query .= " ORDER BY created_at DESC LIMIT 3";
        $stmt = $db->query($query);
    } else {
        $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
    }

    $messages = $stmt->fetchAll();

    // Format dates
    foreach ($messages as &$msg) {
        $msg['date'] = date('M j, Y', strtotime($msg['created_at']));
        $msg['likes'] = intval($msg['likes']);
    }

    $totalPages = ceil($total / $perPage);

    echo json_encode([
        'messages' => $messages,
        'total' => intval($total),
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => $totalPages
    ]);
}

function createCondolence() {
    $db = getDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['name']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and message are required']);
        return;
    }

    $name = sanitize($data['name']);
    $relation = sanitize($data['relation'] ?? 'Well-wisher');
    $message = sanitize($data['message']);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // Rate limiting: max 5 messages per IP per hour
    $stmt = $db->prepare("SELECT COUNT(*) FROM condolences WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $stmt->execute([$ip]);
    if ($stmt->fetchColumn() >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many messages. Please try again later.']);
        return;
    }

    $stmt = $db->prepare("INSERT INTO condolences (name, relation, message, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $relation, $message, $ip]);

    echo json_encode([
        'success' => true,
        'id' => $db->lastInsertId(),
        'message' => 'Condolence message added successfully'
    ]);
}

function toggleLike() {
    $db = getDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message ID is required']);
        return;
    }

    $id = intval($data['id']);
    $action = $data['action'] ?? 'like'; // 'like' or 'unlike'

    if ($action === 'unlike') {
        $stmt = $db->prepare("UPDATE condolences SET likes = GREATEST(0, likes - 1) WHERE id = ?");
    } else {
        $stmt = $db->prepare("UPDATE condolences SET likes = likes + 1 WHERE id = ?");
    }
    $stmt->execute([$id]);

    // Return updated count
    $stmt = $db->prepare("SELECT likes FROM condolences WHERE id = ?");
    $stmt->execute([$id]);
    $likes = $stmt->fetchColumn();

    echo json_encode(['success' => true, 'likes' => intval($likes)]);
}
