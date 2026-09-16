<div align="center">

# tools

Things I build while running models on my own hardware,
cleaned up enough for other people to use.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rig](https://img.shields.io/badge/measured%20on-4x%20RTX%203090-76b900.svg)](https://x.com/superalesha)
[![X](https://img.shields.io/badge/@superalesha-follow-black.svg)](https://x.com/superalesha)

</div>

---

## Sections

Every section stands on its own, with its own installer and its own docs. There
is no shared setup to get through first.

### [minimax-h3](minimax-h3)

Video with sound, generated at home.
[MiniMax H3](https://huggingface.co/Comfy-Org/MiniMax-H3) writes the picture and
the synchronized audio in one pass, so voice, effects and music come out of the
same generation as the frames. Open weights.

Thirteen ComfyUI workflows in two sets. One set runs on any single 24 GB card. The
other puts every card in a multi-GPU box to work and hits **3.12x on four
cards**, taking a 15-second shot from 19 minutes of sampling down to 6:41.

Ships with the custom nodes, the patch that makes the turbo LoRA actually load,
and a three-command installer.

```bash
cd minimax-h3 && ./install/setup.sh check
```

### [skills](skills)

Agent skills that stand on their own.

**[hand-drawn-canvas-animation](skills/hand-drawn-canvas-animation)** makes short
films that look hand-drawn or hand-printed, with every frame drawn by
JavaScript on a plain Canvas 2D. One HTML file on a shared core, no images and
no video model. Four looks from one palette system: ink on warm paper, riso
halftone prints, flat screen prints and graphite minimalism, each re-colourable
in one line. It ships the core, a template, two worked films, a renderer that
turns a file into an mp4 and a contact sheet, and the rules an agent needs to
keep a look consistent.

```bash
cp -r skills/hand-drawn-canvas-animation ~/.agents/skills/
```

More lands here as I clean it up.

---

## The rig everything is measured on

4x RTX 3090, 96 GB VRAM total, PCIe 3.0 x16, no NVLink, 320 W per card. Ubuntu.

Numbers in these READMEs come from real runs on that machine, not from
datasheets. Your absolute times will differ, the ratios usually hold.

There is one thing worth checking on your own box before anything else. Cards
ship at whatever power limit the vendor set, and it is often well under the
default. Mine were at 220 W against a 350 W default, and raising them to 320
took an identical run from 220 seconds down to 170.

```bash
nvidia-smi --query-gpu=name,power.limit,power.default_limit --format=csv
```

---

<div align="center">

I post the benchmarks behind all of this. Local inference on 4x RTX 3090,
open-weights models, argv and raw logs attached.

**[@superalesha](https://x.com/superalesha)**

MIT. Take it, change it, ship it.

</div>
