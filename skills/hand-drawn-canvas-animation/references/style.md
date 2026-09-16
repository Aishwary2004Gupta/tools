# Style: rules and vocabulary

The rules are mandatory. If a frame breaks one, fix the frame.

1. **Paper, not screen.** Warm off-white paper with faint diagonal light
   bands for daylight scenes. Deep navy with star grain for "blueprint"
   scenes. Never pure black, never pure white backgrounds.
2. **Everything is a mark.** Fills are flat. Shading is hatching (short
   parallel strokes). Shadows are cross-hatching. Tone is grain (speckles).
   No gradients, no `filter`, no `shadowBlur`, no smooth alpha vignettes.
3. **Nothing lines up perfectly.** Fill a shape with a `Path2D`, then
   outline it with a *separately jittered* polyline (`wob`). Fill and outline
   must not coincide. Outline 2 to 3 px, hatching 1 to 1.4 px, guide lines
   0.8 to 1 px at 1080 wide.
4. **Riso misregistration.** One or two parts per character get the same
   outline repeated in 3 or 4 accent colours, each copy shifted a few px,
   rotated about 3 degrees, scaled by a few percent (`scribble`). Not on
   everything. Never on backgrounds.
5. **Two renderers, one geometry.** Every drawable takes `mode`: `ink`
   (flat fill, hatch, grain, dark outline, accents) or `blueprint` (chalk
   strokes on navy, no fills, lattices as outlines, construction lines).
   Blueprint interludes explain "what is inside" and happen 2 to 4 times
   per film.
6. **Construction lines.** Thin blue guide lines with ticks, one circle,
   a few `+` crosses around the subject (`construction`). Present in about
   half the shots at low alpha. They say "this is a drawing being made".
7. **Hex lattices.** Compound eyes, cells, membranes, the POV mosaic
   (`hexCells`). This is the signature "biology under a microscope" texture.
   Use it for anything that is many-of-the-same.
8. **Seeded everything.** `rng(seed)` per element. `Math.random` is banned.
   Textures must not change between drawn frames. Optional deliberate boil:
   change the seed of *outlines only* every 3 drawn frames, never of hatching.
9. **Drawn on twos.** Draw 12 fps, output 24 fps by duplication. Idle
   motion is quantised to the drawn-frame grid: a twitch every 6 to 9 drawn
   frames, held for one frame. Camera and paths may ease smoothly but they
   are sampled on that grid.
10. **Cut hard, transition rarely.** Shots 0.8 to 2.5 s. After a cut hold
    the composition at least 6 drawn frames before anything but idle motion
    happens. Transition devices, in order of preference: ink blot, self-drawing
    line, flicker between two renders every 2 drawn frames, one-frame white
    flash, iris. Never two devices back to back.
11. **Palette discipline.** At most 12 named colours: paper, ink, navy,
    chalk, 3 or 4 warm fills, one shade, one blush, four accents, one guide
    blue. They live in `PAL`. Nothing else appears in a frame.
12. **One thing per shot.** The silhouette must read at 240 px, which is
    contact-sheet size. If the contact sheet does not read, the frame is
    wrong, no matter how it looks at 1080.

## Vocabulary: say this, get that

Use these terms in beat sheets and briefs. Every term maps to one kit call in
`assets/starter.html`.

| Term you use in the brief or beat sheet | What it looks like | Kit call |
|---|---|---|
| wobbly outline | slightly shaky ink contour | `wob(c, pts, amp, seed, close)` |
| hatching that follows the form | short parallel strokes inside a shape, angled along its long axis | `hatch(c, path, box, {angle, gap, len, ...})` |
| cross-hatch shadow | two hatch layers at ±45 degrees, darker colour | two `hatch` calls |
| grain | speckle dots that give tone | `grain(c, path, box, n, color, alpha, seed)` |
| riso outline, misregistered accents | same contour in magenta, cyan, yellow, green, offset | `scribble(c, path, cx, cy, {...})` |
| construction lines, blueprint guides | thin blue lines with ticks, circle, crosses | `construction(c, cx, cy, R, seed)` |
| blueprint mode | chalk-on-navy version of the same geometry | `drawX(c, 'blueprint', ...)` on `night(c)` |
| hex lattice, compound eye, cells | pointy-top hexagon grid | `hexCells`, `hexLattice`, `hexPath` |
| POV mosaic | scene seen as flat hex tiles | `mosaic(c, srcLayer, cellSize)` |
| spark, nucleus, aster | dot with radiating rays | `aster(c, x, y, r, rays, color, seed, g)` |
| self-drawing line | contour appears as if being drawn | `selfDraw(c, pts, progress, seed)` |
| ink blot wipe | dark bristly blob grows and reveals another render | `blot(c, srcLayer, cx, cy, R, seed)` |
| speed lines | strokes trailing a mover | `speedLines(c, x, y, dir, seed)` |
| coloured wake, loops | sine ribbons in accent colours behind a mover | `loops(c, x, y, dir, seed)` |
| ghost limbs, manual motion blur | the wing drawn 3 times at ±angle with alpha | loop in the puppet's draw |
| push-in, follow, lead | camera zooms in, tracks the subject, looks ahead of it | `cam(c, x, y, zoom, rot)` |
| flicker | alternate two renders every 2 drawn frames | `flicker(i)` |
| flash frame | one drawn frame of near-white | `c.fillStyle='#fff8ee'; c.fillRect(...)` on that frame |
| macro insert | 2 drawn frames at 4 to 6x zoom on a detail, hard cut | `cam` with zoom 5 |
