const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const origin = 'https://jefekitchen.github.io';
const filter = process.argv[2] || '';
const markerStart = '<!-- Link preview -->';
const markerEnd = '<!-- /Link preview -->';

function menuFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return menuFiles(file);
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const recipeMenu = /-menu\.html$/.test(entry.name);
    const pollMenu = relative.startsWith('docs/poll/') && relative.includes('-menus/') && entry.name.endsWith('.html');
    return recipeMenu || pollMenu ? [file] : [];
  });
}

function escapeAttribute(value) {
  return String(value).replace(/[&"<>]/g, char => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]);
}

function updateMetadata(file, title, description, imageUrl) {
  const pageUrl = origin + '/' + path.relative(root, file).replaceAll(path.sep, '/');
  const tags = [
    markerStart,
    '<meta name="description" content="' + escapeAttribute(description) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="' + escapeAttribute(title) + '">',
    '<meta property="og:description" content="' + escapeAttribute(description) + '">',
    '<meta property="og:url" content="' + pageUrl + '">',
    '<meta property="og:image" content="' + imageUrl + '">',
    '<meta property="og:image:alt" content="Preview of the ' + escapeAttribute(title) + ' menu">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:image" content="' + imageUrl + '">',
    markerEnd
  ].join('\n');
  const html = fs.readFileSync(file, 'utf8');
  const existing = html.indexOf(markerStart);
  const next = existing >= 0
    ? html.slice(0, existing) + tags + html.slice(html.indexOf(markerEnd, existing) + markerEnd.length)
    : html.replace(/(<title>[\s\S]*?<\/title>)/, '$1\n' + tags);
  if (next === html || !next.includes(markerStart)) {
    if (!next.includes(markerStart)) throw new Error('No title found in ' + file);
    return;
  }
  fs.writeFileSync(file, next);
}

async function main() {
  const files = menuFiles(path.join(root, 'docs')).filter(file => file.includes(filter)).sort();
  if (!files.length) throw new Error('No menu pages matched ' + filter);

  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end();
      return;
    }
    const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' }[path.extname(file)] || 'application/octet-stream';
    response.setHeader('Content-Type', type);
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    for (const file of files) {
      const page = await context.newPage();
      const relative = path.relative(root, file).replaceAll(path.sep, '/');
      await page.goto('http://127.0.0.1:' + server.address().port + '/' + relative, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const card = page.locator('.page').first();
      if (await card.count() !== 1) throw new Error('Expected one menu card in ' + relative);
      const heading = card.locator('.header .title, .header .menu-title').first();
      const title = (await heading.count() ? await heading.innerText() : await page.title()).replace(/\s+/g, ' ').trim();
      const subtitle = card.locator('.header .sub').first();
      const description = (await subtitle.count() ? await subtitle.innerText() : title).replace(/\s+/g, ' ').trim();
      const imageName = relative.startsWith('docs/poll/') ? path.basename(file, '.html') + '-preview.jpg' : 'share-preview.jpg';
      const imageFile = path.join(path.dirname(file), imageName);
      await card.screenshot({ path: imageFile, type: 'jpeg', quality: 85 });
      const imageUrl = origin + '/' + path.relative(root, imageFile).replaceAll(path.sep, '/');
      updateMetadata(file, title, description, imageUrl);
      console.log(relative + ' -> ' + path.relative(root, imageFile));
      await page.close();
    }
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
