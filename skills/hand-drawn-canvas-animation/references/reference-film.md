# The reference film

"The life of a fruit fly" by Kevin Ngo, posted 15 September 2026:
https://x.com/kevin_t_ngo/status/2099858454043349342

The author's post says every frame was drawn with JavaScript. The notes below
are measurements of the published video, not claims from the post. Use them
when you need to match the style closely. Do not copy the film itself; make
your own subject.

## Measured facts

| Property | Value | How it was measured |
|---|---|---|
| Frame | 1080x1080, H.264, 24 fps, 648 frames, 27.0 s | ffprobe |
| Audio | AAC stereo, mean -13.7 dB, peak -1.6 dB | ffmpeg volumedetect |
| Drawing cadence | 12 fps on twos | Mean absolute difference between consecutive frames: median 0.74 on even pairs against 4.37 on odd pairs. 101 of 104 frozen frames sit on even positions. In the flight shot every jump lands on an odd frame. |
| Texture boil | none | On a static shot consecutive frames differ by about 1/255, which is codec noise. Hatching and grain are fixed per shot. |
| Hard cuts | 1.25, 7.21, 9.29, 9.58, 13.21, 14.42, 18.75, 19.21, 24.0, 25.7 s | frame-difference spikes |
| Flicker runs | 12.0 to 13.0 s (vision mosaic), 22.8 to 23.7 s (days passing) | alternating spikes every 2 frames |

From the author's replies under the post: the film is one HTML file, the
music was written in code and timed to the animation, and slowing it down
would lose the animated feel. No prompt, code or library was shared.

## Shot list

| t, s | Shot | Devices visible |
|---|---|---|
| 0.00 to 1.10 | Fly sitting on a peach, full-colour ink mode | form-following hatching, grain, hex eyes, misregistered accent outlines, thin construction lines with ticks, idle wing twitch |
| 1.10 to 1.45 | Ink blot transition | dark blob with a bristly edge grows out of the fly; inside it the same geometry in blueprint mode |
| 1.45 to 2.10 | Spark, construction, egg outline draws itself | aster rays, long guide lines, circle, self-drawing contour |
| 2.10 to 3.20 | Cleavage | nuclei with rays doubling 1, 2, 4, 8; spindle lines between pairs; lineage tree in the corner |
| 3.20 to 4.60 | Nuclei become a dot cloud, then bands | particles, a compaction wave along the egg |
| 4.60 to 6.90 | Segmentation | green bands 1 to 7 to 14, pink pole cells, two macro inserts at 6.0 and 6.25 |
| 7.00 to 7.20 | Larva inside the egg, blueprint | lattice silhouette |
| 7.20 to 9.10 | Hatching, eating, growing | rounded polygon food cells with inner contours; scale grows; camera follows the larva |
| 9.25 to 9.60 | Flash, pupa | one white frame; blueprint with a spiral |
| 9.60 to 11.90 | Adult emerges, wings unfold | wings scale up along one axis, eyes redden, case falls away |
| 12.00 to 13.20 | Compound-eye vision | hex mosaic alternating with the clean image every 2 frames |
| 13.25 to 14.30 | Brain | particle cloud, arcs, two pink optic-lobe clusters |
| 14.40 to 16.60 | Flight through a kitchen | camera follows with lead, speed lines, coloured loop wake, cross-hatched interior |
| 16.60 to 18.60 | Table and swatter | swatter mesh as two families of clipped parallel lines, red swing arcs |
| 18.60 to 19.20 | Impact | ink splat, droplets, hold |
| 19.25 to 22.40 | Courtship | two flies, vibrating wing as a zig-zag with white fill and dark outline, sound rings, loops, eggs |
| 22.40 to 24.00 | Days passing | sun on an arc, tally marks, flicker |
| 24.00 to 25.70 | Leaf and dew drop | drop as a sphere with latitude and longitude lines reflecting the room |
| 25.70 to 27.00 | Fade | two sparks, a hatched silhouette dissolving |

## What to take from it

- Short shots and hard cuts carry the energy. The average shot is under 2 s.
- The blueprint mode appears four times and always means "look inside".
- Every surface has at least two mark layers: hatching plus grain, or
  cross-hatching plus grain.
- Transitions are drawn, never blended: blot, self-drawing line, flicker, flash.
- The music follows the cuts, which is only easy because picture and sound
  come from one timeline.
