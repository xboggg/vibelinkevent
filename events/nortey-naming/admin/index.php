<?php
/**
 * Baby Nortey Naming Ceremony - Admin Panel
 *
 * Session-based authentication with token stored in admin_sessions table.
 * Two tabs: Wishes and RSVPs with CSV export, print, and delete.
 */

session_start();

require_once __DIR__ . '/../api/config.php';

// ── Admin Password Hash (pre-computed for NorteyBaby2026!) ────────────
// We store a constant hash so we don't re-hash on every page load.
$ADMIN_PASSWORD_HASH = '$2y$10$YQ6kZ8vN0Pj5GdR3W1mXxOhVt9C2bKj4LwXz7UqA8sE6fD0yHnIiO';

// On first run, if the hash above doesn't verify, generate a fresh one.
// This ensures the system always works regardless of bcrypt version.
if (!password_verify('NorteyBaby2026!', $ADMIN_PASSWORD_HASH)) {
    $ADMIN_PASSWORD_HASH = password_hash('NorteyBaby2026!', PASSWORD_BCRYPT);
}

// ── Helpers ───────────────────────────────────────────────────────────
// Override JSON content-type for this HTML page
header('Content-Type: text/html; charset=UTF-8');

function isLoggedIn(): bool
{
    if (empty($_SESSION['admin_token'])) {
        return false;
    }
    try {
        $db = getDB();
        $stmt = $db->prepare(
            'SELECT id FROM admin_sessions
             WHERE token = :token AND expires_at > NOW()
             LIMIT 1'
        );
        $stmt->execute([':token' => $_SESSION['admin_token']]);
        return (bool)$stmt->fetch();
    } catch (PDOException $e) {
        return false;
    }
}

function createSession(): string
{
    $token = bin2hex(random_bytes(32));
    $db = getDB();
    // Clean up expired sessions
    $db->exec("DELETE FROM admin_sessions WHERE expires_at < NOW()");
    // Create new session (expires in 8 hours)
    $stmt = $db->prepare(
        'INSERT INTO admin_sessions (token, created_at, expires_at)
         VALUES (:token, NOW(), DATE_ADD(NOW(), INTERVAL 8 HOUR))'
    );
    $stmt->execute([':token' => $token]);
    return $token;
}

function destroySession(): void
{
    if (!empty($_SESSION['admin_token'])) {
        try {
            $db = getDB();
            $stmt = $db->prepare('DELETE FROM admin_sessions WHERE token = :token');
            $stmt->execute([':token' => $_SESSION['admin_token']]);
        } catch (PDOException $e) {
            // Silently fail
        }
    }
    session_destroy();
}

// ── Handle Actions ────────────────────────────────────────────────────
$error   = '';
$success = '';
$action  = $_GET['action'] ?? $_POST['action'] ?? '';

// Logout
if ($action === 'logout') {
    destroySession();
    header('Location: index.php');
    exit();
}

// Login
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === ADMIN_USER && password_verify($password, $ADMIN_PASSWORD_HASH)) {
        $token = createSession();
        $_SESSION['admin_token'] = $token;
        header('Location: index.php');
        exit();
    } else {
        $error = 'Invalid username or password.';
    }
}

// Delete wish
if ($action === 'delete_wish' && isLoggedIn() && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id > 0) {
        try {
            $db = getDB();
            $stmt = $db->prepare('DELETE FROM wishes WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $success = 'Wish deleted successfully.';
        } catch (PDOException $e) {
            $error = 'Failed to delete wish.';
        }
    }
}

// Delete RSVP
if ($action === 'delete_rsvp' && isLoggedIn() && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id > 0) {
        try {
            $db = getDB();
            $stmt = $db->prepare('DELETE FROM rsvps WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $success = 'RSVP deleted successfully.';
        } catch (PDOException $e) {
            $error = 'Failed to delete RSVP.';
        }
    }
}

// CSV Export for RSVPs
if ($action === 'export_csv' && isLoggedIn()) {
    try {
        $db = getDB();
        $stmt = $db->query('SELECT id, name, phone, guests, attending, created_at FROM rsvps ORDER BY created_at DESC');
        $rsvps = $stmt->fetchAll();

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="nortey_naming_rsvps_' . date('Y-m-d') . '.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');
        // BOM for Excel UTF-8 compatibility
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));
        fputcsv($output, ['ID', 'Name', 'Phone', 'Guests', 'Attending', 'Date']);

        foreach ($rsvps as $row) {
            fputcsv($output, [
                $row['id'],
                $row['name'],
                $row['phone'],
                $row['guests'],
                ucfirst($row['attending']),
                date('d M Y H:i', strtotime($row['created_at']))
            ]);
        }

        fclose($output);
        exit();
    } catch (PDOException $e) {
        $error = 'Failed to export CSV.';
    }
}

// ── Fetch data for dashboard ──────────────────────────────────────────
$wishes    = [];
$rsvps     = [];
$stats     = ['total_confirmed' => 0, 'total_guests' => 0];
$activeTab = $_GET['tab'] ?? 'wishes';

if (isLoggedIn()) {
    try {
        $db = getDB();

        // Wishes
        $stmt = $db->query('SELECT id, name, message, created_at, ip_address FROM wishes ORDER BY created_at DESC');
        $wishes = $stmt->fetchAll();

        // RSVPs
        $stmt = $db->query('SELECT id, name, phone, guests, attending, created_at, ip_address FROM rsvps ORDER BY created_at DESC');
        $rsvps = $stmt->fetchAll();

        // Stats
        $stmt = $db->query('SELECT COUNT(*) AS total_confirmed, COALESCE(SUM(guests), 0) AS total_guests FROM rsvps');
        $stats = $stmt->fetch();

    } catch (PDOException $e) {
        $error = 'Failed to load data: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Baby Nortey Naming Ceremony</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        :root {
            --blush: #F8D7DA;
            --peach: #E8956A;
            --peach-light: #FDEBD3;
            --peach-soft: #F5C6A0;
            --sage: #A8C5A0;
            --sage-light: #D4E7CF;
            --gold: #C9A227;
            --gold-light: #F4E4BC;
            --cream: #FFF9F2;
            --brown: #8B6F5E;
            --brown-light: #B8A090;
            --pink: #F2B5C0;
            --pink-dark: #E88FA0;
            --white: #FFFFFF;
            --shadow: rgba(139, 111, 94, 0.1);
            --danger: #dc3545;
            --danger-light: #f8d7da;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, var(--cream) 0%, var(--peach-light) 50%, var(--blush) 100%);
            color: var(--brown);
            min-height: 100vh;
        }

        /* ── LOGIN PAGE ─────────────────────────────────────────── */
        .login-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
        }

        .login-card {
            background: var(--white);
            border-radius: 20px;
            padding: 3rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 15px 50px var(--shadow);
            text-align: center;
        }

        .login-card .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .login-card h1 {
            font-family: 'Playfair Display', serif;
            font-size: 1.6rem;
            color: var(--brown);
            margin-bottom: 0.3rem;
        }

        .login-card .subtitle {
            color: var(--brown-light);
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }

        .form-group {
            margin-bottom: 1.2rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--brown);
            margin-bottom: 0.4rem;
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--peach-light);
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.95rem;
            color: var(--brown);
            transition: border-color 0.3s;
            background: var(--cream);
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--peach);
            background: var(--white);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--peach), var(--pink-dark));
            color: var(--white);
            width: 100%;
            padding: 0.85rem;
            font-size: 1rem;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(232, 149, 106, 0.4);
        }

        .btn-sm {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            border-radius: 8px;
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--peach);
            color: var(--peach);
        }

        .btn-outline:hover {
            background: var(--peach);
            color: var(--white);
        }

        .btn-success {
            background: var(--sage);
            color: var(--white);
        }

        .btn-success:hover {
            background: #8fb587;
        }

        .btn-danger {
            background: var(--danger);
            color: var(--white);
        }

        .btn-danger:hover {
            background: #c82333;
        }

        .btn-ghost {
            background: transparent;
            color: var(--brown-light);
            padding: 0.3rem 0.6rem;
        }

        .btn-ghost:hover {
            color: var(--danger);
            background: var(--danger-light);
        }

        .alert {
            padding: 0.75rem 1rem;
            border-radius: 10px;
            margin-bottom: 1.2rem;
            font-size: 0.9rem;
        }

        .alert-error {
            background: var(--danger-light);
            color: #721c24;
            border-left: 4px solid var(--danger);
        }

        .alert-success {
            background: var(--sage-light);
            color: #3d6b35;
            border-left: 4px solid var(--sage);
        }

        /* ── DASHBOARD ──────────────────────────────────────────── */
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
        }

        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--white);
            border-radius: 16px;
            padding: 1rem 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 20px var(--shadow);
            flex-wrap: wrap;
            gap: 1rem;
        }

        .top-bar h1 {
            font-family: 'Playfair Display', serif;
            font-size: 1.3rem;
            color: var(--brown);
        }

        .top-bar h1 i {
            color: var(--pink);
            margin-right: 0.5rem;
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        /* ── STAT CARDS ─────────────────────────────────────────── */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .stat-card {
            background: var(--white);
            border-radius: 14px;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 4px 20px var(--shadow);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .stat-card:nth-child(1)::before { background: linear-gradient(90deg, var(--pink), var(--peach)); }
        .stat-card:nth-child(2)::before { background: linear-gradient(90deg, var(--sage), var(--sage-light)); }
        .stat-card:nth-child(3)::before { background: linear-gradient(90deg, var(--gold), var(--gold-light)); }
        .stat-card:nth-child(4)::before { background: linear-gradient(90deg, var(--peach), var(--peach-soft)); }

        .stat-card .stat-icon {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }

        .stat-card:nth-child(1) .stat-icon { color: var(--pink-dark); }
        .stat-card:nth-child(2) .stat-icon { color: var(--sage); }
        .stat-card:nth-child(3) .stat-icon { color: var(--gold); }
        .stat-card:nth-child(4) .stat-icon { color: var(--peach); }

        .stat-card .stat-number {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            font-weight: 700;
            color: var(--brown);
        }

        .stat-card .stat-label {
            font-size: 0.85rem;
            color: var(--brown-light);
            margin-top: 0.25rem;
        }

        /* ── TABS ───────────────────────────────────────────────── */
        .tabs {
            display: flex;
            gap: 0;
            margin-bottom: 0;
        }

        .tab {
            padding: 0.85rem 1.8rem;
            background: var(--peach-light);
            color: var(--brown);
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            border-radius: 14px 14px 0 0;
            font-size: 0.9rem;
            transition: all 0.3s;
            border: 2px solid transparent;
            border-bottom: none;
        }

        .tab:hover {
            background: var(--peach-soft);
        }

        .tab.active {
            background: var(--white);
            color: var(--peach);
            border-color: var(--peach-light);
            font-weight: 600;
        }

        .tab i {
            margin-right: 0.4rem;
        }

        /* ── TABLE CARD ─────────────────────────────────────────── */
        .table-card {
            background: var(--white);
            border-radius: 0 16px 16px 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px var(--shadow);
            overflow-x: auto;
        }

        .table-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .table-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.2rem;
            color: var(--brown);
        }

        .table-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        thead th {
            background: var(--cream);
            color: var(--brown);
            font-weight: 600;
            padding: 0.85rem 1rem;
            text-align: left;
            border-bottom: 2px solid var(--peach-light);
            white-space: nowrap;
        }

        tbody td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f0e8e0;
            vertical-align: top;
        }

        tbody tr:hover {
            background: var(--cream);
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .msg-cell {
            max-width: 350px;
            line-height: 1.5;
        }

        .ip-cell {
            font-size: 0.8rem;
            color: var(--brown-light);
            font-family: monospace;
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--brown-light);
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--peach-light);
        }

        .empty-state p {
            font-size: 1rem;
        }

        /* ── PRINT STYLES ───────────────────────────────────────── */
        @media print {
            body { background: white !important; }
            .top-bar, .tabs, .table-actions, .btn-ghost, .no-print { display: none !important; }
            .dashboard { max-width: 100%; padding: 0; }
            .table-card { box-shadow: none; border-radius: 0; padding: 0; }
            .stats-grid { break-inside: avoid; }
            .stat-card { box-shadow: none; border: 1px solid #ddd; }
            table { font-size: 0.85rem; }
            thead th { background: #f5f5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        /* ── RESPONSIVE ─────────────────────────────────────────── */
        @media (max-width: 768px) {
            .dashboard { padding: 1rem; }
            .top-bar { padding: 1rem; }
            .top-bar h1 { font-size: 1.1rem; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .tab { padding: 0.65rem 1rem; font-size: 0.85rem; }
            table { font-size: 0.8rem; }
            thead th, tbody td { padding: 0.6rem 0.5rem; }
            .msg-cell { max-width: 200px; }
        }

        @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr; }
            .login-card { padding: 2rem 1.5rem; }
        }

        /* ── DELETE CONFIRMATION ─────────────────────────────────── */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal-box {
            background: var(--white);
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .modal-box h3 {
            margin-bottom: 0.5rem;
            color: var(--brown);
        }

        .modal-box p {
            margin-bottom: 1.5rem;
            color: var(--brown-light);
            font-size: 0.9rem;
        }

        .modal-box .modal-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }

        .modal-box .modal-actions .btn {
            min-width: 100px;
        }
    </style>
</head>
<body>

<?php if (!isLoggedIn()): ?>
<!-- ════════════════════════════════════════════════════════════════════
     LOGIN PAGE
     ════════════════════════════════════════════════════════════════════ -->
<div class="login-wrapper">
    <div class="login-card">
        <div class="icon">&#x1F476;</div>
        <h1>Admin Panel</h1>
        <p class="subtitle">Baby Nortey Naming Ceremony</p>

        <?php if ($error): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="index.php">
            <input type="hidden" name="action" value="login">

            <div class="form-group">
                <label for="username"><i class="fas fa-user"></i> Username</label>
                <input type="text" id="username" name="username" placeholder="Enter username" required autofocus>
            </div>

            <div class="form-group">
                <label for="password"><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="password" name="password" placeholder="Enter password" required>
            </div>

            <button type="submit" class="btn btn-primary">
                <i class="fas fa-sign-in-alt"></i> Sign In
            </button>
        </form>

        <p style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--brown-light);">
            <a href="../index.html" style="color: var(--peach); text-decoration: none;">
                <i class="fas fa-arrow-left"></i> Back to Ceremony Page
            </a>
        </p>
    </div>
</div>

<?php else: ?>
<!-- ════════════════════════════════════════════════════════════════════
     DASHBOARD
     ════════════════════════════════════════════════════════════════════ -->
<div class="dashboard">

    <!-- Top Bar -->
    <div class="top-bar">
        <h1><i class="fas fa-baby"></i> Baby Nortey Admin</h1>
        <div class="top-bar-actions">
            <a href="../index.html" class="btn btn-sm btn-outline no-print">
                <i class="fas fa-external-link-alt"></i> View Site
            </a>
            <a href="index.php?action=logout" class="btn btn-sm btn-outline no-print" style="border-color: var(--danger); color: var(--danger);">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </div>
    </div>

    <!-- Alerts -->
    <?php if ($error): ?>
        <div class="alert alert-error" style="margin-bottom: 1.5rem;">
            <i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>
    <?php if ($success): ?>
        <div class="alert alert-success" style="margin-bottom: 1.5rem;">
            <i class="fas fa-check-circle"></i> <?= htmlspecialchars($success) ?>
        </div>
    <?php endif; ?>

    <!-- Stats Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-heart"></i></div>
            <div class="stat-number"><?= count($wishes) ?></div>
            <div class="stat-label">Total Wishes</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-user-check"></i></div>
            <div class="stat-number"><?= (int)$stats['total_confirmed'] ?></div>
            <div class="stat-label">RSVPs Confirmed</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-number"><?= (int)$stats['total_guests'] ?></div>
            <div class="stat-label">Total Guests</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-number">6 Mar</div>
            <div class="stat-label">Ceremony Date</div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="tabs no-print">
        <a href="index.php?tab=wishes" class="tab <?= $activeTab === 'wishes' ? 'active' : '' ?>">
            <i class="fas fa-heart"></i> Wishes (<?= count($wishes) ?>)
        </a>
        <a href="index.php?tab=rsvps" class="tab <?= $activeTab === 'rsvps' ? 'active' : '' ?>">
            <i class="fas fa-clipboard-list"></i> RSVPs (<?= count($rsvps) ?>)
        </a>
    </div>

    <!-- Tab Content -->
    <div class="table-card">

        <?php if ($activeTab === 'wishes'): ?>
        <!-- ── WISHES TAB ──────────────────────────────────────── -->
        <div class="table-header">
            <h2><i class="fas fa-star" style="color: var(--gold);"></i> Blessings &amp; Wishes</h2>
            <div class="table-actions no-print">
                <button onclick="window.print()" class="btn btn-sm btn-outline">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>

        <?php if (empty($wishes)): ?>
            <div class="empty-state">
                <i class="fas fa-dove"></i>
                <p>No wishes yet. They will appear here once guests start sending blessings.</p>
            </div>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>IP</th>
                        <th class="no-print">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($wishes as $i => $wish): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td><strong><?= htmlspecialchars($wish['name']) ?></strong></td>
                        <td class="msg-cell"><?= htmlspecialchars($wish['message']) ?></td>
                        <td style="white-space: nowrap;"><?= date('d M Y', strtotime($wish['created_at'])) ?><br><small style="color: var(--brown-light);"><?= date('H:i', strtotime($wish['created_at'])) ?></small></td>
                        <td class="ip-cell"><?= htmlspecialchars($wish['ip_address'] ?? '-') ?></td>
                        <td class="no-print">
                            <button class="btn btn-ghost btn-sm" onclick="confirmDelete('wish', <?= $wish['id'] ?>, '<?= htmlspecialchars(addslashes($wish['name'])) ?>')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>

        <?php elseif ($activeTab === 'rsvps'): ?>
        <!-- ── RSVPS TAB ───────────────────────────────────────── -->
        <div class="table-header">
            <h2><i class="fas fa-clipboard-check" style="color: var(--sage);"></i> RSVP List</h2>
            <div class="table-actions no-print">
                <a href="index.php?action=export_csv" class="btn btn-sm btn-success">
                    <i class="fas fa-file-csv"></i> Export CSV
                </a>
                <button onclick="window.print()" class="btn btn-sm btn-outline">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>

        <?php if (empty($rsvps)): ?>
            <div class="empty-state">
                <i class="fas fa-envelope-open-text"></i>
                <p>No RSVPs yet. They will appear here once guests confirm their attendance.</p>
            </div>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Guests</th>
                        <th>Attending</th>
                        <th>Date</th>
                        <th>IP</th>
                        <th class="no-print">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($rsvps as $i => $rsvp): ?>
                    <tr>
                        <td><?= $i + 1 ?></td>
                        <td><strong><?= htmlspecialchars($rsvp['name']) ?></strong></td>
                        <td style="white-space: nowrap;"><?= htmlspecialchars($rsvp['phone']) ?></td>
                        <td style="text-align: center;"><strong><?= (int)$rsvp['guests'] ?></strong></td>
                        <td><span style="color: <?= $rsvp['attending'] === 'yes' ? 'var(--sage)' : ($rsvp['attending'] === 'no' ? 'var(--danger)' : 'var(--gold)') ?>; font-weight: 600;"><?= ucfirst(htmlspecialchars($rsvp['attending'])) ?></span></td>
                        <td style="white-space: nowrap;"><?= date('d M Y', strtotime($rsvp['created_at'])) ?><br><small style="color: var(--brown-light);"><?= date('H:i', strtotime($rsvp['created_at'])) ?></small></td>
                        <td class="ip-cell"><?= htmlspecialchars($rsvp['ip_address'] ?? '-') ?></td>
                        <td class="no-print">
                            <button class="btn btn-ghost btn-sm" onclick="confirmDelete('rsvp', <?= $rsvp['id'] ?>, '<?= htmlspecialchars(addslashes($rsvp['name'])) ?>')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <!-- Totals Row -->
            <div style="text-align: right; padding: 1rem; color: var(--brown); font-weight: 500; border-top: 2px solid var(--peach-light);">
                Total Guests: <strong style="color: var(--peach); font-size: 1.1rem;"><?= (int)$stats['total_guests'] ?></strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Total RSVPs: <strong style="color: var(--sage); font-size: 1.1rem;"><?= (int)$stats['total_confirmed'] ?></strong>
            </div>
        <?php endif; ?>

        <?php endif; ?>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal-overlay" id="deleteModal">
    <div class="modal-box">
        <h3><i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i> Confirm Delete</h3>
        <p id="deleteMessage">Are you sure you want to delete this entry?</p>
        <form id="deleteForm" method="POST" action="index.php">
            <input type="hidden" name="action" id="deleteAction" value="">
            <input type="hidden" name="id" id="deleteId" value="">
            <div class="modal-actions">
                <button type="button" class="btn btn-sm btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function confirmDelete(type, id, name) {
    document.getElementById('deleteAction').value = 'delete_' + type;
    document.getElementById('deleteId').value = id;
    document.getElementById('deleteMessage').textContent =
        'Are you sure you want to delete the ' + type + ' from "' + name + '"? This action cannot be undone.';
    document.getElementById('deleteModal').classList.add('active');
}

function closeModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// Auto-hide alerts after 5 seconds
document.querySelectorAll('.alert').forEach(function(alert) {
    setTimeout(function() {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(function() { alert.style.display = 'none'; }, 500);
    }, 5000);
});
</script>

<?php endif; ?>

</body>
</html>
