class_name MasalikCameraController
extends Camera3D
var target_vehicle: RigidBody3D
var current_view := 0
var orbit := Vector2(0.3,0.2)
var photo := false
var orbit_distance := 8.0
var offsets := [Vector3(0,2.15,7.7),Vector3(0,3.4,12),Vector3(-0.4,1.2,-0.3),Vector3(0,0.7,-2.3),Vector3(7,2.0,0),Vector3(0,5,8)]
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
	if current_view==2 and target_vehicle is RaycastVehicleBody:
		var spec: Dictionary=target_vehicle.spec
		var length := float(spec.wheelbaseM)+1.45
		var bus: bool=spec.id=="hafilat"
		var truck: bool=spec.id=="jabal"
		var roof := 1.03 if spec.id=="madina" else (0.87 if spec.id=="barq" else (1.95 if bus else 1.46))
		var cabin_front := -length*0.5+length*(0.06 if bus or truck else 0.28)
		offset=Vector3(-float(spec.trackWidthM)*0.22,minf(1.4,roof-0.24),cabin_front+(1.03 if bus or spec.id=="aseel" else 1.27))
	if current_view==5 or photo:
		offset=Vector3(sin(orbit.x)*cos(orbit.y),sin(clampf(orbit.y,-0.1,1.4)),cos(orbit.x)*cos(orbit.y))*orbit_distance
	var forward := -target_vehicle.global_basis.z
	forward.y=0;forward=forward.normalized()
	var yaw_basis := Basis.looking_at(forward,Vector3.UP)
	var desired := pos+(yaw_basis if current_view not in [2,3] else target_vehicle.global_basis)*offset
	if current_view not in [2,3]:
		var query := PhysicsRayQueryParameters3D.create(pos+Vector3.UP,desired)
		query.exclude=[target_vehicle.get_rid()]
		var hit := target_vehicle.get_world_3d().direct_space_state.intersect_ray(query)
		if not hit.is_empty(): desired=hit.position+hit.normal*0.3
	global_position=desired if current_view in [2,3] else global_position.lerp(desired,1-exp(-8*delta))
	var aim := pos+Vector3.UP*1.0+forward*5.5
	if current_view in [2,3]: aim=global_position-target_vehicle.global_basis.z*20
	if global_position.distance_to(aim)>0.1: look_at(aim,Vector3.UP)
	fov=lerpf(fov,68+minf(target_vehicle.linear_velocity.length()*0.35,14),1-exp(-3*delta))
