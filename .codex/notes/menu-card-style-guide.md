# Menu Card Style Guide

This is an internal reference for future Codex work on recipe and poll menu cards. It is not linked in the app.

For complete new recipes, start with `.codex/notes/recipe-document-workflow.md`.

## Purpose

Menu cards should feel like small printed menus from Jefe's Kitchen: classic, centered, calm, and consistent with the existing recipe cards. They should not look like app cards, dashboards, numbered courses, or compact poll widgets.

Use this guide any time creating or editing a `*-menu.html` file.

For grocery/shopping list formatting, use `.codex/notes/shopping-list-style-guide.md` instead.

## Canonical Example

Use existing mature cards as the model:

- `docs/honey-mustard/honey-mustard-menu.html`
- `docs/chicken-skewers/chicken-skewers-menu.html`
- `docs/teriyaki/teriyaki-menu.html`

If in doubt, mirror `docs/honey-mustard/honey-mustard-menu.html`.

## Required Structure

Every menu card should use the classic menu structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recipe Name Menu</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Bebas+Neue&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../menu-card.css">
</head>
<body class="themed theme-example">
<div class="back-bar"><a href="../../index.html" aria-label="Back to kitchen">&#8249;</a></div>

<main class="page">
  <header class="header">
    <div class="eyebrow">Short Mood</div>
    <div class="title">Recipe <span>Name</span></div>
    <div class="sub">One short sentence that sells the menu.</div>
    <div class="ornament">&mdash; &bull; &mdash;</div>
  </header>

  <div class="section-label">Main</div>
  <section class="menu-item">
    <div class="item-name">Menu Item</div>
    <div class="item-sub">Ingredient &middot; ingredient &middot; ingredient</div>
    <div class="item-desc">Short italic description of the dish or preparation.</div>
  </section>

  <footer class="footer">Short closing line.</footer>
</main>
</body>
</html>
```

Do not use:

- `<main class="page mini-menu">`
- `<section class="menu-card">`
- `.course`
- `.main-course`
- `.footer-note`
- visible course numbers
- dashboard/app-card styling

## Back Links

Use the right destination for the menu's context:

- Full recipe in the main app: `../../index.html`
- Poll-only preview card: `../poll/dinner-poll.html`

The back button should stay as the prominent arrow only, with no "Kitchen" text.

## Drink Pairings

Dinner recipe menu cards should include a Drink or Cocktail section unless the user explicitly says otherwise.

Rules:

- The drink should match the meal's theme or vibe.
- Wine, beer, cider, or a simple highball is fine when that fits better than a cocktail.
- Breakfast and snack entries do not need drink sections unless requested.
- Keep item-sub as ingredients only, even for drinks.

## Content Shape

Full recipe menu cards can have whatever sections fit the meal, but the common pattern is:

- `Main`
- `Side`
- `Drink` when there is a drink pairing
- `Dessert` when relevant

Poll preview cards should usually have:

- `Main`
- `Side`
- `Drink`

The user likes poll options to include an entree, at least one side, and a matching drink.

## Item Text Rules

The `.item-sub` line should be ingredients only.

Good:

```html
<div class="item-sub">Chicken &middot; orzo &middot; broth</div>
```

Avoid:

```html
<div class="item-sub">Same tray &middot; cozy and simple</div>
```

Use `.item-desc` for vibes, technique, or serving notes.

Keep text short. These are menu cards, not instructions.

## Theme Rules

Use `<body class="themed theme-...">` and theme variables from `docs/menu-card.css`.

If adding a new theme:

- Keep it subtle and dish-appropriate.
- Prefer paper, ink, muted green/brown/gold, warm citrus, or gentle seafood tones.
- Avoid making the menu look like a different app.
- Variety is good, but the structure should remain consistent.

## Fonts and CSS

Always use:

- `Playfair Display`
- `Cormorant Garamond`
- `Bebas Neue`
- `../menu-card.css`

Do not switch menu cards to `Source Sans`, app UI fonts, or custom one-off CSS unless the user explicitly asks for a special redesign.

## Cache

When creating or editing menu cards:

- Bump `CACHE_NAME` in `sw.js`.
- Add new menu HTML files to `PAGES` if they should be available offline.

This matters because the user frequently tests from phone and home-screen Safari.

## Quick Checklist

Before finishing a menu-card change:

- The file uses `<main class="page">`.
- The file has a `.header`, `.section-label`, and `.menu-item` sections.
- There are no `.course`, `.menu-card`, `.mini-menu`, or `.footer-note` elements.
- The back link goes to the right place.
- The `.item-sub` lines contain only ingredients.
- The service worker cache was bumped.
