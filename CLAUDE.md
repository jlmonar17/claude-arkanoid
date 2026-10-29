# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## State of the project

Spec 01 (`specs/01-arkanoid-mvp.md`) implements a playable MVP in the browser (HTML + Canvas + JS, no modules or build): `index.html` loads `assets/spritesheet.js` and `game.js` with plain `<script>` tags. The stack decision is settled: browser/Canvas, not Pygame (the README describes this).

- Run: serve the repo root with a static server (e.g. `python3 -m http.server 8000`) and open `http://localhost:8000`. Do not use `file://` (the sprite PNG would taint the canvas).
- `game.js` keeps all state in a single `state` object (`phase`: `ready | playing | won | gameover`) and runs a `requestAnimationFrame` loop started inside the `loadSpritesheet` callback.
- No package manager, linter or automated tests exist; verification is manual in the browser.
- Block explosions (spec 02): breaking a block pushes `{ x, y, w, h, color, elapsed }` into `state.explosions`; `updateExplosions(dt)` advances them in every phase and `draw` renders them with `EXPLOSION_FRAMES` / `EXPLOSION_DURATION`. `won` is only reached once no blocks and no explosions remain.
- Not used yet: `assets/sounds/*` (sound is out of scope for specs 01 and 02).

## Assets

- `assets/spritesheet-breakout.png` — single sprite atlas. `assets/spritesheet.js` is the coordinate map for it.
- `assets/spritesheet.js` globals: `SPRITES` (`paddle`, `ball`, `blocks.<color>`), `EXPLOSION_FRAMES` (4 frames per color), `EXPLOSION_DURATION` (150 ms), plus loader/draw helpers `drawFrame(ctx, frame, x, y, w, h)` and `drawSprite(ctx, name, x, y, w, h)` (`name` is `paddle`, `ball` or `block_<color>`). Draw helpers silently no-op until the image is loaded (`ssLoaded`); the loader re-slices the PNG through an offscreen canvas and fires queued `ssCallbacks`. Image path is hard-coded relative to the page: `assets/spritesheet-breakout.png`, so serve the HTML from the repo root.
- Block colors: red, cyan, green, magenta, yellow, hotpink, gray. Note `EXPLOSION_FRAMES.gray` reuses the red frames.
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — bounce and block-break SFX.

## Spec-driven workflow

Skills live in `.agents/skills/` (symlinked from `.claude/skills/`; versions pinned in `skills-lock.json`, source `Klerith/fernando-skills`). Both are user-invoked only:

- `/spec <short feature description>` — interviews the user, then writes a spec to `specs/NN-name.md` (template: `.agents/skills/spec/template.md`). No code is written in this step. Replies follow the language of the prompt; new specs must match the language and wording of existing ones.
- `/spec-impl <NN-spec-name>` — requires the spec state to mean "Approved", creates/switches to a git branch named after the spec (configurable via `specs/.spec-config.yml`, `AutoCreateBranch`), then implements step by step, pausing for diff review.

No `specs/` folder exists yet. Large features should go through `/spec` first.
