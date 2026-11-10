extends Node
class_name PersistenceManager
## مَسَالِك — دروب اليمن | MASALIK — Roads of Yemen
## Atomic Save System V2 with Backup Recovery & Phase 1 Migration
## برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م

const SAVE_PATH_PRIMARY: String = "user://masalik_save_v2.json"
const SAVE_PATH_BACKUP: String = "user://masalik_save_v2.bak.json"
const LEGACY_SAVE_PATH_V1: String = "user://masalik_save_v1.json"
const SCHEMA_VERSION: int = 2

var save_data: Dictionary = {
	"schema_version": SCHEMA_VERSION,
	"selected_vehicle_id": "shahiq_4x4",
	"Driving_realism": "sport",
	"transmission_type": "auto",
	"quality_preset": "Medium",
	"control_scheme": "buttons",
	"steering_sensitivity": 1.0,
	"master_volume": 0.8,
	"unlocked_regions": [
		"taiz_highlands", "naqil_alsahab", "wadi_alrayhan",
		"tihama_plains", "coastal_highway", "masalik_desert"
	],
	"best_records": {},
	"vehicle_customizations": {},
	"last_world_state": {
		"s_meters": 60.0,
		"lateral_offset": 0.0,
		"fuel_liters": 85.0,
		"damage_state": {"engine": 100.0, "suspension": 100.0, "tires": 100.0, "body": 100.0, "cooling": 100.0}
	}
}


func _ready() -> void:
	load_data()


func save_data_atomic() -> bool:
	save_data["schema_version"] = SCHEMA_VERSION
	save_data["updated_at_unix"] = Time.get_unix_time_from_system()
	var json_str: String = JSON.stringify(save_data, "\t")

	# Write backup first if primary exists
	if FileAccess.file_exists(SAVE_PATH_PRIMARY):
		var existing_file := FileAccess.open(SAVE_PATH_PRIMARY, FileAccess.READ)
		if existing_file:
			var existing_content := existing_file.get_as_text()
			existing_file.close()
			var bak_file := FileAccess.open(SAVE_PATH_BACKUP, FileAccess.WRITE)
			if bak_file:
				bak_file.store_string(existing_content)
				bak_file.close()

	# Write primary save
	var file := FileAccess.open(SAVE_PATH_PRIMARY, FileAccess.WRITE)
	if file == null:
		push_error("[MASALIK Persistence] Failed to write primary save.")
		return false
	file.store_string(json_str)
	file.close()
	return true


func load_data() -> void:
	if _try_load_from_path(SAVE_PATH_PRIMARY):
		return
	push_warning("[MASALIK Persistence] Primary save missing or corrupted; attempting backup recovery...")
	if _try_load_from_path(SAVE_PATH_BACKUP):
		save_data_atomic()
		return
	# Attempt Phase 1 migration
	if FileAccess.file_exists(LEGACY_SAVE_PATH_V1):
		_migrate_from_v1()


func _try_load_from_path(path: String) -> bool:
	if not FileAccess.file_exists(path):
		return false
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return false
	var content: String = file.get_as_text()
	file.close()
	var parsed: Variant = JSON.parse_string(content)
	if typeof(parsed) == TYPE_DICTIONARY and parsed.get("schema_version", 0) == SCHEMA_VERSION:
		for key in parsed.keys():
			save_data[key] = parsed[key]
		return true
	return false


func _migrate_from_v1() -> void:
	var file := FileAccess.open(LEGACY_SAVE_PATH_V1, FileAccess.READ)
	if file == null:
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if typeof(parsed) == TYPE_DICTIONARY:
		if parsed.get("completed", false):
			save_data["best_records"]["m1_naqil_ascent"] = {
				"completed": true,
				"best_time_sec": float(parsed.get("best_time_sec", 0.0)),
				"best_score": int(parsed.get("best_score", 85)),
				"vehicle_id": "shahiq_4x4"
			}
		save_data_atomic()
