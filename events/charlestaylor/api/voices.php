<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $arr = load_store('voices.json');
    foreach ($arr as &$v) {
        $v['url'] = 'data/voices/' . $v['file'];
        unset($v['file']);
    }
    json_out([
        'count' => count($arr),
        'items' => array_reverse($arr),
    ]);
}

if ($method === 'POST') {
    rate_limit('voice');
    if (empty($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
        json_out(['error' => 'No audio uploaded.'], 400);
    }
    if ($_FILES['audio']['size'] > MAX_VOICE_BYTES) {
        json_out(['error' => 'Recording too large. Maximum 2MB.'], 413);
    }
    $name = clean_text((string)($_POST['name'] ?? 'A Mourner'), 40);
    if ($name === '') $name = 'A Mourner';

    $arr = load_store('voices.json');
    if (count($arr) >= MAX_VOICES) {
        json_out(['error' => 'Voice wall is full. Thank you for your tribute.'], 409);
    }

    // Sniff content type — accept webm, ogg, mp4/m4a
    $ftype = mime_content_type($_FILES['audio']['tmp_name']) ?: '';
    $allowed = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'video/webm'];
    $ext = 'webm';
    foreach ($allowed as $a) {
        if (stripos($ftype, $a) !== false) {
            if (str_contains($a, 'ogg'))  $ext = 'ogg';
            if (str_contains($a, 'mp4'))  $ext = 'm4a';
            if (str_contains($a, 'mpeg')) $ext = 'mp3';
            if (str_contains($a, 'webm')) $ext = 'webm';
            break;
        }
    }
    if ($ftype && !preg_match('#(audio|video)/#', $ftype)) {
        json_out(['error' => 'Invalid audio file.'], 400);
    }

    $id   = bin2hex(random_bytes(6));
    $file = $id . '.' . $ext;
    if (!move_uploaded_file($_FILES['audio']['tmp_name'], VOICES_DIR . '/' . $file)) {
        json_out(['error' => 'Could not save recording.'], 500);
    }
    @chmod(VOICES_DIR . '/' . $file, 0644);

    $arr[] = ['id' => $id, 'name' => $name, 'file' => $file, 'at' => time()];
    save_store('voices.json', $arr);
    json_out(['ok' => true, 'count' => count($arr)]);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('voices.json');
    $kept = [];
    foreach ($arr as $v) {
        if (($v['id'] ?? '') === $id) {
            @unlink(VOICES_DIR . '/' . ($v['file'] ?? ''));
        } else {
            $kept[] = $v;
        }
    }
    save_store('voices.json', $kept);
    json_out(['ok' => true, 'count' => count($kept)]);
}

json_out(['error' => 'method not allowed'], 405);
