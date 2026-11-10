extends Node
var specs: Dictionary = {}
func _ready() -> void:
	specs = JSON.parse_string(FileAccess.get_file_as_string("res://data/vehicles/fleet.json"))
func get_spec(id: String) -> Dictionary:
	return specs.get(id, specs["shahiq"])
