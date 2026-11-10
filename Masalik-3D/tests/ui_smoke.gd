extends Node
var errors := 0
func _ready() -> void: call_deferred("run")
func run() -> void:
	var menu: Control=load("res://scenes/menus/MainMenu.tscn").instantiate();add_child(menu)
	await get_tree().process_frame
	for method in ["regions_menu","garage","settings","credits","album","home"]:
		menu.call(method);await get_tree().process_frame;print("UI PASS ",method)
	for category in ["story","challenge","race","cargo","passenger","rescue"]:
		menu.missions_menu(category);await get_tree().process_frame
	menu.briefing(menu.catalog.missions[0]);await get_tree().process_frame
	menu.queue_free();await get_tree().process_frame
	var game: MasalikSession=load("res://scenes/main/main_game.tscn").instantiate();add_child(game)
	await get_tree().process_frame
	for frame in range(120): await get_tree().physics_frame
	if not game.starting_parked or game.car.current_speed_kmh>2:
		push_error("Automatic startup parking failed");get_tree().quit(1);return
	print("UI PASS startup parking and horizon camera")
	for i in range(game.traffic.active_count):
		var s: float=game.traffic.distances[i]
		var offset: Vector3=game.traffic.pool[i].position-game.world.point_at(s)
		var direction := 1.0 if i%2==0 else -1.0
		if offset.dot(game.world.basis_at(s).x)*direction<0.5: push_error("Traffic lane-side regression");get_tree().quit(1);return
	print("UI PASS right-hand traffic lane placement")
	game.traffic.active_count=1
	var player_s := game.world.distance
	game.traffic.distances[0]=player_s-18
	game.traffic.pool[0].position=game.world.point_at(player_s-18)+game.world.basis_at(player_s-18).x*game.world.ROAD_HALF_WIDTH*0.5+Vector3.UP*0.9
	game.traffic.speeds[0]=9
	for frame in range(240): await get_tree().physics_frame
	if player_s-game.traffic.distances[0]<5 or game.traffic.speeds[0]>2:
		push_error("Traffic stopping-distance regression");get_tree().quit(1);return
	print("UI PASS traffic safely stops behind parked player")
	game.pause_menu();await get_tree().process_frame;game.resume();await get_tree().process_frame
	game.pause_menu();await get_tree().process_frame;game.control_studio();await get_tree().process_frame;game.resume();await get_tree().process_frame
	game.map_screen();await get_tree().process_frame;game.resume();await get_tree().process_frame
	var previous_view: int=game.camera.current_view
	game.photo_mode();await get_tree().process_frame;game.resume();await get_tree().process_frame
	if game.camera.current_view!=previous_view: push_error("Photo mode failed to restore driving camera");get_tree().quit(1);return
	print("UI PASS photo mode restores previous camera")
	var original_save: Dictionary=PersistenceManager.save_data.duplicate(true)
	PersistenceManager.save_data.coins=30
	game.car.teleport_to(Transform3D(game.world.basis_at(180),game.world.service_position(180.0)+Vector3.UP*1.2))
	await get_tree().physics_frame;await get_tree().physics_frame
	game.car.freeze=true;game.car.current_speed_kmh=0;game.car.health=70;game.car.fuel=10
	game.service_station()
	if int(PersistenceManager.save_data.coins)!=5 or game.car.health!=100 or game.car.fuel!=float(game.car.spec.fuelTankLiters):
		push_error("Station transaction failed");get_tree().quit(1);return
	game.service_station()
	if int(PersistenceManager.save_data.coins)!=5: push_error("Station allowed negative balance");get_tree().quit(1);return
	print("UI PASS real station transaction and insufficient funds guard")
	PersistenceManager.save_data=original_save;PersistenceManager.save_data_atomic()
	get_tree().paused=false;game.queue_free();await get_tree().process_frame;await get_tree().process_frame
	print("UI SMOKE FINISHED");get_tree().quit()
