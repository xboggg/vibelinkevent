<?php
require __DIR__ . '/api/_lib.php';
if (!hash_equals(ADMIN_KEY, $_GET['k'] ?? '')) { http_response_code(403); echo 'forbidden'; exit; }
$rsvp   = load_store('rsvp.json');
$wishes = load_store('wishes.json');
$voice  = load_store('voice.json');
$guests = load_store('guests.json');
$acc = 0; $dec = 0; $totalG = 0; $bride = 0; $groom = 0;
foreach ($rsvp as $r){
  if (($r['attending'] ?? 'yes') === 'yes'){ $acc++; $g = (int)($r['guests'] ?? 1); $totalG += $g; $s = strtolower((string)($r['side'] ?? '')); if ($s==='bride') $bride+=$g; else if ($s==='groom') $groom+=$g; }
  else $dec++;
}
$pending = 0; $approved = 0; foreach ($voice as $v){ $st = $v['status'] ?? 'pending'; if ($st==='pending') $pending++; else if ($st==='approved') $approved++; }
?><!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eric &amp; Sherita — Admin (v2)</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root{--sage:#7d8e6d;--sage-deep:#5a6b4c;--gold:#c9a24a;--gold-deep:#8a6a23;--ivory:#f5f2e8;--text:#2a2e26}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Cormorant Garamond',serif;background:linear-gradient(180deg,#f5f2e8,#e8e3d0);color:var(--text);padding:2rem 1rem;line-height:1.6;min-height:100vh}
.wrap{max-width:1180px;margin:0 auto}
header.head{text-align:center;margin-bottom:2rem}
.eyebrow{font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.55em;color:var(--gold-deep);text-transform:uppercase;font-weight:600;margin-bottom:.5rem}
h1{font-family:'Cormorant Garamond',serif;color:var(--sage-deep);font-size:2.2rem;font-weight:500}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:2rem}
.stat{background:#fff;padding:1.2rem;border:1px solid rgba(90,107,76,.2);border-radius:2px;text-align:center;position:relative}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--sage));}
.stat-num{font-family:'Cormorant Garamond',serif;font-weight:600;color:var(--sage-deep);font-size:1.8rem;line-height:1}
.stat-label{font-family:'Cinzel',serif;font-size:.55rem;letter-spacing:.32em;color:var(--gold-deep);text-transform:uppercase;font-weight:600;margin-top:.5rem}
.tabs{display:flex;gap:.5rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap}
.tab{padding:.6rem 1.2rem;background:#fff;border:1px solid rgba(90,107,76,.2);color:var(--sage-deep);font-family:'Cinzel',serif;font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;font-weight:600;border-radius:99px;cursor:pointer;transition:all .3s}
.tab.on{background:linear-gradient(135deg,#a5b490,var(--sage));color:#fff;border-color:var(--sage-deep)}
.tab .n{background:var(--gold);color:#fff;padding:.1rem .45rem;border-radius:99px;margin-left:.4rem;font-size:.85em}
.panel{display:none;background:#fff;padding:1.2rem;border:1px solid rgba(90,107,76,.2);border-radius:2px;overflow-x:auto}
.panel.on{display:block}
table{width:100%;border-collapse:collapse;font-size:.9rem}
th,td{padding:.6rem .7rem;text-align:left;border-bottom:1px solid rgba(90,107,76,.12)}
th{background:rgba(125,142,109,.08);font-family:'Cinzel',serif;font-size:.6rem;letter-spacing:.24em;color:var(--sage-deep);text-transform:uppercase;font-weight:600}
tr:hover{background:rgba(255,247,220,.4)}
.badge{display:inline-block;padding:.15rem .55rem;border-radius:99px;font-family:'Cinzel',serif;font-size:.52rem;letter-spacing:.24em;text-transform:uppercase;font-weight:600}
.badge.yes{background:rgba(59,122,59,.15);color:#3b7a3b}
.badge.no{background:rgba(178,48,48,.12);color:#8a3030}
.badge.pending{background:rgba(201,162,74,.15);color:var(--gold-deep)}
.badge.approved{background:rgba(90,107,76,.15);color:var(--sage-deep)}
.badge.rejected{background:rgba(120,120,120,.15);color:#666}
.action-btn{padding:.35rem .6rem;border:1px solid;border-radius:2px;background:#fff;font-family:'Cinzel',serif;font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;font-weight:600;cursor:pointer;margin-right:.3rem}
.action-btn.approve{color:#3b7a3b;border-color:#3b7a3b}
.action-btn.approve:hover{background:#3b7a3b;color:#fff}
.action-btn.reject{color:#8a3030;border-color:#8a3030}
.action-btn.reject:hover{background:#8a3030;color:#fff}
.action-btn.delete{color:#666;border-color:#999}
.action-btn.delete:hover{background:#666;color:#fff}
.export{display:inline-block;padding:.6rem 1.2rem;background:var(--sage);color:#fff;border:none;font-family:'Cinzel',serif;font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;font-weight:600;border-radius:99px;text-decoration:none;cursor:pointer;margin-right:.5rem}
.export:hover{background:var(--sage-deep)}
audio{width:200px;height:32px}
.note{font-style:italic;color:#666;font-size:.85rem;max-width:280px}
.empty{text-align:center;padding:3rem;color:#888;font-style:italic}
</style></head>
<body>
<div class="wrap">
<header class="head">
  <div class="eyebrow">Admin Panel v2</div>
  <h1>Eric &amp; Sherita &middot; Wedding</h1>
</header>

<div class="stat-grid">
  <div class="stat"><div class="stat-num"><?= count($rsvp) ?></div><div class="stat-label">RSVPs</div></div>
  <div class="stat"><div class="stat-num"><?= $acc ?></div><div class="stat-label">Attending</div></div>
  <div class="stat"><div class="stat-num"><?= $dec ?></div><div class="stat-label">Declined</div></div>
  <div class="stat"><div class="stat-num"><?= $totalG ?></div><div class="stat-label">Total Guests</div></div>
  <div class="stat"><div class="stat-num"><?= $bride ?></div><div class="stat-label">Bride's Side</div></div>
  <div class="stat"><div class="stat-num"><?= $groom ?></div><div class="stat-label">Groom's Side</div></div>
  <div class="stat"><div class="stat-num"><?= count($wishes) ?></div><div class="stat-label">Wishes</div></div>
  <div class="stat"><div class="stat-num"><?= $pending ?></div><div class="stat-label">Voice Pending</div></div>
</div>

<div class="tabs">
  <button class="tab on" data-panel="rsvp">RSVPs <span class="n"><?= count($rsvp) ?></span></button>
  <button class="tab" data-panel="wishes">Wishes <span class="n"><?= count($wishes) ?></span></button>
  <button class="tab" data-panel="voice">Voice Tributes <span class="n"><?= count($voice) ?></span></button>
  <button class="tab" data-panel="guests">Guest List <span class="n"><?= count($guests) ?></span></button>
</div>

<div class="panel on" data-panel="rsvp">
  <a class="export" href="?k=<?= urlencode(ADMIN_KEY) ?>&export=rsvp"><i class="fas fa-file-csv"></i> Export CSV</a>
  <?php if (empty($rsvp)): ?><div class="empty">No RSVPs yet.</div><?php else: ?>
  <table>
    <thead><tr><th>Name</th><th>Email / Phone</th><th>Attending</th><th>Guests</th><th>Side</th><th>Dietary</th><th>Note</th><th>When</th><th></th></tr></thead>
    <tbody>
    <?php foreach (array_reverse($rsvp) as $r): ?>
      <tr>
        <td><?= htmlspecialchars($r['name'] ?? '') ?></td>
        <td><small><?= htmlspecialchars($r['email'] ?? '') ?><?php if(!empty($r['phone'])): ?><br><?= htmlspecialchars($r['phone']) ?><?php endif; ?></small></td>
        <td><span class="badge <?= ($r['attending'] ?? 'yes') === 'yes' ? 'yes' : 'no' ?>"><?= ($r['attending'] ?? 'yes') === 'yes' ? 'Yes' : 'No' ?></span></td>
        <td><?= (int)($r['guests'] ?? 0) ?></td>
        <td><small><?= htmlspecialchars($r['side'] ?? '—') ?></small></td>
        <td class="note"><?= htmlspecialchars($r['dietary'] ?? '') ?></td>
        <td class="note"><?= htmlspecialchars($r['note'] ?? '') ?></td>
        <td><small><?= date('d M, H:i', (int)($r['at'] ?? 0)) ?></small></td>
        <td><button class="action-btn delete" onclick="del('rsvp', '<?= $r['id'] ?? '' ?>')">Delete</button></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</div>

<div class="panel" data-panel="wishes">
  <a class="export" href="?k=<?= urlencode(ADMIN_KEY) ?>&export=wishes"><i class="fas fa-file-csv"></i> Export CSV</a>
  <?php if (empty($wishes)): ?><div class="empty">No wishes yet.</div><?php else: ?>
  <table>
    <thead><tr><th>Name</th><th>Message</th><th>When</th><th></th></tr></thead>
    <tbody>
    <?php foreach (array_reverse($wishes) as $w): ?>
      <tr>
        <td><?= htmlspecialchars($w['name'] ?? '') ?></td>
        <td class="note" style="max-width:500px"><?= htmlspecialchars($w['msg'] ?? '') ?></td>
        <td><small><?= date('d M, H:i', (int)($w['at'] ?? 0)) ?></small></td>
        <td><button class="action-btn delete" onclick="del('wishes', '<?= $w['id'] ?? '' ?>')">Delete</button></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</div>

<div class="panel" data-panel="voice">
  <?php if (empty($voice)): ?><div class="empty">No voice tributes yet.</div><?php else: ?>
  <table>
    <thead><tr><th>Name</th><th>Audio</th><th>Status</th><th>When</th><th>Actions</th></tr></thead>
    <tbody>
    <?php foreach (array_reverse($voice) as $v): ?>
      <tr>
        <td><?= htmlspecialchars($v['name'] ?? '') ?></td>
        <td><audio controls src="data/voice/<?= htmlspecialchars($v['file'] ?? '') ?>"></audio></td>
        <td><span class="badge <?= htmlspecialchars($v['status'] ?? 'pending') ?>"><?= htmlspecialchars($v['status'] ?? 'pending') ?></span></td>
        <td><small><?= date('d M, H:i', (int)($v['at'] ?? 0)) ?></small></td>
        <td>
          <?php if (($v['status'] ?? '') !== 'approved'): ?>
          <button class="action-btn approve" onclick="voiceAction('approve','<?= $v['id'] ?>')">Approve</button>
          <?php endif; ?>
          <?php if (($v['status'] ?? '') !== 'rejected'): ?>
          <button class="action-btn reject" onclick="voiceAction('reject','<?= $v['id'] ?>')">Reject</button>
          <?php endif; ?>
          <button class="action-btn delete" onclick="voiceAction('delete','<?= $v['id'] ?>')">Delete</button>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</div>

<div class="panel" data-panel="guests">
  <p style="margin-bottom:1rem;color:#666;font-style:italic">Upload the guest list as a JSON array. Each entry needs a <code>name</code> field; optional: <code>seats</code>, <code>side</code>, <code>note</code>. When left empty, guests default to 2 seats.</p>
  <textarea id="guestJson" style="width:100%;height:220px;padding:1rem;font-family:monospace;font-size:.85rem;border:1px solid rgba(90,107,76,.3);border-radius:2px" placeholder='[{"name":"Kwame Boateng","seats":2,"side":"Groom"}, {"name":"Ama Serwaa","seats":4,"side":"Bride","note":"Family"}]'><?= empty($guests) ? '' : json_encode($guests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?></textarea>
  <button class="export" onclick="saveGuests()" style="margin-top:1rem"><i class="fas fa-save"></i> Save Guest List</button>
  <span id="guestSaveMsg" style="margin-left:1rem;color:var(--sage-deep);font-style:italic"></span>
</div>

</div>

<?php
if (($_GET['export'] ?? '') === 'rsvp'){
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="rsvps.csv"');
  $out = fopen('php://output', 'w');
  fputcsv($out, ['Name','Email','Phone','Attending','Guests','Side','Ceremony','Reception','Dietary','Note','At']);
  foreach ($rsvp as $r) fputcsv($out, [$r['name']??'',$r['email']??'',$r['phone']??'',$r['attending']??'',$r['guests']??'',$r['side']??'',$r['ceremony']??'',$r['reception']??'',$r['dietary']??'',$r['note']??'',date('Y-m-d H:i',(int)($r['at']??0))]);
  exit;
}
if (($_GET['export'] ?? '') === 'wishes'){
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="wishes.csv"');
  $out = fopen('php://output', 'w');
  fputcsv($out, ['Name','Message','At']);
  foreach ($wishes as $w) fputcsv($out, [$w['name']??'',$w['msg']??'',date('Y-m-d H:i',(int)($w['at']??0))]);
  exit;
}
?>

<script>
const K = '<?= addslashes(ADMIN_KEY) ?>';
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  const p = t.dataset.panel;
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
  document.querySelectorAll('.panel').forEach(x => x.classList.toggle('on', x.dataset.panel === p));
}));
async function del(kind, id){
  if (!confirm('Delete this entry?')) return;
  const r = await fetch('api/' + kind + '.php?k=' + encodeURIComponent(K) + '&id=' + encodeURIComponent(id), { method: 'DELETE' });
  if (r.ok) location.reload(); else alert('Delete failed');
}
async function voiceAction(action, id){
  if (action === 'delete' && !confirm('Delete this voice tribute permanently?')) return;
  const r = await fetch('api/voice-mod.php?k=' + encodeURIComponent(K) + '&action=' + action + '&id=' + encodeURIComponent(id));
  if (r.ok) location.reload(); else alert('Failed');
}
async function saveGuests(){
  const t = document.getElementById('guestJson').value.trim();
  const msg = document.getElementById('guestSaveMsg');
  let arr = [];
  try{ arr = JSON.parse(t); if (!Array.isArray(arr)) throw new Error('must be an array'); }
  catch(e){ msg.style.color='#8a3030'; msg.textContent = 'Invalid JSON: ' + e.message; return; }
  msg.style.color = '#666'; msg.textContent = 'Saving…';
  try{
    const r = await fetch('api/guests.php?k=' + encodeURIComponent(K), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ guests: arr, k: K }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Save failed');
    msg.style.color = 'var(--sage-deep)'; msg.textContent = 'Saved ' + j.count + ' guests.';
  }catch(e){ msg.style.color='#8a3030'; msg.textContent = e.message; }
}
</script>
</body></html>
