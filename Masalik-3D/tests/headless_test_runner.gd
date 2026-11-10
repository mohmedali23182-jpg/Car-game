extends Node
@onready var root: Window = get_tree().root
var failures := 0
var checks := 0
func check(condition: bool, text: String) -> void:
	checks+=1
	if condition: print("PASS ",text)
	else: failures+=1;push_error("FAIL "+text)
func _ready() -> void: call_deferred("run")
func load_scripts(dir: String) -> void:
	for name in DirAccess.get_files_at(dir):
		if name.ends_with(".gd"):
			var s: GDScript=load(dir.path_join(name));check(s!=null and s.can_instantiate(),"compiles "+name)
	for folder in DirAccess.get_directories_at(dir): load_scripts(dir.path_join(folder))
func run() -> void:
	load_scripts("res://scripts")
	var registry := root.get_node("VehicleFleetRegistry")
	check(registry.specs.size()==10,"all ten original vehicle specs")
	var missions := MasalikMissions.new();root.add_child(missions)
	check(missions.catalog.chapters.size()==5,"five original chapters")
	var count := 0
	for m in missions.catalog.missions:
		if m.category=="story": count+=1
		check(float(m.startDistanceM)>=0 and float(m.finishDistanceM)<=15000,"mission within world: "+str(m.id))
	check(count==25,"25 original story missions; 65 total missions retained")
	var world := MasalikWorld.new();root.add_child(world)
	check(world.points.size()==3751,"15 km road sampled every four horizontal meters")
	check(world.curve.get_baked_length()>=15000,"measured drivable centerline >= 15 km")
	for s in [40.0,2600.0,5400.0,8000.0,10500.0,13000.0,14900.0]:
		world.update_chunks(s)
		await get_tree().process_frame
		check(world.chunks.has(clampi(int(s/500),0,29)),"loads sector at "+str(s))
		check(world.chunks.size()<=7,"bounded loaded sector count")
	# Integration regression: ray contacts must work on actual generated road triangles,
	# not only on a separate box. Wrong winding makes the player fall through.
	for s in [40.0,2600.0,5400.0,8000.0,10500.0,13000.0,14900.0]:
		world.update_chunks(s)
		var road_car := RaycastVehicleBody.new();road_car.spec=registry.get_spec("shahiq")
		road_car.position=world.point_at(s)+Vector3.UP*1.2;road_car.basis=world.basis_at(s);root.add_child(road_car)
		road_car.set_drive_inputs(0,1,0,false)
		for frame in range(120): await get_tree().physics_frame
		check(road_car.grounded>=3,"native road supports wheels at "+str(s))
		check(road_car.position.y>world.point_at(s).y-2,"no fall through generated terrain at "+str(s))
		for side in [-1.0,1.0]:
			var test_point: Vector3=world.point_at(s)+world.basis_at(s).x*side*world.ROAD_HALF_WIDTH*0.8
			var ray := PhysicsRayQueryParameters3D.create(test_point+Vector3.UP*10,test_point-Vector3.UP*10)
			ray.exclude=[road_car.get_rid()]
			var hit := world.get_world_3d().direct_space_state.intersect_ray(ray)
			if not hit.is_empty(): print("EDGE ",s," side=",side," surface=",hit.collider.get_meta("surface_type","")," delta_y=",hit.position.y-test_point.y)
			check(not hit.is_empty() and hit.collider.get_meta("surface_type","")==world.surface_at(s),"road edges remain uncovered at "+str(s)+" side "+str(side))
		road_car.queue_free();await get_tree().process_frame
	check(world.service_distances.size()==6,"six local service plazas")
	for stop in world.service_distances:
		check(world.nearest_service(world.service_position(stop))<0.1,"service proximity is computed from actual plaza position")
	var store := root.get_node("PersistenceManager")
	var before: Dictionary=store.save_data.duplicate(true)
	store.save_data.coins=321;check(store.save_data_atomic(),"atomic initial save")
	store.save_data.coins=654;check(store.save_data_atomic(),"atomic next save with valid backup")
	var f := FileAccess.open(store.PRIMARY,FileAccess.WRITE);f.store_string("{broken");f.close()
	store.load_data();check(store.recovered and int(store.save_data.coins)==321,"corrupt primary recovers valid backup")
	check(store.save_data_atomic(),"recovery saves without corrupting backup")
	check(not store.read_valid(store.BACKUP).is_empty(),"known-good backup preserved")
	check(not store.import_save("res://data/vehicles/fleet.json"),"reject invalid imported save")
	check(int(store.migrate({"schema_version":2,"selected_vehicle_id":"shahiq_4x4"}).schema_version)==3,"schema 2 migration")
	store.save_data=before;store.save_data_atomic()
	# A real Jolt physics simulation, not position stepping.
	var ground := StaticBody3D.new();var shape := CollisionShape3D.new();var box := BoxShape3D.new();box.size=Vector3(500,1,500);shape.shape=box;shape.position.y=-0.5;ground.add_child(shape);root.add_child(ground)
	var car := RaycastVehicleBody.new();car.spec=registry.get_spec("shahiq");car.position=Vector3(0,1.3,0);root.add_child(car)
	for i in range(180): await get_tree().physics_frame
	check(car.grounded==4,"four wheel raycasts contact flat asphalt")
	check(car.position.y>0.3 and car.position.y<2,"suspension supports chassis without terrain penetration")
	var start := car.position
	car.set_drive_inputs(1,0,0,false)
	var acceleration_pitch := 0.0
	for i in range(180):
		await get_tree().physics_frame
		if i==45: acceleration_pitch=(-car.global_basis.z).y
	check(acceleration_pitch>0.005,"contact forces transfer weight rearward under acceleration")
	check(car.position.distance_to(start)>5 and car.current_speed_kmh>10,"engine forces accelerate rigidbody")
	check(car.rpm>float(car.spec.idleRpm),"RPM responds to wheel speed")
	var speed := car.current_speed_kmh
	car.set_drive_inputs(0,1,0,false)
	var braking_pitch := 0.0
	for i in range(180):
		await get_tree().physics_frame
		if i==30: braking_pitch=(-car.global_basis.z).y
	check(braking_pitch< -0.005,"braking transfers load forward with nose dive")
	check(car.current_speed_kmh<speed*0.5,"brake forces slow chassis")
	car.set_drive_inputs(-1,0,0,false)
	for i in range(120): await get_tree().physics_frame
	check(car.linear_velocity.dot(-car.global_basis.z)<-0.5,"reverse propulsion")
	car.teleport_to(Transform3D(Basis.IDENTITY,Vector3(20,1.3,-15)))
	await get_tree().physics_frame;await get_tree().physics_frame
	check(car.position.distance_to(Vector3(20,1.3,-15))<2,"physics-owned recovery transform persists")
	check(car.linear_velocity.length()<2,"recovery clears linear and angular motion")
	car.set_drivetrain_next();check(car.drivetrain in car.spec.supportedDrivetrains,"supported drivetrain selection")
	var completed_before: Dictionary=store.save_data.duplicate(true)
	var m: Dictionary=missions.catalog.missions[0]
	missions.start(m);missions.elapsed=10;missions.complete(car)
	var coins_after := int(store.save_data.coins)
	missions.start(m);missions.complete(car)
	check(int(store.save_data.coins)==coins_after,"replaying mission does not duplicate rewards")
	store.save_data=completed_before;store.save_data_atomic()
	var controls := DrivingControls.new();root.add_child(controls);controls.size=Vector2(1280,720)
	var wheel := InputEventScreenTouch.new();wheel.index=0;wheel.pressed=true;wheel.position=controls.rect_for("wheel").get_center()+Vector2(60,0);controls._input(wheel)
	var gas := InputEventScreenTouch.new();gas.index=1;gas.pressed=true;gas.position=controls.rect_for("gas").get_center();controls._input(gas)
	check(controls.pointers.size()==2,"independent steering and gas touch pointers")
	var drag := InputEventScreenDrag.new();drag.index=0;drag.position=wheel.position+Vector2(0,50);controls._input(drag);controls._process(0.016)
	check(controls.steer>0 and controls.throttle>0,"multi-touch steering and throttle together")
	controls.reset_input();check(controls.pointers.is_empty() and controls.throttle==0,"focus-loss input reset")
	for resolution in [Vector2(1280,720),Vector2(1560,720),Vector2(1920,720)]:
		controls.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT);controls.size=resolution
		for key in ["gas","brake","wheel","hand"]:
			check(controls.safe_rect().encloses(controls.rect_for(key)),"safe control bounds "+str(resolution)+" "+key)
	controls.size=Vector2(1280,720)
	var gas_down := InputEventScreenTouch.new();gas_down.index=4;gas_down.pressed=true;gas_down.position=controls.rect_for("gas").get_center();controls._input(gas_down);controls._process(0.5)
	var middle_pressure := controls.throttle
	var pedal_drag := InputEventScreenDrag.new();pedal_drag.index=4;pedal_drag.position=controls.rect_for("gas").position+Vector2(20,1);controls._input(pedal_drag);controls._process(0.5)
	check(controls.throttle>middle_pressure and controls.throttle<=1.0,"pedal pressure is gradual instead of binary")
	controls.reset_input()
	var wrap_touch := InputEventScreenTouch.new();wrap_touch.index=5;wrap_touch.pressed=true;wrap_touch.position=controls.rect_for("wheel").get_center()+Vector2(-60,0.1);controls._input(wrap_touch)
	var wrap_drag := InputEventScreenDrag.new();wrap_drag.index=5;wrap_drag.position=controls.rect_for("wheel").get_center()+Vector2(-60,-0.1);controls._input(wrap_drag)
	check(absf(controls.wheel_angle)<0.05,"wheel crosses angle boundary without jumping")
	controls.reset_input()
	for id in registry.specs:
		var visual := VehicleVisual.new();root.add_child(visual);visual.build(registry.get_spec(id));check(visual.wheels.size()==4,"renderable wheel rig "+str(id));check(visual.get_child_count()<35,"batched static vehicle geometry "+str(id));visual.queue_free()
	for resource in ["engine","engine_load","horn","music","impact","tires","gravel","rain","thunder","shift","suspension","wind"]: check(load("res://assets/audio/"+resource+".wav")!=null,"bundled audio "+resource)
	controls.queue_free();car.queue_free();ground.queue_free();missions.queue_free();world.queue_free()
	await get_tree().process_frame;await get_tree().process_frame
	print("RESULT checks=",checks," failures=",failures)
	get_tree().quit(1 if failures>0 else 0)
