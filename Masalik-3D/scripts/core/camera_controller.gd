class_name MasalikCameraController
extends Camera3D
## يدير الكاميرات الثلاث مع تنعيم الحركة ومنع اختراق التضاريس

enum CameraView { CHASE_FOLLOW, COCKPIT_INTERIOR, HIGH_WIDE_ANGLE }

@export var target_vehicle: Node3D
@export var current_view: CameraView = CameraView.CHASE_FOLLOW
@export var smooth_speed: float = 8.5

func cycle_camera_view() -> void:
	current_view = ((int(current_view) + 1) % 3) as CameraView

func _physics_process(delta: float) -> void:
	if target_vehicle == null:
		return

	var basis_t: Basis = target_vehicle.global_transform.basis
	var pos_t: Vector3 = target_vehicle.global_position

	match current_view:
		CameraView.CHASE_FOLLOW:
			var desired_pos := pos_t + basis_t.z * 7.2 + Vector3.UP * 2.85
			global_position = global_position.lerp(desired_pos, clampf(smooth_speed * delta, 0.0, 1.0))
			look_at(pos_t + Vector3.UP * 1.25 - basis_t.z * 3.0, Vector3.UP)
		CameraView.COCKPIT_INTERIOR:
			global_position = pos_t - basis_t.x * 0.42 + Vector3.UP * 1.58 - basis_t.z * 0.05
			look_at(global_position - basis_t.z * 12.0, basis_t.y)
		CameraView.HIGH_WIDE_ANGLE:
			var desired_wide := pos_t + basis_t.z * 13.5 + Vector3.UP * 6.4
			global_position = global_position.lerp(desired_wide, clampf(smooth_speed * 0.75 * delta, 0.0, 1.0))
			look_at(pos_t + Vector3.UP * 1.5 - basis_t.z * 5.0, Vector3.UP)
