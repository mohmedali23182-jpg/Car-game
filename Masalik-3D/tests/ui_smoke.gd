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
	game.pause_menu();await get_tree().process_frame;game.resume();await get_tree().process_frame
	game.pause_menu();await get_tree().process_frame;game.control_studio();await get_tree().process_frame;game.resume();await get_tree().process_frame
	game.map_screen();await get_tree().process_frame;game.resume();await get_tree().process_frame
	var previous_view: int=game.camera.current_view
	game.photo_mode();await get_tree().process_frame;game.resume();await get_tree().process_frame
	if game.camera.current_view!=previous_view: push_error("Photo mode failed to restore driving camera");get_tree().quit(1);return
	print("UI PASS photo mode restores previous camera")
	var original_save: Dictionary=PersistenceManager.save_data.duplicate(true)
	PersistenceManager.save_data.coins=30
	game.car.freeze=true;game.car.position=game.world.service_position(180.0)+Vector3.UP;game.car.current_speed_kmh=0;game.car.health=70;game.car.fuel=10
	game.service_station()
	if int(PersistenceManager.save_data.coins)!=5 or game.car.health!=100 or game.car.fuel!=float(game.car.spec.fuelTankLiters):
		push_error("Station transaction failed");get_tree().quit(1);return
	game.service_station()
	if int(PersistenceManager.save_data.coins)!=5: push_error("Station allowed negative balance");get_tree().quit(1);return
	print("UI PASS real station transaction and insufficient funds guard")
	PersistenceManager.save_data=original_save;PersistenceManager.save_data_atomic()
	get_tree().paused=false;game.queue_free();await get_tree().process_frame;await get_tree().process_frame
	print("UI SMOKE FINISHED");get_tree().quit()
