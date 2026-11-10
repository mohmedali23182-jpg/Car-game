class_name VehiclePhysicsConfig
extends Resource
## إعدادات الفيزياء والتعليق لسيارة الدفع الرباعي الجبلية — مَسَالِك
## برمجة وتطوير: معتز العلقمي – تعز – اليمن – 2026م

@export_group("Chassis & Mass")
@export var mass_kg: float = 1880.0
@export var center_of_mass_offset: Vector3 = Vector3(0.0, -0.35, 0.0)
@export var anti_roll_stiffness: float = 9200.0

@export_group("Raycast Suspension")
@export var suspension_rest_length: float = 0.62
@export var suspension_max_travel: float = 0.32
@export var spring_stiffness: float = 42000.0
@export var spring_damping: float = 5400.0
@export var wheel_radius: float = 0.44

@export_group("Drivetrain & Brakes")
@export var max_engine_force: float = 17800.0
@export var max_brake_force: float = 22500.0
@export var max_reverse_force: float = 11200.0
@export var handbrake_force: float = 18000.0
@export var max_steer_angle_deg: float = 32.0
@export var steer_response_speed: float = 5.5

@export_group("Surface Tire Grip")
@export var asphalt_friction: float = 1.08
@export var dirt_friction: float = 0.72
@export var cornering_stiffness: float = 14500.0
