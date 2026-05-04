<?php
/**
 * Baby Nortey Naming Ceremony - OG Image Generator
 * Generates a 1200x630 PNG for social media sharing
 */

// Cache the image - regenerate only when needed
$cacheFile = __DIR__ . '/og-image.png';
if (file_exists($cacheFile) && filemtime($cacheFile) > time() - 86400) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cacheFile);
    exit;
}

$w = 1200;
$h = 630;
$img = imagecreatetruecolor($w, $h);
imagealphablending($img, true);
imagesavealpha($img, true);

// ── Colors ───────────────────────────────────────────────────────────
$cream      = imagecolorallocate($img, 255, 249, 242);
$peachLight = imagecolorallocate($img, 253, 235, 211);
$blush      = imagecolorallocate($img, 248, 215, 218);
$peach      = imagecolorallocate($img, 232, 149, 106);
$peachSoft  = imagecolorallocate($img, 245, 198, 160);
$gold       = imagecolorallocate($img, 201, 162, 39);
$goldLight  = imagecolorallocate($img, 244, 228, 188);
$brown      = imagecolorallocate($img, 139, 111, 94);
$brownLight = imagecolorallocate($img, 184, 160, 144);
$pink       = imagecolorallocate($img, 242, 181, 192);
$pinkDark   = imagecolorallocate($img, 232, 143, 160);
$white      = imagecolorallocate($img, 255, 255, 255);
$sageLight  = imagecolorallocate($img, 212, 231, 207);

// ── Background gradient (cream → peach-light → blush) ────────────────
for ($y = 0; $y < $h; $y++) {
    $ratio = $y / $h;
    if ($ratio < 0.5) {
        $r2 = $ratio * 2;
        $r = (int)(255 + (253 - 255) * $r2);
        $g = (int)(249 + (235 - 249) * $r2);
        $b = (int)(242 + (211 - 242) * $r2);
    } else {
        $r2 = ($ratio - 0.5) * 2;
        $r = (int)(253 + (248 - 253) * $r2);
        $g = (int)(235 + (215 - 235) * $r2);
        $b = (int)(211 + (218 - 211) * $r2);
    }
    $lineColor = imagecolorallocate($img, $r, $g, $b);
    imageline($img, 0, $y, $w, $y, $lineColor);
}

// ── Decorative circles (watercolor blobs) ────────────────────────────
// Top-left blob
for ($i = 120; $i > 0; $i--) {
    $alpha = (int)(100 - ($i / 120) * 70);
    $c = imagecolorallocatealpha($img, 242, 181, 192, $alpha);
    imagefilledellipse($img, 80, 80, $i * 3, $i * 3, $c);
}

// Bottom-right blob
for ($i = 100; $i > 0; $i--) {
    $alpha = (int)(100 - ($i / 100) * 65);
    $c = imagecolorallocatealpha($img, 245, 198, 160, $alpha);
    imagefilledellipse($img, $w - 100, $h - 80, $i * 3, $i * 2.5, $c);
}

// Top-right blob
for ($i = 80; $i > 0; $i--) {
    $alpha = (int)(105 - ($i / 80) * 60);
    $c = imagecolorallocatealpha($img, 212, 231, 207, $alpha);
    imagefilledellipse($img, $w - 150, 100, $i * 2.5, $i * 2, $c);
}

// ── Decorative dots (petals) ─────────────────────────────────────────
$petalColors = [$pink, $peachSoft, $blush, $sageLight, $goldLight];
for ($i = 0; $i < 30; $i++) {
    $px = rand(50, $w - 50);
    $py = rand(30, $h - 30);
    $ps = rand(3, 8);
    $pc = $petalColors[array_rand($petalColors)];
    $pa = imagecolorallocatealpha($img,
        (imagecolorsforindex($img, $pc))['red'],
        (imagecolorsforindex($img, $pc))['green'],
        (imagecolorsforindex($img, $pc))['blue'],
        rand(80, 110)
    );
    imagefilledellipse($img, $px, $py, $ps, $ps, $pa);
}

// ── Gold border frame ────────────────────────────────────────────────
$borderAlpha = imagecolorallocatealpha($img, 201, 162, 39, 90);
imagerectangle($img, 30, 25, $w - 30, $h - 25, $borderAlpha);
imagerectangle($img, 34, 29, $w - 34, $h - 29, $borderAlpha);

// Corner flourishes (small circles at corners)
$cornerR = 8;
$corners = [[40, 35], [$w - 40, 35], [40, $h - 35], [$w - 40, $h - 35]];
foreach ($corners as $c) {
    imagefilledellipse($img, $c[0], $c[1], $cornerR * 2, $cornerR * 2, $gold);
}

// ── Center decorative line ───────────────────────────────────────────
$lineY = 200;
$lineW = 120;
$lineX = ($w - $lineW) / 2;
for ($i = 0; $i < $lineW; $i++) {
    $ratio = $i / $lineW;
    $alpha = (int)(40 + 80 * sin($ratio * M_PI));
    $lc = imagecolorallocatealpha($img, 201, 162, 39, 127 - $alpha);
    imageline($img, (int)($lineX + $i), $lineY, (int)($lineX + $i), $lineY + 2, $lc);
}

// ── Flower icon (asterisk shape) ─────────────────────────────────────
$cx = $w / 2;
$cy = 130;
$flowerR = 18;
for ($a = 0; $a < 360; $a += 45) {
    $rad = deg2rad($a);
    $fx = $cx + cos($rad) * $flowerR;
    $fy = $cy + sin($rad) * $flowerR;
    imagefilledellipse($img, (int)$fx, (int)$fy, 12, 12, $gold);
}
imagefilledellipse($img, (int)$cx, (int)$cy, 14, 14, $peach);

// ── Text ─────────────────────────────────────────────────────────────
// Try to use custom fonts, fallback to built-in
$fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
$fontRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
$hasFonts = file_exists($fontBold);

if ($hasFonts) {
    // "Michael and Sarah Nortey"
    $text = "Michael and Sarah Nortey";
    $bbox = imagettfbbox(14, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 14, 0, (int)$tx, 240, $brownLight, $fontRegular, $text);

    // "warmly invite you to the"
    $text = "warmly invite you to the";
    $bbox = imagettfbbox(13, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 13, 0, (int)$tx, 270, $brownLight, $fontRegular, $text);

    // "Naming Ceremony"
    $text = "Naming Ceremony";
    $bbox = imagettfbbox(42, 0, $fontBold, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 42, 0, (int)$tx, 340, $peach, $fontBold, $text);

    // "of their beloved baby girl"
    $text = "of their beloved baby girl";
    $bbox = imagettfbbox(16, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 16, 0, (int)$tx, 380, $brownLight, $fontRegular, $text);

    // Decorative line under title
    $lineY2 = 400;
    imageline($img, $w/2 - 60, $lineY2, $w/2 + 60, $lineY2, $gold);
    imageline($img, $w/2 - 60, $lineY2+1, $w/2 + 60, $lineY2+1, $gold);

    // Date
    $text = "Friday, 6th March 2026";
    $bbox = imagettfbbox(18, 0, $fontBold, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 18, 0, (int)$tx, 445, $peach, $fontBold, $text);

    // Time
    $text = "8:00 AM GMT";
    $bbox = imagettfbbox(14, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 14, 0, (int)$tx, 475, $brown, $fontRegular, $text);

    // Venue
    $text = "Madina, New Road Estate, Accra";
    $bbox = imagettfbbox(14, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 14, 0, (int)$tx, 505, $brownLight, $fontRegular, $text);

    // "A Celebration of New Life & Blessings"
    $text = "A Celebration of New Life & Blessings";
    $bbox = imagettfbbox(12, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    imagettftext($img, 12, 0, (int)$tx, 555, $pinkDark, $fontRegular, $text);

    // Powered by
    $text = "vibelinkevent.com";
    $bbox = imagettfbbox(10, 0, $fontRegular, $text);
    $tx = ($w - ($bbox[2] - $bbox[0])) / 2;
    $poweredAlpha = imagecolorallocatealpha($img, 184, 160, 144, 60);
    imagettftext($img, 10, 0, (int)$tx, $h - 40, $poweredAlpha, $fontRegular, $text);
} else {
    // Fallback with built-in fonts
    $text = "Michael and Sarah Nortey";
    $tx = ($w - strlen($text) * imagefontwidth(4)) / 2;
    imagestring($img, 4, (int)$tx, 230, $text, $brownLight);

    $text = "warmly invite you to the";
    $tx = ($w - strlen($text) * imagefontwidth(3)) / 2;
    imagestring($img, 3, (int)$tx, 260, $text, $brownLight);

    $text = "NAMING CEREMONY";
    $tx = ($w - strlen($text) * imagefontwidth(5)) / 2;
    imagestring($img, 5, (int)$tx, 310, $text, $peach);

    $text = "of their beloved baby girl";
    $tx = ($w - strlen($text) * imagefontwidth(4)) / 2;
    imagestring($img, 4, (int)$tx, 350, $text, $brownLight);

    $text = "Friday, 6th March 2026 | 8:00 AM GMT";
    $tx = ($w - strlen($text) * imagefontwidth(4)) / 2;
    imagestring($img, 4, (int)$tx, 410, $text, $peach);

    $text = "Madina, New Road Estate, Accra";
    $tx = ($w - strlen($text) * imagefontwidth(3)) / 2;
    imagestring($img, 3, (int)$tx, 450, $text, $brownLight);
}

// ── Output ───────────────────────────────────────────────────────────
imagepng($img, $cacheFile, 6);
imagedestroy($img);

header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
readfile($cacheFile);
