# Driving experience refresh — 2026-11-10

Triggered by the first user-supplied actual Android screenshot: overly box-like vehicle silhouette, bare road, high view angle, binary-looking pedal symbols, oversized tool row and system-edge conflicts.

## Implemented changes

- Original locally generated beveled body geometry, separate hood/cabin/roof, sloped windscreens, door pillars/handles, grille, head/stop lamps, mirrors, spare tire, readable plate, tire tread, spokes and a modeled cabin. Sedan/sport, wagon/classic, pickup/recovery, heavy truck and bus families derive different dimensions/profiles from all ten original specifications. No third-party brand logos or downloaded vehicle meshes.
- Batch static vehicle and wheel parts by material, retaining animated wheels and interior steering. NPC wheel rotation now follows path speed.
- Asphalt aggregate/patch/crack shader, continuous white edge lines, center dashes, metal guardrails with collision, local Arabic direction and shop signs, village facades with masonry/white window surrounds. Region names are fictional game areas inspired by Yemen; this is not surveyed street geometry of actual cities.
- Follow camera uses a level yaw frame and looks ahead along the road, preserving the horizon instead of copying chassis roll. Cockpit and other existing views remain available.
- Native instrument panel with actual speed, RPM, gear/drive and fuel. Smaller tool row, pop-up utilities, proper pedal silhouettes, Arabic labels, visible pressed feedback, analog pedal travel and three-spoke steering.
- Explicit left-to-right HUD geometry independent of Arabic locale, Arabic text direction per label, safe area handling on both display edges, retained custom layouts, focus-loss reset, default startup parking until accelerator input, low-speed-only D/R selection.
- Softer speed-dependent steering and front/rear brake force distribution. Physics remains force based; this update does not claim a fully validated automotive ABS/ESC or tire-slip model.
- Home screen with real 3D selected vehicle preview, Arabic navigation, preserved garage/mission/settings functionality and short native UI fades.

## Validation

192 automated assertions pass locally, including new 16:9 / wide / ultrawide control bounds, analog pedal travel, steering-angle wrap and per-vehicle geometry batching. Native UI smoke includes startup parking on the actual sloping road. Continuous 14.86 km force-driven route regression is also run by CI after handling changes. CI renders actual menu, garage, driving and cockpit screenshots, then builds the actual APK and checks identity/ABI/minimum SDK/no-INTERNET/signature/SHA256.

The package remains com.moataz.masalik; CI increments versionCode and restores the existing dedicated debug signing cache. Verify certificate continuity against the last published test APK before calling a new file an update. Save data schema and owner credit are preserved.

## Limits

The art remains original procedural game art rather than photogrammetry. Exact real-world vehicle interiors, windshield reflections, richer roadside objects, fully independent brake-assist/slip validation and identified-device performance/thermal acceptance remain ongoing work. A new screenshot from Android is evidence of the user's successful previous launch, not evidence that every new feature has been tested on that phone. No measured phone FPS or photorealism is claimed.
