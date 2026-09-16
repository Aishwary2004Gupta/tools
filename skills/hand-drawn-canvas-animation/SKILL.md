---
name: hand-drawn-canvas-animation
description: Make a short hand-drawn-looking animated film where every frame is drawn by JavaScript on Canvas 2D in one HTML file, then render it to mp4 with a generated Web Audio score. The look is an illustrated, hatched, riso-misprinted cartoon drawn on twos (12 fps), with blueprint interludes, ink-blot transitions and hex-lattice details. Use when the user asks for an animation, animated explainer, "мультик", "рисованный ролик", "нарисуй анимацию кодом", "every frame drawn in JavaScript", a procedural or generative short film, or a canvas video in this style for any subject (biology, hardware, a product, a story). Not for UI animation, charts, or Remotion slide decks.
---

# Hand-drawn canvas animation

You are drawing every frame of a 10 to 30 second film in JavaScript. One HTML
file, vanilla Canvas 2D, no images, no libraries, no video model. Frames are
screenshotted by headless Chrome and packed by ffmpeg. The music is generated
by the same file from the same timeline.

What it looks like when it works: `assets/preview-fly-style.jpg` (a worked
9.5 s example, source in `examples/fly-style.html`) and
`assets/preview-starter.jpg` (the starter file). Look at both before you begin.

## Files in this skill

| Path | Use it for |
|---|---|
| `assets/starter.html` | The file you copy. Kit of drawing primitives, one puppet, three demo scenes, timeline, score, player, render hooks. Tested. |
| `examples/fly-style.html` | A larger worked film: a fly on a peach, ink blot, blueprint egg dividing, camera-follow flight, compound-eye mosaic. Read it when a recipe is unclear. |
| `scripts/render.mjs` + `scripts/package.json` | Headless render: PNG frames, mp4 on twos, contact sheet. `--only` for spot checks. |
| `references/style.md` | The mandatory look rules and the vocabulary table (term → look → kit call). Read before drawing anything. |
| `references/architecture.md` | File layout, invariants, performance budget, how to build a puppet, pitfalls. Read before editing code. |
| `references/scenes.md` | 13 scene recipes, timing and editing rules, score motifs. Read while writing the beat sheet. |
| `references/brief-template.md` | Brief format to fill from the user's request. |
| `references/reference-film.md` | Measured analysis of the film that defines this style, with a shot list. Read when you need to match it closely. |

## Procedure

Do the steps in order. You cannot judge a frame from code, so every step that
says "look" means open the PNG and look at it.

1. **Brief.** Fill `references/brief-template.md` from the user's request.
   Ask at most one round of questions (subject, length, palette variant);
   invent the rest. 8 to 14 beats, 15 to 30 s unless the user says otherwise.
2. **Set up the project folder.** One folder per film:
   ```bash
   mkdir -p <film> && cp <skill>/assets/starter.html <film>/<film>.html
   cp <skill>/scripts/render.mjs <skill>/scripts/package.json <film>/
   cd <film> && npm i --no-audit --no-fund
   ```
   `puppeteer-core` uses the system Chrome and downloads nothing. ffmpeg must
   be on PATH. Set `CHROME=/path/to/chrome` if it is not found.
3. **Beat sheet.** Write it as a table in a comment above `TIMELINE`: start,
   duration, scene, camera, what changes, kit calls, sound cue. Use the
   recipes in `references/scenes.md`.
4. **Palette and style sheet.** Pick the palette in `PAL`. Render frame 0,
   which is the labelled style sheet, and look at it:
   ```bash
   node render.mjs <film>.html --only 0
   ```
5. **Puppets.** Build each character or object in `PUPPET` following
   `references/architecture.md`. Add it to the style sheet at scales 0.6, 1
   and 1.8. Render frame 0 again. It must read at 240 px wide.
6. **Scenes, one at a time.** Implement a scene, register it in `TIMELINE`,
   render its first, middle and last drawn frame with `--only`, look, fix.
   Only then start the next scene. Drawn frame index = seconds × 12.
7. **Full render and review.**
   ```bash
   node render.mjs <film>.html
   ```
   Open `out/<film>-contact.jpg` (two tiles per second) and run the
   checklist below. Fix and re-render until it is clean. The script exits
   non-zero and prints page errors if the page threw.
8. **Score.** Edit `buildScore` against the beat sheet. Export the WAV from
   the page (`export score.wav` button, needs a click in a real browser) or
   ask the user to, then mux:
   ```bash
   ffmpeg -i out/<film>.mp4 -i score.wav -c:v copy -c:a aac -shortest out/<film>-final.mp4
   ```
9. **Deliver** `<film>.html`, `out/<film>.mp4` (or `-final.mp4`),
   `out/<film>-contact.jpg`, and one line per scene saying what it shows.

## Non-negotiable rules

Full text and reasons in `references/style.md`.

1. Paper or navy backgrounds. Never pure black or white.
2. Flat fills; shading only by hatching, shadows by cross-hatching, tone by
   grain. No gradients, `filter`, `shadowBlur`.
3. Fill and outline never coincide: `Path2D` fill, separately jittered
   `wob` outline.
4. `scribble` (misregistered accent outlines) on at most two parts per frame.
5. Every drawable takes `mode`: `ink` or `blueprint`. Same geometry.
6. `Math.random` is banned. Everything goes through `rng(seed)`. Textures do
   not change between frames of a static shot.
7. Draw at 12 fps, output 24 fps. `drawFrame(i)` is a pure function of `i`.
8. Hard cuts. Shots 0.8 to 2.5 s. One transition device between two shots.
9. Every colour comes from `PAL`, at most 12 entries.
10. Silhouettes read at 240 px, the contact-sheet tile size.

## Review checklist

Each item found on the contact sheet or in a spot-check frame is a defect:

- blank or near-blank frame that is not a deliberate flash;
- subject that does not read at 240 px, or is cut by the frame edge without intent;
- surface without hatching or grain (reads as clipart);
- a colour not in `PAL`;
- texture boil between consecutive drawn frames of a static shot;
- transition longer than 1 s, or two transition devices in a row;
- more than two scribbled parts in one frame;
- text in the frame outside the style sheet;
- a cue time not on the 1/12 s grid;
- page errors printed by `render.mjs`.

## Adapting to other subjects

The kit is subject-agnostic. A GPU, a server, a token, a city or a recipe is
built the same way as the fly: parts as paths, a pose object with 3 to 6
numbers, ink and blueprint renderers. Hex lattices become LEDs, cells or
tiles; stripes become vents or traces; `construction` lines make any object
read as a technical drawing. See "Non-creature subjects" in
`references/architecture.md`.

If the project already renders video with Remotion, call the same
`drawFrame` from a component: `fps: 24` and `drawFrame(Math.floor(frame / 2))`
on a canvas ref inside `useCurrentFrame()`.
