# Home Free: handoff

Read this first, then `DESIGN.md` (story, pacing and AI design, with research sources).

## What it is
A first-person horror game in one HTML file, using Three.js r147, built from concatenated sources. Target length is 35–50 minutes, in the slow-burn chores style of Fears to Fathom. The player clears out their dead father's house the night before demolition. Their brother Owen vanished in 1994 during hide-and-seek and is sealed behind the plastered wall under the stairs. The monster is "It": a starved, too-tall figure with its hands over its face. It lives upstairs and comes down the real stairs to hunt.

## Layout
```
home-free/
  DESIGN.md              story, act structure, AI design, research links
  HANDOFF.md             this file
  build.sh               concatenates src/* into ../home-free.html (edit the file list here)
  tools/assets.json      Poly Haven CC0 manifest (models, texture sets, texture-only models)
  tools/fetch_assets.py  downloads assets into assets/ (size + md5 verified, idempotent; shrinks small-prop textures)
  assets/                (gitignored, ~134 MB) models/<id>/<id>.gltf, tex/<id>_{diff,nor,arm}.jpg, manifest.json
  src/
    1-shell.html   HTML/CSS: title, intro, HUD (subtitles, intent line, walkie LED, breath/stamina), pause, death, end, documents
    2-data.js      window.__HF: grid MAP (26x31, rows 21-30 = garden 'o'), ROOMS, START, STAIRS, WALL, HIDES, CREAKS, bfs/distField/los
    3-core.js      three.js + GLTFLoader script tags, renderer, post shader (ACES, grain, aberration, fear), lights, canvas texture helpers, Batch (world-metre UVs), colliders
    4-art.js       canvas textures (posters, photos, calendar, missing poster, polaroid, height marks, cardboard), overlay(), buildMaterials() (scanned PBR sets), rb/lathe/turned/clothDrape/hangGeo
    4b-assets.js   LoadingManager + progress bar, loadTexSet, loadModel, pbr(id,{tile,color}), model(), putModel(), setModel(), loadAssets()
    5-props.js     PR.* custom props (wardrobe, bunk, cooker, fridge, phone/answering machine, walkie, stairs pieces, fence, skip, street lamp...)
    6a-sculpt.js   SDF sculpting + surface nets mesher (verified watertight), anatomy SDFs (torso, head, jaw, limbs, hands, feet)
    6b-it.js       buildIt() rig, poseIt() animation + 2-bone IK keeping hands over face (peek/reveal/scare modes), den contents
    7-world.js     buildShell() walls/floors/doors from MAP, furnish() (STILL USES PROCEDURAL PROPS: see TODO), buildOutside(), snow
    8a-audio-core.js  WebAudio graph, HRTF spatial() with wall occlusion, noise/tone primitives, speechSynthesis say()
    8b-audio.js    every sound (wordless phone voices via formant babble, It's voice/clicks, stairs, plaster strikes, gritter...) + adaptive score layers
    9a-state.js    G/P/D/IT_S state, noise() events, losBlocked, UI helpers, refreshIntent() (objective text derived from state)
    9b-story.js    evening chores, Ruth's call, answering machine, keep items, fire/tea/sofa, night start, wall knocking/hammer/break
    9c-ai.js       Director (menace gauge, counting, false counts, descend/withdraw) + It's AI (search plans, door listening, hide checks, chase, hearing)
    9d-player.js   movement, creaky boards, breath-holding, hiding (wardrobes/beds), torch + hammer viewmodel, fear mix, props animation
    9e-loop.js     documents, ending cinematic, death/scare, input, intro, main loop, boot, sim() test hook, HF.debug
../home-free.html        build output
```

## Run and test
```
cd home-free && python3 tools/fetch_assets.py && ./build.sh
cd .. && python3 -m http.server 8765    # glTF needs http, not file://
open http://127.0.0.1:8765/home-free.html
```
Headless checks use Playwright and Chromium with `--use-gl=angle --use-angle=swiftshader` (about 6 fps). `__HF.debug` exposes the state plus `sim(seconds)`, `startNight()`, `descend()`, `breakWall()`, `startEnding()`, `killPlayer()`, `findTarget()` and more.

Verified working before the asset switch:
- the whole evening chore chain
- the night call
- the count and descent
- the search
- hiding (It searched near the player and left)
- being caught, with the jump scare
- the knocks, hammer, six strikes and wall break

The final ending run was interrupted, but the Owen interaction radius was already fixed. It's now `r:3.3` in `9b-story.js`.

## In progress when stopped (task 2 of 5)
1. **Conifer and fence code was NOT applied.** The edit was rejected by the interruption. `5-props.js` still contains the old `car()` and `tree()` (`tree()` uses `MATS.pineNeedles`, which no longer exists, so it will crash). Plan: delete `car()`; replace `tree()` with `conifer(h)`. The trunk is a lathe with `MATS.bark` (the scanned fir bark, `TEXSET.bark`). Branches are crossed alpha-tested needle cards with drooping vertex bend, merged per tree, plus a snow card layer. The needle colours are sampled from `TEXSET.twigRef`. Rebuild the fence with `MATS.plank`.
2. `buildMaterials()` now references removed or renamed things. Grep for `MATS.carPaint|tyre|headlight|taillight|amber|pineNeedles` and remove those uses. `buildOutside()` uses `PR.car()` and `PR.tree()`. Replace them with `putModel('covered_car', ...)` (Dad's car under a cover) and `conifer()`.
3. Run `./build.sh` and the contact sheet (`sheet.html` in `home-free/`; delete it before committing), then boot the game over http and fix errors.

## Remaining tasks
- **Task 3: furnish with real models.** All 62 models are downloaded; see `tools/assets.json`. They're Y-up, in metres, front +Z. Use `putModel(id,x,z,rot,{h,tint,col,block,pad})` for floor items and `setModel(id,x,y,z,rot)` for items on surfaces. Planned mapping:
  - Hall: `vintage_grandfather_clock_01` (animate its HourHand and MinuteHand nodes), `side_table_01` with the keys bowl, `rubber_boots`, `ornate_mirror_01`, `wooden_ladder`
  - Study: `wooden_bookshelf_worn` ×2, `book_encyclopedia_set_01`, `desk_lamp_arm_01`, `binder_notebook`, `office_notepads`, `round_spectacles`, `metal_toolbox` (Dad's toolbox), `cross_pein_hammer` (the hammer pickup and the viewmodel `hamV`), `vintage_pocket_watch` (make Dad's watch a pocket watch)
  - Parents: `old_bed_frame` with a cloth-sim mattress and duvet, `Rockingchair_01`, `painted_wooden_nightstand` ×2, `alarm_clock_01`, `vintage_suitcase`, `standing_picture_frame_0x`
  - Boys: `portable_cassette_player`, `dirty_football`, `chess_set`
  - Kitchen: `tea_set_01`, `jug_01`, `pot_enamel_01` (on the hob; change the "kettle" lines to a pan), `wooden_cutting_board`, `multi_cleaner_bottle`, `bleach_bottle`, `wooden_broom`, `dustpan`, `wall_clock`, `painted_wooden_shelves`, `pull_chain_light_socket` (bare bulbs)
  - Dining: `dining_table`, `painted_wooden_chair_01` ×6, `vintage_cabinet_01`
  - Living: `sofa_02`, `ArmChair_01`, `throw_pillows_01`, `television_02`, `mantel_clock_01`, `wicker_basket_01` (logs), `potted_plant_02`
  - Bath: `rubber_duck_toy`, and a `terry_cloth` towel
  - Clearance: `cardboard_box_01` with label decals from `cardboard()`, and `trashbag`
  - Outside: `covered_car`, `street_lamp_02`, `garden_gnome`, `planter_pot_clay`, `watering_can_metal_01`, `wooden_crate_01`, `shrub_02`, `tree_stump_01`
  - Den: `small_plastic_torch` (Owen's torch)

  Keep custom versions, now in scanned materials, of things with no asset: wardrobes (they're hiding spots and need their `doors` pivots), the bunk bed, cooker, fridge, answering machine, walkies, stairs, radiators, windows and doors. Add real skirting boards and coving along walls.
- **Story simplification already decided.** No player car: a taxi dropped you off. The "put them in the boot" chore becomes "put them in my holdall by the front door". At night the missing item is the house keys (the front door is deadlocked). Update `carLabel/carAct`, `KEEP` lines and `refreshIntent()` to match.
- **Task 4: It.** Raise the surface-net resolution and add a detail normal map from the `damaged_plaster` or `leather_white` scans (chalky, cracked skin). Improve the face and hands. The IK hands-over-face posing works; check `i2.png`-style close-ups.
- **Task 5: playtest, commit and publish.**
  - Run a full headless playthrough: evening, night, hunts, wall, ending.
  - Commit to branch `claude/beautiful-einstein-eyb5yg` of `usbheadphones/ciphertext`. Don't commit `assets/`.
  - Publish as a claude.ai artifact: the page is home-free.html with the `<!DOCTYPE>/html/head/body` wrapper stripped. The assets go up as supporting files under `assets/...`; that's about 435 files and 134 MB, so it takes several publishes (≤255 files and 64 MB each, ≤511 files and 256 MB per version).

## Older prototype (superseded)
`../ashgrove.html` is the first attempt: a ghost-girl story, which was rejected as clichéd. It is not part of Home Free and can be deleted.
