// Render a hand-drawn canvas film to PNG frames, an mp4 and a contact sheet.
//
// The HTML file must expose window.__drawFrame(i) and window.__NDRAW and accept
// ?bare=1 (UI hidden, canvas exactly 1080x1080 CSS px). assets/starter.html does.
//
// Usage:
//   node render.mjs film.html                 all drawn frames -> mp4 + contact sheet
//   node render.mjs film.html --only 0,24,47  just these frames, PNG only (spot check)
//   node render.mjs film.html --out renders   output dir (default: <html dir>/out)
//
// Env: CHROME=/path/to/chrome (default: macOS Google Chrome, then chrome/chromium on PATH)
// Needs: puppeteer-core next to this script (npm i), ffmpeg on PATH for the full render.
import puppeteer from 'puppeteer-core';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const argv = process.argv.slice(2);
const file = argv.find(a => a.endsWith('.html'));
if (!file) { console.error('usage: node render.mjs film.html [--only 0,12,24] [--out dir]'); process.exit(2); }
const flag = name => { const k = argv.indexOf(name); return k >= 0 ? argv[k + 1] : undefined; };
const only = flag('--only')?.split(',').map(Number).filter(Number.isFinite);
const name = path.basename(file, '.html');
const outDir = path.resolve(flag('--out') || path.join(path.dirname(file), 'out'));
const frames = path.join(outDir, `${name}-frames`);
mkdirSync(frames, {recursive: true});

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(mac)) return mac;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [bin]).toString().trim(); } catch {}
  }
  throw new Error('No Chrome found. Set CHROME=/path/to/chrome');
}

const url = pathToFileURL(path.resolve(file)).href + '?bare=1&frame=0';
const browser = await puppeteer.launch({executablePath: findChrome(), headless: true, args: ['--force-device-scale-factor=1']});
const errors = [];
let total = 0;
try {
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewport({width: 1080, height: 1080, deviceScaleFactor: 1});
  await page.goto(url, {waitUntil: 'load'});
  const N = await page.evaluate(() => window.__NDRAW);
  if (!Number.isInteger(N) || N <= 0) throw new Error('window.__NDRAW missing: the page did not load or is not built on starter.html');
  total = N;
  const list = only ? only.filter(i => i >= 0 && i < N) : [...Array(N).keys()];
  const t0 = Date.now();
  let done = 0;
  for (const [k, i] of list.entries()) {
    try {
      await page.evaluate(i => window.__drawFrame(i), i);
    } catch (e) {
      errors.push(`drawn frame ${i} (t=${(i / 12).toFixed(2)} s): ${String(e.message || e).split('\n')[0]}`);
      continue;
    }
    await page.screenshot({path: path.join(frames, `${String(i).padStart(4, '0')}.png`), clip: {x: 0, y: 0, width: 1080, height: 1080}});
    done++;
    process.stdout.write(`\rframe ${k + 1}/${list.length}`);
  }
  console.log(`\nrendered ${done} of ${list.length} requested (${N} drawn frames in the film) in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${frames}`);
} finally {
  await browser.close();
}
if (errors.length) {
  console.error('page errors (no mp4 built):\n  ' + [...new Set(errors)].join('\n  '));
  process.exit(1);
}
if (only) process.exit();

const ff = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], {stdio: 'inherit'});
const mp4 = path.join(outDir, `${name}.mp4`), sheet = path.join(outDir, `${name}-contact.jpg`);
// drawn at 12 fps, duplicated to 24 fps: the "on twos" cadence
ff(['-framerate', '12', '-i', path.join(frames, '%04d.png'), '-r', '24', '-pix_fmt', 'yuv420p', '-crf', '18', mp4]);
// two tiles per second of film (every 6th drawn frame = every 12th output frame), 6 across
const rows = Math.ceil(total / 6 / 6);
ff(['-i', mp4, '-vf', `select=not(mod(n\\,12)),scale=240:-1,tile=6x${rows}`, '-frames:v', '1', sheet]);
console.log(`mp4: ${mp4}\ncontact sheet: ${sheet}`);
