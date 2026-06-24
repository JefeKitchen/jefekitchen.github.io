# Recipe Document Workflow

This is the first internal note to read before adding a new recipe to Jefe's Kitchen. It is not linked in the app.

## Goal

Every new recipe should feel like it has always belonged in the app. Do not create a new visual pattern unless the user explicitly asks for a redesign.

A complete recipe usually means:

- Home page card/catalog entry
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
- Dinner cooking instructions put the drink as the first instruction section. Simple wine or beer pairings can be a short tongue-in-cheek instruction.
- Ingredient pull pills are section-specific, clickable independently, and contain ingredient names only.
- Ingredients in instructions are highlighted with .ing wherever practical.
- Quantities should be present whenever the user would otherwise have to guess. Approximate language is fine.
- Wide instruction section headers match Smash Sliders: small gold context label above a Playfair action title.
- Step numbers must never overlap instruction text. Fix shared CSS if needed.
- Add new docs to sw.js when they should work offline, and bump the cache for app-facing changes.

## Recipe Build Order

1. Add or update shared recipe data/content first.
2. Create phone and wide instruction shells from existing thin-render pages.
3. Create the grocery list by copying a mature grocery list and changing content only.
4. Create the menu card by copying a mature menu card and changing content/theme only.
5. Add the home page catalog entry and any This Week/poll data needed.
6. Update sw.js page list and cache.
7. Verify in browser before saying done.

## Verification Checklist

Before finishing any new recipe, check at least one page from each category in the browser or by direct file inspection:

- Menu card looks like the existing classic menu cards and has a theme-matched drink for dinner recipes.
- Grocery list looks like the existing old-format lists, not a card/dashboard layout.
- Phone instructions have clean step spacing and section-specific ingredient pills.
- Wide instructions have Smash-style section headers and no awkward overlap.
- Home page links go to the right menu, grocery, and instruction choices.
- Cache was bumped and new offline pages were added to sw.js.

If any of those fail, fix before reporting back.
