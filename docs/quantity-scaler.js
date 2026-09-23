(function () {
  const fractionMap = {
    '1/4': 0.25,
    '1/3': 1 / 3,
    '1/2': 0.5,
    '2/3': 2 / 3,
    '3/4': 0.75,
    '¼': 0.25,
    '⅓': 1 / 3,
    '½': 0.5,
    '⅔': 2 / 3,
    '¾': 0.75
  };
  const unitPattern = 'cups?|tbsp|tsp|oz|lb|lbs|pounds?|pints?|cans?|cloves?|heads?|bunch(?:es)?|packages?|pkg|avocados?|limes?|lemons?|cucumbers?|carrots?|tomato(?:es)?|potato(?:es)?|onions?|shallots?|zucchinis?|eggs?|meatballs?|balls?|jars?|containers?|fillets?|breasts?|thighs?|cutlets?|patties?|drumsticks?|wings?|pitas?|tortillas?|rolls?|slices?';
  const foodUnit = new RegExp(`\\b(${unitPattern})\\b`, 'i');
  const noScale = /\b(min|mins|minute|minutes|sec|second|seconds|hour|hours|f|degrees?|medium|high|low|full|inch|inches|thick|heat|timer)\b/i;

  const parseQuantity = value => {
    const clean = String(value || '').trim().replace(/[–—]/g, '-');
    if (!clean) return NaN;
    if (fractionMap[clean] !== undefined) return fractionMap[clean];
    const mixed = clean.match(/^(\d+)\s+([\d¼½¾⅓⅔]+\/\d+|[¼½¾⅓⅔])$/);
    if (mixed) return Number(mixed[1]) + parseQuantity(mixed[2]);
    const frac = clean.match(/^(\d+)\/(\d+)$/);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    return Number(clean);
  };

  const formatNumber = (value, unit = '', options = {}) => {
    if (!Number.isFinite(value) || value <= 0) return '0';
    const lowerUnit = unit.toLowerCase();
    const wholePortion = /^(fillets?|breasts?|thighs?|cutlets?|patties?|drumsticks?|wings?)$/.test(lowerUnit);
    const countLike = !unit || /^(cans?|cloves?|heads?|bunch(?:es)?|packages?|pkg|avocados?|limes?|lemons?|cucumbers?|carrots?|tomato(?:es)?|potato(?:es)?|onions?|shallots?|zucchinis?|eggs?|meatballs?|balls?|jars?|containers?|fillets?|breasts?|thighs?|cutlets?|patties?|drumsticks?|wings?|pitas?|tortillas?|rolls?|slices?)$/.test(lowerUnit);
    const step = countLike ? 1 : 0.25;
    let rounded = Math.max(countLike ? 1 : 0.25, wholePortion ? Math.ceil(value) : Math.round(value / step) * step);

    // Four servings is the app's everyday batch. Avoid mechanical artifacts such
    // as 10 3/4 oz pasta or 2 3/4 tbsp sauce, while preserving useful small fractions.
    if (options.friendlyFourServings && !countLike) {
      if (/^oz$/.test(lowerUnit) && rounded >= 8) {
        rounded = Math.ceil(rounded / 2) * 2;
      } else if (/^(cups?|tbsp|tsp)$/.test(lowerUnit) && rounded >= 2 && !Number.isInteger(rounded)) {
        rounded = Math.round(rounded);
      }
    }
    const whole = Math.floor(rounded);
    const frac = +(rounded - whole).toFixed(2);
    const fractions = { 0.25: '1/4', 0.5: '1/2', 0.75: '3/4' };
    if (!frac) return String(whole);
    const fracText = fractions[frac] || String(frac).replace(/^0/, '');
    return whole ? `${whole} ${fracText}` : fracText;
  };

  const pluralizeUnit = (unit, quantity) => {
    if (!unit) return '';
    if (Math.abs(quantity - 1) < 0.01 || (/^cups?$/i.test(unit) && quantity < 1)) return unit.replace(/s$/, '');
    if (/^(lb|lbs)$/i.test(unit)) return 'lb';
    if (/^zucchinis?$/i.test(unit)) return 'zucchini';
    if (/^(?:tomato|potato)$/i.test(unit)) return `${unit}es`;
    if (/^(tbsp|tsp|oz)$/i.test(unit)) return unit;
    if (/pkg$/i.test(unit)) return 'packages';
    if (unit.endsWith('s')) return unit;
    if (unit.endsWith('ch')) return `${unit}es`;
    return `${unit}s`;
  };

  const scaleQuantityText = (text, factor, options = {}) => {
    if (!factor || noScale.test(text)) return text;
    let next = text;
    const portionTokens = [];
    const rangeTokens = [];
    const quantityPattern = '(\\d+(?:\\s+\\d+\\/\\d+|\\/\\d+|\\.\\d+)?|[¼½¾⅓⅔])';
    const descriptorPattern = '((?:\\s+(?:small|medium|large|english|white|yellow|red|green|grated|sliced|minced|chopped|packed|extra|fresh|whole|baby|cherry|garlic|beaten|more)){0,3})';
    const portionUnits = 'breasts?|thighs?|cutlets?|patties?|drumsticks?|wings?|fillets?';
    const proteinName = '(?:boneless\\s+skinless\\s+)?(?:chicken|salmon|turkey|pork|beef)';
    const portionRangeWithProtein = new RegExp(`\\b${quantityPattern}\\s*[-–]\\s*${quantityPattern}\\s+(${proteinName})\\s+(${portionUnits})\\b`, 'gi');
    const portionWithProtein = new RegExp(`\\b${quantityPattern}\\s+(${proteinName})\\s+(${portionUnits})\\b`, 'gi');
    const tokenForPortion = value => {
      const token = `__JK_PORTION_${portionTokens.length}__`;
      portionTokens.push(value);
      return token;
    };

    next = next.replace(portionRangeWithProtein, (match, low, high, protein, unit) => {
      const scaledLow = formatNumber(parseQuantity(low) * factor, unit, options);
      const scaledHigh = formatNumber(parseQuantity(high) * factor, unit, options);
      const unitText = pluralizeUnit(unit, parseQuantity(scaledHigh));
      const amount = scaledLow === scaledHigh ? scaledHigh : `${scaledLow}-${scaledHigh}`;
      return tokenForPortion(`${amount} ${protein} ${unitText}`);
    });

    next = next.replace(portionWithProtein, (match, quantity, protein, unit) => {
      const scaled = formatNumber(parseQuantity(quantity) * factor, unit, options);
      return tokenForPortion(`${scaled} ${protein} ${pluralizeUnit(unit, parseQuantity(scaled))}`);
    });

    const rangeWithUnit = new RegExp(`\\b(\\d+(?:\\s+\\d+\/\\d+|\/\\d+|\\.\\d+)?|[¼½¾⅓⅔])\\s*[-–]\\s*(\\d+(?:\\s+\\d+\/\\d+|\/\\d+|\\.\\d+)?|[¼½¾⅓⅔])${descriptorPattern}\\s+(${unitPattern})\\b`, 'gi');
    next = next.replace(rangeWithUnit, (match, low, high, descriptors, unit) => {
      const a = parseQuantity(low);
      const b = parseQuantity(high);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return match;
      const scaledLow = a * factor;
      const scaledHigh = b * factor;
      const formattedLow = formatNumber(scaledLow, unit, options);
      const formattedHigh = formatNumber(scaledHigh, unit, options);
      const unitText = pluralizeUnit(unit, parseQuantity(formattedHigh));
      const scaledRange = formattedLow === formattedHigh
        ? `${formattedHigh}${descriptors} ${unitText}`
        : `${formattedLow}-${formattedHigh}${descriptors} ${unitText}`;
      const token = `__JK_RANGE_${rangeTokens.length}__`;
      rangeTokens.push(scaledRange);
      return token;
    });

    const singleWithUnit = new RegExp(`\\b(\\d+(?:\\s+\\d+\/\\d+|\/\\d+|\\.\\d+)?|[¼½¾⅓⅔])${descriptorPattern}\\s+(${unitPattern})\\b`, 'gi');
    next = next.replace(singleWithUnit, (match, qty, descriptors, unit) => {
      const value = parseQuantity(qty);
      if (!Number.isFinite(value)) return match;
      const scaled = value * factor;
      const formatted = formatNumber(scaled, unit, options);
      return `${formatted}${descriptors} ${pluralizeUnit(unit, parseQuantity(formatted))}`;
    });
    rangeTokens.forEach((value, index) => {
      next = next.replace(`__JK_RANGE_${index}__`, value);
    });
    portionTokens.forEach((value, index) => {
      next = next.replace(`__JK_PORTION_${index}__`, value);
    });
    return next;
  };

  const scaleStandaloneNote = (note, factor, options = {}) => {
    const clean = String(note || '').trim();
    if (!clean || !factor || noScale.test(clean)) return clean;
    if (foodUnit.test(clean)) return scaleQuantityText(clean, factor, options);
    if (/^\d+(?:\.\d+)?$/.test(clean)) return formatNumber(Number(clean) * factor, '', options);
    const range = clean.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/);
    if (range) return `${formatNumber(Number(range[1]) * factor, '', options)}-${formatNumber(Number(range[2]) * factor, '', options)}`;
    return clean;
  };

  const labelForServings = (target, type) => {
    if (!target) return '';
    if (type === 'servings') return target === 8 ? 'Makes 6-8 servings' : `Makes ${target} servings`;
    return `Serves ${target}`;
  };

  const applyHeroServingLabel = (root, target, type) => {
    const label = labelForServings(target, type);
    if (!label) return;
    root.querySelectorAll('.hero-sub').forEach(node => {
      const current = node.textContent;
      if (/Serves\s+[^·]+/.test(current)) {
        node.textContent = current.replace(/Serves\s+[^·]+/, `${label} `);
      } else if (/Makes\s+[^·]+/.test(current)) {
        node.textContent = current.replace(/Makes\s+[^·]+/, `${label} `);
      }
    });
  };

  const scaleInstructionContent = (root, options = {}) => {
    const target = Number(options.targetServings || 0);
    const base = Number(options.baseServings || 0);
    if (!target || !base) return;
    const factor = target / base;
    applyHeroServingLabel(root, target, options.servingType || 'people');
    root.querySelectorAll('.ing').forEach(node => {
      if (node.closest('[data-no-scale]')) return;
      node.textContent = scaleQuantityText(node.textContent, factor, {
        friendlyFourServings: target === 4 && options.servingType !== 'servings'
      });
    });
  };

  window.KitchenQuantityScaler = {
    scaleQuantityText,
    scaleStandaloneNote,
    scaleInstructionContent,
    labelForServings
  };
})();
