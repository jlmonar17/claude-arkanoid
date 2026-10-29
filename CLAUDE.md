# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## State of the project

Pre-implementation. No game code, build system, package manager, linter or tests exist yet — only `README.md`, `assets/` and spec-driven-workflow skills. There are no build/lint/test commands to document; add them here once they exist.

`README.md` (Spanish) describes an Arkanoid game "developed in Python with Pygame" and says it is not yet implemented. However, `assets/spritesheet.js` is browser JavaScript (Canvas 2D `ctx.drawImage`, `Image`, `document`-style loading). The stack is therefore unresolved: confirm with the user (or an approved spec) before choosing Pygame vs. browser/Canvas. If JS is chosen, `assets/spritesheet.js` is meant to be loaded via a plain `<script>` (it defines globals, no modules/exports).

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
