# Recipe Document Workflow

This is the first internal note to read before adding a new recipe to Jefe's Kitchen. It is not linked in the app.

## Goal

Every new recipe should feel like it has always belonged in the app. Do not create a new visual pattern unless the user explicitly asks for a redesign.

Design posture: subtle first. Prefer the quietest useful control, small affordances, restrained color, and minimal text. It is better to start too minimal and let the user ask for more emphasis than to introduce loud buttons, oversized pills, or decorative UI that has to be toned down later.

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
