(function () {
  const root = document.getElementById('grocery-root');
  const recipeId = document.body.dataset.recipe;
  const recipe = window.JEFES_KITCHEN_CATALOG?.recipes?.[recipeId];
  const servingData = window.JEFES_RECIPE_SERVINGS?.[recipeId] || {};
  if (!root || !recipe) return;

  const params = new URLSearchParams(window.location.search);
  const servingType = servingData.servingType || 'people';
  const baseServings = Number(servingData.baseServings || (servingType === 'servings' ? 4 : 2));
  const defaultServings = Number(servingData.defaultServings || (servingType === 'servings' ? 8 : 4));
  const targetServings = Math.max(1, Math.round(Number(params.get('servings')) || defaultServings));
  const maxServings = servingType === 'servings' ? 12 : 8;
  const factor = targetServings / baseServings;
  const scalingOptions = {
    friendlyFourServings: targetServings === 4 && servingType === 'people'
  };

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const scaleText = value => window.KitchenQuantityScaler?.scaleQuantityText
    ? window.KitchenQuantityScaler.scaleQuantityText(value, factor, scalingOptions)
    : value;
  const scaleNote = value => window.KitchenQuantityScaler?.scaleStandaloneNote
    ? window.KitchenQuantityScaler.scaleStandaloneNote(value, factor, scalingOptions)
    : value;
  const itemKey = itemId => `single-grocery-${recipeId}-${itemId}`;
  const itemId = item => `single-${recipeId}-${item}`.replace(/[^a-z0-9_-]/gi, '-');

  const options = Array.from({ length: maxServings }, (_, index) => index + 1)
    .map(value => `<option value="${value}" ${value === targetServings ? 'selected' : ''}>${value} servings</option>`)
    .join('');

  const sections = Object.entries(recipe.items || {})
    .filter(([, items]) => items.length)
    .map(([section, items]) => {
      const rows = items.map(([id, name, note]) => {
        const checkboxId = itemId(id);
        const nameText = escapeHtml(scaleText(name));
        const noteText = scaleNote(note || '');
        return `<div class="item"><input type="checkbox" id="${checkboxId}" data-item="${escapeHtml(id)}"><label for="${checkboxId}">${nameText}${noteText ? `<span class="item-note">${escapeHtml(noteText)}</span>` : ''}</label></div>`;
      }).join('');
      return `<section class="section"><div class="section-header need">${escapeHtml(section)}</div><div class="item-list">${rows}</div></section>`;
    }).join('');

  root.innerHTML = `
    <div class="back-bar"><a href="../../index.html" aria-label="Back to kitchen">&#8249;</a></div>
    <div class="page-title">Grocery List</div>
    <div class="page-sub">${escapeHtml(recipe.name)}</div>
    <div class="instruction-controls grocery-serving-control"><label class="serving-control"><select class="serving-select" aria-label="Scale grocery list">${options}</select></label></div>
    ${sections}
  `;

  root.querySelectorAll('input[type="checkbox"]').forEach(input => {
    const key = itemKey(input.dataset.item);
    input.checked = localStorage.getItem(key) === 'checked';
    input.addEventListener('change', () => {
      localStorage.setItem(key, input.checked ? 'checked' : '');
    });
  });

  root.querySelector('.serving-select')?.addEventListener('change', event => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('servings', String(event.target.value));
    window.location.href = nextUrl.toString();
  });
})();
