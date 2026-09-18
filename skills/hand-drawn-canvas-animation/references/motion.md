# Motion: timing, the principles as functions, cadence

A drawn film reads as alive or as a slideshow for one reason: how things move
between the drawings. This file is the timing kit. Every helper is a pure
function of time, so `drawFrame(i)` stays pure and a scene can ask the same
question twice (the blueprint interlude asks for the pose of the ink shot).

## Cadence: characters on twos, the camera on ones

`defineFilm({ fps: 24 })` draws 24 frames a second. `tau` becomes continuous:
a camera move, a particle, a light, a wash spreading, a line drawing itself
run on ones and look smooth. A character still moves on twos: take its pose
from `twos(tau)`, which snaps the time to the 12 fps grid, and keep `i` (which
is always the 12 fps frame index) for `pulse`, `boil` and `flicker`. That is
how cel animation is shot: the drawings hold for two frames, the camera glides.

```js
function sceneWalk(c, tau, i) {
  paper(c); camKeys(c, tau, CAMK, { hand: 2 });         // on ones
  const t2 = twos(tau), pose = { walk: t2 * 1.5, blink: pulse(i, 29, 2) ? 1 : 0 };
  drawHero(c, 'ink', heroAt(t2), pose, 7);              // on twos
  sparks(c, tau);                                         // on ones
}
```

A scene marked `twos: true` in the timeline gets `tau` snapped for everything
(the style sheets, a riso card montage, a held blueprint). A film without
`fps` runs at 12 as before, so the older examples are unchanged.

`render.mjs` reads the film's fps, packs the mp4 at 24 either way and does not
redraw a frame identical to the last one, so a scene on twos in a 24 fps film
costs what it did before.

## The principles

| principle | what it is | helper |
|---|---|---|
| ease in, ease out | nothing starts or stops at full speed | `sm(a, b, t, easeIO)`; `easeInOutSine` for cameras, `easeOutQuint` for a hard stop, `easeOutExpo` for a snap |
| anticipation | a small move the other way before the move | `anticipate(a, b, t, { back: .12, hold: .3 })`, or a crouch: `squash(-.2)` over the wind-up |
| arcs | a thrown or jumping thing follows a parabola, a head turn follows a curve | `arc(a, b, u, lift)` with `u` linear in time; `keyPath` for anything through waypoints |
| squash and stretch | stretched along the motion in the air, flattened on impact, volume kept | `squash(k)` -> `[sx, sy]`, scaled about the feet |
| follow-through, settle | what stopped keeps going a little and rings down | `settle(t, t0, { amp, freq, decay, phase })` added to a position, a lean or a scale |
| overshoot | arrives past the mark and comes back | `easeOutBack`, `spring(t, { freq, damp })` |
| secondary motion | antennae, a scarf, a tail lag the body | the same key, `.06` to `.1` s later: `key(t - .08, K)` |
| slow in to a hold | a pose is reached, then held; the hold is the beat | keys with a flat segment: `[[1.0, x], [1.4, x2], [2.2, x2]]` |
| moving hold | a held pose still breathes | `breathe(t)` on a scale or a lift, `drift(t, seed)` on a tilt, both tiny; `pulse(i, 8)` for a twitch |
| motion smear | a fast thing leaves ghosts behind it | `smear(c, 2, .08, dt => draw(dt))` |
| the camera is a character | it leads the action, never jumps, breathes a little | `camKeys(c, tau, K, { hand: 2 })` |

## Timing in frames

On the 12 fps grid (the cadence of the characters):

| move | drawn frames | seconds |
|---|---|---|
| a blink | 2 (closed) | .17 |
| anticipation before a jump or a hit | 3 to 5 | .25 to .4 |
| the jump itself | 6 to 9 | .5 to .75 |
| landing squash, full | 1 to 2, then rings down over 6 to 8 | .1 then .6 |
| a head turn | 4 to 6 | .35 to .5 |
| a hold after an action (the beat) | 8 to 16 | .7 to 1.3 |
| a take (surprise): squash, stretch up, settle | 2 + 3 + 6 | about 1 |
| a walk cycle | 8 to 12 per step pair | .7 to 1 |
| a camera push-in over a shot | the whole shot, `easeInOutSine` | 1.5 to 3 |
| a settle after a camera move | the last 6 to 10 | .5 to .8 |

Rules of thumb: a move that takes less than 3 drawn frames needs a smear or
an anticipation or it reads as a cut. A hold shorter than 6 frames does not
register as a hold. Every action is anticipation, action, settle, hold; the
hold is where the audience sees what happened.

## Keys

```js
// numbers, eased per segment (cubic in-out by default; a key may carry its own easing as the last element)
const y = key(tau, [[0, 300], [.8, 120, easeOutBack], [1.4, 140], [2.2, 140]]);
// several values at once
const [x, y, r] = key(tau, [[0, 100, 500, 0], [1.2, 400, 380, .3], [2.0, 700, 420, 0]]);
// through waypoints on a curve, eased over the whole journey, no pause at the keys in between
const [cx, cy, z] = keyPath(tau, [[0, CX, CY, 1], [1, CX + 200, CY - 80, 1.1], [2.4, CX + 500, CY, 1.3]], { ease: easeInOutSine });
```

Cue times sit on the 1/12 s grid when a character has to hit them; a camera
key may sit anywhere.

## A hop, as the template does it

```js
const HOP = { t0: 1.1, t1: 1.45, t2: 2.05, from: [-150, 40], to: [130, 40], lift: 170 };
function bugAt(t) {                                          // t on twos
  const { t0, t1, t2, from, to, lift } = HOP, air = sm(t1, t2, t, u => u);
  const [x, y] = t < t1 ? from : arc(from, to, air, lift);
  const sq = t < t1 ? -.22 * sm(t0, t1, t, easeOut)                                  // wind-up: crouch
    : t < t2 ? lerp(.3, .08, easeOut(air))                                            // stretched at take-off
    : settle(t, t2, { amp: -.32, freq: 2.4, decay: 5.5, phase: Math.PI / 2 });       // landing squash, rings down
  return { x: CX + x, y: CY + y, sq };
}
// in the scene: camera on ones, character on twos, ghosts while it flies
camKeys(c, tau, CAMK, { hand: 2.5 });
const b = bugAt(twos(tau));
const put = dt => { const q = bugAt(twos(tau) + dt); c.save(); c.translate(q.x, q.y + 100); c.scale(...squash(q.sq)); c.translate(0, -100); drawBug(c, 'ink', pose, 26); c.restore(); };
if (b.air) smear(c, 2, .08, put); else put(0);
```

The three phases have their own timing: a wind-up of 4 drawn frames, 7
frames in the air, a landing that rings for about half a second, then a hold
of a second and a half where the bug blinks and twitches and nothing else
happens.

## Springs

`spring(t, { freq: 2.4, damp: .55 })` is the response of a damped spring to a
step: it rises past 1, comes back, and is still by about `2 / freq` seconds.
`damp` .3 rings, .55 overshoots once, .8 barely, 1 never. Use it for a thing
that snaps into place (a sticky note, a badge, a title), a lid that closes, a
plant that springs back after something leaves it. It is a function of time
since the move started, so `spring(tau - t0)`.

## Handheld

`drift(t, seed, { amp, freq })` is two octaves of smooth noise, about
`-amp..amp`. On a camera through `camKeys({ hand: 2 })` it is the breath of a
hand holding it: 2 to 4 px at zoom 1, never more. On a tilt it is a puppet
that is alive while it waits. On a flame or a lamp it is flicker. Because it
is noise in time, it must never be quantised through `twos()`: it belongs to
the things that run on ones.

## What still holds

- The drawings are on twos. Only the camera, particles, light and reveals run
  on ones. A character on ones reads as computer animation.
- A move has an anticipation or a smear, an ease, and a settle, or it is a
  cut. Cuts are fine; unintended cuts are not.
- One thing moves at a time, or one thing leads. Two moves of equal weight in
  one shot cancel each other.
- Textures never boil with the motion. `surface` seeds are fixed per scene;
  only outlines may re-seed, every 3 drawn frames, through `boil(i)`.
- Nothing is quantised twice: `twos(tau)` once, at the pose; the helpers
  inside take the snapped time.
