# Brief template

Fill this from the user's request before touching code. Keep it at the top of
the film's HTML as a comment together with the beat sheet.

```
BRIEF
Subject: <one sentence, e.g. "the life of a token inside a 4x RTX 3090 rig">
Format: 1080x1080, drawn 12 fps, output 24 fps, <N> seconds
Palette variant: paper+warm (default) | night+chalk | paper+cool
Puppets: <list, 1..3, each with 3..6 pose params>
Beats (8..14, each 0.8..3 s):
  1. <what happens> | camera <static/push-in/follow> | recipe <A..M> | sound <motif>
  2. ...
Must include: A establishing, B ink blot, one of C/D/E, G follow, H POV, M coda
Deliver: <name>.html, out/<name>.mp4, out/<name>-contact.jpg
```

Instruction to prepend when handing the brief to another agent:

```
You are drawing every frame of a short film in JavaScript on Canvas 2D,
one HTML file, following the hand-drawn-canvas-animation skill. Rules in
style.md are mandatory. Start from starter.html (assets/starter.html). Write the
beat sheet first, build the puppets second, then scenes one by one, render
the contact sheet after every scene and fix what the review checklist in SKILL.md
flags. Do not use images, libraries, gradients, filters or Math.random.
```
