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
	game.camera.current_view=2
	await get_tree().create_timer(0.6).timeout;await capture("interior")
	print("VISUAL_CAPTURE_PASS");get_tree().quit()
