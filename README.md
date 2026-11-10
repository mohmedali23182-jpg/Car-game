# مَسَالِك — دروب اليمن | MASALIK — Roads of Yemen

برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م.

Native Godot Android migration in `Masalik-3D/`. The React / Three.js browser project remains intact as a functional/content reference. The native project does not embed a browser, run Vite/Node, or make runtime network requests.

**Status: playable development implementation, not final 1.0.0 acceptance.** Native headless physics and integration checks pass locally. Physical Android and 30-minute performance/airplane-mode acceptance remain pending. See [audit](Masalik-3D/docs/NATIVE_AUDIT.md) and [validation](Masalik-3D/docs/VALIDATION.md). Historical phase reports are superseded by those documents.

## Run

Use Godot **4.6.3 stable**, Jolt Physics, GL Compatibility by default. Matching upstream release/templates verified; do not use the previous 4.7.2 workflow reference.

```bash
python3 Masalik-3D/tools/generate_audio.py
godot --headless --path Masalik-3D --editor --import
godot --path Masalik-3D
```

The deterministic audio generator runs only at development/build time and produces all bundled engine, tire, horn, impact, environment and music WAV assets. It downloads nothing. The font is bundled with its OFL license; the procedural meshes and shaders are local. Runtime does not depend on Python or Node.

For desktop testing: W / Up accelerate, S reverse, A/D steer, Space brake, H handbrake; touch steering and pedals are native controls. Native menus choose region, mission or garage. Missions provide a loan vehicle, preventing an economy deadlock. Monetary rewards are granted on first completion; replay updates records. Free drive uses unlocked vehicles; garage purchases and engine upgrades use local coins. Rescue missions require approaching the disabled car, attaching the rope button at low speed, and bringing it to the destination.

## Native systems

- Six mapped regions along a measured continuous centerline exceeding 15 km, streamed collidable terrain/road sectors, procedural local architecture, vegetation, rocks, a drive-through tunnel and water.
- All 10 original vehicle specifications and 65 catalog missions, including 25 story missions and all 5 chapter narratives, extracted reproducibly from the retained TypeScript content using `node Masalik-3D/tools/migrate_catalogs.cjs` (Node 24+ development only).
- RigidBody3D four-ray suspension, point forces, contact friction limits, drivetrain/gear ratios, mass/cargo, wet-surface grip, visible suspension/steering/spin, fuel and damage.
- Arabic native menus, garage SubViewport, paint/tires/rims/ride height, smooth multi-touch steering, keyboard/gamepad/tilt alternatives, editable pedal/wheel layouts, safe-area bounds and focus-loss reset.
- Six camera positions, orbit/photo capture to user data, local minimap, pooled traffic, weather/daylight, audio buses and local diagnostics.
- `user://` save with temporary-file replacement, validation, known-good backup recovery, schema migration and local import/export.

These are initial implementations. Force-based driving is verified in headless tests; advanced wheel-slip assists, towing, visual realism and device usability require further acceptance and tuning. See the validation matrix for limits.

## Tests

Use an isolated data directory so tests never affect actual user saves:

```bash
XDG_DATA_HOME=/tmp/masalik-test godot --headless --path Masalik-3D --fixed-fps 60 res://tests/headless_test_runner.tscn
XDG_DATA_HOME=/tmp/masalik-ui godot --headless --path Masalik-3D --fixed-fps 60 res://tests/ui_smoke.tscn
```

Physics frames really run under Jolt; no tests advance the player by assigning its position to simulate acceleration. Loading all map sectors is tested separately from physical driving acceptance. Test runner exits nonzero on failed checks; CI also rejects script/error output and enforces a timeout.

## Android build

Package `com.moataz.masalik`, version `1.0.0`, local default code `10001`, increasing CI code `10000 + run_number` (previous tracked code was 2), minimum API 26, ARM64 only, landscape. The workflow in root `.github/workflows/masalik_ci_android.yml` installs Java 17, Android API/build-tools 35, Godot/templates 4.6.3, generates local audio, imports, tests, exports, checks APK signature/manifest/ABI, rejects INTERNET permission and produces SHA256.

```bash
godot --headless --path Masalik-3D --install-android-build-template --export-debug 'Android ARM64' ../build/android/MASALIK-1.0.0-dev-arm64.apk
```

Requires matching Godot export templates, Android SDK and Java paths set in Godot editor settings. GitHub Actions uploads actual artifacts. Successful dedicated development-branch builds and `masalik-test-*` tags publish a **prerelease test build only** after success. A final stable release is intentionally gated by device acceptance and the owner's release signing key. No previous APK/signing key was present in this repository. The CI caches its dedicated debug key to keep test builds consistent while that cache exists. A cache loss changes its certificate; it is not a production signing solution. Debug builds are for testing and must not be represented as signed production updates; back up/export saves before uninstalling or changing signatures. Release signing uses the owner's local/export credentials, which must never be committed.

## Offline/device acceptance

Clean-install the actual APK, enable airplane mode **before first launch**, visit every region, drive every car and complete all mission categories, save/kill/reopen, background/resume with fingers held, check notch/wide-screen layout, export/import saves, and record at least 30 minutes of FPS/memory/crashes on identified devices. These are manual gates, not inferred from the absence of network code.

Browser reference commands remain `npm run dev`, `npm run build`, `npm run lint`; dependency installation and browser runtime were not part of native acceptance. No browser source was deleted.

## Driving experience refresh

The next test build replaces the initial box-like car visuals and bare-road HUD with beveled regional vehicle families, cabin details, locally shaded asphalt/masonry, Arabic roadside signs, collidable guardrails, horizon-oriented chase cameras, native instruments and progressive pedals. See [implementation and limits](Masalik-3D/docs/DRIVING_EXPERIENCE_REFRESH.md). All previous local saves and controls remain compatible.
