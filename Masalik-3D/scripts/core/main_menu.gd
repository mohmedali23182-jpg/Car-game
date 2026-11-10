extends Control
func _ready() -> void:
	var button := Button.new()
	button.text = "مَسَالِك — دروب اليمن | ابدأ القيادة"
	button.position = Vector2(400, 300)
	button.size = Vector2(700, 100)
	add_child(button)
	button.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/main/main_game.tscn"))
