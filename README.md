# tools

Things I build while running models on my own hardware, cleaned up enough for
other people to use. ComfyUI workflows, benchmark harnesses, scripts, configs.

I post the measurements behind all of this on X:
**[@superalesha](https://x.com/superalesha)** — local inference on 4x RTX 3090,
open-weights models, benchmarks with the argv and the raw logs attached. Follow
along if you run models at home, there is a lot of it.

## What's here

### ComfyUI

| path | what it is |
|---|---|
| [`comfyui/workflows/video/minimax-h3`](comfyui/workflows/video/minimax-h3) | seven workflows for MiniMax H3 (video + synchronized audio in one pass), with a 4-step Turbo LoRA that takes a 5-second 1344x768 clip from 11:08 down to 3:45. Text-to-video, image-to-video, reference-to-video, 1080p upscale, and [long-form chaining](comfyui/workflows/video/minimax-h3/LONGFORM.md) for 30 to 60 second clips. Every graph carries guide cards on the canvas |

### Skills

| path | what it is |
|---|---|
| [`skills/video/minimax-h3`](skills/video/minimax-h3) | agent skills that turn a rough idea into a proper MiniMax H3 prompt: text-to-video, full-reference (images/video/audio in), and chaining 15-second clips into long videos with character and voice continuity |

More lands here as I clean it up.

## The rig everything is measured on

4x RTX 3090, 96 GB VRAM total, 220 W per card, PCIe 3.0 x16, no NVLink. Ubuntu.
Numbers in these READMEs come from real runs on that machine, not from
datasheets. Your absolute times will differ, the ratios usually hold.

## License

MIT. Take it, change it, ship it.
