(function () {
  const text = (node, selector) => node.querySelector(selector)?.textContent.trim() || '';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const makeTemplate = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true);
  };

  const cleanIngredientName = (value) => String(value || '')
    .replace(/^[\d./¼½¾–\-\s]+(?:oz|lb|lbs|tbsp|tsp|cups?|can|cans|clove|cloves|inch|inches|seconds?|sec|min(?:utes?)?)?\b\s*/i, '')
    .replace(/\bpaper thin\b/i, '')
    .replace(/\s+per\s+.+$/i, '')
    .replace(/\b(?:day[- ]old|fresh)\s+rice(?:\s+fallback)?\b/i, 'Rice')
    .replace(/\s+/g, ' ')
    .trim();

  const isIngredientLike = (value) => {
    const lower = String(value || '').toLowerCase();
    return value &&
      value.length <= 32 &&
      !value.endsWith(':') &&
      !/\d/.test(value) &&
      !/^(glass|plate|bowl|bowls|water|salt)$/i.test(value) &&
      !/^(high|low|medium|medium-low|medium-high|full|one side|do not.*|for a .* batch|two separate bowls)$/i.test(value) &&
      !/\b(sec|second|seconds|min|minute|minutes|hour|hours|f|inch|inches|thick)\b/.test(lower);
  };

  const ingredientTerms = (scope) => {
    const terms = Array.from(scope.querySelectorAll('.ingredient-pill, .ing-name, .ing'))
      .map(item => cleanIngredientName(item.textContent.trim()))
      .map(item => {
        if (/^onions?$/i.test(item)) return 'Onions';
        if (/^more onion$/i.test(item)) return 'Onions';
        if (/^(?:day[- ]old|fresh)\s+rice(?:\s+fallback)?$/i.test(item)) return 'Rice';
        return item;
      })
      .filter(isIngredientLike);

    return Array.from(new Map(terms.map(term => [term.toLowerCase(), term])).values())
      .sort((a, b) => b.length - a.length);
  };

  const highlightIngredients = (scope) => {
    const terms = ingredientTerms(scope);
    if (!terms.length) return;

    const patterns = terms.map(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return /^[a-z ]+$/i.test(term) && !/s$/i.test(term) ? `${escaped}s?` : escaped;
    });
    const matcher = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('.ing, .ingredient-pill, .ing-name, .pill, script, style')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!parent.closest('.st, .step-text')) {
          return NodeFilter.FILTER_REJECT;
        }
        matcher.lastIndex = 0;
        return matcher.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      matcher.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      node.nodeValue.replace(matcher, (match, _term, offset) => {
        fragment.append(node.nodeValue.slice(cursor, offset));
        const span = document.createElement('span');
        span.className = 'ing';
        span.textContent = match;
        fragment.append(span);
        cursor = offset + match.length;
        return match;
      });
      fragment.append(node.nodeValue.slice(cursor));
      node.replaceWith(fragment);
    });
  };

  const isSectionHeader = (node) => node?.classList.contains('sec') || node?.classList.contains('sec-header');

  const previousSectionName = (node) => {
    let cursor = node.previousElementSibling;
    while (cursor) {
      if (isSectionHeader(cursor)) return cursor.textContent.trim();
      cursor = cursor.previousElementSibling;
    }
    return 'Cook';
  };

  const previousPills = (node) => {
    let cursor = node.previousElementSibling;
    while (cursor && !isSectionHeader(cursor)) {
      if (cursor.classList.contains('ingredient-pull')) {
        return Array.from(cursor.querySelectorAll('.ingredient-pill')).map(pill => pill.textContent.trim());
      }
      cursor = cursor.previousElementSibling;
    }
    return [];
  };

  const cleanPills = (pills) => Array.from(new Map((pills || [])
    .map(item => cleanIngredientName(item))
    .filter(isIngredientLike)
    .map(item => [item.toLowerCase(), item])).values());

  const pillsFromSteps = (steps) => {
    const skip = new Set(['high', 'low', 'medium', 'medium-low', 'medium-high']);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = steps.join('');
    return Array.from(wrapper.querySelectorAll('.ing'))
      .map(item => item.textContent.trim())
      .filter(item => !skip.has(item.toLowerCase()))
      .map(cleanIngredientName)
      .map(item => {
        if (/^onions?$/i.test(item)) return 'Onions';
        if (/^more onion$/i.test(item)) return 'Onions';
        if (/^balls$/i.test(item)) return 'Beef balls';
        if (/^meat balls?$/i.test(item)) return 'Meat balls';
        return item;
      })
      .filter(isIngredientLike)
      .filter((item, index, all) => all.findIndex(other => other.toLowerCase() === item.toLowerCase()) === index)
      .slice(0, 8);
  };

  const scaleForServings = (scope, options = {}) => {
    if (!window.KitchenQuantityScaler?.scaleInstructionContent) return;
    window.KitchenQuantityScaler.scaleInstructionContent(scope, {
      targetServings: options.targetServings,
      baseServings: options.baseServings,
      servingType: options.servingType || 'people'
    });
  };

  const extractSections = (body, options = {}) => {
    const holder = document.createElement('div');
    holder.innerHTML = body || '';
    scaleForServings(holder, options);
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
        pills = cleanPills(previousPills(block));
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

      sections.push({
        key: `${label} ${title}`.toLowerCase(),
        label,
        title,
        pills,
        steps,
        full: block.classList.contains('wide-full') || block.classList.contains('wide-split') || steps.length >= 4,
        split: block.classList.contains('wide-split') || steps.length >= 4
      });
    });

    return sections;
  };

  const renderSectionCard = (section, options = {}) => {
    const steps = section.steps || [];
    const pills = section.pills || pillsFromSteps(steps);
    return `
      <section class="section-card ${section.full ? 'full' : ''} ${section.split ? 'split' : ''} ${options.className || ''}">
        <div class="section-head">
          <span class="section-label">${escapeHtml(section.label || 'Prep')}</span>
          <h2>${escapeHtml(section.title || 'Prep')}</h2>
        </div>
        ${pills.length ? `
          <div class="pull">
            ${pills.map(pill => `<span class="pill">${escapeHtml(pill)}</span>`).join('')}
          </div>
        ` : ''}
        <ol>
          ${steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </section>
    `;
  };

  window.KitchenInstructionTools = {
    extractSections,
    renderSectionCard,
    highlightIngredients,
    pillsFromSteps,
    cleanIngredientName
  };
})();
