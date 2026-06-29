# Instruction Style Guide

This is an internal reference for future Codex work on cooking instruction docs. It is not linked in the app.

For complete new recipes, start with `.codex/notes/recipe-document-workflow.md`.

## Purpose

Cooking instructions should be calm, readable, and hard to mess up while actively cooking. The user follows instructions closely, so steps should include approximate quantities whenever an ingredient amount is not obvious.

Use this guide any time creating or editing `*-instructions.html`, `*-wide.html`, or `docs/instruction-content.js`.

## Source Of Truth

Recipe steps should live in `docs/instruction-content.js`.

Phone and wide/desktop instruction pages should be thin render shells that point at the shared recipe content:

```html
<body data-recipe="recipe-id" data-layout="phone">
  <div id="instruction-root"></div>
</body>
```

```html
<body data-recipe="recipe-id" data-layout="wide">
  <div id="instruction-root"></div>
</body>
```

Do not duplicate separate instruction text between phone and wide layouts unless there is no practical alternative.

## Drink First Rule

Dinner recipes should put a theme-matched drink as the first instruction section in shared content.

Rules:

- The drink should fit the meal's theme or vibe, not feel randomly attached.
- If the pairing is simple wine, beer, or cider, use one short tongue-in-cheek instruction.
- Breakfast and snack entries do not need drink sections unless the user asks.
- Put the drink section in docs/instruction-content.js so phone and wide layouts both get it.

## Step Layout

Numbered cooking steps must reserve dedicated space for the number badge.

The shared CSS should keep step numbers and text in separate columns:

- Phone `.cook-steps li`: use grid or another explicit two-column layout.
- Wide `ol li`: use grid or another explicit two-column layout.
- The number column should be fixed width.
- The instruction text column should be `minmax(0, 1fr)` or equivalent.
- Do not absolutely position step numbers over padded text. It can look fine in one viewport and overlap in another.
- Long wrapped instructions must continue under the instruction text, not under the number.

If numbers appear to overlap the instructions, fix shared CSS first before changing recipe text.

## Ingredient Pull Buttons

Ingredient pills/buttons should live near the section where they are used, not all piled at the top of the recipe.

Rules:

- Put an ingredient-pull block immediately before the matching cooking block.
- It is okay to repeat an ingredient in multiple sections if the user needs to pull it again for that section.
- Do not sync clicked ingredient state across sections. Each section should be independent.
- Keep pill text as ingredient names, not quantities or instructions.
- Be conservative. Pills are for what the cook should physically pull out for that section, not every phrase in the steps.
- Collapse variants into the useful ingredient name. Example: use `Rice`, not separate `Day-old rice` and `Fresh rice fallback` pills.
- Do not include serving niceties or generic vessels such as `Glass`, `Plate`, or `Bowl` unless the vessel is truly the cooking tool for that step.

Good pill text:

- `Chicken thighs`
- `Garlic`
- `Pita`
- `Green onions`

Bad pill text:

- `olive oil per 2 pitas`
- `15-20 minutes`
- `medium heat`

## Ingredient Highlighting

Ingredients in instruction text should be bold/highlighted using `.ing` where practical.

When adding new recipes:

- Bold real ingredients.
- Avoid bolding temperatures, times, heat levels, or vague process words.
- If the renderer creates ingredient pills from highlighted ingredients, check that the pills are clean.
- Always inspect the rendered pills after changing instruction content. Source text can look fine while cached content or generated pills are still wrong.

## Quantities

The user does not need every salt-and-pepper amount, but they does want useful guidance.

Good:

- `a drizzle`
- `about 1 tbsp`
- `a tiny splash`
- `a thin layer`
- `cold salted water`
- `finish with lemon`

Avoid:

- `add olive oil` with no indication of amount
- `add garlic` with no count or approximate amount
- leaving sauce/dip quantities entirely implicit

## Wide Layout

Wide instructions are for iPad/desktop and should use the same content as phone instructions.

Rules:

- Section card headers should match the Smash Sliders style: a small uppercase context label above a concise title.
- Use labels in the form `Component · Method` or `Component · Location`, such as `Meatballs · Skillet`, `Rice · Stovetop`, `Salmon · Oven`, or `Cucumber · No Heat`.
- Avoid vague labels like `Start first`, `Gentle mix`, `Tiny sauce`, or `Build`; they look less polished in the wide card header.
- Keep the main `h3`/wide `h2` title as the action, such as `Brown Gently and Simmer` or `Make the Cucumber Salad`.
- Wide section headers should remain visually like Smash Sliders: gold small label, larger Playfair title in normal case, raised dark header background.
- If a wide page also loads `theme.css`, make sure `wide-layout.css` explicitly wins for `.section-card .section-head`, `.section-card .section-label`, and `.section-card .section-head h2`.
- Avoid rows with awkward blank space.
- Half-width cards should pair cleanly.
- If a card would leave an odd blank slot, either pair it with another half-width card or make it full-width.
- Dense setup sections can be full-width and split into columns.
- Drinks can be half-width unless they need full width for balance.

## Cache

When changing instruction content, renderer behavior, or shared instruction CSS:

- Bump `CACHE_NAME` in `sw.js`.
- If changing `docs/instruction-content.js`, bump its query string in instruction pages and/or `sw.js` when needed.
- If changing `docs/instruction-renderer.js`, bump its query string in instruction pages and/or `sw.js` when needed.
- Shared CSS changes should still bump the service worker cache.
- Verify the service worker version and the page query strings agree. Do not leave pages on a newer `instruction-content.js?v=N` while `sw.js` precaches an older one.

## Quick Checklist

Before finishing an instruction change:

- Phone and wide layouts use shared content.
- Step numbers do not overlap text at phone or wide widths.
- Ingredient pills are clean and section-specific.
- Rendered ingredient pills are conservative: no duplicate variants, no quantities, no instruction phrases, and no generic serving vessels like `Glass`.
- Ingredients are highlighted consistently.
- Approximate quantities are present where the user would otherwise have to guess.
- The service worker cache was bumped for app-facing changes.
- The browser loaded the expected `instruction-content.js`, `instruction-renderer.js`, and CSS query versions after cache bumps.
