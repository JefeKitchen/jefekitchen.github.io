const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const invalidPill = /^(?:juice|ice|per side|pieces|sheet pan|baking dish|knife|cutting board|fried rice|sauce|glaze)$/i;

function instructionPages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return instructionPages(file);
    if (!entry.name.endsWith('.html')) return [];
    return fs.readFileSync(file, 'utf8').includes('instruction-renderer.js') ? [file] : [];
  });
}

async function main() {
  const files = instructionPages(path.join(root, 'docs')).sort();
  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({
    headless: true,
    ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {})
  });
  let cards = 0;
  try {
    for (const file of files) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
        const rows = await page.locator('.section-card, .cook-block').evaluateAll(elements => elements.map(card => ({
          title: card.querySelector('h2, h3')?.textContent.trim(),
          pills: Array.from(card.querySelectorAll('.pill, .ingredient-pill'), pill => pill.textContent.trim())
        })));
        assert.ok(rows.length, `${file}: no instruction cards rendered`);
        assert.deepEqual(errors, [], `${file}: page errors`);
        cards += rows.length;
        for (const row of rows) {
          assert.ok(row.pills.every(pill => !invalidPill.test(pill)), `${file}: invalid pill in ${row.title}`);
        }
        if (file.includes('/chicken-skewers/')) {
          const dip = rows.find(row => row.title === 'Mix the Creamy Dip');
          const side = rows.find(row => row.title === 'Make the Cold Side');
          const setup = rows.find(row => row.title === 'Set Up the Grill');
          const cook = rows.find(row => row.title === 'Cook the Skewers and Pita');
          assert.ok(dip?.pills.includes('Greek yogurt') && !dip.pills.includes('Cucumber'), `${file}: dip pills`);
          assert.ok(side?.pills.includes('Cucumber') && !side.pills.includes('Greek yogurt'), `${file}: salad pills`);
          assert.deepEqual(setup?.pills, [], `${file}: grill setup should not have food pills`);
          assert.ok(cook?.pills.includes('Chicken') && cook.pills.includes('Pita'), `${file}: skewer cook pills`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Checked ${cards} instruction cards across ${files.length} pages.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
