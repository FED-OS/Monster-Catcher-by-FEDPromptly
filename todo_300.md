# Monster Catcher — 300% Graphics Upgrade

## Goal
Major visual quality jump. Creatures currently "look like shit" — rewrite sprite system for richer, larger, properly-shaded pixel art. Overall scene needs to look far more polished.

## Tasks

### Creatures (biggest problem) — UPGRADED to structured procedural pixel art
- [x] Upgrade sprite canvas from 32x32 to 64x64 for 4x the detail room
- [x] Build helper infrastructure (shadeBody, gridShadow, eyes, fillBlob, outlineRegion)
- [x] Rewrite fire line (emberit/infernyx/pyrothorn) with flame detail, claws, horns, rim light
- [x] Rewrite water line (aquip/tidalon/leviathorn) with scales, fins, water sheen, dorsal fins
- [x] Rewrite grass line (leafon/florahn/thornheart) with leaves, thorns, flower petals, veins
- [x] Rewrite rattick (normal) with big ears, long tail, whiskers, buck teeth
- [x] Rewrite 5 default shapes (round/quad/spiky/finned/winged) with distinct silhouettes
- [x] Verify all sprites render cleanly (no errors) — confirmed via contact sheet + battle

### Overall scene polish
- [x] Add subtle dithering/shading to grass tiles for depth (already present — confirmed)
- [x] Improve building rendering (roof gradients, window glows, shingles — confirmed)
- [x] Add cast shadows under buildings and trees (NEW — added this session)
- [x] Improve battle background layering (added atmospheric haze, lighter distant forest)

### Verification
- [x] Screenshot creatures contact sheet (new pixel-grid art) — sprite_contact_sheet_300.png
- [x] Screenshot overworld + battle final — final_battle_300.png
- [x] Re-package zip — monster-catcher-desktop.zip (166KB)
