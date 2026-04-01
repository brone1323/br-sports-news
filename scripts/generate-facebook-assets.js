#!/usr/bin/env node
/**
 * Generates Facebook profile pictures (360x360) and cover photos (820x312)
 * for all 125 BR Sports News teams (NFL, NBA, MLB, NHL).
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const teams = require('../src/data/teams.json');

/** Parse a hex color into {r,g,b} */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Build a CSS rgba string */
function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Decide whether to use white or a dark overlay text on a given background.
 * Returns true if the background is dark (use white text).
 */
function isDark(hex) {
  const { r, g, b } = hexToRgb(hex);
  // perceived luminance
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 140;
}

/** Wrap text to fit within maxWidth, returning array of lines */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PICTURE  360 × 360
// ─────────────────────────────────────────────────────────────────────────────
function generateProfile(team) {
  const W = 360, H = 360;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const primary = team.primaryColor;
  const secondary = team.secondaryColor;
  const textColor = isDark(primary) ? '#FFFFFF' : '#111111';
  const accentText = isDark(primary) ? rgba(secondary, 0.9) : rgba(secondary, 0.85);

  // ── Background: solid primary with a subtle radial glow ──
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, H);

  // Radial highlight from center
  const glow = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
  glow.addColorStop(0, rgba(secondary, 0.25));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative ring ──
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 152, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(textColor === '#FFFFFF' ? '#FFFFFF' : '#000000', 0.15);
  ctx.lineWidth = 3;
  ctx.stroke();

  // ── "BR" monogram ──
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 110px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(textColor, 0.12);
  ctx.fillText('BR', W / 2, H / 2 - 18);

  // ── "BRAGGING RIGHTS" label ──
  ctx.font = `bold 22px Arial, Helvetica, sans-serif`;
  ctx.letterSpacing = '3px';
  ctx.fillStyle = textColor;
  ctx.fillText('BRAGGING RIGHTS', W / 2, H / 2 - 22);

  // Divider bar
  const barW = 200, barH = 3;
  ctx.fillStyle = rgba(secondary, 0.8);
  ctx.fillRect((W - barW) / 2, H / 2 - 2, barW, barH);

  // ── League badge ──
  ctx.font = `bold 13px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(secondary, 0.9);
  ctx.fillText(team.league, W / 2, H / 2 + 15);

  // ── Team name (city + short name) ──
  const teamLabel = `${team.city} ${team.shortName}`.toUpperCase();
  ctx.font = `bold 28px Arial, Helvetica, sans-serif`;
  const lines = wrapText(ctx, teamLabel, 300);
  const lineH = 34;
  const startY = H / 2 + 52 - ((lines.length - 1) * lineH) / 2;
  ctx.fillStyle = textColor;
  lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineH));

  // ── Corner accent dots ──
  [
    [18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = rgba(secondary, 0.6);
    ctx.fill();
  });

  return canvas.toBuffer('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PHOTO  820 × 312
// ─────────────────────────────────────────────────────────────────────────────
function generateCover(team) {
  const W = 820, H = 312;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const primary = team.primaryColor;
  const secondary = team.secondaryColor;
  const textColor = isDark(primary) ? '#FFFFFF' : '#111111';

  // ── Background gradient: primary → secondary ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, primary);
  bg.addColorStop(0.65, primary);
  bg.addColorStop(1, secondary);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Diagonal dark overlay on right side for contrast
  const darkOverlay = ctx.createLinearGradient(W * 0.5, 0, W, 0);
  darkOverlay.addColorStop(0, 'rgba(0,0,0,0)');
  darkOverlay.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = darkOverlay;
  ctx.fillRect(0, 0, W, H);

  // Subtle top vignette
  const topVignette = ctx.createLinearGradient(0, 0, 0, H);
  topVignette.addColorStop(0, 'rgba(0,0,0,0.18)');
  topVignette.addColorStop(0.4, 'rgba(0,0,0,0)');
  topVignette.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = topVignette;
  ctx.fillRect(0, 0, W, H);

  // ── Vertical accent stripe ──
  const stripeX = 230;
  ctx.fillStyle = rgba(secondary, 0.35);
  ctx.fillRect(stripeX, 0, 4, H);

  // ── Large "BR" watermark ──
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.font = `bold 280px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('BR', W * 0.72, H / 2);
  ctx.restore();

  // ── Left panel: branding ──
  const leftCX = stripeX / 2;  // center of left panel

  // "BR" emblem circle
  ctx.beginPath();
  ctx.arc(leftCX, H / 2 - 20, 48, 0, Math.PI * 2);
  ctx.fillStyle = rgba(secondary, 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(leftCX, H / 2 - 20, 48, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(secondary, 0.7);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 36px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.fillText('BR', leftCX, H / 2 - 20);

  // "BRAGGING RIGHTS" below emblem
  ctx.font = `bold 11px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(textColor, 0.85);
  ctx.fillText('BRAGGING RIGHTS', leftCX, H / 2 + 46);

  // ── Right panel: team info ──
  const rightX = stripeX + 30;
  const rightW = W - rightX - 30;
  const centerX = rightX + rightW / 2;

  // League pill
  const pillW = 80, pillH = 24, pillR = 12;
  const pillX = rightX + 10;
  const pillY = 38;
  ctx.beginPath();
  ctx.moveTo(pillX + pillR, pillY);
  ctx.lineTo(pillX + pillW - pillR, pillY);
  ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR);
  ctx.lineTo(pillX + pillW, pillY + pillH - pillR);
  ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH);
  ctx.lineTo(pillX + pillR, pillY + pillH);
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR);
  ctx.lineTo(pillX, pillY + pillR);
  ctx.quadraticCurveTo(pillX, pillY, pillX + pillR, pillY);
  ctx.closePath();
  ctx.fillStyle = rgba(secondary, 0.85);
  ctx.fill();

  ctx.font = `bold 12px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isDark(team.secondaryColor) ? '#FFFFFF' : '#111111';
  ctx.fillText(team.league, pillX + pillW / 2, pillY + pillH / 2);

  // City name
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `500 30px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(textColor, 0.80);
  ctx.fillText(team.city.toUpperCase(), rightX + 10, 108);

  // Team name (large)
  const teamName = team.shortName.toUpperCase();
  ctx.font = `bold 68px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = textColor;
  // Scale font if too wide
  let fontSize = 68;
  while (ctx.measureText(teamName).width > rightW - 20 && fontSize > 28) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
  }
  ctx.fillText(teamName, rightX + 10, 182);

  // Divider
  ctx.fillStyle = rgba(secondary, 0.8);
  ctx.fillRect(rightX + 10, 192, Math.min(rightW - 20, 300), 3);

  // Tagline
  ctx.font = `16px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(textColor, 0.75);
  ctx.fillText('Your daily fan polls & debates', rightX + 10, 222);

  // URL watermark bottom-right
  ctx.textAlign = 'right';
  ctx.font = `12px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = rgba(textColor, 0.40);
  ctx.fillText('brsportsnews.com', W - 20, H - 16);

  return canvas.toBuffer('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const targetTeams = teams;

const outBase = path.join(__dirname, '..', 'public', 'facebook-assets');
let generated = 0;

for (const team of targetTeams) {
  const dir = path.join(outBase, team.slug);
  fs.mkdirSync(dir, { recursive: true });

  const profileBuf = generateProfile(team);
  fs.writeFileSync(path.join(dir, 'profile.png'), profileBuf);

  const coverBuf = generateCover(team);
  fs.writeFileSync(path.join(dir, 'cover.png'), coverBuf);

  generated++;
  process.stdout.write(`[${generated}/${targetTeams.length}] ${team.name} ✓\n`);
}

console.log(`\nDone! Generated ${generated * 2} images in public/facebook-assets/`);
