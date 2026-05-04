<?php
// Generate OG image for Atta Panin Memorial
// Run once: php og-generate.php

$width = 1200;
$height = 630;

$img = imagecreatetruecolor($width, $height);

// Colors
$purpleDeep = imagecolorallocate($img, 26, 10, 46);    // #1A0A2E
$purpleDark = imagecolorallocate($img, 45, 27, 78);     // #2D1B4E
$purpleMed  = imagecolorallocate($img, 74, 50, 104);    // #4A3268
$gold       = imagecolorallocate($img, 201, 162, 39);    // #C9A227
$goldLight  = imagecolorallocate($img, 232, 212, 138);   // #E8D48A
$white      = imagecolorallocate($img, 255, 255, 255);
$cream      = imagecolorallocate($img, 245, 240, 230);
$whiteAlpha = imagecolorallocatealpha($img, 255, 255, 255, 100);

// Fill background with deep purple gradient (simulate)
imagefill($img, 0, 0, $purpleDeep);

// Draw gradient bands
for ($y = 0; $y < $height; $y++) {
    $ratio = $y / $height;
    $r = (int)(26 + (45 - 26) * $ratio);
    $g = (int)(10 + (27 - 10) * $ratio);
    $b = (int)(46 + (78 - 46) * $ratio);
    $lineColor = imagecolorallocate($img, $r, $g, $b);
    imageline($img, 0, $y, $width, $y, $lineColor);
}

// Gold decorative lines
imagesetthickness($img, 3);
imageline($img, 40, 40, $width - 40, 40, $gold);       // Top
imageline($img, 40, $height - 40, $width - 40, $height - 40, $gold); // Bottom
imageline($img, 40, 40, 40, $height - 40, $gold);       // Left
imageline($img, $width - 40, 40, $width - 40, $height - 40, $gold); // Right
imagesetthickness($img, 1);

// Inner decorative lines
imageline($img, 55, 55, $width - 55, 55, $goldLight);
imageline($img, 55, $height - 55, $width - 55, $height - 55, $goldLight);

// Load photo
$photoPath = __DIR__ . '/photo.jpg';
if (file_exists($photoPath)) {
    $photo = imagecreatefromjpeg($photoPath);
    if ($photo) {
        $pw = imagesx($photo);
        $ph = imagesy($photo);

        // Place photo on right side, circular-ish crop
        $photoSize = 300;
        $photoX = $width - 380;
        $photoY = ($height - $photoSize) / 2;

        // Draw gold circle background
        imagefilledellipse($img, $photoX + $photoSize/2, $photoY + $photoSize/2, $photoSize + 16, $photoSize + 16, $gold);

        // Create circular mask
        $mask = imagecreatetruecolor($photoSize, $photoSize);
        $maskBg = imagecolorallocate($mask, 0, 0, 0);
        imagefill($mask, 0, 0, $maskBg);
        $maskWhite = imagecolorallocate($mask, 255, 255, 255);
        imagefilledellipse($mask, $photoSize/2, $photoSize/2, $photoSize, $photoSize, $maskWhite);

        // Resize photo
        $resized = imagecreatetruecolor($photoSize, $photoSize);
        // Crop to square from center
        $cropSize = min($pw, $ph);
        $cropX = ($pw - $cropSize) / 2;
        $cropY = 0; // Crop from top for portrait photos
        imagecopyresampled($resized, $photo, 0, 0, $cropX, $cropY, $photoSize, $photoSize, $cropSize, $cropSize);

        // Apply circular mask
        for ($x = 0; $x < $photoSize; $x++) {
            for ($y = 0; $y < $photoSize; $y++) {
                $maskPixel = imagecolorat($mask, $x, $y);
                if ($maskPixel == $maskBg) {
                    // Outside circle - make transparent/background
                } else {
                    $pixel = imagecolorat($resized, $x, $y);
                    $pr = ($pixel >> 16) & 0xFF;
                    $pg = ($pixel >> 8) & 0xFF;
                    $pb = $pixel & 0xFF;
                    $c = imagecolorallocate($img, $pr, $pg, $pb);
                    imagesetpixel($img, $photoX + $x, $photoY + $y, $c);
                }
            }
        }

        imagedestroy($photo);
        imagedestroy($mask);
        imagedestroy($resized);
    }
}

// Text - try TTF first, fallback to built-in
$fontFile = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
$fontRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
$fontSerif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf';
$fontSerifRegular = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf';

$textAreaWidth = $width - 450; // Left text area

if (file_exists($fontFile)) {
    // "In Loving Memory of" - small gold text
    imagettftext($img, 16, 0, 80, 140, $goldLight, $fontRegular, "In Loving Memory of");

    // Name - large white
    imagettftext($img, 34, 0, 80, 195, $white, $fontFile, "MR. WILSON ATTA");
    imagettftext($img, 34, 0, 80, 240, $white, $fontFile, "KROFAH");

    // Alias - gold
    imagettftext($img, 22, 0, 80, 290, $gold, $fontSerif ?: $fontFile, "(Atta Panin)");

    // Title - cream
    imagettftext($img, 14, 0, 80, 330, $cream, $fontRegular, "Begoro Bretuo Abusuapanin");

    // Years - gold light
    imagettftext($img, 28, 0, 80, 385, $goldLight, $fontFile, "1939  -  2026");

    // Gold separator line
    imagesetthickness($img, 2);
    imageline($img, 80, 410, 400, 410, $gold);
    imagesetthickness($img, 1);

    // Quote
    imagettftext($img, 12, 0, 80, 450, $cream, $fontSerifRegular ?: $fontRegular, '"Blessed are the dead who die in the Lord"');
    imagettftext($img, 11, 0, 80, 475, $goldLight, $fontRegular, "Revelation 14:13");

    // Footer - small text
    imagettftext($img, 11, 0, 80, 555, $goldLight, $fontRegular, "Leave a tribute  |  View gallery  |  Support the family");
    imagettftext($img, 10, 0, 80, 580, $cream, $fontRegular, "attapanin.vibelinkevent.com");
} else {
    // Fallback with built-in fonts
    imagestring($img, 5, 80, 130, "In Loving Memory of", $goldLight);
    imagestring($img, 5, 80, 170, "MR. WILSON ATTA KROFAH", $white);
    imagestring($img, 5, 80, 200, "(Atta Panin)", $gold);
    imagestring($img, 4, 80, 240, "Begoro Bretuo Abusuapanin", $cream);
    imagestring($img, 5, 80, 280, "1939 - 2026", $goldLight);
    imagestring($img, 3, 80, 340, "Leave a tribute | View gallery | Support the family", $cream);
    imagestring($img, 3, 80, 370, "attapanin.vibelinkevent.com", $goldLight);
}

// Save
imagejpeg($img, __DIR__ . '/og-image.jpg', 92);
imagedestroy($img);

echo "OG image generated successfully!\n";
