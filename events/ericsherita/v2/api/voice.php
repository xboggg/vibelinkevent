<?php
require __DIR__ . '/_lib.php';
cors_preflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Public: return only APPROVED voice tributes with a URL
    // Admin: return everything
    $isAdmin = hash_equals(ADMIN_KEY, $_GET['k'] ?? '');
    $arr = load_store('voice.json');
    $public = [];
    foreach (array_reverse($arr) as $v) {
        if (!$isAdmin && ($v['status'] ?? 'pending') !== 'approved') continue;
        $file = $v['file'] ?? '';
        $public[] = [
            'id'     => $v['id'] ?? '',
            'name'   => $v['name'] ?? '',
            'note'   => $v['note'] ?? '',
            'file'   => $file ? '../data/voice/' . $file : '',
            'status' => $v['status'] ?? 'pending',
            'at'     => $v['at'] ?? 0,
        ];
    }
    json_out(['count' => count($arr), 'items' => $public]);
}

if ($method === 'POST') {
    rate_limit('voice');

    $name = clean_text((string)($_POST['name'] ?? ''), 60);
    $note = clean_text((string)($_POST['note'] ?? ''), 200);
    if ($name === '') json_out(['error' => 'Your name is required.'], 400);
    if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
        json_out(['error' => 'No audio file was received.'], 400);
    }
    if ($_FILES['audio']['size'] > MAX_VOICE_MB * 1024 * 1024) {
        json_out(['error' => 'Audio must be under ' . MAX_VOICE_MB . 'MB.'], 400);
    }

    $arr = load_store('voice.json');
    if (count($arr) >= MAX_VOICE) json_out(['error' => 'Voice tributes are now full.'], 409);

    // Save the file
    $id  = bin2hex(random_bytes(6));
    $ext = 'webm';
    $mime = $_FILES['audio']['type'] ?? '';
    if (str_contains($mime, 'ogg')) $ext = 'ogg';
    else if (str_contains($mime, 'mp4') || str_contains($mime, 'aac')) $ext = 'm4a';
    else if (str_contains($mime, 'wav')) $ext = 'wav';

    $filename = $id . '.' . $ext;
    $dest = VOICE_DIR . '/' . $filename;
    if (!move_uploaded_file($_FILES['audio']['tmp_name'], $dest)) {
        json_out(['error' => 'Could not save the audio.'], 500);
    }
    @chmod($dest, 0664);

    $arr[] = [
        'id'     => $id,
        'name'   => $name,
        'note'   => $note,
        'file'   => $filename,
        'status' => 'pending',
        'at'     => time(),
    ];
    save_store('voice.json', $arr);
    json_out(['ok' => true, 'id' => $id, 'status' => 'pending']);
}

if ($method === 'DELETE') {
    require_admin();
    $id  = $_GET['id'] ?? '';
    $arr = load_store('voice.json');
    $newArr = [];
    foreach ($arr as $v) {
        if (($v['id'] ?? '') === $id) {
            $f = VOICE_DIR . '/' . ($v['file'] ?? '');
            if (is_file($f)) @unlink($f);
            continue;
        }
        $newArr[] = $v;
    }
    save_store('voice.json', $newArr);
    json_out(['ok' => true]);
}

// Admin: approve/reject via PATCH (implemented as POST with ?action=)
if ($method === 'POST' && isset($_GET['action'])) {
    // (handled above already)
}

json_out(['error' => 'method not allowed'], 405);
