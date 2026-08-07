# MiniMax H3 workflows for ComfyUI

Six ComfyUI workflows for MiniMax H3, the open-weights model that generates
video **and synchronized audio in one pass**. Built and measured on a
4x RTX 3090 rig (96 GB total, 220 W per card, PCIe 3.0 x16, no NVLink).

The default set runs on a 4-step Turbo LoRA, so a 5-second 1344x768 clip takes
**3:45 end to end instead of 11:08**. The plain 20-step path ships too, both as
a separate file and as a switch inside every graph.

Every workflow carries its own guide cards on the canvas: what each knob does,
what it costs, and which values I actually run.

## The files

| file | what it does |
|---|---|
| `01-text-to-video.json` | text to video and audio, 4 steps |
| `02-image-to-video.json` | animate a still, optional last frame, 4 steps |
| `03-reference-to-video.json` | carry a character or a style from reference images, 4 steps |
| `04-upscale.json` | upscale a finished clip to 1080p with SeedVR2 |
| `05-text-to-video-plus-upscale.json` | 01 with the upscale branch built in (muted by default) |
| `06-text-to-video-base-20steps.json` | the plain 20-step version, no Turbo LoRA |

Drag any of them onto the ComfyUI canvas.

## What you need to install

### ComfyUI

Version **0.30.0 or newer**. H3 support and the VAE fix landed there.

### Custom nodes

Install through ComfyUI-Manager or clone into `ComfyUI/custom_nodes/`:

| node pack | why |
|---|---|
| [ComfyUI-KJNodes](https://github.com/kijai/ComfyUI-KJNodes) | SageAttention patch and the live frame preview |
| [ComfyUI-MultiGPU](https://github.com/pollockjj/ComfyUI-MultiGPU) | spreads the model, text encoder and VAEs across cards |
| [ComfyUI-MiniMax-H3-Turbo](https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo) | the 4-step LoRA loader and its sampler |
| [ComfyUI-SeedVR2_VideoUpscaler](https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler) | only for `04` and `05` |
| [ComfyUI-VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite) | video IO |

### Python side

SageAttention gives you the attention speedup. The Triton path is enough:

```bash
pip install sageattention triton
```

You do not need to build the CUDA kernels from source. I did build them for
sm_86 and measured both paths: the compiled kernels win 2% on the large shape
and nothing on the small one, because attention is only about a quarter of the
step time. The `auto` mode in the SageAttention node picks Triton and that is
what these graphs are set to.

## Models to download

All the H3 weights live in [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3).
These graphs use the pruned int8 variants, which fit 96 GB comfortably:

```bash
cd ComfyUI/models
hf download Comfy-Org/MiniMax-H3 \
  diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors \
  diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors \
  text_encoders/qwen3vl_32b_minimax_h3_int8_convrot.safetensors \
  vae/minimax_h3_video_vae_fp16.safetensors \
  vae/minimax_h3_audio_vae_fp32.safetensors \
  --local-dir .
```

| file | goes to | size |
|---|---|---|
| `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | `models/diffusion_models/` | 19.5 GB |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | `models/diffusion_models/` | 19.5 GB |
| `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` | `models/text_encoders/` | 25.3 GB |
| `minimax_h3_video_vae_fp16.safetensors` | `models/vae/` | 4.9 GB |
| `minimax_h3_audio_vae_fp32.safetensors` | `models/vae/` | 0.6 GB |

`fl2va` is the first/last-frame checkpoint used by workflows 01, 02, 05 and 06.
`ref2va` is the reference checkpoint used by 03. If you never touch reference
mode, skip that one.

### Turbo LoRA (this is where the 3x comes from)

From [larryvrh/MiniMax-H3-Turbo-Lora](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora):

```bash
hf download larryvrh/MiniMax-H3-Turbo-Lora \
  minimax_h3_turbo_4step_ema_ckpt850.safetensors \
  --local-dir ComfyUI/models/loras
```

744 MB. The node auto-detects a pruned base and re-injects the time
conditioning at run time, so one file covers full, int8 and pruned bases alike.

### Preview VAE (optional but worth it)

From [Kijai/MiniMax-H3-TAE](https://huggingface.co/Kijai/MiniMax-H3-TAE),
9.8 MB, into `ComfyUI/models/vae_approx/`:

```bash
hf download Kijai/MiniMax-H3-TAE vae_approx/taeh3.safetensors \
  --local-dir ComfyUI/models
```

It shows you frames while sampling runs, so a bad take is obvious at step two.
Costs about 0.14 s per step. If you skip it, mute the `ModelPreviewOverrideKJ`
node with Ctrl+M.

### SeedVR2 upscaler (only for 04 and 05)

From [numz/SeedVR2_comfyUI](https://huggingface.co/numz/SeedVR2_comfyUI), into
`ComfyUI/models/SEEDVR2/`: `seedvr2_ema_7b_fp16.safetensors` and
`ema_vae_fp16.safetensors`.

## Adapting the graphs to your hardware

The loaders are MultiGPU nodes with my 4-card split baked in. **If you have a
different setup, this is the first thing to change.**

`UNETLoaderDisTorch2MultiGPU`:

- `device` = `cuda:0`, where compute happens;
- `expert_mode_allocations` = `cuda:0,9gb;cuda:1,12gb`, how the 19.5 GB of
  weights are spread.

`CLIPLoaderDisTorch2MultiGPU` does the same for the 25.3 GB text encoder, in my
case across `cuda:2` and `cuda:3`. Both VAE loaders sit on `cuda:1`.

**One 24 GB card.** Point every loader at `cuda:0` and let DisTorch offload the
rest to system RAM: set the allocation to something like `cuda:0,20gb` and keep
`virtual_vram` for the remainder. It will be slow because weights travel over
PCIe, but it runs.

**Two cards.** Model on one, text encoder on the other, VAEs wherever there is
room. That is the split I would start from.

**More VRAM than me.** Drop the pruned int8 files for `minimax_h3_fl2va_bf16`
(61.7 GB) and give the loader all your cards.

## Using it

**Duration is set in seconds** by the green node. Frames are computed for you,
because the model only takes lengths of the form 17k+5: 5 seconds is 124
frames, 15 seconds is 362. Past 362 the model extrapolates and the scene drifts,
so treat that as the ceiling.

**Resolution:** short side 768, ceiling 768x1344, both sides multiples of 32.
The model cannot go higher, so 1080p is always the upscaler's job.

**Describe the audio in the last sentence of the prompt.** H3 generates sound in
the same pass. Skip it and you get silence or noise. The pattern that works:

```
[style and optics]: [scene and action], [light], [camera details]. [Sound].
```

**There is no CFG.** H3 runs through `BasicGuider` with no negative prompt. If
you do not want something in the shot, do not mention it.

**Five seconds is one continuous piece of motion.** You cannot fit a cut in
there, and "then the camera pulls back" gets ignored.

## Timings from my rig

Full run, button to saved mp4, 1344x768 at 124 frames, one seed, 4x RTX 3090 at
220 W:

| mode | steps | sampling | full run |
|---|---|---|---|
| turbo, `low_vram` on | 4 | 2:42 | **3:45** |
| turbo, `low_vram` off | 4 | 3:37 | 7:07 |
| base | 20 | 10:14 | 11:08 |

On a draft-size 608x352 at 39 frames: turbo 25 s, base 121 s on the same graph.
A 15-second clip (362 frames) at 1344x768 took 46 minutes on the base path, peak
19.5 GB per card.

Time grows faster than length because attention is quadratic. At 362 frames one
step takes about three minutes against three and a half seconds at 124 frames in
the draft resolution. **So work at 608x352 until the seed and the wording are
right, then render full size.**

## Turbo LoRA notes

`low_vram` is a real trade, not just a memory switch. On, the LoRA merges into
the weights: fastest run, lowest peak VRAM, softer picture on quantized bases.
Off, it is applied at run time: slower, more detail survives. I use it on while
hunting for a seed and off for the final render.

**Strength** is the quality dial, default 1.0. Blurry with motion smear, push to
1.05 or 1.2. Over-sharp grain, pull down to 0.8 or 0.95.

The custom sampler is not optional. Video and audio inside H3 follow two
different flow schedules, and a stock sampler over-steps the audio at 4 steps
and breaks it.

**The author calls these weights a preview.** Training is paused because of
plastic-looking skin and over-sharpened grain. Watch faces in close-ups, and if
a shot goes plastic, switch back to 20 steps.

### Switching a graph back to 20 steps

Four actions, no rewiring beyond one drag:

1. Ctrl+B on the `Turbo LoRA` node so it goes to bypass;
2. Ctrl+B on `Sigma Shift` so it turns back on;
3. set steps to 20 in `BasicScheduler`;
4. drag the `sampler` input of `SamplerCustomAdvanced` from the turbo sampler to
   `KSamplerSelect`, which sits right next to it.

Or just open `06-text-to-video-base-20steps.json`.

## Upscaling

`04-upscale.json` takes a finished file and runs SeedVR2 7B. Measured: 608x352
at 39 frames became 1864x1080 in 3.5 minutes, audio passes through untouched.
124 frames take about 11 minutes.

Two settings that will bite you:

- **`batch_size = 5`.** The model takes 15.4 GB, leaving under 8 GB of a single
  card for activations. A batch of 13 dies with OOM at 1080p. Five is also the
  minimum at which frames inform each other. The value must be of the form 4n+1.
- **`blocks_to_swap = 0`.** Swapping blocks to CPU looks like an OOM cure but
  hangs the process so hard it will not cancel on interrupt. Only a restart
  clears it.

The upscaler runs on a single card, it does not spread weights across devices.
That is where the small batch comes from.

## Gotchas I hit so you do not have to

**Do not download anything heavy while generating.** The page cache fills up, the
kernel goes off compacting memory, and loading a model onto the card stalls for
five minutes with the GPU at zero. It looks exactly like a hung job.

**R2V uses a different checkpoint.** Workflow 03 loads `ref2va`, not `fl2va`. The
Turbo LoRA author only claims t2v and i2v as verified, so I ran it: the LoRA
bound completely, all 208 backbone modules plus 51 adaln, and the clip came out
clean. Keys match, but I tested on throwaway images rather than a real character
transfer, so check identity retention with your own references.

**Turn the preview off when benchmarking.** It costs 0.14 s per step, which is
enough to smear an A/B comparison.

---

Measured on 4x RTX 3090. Numbers on your hardware will differ, ratios should not.
Questions and corrections welcome on [X](https://x.com/superalesha).
