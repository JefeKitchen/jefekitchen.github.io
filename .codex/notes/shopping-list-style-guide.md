# Shopping List Style Guide

This is an internal reference for future Codex work on grocery and shopping lists. It is not linked in the app.

For complete new recipes, start with `.codex/notes/recipe-document-workflow.md`.

## Purpose

Shopping lists should be fast to use in an actual grocery store: clear sections, tappable rows, small checkboxes, notes that do not crowd the item name, and checked items that strike through. They should feel utilitarian and familiar, not like recipe cards or menu cards.

Use this guide any time creating or editing a `grocery-list-*.html` file or `docs/combined-shopping/this-week-shopping-list.html`.

## Canonical Examples

Use established grocery lists as the model:

- `docs/honey-mustard/grocery-list-honey-mustard.html`
- `docs/chicken-skewers/grocery-list-chicken-skewers.html`
- `docs/buffalo-chickpea-dip/grocery-list-buffalo-chickpea-dip.html`
- `docs/combined-shopping/this-week-shopping-list.html` for the dynamic This Week list

If a new list looks different from those without a specific reason, fix it before finishing.

## Regular Recipe Lists

Regular grocery lists should use:

- Mobile-first width, around `max-width: 480px`.
- Light grocery-list background.
- `page-title` set to `Grocery List`.
- `page-sub` set to the recipe name.
- Sticky arrow-only back button to `../../index.html`.
- White `.section` cards with subtle borders and `6px` radius.
- Black `.section-header.need` for normal store sections.
- Optional gray `.section-header.have` only for "Already Have" sections.

Do not add auxiliary explainer text. The user generally dislikes filler copy on utility pages.

## Store Section Order

Use store-location sections, not recipe-step sections.

Default order:

1. Produce
2. Meat/Seafood
3. Dairy
4. Refrigerated
5. Pantry
6. Snacks
7. Alcohol/Drinks
8. Misc

Notes:

- Garlic belongs in Produce.
- Alcohol and drink ingredients get their own `Alcohol/Drinks` section.
- Do not put olive oil on future shopping lists unless the user explicitly asks.
- Do not assume the user has sauce bottles, fresh herbs, ginger, garlic, mint, cornstarch, sesame, pita chips, or other non-basic items.
- It is okay to omit true kitchen essentials like salt, pepper, and common dried spices from This Week if the user has said they have them.

## Item Rows

Each row should follow this pattern:

```html
<div class="item">
  <input type="checkbox" id="i1">
  <label for="i1">Item name<span class="item-note">Amount or short note</span></label>
</div>
```

Rules:

- Checkbox size should be about `16px` unless an existing page has a local reason to differ.
- Checkbox and text should align cleanly on the first line.
- Use `gap` between checkbox and text so notes/amounts are not jammed against item names.
- Amounts and side comments go in `.item-note`, not crammed into the item text.
- Notes should be short and practical.
- Checked items must become muted and strikethrough.
- Rows should be tappable/clickable without making the layout jump.

Good:

```html
<label for="i4">Pita<span class="item-note">1 pack; use for skewers and dip</span></label>
```

Avoid:

```html
<label for="i4">Pita 1 pack; use for skewers and dip</label>
```

## This Week Shopping List

Primary file:

`docs/combined-shopping/this-week-shopping-list.html`

This Week is dynamic and should behave differently from static recipe lists:

- It starts empty when there are no selected recipes or custom ingredients.
- Do not show empty store sections.
- Do not show filler text like "Add items as needed."
- Keep the top action as `+ Add Ingredient`.
- The add form should let the user pick a section.
- `Complete Shopping Trip` should be a yellow button.
- Completing a trip removes checked items from the shopping list without removing recipe cards from This Week.
- Dynamic recipe additions should add list items by store section.
- Removing a recipe from This Week should also remove that recipe's items from the This Week shopping list.
- If This Week recipe cards have dates, they should sort chronologically on the home page.

The This Week list may use recipe subheads inside store sections so the user can see which recipe each item belongs to.

## Dynamic Item Behavior

For dynamic list code:

- Store user-added items in `localStorage`.
- Store selected recipe IDs in `localStorage`.
- Store purchased/checked items separately so completed trips can remove checked entries.
- Keep custom added items separate from recipe-generated items.
- Keep the list resilient if a recipe is removed or renamed.

When adding recipes to the catalog, include every non-basic shopping item the recipe needs unless the user has specifically said to exclude it.

## Effects

The completion effect is allowed and should stay subtle:

- Grocery completion can use the existing small explosion/pop effect.
- Do not add loud confetti-style effects unless the user asks.
- Effects should not block tapping or checking items.

## Cache

When creating or editing shopping lists:

- Bump `CACHE_NAME` in `sw.js`.
- Add new grocery list HTML files to `PAGES` if they should be available offline.
- If changing shared grocery scripts or CSS, make sure cached assets and query strings are aligned.

## Quick Checklist

Before finishing a shopping-list change:

- Sections are ordered like a grocery store.
- No empty sections are visible.
- Checkbox size and alignment match existing lists.
- Checked rows strike through.
- Notes are in `.item-note`, not jammed into item names.
- This Week behavior preserves recipe cards when completing a shopping trip.
- This Week recipe removal also removes that recipe's shopping items.
- No unrequested auxiliary text was added.
- The service worker cache was bumped for app-facing changes.
