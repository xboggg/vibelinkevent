<?php
require __DIR__ . '/api/_lib.php';

$k = $_GET['k'] ?? '';
if (!hash_equals(ADMIN_KEY, $k)) {
    http_response_code(403);
    echo '<!doctype html><meta charset="utf-8"><title>403</title><body style="background:#0a0608;color:#c9a24a;font-family:serif;text-align:center;padding-top:4rem"><h1>Access restricted</h1><p style="opacity:.7">This page is for family only.</p></body>';
    exit;
}

// Export to CSV
if (($_GET['export'] ?? '') !== '') {
    $type = $_GET['export'];
    $file = match($type) {
        'candles'     => 'candles.json',
        'condolences' => 'condolences.json',
        default       => null,
    };
    if (!$file) { http_response_code(400); exit('bad export'); }
    $arr = load_store($file);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '_charlestaylor.csv"');
    $out = fopen('php://output', 'w');
    if ($type === 'candles') {
        fputcsv($out, ['Name', 'Prayer', 'Date']);
        foreach ($arr as $c) {
            fputcsv($out, [$c['name'] ?? '', $c['prayer'] ?? '', date('Y-m-d H:i', $c['at'] ?? 0)]);
        }
    } else {
        fputcsv($out, ['Name', 'Relationship', 'Phone', 'Message', 'Date']);
        foreach ($arr as $c) {
            fputcsv($out, [
                $c['name']  ?? '',
                $c['rel']   ?? '',
                $c['phone'] ?? '',
                $c['msg']   ?? '',
                date('Y-m-d H:i', $c['at'] ?? 0),
            ]);
        }
    }
    fclose($out);
    exit;
}

// Download all voice tributes as zip
if (($_GET['zip'] ?? '') === 'voices') {
    $arr = load_store('voices.json');
    $tmp = tempnam(sys_get_temp_dir(), 'ctv') . '.zip';
    $zip = new ZipArchive();
    if ($zip->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
        foreach ($arr as $v) {
            $path = VOICES_DIR . '/' . ($v['file'] ?? '');
            if (file_exists($path)) {
                $safeName = preg_replace('/[^A-Za-z0-9_-]/', '_', $v['name'] ?? 'mourner');
                $ext = pathinfo($v['file'], PATHINFO_EXTENSION);
                $zip->addFile($path, $safeName . '_' . substr($v['id'] ?? '', 0, 6) . '.' . $ext);
            }
        }
        $zip->close();
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="charlestaylor_voice_tributes.zip"');
        header('Content-Length: ' . filesize($tmp));
        readfile($tmp);
        @unlink($tmp);
    }
    exit;
}

$candles     = load_store('candles.json');
$voices      = load_store('voices.json');
$condolences = load_store('condolences.json');
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Family Admin — Charles N. A. Taylor</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0608;color:#f6efdf;line-height:1.5;padding:1.5rem;min-height:100vh}
  h1{font-family:'Cormorant Garamond',serif;color:#e8c878;font-weight:500;letter-spacing:.1em;margin-bottom:.3rem}
  .sub{color:#999;font-size:.85rem;margin-bottom:1.5rem}
  .tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem;border-bottom:1px solid #2a1418}
  .tab-btn{background:none;border:none;color:#999;padding:.7rem 1rem;font-size:.9rem;cursor:pointer;border-bottom:2px solid transparent;transition:.2s}
  .tab-btn.active{color:#e8c878;border-color:#c9a24a}
  .tab-btn:hover{color:#f6efdf}
  .tab-btn .count{background:#7B1E1E;color:#e8c878;border-radius:10px;padding:.1rem .5rem;font-size:.7rem;margin-left:.4rem}
  .panel{display:none}
  .panel.active{display:block}
  .actions{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem}
  .btn{background:#7B1E1E;color:#e8c878;border:1px solid #c9a24a;padding:.6rem 1rem;font-size:.78rem;letter-spacing:.1em;text-decoration:none;cursor:pointer;text-transform:uppercase;display:inline-flex;align-items:center;gap:.4rem;transition:.2s}
  .btn:hover{background:#c9a24a;color:#14090c}
  .btn.danger{background:#4a0f12}
  .btn.ghost{background:transparent}
  table{width:100%;border-collapse:collapse;background:#14090c;border:1px solid #2a1418}
  th,td{padding:.7rem .8rem;text-align:left;border-bottom:1px solid #2a1418;font-size:.85rem;vertical-align:top}
  th{background:#1a0d10;color:#c9a24a;font-weight:500;letter-spacing:.08em;text-transform:uppercase;font-size:.7rem}
  tr:hover{background:#1a0d10}
  audio{height:32px;max-width:240px}
  .empty{padding:2rem;text-align:center;color:#666;font-style:italic}
  .name{color:#e8c878;font-weight:500}
  .msg{color:#ccc}
  .meta{color:#777;font-size:.75rem}
  .del{background:#4a0f12;color:#ff9a9a;border:1px solid #7B1E1E;padding:.4rem .7rem;font-size:.7rem;cursor:pointer;border-radius:3px}
  .del:hover{background:#7B1E1E;color:#fff}
  @media(max-width:600px){
    body{padding:1rem .8rem}
    table{font-size:.78rem}
    th,td{padding:.5rem .5rem}
    .actions{gap:.4rem}
    .btn{padding:.5rem .7rem;font-size:.7rem}
  }
</style>
</head>
<body>

<h1>Family Admin Panel</h1>
<div class="sub">Charles Nii Aryertey Taylor &middot; <a href="/" style="color:#c9a24a">View public page</a></div>

<div class="tabs">
  <button class="tab-btn active" data-tab="candles"><i class="fas fa-fire"></i> Candles <span class="count"><?= count($candles) ?></span></button>
  <button class="tab-btn" data-tab="voices"><i class="fas fa-microphone"></i> Voice Tributes <span class="count"><?= count($voices) ?></span></button>
  <button class="tab-btn" data-tab="cond"><i class="fas fa-envelope"></i> Condolences <span class="count"><?= count($condolences) ?></span></button>
</div>

<!-- CANDLES -->
<div class="panel active" id="panel-candles">
  <div class="actions">
    <a class="btn" href="?k=<?= htmlspecialchars(ADMIN_KEY) ?>&export=candles"><i class="fas fa-file-csv"></i> Export CSV</a>
    <span class="meta" style="align-self:center">Total: <?= count($candles) ?> lit</span>
  </div>
  <?php if (empty($candles)): ?>
    <div class="empty">No candles lit yet.</div>
  <?php else: ?>
    <table>
      <thead><tr><th>Name</th><th>Prayer</th><th>Lit</th><th>Action</th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($candles) as $c): ?>
        <tr data-id="<?= htmlspecialchars($c['id'] ?? '') ?>" data-type="candle">
          <td class="name"><?= htmlspecialchars($c['name'] ?? '') ?></td>
          <td class="msg"><?= htmlspecialchars($c['prayer'] ?? '') ?></td>
          <td class="meta"><?= date('M j, H:i', $c['at'] ?? 0) ?></td>
          <td><button class="del" onclick="del(this)">Delete</button></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<!-- VOICES -->
<div class="panel" id="panel-voices">
  <div class="actions">
    <a class="btn" href="?k=<?= htmlspecialchars(ADMIN_KEY) ?>&zip=voices"><i class="fas fa-file-archive"></i> Download all (ZIP)</a>
    <span class="meta" style="align-self:center">Total: <?= count($voices) ?> recordings</span>
  </div>
  <?php if (empty($voices)): ?>
    <div class="empty">No voice tributes yet.</div>
  <?php else: ?>
    <table>
      <thead><tr><th>Name</th><th>Recording</th><th>When</th><th>Action</th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($voices) as $v): ?>
        <tr data-id="<?= htmlspecialchars($v['id'] ?? '') ?>" data-type="voice">
          <td class="name"><?= htmlspecialchars($v['name'] ?? '') ?></td>
          <td><audio controls preload="none" src="data/voices/<?= htmlspecialchars($v['file'] ?? '') ?>"></audio></td>
          <td class="meta"><?= date('M j, H:i', $v['at'] ?? 0) ?></td>
          <td><button class="del" onclick="del(this)">Delete</button></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<!-- CONDOLENCES -->
<div class="panel" id="panel-cond">
  <div class="actions">
    <a class="btn" href="?k=<?= htmlspecialchars(ADMIN_KEY) ?>&export=condolences"><i class="fas fa-file-csv"></i> Export CSV</a>
    <span class="meta" style="align-self:center">Total: <?= count($condolences) ?> messages</span>
  </div>
  <?php if (empty($condolences)): ?>
    <div class="empty">No condolences yet.</div>
  <?php else: ?>
    <table>
      <thead><tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Message</th><th>When</th><th>Action</th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($condolences) as $c): ?>
        <tr data-id="<?= htmlspecialchars($c['id'] ?? '') ?>" data-type="cond">
          <td class="name"><?= htmlspecialchars($c['name'] ?? '') ?></td>
          <td class="meta"><?= htmlspecialchars($c['rel'] ?? '') ?></td>
          <td class="meta"><?php if (!empty($c['phone'])): ?>
            <a href="tel:<?= htmlspecialchars(preg_replace('/[^\d+]/', '', $c['phone'])) ?>" style="color:#e8c878;text-decoration:none">
              <?= htmlspecialchars($c['phone']) ?>
            </a>
          <?php endif; ?></td>
          <td class="msg"><?= htmlspecialchars($c['msg'] ?? '') ?></td>
          <td class="meta"><?= date('M j, H:i', $c['at'] ?? 0) ?></td>
          <td><button class="del" onclick="del(this)">Delete</button></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<script>
const ADMIN_K = <?= json_encode(ADMIN_KEY) ?>;
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById('panel-' + b.dataset.tab).classList.add('active');
  });
});

async function del(btn){
  const tr = btn.closest('tr');
  const id = tr.dataset.id;
  const type = tr.dataset.type;
  if (!confirm('Permanently delete this entry?')) return;
  const url = type === 'candle' ? 'api/candles.php' : type === 'voice' ? 'api/voices.php' : 'api/condolences.php';
  const r = await fetch(url + '?k=' + encodeURIComponent(ADMIN_K) + '&id=' + encodeURIComponent(id), { method: 'DELETE' });
  if (r.ok){ tr.remove(); }
  else { alert('Could not delete'); }
}
</script>

</body>
</html>
