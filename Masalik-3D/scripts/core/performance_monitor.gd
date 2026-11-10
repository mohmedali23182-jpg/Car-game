extends Node
## PerformanceMonitor Autoload — مراقبة FPS وزمن الإطار واستهلاك الذاكرة

func get_metrics() -> Dictionary:
	return {
		"fps": Engine.get_frames_per_second(),
		"frame_time_ms": Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0,
		"physics_time_ms": Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0,
		"draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
		"static_mem_mb": Performance.get_monitor(Performance.MEMORY_STATIC) / (1024.0 * 1024.0)
	}
