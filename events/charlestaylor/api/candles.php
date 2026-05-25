<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $arr = load_store('candles.json');
    json_out([
        'count' => count($arr),
        'items' => array_slice(array_reverse($arr), 0, 200),
    ]);
}

if ($method === 'POST') {
    rate_limit('candle');
    $body   = read_json_body();
    $name   = clean_text((string)($body['name']   ?? ''), 40);
    $prayer = clean_text((string)($body['prayer'] ?? ''), 120);
    if ($name === '') json_out(['error' => 'Name is required.'], 400);

    $arr = load_store('candles.json');
    if (count($arr) >= MAX_CANDLES) {
        json_out(['error' => 'Altar is full. Thank you to everyone who lit a candle.'], 409);
    }
    $arr[] = [
        'id'     => bin2hex(random_bytes(6)),
        'name'   => $name,
        'prayer' => $prayer,
        'at'     => time(),
    ];
    save_store('candles.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('candles.json');
    $arr = array_values(array_filter($arr, fn($c) => ($c['id'] ?? '') !== $id));
    save_store('candles.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

json_out(['error' => 'method not allowed'], 405);
