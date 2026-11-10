extends Node
func _ready() -> void: call_deferred("run")
func capture(name: String) -> void:
	await RenderingServer.frame_post_draw
	var err := get_viewport().get_texture().get_image().save_png("user://masalik-"+name+".png")
	if err!=OK: push_error("Capture failed: "+name);get_tree().quit(1)
func run() -> void:
	var menu: Control=load("res://scenes/menus/MainMenu.tscn").instantiate();add_child(menu)
	await get_tree().create_timer(1.0).timeout;await capture("menu")
	menu.garage();await get_tree().create_timer(1.0).timeout;await capture("garage")
	menu.queue_free();await get_tree().process_frame
	var game: MasalikSession=load("res://scenes/main/main_game.tscn").instantiate();add_child(game)
	await get_tree().create_timer(4.0).timeout;await capture("runtime")
	var photo_path := "user://MASALIK-%d.png" % int(Time.get_unix_time_from_system())
	get_viewport().get_texture().get_image().save_png(photo_path)
	game.open_album();PhotoAlbum.view(game.overlay.get_child(0).get_child(0),photo_path,game.resume)
	await get_tree().create_timer(0.5).timeout;await capture("album");game.resume()
	game.camera.current_view=2
	await get_tree().create_timer(0.6).timeout;await capture("interior")
	game.car.freeze=true;game.car.position=game.world.point_at(160)+Vector3.UP*1.2;game.car.basis=game.world.basis_at(160);game.world.last_index=40;game.world.update_chunks(160)
	game.camera.current_view=5;game.camera.orbit=Vector2(-0.7,0.35);game.camera.orbit_distance=15
	await get_tree().create_timer(1.0).timeout;await capture("service-plaza")
	print("VISUAL_CAPTURE_PASS");get_tree().quit()
