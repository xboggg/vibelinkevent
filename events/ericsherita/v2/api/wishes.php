<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $arr = load_store('wishes.json');
    $total = count($arr);
    $newest = array_reverse($arr);
    $all = ($_GET['all'] ?? '') === '1';
    $items = $all ? $newest : array_slice($newest, 0, 50);
    // Strip internal fields for public
    $public = array_map(fn($w) => [
        'id'   => $w['id']   ?? '',
        'name' => $w['name'] ?? '',
        'msg'  => $w['msg']  ?? '',
        'at'   => $w['at']   ?? 0,
    ], $items);
    json_out([
        'count'    => $total,
        'returned' => count($public),
        'items'    => $public,
        'lastAt'   => $total ? ($arr[$total - 1]['at'] ?? 0) : 0,
    ]);
}

if ($method === 'POST') {
    rate_limit('wishes');
    $body = read_json_body();
    $name = clean_text((string)($body['name'] ?? ''), 60);
    $msg  = clean_text((string)($body['msg']  ?? ''), 300);
    if ($name === '' || $msg === '') {
        json_out(['error' => 'Your name and message are required.'], 400);
    }

    $arr = load_store('wishes.json');
    if (count($arr) >= MAX_WISHES) {
        json_out(['error' => 'The wishes wall is now full.'], 409);
    }
    $arr[] = [
        'id'   => bin2hex(random_bytes(6)),
        'name' => $name,
        'msg'  => $msg,
        'at'   => time(),
    ];
    save_store('wishes.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('wishes.json');
    $arr = array_values(array_filter($arr, fn($c) => ($c['id'] ?? '') !== $id));
    save_store('wishes.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

json_out(['error' => 'method not allowed'], 405);
