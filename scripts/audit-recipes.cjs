const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
for (const file of [
  'docs/recipe-catalog.js',
  'docs/recipe-serving-data.js',
  'docs/instruction-content.js',
  'docs/prep-catalog.js',
  'docs/quantity-scaler.js'
]) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

const catalog = context.window.JEFES_KITCHEN_CATALOG;
const servings = context.window.JEFES_RECIPE_SERVINGS;
const instructions = context.window.INSTRUCTION_CONTENT;
const prep = context.window.JEFES_KITCHEN_PREP;
const cache = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const errors = [];
const fail = (message) => errors.push(message);
const active = new Set(catalog.sections.flatMap(section => section.recipes));
const nonDinner = new Set(['breakfast', 'snackies']);

for (const id of Object.keys(catalog.recipes)) {
  const recipe = catalog.recipes[id];
  const content = instructions[id];
  const serving = servings[id];
  if (!recipe) { fail(`${id}: missing catalog entry`); continue; }
  if (!content?.body) fail(`${id}: missing shared instructions`);
  if (!serving?.baseServings || !serving?.defaultServings) fail(`${id}: missing serving metadata`);
  if (!(id in prep)) fail(`${id}: missing prep decision (use [] when none makes sense)`);

  for (const field of ['menu', 'phone', 'wide', 'grocery']) {
    const relative = recipe[field]?.replace(/^\.\//, '');
    if (!relative || !fs.existsSync(path.join(root, relative))) {
      fail(`${id}: missing ${field} page`);
      continue;
    }
    if (!cache.includes(relative)) fail(`${id}: ${field} page missing from offline cache`);
    if (field === 'phone' || field === 'wide') {
      const html = fs.readFileSync(path.join(root, relative), 'utf8');
      if (!html.includes(`data-recipe="${id}"`)) fail(`${id}: ${field} page uses a different recipe ID`);
      for (const script of ['instruction-content.js', 'recipe-serving-data.js', 'quantity-scaler.js', 'instruction-renderer.js']) {
        if (!html.includes(script)) fail(`${id}: ${field} page missing ${script}`);
      }
    }
  }

  for (const [section, items] of Object.entries(recipe.items || {})) {
    if (!catalog.shoppingSections.includes(section)) fail(`${id}: unknown shopping section ${section}`);
    for (const item of items) {
      if (!item[0] || !item[1] || !item[2]) fail(`${id}: incomplete grocery item in ${section}`);
    }
  }

  if (!content?.body) continue;
  const body = content.body;
  const sectionNames = [...body.matchAll(/<div class="sec">([^<]+)<\/div>/g)].map(match => match[1]);
  if (!nonDinner.has(recipe.section)) {
    if (sectionNames[0] !== 'Drink') fail(`${id}: dinner should begin with its drink`);
    const drink = body.match(/<div class="sec">Drink<\/div>[\s\S]*?<div class="cook-block([^>]*)>/);
    if (!drink || !drink[1].includes('data-no-scale')) fail(`${id}: per-drink quantities must not scale with meal servings`);
  }

  for (const spec of prep[id] || []) {
    if (spec.prepSteps || spec.pills) fail(`${id}: prep duplicates instructions or ingredient pills`);
    if (!spec.section || !Array.isArray(spec.steps) || !spec.steps.length) {
      fail(`${id}: prep must reference numbered instruction steps`);
      continue;
    }
    const escaped = spec.section.replace(/&/g, '&amp;').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const heading = body.match(new RegExp(`<h3>${escaped}<\\/h3>|<div class="sec-header">${escaped}<\\/div>`, 'i'));
    if (!heading) { fail(`${id}: prep section "${spec.section}" no longer exists`); continue; }
    const headingIndex = heading.index;
    const phase = body.lastIndexOf('<div class="phase">', headingIndex) >
      body.lastIndexOf('<div class="cook-block', headingIndex);
    const end = phase
      ? body.indexOf('<div class="sec">', headingIndex)
      : body.indexOf('</ol>', headingIndex);
    const block = body.slice(headingIndex, end < 0 ? undefined : end);
    const stepCount = (block.match(/<li\b/g) || []).length;
    for (const index of spec.steps) {
      if (!Number.isInteger(index) || index < 0 || index >= stepCount) {
        fail(`${id}: prep step ${index} missing from "${spec.section}"`);
      }
    }
  }
}

for (const id of Object.keys(instructions)) {
  if (!catalog.recipes[id]) fail(`${id}: instruction data has no catalog recipe`);
}

const scale = context.window.KitchenQuantityScaler.scaleQuantityText;
for (const [before, factor, expected] of [
  ['3 garlic cloves', 1.5, '5 garlic cloves'],
  ['1 English cucumber', 1.5, '2 English cucumbers'],
  ['16-18 small meatballs', 1.5, '24-27 small meatballs'],
  ['4 packed cups cabbage', 1.5, '6 packed cups cabbage'],
  ['1 pint cherry tomatoes', 1.5, '1 1/2 pints cherry tomatoes'],
  ['2-3 tomatoes', 1.5, '3-5 tomatoes'],
  ['3 1/2-4 3/4 chicken thighs', 1.5, '6-8 chicken thighs'],
  ['3-4 days', 1.5, '3-4 days']
]) {
  if (scale(before, factor) !== expected) fail(`scaler: "${before}" should become "${expected}"`);
}

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Audited ${Object.keys(catalog.recipes).length} recipes (${active.size} active), shared instructions, serving data, shopping pages, and prep references.`);
}
