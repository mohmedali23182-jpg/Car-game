class_name MasalikTraffic
extends Node3D
var world: MasalikWorld
var player: RaycastVehicleBody
var pool: Array[CharacterBody3D] = []
var distances: Array[float] = []
var speeds: Array[float] = []
var active_count := 6
func _ready() -> void:
	for i in range(8):
		var car := CharacterBody3D.new()
		car.collision_layer=2; car.collision_mask=3
		var shape := CollisionShape3D.new();var box := BoxShape3D.new();box.size=Vector3(1.8,1.5,4)
		shape.shape=box;shape.position.y=0.5;car.add_child(shape)
		var visual := VehicleVisual.new();car.add_child(visual);visual.build(VehicleFleetRegistry.get_spec(["madina","saqr","hafilat"][i%3]))
		add_child(car);pool.append(car);distances.append(-1);speeds.append(0)
func _physics_process(delta: float) -> void:
	if not is_instance_valid(player) or world==null: return
	for i in range(pool.size()):
		var car := pool[i]
		car.visible=i<active_count
		car.collision_layer=2 if i<active_count else 0
		if i>=active_count: continue
		var dir := 1.0 if i%2==0 else -1.0
		if distances[i]<0 or absf(distances[i]-world.distance)>350 or distances[i]<10 or distances[i]>14990:
			distances[i]=clampf(world.distance+70+i*32,10,14990)
			car.position=world.point_at(distances[i])+world.basis_at(distances[i]).x*(-2.6*dir)+Vector3.UP*0.9
		var future := world.basis_at(distances[i]+dir*20)
		var current := world.basis_at(distances[i])
		var curve_slow := absf(future.z.signed_angle_to(current.z,Vector3.UP))
		var target_speed := 14.0/(1+curve_slow*8)
		var ahead := -current.z*dir
		var query := PhysicsRayQueryParameters3D.create(car.global_position+Vector3.UP*0.5,car.global_position+Vector3.UP*0.5+ahead*18)
		query.collision_mask=3;query.exclude=[car.get_rid()]
		if not get_world_3d().direct_space_state.intersect_ray(query).is_empty(): target_speed=0
		speeds[i]=move_toward(speeds[i],target_speed,delta*4)
		var next_s := clampf(distances[i]+speeds[i]*delta*dir,0,15000)
		var next := world.point_at(next_s)+world.basis_at(next_s).x*(-2.6*dir)+Vector3.UP*0.9
		var collision := car.move_and_collide(next-car.position)
		if collision==null: distances[i]=next_s
		else: speeds[i]=0
		car.basis=current if dir>0 else current.rotated(Vector3.UP,PI)
