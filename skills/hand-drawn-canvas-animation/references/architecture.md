# Architecture, puppets, rendering, pitfalls

## File layout and invariants

Section order, top to bottom: `CONFIG` (size, fps, palette) → `KIT`
(primitives, never edited per film) → `PUPPET` (your characters and objects)
→ `SCENES` → `TIMELINE` → `SCORE` → `RUNTIME` (player, export hooks, never
edited).

Invariants:

- `drawFrame(i)` is a **pure function of the drawn-frame index**. No state
  survives between frames, no `requestAnimationFrame` time, no `Date`. Same
  `i` gives the same pixels on any machine. This is what makes scrubbing,
  contact sheets, parallel rendering and re-renders possible.
- A scene is `sceneX(c, tau, i)`: `c` is a 2D context (main canvas or an
  offscreen layer), `tau` is seconds since the scene started, `i` is the
  global drawn-frame index (for twitches and flicker).
- `TIMELINE` is an array of `{name, dur, fn}`. Scene boundaries are the
  cuts. Total duration and frame count are derived from it.
- World units are pixels at zoom 1. `cam(c, x, y, zoom, rot)` puts world
  point `(x, y)` at the frame centre. Puppets are drawn in local coordinates
  with the origin at the body centre and "forward" pointing up (negative y);
  place them with `translate → rotate → scale`.
- Compositing uses offscreen layers: render A into `L1`, B into `L2`,
  compose on the main context (`blot`, `mosaic`, flicker). Layers are
  created once with `layer()`.
- Hooks for the renderer: `window.__drawFrame(i)`, `window.__NDRAW`, and
  the query string `?frame=N&bare=1` (draw one frame, hide the UI, canvas at
  exactly 1080x1080 CSS px).

Performance budget (offline render, one headless Chrome):

| Thing | Budget |
|---|---|
| One drawn frame | 50 to 300 ms |
| Hatch layer | one `beginPath` + one `stroke` for all strokes, up to ~20k segments |
| Grain | up to 8k rects per layer |
| Mosaic cell | ≥ 12 px, one `getImageData` per frame |
| Static heavy layer (a room, a textured ground) | draw once per scene into a cached layer, then `drawImage` |

Cache pattern:

```js
const cache = {};
function sceneRoom(c, tau, i) {
  if (!cache.room) { cache.room = layer(); drawRoomStatic(cache.room.getContext('2d')); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(cache.room, 0, 0);
  // moving things on top
}
```

## Building a puppet

A puppet is a character or an object: a fly, a GPU card, a token, a server.
Same recipe every time.

1. **Part list.** 3 to 8 parts as ellipses, circles or rounded rects in
   local coordinates, total height about 200 px at scale 1. Keep the
   arguments (`[cx, cy, rx, ry]`) in an `ARGS` object and build a
   `Path2D` per part from them; `ellPts(...ARGS.part)` reuses them for the
   wobbly outline.
2. **Pose object.** 3 to 6 numbers, no more: `walk` (0..1 phase), `twitch`
   (0/1), `wing` (angle), `flap` (0..1 blur), `tuck` (0..1), `tilt`. The
   whole reference fly is animated with five.
3. **Draw order.** Limbs behind → translucent parts (wings) → body parts
   back to front → face → accents on top.
4. **Ink pipeline per part.** `fill(path)` → `hatch` with the angle along
   the part's long axis → `grain` (100 to 200 dots per part) → `wob`
   outline. Stripes and markings are thick curved strokes clipped to the
   part, not separate shapes.
5. **Blueprint pipeline per part.** Chalk `wob` outline only, weight 2.4 to
   2.8, no fills. Lattices (eyes, cells) stroked in chalk at alpha 0.75.
6. **Details that sell it.** Hex-lattice eyes (or LEDs, or ports) shaded
   toward a highlight; one `scribble` on the largest part; a `construction`
   overlay around the whole puppet in establishing shots.
7. **Motion.** Limbs from `sin(phase)`; blur by drawing a part 3 times at
   ±angle with alpha; never tween the hatching.
8. **Test.** Add the puppet to the style sheet at 3 scales (0.6, 1, 1.8) and
   render frame 0. It must read at 240 px.

Non-creature subjects use the same recipe: parts are `roundRect` paths
and circles, "eyes" become LEDs (small hex discs), hatch runs along panel
directions, stripes become vents or traces, and `construction` lines make
the object read as a technical drawing.

## Rendering

- One frame in a browser: open `<film>.html?frame=37` (with UI) or
  `<film>.html?frame=37&bare=1` (canvas only, 1080x1080 CSS px).
- Spot check without a browser window: `node render.mjs <film>.html --only 0,37,74`
  writes `out/<film>-frames/NNNN.png` and stops.
- Full render: `node render.mjs <film>.html`. One headless Chrome through
  `puppeteer-core`, every drawn frame screenshotted, then ffmpeg packs the mp4
  on twos and builds `out/<film>-contact.jpg` with two tiles per second.
  Page errors are printed and the exit code is non-zero.
- Do not spawn one Chrome per frame with `--screenshot`. It hangs on the
  second frame.
- Manual packing, if you exported PNGs from the page yourself:
  `ffmpeg -framerate 12 -i %04d.png -r 24 -pix_fmt yuv420p -crf 18 out.mp4`.
- Remotion, if the project already uses it: call the same `drawFrame` from a
  component on a canvas ref with `useCurrentFrame()`; set `fps: 24` and draw
  `drawFrame(Math.floor(frame / 2))`.

## Pitfalls

- `Math.random` anywhere → boiling textures. Use `rng(seed)`.
- A `stroke()` per hatch segment → seconds per frame. One `beginPath`, one `stroke` per layer.
- Forgetting `c.setTransform(1,0,0,1,0,0)` before full-frame fills → the background lands in world space.
- `clip` without `save/restore` → every later draw is clipped.
- `selfDraw` needs the real perimeter length for the dash pattern; `pathLength` computes it.
- `getImageData` fails on a canvas that ever drew a cross-origin image. This style uses no images, so keep it that way.
- Ghost copies with alpha 0.34 each stack to near-opaque; divide alpha by the number of ghosts.
- The in-page PNG export needs a user click (File System Access API); automated renders go through `render.mjs`.
- `blot` and `mosaic` work in screen coordinates; call them after `setTransform` identity, with screen-space centres.
- A mosaic of a navy blueprint frame samples mostly navy; mosaic the colour frame.
- Headless Chrome must run with `--force-device-scale-factor=1` or the screenshot is 2160 px on a Retina host.
