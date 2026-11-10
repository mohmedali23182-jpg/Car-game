class_name RaycastVehicleBody
extends RigidBody3D
## نظام فيزياء المركبة المخصص (RigidBody3D + RayCast3D) مع Jolt Physics
## يفصل الفيزياء عن المجسم المرئي وعن مدخلات المستخدم

@export var config: VehiclePhysicsConfig
@export var wheel_raycasts: Array[RayCast3D] = []
@export var visual_wheel_nodes: Array[Node3D] = []

var throttle_input: float = 0.0
var brake_input: float = 0.0
var steer_input: float = 0.0
var handbrake_active: bool = false

var current_steer_rad: float = 0.0
var prev_compression: Array[float] = [0.0, 0.0, 0.0, 0.0]
var wheel_spin_rad: Array[float] = [0.0, 0.0, 0.0, 0.0]
var current_speed_kmh: float = 0.0
var current_surface: String = "asphalt"

func _ready() -> void:
	if config == null:
		config = VehiclePhysicsConfig.new()
	mass = config.mass_kg
	center_of_mass_mode = RigidBody3D.CENTER_OF_MASS_MODE_CUSTOM
	center_of_mass = config.center_of_mass_offset

func set_drive_inputs(throttle: float, brake: float, steer: float, handbrake: bool) -> void:
	throttle_input = clampf(throttle, 0.0, 1.0)
	brake_input = clampf(brake, 0.0, 1.0)
	steer_input = clampf(steer, -1.0, 1.0)
	handbrake_active = handbrake

func _physics_process(delta: float) -> void:
	var forward_dir: Vector3 = -global_transform.basis.z
	var forward_speed: float = linear_velocity.dot(forward_dir)
	current_speed_kmh = absf(forward_speed) * 3.6

	var target_steer := steer_input * deg_to_rad(config.max_steer_angle_deg)
	current_steer_rad = move_toward(current_steer_rad, target_steer, config.steer_response_speed * delta)

	var compressions: Array[float] = [0.0, 0.0, 0.0, 0.0]

	for i in range(min(4, wheel_raycasts.size())):
		var ray: RayCast3D = wheel_raycasts[i]
		var is_front: bool = (i < 2)
		if is_front:
			ray.rotation.y = -current_steer_rad

		ray.target_position = Vector3(0.0, -(config.suspension_rest_length + config.wheel_radius), 0.0)
		ray.force_raycast_update()

		if ray.is_colliding():
			var hit_point: Vector3 = ray.get_collision_point()
			var hit_normal: Vector3 = ray.get_collision_normal()
			var collider: Object = ray.get_collider()
			var surface_mu: float = config.asphalt_friction

			if collider and collider.has_meta("surface_type"):
				current_surface = str(collider.get_meta("surface_type"))
				if current_surface == "dirt":
					surface_mu = config.dirt_friction

			var ray_origin: Vector3 = ray.global_position
			var dist: float = ray_origin.distance_to(hit_point) - config.wheel_radius
			var compression: float = clampf(1.0 - (dist / config.suspension_rest_length), 0.0, 1.0)
			compressions[i] = compression

			var comp_vel: float = (compression - prev_compression[i]) / maxf(delta, 0.001)
			prev_compression[i] = compression

			var spring_force_mag: float = maxf(0.0,
				compression * config.suspension_rest_length * config.spring_stiffness +
				comp_vel * config.spring_damping
			)
			var spring_force_vec: Vector3 = hit_normal * spring_force_mag

			var wheel_forward: Vector3 = -ray.global_transform.basis.z
			var wheel_right: Vector3 = ray.global_transform.basis.x
			var point_offset: Vector3 = hit_point - global_position
			var point_vel: Vector3 = linear_velocity + angular_velocity.cross(point_offset)

			var long_force_mag: float = 0.0
			if throttle_input > 0.01:
				long_force_mag += throttle_input * (config.max_engine_force * 0.25) * surface_mu
			if brake_input > 0.01:
				if forward_speed > 0.8:
					long_force_mag -= brake_input * (config.max_brake_force * 0.25) * surface_mu
				else:
					long_force_mag -= brake_input * (config.max_reverse_force * 0.25) * surface_mu
			if handbrake_active and not is_front:
				long_force_mag -= signf(forward_speed) * (config.handbrake_force * 0.5) * surface_mu

			var long_force_vec: Vector3 = wheel_forward * long_force_mag

			var lateral_vel: float = point_vel.dot(wheel_right)
			var lat_force_mag: float = -lateral_vel * config.cornering_stiffness * surface_mu * 0.25
			var lat_force_vec: Vector3 = wheel_right * lat_force_mag

			apply_force(spring_force_vec + long_force_vec + lat_force_vec, point_offset)

			if i < visual_wheel_nodes.size() and visual_wheel_nodes[i] != null:
				var w_node: Node3D = visual_wheel_nodes[i]
				w_node.position.y = -dist
				w_node.rotation.y = -current_steer_rad if is_front else 0.0
				wheel_spin_rad[i] -= (forward_speed / config.wheel_radius) * delta
				w_node.rotation.x = wheel_spin_rad[i]
		else:
			prev_compression[i] = 0.0

	var front_roll_diff: float = compressions[0] - compressions[1]
	var rear_roll_diff: float = compressions[2] - compressions[3]
	var anti_roll_torque: Vector3 = global_transform.basis.z * ((front_roll_diff + rear_roll_diff) * config.anti_roll_stiffness)
	apply_torque(anti_roll_torque)
