# مَسَالِك — دروب اليمن | MASALIK — Roads of Yemen
## التقرير الهندسي للمرحلة الأولى (Phase 1 Engineering & Delivery Report)

- **اسم المشروع بالعربية:** مَسَالِك — دروب اليمن
- **الاسم الإنجليزي:** MASALIK — Roads of Yemen
- **النوع:** 3D Mountain Driving & Off-road Simulation
- **المطور والمالك:** معتز العلقمي
- **الحقوق:** برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م
- **معرّف أندرويد:** `com.moataz.masalik`
- **الحد الأدنى المستهدف:** Android 8.0 / API 26 (`arm64-v8a`)

---

## 1. البنية الهندسية المنفّذة (`Masalik-3D/`)

```text
Masalik-3D/
├── project.godot
├── scenes/
│   ├── main/main_game.tscn
│   ├── menus/
│   ├── world/
│   ├── vehicles/
│   ├── cameras/
│   └── ui/
├── scripts/
│   ├── core/ (game_manager.gd, camera_controller.gd, performance_monitor.gd)
│   ├── vehicles/
│   ├── physics/ (vehicle_physics_config.gd, raycast_vehicle_body.gd)
│   ├── world/ (mountain_road_generator.gd)
│   ├── input/
│   ├── audio/
│   └── persistence/ (persistence_manager.gd)
├── assets/ (cars, terrain, roads, buildings, vegetation, textures/icon.svg, fonts, audio)
├── shaders/
├── data/
├── tools/
├── tests/ (headless_test_runner.gd)
├── android/ (export_presets.cfg)
├── docs/ (PHASE1_ENGINEERING_REPORT.md)
└── .github/workflows/ (masalik_ci_android.yml)
```

---

## 2. كيفية التشغيل والاختبار والبناء

### أ) تشغيل النسخة التفاعلية المباشرة (WebGL 3D Simulation)
```bash
npm install
npm run dev
```

### ب) فتح المشروع في محرك Godot 4.7.2 Stable وتشغيل الاختبارات الآلية
```bash
godot --path ./Masalik-3D --editor
godot --headless --path ./Masalik-3D -s res://tests/headless_test_runner.gd
```

### ج) تصدير حزمة Android ARM64 APK
```bash
mkdir -p build/android
godot --headless --path ./Masalik-3D --export-debug "Android ARM64" ../build/android/Masalik-3D-arm64-debug.apk
```
*(ملاحظة شفافية البيئة: بيئة الحاوية السحابية الحالية لا تحتوي على ثنائيات Android SDK / Godot المثبتة محليًا، لذا تم تضمين خط بناء آلي كامل في `.github/workflows/masalik_ci_android.yml` يقوم بتثبيت Godot 4.7.2 وقوالب التصدير وAndroid SDK 34 وتشغيل اختبارات Headless وتوليد ملف الـ APK تلقائيًا عند الرفع).*
