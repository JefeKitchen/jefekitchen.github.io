(function () {
  const recipeId = 'sheet-pan-lemon-herb-chicken';
  const variantName = 'bone-in-thighs';
  const lastDay = '2026-11-07';

  const stepsByTitle = {
    'Season the Chicken and Beans': [
      'Zest <span class="ing">1 lemon</span>, mince <span class="ing">4 garlic cloves</span>, and reserve <span class="ing">2 tbsp lemon juice</span> for finishing.',
      'Pat <span class="ing">4 chicken thighs</span> (bone-in, skin-on; about <span class="ing">2 1/2-3 lb</span>) dry. Mix <span class="ing">1 tbsp olive oil</span>, the lemon zest, <span class="ing">1 tsp Dijon mustard</span>, the garlic, <span class="ing">1 tsp dried oregano</span>, <span class="ing">1 tsp smoked paprika</span>, <span class="ing">1/2 tsp onion powder</span>, optional <span class="ing">1/2 tsp red pepper flakes</span>, salt, and pepper. Rub on the meat side and under the skin; keep the skin dry and lightly salt it. Refrigerate skin-side up on a rimmed tray if prepping ahead.',
      'Trim <span class="ing">12 oz green beans</span> and toss with <span class="ing">1 tsp olive oil</span>, a pinch of salt, and pepper. Refrigerate separately from the chicken.'
    ],
    'Start the Potatoes': [
      'Heat the oven to <span class="ing">425 F</span>. Line a large sheet pan with parchment or foil.',
      'Cut <span class="ing">1 1/2 lb yellow potatoes</span> into <span class="ing">1-inch pieces</span>. If cutting ahead, cover with cold water and refrigerate.',
      'Drain and dry the potatoes well if cut ahead. Toss with <span class="ing">1 tbsp olive oil</span>, <span class="ing">1/2 tsp dried oregano</span>, salt, and pepper. Spread in one layer and nestle the thighs among them, skin-side up. Roast for <span class="ing">20-25 minutes</span>.'
    ],
    'Finish the Pan': [
      'Turn the potatoes and add the <span class="ing">green beans</span> around the <span class="ing">chicken thighs</span>, without covering the skin.',
      'Roast another <span class="ing">15-20 minutes</span>. Scatter <span class="ing">1/4 cup grated Parmesan</span> over the beans for the last <span class="ing">3-5 minutes</span>. Check the thickest part of a thigh without touching bone: <span class="ing">165 F</span> is safe; <span class="ing">175-185 F</span> is more tender. Remove the beans early if they finish first.',
      'After roasting, add the reserved <span class="ing">2 tbsp lemon juice</span> and <span class="ing">2 tbsp chopped parsley</span> if using. For a richer finish, toss the potatoes and beans with optional <span class="ing">1 tbsp butter</span>.'
    ]
  };

  function forEntry(entry) {
    if (entry?.id !== recipeId) return '';
    const today = new Date();
    const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    if (todayKey > lastDay || (entry.date && entry.date > lastDay)) return '';
    return variantName;
  }

  function apply(id, variant, body) {
    if (id !== recipeId || variant !== variantName) return body;
    const holder = document.createElement('div');
    holder.innerHTML = body;
    for (const [title, steps] of Object.entries(stepsByTitle)) {
      const block = [...holder.querySelectorAll('.cook-block')]
        .find(item => item.querySelector('h3')?.textContent.trim() === title);
      if (!block) return body;
      block.querySelector('.cook-steps').innerHTML = steps.map(step => `<li><span class="st">${step}</span></li>`).join('');
    }
    const heroSub = holder.querySelector('.hero-sub');
    if (heroSub) heroSub.textContent = heroSub.textContent.replace(/Cook\s+\d+\s+min/, 'Cook 45 min');
    return holder.innerHTML;
  }

  window.KitchenInstructionVariants = { forEntry, apply };
})();
