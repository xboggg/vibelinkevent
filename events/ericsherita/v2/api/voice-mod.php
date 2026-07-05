<?php
// Admin-only endpoint: approve / reject / delete a voice tribute
require __DIR__ . '/_lib.php';
cors_preflight();

require_admin();
$id     = $_GET['id']     ?? '';
$action = $_GET['action'] ?? '';
if ($id === '' || !in_array($action, ['approve','reject','delete'], true)) {
    json_out(['error' => 'bad request'], 400);
}
$arr = load_store('voice.json');
$out = [];
$done = false;
foreach ($arr as $v) {
    if (($v['id'] ?? '') === $id) {
        if ($action === 'delete') {
            $f = VOICE_DIR . '/' . ($v['file'] ?? '');
            if (is_file($f)) @unlink($f);
            $done = true;
            continue;
        }
        $v['status'] = ($action === 'approve') ? 'approved' : 'rejected';
        $done = true;
    }
    $out[] = $v;
}
save_store('voice.json', $out);
json_out(['ok' => $done, 'id' => $id, 'action' => $action]);
