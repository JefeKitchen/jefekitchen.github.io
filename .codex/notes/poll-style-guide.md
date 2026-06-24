# Dinner Poll Style Guide

This is an internal reference for future Codex work on the dinner poll. It is not linked in the app.

For complete new recipes, start with `.codex/notes/recipe-document-workflow.md`.

## Purpose

The dinner poll should feel like a lightweight, fun ballot for picking dinner. It should be fast to scan on a phone, open the user's SMS app with a silly prewritten response, and optionally let the voter preview a small menu card before voting.

## Poll Page

Primary file: `docs/poll/dinner-poll.html`.

Use the existing `WHAT DIN?` page structure unless the user asks for a redesign. Keep the page minimal:

- No extra explanatory copy.
- No numbering.
- No large headers besides `WHAT DIN?`.
- Keep the wildcard/write-in option at the bottom unless the user asks to remove it.
- Keep choices lowercase in SMS responses. Do not shout the selected dinner in all caps.
- Keep the response templates mad-lib style so the choice reads naturally.
- `Survey says: {choice}.` should be one possible response, not a prefix on every response.

Each normal poll option should be a `.poll-row` with:

- A main `.poll-option` that triggers SMS.
- A right-side `.poll-menu-link` using the scroll emoji/menu icon when lightweight menu cards exist.
- `data-choice` set to the natural lowercase choice text.
- `.option-title` as the visible dish name.
- Do not include `.option-note` subtitles/footers by default. They tend to repeat the dish title and make the poll feel cluttered.
- If the user specifically asks for subtitles, use a short, few-word summary of the dish. Do not list every ingredient, and do not auto-convert menu-card ingredient separators into comma lists.

Good optional poll summaries:

- `Tender meatballs · buttery noodles`
- `Soft chicken · mashed potatoes`
- `Creamy one-pot comfort`
- `Simple salmon · cool cucumber`

Bad poll summaries:

- `Ground beef, breadcrumbs, parmesan`
- `Chicken , broth , thyme`
- Long ingredient lists or anything with weird spaces around commas.

If the poll does not have menu cards, use a single-column poll row. If menu cards exist, use the two-column row: `1fr 48px`.

## Lightweight Menu Cards

For poll previews, create small menu cards rather than full recipe docs unless the user explicitly asks for full docs.

Use `.codex/notes/menu-card-style-guide.md` as the source of truth for menu card structure and formatting.

Path pattern:

`docs/<poll-option-slug>/<poll-option-slug>-menu.html`

The menu card should:

- Use `../menu-card.css`.
- Use the same classic menu structure as the rest of the app: `<main class="page">`, a `.header`, then `.section-label` plus `.menu-item` sections. Do not use the compact `mini-menu` or `course` layouts unless the user explicitly asks for a different experiment.
- Use `<body class="themed theme-...">` with a dish-appropriate theme class.
- Have a back button to `../poll/dinner-poll.html`, not the home page.
- Feel related to the dish, but stay subtle. Variety is good; over-designed is not.

Default sections:

1. Entree
2. Side
3. Drink

The user likes each menu option to include an entree and at least one side. For poll cards, the drink section should be a real pairing option, not just water/tea unless the user specifically wants that.

## Drink Pairings

Each poll menu card should include a matching drink. It can be:

- Cocktail
- Wine
- Beer

Match the feeling of the dish. Examples:

- Cozy beef/noodles: light red wine, amber lager, simple whiskey highball.
- Creamy chicken/orzo/noodle dishes: crisp white wine, chardonnay, gentle highball.
- Salmon/rice/cucumber: cucumber gin spritz, sauvignon blanc, pilsner.
- Pot pie/cozy skillet: amber ale, brown ale, soft whiskey drink.

Keep the pairing realistic and low-friction. The drink should feel like part of the menu, not a random cocktail bolted on.

## Menu Text Rules

For the small line under an item name, use ingredients only. Avoid notes like "same tray", "cozy", "simple", or process descriptions in that line.

Good:

`Chicken · orzo · broth · parmesan`

Not good:

`Same skillet · cozy and simple`

Use the description line for the vibe or preparation note.

## Themes

Poll menu card themes live in `docs/menu-card.css`. Add theme classes as needed, but keep the markup consistent with the established menu pages.

Theme guidance:

- Avoid making everything look identical.
- Keep palettes gentle and dish-appropriate.
- Do not make the whole app feel like a new brand just for a poll.
- For sensitive-stomach/cozy themes, use softer paper colors, muted green/brown/gold accents, and avoid aggressive red/orange-heavy palettes.

## Service Worker Cache

When changing the poll, adding menu cards, or updating CSS used by the poll cards:

- Bump `CACHE_NAME` in `sw.js`.
- Add each new menu card HTML file to `PAGES`.
- If changing shared instruction content or other versioned assets, keep query-string versions aligned.

This app is often tested on phone, so cache bumps matter.

## When To Build Full Recipe Docs

Do not create full grocery/instruction/wide docs for every poll option by default. Start with lightweight menu cards.

Build full docs only when:

- The user says the choice has been picked.
- The user asks to add the meal to the main app.
- The user asks for grocery/instruction docs.

When a poll option becomes a real recipe, follow the shared instruction-content pattern used by the rest of the app.

## SMS Response Rules

Keep the current response concept:

- Randomly select one response template per vote.
- Choice should fit naturally into the sentence.
- Keep choices lowercase unless the user explicitly asks otherwise.
- Keep `Survey says: {choice}.` as one of the templates.
- Preserve Android/iOS SMS link handling.

Current response style examples:

- `Survey says: {choice}.`
- `I have consulted my heart and my belly, and they both request {choice}.`
- `After careful deliberation, the council has selected {choice}.`
- `Tonight feels like {choice}.`

## Home Page

The Pick Din banner may be hidden or shown depending on the user's current preference. Do not assume it should be visible just because the poll changed. If the user says they want to send/use the poll, make sure the home page entry point matches their latest preference.
