class_name MasalikWeather
extends Node3D
var current_weather_preset := "clear"
var hour := 8.0
var sun: DirectionalLight3D
var environment: Environment
var rain: CPUParticles3D
var follow: Node3D
func _ready() -> void:
	sun=DirectionalLight3D.new();sun.shadow_enabled=true;sun.directional_shadow_max_distance=150;add_child(sun)
	var world := WorldEnvironment.new();environment=Environment.new()
	environment.background_mode=Environment.BG_SKY
	var sky := Sky.new();var mat := ProceduralSkyMaterial.new()
	mat.sky_top_color=Color("356381");mat.sky_horizon_color=Color("c9b59b");mat.ground_horizon_color=Color("ad9877");mat.ground_bottom_color=Color("544b3e")
	sky.sky_material=mat;environment.sky=sky
	environment.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR;environment.ambient_light_color=Color("a2b4bb");environment.ambient_light_energy=0.65
	environment.tonemap_mode=Environment.TONE_MAPPER_FILMIC
	world.environment=environment;add_child(world)
	rain=CPUParticles3D.new();rain.amount=350;rain.lifetime=1.5;rain.emission_shape=CPUParticles3D.EMISSION_SHAPE_BOX
	rain.emission_box_extents=Vector3(20,5,20);rain.direction=Vector3(0,-1,0);rain.initial_velocity_min=15;rain.initial_velocity_max=22
	var mesh := BoxMesh.new();mesh.size=Vector3(0.015,0.65,0.015)
	var m := StandardMaterial3D.new();m.albedo_color=Color("99bacb");mesh.material=m;rain.mesh=mesh;rain.emitting=false;add_child(rain)
func get_weather_friction_multiplier(surface: String) -> float:
	if "rain" in current_weather_preset: return 0.6 if surface=="mud" else 0.8
	return 0.85 if current_weather_preset=="sandstorm" else 1.0
func _process(delta: float) -> void:
	hour=fmod(hour+delta/180.0,24)
	sun.rotation_degrees=Vector3(-sin((hour-6)/24*TAU)*80,-35,0)
	var daylight := clampf(sin((hour-6)/24*TAU),0.05,1)
	sun.light_energy=daylight*1.2
	sun.light_color=Color("ffd5a2") if hour<7 or hour>17 else Color("ffefd5")
	environment.ambient_light_energy=0.12+daylight*0.5
	var foggy: bool=current_weather_preset in ["fog","dense_fog","sandstorm","heavy_rain"]
	environment.fog_enabled=foggy
	environment.fog_density=0.012 if foggy else 0.001
	environment.fog_light_color=Color("ac9473") if current_weather_preset=="sandstorm" else Color("a2b6bd")
	rain.emitting="rain" in current_weather_preset
	if is_instance_valid(follow): rain.global_position=follow.global_position+Vector3.UP*10
