extends Node3D
var world: MasalikWorld
var car: RaycastVehicleBody
var elapsed := 0.0
var next_report := 1000.0
func _ready() -> void:
	world=MasalikWorld.new();add_child(world)
	car=RaycastVehicleBody.new();car.spec=VehicleFleetRegistry.get_spec("shahiq");car.position=world.point_at(40)+Vector3.UP*1.2;car.basis=world.basis_at(40);add_child(car)
	world.player=car;world.last_index=10
func _physics_process(delta: float) -> void:
	elapsed+=delta
	var speed := car.linear_velocity.length()
	var s := world.nearest_distance(car.position)
	var lookahead := 5+speed*0.55
	var local := car.global_basis.inverse()*(world.point_at(s+lookahead)-car.position)
	var angle := atan2(local.x,-local.z)
	var steer := clampf(angle*2.5,-1,1)
	var curve := absf(world.basis_at(s).z.signed_angle_to(world.basis_at(s+30).z,Vector3.UP))/30
	var target := minf(18,sqrt(3.5/maxf(curve,0.001)))
	var throttle := clampf((target-speed)*0.4,0,1)
	var brake := clampf((speed-target)*0.2,0,1)
	car.set_drive_inputs(throttle,brake,steer,false)
	if s>=next_report:
		print("ROAD_DRIVE distance=",s," seconds=",elapsed," health=",car.health," height=",car.position.y-world.point_at(s).y);next_report+=1000
	if s>=14900:
		print("ROAD_DRIVE PASS continuous 14.86 km force-driven simulation seconds=",elapsed);get_tree().quit()
	if car.position.y<world.point_at(s).y-10 or elapsed>1800:
		push_error("ROAD_DRIVE FAIL distance=%f elapsed=%f height=%f" % [s,elapsed,car.position.y-world.point_at(s).y]);get_tree().quit(1)
