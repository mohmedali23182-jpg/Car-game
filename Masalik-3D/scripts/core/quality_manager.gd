extends Node
signal changed(preset: int)
var current: int = 1
func apply(preset: int) -> void:
	current = clampi(preset, 0, 2)
	Engine.max_fps = 30 if current == 0 else 60
	get_viewport().scaling_3d_scale = [0.65, 0.85, 1.0][current]
	get_viewport().msaa_3d = Viewport.MSAA_DISABLED if current < 2 else Viewport.MSAA_2X
	changed.emit(current)
