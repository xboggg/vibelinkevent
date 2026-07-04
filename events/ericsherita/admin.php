<?php
require __DIR__ . '/api/_lib.php';

$k = $_GET['k'] ?? '';
if (!hash_equals(ADMIN_KEY, $k)) {
    http_response_code(403);
    echo '<!doctype html><meta charset="utf-8"><title>403</title><body style="background:#f5f2e8;color:#5a6b4c;font-family:serif;text-align:center;padding-top:4rem"><h1>Access restricted</h1><p style="opacity:.7">This page is for the couple and family only.</p></body>';
    exit;
}

if (($_GET['export'] ?? '') !== '') {
    $type = $_GET['export'];
    $file = match($type) {
        'rsvp'   => 'rsvp.json',
        'wishes' => 'wishes.json',
        default  => null,
    };
    if (!$file) { http_response_code(400); exit('bad export'); }
    $arr = load_store($file);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '_ericsherita.csv"');
    $out = fopen('php://output', 'w');
    if ($type === 'rsvp') {
        fputcsv($out, ['Name', 'Email', 'Phone', 'Attending', 'Guests', 'Side', 'Ceremony', 'Reception', 'Note', 'Date']);
        foreach ($arr as $c) {
            fputcsv($out, [
                $c['name']      ?? '',
                $c['email']     ?? '',
                $c['phone']     ?? '',
                $c['attending'] ?? '',
                $c['guests']    ?? 0,
                $c['side']      ?? '',
                $c['ceremony']  ?? '',
                $c['reception'] ?? '',
                $c['note']      ?? '',
                date('Y-m-d H:i', $c['at'] ?? 0),
            ]);
        }
    } else {
        fputcsv($out, ['Name', 'Message', 'Date']);
        foreach ($arr as $c) {
            fputcsv($out, [$c['name'] ?? '', $c['msg'] ?? '', date('Y-m-d H:i', $c['at'] ?? 0)]);
        }
    }
    fclose($out);
    exit;
}

$rsvp   = load_store('rsvp.json');
$wishes = load_store('wishes.json');
$totalGuests = 0; $accept = 0; $decline = 0;
foreach ($rsvp as $r) {
    if (($r['attending'] ?? 'yes') === 'yes') { $accept++; $totalGuests += (int)($r['guests'] ?? 1); }
    else $decline++;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Eric &amp; Sherita — Family Admin</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--ivory:#f5f2e8;--sage:#7d8e6d;--sage-deep:#5a6b4c;--gold:#c9a24a;--gold-deep:#8a6a23;--text:#2a2e26;--muted:#7a7f70;--line:rgba(90,107,76,.18)}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:var(--ivory);color:var(--text);line-height:1.5;padding:1.6rem;min-height:100vh}
  h1{font-family:'Cormorant Garamond',serif;color:var(--sage-deep);font-weight:600;letter-spacing:.02em;margin-bottom:.3rem}
  .sub{color:var(--muted);font-size:.85rem;margin-bottom:1.5rem}
  .stats{display:flex;gap:.8rem;flex-wrap:wrap;margin-bottom:1.6rem}
  .stat{padding:.9rem 1.2rem;background:#fff;border:1px solid var(--line);border-radius:8px;min-width:130px}
  .stat-label{font-size:.65rem;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;margin-bottom:.3rem}
  .stat-value{font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:var(--sage-deep);font-weight:600;line-height:1}
  .stat-value .amp{color:var(--gold);margin:0 .3rem}
  .tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem;border-bottom:1px solid var(--line)}
  .tab-btn{background:none;border:none;color:var(--muted);padding:.7rem 1rem;font-size:.9rem;cursor:pointer;border-bottom:2px solid transparent;transition:.2s;font-family:inherit}
  .tab-btn.active{color:var(--sage-deep);border-color:var(--gold)}
  .tab-btn:hover{color:var(--text)}
  .tab-btn .count{background:var(--sage);color:#fff;border-radius:10px;padding:.1rem .5rem;font-size:.7rem;margin-left:.4rem}
  .panel{display:none}
  .panel.active{display:block}
  .actions{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem;align-items:center}
  .btn{background:var(--sage);color:#fff;border:1px solid var(--sage-deep);padding:.6rem 1rem;font-size:.78rem;letter-spacing:.1em;text-decoration:none;cursor:pointer;text-transform:uppercase;display:inline-flex;align-items:center;gap:.4rem;transition:.2s;font-family:inherit;border-radius:4px}
  .btn:hover{background:var(--sage-deep)}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden}
  th,td{padding:.7rem .8rem;text-align:left;border-bottom:1px solid var(--line);font-size:.86rem;vertical-align:top}
  th{background:#efeade;color:var(--sage-deep);font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:.7rem}
  tr:hover td{background:rgba(232,220,196,.35)}
  .empty{padding:2rem;text-align:center;color:var(--muted);font-style:italic}
  .name{color:var(--sage-deep);font-weight:600}
  .msg{color:var(--text)}
  .meta{color:var(--muted);font-size:.78rem}
  .attending-yes{color:#3b7a3b;font-weight:600}
  .attending-no{color:#b23030;font-weight:600}
  .del{background:#fff4f4;color:#b23030;border:1px solid #f0c8c8;padding:.4rem .7rem;font-size:.7rem;cursor:pointer;border-radius:3px;font-family:inherit}
  .del:hover{background:#b23030;color:#fff}
  a{color:var(--sage-deep);text-decoration:none}
  @media(max-width:600px){body{padding:1rem .8rem}table{font-size:.78rem}th,td{padding:.5rem .5rem}.btn{padding:.5rem .7rem;font-size:.7rem}}
</style>
</head>
<body>

<h1>Eric <span style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400">&amp;</span> Sherita — Family Admin</h1>
<div class="sub">Saturday, 28 November 2026 &middot; <a href="/">View public page</a></div>

<div class="stats">
  <div class="stat"><div class="stat-label">RSVPs</div><div class="stat-value"><?= count($rsvp) ?></div></div>
  <div class="stat"><div class="stat-label">Accepting</div><div class="stat-value"><?= $accept ?></div></div>
  <div class="stat"><div class="stat-label">Declining</div><div class="stat-value"><?= $decline ?></div></div>
  <div class="stat"><div class="stat-label">Total guests expected</div><div class="stat-value"><?= $totalGuests ?></div></div>
  <div class="stat"><div class="stat-label">Wishes</div><div class="stat-value"><?= count($wishes) ?></div></div>
</div>

<div class="tabs">
  <button class="tab-btn active" data-tab="rsvp"><i class="fas fa-calendar-check"></i> RSVPs <span class="count"><?= count($rsvp) ?></span></button>
  <button class="tab-btn" data-tab="wishes"><i class="fas fa-heart"></i> Wishes <span class="count"><?= count($wishes) ?></span></button>
</div>

<div class="panel active" id="panel-rsvp">
  <div class="actions">
    <a class="btn" href="?k=<?= htmlspecialchars(ADMIN_KEY) ?>&export=rsvp"><i class="fas fa-file-csv"></i> Export CSV</a>
    <span class="meta">Total: <?= count($rsvp) ?> RSVPs &middot; <?= $accept ?> yes &middot; <?= $decline ?> no &middot; <?= $totalGuests ?> guests</span>
  </div>
  <?php if (empty($rsvp)): ?>
    <div class="empty">No RSVPs yet.</div>
  <?php else: ?>
    <table>
      <thead><tr><th>Name</th><th>Contact</th><th>Attending</th><th>Guests</th><th>Side</th><th>Ceremony</th><th>Reception</th><th>Note</th><th>When</th><th></th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($rsvp) as $c): ?>
        <tr data-id="<?= htmlspecialchars($c['id'] ?? '') ?>" data-type="rsvp">
          <td class="name"><?= htmlspecialchars($c['name'] ?? '') ?></td>
          <td class="meta">
            <?php if (!empty($c['email'])): ?><a href="mailto:<?= htmlspecialchars($c['email']) ?>"><?= htmlspecialchars($c['email']) ?></a><br><?php endif; ?>
            <?php if (!empty($c['phone'])): ?><a href="tel:<?= htmlspecialchars(preg_replace('/[^\d+]/', '', $c['phone'])) ?>"><?= htmlspecialchars($c['phone']) ?></a><?php endif; ?>
          </td>
          <td class="attending-<?= htmlspecialchars($c['attending'] ?? 'yes') ?>"><?= ($c['attending'] ?? 'yes') === 'yes' ? 'YES' : 'NO' ?></td>
          <td><?= (int)($c['guests'] ?? 0) ?></td>
          <td class="meta"><?= htmlspecialchars($c['side'] ?? '') ?></td>
          <td class="meta"><?= ($c['ceremony'] ?? 'yes') === 'yes' ? '✓' : '—' ?></td>
          <td class="meta"><?= ($c['reception'] ?? 'yes') === 'yes' ? '✓' : '—' ?></td>
          <td class="msg"><?= htmlspecialchars($c['note'] ?? '') ?></td>
          <td class="meta"><?= date('M j, H:i', $c['at'] ?? 0) ?></td>
          <td><button class="del" onclick="del(this)">Delete</button></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>

<div class="panel" id="panel-wishes">
  <div class="actions">
    <a class="btn" href="?k=<?= htmlspecialchars(ADMIN_KEY) ?>&export=wishes"><i class="fas fa-file-csv"></i> Export CSV</a>
    <span class="meta">Total: <?= count($wishes) ?></span>
  </div>
  <?php if (empty($wishes)): ?>
    <div class="empty">No wishes yet.</div>
  <?php else: ?>
    <table>
      <thead><tr><th>Name</th><th>Message</th><th>When</th><th></th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($wishes) as $c): ?>
        <tr data-id="<?= htmlspecialchars($c['id'] ?? '') ?>" data-type="wish">
          <td class="name"><?= htmlspecialchars($c['name'] ?? '') ?></td>
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
  const url = type === 'rsvp' ? 'api/rsvp.php' : 'api/wishes.php';
  const r = await fetch(url + '?k=' + encodeURIComponent(ADMIN_K) + '&id=' + encodeURIComponent(id), { method: 'DELETE' });
  if (r.ok){ tr.remove(); } else { alert('Could not delete'); }
}
</script>
</body>
</html>
