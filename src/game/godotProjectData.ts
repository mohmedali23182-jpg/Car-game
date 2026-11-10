export interface GodotProjectFile {
  path: string;
  category: 'config' | 'scene' | 'script' | 'ci' | 'docs';
  descriptionAr: string;
  content: string;
}

export const GODOT_PROJECT_FILES: GodotProjectFile[] = [
  {
    path: 'Masalik-3D/project.godot',
    category: 'config',
    descriptionAr:
      'ملف إعدادات محرك Godot 4.7.2 (الإصدار MASALIK v1.0.0 — OFFLINE COMPLETE EDITION) مع Jolt Physics 3D و Mobile Renderer',
    content: `; Engine configuration file.
config_version=5

[application]

config/name="MASALIK — مَسَالِك | دروب اليمن"
config/description="3D Yemeni Open-World Driving & Off-road Simulation (100% Offline Complete Edition) - برمجة وتطوير معتز العلقمي - تعز - اليمن - 2026م"
config/version="1.0.0-offline"
run/main_scene="res://scenes/main/main_game.tscn"
config/features=PackedStringArray("4.7", "Mobile")
boot_splash/bg_color=Color(0.047, 0.059, 0.078, 1)
config/icon="res://assets/textures/icon.svg"

[autoload]

GameManager="*res://scripts/core/game_manager.gd"
PersistenceManager="*res://scripts/persistence/persistence_manager.gd"
SmartWheelController="*res://scripts/ui/smart_wheel_controller.gd"
ControlStudioManager="*res://scripts/ui/control_studio_manager.gd"
WorldStreamingManager="*res://scripts/world/world_streaming_manager.gd"
TimeAndWeatherSystem="*res://scripts/world/time_and_weather_system.gd"
TrafficAIManager="*res://scripts/world/traffic_ai_manager.gd"

[display]

window/size/viewport_width=1920
window/size/viewport_height=1080
window/stretch/mode="canvas_items"
window/stretch/aspect="expand"
window/handheld/orientation=4

[internationalization]

rendering/text_driver="ICU / HarfBuzz / Graphite (Built-in)"
rendering/force_right_to_left_layout_direction=true

[physics]

3d/physics_engine="JoltPhysics3D"
3d/default_gravity=9.81
common/physics_ticks_per_second=60

[rendering]

renderer/rendering_method="mobile"
renderer/rendering_method.mobile="mobile"
textures/vram_compression/import_etc2_astc=true
anti_aliasing/quality/msaa_3d=1
`,
  },
  {
    path: 'Masalik-3D/scripts/ui/smart_wheel_controller.gd',
    category: 'script',
    descriptionAr:
      'وحدة التحكم في المقود الدائري الذكي (MASALIK Smart Steering Wheel) مع دعم اللمس المتعدد المستقل (Multi-Touch Pointer ID)',
    content: `class_name SmartWheelController
extends Control
## MASALIK Smart Steering Wheel — يدعم زاوية دوران 180°–900°، الإرجاع التلقائي، واللمس المتعدد المستقل

@export var max_rotation_deg: float = 270.0
@export var sensitivity: float = 1.0
@export var auto_center_speed: float = 4.5
@export var dead_zone_deg: float = 1.5

var active_touch_id: int = -1
var prev_touch_angle_deg: float = 0.0
var wheel_angle_deg: float = 0.0
var steer_output: float = 0.0

func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.pressed and active_touch_id == -1:
			active_touch_id = touch.index
			prev_touch_angle_deg = _compute_angle_deg(touch.position)
		elif not touch.pressed and touch.index == active_touch_id:
			active_touch_id = -1
	elif event is InputEventScreenDrag:
		var drag := event as InputEventScreenDrag
		if drag.index == active_touch_id:
			var curr_angle := _compute_angle_deg(drag.position)
			var delta := fposmod(curr_angle - prev_touch_angle_deg + 180.0, 360.0) - 180.0
			prev_touch_angle_deg = curr_angle
			var half_range := max_rotation_deg * 0.5
			wheel_angle_deg = clampf(wheel_angle_deg + delta * sensitivity, -half_range, half_range)
			steer_output = clampf(wheel_angle_deg / half_range, -1.0, 1.0)

func _compute_angle_deg(local_pos: Vector2) -> float:
	var center := size * 0.5
	return rad_to_deg(atan2(local_pos.y - center.y, local_pos.x - center.x))
`,
  },
  {
    path: 'Masalik-3D/scripts/vehicles/vehicle_fleet_registry.gd',
    category: 'script',
    descriptionAr:
      'سجل أسطول المركبات العشر الكامل (الشاهق، الصقر، الرحّال، المدينة، الجبل، البرق، الحافلة، المنقذ، البادية، الأصيل)',
    content: `class_name VehicleFleetRegistry
extends Node
## سجل أسطول مركبات مَسَالِك العشر (MASALIK v1.0.0 — OFFLINE COMPLETE EDITION)

const FLEET_IDS := [
	"al_shahiq", "al_saqr", "al_rahhal", "al_madina", "al_jabal",
	"al_barq", "al_hafila", "al_munqidh", "al_badiya", "al_aseel"
]
`,
  },
  {
    path: 'Masalik-3D/android/export_presets.cfg',
    category: 'config',
    descriptionAr:
      'إعدادات تصدير Android ARM64 لإصدار MASALIK v1.0.0 — OFFLINE COMPLETE EDITION (com.moataz.masalik / دون صلاحيات إنترنت)',
    content: `[preset.0]

name="Android ARM64"
platform="Android"
runnable=true
dedicated_server=false
export_filter="all_resources"
export_path="../build/android/MASALIK-v1.0.0-offline-arm64.apk"

[preset.0.options]

gradle_build/use_gradle_build=true
gradle_build/min_sdk="26"
gradle_build/target_sdk="34"
architectures/armeabi-v7a=false
architectures/arm64-v8a=true
architectures/x86=false
architectures/x86_64=false
version/code=5
version/name="1.0.0-offline"
package/unique_name="com.moataz.masalik"
package/name="مَسَالِك — دروب اليمن"
package/signed=true
permissions/internet=false
`,
  },
];
