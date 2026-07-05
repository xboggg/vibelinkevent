<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// GET ?q=name → search the guest list, return {found, name, seats, side, note}
if ($method === 'GET') {
    $q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
    if ($q === '' || mb_strlen($q) < 2) {
        json_out(['found' => false, 'msg' => 'Please type at least 2 characters.']);
    }
    $arr = load_store('guests.json');
    if (empty($arr)) {
        // No guest list uploaded yet — every guest is "open" (allow 2 seats)
        json_out([
            'found' => true,
            'name' => ucwords($q),
            'seats' => 2,
            'side' => '',
            'note' => 'Guest list not yet uploaded — default seat allowance applied.',
            'default' => true,
        ]);
    }
    // Fuzzy contains match
    foreach ($arr as $g) {
        $n = mb_strtolower((string)($g['name'] ?? ''));
        if ($n === '') continue;
        if (mb_strpos($n, $q) !== false || mb_strpos($q, $n) !== false) {
            json_out([
                'found' => true,
                'name'  => $g['name'] ?? '',
                'seats' => (int)($g['seats'] ?? 2),
                'side'  => $g['side'] ?? '',
                'note'  => $g['note'] ?? '',
                'default' => false,
            ]);
        }
    }
    json_out(['found' => false, 'msg' => 'Name not found. Please contact the couple if you were invited.']);
}

// POST: admin uploads guest list
if ($method === 'POST') {
    require_admin();
    $body = read_json_body();
    $list = $body['guests'] ?? [];
    if (!is_array($list)) json_out(['error' => 'guests must be an array'], 400);
    $clean = [];
    foreach ($list as $g) {
        $name = clean_text((string)($g['name'] ?? ''), 80);
        if ($name === '') continue;
        $clean[] = [
            'name'  => $name,
            'seats' => max(1, min(10, (int)($g['seats'] ?? 2))),
            'side'  => clean_text((string)($g['side'] ?? ''), 20),
            'note'  => clean_text((string)($g['note'] ?? ''), 200),
        ];
    }
    save_store('guests.json', $clean);
    json_out(['ok' => true, 'count' => count($clean)]);
}

json_out(['error' => 'method not allowed'], 405);
