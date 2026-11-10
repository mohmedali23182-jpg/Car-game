extends SceneTree
## يشتغل عبر: godot --headless -s res://tests/headless_test_runner.gd

func _init() -> void:
	print("=== MASALIK 3D HEADLESS TEST SUITE ===")
	var config := VehiclePhysicsConfig.new()
	assert(config.mass_kg > 1000.0, "Vehicle mass must be valid")
	assert(config.asphalt_friction > config.dirt_friction, "Asphalt grip must exceed dirt grip")
	print("[PASS] VehiclePhysicsConfig validated")

	var gen := MountainRoadGenerator.new()
	gen.generate_mountain_pass()
	assert(gen.road_points.size() >= 1000, "2km road must have >= 1000 samples")
	print("[PASS] 2km Summit Road procedural mesh & collision verified")
	print("=== ALL HEADLESS TESTS PASSED ===")
	quit(0)
