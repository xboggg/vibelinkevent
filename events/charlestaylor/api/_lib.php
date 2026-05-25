<?php
// Shared helpers for charlestaylor.vibelinkevent.com APIs

const DATA_DIR    = __DIR__ . '/../data';
const VOICES_DIR  = __DIR__ . '/../data/voices';
const ADMIN_KEY   = 'ctaylor-fam-2026';

const MAX_CANDLES     = 500;
const MAX_VOICES      = 200;
const MAX_CONDOLENCES = 500;
const MAX_VOICE_BYTES = 2 * 1024 * 1024; // 2MB per recording
const RATE_LIMIT_SEC  = 20;

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_text(string $s, int $max = 200): string {
    $s = trim($s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s);
    if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
    return $s;
}

function client_ip(): string {
    return $_SERVER['HTTP_X_REAL_IP']
        ?? $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? 'unknown';
}

function rate_limit(string $bucket): void {
    $ip   = client_ip();
    $file = DATA_DIR . '/rl_' . $bucket . '_' . md5($ip) . '.txt';
    if (file_exists($file)) {
        $last = (int) file_get_contents($file);
        if (time() - $last < RATE_LIMIT_SEC) {
            json_out(['error' => 'Please wait a moment before submitting again.'], 429);
        }
    }
    @file_put_contents($file, (string) time());
}

function load_store(string $file): array {
    $path = DATA_DIR . '/' . $file;
    if (!file_exists($path)) return [];
    $fp = @fopen($path, 'r');
    if (!$fp) return [];
    @flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    @flock($fp, LOCK_UN);
    @fclose($fp);
    $arr = json_decode($raw, true);
    return is_array($arr) ? $arr : [];
}

function save_store(string $file, array $data): bool {
    $path = DATA_DIR . '/' . $file;
    $fp = @fopen($path, 'c+');
    if (!$fp) return false;
    @flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    @flock($fp, LOCK_UN);
    @fclose($fp);
    @chmod($path, 0664);
    return true;
}

function require_admin(): void {
    $k = $_GET['k'] ?? $_POST['k'] ?? '';
    if (!hash_equals(ADMIN_KEY, $k)) {
        json_out(['error' => 'forbidden'], 403);
    }
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

function cors_preflight(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
