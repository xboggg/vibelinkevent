<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Public GET returns only counts + names (no phones/messages) for privacy
    $arr = load_store('rsvp.json');
    $totalGuests = 0;
    foreach ($arr as $r) $totalGuests += (int)($r['guests'] ?? 1);
    json_out([
        'count'  => count($arr),
        'guests' => $totalGuests,
    ]);
}

if ($method === 'POST') {
    rate_limit('rsvp');
    $body    = read_json_body();
    $name    = clean_text((string)($body['name']    ?? ''), 60);
    $phone   = clean_phone((string)($body['phone']  ?? ''));
    $guests  = max(1, min(20, (int)($body['guests'] ?? 1)));
    $note    = clean_text((string)($body['note']    ?? ''), 300);
    $side    = clean_text((string)($body['side']    ?? ''), 20);   // "bride" / "groom" / ""
    if ($name === '') json_out(['error' => 'Your full name is required.'], 400);

    $arr = load_store('rsvp.json');
    if (count($arr) >= MAX_RSVP) {
        json_out(['error' => 'The guest list is now closed. Thank you for your interest.'], 409);
    }
    $arr[] = [
        'id'     => bin2hex(random_bytes(6)),
        'name'   => $name,
        'phone'  => $phone,
        'guests' => $guests,
        'side'   => $side,
        'note'   => $note,
        'at'     => time(),
    ];
    save_store('rsvp.json', $arr);
    $totalGuests = 0;
    foreach ($arr as $r) $totalGuests += (int)($r['guests'] ?? 1);
    json_out(['ok' => true, 'count' => count($arr), 'guests' => $totalGuests]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('rsvp.json');
    $arr = array_values(array_filter($arr, fn($c) => ($c['id'] ?? '') !== $id));
    save_store('rsvp.json', $arr);
    $totalGuests = 0;
    foreach ($arr as $r) $totalGuests += (int)($r['guests'] ?? 1);
    json_out(['ok' => true, 'count' => count($arr), 'guests' => $totalGuests]);
}

json_out(['error' => 'method not allowed'], 405);
