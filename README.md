# Jefe's Kitchen

A private, mobile-first recipe planner for menus, instructions, grocery runs, weekly meal plans, shared prep, and dinner polls. It is a static GitHub Pages site with Firebase providing shared state for This Week, shopping, and poll votes.

## Run Locally

The app has no build step. Serve the repository root:

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173/index.html`.

## Publish

The production site is served from the `main` branch of the GitHub repository. Commit and push to publish. `sw.js` controls the app-shell cache; bump its cache name and relevant asset query versions whenever shared content, CSS, or scripts change so installed home-screen apps receive the update.

## Recipe Architecture

Recipe data is deliberately split by responsibility:

| File | Responsibility |
| --- | --- |
| `docs/recipe-catalog.js` | Recipe registry, home sections, links, and shopping ingredients |
| `docs/instruction-content.js` | One shared source of cooking instructions for phone and wide layouts |
| `docs/recipe-serving-data.js` | Base/default serving counts and scaling mode |
| `docs/prep-catalog.js` | References to safe prep-ahead portions of the instruction data |
| `docs/combined-shopping/` | Dynamic weekly shopping and Prep pages |
| `docs/firebase-state.js` | Cross-device weekly plan, shopping, and poll state |

Recipe folders contain the lightweight public entry points: a menu card, standalone grocery list, phone instruction shell, and wide instruction shell. The instruction shells deliberately contain no recipe steps; those live in `docs/instruction-content.js`.

## Working On Recipes

The complete contributor guide is [`AGENTS.md`](AGENTS.md). For detailed visual and behavior conventions, start with [`.codex/notes/recipe-document-workflow.md`](.codex/notes/recipe-document-workflow.md).

The important rule is simple: new features should attach to the catalog and shared renderers first. Avoid separate recipe registries, copy-pasted instruction text, or page-specific substitutes for existing frameworks.
