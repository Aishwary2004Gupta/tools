# Scene recipes, timing, score

## Recipes

Each recipe: what happens, camera, kit calls, duration. Chain 8 to 14 of them.

**A. Establishing shot on a textured surface (1.5 to 2.5 s).** Ground is a
huge circle far below the frame (top edge at ~1/3 height), three hatch
layers (light along the light direction, mid, blush cross-hatch in the
shadow region via a second clip circle), grain 6k, wobbly rim. Puppet at
1.6 to 1.9x with `construction` overlay. `cam` push-in from 1.15 to 1.3 with
`easeIO`. Twitch every 8 drawn frames.

**B. Ink blot into blueprint (0.6 to 0.8 s).** `L1` = the current ink frame,
`L2` = the same composition in blueprint mode. `blot(c, L2, cx, cy, R, seed)`
with `R = lerp(0, 1000, sm(t0, t0 + .8, tau, easeOut))` centred on the
subject. The fringe (400 bristles) is drawn by `blot`.

**C. Spark → construction → self-drawing outline (1.2 s).** `aster` with
`g` from 0 to 1 over 0.3 s; `construction` alpha ramp over 0.4 s;
`selfDraw` progress over 0.4 s; then `hexLattice` fades in inside the
shape (clip) to alpha 0.35.

**D. Doubling particles (1.5 to 2 s).** Cue times every 0.3 s; count
`2^k`. Positions seeded once inside the shape (rejection sampling in an
ellipse). For 0.15 s after each cue draw spindle lines between sibling
pairs. A lineage tree in a corner grows one level per cue.

**E. Bands / segmentation (0.8 to 1.2 s).** Band count 1 → 7 every
~0.11 s. Each band is a flat accent rect plus grain, drawn inside
`clip(shape)` after `translate/rotate` into the shape's local frame.

**F. Macro insert (2 drawn frames).** Same scene, `cam` zoom 4 to 6 on a
detail. Hard cut in, hard cut out. Use it to break a long shot.

**G. Camera-follow travel (2 to 3 s).** Subject on a cubic Bézier; heading
from the derivative (sample `u` and `u + .01`). Camera centre = position +
120 px along the heading (lead). `speedLines` seeded by frame index (they
should flicker), `loops` with a fixed seed (they should not), hatched shadow
ellipse offset by (+45, +70), ghost wings. Background static layer cached.

**H. POV mosaic (0.6 to 1.2 s).** Render the scene into a layer,
`mosaic(c, L, s)` with `s` from 40 down to 13, inside `clip(circle r 505)`,
chalk rim on top. Optionally `flicker(i)` between mosaic and the clean frame.

**I. Network / connectome (1 to 1.5 s).** 2 to 3k particles placed along
seeded quadratic arcs, two accent clusters with `aster`, whole graph rotates
slowly via `cam(..., rot)`. Navy background.

**J. Impact / ink splash (0.5 s).** One white flash frame, then a navy
blob (a `blot`-style polygon filled, no src) plus 30 droplets radiating with
seeded sizes, then a held frame with the splash and red `construction`
circles where the hit landed.

**K. Vibration / sound (1 s).** Vibrating part as a zig-zag polyline: thick
dark stroke under a thinner chalk stroke. Concentric circles expanding from
the source, a new one every 3 drawn frames.

**L. Time passing (1 to 2 s).** Sun disc on an arc, tally marks `||||`
appearing one per 3 drawn frames, paper colour flickering between day and
dusk every 2 drawn frames.

**M. Coda (1.5 s).** Navy, two `aster` sparks, the subject as a hatched
silhouette whose hatch density and alpha decrease to zero.

## Timing and editing

- Write the **beat sheet first**, as a table in a comment above `TIMELINE`:
  start, duration, scene, camera, what changes, kit calls, sound cue.
- Durations: establishing 2 to 2.5 s; interludes 0.6 to 1.2 s; action 1.5
  to 3 s; inserts 2 drawn frames; coda 1.5 s. Total 15 to 30 s.
- All cue times on the 1/12 s grid. Cuts on drawn-frame boundaries.
- Camera eases (`easeIO`); particles move linearly; reveals use `easeOut`.
- One-frame white flash before a reveal or an impact, at most twice per film.
- Never more than one transition device between two shots.

## Score

The score reads `TIMELINE`, so it cannot drift. `buildScore(ac, t0, dest)`
schedules oscillators; the same function feeds a live `AudioContext` for
preview and an `OfflineAudioContext` for the WAV export.

| Scene type | Motif |
|---|---|
| establishing | slow pentatonic plucks, triangle wave, one every 0.5 s |
| blueprint interlude | low sawtooth swell at 55 Hz plus a sine an octave up |
| doubling / cues | sine chime per cue, rising through the pentatonic |
| travel | 1/8-note square arpeggio at low gain plus a sine pulse every 0.5 s |
| impact | noise burst (`AudioBufferSourceNode` filled from `rng`) plus a 55 Hz sine |
| coda | long sine dyad, 1 s release |

Master gain ≤ 0.6, every note released exponentially to 0.0008. Mux with
`ffmpeg -i out.mp4 -i score.wav -c:v copy -c:a aac -shortest final.mp4`.
