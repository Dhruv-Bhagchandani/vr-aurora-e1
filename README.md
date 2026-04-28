# Aurora E1 — 360° VR Experience

A 5-scene, 2:30-minute web-based VR product showcase for the fictional luxury EV brand **Aurora E1**, built with [A-Frame 1.5.0](https://aframe.io). Runs on any smartphone in a Google Cardboard headset.

---

## Running Locally

```bash
cd vr-aurora-e1
python -m http.server 8000
# then open http://localhost:8000 in a browser
```

> **Note:** VR stereoscopic mode requires HTTPS. Local preview works for development, but test on a real phone via GitHub Pages (see Deployment).

---

## Deployment — GitHub Pages (Recommended)

```bash
git init
git add .
git commit -m "Initial VR experience — Aurora E1"
git branch -M main
git remote add origin https://github.com/<your-username>/vr-aurora-e1.git
git push -u origin main
```

Then: **GitHub repo → Settings → Pages → Source: main branch / root**.

Live at `https://<your-username>.github.io/vr-aurora-e1/` within ~2 minutes.

Generate a QR code of the URL at https://www.qr-code-generator.com/ for the in-class demo.

---

## Deployment — Netlify Drop

Drag the `vr-aurora-e1/` folder into https://app.netlify.com/drop. Goes live instantly with HTTPS.

---

## File Structure

```
vr-aurora-e1/
├── index.html              ← Landing page (entry point)
├── vr.html                 ← A-Frame VR scene
├── css/styles.css          ← Landing page styles only
├── js/
│   ├── components.js       ← Custom A-Frame components (look-at, pulse, fade-controller)
│   ├── audio-manager.js    ← Ambient + narration + SFX management
│   ├── hotspots.js         ← Hotspot creation and info-panel logic
│   └── scene-manager.js    ← Scene loading, transitions, JSON parsing
├── assets/
│   ├── 360/                ← Equirectangular JPEGs (4096×2048)
│   ├── audio/              ← Narration MP3s + ambient loops + SFX
│   └── icons/              ← SVG icons
└── data/
    └── scenes.json         ← Single source of truth for all scene content
```

---

## Replacing Placeholder Assets

### 360° Images (Priority 1)

Current images are solid-colour placeholders. Replace with real equirectangular panoramas:

**Free sources (CC0):**
- [Poly Haven HDRIs](https://polyhaven.com/hdris) — search "studio", "garage", "road", "sunset". Download 4K JPG.
- [A-Frame 360 Gallery samples](https://aframe.io/aframe/examples/boilerplate/360-image-gallery/)

**AI-generated:**
- Midjourney / Stable Diffusion: `--ar 2:1` ratio, prompt includes "equirectangular 360 panorama"

**Spec:** JPEG, 4096×2048, < 4 MB each.

Replace files in `assets/360/`:
| File | Scene |
|---|---|
| `scene1-showroom.jpg` | Indoor showroom with dramatic spotlighting |
| `scene2-exterior.jpg` | Car park / outdoor space beside the car |
| `scene3-interior.jpg` | Seated inside a luxury car cabin |
| `scene4-road.jpg` | Open highway / mountain road |
| `scene5-sunset.jpg` | Dramatic sunset road or vista |

### Audio (Priority 2)

Current audio files are silent placeholders. Replace with:

**Narration (per scene):**
- [ElevenLabs](https://elevenlabs.io) free tier — paste `narrationText` from `scenes.json`, download MP3.
- Microsoft Edge "Read Aloud" — record system audio while it reads the text.
- Script text is stored in `data/scenes.json` → `narrationText` field.

**Ambient / SFX:**
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) (free, no attribution):
  - `ambient-showroom.mp3` → search "showroom ambience" or "elegant interior"
  - `ambient-road.mp3` → search "driving road wind"
  - `click.mp3` → search "ui click" (~0.3s)
  - `transition-whoosh.mp3` → search "whoosh transition" (~1s)

**Target:** 96 kbps MP3, total audio < 10 MB.

---

## Editing Content

To change hotspot text, positions, or narration — **only edit `data/scenes.json`**. No JS changes needed.

---

## How It Works

1. `index.html` — provides the user gesture needed by iOS for device-orientation permission and audio autoplay.
2. `vr.html` — single A-Frame scene. On load, `scene-manager.js` fetches `scenes.json` and loads Scene 1.
3. **Gaze cursor** — `<a-cursor fuse="true" fuse-timeout="1500">` activates hotspots after 1.5s gaze. No physical button required (Cardboard-compatible).
4. **Scene transitions** — fade overlay sphere dims to black, content swaps, fades back in.
5. **Info panel** — parented to the camera rig via `camera-attached` component, so it always appears in front of the user.

---

## Asset Credits

| Asset | File | Source | License |
|---|---|---|---|
| A-Frame 1.5.0 | — | https://aframe.io | MIT |
| Autoshop interior panorama | scene1-showroom.jpg | Poly Haven — `autoshop_01` | CC0 |
| Parking lot panorama | scene2-exterior.jpg | Poly Haven — `future_parking` | CC0 |
| Lounge interior panorama | scene3-interior.jpg | Poly Haven — `aft_lounge` | CC0 |
| Road panorama | scene4-road.jpg | Poly Haven — `chapmans_drive` | CC0 |
| Cape Hill sunset panorama | scene5-sunset.jpg | Poly Haven — `cape_hill` | CC0 |
| Narration (all 5 tracks) | narration-1..5.mp3 | macOS `say` — Samantha voice | — |
| Ambient audio | ambient-*.mp3 | Synthesised (ffmpeg) | CC0 |
| SFX | click.mp3, transition-whoosh.mp3 | Synthesised (ffmpeg sine) | CC0 |
| Cardboard icon | cardboard-icon.svg | Custom SVG (this repo) | CC0 |

---

## Checklist for Final Submission

- [ ] Live HTTPS URL works on a phone
- [ ] Cardboard split-screen mode activates (tap goggles icon)
- [ ] All 5 scenes load and transition smoothly
- [ ] Each scene has ≥ 1 hotspot (total ≥ 13)
- [ ] Narration plays in each scene
- [ ] Ambient audio loops without gaps
- [ ] CTA scene shows "Reserved!" confirmation in-VR
- [ ] QR code printed for demo day
- [ ] Real 360° images in `assets/360/`
- [ ] Real narration audio in `assets/audio/`
- [ ] Total runtime: 2:30 ± 30 seconds
