<?php
session_start();
require_once __DIR__ . '/../api/config.php';

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['username'] === ADMIN_USER && password_verify($_POST['password'], ADMIN_PASS_HASH)) {
        $_SESSION['admin'] = true;
        $_SESSION['admin_token'] = bin2hex(random_bytes(32));
    } else {
        $loginError = 'Invalid credentials';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Check auth
$isLoggedIn = isset($_SESSION['admin']) && $_SESSION['admin'] === true;

// Handle export
if ($isLoggedIn && isset($_GET['export'])) {
    $db = getDB();
    $type = $_GET['export'];

    if ($type === 'rsvp_csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="rsvp_export_' . date('Y-m-d') . '.csv"');
        header('Content-Type: text/csv');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['#', 'Name', 'Phone', 'Guests', 'Event', 'Requirements', 'Date']);

        $stmt = $db->query("SELECT * FROM rsvps ORDER BY created_at DESC");
        $i = 1;
        while ($row = $stmt->fetch()) {
            fputcsv($output, [
                $i++,
                $row['name'],
                $row['phone'],
                $row['guests'],
                $row['event_type'],
                $row['requirements'],
                date('M j, Y g:i A', strtotime($row['created_at']))
            ]);
        }
        fclose($output);
        exit;
    }

    if ($type === 'condolences_csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="condolences_export_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['#', 'Name', 'Relation', 'Message', 'Likes', 'Date']);

        $stmt = $db->query("SELECT * FROM condolences ORDER BY created_at DESC");
        $i = 1;
        while ($row = $stmt->fetch()) {
            fputcsv($output, [
                $i++,
                $row['name'],
                $row['relation'],
                $row['message'],
                $row['likes'],
                date('M j, Y g:i A', strtotime($row['created_at']))
            ]);
        }
        fclose($output);
        exit;
    }
}

// Handle delete actions
if ($isLoggedIn && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = getDB();
    if (isset($_POST['delete_rsvp'])) {
        $stmt = $db->prepare("DELETE FROM rsvps WHERE id = ?");
        $stmt->execute([intval($_POST['delete_rsvp'])]);
    }
    if (isset($_POST['delete_condolence'])) {
        $stmt = $db->prepare("DELETE FROM condolences WHERE id = ?");
        $stmt->execute([intval($_POST['delete_condolence'])]);
    }
}

// Fetch data for display
if ($isLoggedIn) {
    $db = getDB();
    $tab = $_GET['tab'] ?? 'rsvp';

    $rsvps = $db->query("SELECT * FROM rsvps ORDER BY created_at DESC")->fetchAll();
    $condolences = $db->query("SELECT * FROM condolences ORDER BY created_at DESC")->fetchAll();

    $rsvpCount = count($rsvps);
    $totalGuests = array_sum(array_column($rsvps, 'guests'));
    $condolenceCount = count($condolences);
}

// Suppress JSON content-type from config.php for HTML page
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Atta Panin Memorial</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f0f2f5; color: #333; }

        .login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1A0A2E, #2D1B4E); }
        .login-card { background: white; padding: 3rem; border-radius: 16px; width: 400px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .login-card h1 { color: #1A0A2E; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .login-card p { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
        .login-card input { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 1rem; font-size: 1rem; transition: border 0.3s; }
        .login-card input:focus { border-color: #C9A227; outline: none; }
        .login-card button { width: 100%; padding: 14px; background: linear-gradient(135deg, #C9A227, #8B7014); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        .login-card button:hover { transform: translateY(-2px); }
        .login-error { color: #e74c3c; font-size: 0.85rem; margin-bottom: 1rem; }

        .admin-header { background: linear-gradient(135deg, #1A0A2E, #2D1B4E); color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .admin-header h1 { font-size: 1.3rem; }
        .admin-header a { color: #C9A227; text-decoration: none; font-size: 0.9rem; }

        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; padding: 1.5rem 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .stat-card .number { font-size: 2rem; font-weight: 700; color: #1A0A2E; }
        .stat-card .label { color: #666; font-size: 0.85rem; margin-top: 4px; }

        .tabs { display: flex; gap: 0; padding: 0 2rem; border-bottom: 2px solid #e0e0e0; background: white; }
        .tab { padding: 1rem 2rem; cursor: pointer; border-bottom: 3px solid transparent; font-weight: 500; color: #666; transition: all 0.3s; text-decoration: none; }
        .tab:hover { color: #1A0A2E; }
        .tab.active { color: #1A0A2E; border-bottom-color: #C9A227; }

        .actions-bar { display: flex; gap: 1rem; padding: 1.5rem 2rem; flex-wrap: wrap; align-items: center; }
        .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; text-decoration: none; }
        .btn-export { background: #27ae60; color: white; }
        .btn-export:hover { background: #219a52; }
        .btn-print { background: #2980b9; color: white; }
        .btn-print:hover { background: #2472a4; }
        .btn-danger { background: #e74c3c; color: white; padding: 6px 12px; font-size: 0.8rem; }
        .btn-danger:hover { background: #c0392b; }

        .data-table { width: 100%; border-collapse: collapse; background: white; }
        .data-table th { background: #f8f9fa; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 0.85rem; color: #555; border-bottom: 2px solid #e0e0e0; white-space: nowrap; }
        .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; vertical-align: top; }
        .data-table tr:hover { background: #f8f9fa; }
        .data-table .msg-text { max-width: 400px; line-height: 1.5; }

        .table-wrapper { overflow-x: auto; margin: 0 2rem 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }

        .empty-state { text-align: center; padding: 4rem 2rem; color: #999; }
        .empty-state i { font-size: 3rem; margin-bottom: 1rem; display: block; }

        @media print {
            .admin-header, .actions-bar, .tabs, .btn-danger, .no-print { display: none !important; }
            .table-wrapper { margin: 0; box-shadow: none; }
            .stats-row { padding: 1rem 0; }
            body { background: white; }
            .data-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 1cm; }
            .print-header { display: block !important; text-align: center; padding: 1rem 0 2rem; }
            .print-header h1 { font-size: 1.5rem; color: #1A0A2E; }
            .print-header p { color: #666; }
        }

        .print-header { display: none; }
    </style>
</head>
<body>

<?php if (!$isLoggedIn): ?>
<div class="login-page">
    <div class="login-card">
        <h1><i class="fas fa-lock"></i> Admin Panel</h1>
        <p>Atta Panin Memorial - Management</p>
        <?php if (isset($loginError)): ?>
            <div class="login-error"><i class="fas fa-exclamation-circle"></i> <?= $loginError ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required autofocus>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" name="login"><i class="fas fa-sign-in-alt"></i> Sign In</button>
        </form>
    </div>
</div>

<?php else: ?>

<div class="print-header">
    <h1>Mr. Wilson Atta Krofah (Atta Panin) Memorial</h1>
    <p><?= $tab === 'rsvp' ? 'RSVP List' : 'Book of Condolences' ?> - Exported <?= date('F j, Y') ?></p>
</div>

<header class="admin-header no-print">
    <h1><i class="fas fa-cog"></i> Atta Panin Memorial - Admin</h1>
    <div>
        <a href="../" target="_blank"><i class="fas fa-external-link-alt"></i> View Site</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="?logout=1"><i class="fas fa-sign-out-alt"></i> Logout</a>
    </div>
</header>

<div class="stats-row">
    <div class="stat-card">
        <div class="number"><?= $rsvpCount ?></div>
        <div class="label"><i class="fas fa-user-check"></i> Confirmed RSVPs</div>
    </div>
    <div class="stat-card">
        <div class="number"><?= $totalGuests ?></div>
        <div class="label"><i class="fas fa-users"></i> Total Guests Expected</div>
    </div>
    <div class="stat-card">
        <div class="number"><?= $condolenceCount ?></div>
        <div class="label"><i class="fas fa-book-open"></i> Condolence Messages</div>
    </div>
</div>

<div class="tabs no-print">
    <a href="?tab=rsvp" class="tab <?= $tab === 'rsvp' ? 'active' : '' ?>"><i class="fas fa-clipboard-list"></i> RSVPs</a>
    <a href="?tab=condolences" class="tab <?= $tab === 'condolences' ? 'active' : '' ?>"><i class="fas fa-book"></i> Condolences</a>
</div>

<?php if ($tab === 'rsvp'): ?>

<div class="actions-bar no-print">
    <a href="?export=rsvp_csv" class="btn btn-export"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</a>
    <button onclick="window.print()" class="btn btn-print"><i class="fas fa-print"></i> Print RSVP List</button>
    <span style="color:#666; font-size:0.85rem;">Total: <?= $rsvpCount ?> RSVPs, <?= $totalGuests ?> guests</span>
</div>

<div class="table-wrapper">
    <?php if (empty($rsvps)): ?>
        <div class="empty-state"><i class="fas fa-inbox"></i>No RSVPs yet</div>
    <?php else: ?>
    <table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Guests</th>
                <th>Event</th>
                <th>Requirements</th>
                <th>Date</th>
                <th class="no-print">Action</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($rsvps as $i => $r): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><strong><?= htmlspecialchars($r['name']) ?></strong></td>
                <td><?= htmlspecialchars($r['phone']) ?></td>
                <td><?= $r['guests'] ?></td>
                <td><?= htmlspecialchars($r['event_type']) ?></td>
                <td><?= htmlspecialchars($r['requirements'] ?: '-') ?></td>
                <td><?= date('M j, Y g:i A', strtotime($r['created_at'])) ?></td>
                <td class="no-print">
                    <form method="POST" style="display:inline" onsubmit="return confirm('Delete this RSVP?')">
                        <button type="submit" name="delete_rsvp" value="<?= $r['id'] ?>" class="btn btn-danger"><i class="fas fa-trash"></i></button>
                    </form>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>

<?php else: ?>

<div class="actions-bar no-print">
    <a href="?export=condolences_csv" class="btn btn-export"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</a>
    <button onclick="window.print()" class="btn btn-print"><i class="fas fa-print"></i> Print Condolences</button>
    <span style="color:#666; font-size:0.85rem;">Total: <?= $condolenceCount ?> messages</span>
</div>

<div class="table-wrapper">
    <?php if (empty($condolences)): ?>
        <div class="empty-state"><i class="fas fa-inbox"></i>No condolence messages yet</div>
    <?php else: ?>
    <table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Relation</th>
                <th>Message</th>
                <th>Likes</th>
                <th>Date</th>
                <th class="no-print">Action</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($condolences as $i => $c): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><strong><?= htmlspecialchars($c['name']) ?></strong></td>
                <td><?= htmlspecialchars($c['relation']) ?></td>
                <td class="msg-text"><?= htmlspecialchars($c['message']) ?></td>
                <td><i class="fas fa-heart" style="color:#e74c3c"></i> <?= $c['likes'] ?></td>
                <td><?= date('M j, Y g:i A', strtotime($c['created_at'])) ?></td>
                <td class="no-print">
                    <form method="POST" style="display:inline" onsubmit="return confirm('Delete this message?')">
                        <button type="submit" name="delete_condolence" value="<?= $c['id'] ?>" class="btn btn-danger"><i class="fas fa-trash"></i></button>
                    </form>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>
</div>

<?php endif; ?>
<?php endif; ?>

</body>
</html>
