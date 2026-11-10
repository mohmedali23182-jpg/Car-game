class_name MasalikCameraController
extends Camera3D
var target_vehicle: RigidBody3D
var current_view := 0
var orbit := Vector2(0.3,0.2)
var photo := false
var orbit_distance := 8.0
var offsets := [Vector3(0,2.8,7),Vector3(0,5,13),Vector3(-0.4,1.2,-0.3),Vector3(0,0.7,-2.3),Vector3(7,2.0,0),Vector3(0,5,8)]
func cycle_camera_view() -> void: current_view=(current_view+1)%6
func _unhandled_input(event: InputEvent) -> void:
	if current_view!=5 and not photo: return
	if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT): orbit+=event.relative*0.004
	if event is InputEventScreenDrag: orbit+=event.relative*0.004
	if event is InputEventMagnifyGesture: orbit_distance=clampf(orbit_distance/event.factor,2,40)
	if event is InputEventMouseButton and event.pressed:
		if event.button_index==MOUSE_BUTTON_WHEEL_UP: orbit_distance=maxf(2,orbit_distance-1)
		if event.button_index==MOUSE_BUTTON_WHEEL_DOWN: orbit_distance=minf(40,orbit_distance+1)
func _process(delta: float) -> void:
	if not is_instance_valid(target_vehicle): return
	var pos := target_vehicle.global_position
	var offset: Vector3=offsets[current_view]
	if current_view==5 or photo:
		offset=Vector3(sin(orbit.x)*cos(orbit.y),sin(clampf(orbit.y,-0.1,1.4)),cos(orbit.x)*cos(orbit.y))*orbit_distance
	var desired := pos+target_vehicle.global_basis*offset
	if current_view not in [2,3]:
		var query := PhysicsRayQueryParameters3D.create(pos+Vector3.UP,desired)
		query.exclude=[target_vehicle.get_rid()]
		var hit := target_vehicle.get_world_3d().direct_space_state.intersect_ray(query)
		if not hit.is_empty(): desired=hit.position+hit.normal*0.3
	global_position=desired if current_view in [2,3] else global_position.lerp(desired,1-exp(-8*delta))
	var aim := pos+Vector3.UP*0.8
	if current_view in [2,3]: aim=global_position-target_vehicle.global_basis.z*20
	if global_position.distance_to(aim)>0.1: look_at(aim,Vector3.UP)
	fov=lerpf(fov,68+minf(target_vehicle.linear_velocity.length()*0.35,14),1-exp(-3*delta))
