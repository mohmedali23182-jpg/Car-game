extends Node
var elapsed := 0.0
func _process(delta: float) -> void:
	elapsed += delta
	if elapsed < 5.0:
		return
	elapsed = 0.0
	var path := "user://performance.jsonl"
	if FileAccess.file_exists(path) and FileAccess.get_file_as_bytes(path).size() > 1048576:
		DirAccess.rename_absolute(path, "user://performance.previous.jsonl")
	var f := FileAccess.open(path, FileAccess.READ_WRITE if FileAccess.file_exists(path) else FileAccess.WRITE)
	if f:
		f.seek_end()
		f.store_line(JSON.stringify({"unix": Time.get_unix_time_from_system(), "fps": Engine.get_frames_per_second(), "memory_bytes": Performance.get_monitor(Performance.MEMORY_STATIC), "draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)}))
