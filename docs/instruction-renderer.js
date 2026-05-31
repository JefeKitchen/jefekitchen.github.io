(function () {
  const root = document.getElementById('instruction-root');
  const recipeId = document.body.dataset.recipe;
  const layout = document.body.dataset.layout || 'phone';
  const recipe = window.INSTRUCTION_CONTENT && window.INSTRUCTION_CONTENT[recipeId];

  if (!root || !recipe) return;

  const makeTemplate = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true);
  };

  const text = (node, selector) => node.querySelector(selector)?.textContent.trim() || '';
  const html = (node, selector) => node.querySelector(selector)?.innerHTML.trim() || '';

  const previousSectionName = (node) => {
    let cursor = node.previousElementSibling;
    while (cursor) {
      if (cursor.classList.contains('sec') || cursor.classList.contains('sec-header')) {
        return cursor.textContent.trim();
      }
      cursor = cursor.previousElementSibling;
    }
    return 'Cook';
  };

  const previousPills = (node) => {
    let cursor = node.previousElementSibling;
    while (cursor && !cursor.classList.contains('sec') && !cursor.classList.contains('sec-header')) {
      if (cursor.classList.contains('ingredient-pull')) {
        return Array.from(cursor.querySelectorAll('.ingredient-pill')).map(pill => pill.textContent.trim());
      }
      cursor = cursor.previousElementSibling;
    }
    return [];
  };

  const pillsFromSteps = (node) => {
    const skip = new Set([
      'high',
      'low',
      'medium',
      'medium-low',
      'medium-high'
    ]);

    return Array.from(node.querySelectorAll('.ing'))
      .map(item => item.textContent.trim())
      .filter(item => {
        const lower = item.toLowerCase();
        return !/\b(sec|second|seconds|min|minute|minutes|hour|hours|f)\b/.test(lower) &&
          !skip.has(lower) &&
          !lower.startsWith('do not');
      })
      .map(item => item
        .replace(/^[\d./–\-\s]+(?:oz|tbsp|tsp|cups?|seconds?|sec|min(?:utes?)?)?\s*/i, '')
        .replace(/\bpaper thin\b/i, '')
        .replace(/\s+/g, ' ')
        .trim()
      )
      .map(item => {
        if (/^onions?$/i.test(item)) return 'Onions';
        if (/^more onion$/i.test(item)) return 'Onions';
        if (/^balls$/i.test(item)) return 'Beef balls';
        if (/^meat balls?$/i.test(item)) return 'Meat balls';
        return item;
      })
      .filter(item => item && item.length <= 28)
      .filter((item, index, all) => all.findIndex(other => other.toLowerCase() === item.toLowerCase()) === index)
      .slice(0, 8);
  };

  const sectionsFromPhoneContent = () => {
    const holder = document.createElement('div');
    holder.innerHTML = recipe.body;
    const sections = [];

    holder.querySelectorAll('.cook-block, .steps-list, .phase').forEach((block) => {
      let steps = [];
      let label = '';
      let title = '';
      let pills = [];

      if (block.classList.contains('cook-block')) {
        steps = Array.from(block.querySelectorAll('.cook-steps > li')).map(step => step.innerHTML.trim());
        label = text(block, '.badge') || previousSectionName(block);
        title = text(block, 'h3') || previousSectionName(block);
        pills = previousPills(block);
      } else if (block.classList.contains('steps-list')) {
        steps = Array.from(block.querySelectorAll('.step-text')).map(step => step.innerHTML.trim());
        label = previousSectionName(block);
        title = label.replace(/^[^-—]+[-—]\s*/, '');
      } else {
        steps = Array.from(block.querySelectorAll('.steps > li')).map(step => step.innerHTML.trim());
        label = text(block, '.phase-label') || previousSectionName(block);
        title = text(block, 'h3') || previousSectionName(block);
        pills = pillsFromSteps(block);
      }

      if (!steps.length) return;
      sections.push({
        label,
        title,
        pills,
        steps,
        wide: steps.length >= 4
      });
    });

    return sections;
  };

  const renderPhone = () => {
    root.replaceChildren(makeTemplate(recipe.body));
  };

  const renderWide = () => {
    const sections = sectionsFromPhoneContent();
    const source = makeTemplate(recipe.body);
    const heroTitle = html(source, '.hero-title') || html(source, '.recipe-title') || recipe.heroTitle || recipe.title;
    const metaSub = Array.from(source.querySelectorAll('.recipe-meta .meta-item'))
      .map(item => `${text(item, '.meta-label')} ${text(item, '.meta-value')}`.trim())
      .filter(Boolean)
      .join(' · ');
    const heroSub = text(source, '.hero-sub') || metaSub || recipe.heroSub;

    root.innerHTML = `
      <main class="shell">
        <header class="hero">
          <div class="hero-title">${heroTitle}</div>
          <div class="hero-sub">${heroSub.replace(/\s*·\s*/g, '<br>')}</div>
        </header>
        <div class="board">
          ${sections.map(section => `
            <section class="section-card ${section.wide ? 'wide full' : ''}">
              <div class="section-head">
                <span class="section-label">${section.label}</span>
                <h2>${section.title}</h2>
              </div>
              ${section.pills.length ? `
                <div class="pull">
                  ${section.pills.map(pill => `<span class="pill">${pill}</span>`).join('')}
                </div>
              ` : ''}
              <ol>
                ${section.steps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </section>
          `).join('')}
        </div>
      </main>
    `;
  };

  const wireIngredientPills = () => {
    const pills = Array.from(document.querySelectorAll('.ingredient-pill, .pill'));
    const stateKey = `${recipeId}-${layout}-pulled-ingredients`;
    let pulled = {};

    try {
      pulled = JSON.parse(localStorage.getItem(stateKey) || '{}');
    } catch {
      pulled = {};
    }

    pills.forEach((pill, index) => {
      const name = pill.textContent.trim();
      const key = `${index}-${name}`;
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('aria-pressed', pulled[key] ? 'true' : 'false');
      pill.classList.toggle('is-pulled', !!pulled[key]);

      const toggle = () => {
        pulled[key] = !pulled[key];
        pill.classList.toggle('is-pulled', pulled[key]);
        pill.setAttribute('aria-pressed', pulled[key] ? 'true' : 'false');
        localStorage.setItem(stateKey, JSON.stringify(pulled));
      };

      pill.addEventListener('click', toggle);
      pill.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  };

  if (layout === 'wide') {
    renderWide();
  } else {
    renderPhone();
  }

  wireIngredientPills();
})();
