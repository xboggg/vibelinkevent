<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $arr = load_store('rsvp.json');
    $totalGuests = 0;
    $accept = 0;
    $decline = 0;
    foreach ($arr as $r) {
        if (($r['attending'] ?? 'yes') === 'yes') {
            $accept++;
            $totalGuests += (int)($r['guests'] ?? 1);
        } else {
            $decline++;
        }
    }
    json_out([
        'count'    => count($arr),
        'accept'   => $accept,
        'decline'  => $decline,
        'guests'   => $totalGuests,
    ]);
}

if ($method === 'POST') {
    rate_limit('rsvp');
    $body      = read_json_body();
    $name      = clean_text((string)($body['name']      ?? ''), 60);
    $email     = clean_email((string)($body['email']    ?? ''));
    $phone     = clean_phone((string)($body['phone']    ?? ''));
    $attending = ($body['attending'] ?? '') === 'no' ? 'no' : 'yes';
    $guests    = max(0, min(10, (int)($body['guests']  ?? 1)));
    $side      = clean_text((string)($body['side']      ?? ''), 20);
    $ceremony  = ($body['ceremony']  ?? '') === 'no' ? 'no' : 'yes';
    $reception = ($body['reception'] ?? '') === 'no' ? 'no' : 'yes';
    $note      = clean_text((string)($body['note']      ?? ''), 300);

    if ($name === '') json_out(['error' => 'Your full name is required.'], 400);
    if ($attending === 'yes' && $guests < 1) $guests = 1;
    if ($attending === 'no') $guests = 0;

    $arr = load_store('rsvp.json');
    if (count($arr) >= MAX_RSVP) {
        json_out(['error' => 'The guest list is now closed. Thank you for your interest.'], 409);
    }
    $arr[] = [
        'id'        => bin2hex(random_bytes(6)),
        'name'      => $name,
        'email'     => $email,
        'phone'     => $phone,
        'attending' => $attending,
        'guests'    => $guests,
        'side'      => $side,
        'ceremony'  => $ceremony,
        'reception' => $reception,
        'note'      => $note,
        'at'        => time(),
    ];
    save_store('rsvp.json', $arr);

    $totalGuests = 0; $accept = 0; $decline = 0;
    foreach ($arr as $r) {
        if (($r['attending'] ?? 'yes') === 'yes') { $accept++; $totalGuests += (int)($r['guests'] ?? 1); }
        else $decline++;
    }
    json_out(['ok' => true, 'count' => count($arr), 'accept' => $accept, 'decline' => $decline, 'guests' => $totalGuests]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('rsvp.json');
    $arr = array_values(array_filter($arr, fn($c) => ($c['id'] ?? '') !== $id));
    save_store('rsvp.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

json_out(['error' => 'method not allowed'], 405);
