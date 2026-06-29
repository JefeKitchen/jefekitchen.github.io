# Recipe Document Workflow

This is the first internal note to read before adding a new recipe to Jefe's Kitchen. It is not linked in the app.

## Goal

Every new recipe should feel like it has always belonged in the app. Do not create a new visual pattern unless the user explicitly asks for a redesign.

Design posture: subtle first. Prefer the quietest useful control, small affordances, restrained color, and minimal text. It is better to start too minimal and let the user ask for more emphasis than to introduce loud buttons, oversized pills, or decorative UI that has to be toned down later.

Architecture posture: hook new functionality into existing recipe data, renderers, styles, and utilities first. When a feature deals with existing recipes, instructions, grocery lists, or planning data, reuse the existing framework and create only the small amount of new glue needed. Avoid duplicate catalogs, duplicate renderers, and hand-written copies of recipe content.

A complete recipe usually means:

- Home page card/catalog entry
- Shared recipe metadata and shopping items in docs/recipe-catalog.js
- Menu card
- Theme-matched drink pairing for dinner recipes
- Grocery list
- Phone cooking instructions
- Wide/desktop cooking instructions
- Shared instruction content in docs/instruction-content.js
- Service worker cache/page list updates

## Read These First

Before creating or substantially editing a recipe, use these references:

- .codex/notes/menu-card-style-guide.md for menu HTML files
- .codex/notes/shopping-list-style-guide.md for grocery list HTML files and This Week shopping
- .codex/notes/instruction-style-guide.md for instruction HTML files, wide HTML files, and docs/instruction-content.js
- .codex/notes/poll-style-guide.md for dinner poll options and lightweight poll menu previews

## Canonical Examples

Use existing mature docs as the model rather than inventing from memory.

Menu cards:

- docs/honey-mustard/honey-mustard-menu.html
- docs/chicken-skewers/chicken-skewers-menu.html
- docs/teriyaki/teriyaki-menu.html

Grocery lists:

- docs/honey-mustard/grocery-list-honey-mustard.html
- docs/chicken-skewers/grocery-list-chicken-skewers.html
- docs/buffalo-chickpea-dip/grocery-list-buffalo-chickpea-dip.html

Instruction pages:

- docs/smash-sliders/slider-wide.html for wide section header style
- docs/chicken-skewers/chicken-skewers-instructions.html for section-specific ingredient pull buttons
- docs/honey-mustard/honey-mustard-instructions.html for clean phone instruction rhythm

## Non-Negotiables

- Menu cards use the classic main.page, .header, .section-label, and .menu-item structure.
- Dinner recipe menu cards include a Drink or Cocktail section with a pairing that fits the meal's theme or vibe.
- Breakfast and snack entries do not need a drink pairing unless the user asks.
- Grocery lists use the established light grocery-list format with store sections, small aligned checkboxes, .item-note, and checked-item strikethrough.
- Cooking instructions use shared content from docs/instruction-content.js; phone and wide pages are render shells.
- Home planning and This Week shopping use docs/recipe-catalog.js as the shared recipe registry. Do not duplicate recipe names, paths, or shopping items inside index.html or the This Week grocery page.
- Dinner cooking instructions put the drink as the first instruction section. Simple wine or beer pairings can be a short tongue-in-cheek instruction.
- Ingredient pull pills are section-specific, clickable independently, conservative, and contain practical ingredient names only. Do not include generic serving vessels like `Glass`, and collapse variants like `day-old rice` / `fresh rice fallback` into `Rice`.
- Ingredients in instructions are highlighted with .ing wherever practical.
- Quantities should be present whenever the user would otherwise have to guess. Approximate language is fine.
- Wide instruction section headers match Smash Sliders: small gold context label above a Playfair action title.
- Step numbers must never overlap instruction text. Fix shared CSS if needed.
- Add new docs to sw.js when they should work offline, and bump the cache for app-facing changes.

## Recipe Build Order

1. Add or update docs/recipe-catalog.js first with the recipe id, title, subtitle, section, paths, and shopping items.
2. Create phone and wide instruction shells from existing thin-render pages.
3. Create the grocery list by copying a mature grocery list and changing content only.
4. Create the menu card by copying a mature menu card and changing content/theme only.
5. Add or update shared instruction content in docs/instruction-content.js.
6. Add any poll data needed.
7. Update sw.js page list and cache.
8. Verify in browser before saying done.

## Verification Checklist

Before finishing any new recipe, check at least one page from each category in the browser or by direct file inspection:

- Menu card looks like the existing classic menu cards and has a theme-matched drink for dinner recipes.
- Grocery list looks like the existing old-format lists, not a card/dashboard layout.
- Phone instructions have clean step spacing and section-specific ingredient pills.
- Wide instructions have Smash-style section headers and no awkward overlap.
- Home page links go to the right menu, grocery, and instruction choices.
- Cache was bumped, new offline pages were added to sw.js, and rendered pages are loading the expected content/renderer/CSS query versions.

If any of those fail, fix before reporting back.

## Prep List Metadata

- When adding or materially changing a recipe, add prep-ahead section references in `docs/prep-catalog.js`.
- `docs/prep-catalog.js` is metadata only. Do not write separate Prep step text, ingredient lists, storage notes, or formatting there.
- Prep references should point to real instruction section titles from `docs/instruction-content.js`, with optional zero-based `steps` indexes if only part of a section is prep-ahead.
- Prep tasks stay recipe-specific. Do not merge shared tasks across recipes, even if the ingredient is the same, because the user wants amounts stored with the correct meal.
- Keep prep references practical: chop/store vegetables, cook rice ahead, portion proteins, mix sauces, measure spice blends, or stage toppings. Avoid filler tasks.
- Prep ingredient pills and bolded ingredient text should come from `docs/instruction-tools.js` extracting the real instruction section, not from hand-written Prep copy.
- Normal meal defaults should target 3 servings. Snackies should keep serving-style estimates, usually 6-8 servings.

## This Week Prep Utility

- The Prep card is not permanent on the home page. It is a removable This Week utility item added from the same + menu as recipes.
- Prep opens `docs/combined-shopping/this-week-prep.html` and derives upcoming meals from the shared This Week plan data.
- Prep should use desktop width well: recipe cards span the page and prep tasks flow into columns inside each recipe. Do not make recipe cards into narrow side-by-side phone cards.
- The Prep utility should render immediately after Grocery List in This Week whenever both are present.
- The page title should be `Prep`, not `Prep List`.
- Prep task cards should use the actual wide instruction card structure/classes (`.section-card`, `.section-head`, `.section-label`, `.pull`, `.pill`, `ol > li`) so the page is visually seamless with recipe instructions.
- Prep should render instruction cards through shared instruction helpers (`docs/instruction-tools.js`) rather than recreating card markup or ingredient parsing inside the Prep page.
- Prep should visually group tasks by recipe. The recipe name belongs in the group heading; individual task card labels should stay short, usually only the prep category, with no servings/lunch metadata.
- Prep must override the shared phone-first `theme.css` body width on desktop/tablet. The wide Prep view should use a full-width shell, not the default 480px document width.
- Prep completion should happen at the recipe group level, not the individual task level. The recipe group header carries day/serving metadata once and acts as the subtle completion control; do not show a checkbox unless the user asks for one.
- Prep recipe headings should be lightweight script-style dividers, not full-width boxed cards. Keep the task cards looking like normal instruction cards underneath.
- Do not render separate storage/reheat footers in Prep. Fold only the useful storage action into the step itself, and skip reheat notes.
- Prep steps should mirror the recipe exactly for prep-ahead work. Use the recipe's actual amounts and wording, including fuzzy language like `pinch` or `splash` when that is what the recipe calls for. Do not introduce new approximate amounts or vague substitutions that are not in the recipe.
- Dated This Week entries with dates before today should be pruned from plans and shopping data, not merely hidden with CSS.
