extends Node
const PRIMARY := "user://masalik_save_v2.json"
const BACKUP := "user://masalik_save_v2.bak.json"
var save_data: Dictionary = defaults()
var recovered := false
func defaults() -> Dictionary:
	return {"schema_version": 3, "selected_vehicle_id": "shahiq", "coins": 0, "xp": 0, "completed": {}, "unlocked": ["shahiq"], "vehicle_customizations": {}, "quality": 1, "control_scheme": 0, "layouts": {}, "active_layout": "default", "steering_sensitivity": 1.0, "steering_return": 2.5, "wheel_angle": 180.0, "volumes": {}, "distance": 40.0, "fuel": 85.0, "health": 100.0}
func _ready() -> void:
	load_data()
func read_valid(path: String) -> Dictionary:
	if not FileAccess.file_exists(path): return {}
	var parser := JSON.new()
	if parser.parse(FileAccess.get_file_as_string(path)) != OK: return {}
	var v: Variant = parser.data
	if not v is Dictionary: return {}
	if int(v.get("schema_version", 0)) < 1 or int(v.get("schema_version", 0)) > 3: return {}
	# Reject malformed nested structures before applying external/imported data.
	for key in ["completed", "vehicle_customizations", "layouts", "volumes"]:
		if v.has(key) and not v[key] is Dictionary: return {}
	for key in ["coins", "xp", "distance", "fuel", "health", "quality", "control_scheme"]:
		if v.has(key) and typeof(v[key]) not in [TYPE_INT, TYPE_FLOAT]: return {}
	if v.has("unlocked") and not v.unlocked is Array: return {}
	for layout in v.get("layouts",{}).values():
		if not layout is Dictionary: return {}
		for item in layout.values():
			if not item is Array or item.size()!=5: return {}
			for i in range(4):
				if typeof(item[i]) not in [TYPE_INT,TYPE_FLOAT]: return {}
			if not item[4] is bool: return {}
	for custom in v.get("vehicle_customizations",{}).values():
		if not custom is Dictionary: return {}
		for key in ["height","cargo","power"]:
			if custom.has(key) and typeof(custom[key]) not in [TYPE_INT,TYPE_FLOAT]: return {}
	return v
func migrate(data: Dictionary) -> Dictionary:
	var out := defaults()
	out.merge(data, true)
	out.schema_version = 3
	if out.selected_vehicle_id == "shahiq_4x4": out.selected_vehicle_id = "shahiq"
	if data.has("last_world_state"):
		out.distance = data.last_world_state.get("s_meters", 40.0)
	out.coins = maxi(0, int(out.coins))
	out.distance = clampf(float(out.distance), 0.0, 15000.0)
	out.quality = clampi(int(out.quality), 0, 2)
	return out
func load_data() -> void:
	var d := read_valid(PRIMARY)
	if d.is_empty():
		d = read_valid(BACKUP)
		recovered = not d.is_empty()
	if d.is_empty(): d = read_valid("user://masalik_save_v1.json")
	if not d.is_empty(): save_data = migrate(d)
func save_data_atomic() -> bool:
	save_data.schema_version = 3
	var f := FileAccess.open(PRIMARY + ".tmp", FileAccess.WRITE)
	if f == null: return false
	f.store_string(JSON.stringify(save_data))
	f.flush()
	f.close()
	if read_valid(PRIMARY + ".tmp").is_empty(): return false
	# Never replace a known-good backup with a corrupt primary.
	if not read_valid(PRIMARY).is_empty():
		if DirAccess.copy_absolute(PRIMARY, BACKUP) != OK: return false
	return DirAccess.rename_absolute(PRIMARY + ".tmp", PRIMARY) == OK
func export_save(path: String) -> bool:
	if not save_data_atomic(): return false
	return DirAccess.copy_absolute(PRIMARY, path) == OK
func import_save(path: String) -> bool:
	var d := read_valid(path)
	if d.is_empty(): return false
	save_data = migrate(d)
	return save_data_atomic()
