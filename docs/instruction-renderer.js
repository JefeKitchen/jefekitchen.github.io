(function () {
  const root = document.getElementById('instruction-root');
  const recipeId = document.body.dataset.recipe;
  const layout = document.body.dataset.layout || 'phone';
  const recipe = window.INSTRUCTION_CONTENT && window.INSTRUCTION_CONTENT[recipeId];
  const params = new URLSearchParams(window.location.search);
  const isLunch = params.get('meal') === 'lunch';
  const servingDefaults = window.JEFES_RECIPE_SERVINGS?.[recipeId] || {};
  const baseServings = Number(params.get('baseServings') || servingDefaults.baseServings || 0);
  const defaultTargetServings = Number(servingDefaults.defaultServings || baseServings || 0);
  const targetServings = Number(params.get('servings') || defaultTargetServings || 0);
  const servingType = params.get('servingType') || servingDefaults.servingType || 'people';
  const pairMode = params.get('pair') === '1';

  if (!root || !recipe) return;

  const makeTemplate = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true);
  };

  const changeServings = (nextValue) => {
    const next = Math.max(1, Math.round(Number(nextValue) || targetServings || 1));
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('servings', String(next));
    if (baseServings) nextUrl.searchParams.set('baseServings', String(baseServings));
    nextUrl.searchParams.set('servingType', servingType);
    window.location.href = nextUrl.toString();
  };

  const togglePairMode = () => {
    const nextUrl = new URL(window.location.href);
    if (pairMode) {
      nextUrl.searchParams.delete('pair');
    } else {
      nextUrl.searchParams.set('pair', '1');
    }
    window.location.href = nextUrl.toString();
  };

  const renderServingControl = () => {
    const control = document.createElement('div');
    control.className = 'instruction-controls';

    if (targetServings && baseServings) {
      const max = servingType === 'servings' ? 12 : 8;
      const values = Array.from(new Set([...Array.from({ length: max }, (_, index) => index + 1), targetServings]))
        .sort((a, b) => a - b);
      control.insertAdjacentHTML('beforeend', `
        <label class="serving-control">
          <select class="serving-select" aria-label="Scale recipe">
            ${values.map(value => `<option value="${value}" ${value === targetServings ? 'selected' : ''}>${value} servings</option>`).join('')}
          </select>
        </label>
      `);
      control.querySelector('.serving-select')?.addEventListener('change', event => {
        changeServings(event.target.value);
      });
    }

    control.insertAdjacentHTML('beforeend', `
      <button type="button" class="pair-toggle ${pairMode ? 'is-active' : ''}" aria-pressed="${pairMode ? 'true' : 'false'}">
        ${pairMode ? 'Normal View' : 'Pair Cook'}
      </button>
    `);
    control.querySelector('.pair-toggle')?.addEventListener('click', togglePairMode);

    const target = root.querySelector('.shell .hero, .hero, .header');
    if (target) {
      target.append(control);
    } else {
      root.prepend(control);
    }
  };

  const text = (node, selector) => node.querySelector(selector)?.textContent.trim() || '';
  const html = (node, selector) => node.querySelector(selector)?.innerHTML.trim() || '';
  const isSectionHeader = (node) => node.classList.contains('sec') || node.classList.contains('sec-header');
  const formatHeroSub = (value, separator) => {
    const parts = String(value || "").split(/\s*·\s*/).filter(Boolean);
    const visibleParts = targetServings && baseServings
      ? parts.filter(part => !/^serves\b/i.test(part.trim()))
      : parts;
    return visibleParts.join(separator);
  };

  const updateHeroSub = (scope, separator) => {
    const heroSub = scope.querySelector?.(".hero-sub");
    if (!heroSub) return;
    heroSub.innerHTML = formatHeroSub(heroSub.textContent, separator);
  };

  const removeDrinkSection = (scope) => {
    if (!isLunch) return;
    Array.from(scope.querySelectorAll('.sec, .sec-header')).forEach(section => {
      if (section.textContent.trim().toLowerCase() !== 'drink') return;
      let cursor = section.nextElementSibling;
      section.remove();
      while (cursor && !isSectionHeader(cursor)) {
        const next = cursor.nextElementSibling;
        cursor.remove();
        cursor = next;
      }
    });
  };

  const instructionTools = window.KitchenInstructionTools;
  if (!instructionTools) return;
  const { highlightIngredients, pillsFromSteps } = instructionTools;

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


  const sectionsFromPhoneContent = () => {
    const holder = document.createElement('div');
    holder.innerHTML = recipe.body;
    removeDrinkSection(holder);
    scaleForServings(holder);
    highlightIngredients(holder);
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
        pills = pillsFromSteps(steps);
      } else if (block.classList.contains('steps-list')) {
        steps = Array.from(block.querySelectorAll('.step-text')).map(step => step.innerHTML.trim());
        label = previousSectionName(block);
        title = label.replace(/^[^-—]+[-—]\s*/, '');
        pills = pillsFromSteps(steps);
      } else {
        steps = Array.from(block.querySelectorAll('.steps > li')).map(step => step.innerHTML.trim());
        label = text(block, '.phase-label') || previousSectionName(block);
        title = text(block, 'h3') || previousSectionName(block);
        pills = pillsFromSteps(steps);
      }

      if (!steps.length) return;
      if (!pills.length) pills = pillsFromSteps(steps);
      const forceHalf = block.classList.contains('wide-half');
      const forceFull = block.classList.contains('wide-full');
      const forceSplit = block.classList.contains('wide-split');
      sections.push({
        label,
        title,
        pills,
        steps,
        forceHalf,
        forceFull,
        split: !forceHalf && (forceSplit || steps.length >= 4)
      });
    });

    return sections;
  };

  const layoutWideSections = (sections) => {
    const laidOut = sections.map(section => ({
      ...section,
      full: section.forceFull || (!section.forceHalf && section.split)
    }));

    // Full-width cards start and end a row. A lone short card on either side
    // should fill the row rather than leaving a conspicuous empty half.
    let shortRun = [];
    const fillOddRun = () => {
      if (shortRun.length % 2 === 1) laidOut[shortRun[shortRun.length - 1]].full = true;
      shortRun = [];
    };

    laidOut.forEach((section, index) => {
      if (section.full) {
        fillOddRun();
        return;
      }
      shortRun.push(index);
    });
    fillOddRun();

    return laidOut;
  };

  const pairAssignmentsKey = `pair-cook-assignments-${recipeId}`;
  const pairDoneKey = `pair-cook-done-${recipeId}`;

  const readPairAssignments = () => {
    try {
      return JSON.parse(localStorage.getItem(pairAssignmentsKey) || '{}');
    } catch {
      return {};
    }
  };

  const writePairAssignments = (assignments) => {
    localStorage.setItem(pairAssignmentsKey, JSON.stringify(assignments));
  };

  const readPairDone = () => {
    try {
      return JSON.parse(localStorage.getItem(pairDoneKey) || '{}');
    } catch {
      return {};
    }
  };

  const writePairDone = (done) => {
    localStorage.setItem(pairDoneKey, JSON.stringify(done));
  };

  const defaultPairLane = (section) => {
    const value = `${section.label} ${section.title}`.toLowerCase();
    if (isPairSharedStarter(section)) return 'shared';
    const prepWords = /\b(drink|prep|mise|ready|pull|sauce|mix|whisk|stir|slice|dice|chop|mince|cucumber|salad|side|serve|plate|finish|assemble|bowls|topping|crunch)\b/;
    const cookWords = /\b(cook|fry|stir-fry|bake|roast|grill|sear|wok|skillet|oven|heat|boil|simmer|noodle|rice|salmon|chicken|beef|pork|shrimp|steak|meatball|carnitas)\b/;
    if (prepWords.test(value) && !/\b(fry|bake|roast|grill|sear|wok|skillet|oven|boil|simmer)\b/.test(value)) return 'prep';
    if (cookWords.test(value)) return 'cook';
    return 'prep';
  };

  const isPairSharedStarter = (section) => {
    const value = `${section.label} ${section.title}`.toLowerCase();
    return /\b(drink|beer|wine|cocktail|lager|cider|highball|mule|mojito|ranch water)\b/.test(value);
  };

  const pairTasksFromSections = (sections) => {
    const assignments = readPairAssignments();
    const tasks = [];
    sections.forEach((section, sectionIndex) => {
      if (isPairSharedStarter(section)) {
        section.steps.forEach((step, stepIndex) => {
          tasks.push({
            key: `${sectionIndex}-drink-cook-${stepIndex}`,
            originalIndex: tasks.length,
            lane: 'cook',
            label: `${section.label} · Jeff`,
            title: section.title,
            pills: section.pills,
            step
          });
        });
        tasks.push({
          key: `${sectionIndex}-drink-prep`,
          originalIndex: tasks.length,
          lane: 'prep',
          label: `${section.label} · Jaya`,
          title: section.title,
          pills: [],
          step: 'Receive the drink from Jeff and keep it close. Sous chef privileges.'
        });
        return;
      }
      section.steps.forEach((step, stepIndex) => {
        const key = `${sectionIndex}-${stepIndex}`;
        tasks.push({
          key,
          originalIndex: tasks.length,
          lane: assignments[key] || defaultPairLane(section),
          label: section.label,
          title: section.title,
          pills: section.pills,
          step
        });
      });
    });
    return tasks;
  };

  const groupPairTasks = (tasks) => {
    const groups = [];
    tasks.forEach(task => {
      const previous = groups[groups.length - 1];
      if (previous && previous.lane === task.lane && previous.label === task.label && previous.title === task.title) {
        previous.tasks.push(task);
        previous.pills = Array.from(new Set([...previous.pills, ...task.pills]));
      } else {
        groups.push({
          lane: task.lane,
          label: task.label,
          title: task.title,
          pills: [...task.pills],
          tasks: [task]
        });
      }
    });
    return groups;
  };

  const pairGroupKey = (group) => "section:" + group.tasks.map(task => task.key).join("|");

  const renderPairGroup = (group) => `
    <article class="pair-task ${readPairDone()[pairGroupKey(group)] ? 'is-done' : ''}" data-lane="${group.lane}" data-pair-group="${pairGroupKey(group)}">
      <div class="pair-task-head">
        <span>
          <strong>${group.title}</strong>
        </span>
        ${group.lane === 'shared' ? '' : `
          <button type="button" class="pair-move" data-pair-move="${pairGroupKey(group)}" data-lane="${group.lane}" aria-label="Move section to ${group.lane === 'cook' ? 'prep' : 'cook'}">
            ${group.lane === 'cook' ? '&rarr;' : '&larr;'}
          </button>
        `}
      </div>
      ${group.pills.length ? `
        <div class="pull pair-pull">
          ${group.pills.map(pill => `<span class="pill">${pill}</span>`).join('')}
        </div>
      ` : ''}
      <ol>
        ${group.tasks.map(task => `
          <li data-pair-task="${task.key}" data-lane="${task.lane}">
            <span class="pair-step-text">${task.step}</span>
          </li>
        `).join('')}
      </ol>
    </article>
  `;

  const wirePairMoves = () => {
    const assignments = readPairAssignments();
    root.querySelectorAll('[data-pair-move]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const keys = (button.dataset.pairMove || "").replace(/^section:/, "").split("|").filter(Boolean);
        const current = button.dataset.lane || 'prep';
        const nextLane = current === 'cook' ? 'prep' : 'cook';
        keys.forEach(key => {
          assignments[key] = nextLane;
        });
        writePairAssignments(assignments);
        renderPair();
        renderServingControl();
        wireIngredientPills();
        wirePairMoves();
        wirePairSharedCollapse();
        wirePairSectionDone();
      });
    });
  };

  const wirePairSharedCollapse = () => {
    root.querySelectorAll('.pair-shared .pair-task-head').forEach(head => {
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', head.closest('.pair-task')?.classList.contains('is-collapsed') ? 'false' : 'true');
      const toggle = () => {
        const task = head.closest('.pair-task');
        if (!task) return;
        const collapsed = task.classList.toggle('is-collapsed');
        head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      };
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
      });
    });
  };

  const wirePairSectionDone = () => {
    const done = readPairDone();
    root.querySelectorAll('.pair-board .pair-task-head').forEach(head => {
      const task = head.closest('.pair-task');
      const key = task?.dataset.pairGroup;
      if (!task || !key) return;
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-pressed', task.classList.contains('is-done') ? 'true' : 'false');
      const toggle = () => {
        done[key] = !done[key];
        task.classList.toggle('is-done', !!done[key]);
        head.setAttribute('aria-pressed', done[key] ? 'true' : 'false');
        writePairDone(done);
      };
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
      });
    });
  };

  const nestPhoneIngredientPulls = (scope) => {
    scope.querySelectorAll('.ingredient-pull').forEach(pull => pull.remove());
    scope.querySelectorAll('.cook-block, .steps-list, .phase').forEach(block => {
      const steps = Array.from(block.querySelectorAll('.cook-steps > li, .step-text, .steps > li'))
        .map(step => step.innerHTML.trim());
      const pills = pillsFromSteps(steps);
      if (!pills.length) return;
      const pull = document.createElement('div');
      pull.className = 'ingredient-pull is-nested';
      pull.innerHTML = '<div class="ingredient-pull-title">Pull Out</div><div class="ingredient-pull-list"></div>';
      const list = pull.querySelector('.ingredient-pull-list');
      pills.forEach(name => {
        const pill = document.createElement('span');
        pill.className = 'ingredient-pill';
        pill.textContent = name;
        list.append(pill);
      });
      const head = block.querySelector('.cook-head, .phase-head') || block;
      head.insertAdjacentElement('afterend', pull);
    });
  };

  const scaleForServings = (scope) => {
    if (!window.KitchenQuantityScaler?.scaleInstructionContent) return;
    window.KitchenQuantityScaler.scaleInstructionContent(scope, {
      targetServings,
      baseServings,
      servingType
    });
  };

  const renderPhone = () => {
    const content = makeTemplate(recipe.body);
    removeDrinkSection(content);
    scaleForServings(content);
    updateHeroSub(content, " · ");
    highlightIngredients(content);
    nestPhoneIngredientPulls(content);
    root.replaceChildren(content);
  };

  const renderWide = () => {
    const sections = layoutWideSections(sectionsFromPhoneContent());
    const source = makeTemplate(recipe.body);
    scaleForServings(source);
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
          <div class="hero-sub">${formatHeroSub(heroSub, '<br>')}</div>
        </header>
        <div class="board">
          ${sections.map(section => `
            <section class="section-card ${section.full ? 'full' : ''} ${section.split ? 'split' : ''}">
              <div class="section-head">
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

  const renderPair = () => {
    const sections = pairTasksFromSections(sectionsFromPhoneContent());
    const source = makeTemplate(recipe.body);
    scaleForServings(source);
    const heroTitle = html(source, '.hero-title') || html(source, '.recipe-title') || recipe.heroTitle || recipe.title;
    const metaSub = Array.from(source.querySelectorAll('.recipe-meta .meta-item'))
      .map(item => `${text(item, '.meta-label')} ${text(item, '.meta-value')}`.trim())
      .filter(Boolean)
      .join(' · ');
    const heroSub = text(source, '.hero-sub') || metaSub || recipe.heroSub;
    const cookGroups = groupPairTasks(sections.filter(task => task.lane === 'cook').sort((a, b) => a.originalIndex - b.originalIndex));
    const prepGroups = groupPairTasks(sections.filter(task => task.lane === 'prep').sort((a, b) => a.originalIndex - b.originalIndex));
    const sharedGroups = groupPairTasks(sections.filter(task => task.lane === 'shared').sort((a, b) => a.originalIndex - b.originalIndex));

    root.innerHTML = `
      <main class="shell pair-shell">
        <header class="hero pair-hero">
          <div class="hero-title">${heroTitle}</div>
          <div class="hero-sub">${formatHeroSub(heroSub, ' · ')}</div>
        </header>
        ${sharedGroups.length ? `
          <section class="pair-shared">
            ${sharedGroups.map(renderPairGroup).join('')}
          </section>
        ` : ''}
        <div class="pair-board">
          <section class="pair-column pair-column-cook">
            <div class="pair-column-head">
              <span>Jeff</span>
              <strong>Cook</strong>
            </div>
            <div class="pair-scroll">
              ${cookGroups.map(renderPairGroup).join('')}
            </div>
          </section>
          <section class="pair-column pair-column-prep">
            <div class="pair-column-head">
              <span>Jaya</span>
              <strong>Prep</strong>
            </div>
            <div class="pair-scroll">
              ${prepGroups.map(renderPairGroup).join('')}
            </div>
          </section>
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

  if (pairMode) {
    renderPair();
  } else if (layout === 'wide') {
    renderWide();
  } else {
    renderPhone();
  }

  renderServingControl();
  wireIngredientPills();
  wirePairMoves();
  wirePairSharedCollapse();
  wirePairSectionDone();
})();
