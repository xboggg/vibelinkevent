<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $arr = load_store('condolences.json');
    // Strip phone from public view — admin only field
    $public = array_map(function($c){
        unset($c['phone']);
        return $c;
    }, $arr);
    json_out([
        'count' => count($public),
        'items' => array_reverse($public),
    ]);
}

if ($method === 'POST') {
    rate_limit('cond');
    $body  = read_json_body();
    $name  = clean_text((string)($body['name']  ?? ''), 60);
    $rel   = clean_text((string)($body['rel']   ?? ''), 60);
    $phone = clean_text((string)($body['phone'] ?? ''), 25);
    $msg   = clean_text((string)($body['msg']   ?? ''), 500);
    if ($name === '' || $msg === '') {
        json_out(['error' => 'Name and message are required.'], 400);
    }
    // Light phone validation: digits, +, spaces, dashes, parentheses only
    if ($phone !== '' && !preg_match('/^[\d\s+()-]+$/', $phone)) {
        $phone = '';
    }

    $arr = load_store('condolences.json');
    if (count($arr) >= MAX_CONDOLENCES) {
        json_out(['error' => 'Book of memories is full.'], 409);
    }
    $arr[] = [
        'id'    => bin2hex(random_bytes(6)),
        'name'  => $name,
        'rel'   => $rel,
        'phone' => $phone,
        'msg'   => $msg,
        'at'    => time(),
    ];
    save_store('condolences.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('condolences.json');
    $arr = array_values(array_filter($arr, fn($c) => ($c['id'] ?? '') !== $id));
    save_store('condolences.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

json_out(['error' => 'method not allowed'], 405);
