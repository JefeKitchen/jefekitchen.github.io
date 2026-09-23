# Jefe's Kitchen Agent Guide

Start every recipe or planning change with [`.codex/notes/recipe-document-workflow.md`](.codex/notes/recipe-document-workflow.md). It is the detailed, repo-specific source of truth for recipe structure, styling, verification, and cache behavior.

## Project Map

- `index.html`: home screen and This Week interaction surface.
- `docs/recipe-catalog.js`: canonical recipe registry, sections, paths, and shopping items. Add a recipe here before wiring any UI.
- `docs/instruction-content.js`: canonical cooking copy. Phone and wide instruction pages both render this content; do not duplicate steps by layout.
- `docs/recipe-serving-data.js`: base and default servings for recipe scaling.
- `docs/prep-catalog.js`: references to actual prep-ahead instruction sections. Do not duplicate prep copy here.
- `docs/instruction-renderer.js`, `docs/instruction-tools.js`, `docs/theme.css`, `docs/wide-layout.css`: shared instruction behavior and presentation.
- `docs/combined-shopping/`: dynamic This Week shopping and Prep views.
- `docs/firebase-state.js`: shared Firebase-backed This Week, shopping, and poll state.
- `sw.js`: offline app shell and cache version.

New normal meals added to This Week default to 4 servings and have Shop enabled. Snackies retain their serving-style defaults.

## Non-Negotiables

1. Prefer extending the shared catalog, renderers, and utilities over creating a second data source or hand-written duplicate markup.
2. A complete dinner recipe normally includes catalog data, servings, shared instruction content, phone and wide shells, a menu, grocery list, prep references, and service-worker cache entries.
3. Dinner recipes have a drink pairing that matches the meal and appears first in the shared instruction content. Breakfast and Snackies do not need one.
4. Instruction steps need usable quantities whenever the amount is not self-evident. `A drizzle`, `a pinch`, and similar language are fine when intentional.
5. Keep ingredients bolded with `.ing`; ingredient pills stay conservative and local to the relevant section.
6. Prep is a filtered view of exact recipe work that can be done safely ahead. It must not invent amounts, duplicate formatting logic, include appliance-only setup, or merge work across recipes.
7. Keep UI additions subtle. The app favors dense, calm, practical surfaces over visible controls or decorative copy.

## Change Checklist

- Read the relevant guide in `.codex/notes/` before editing.
- Use the current thin instruction-shell template in `templates/doc-template.html` for phone and wide views.
- Update `sw.js` when adding offline pages or changing shared cached assets. Keep cache/query versions aligned.
- Verify at least one rendered phone and one wide instruction view when touching shared recipe/instruction behavior.
- Run `git diff --check` and syntax-check touched shared JavaScript before committing.
- Run `node scripts/audit-recipes.cjs` after recipe/catalog/prep changes; it checks every active recipe and its shared wiring.

## Detailed References

- `.codex/notes/recipe-document-workflow.md`
- `.codex/notes/instruction-style-guide.md`
- `.codex/notes/shopping-list-style-guide.md`
- `.codex/notes/menu-card-style-guide.md`
- `.codex/notes/poll-style-guide.md`
