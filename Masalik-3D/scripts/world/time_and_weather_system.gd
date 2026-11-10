class_name MasalikWeather
extends Node3D
var current_weather_preset := "clear"
var hour := 8.0
var sun: DirectionalLight3D
var environment: Environment
var sky_material: ProceduralSkyMaterial
var rain: CPUParticles3D
var follow: Node3D
func _ready() -> void:
	sun=DirectionalLight3D.new();sun.shadow_enabled=true;sun.directional_shadow_max_distance=150;add_child(sun)
	var world := WorldEnvironment.new();environment=Environment.new()
	environment.background_mode=Environment.BG_SKY
	var sky := Sky.new();var mat := ProceduralSkyMaterial.new()
	mat.sky_top_color=Color("356381");mat.sky_horizon_color=Color("c9b59b");mat.ground_horizon_color=Color("ad9877");mat.ground_bottom_color=Color("544b3e")
	sky_material=mat;sky.sky_material=mat;environment.sky=sky
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
	var elevation := sin((hour-6)/24*TAU)
	var daylight := smoothstep(-0.12,0.35,elevation)
	var twilight := (1.0-smoothstep(0.0,0.4,absf(elevation)))*daylight
	var overcast := current_weather_preset in ["cloudy","fog","dense_fog","rain","heavy_rain"]
	var sandstorm := current_weather_preset=="sandstorm"
	var attenuation := 0.45 if overcast or sandstorm else 1.0
	sun.light_energy=maxf(0,elevation)*1.2*attenuation
	sun.light_color=Color("ffefd5").lerp(Color("ffad68"),twilight)
	environment.ambient_light_energy=0.12+daylight*0.5*attenuation
	var top := Color("356381")
	var horizon := Color("c9b59b").lerp(Color("d99164"),twilight)
	if overcast:
		top=top.lerp(Color("717d86"),0.75);horizon=horizon.lerp(Color("a0abb0"),0.8)
	if sandstorm: top=Color("857354");horizon=Color("ac9473")
	sky_material.sky_top_color=Color("050b1c").lerp(top,daylight)
	sky_material.sky_horizon_color=Color("162038").lerp(horizon,daylight)
	sky_material.ground_horizon_color=sky_material.sky_horizon_color
	sky_material.ground_bottom_color=Color("080b12").lerp(Color("544b3e"),daylight)
	# Subtle clear-weather aerial perspective also softens the local streaming horizon.
	environment.fog_enabled=true
	environment.fog_density=0.0007
	match current_weather_preset:
		"fog": environment.fog_density=0.006
		"dense_fog": environment.fog_density=0.018
		"sandstorm": environment.fog_density=0.012
		"heavy_rain": environment.fog_density=0.005
	environment.fog_light_color=sky_material.sky_horizon_color
	rain.emitting="rain" in current_weather_preset
	if is_instance_valid(follow): rain.global_position=follow.global_position+Vector3.UP*10
