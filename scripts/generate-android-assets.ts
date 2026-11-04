import fs from "fs";
import path from "path";
import sharp from "sharp";

async function generateAssets() {
  const root = process.cwd();
  const logoFull = path.join(root, "public", "assets", "logo", "logo-full.png");
  const logoIcon = path.join(root, "public", "assets", "logo", "logo-icon.png");

  console.log("Reading source logos...");
  console.log("Full logo:", logoFull);
  console.log("Icon logo:", logoIcon);

  if (!fs.existsSync(logoFull) || !fs.existsSync(logoIcon)) {
    throw new Error("Source logo files missing in public/assets/logo/");
  }

  const resDir = path.join(root, "mobile", "android", "app", "src", "main", "res");

  // ==========================================
  // 1. ANDROID LAUNCHER ICONS (MIPMAP)
  // ==========================================
  console.log("\n--- Generating Launcher Icons ---");

  // Adaptive Icon Foreground (108dp base, safe area is inner 72dp = 66.6% scale)
  const foregroundSizes = [
    { dir: "mipmap-mdpi", size: 108, iconSize: 72 },
    { dir: "mipmap-hdpi", size: 162, iconSize: 108 },
    { dir: "mipmap-xhdpi", size: 216, iconSize: 144 },
    { dir: "mipmap-xxhdpi", size: 324, iconSize: 216 },
    { dir: "mipmap-xxxhdpi", size: 432, iconSize: 288 },
  ];

  for (const { dir, size, iconSize } of foregroundSizes) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1a. Adaptive Foreground: transparent background with official logo emblem centered in safe zone
    const iconResized = await sharp(logoIcon)
      .resize(iconSize, iconSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const top = Math.round((size - iconSize) / 2);
    const left = Math.round((size - iconSize) / 2);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: iconResized, top, left }])
      .png()
      .toFile(path.join(targetDir, "ic_launcher_foreground.png"));

    console.log(`Created ${dir}/ic_launcher_foreground.png (${size}x${size})`);
  }

  // Legacy Square Icons (ic_launcher.png) & Round Icons (ic_launcher_round.png)
  const legacySizes = [
    { dir: "mipmap-mdpi", size: 48, iconSize: 36, cornerRadius: 8 },
    { dir: "mipmap-hdpi", size: 72, iconSize: 54, cornerRadius: 12 },
    { dir: "mipmap-xhdpi", size: 96, iconSize: 72, cornerRadius: 16 },
    { dir: "mipmap-xxhdpi", size: 144, iconSize: 108, cornerRadius: 24 },
    { dir: "mipmap-xxxhdpi", size: 192, iconSize: 144, cornerRadius: 32 },
  ];

  for (const { dir, size, iconSize, cornerRadius } of legacySizes) {
    const targetDir = path.join(resDir, dir);

    // Resize emblem
    const iconResized = await sharp(logoIcon)
      .resize(iconSize, iconSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    const top = Math.round((size - iconSize) / 2);
    const left = Math.round((size - iconSize) / 2);

    // Square with rounded corners (SVG mask)
    const squareSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/></svg>`
    );
    const squareBg = await sharp(squareSvg).png().toBuffer();

    await sharp(squareBg)
      .composite([{ input: iconResized, top, left }])
      .png()
      .toFile(path.join(targetDir, "ic_launcher.png"));

    // Round icon (circle mask)
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#ffffff"/></svg>`
    );
    const circleBg = await sharp(circleSvg).png().toBuffer();

    await sharp(circleBg)
      .composite([{ input: iconResized, top, left }])
      .png()
      .toFile(path.join(targetDir, "ic_launcher_round.png"));

    console.log(`Created ${dir}/ic_launcher.png and ic_launcher_round.png (${size}x${size})`);
  }

  // ==========================================
  // 2. SPLASH SCREENS (DRAWABLE)
  // ==========================================
  console.log("\n--- Generating Splash Screens ---");

  // Root drawable/splash.png
  const rootSplashSize = 480;
  const rootLogoSize = 240;
  const rootLogoResized = await sharp(logoFull)
    .resize(rootLogoSize, rootLogoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: rootSplashSize,
      height: rootSplashSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: rootLogoResized,
        top: Math.round((rootSplashSize - rootLogoSize) / 2),
        left: Math.round((rootSplashSize - rootLogoSize) / 2),
      },
    ])
    .png()
    .toFile(path.join(resDir, "drawable", "splash.png"));
  console.log("Created drawable/splash.png (480x480)");

  // Portrait Splash Screens
  const portraitSizes = [
    { dir: "drawable-port-mdpi", w: 320, h: 480, logoW: 180 },
    { dir: "drawable-port-hdpi", w: 480, h: 800, logoW: 260 },
    { dir: "drawable-port-xhdpi", w: 720, h: 1280, logoW: 380 },
    { dir: "drawable-port-xxhdpi", w: 960, h: 1600, logoW: 500 },
    { dir: "drawable-port-xxxhdpi", w: 1280, h: 1920, logoW: 640 },
  ];

  for (const { dir, w, h, logoW } of portraitSizes) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo ratio: 561 x 450 -> height = Math.round(logoW * 450 / 561)
    const logoH = Math.round((logoW * 450) / 561);
    const logoResized = await sharp(logoFull)
      .resize(logoW, logoH, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    const top = Math.round((h - logoH) / 2);
    const left = Math.round((w - logoW) / 2);

    await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoResized, top, left }])
      .png()
      .toFile(path.join(targetDir, "splash.png"));

    console.log(`Created ${dir}/splash.png (${w}x${h})`);
  }

  // Landscape Splash Screens
  const landscapeSizes = [
    { dir: "drawable-land-mdpi", w: 480, h: 320, logoH: 150 },
    { dir: "drawable-land-hdpi", w: 800, h: 480, logoH: 220 },
    { dir: "drawable-land-xhdpi", w: 1280, h: 720, logoH: 320 },
    { dir: "drawable-land-xxhdpi", w: 1600, h: 960, logoH: 420 },
    { dir: "drawable-land-xxxhdpi", w: 1920, h: 1280, logoH: 540 },
  ];

  for (const { dir, w, h, logoH } of landscapeSizes) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const logoW = Math.round((logoH * 561) / 450);
    const logoResized = await sharp(logoFull)
      .resize(logoW, logoH, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    const top = Math.round((h - logoH) / 2);
    const left = Math.round((w - logoW) / 2);

    await sharp({
      create: {
        width: w,
        height: h,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoResized, top, left }])
      .png()
      .toFile(path.join(targetDir, "splash.png"));

    console.log(`Created ${dir}/splash.png (${w}x${h})`);
  }

  // Also copy official logo-icon.png to mobile/dist/assets/logo.png for the offline fallback shell
  const mobileDistAssets = path.join(root, "mobile", "dist", "assets");
  if (!fs.existsSync(mobileDistAssets)) fs.mkdirSync(mobileDistAssets, { recursive: true });
  fs.copyFileSync(logoFull, path.join(mobileDistAssets, "logo-full.png"));
  fs.copyFileSync(logoIcon, path.join(mobileDistAssets, "logo-icon.png"));
  console.log("Copied official logos to mobile/dist/assets/");

  console.log("\nAll Android branding assets successfully generated!");
}

generateAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
