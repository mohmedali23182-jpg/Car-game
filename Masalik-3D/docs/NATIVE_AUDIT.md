# Native migration audit — 2026-11-10

Baseline: main 49c080c7aa2250f9f90665610aa28662c52bce91.

Executed Godot 4.6.3.stable.official.7d41c59c4 headless editor import. Original failed with missing MainMenu, quality manager, telemetry logger, and two singleton/class-name conflicts. The original project requested 4.7; the installed and GitHub upstream verified stable release is 4.6.3. Use matching templates. Correct Jolt setting is `Jolt Physics`.

## Code findings

Browser source includes ten detailed vehicle specifications, procedural Three.js vehicle/world builders, a force-inspired browser physics system, road splines, a mission catalog, synthesized Web Audio, localStorage persistence and React control/garage/settings interfaces. Those are browser implementations; their presence proves neither Godot parity nor Android behavior. Browser runtime tests have not yet been run. All browser source is retained unchanged.

Godot originally contains one 2 km triangle road generator, an unconnected four-ray force controller, five fleet dictionary entries, three camera modes, a JSON save implementation, and a two-assert headless test. Vehicle scene has no visible meshes and exports no ray array entries. No input UI exists. World streaming only sets dictionary booleans; traffic only sets a count; weather only returns friction multipliers. No audio/font/model assets beyond an SVG icon exist. Several directories literally contain brace expressions instead of actual subdirectories.

Previous PHASE1/PHASE2 reports claim 15 km streaming, ten cars, garage, drivetrain, traffic, photo mode and atomic saving. The original native code does not substantiate those claims. Original save overwrites primary directly, and overwrites backup with potentially corrupt primary. Those historical reports are retained as records, superseded by this audit and current validation notes.

## Migration mapping

| Web source | Native destination |
|---|---|
| physicsEngine | physics/raycast_vehicle_body + config |
| vehicleFleet | local JSON catalog + fleet registry |
| vehicleBuilder | vehicles/vehicle_visual |
| worldBuilder / roadSpline | world streamed road and terrain |
| missionsCatalog | local catalog + mission controller |
| persistenceManager | persistence manager, user:// atomic recovery |
| audioEngine | bundled WAV + local audio buses |
| React controls, garage, story, settings | native Control nodes and SubViewport |
| testSuite | headless integration/physics tests + device checklist |

## Release gates

No prior signing key or APK is present in the tracked tree. No release continuity can be asserted. Use an explicitly identified debug test build; production requires owner's release keystore. Android SDK/templates are absent locally. A physical phone is unavailable. Offline first launch, multi-touch, thermal behavior and a 30-minute device performance test must be marked unverified until actually performed. Never publish a final 1.0 release based only on headless checks.
