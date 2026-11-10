class_name MasalikAudio
extends Node
var engine: AudioStreamPlayer3D
var load_engine: AudioStreamPlayer3D
var wind: AudioStreamPlayer
var rain: AudioStreamPlayer
var thunder: AudioStreamPlayer
var tires: AudioStreamPlayer3D
var gravel: AudioStreamPlayer3D
var horn: AudioStreamPlayer3D
var impact: AudioStreamPlayer3D
var shift_sound: AudioStreamPlayer3D
var suspension_sound: AudioStreamPlayer3D
var music: AudioStreamPlayer
var car: RaycastVehicleBody
var weather: MasalikWeather
var previous_gear := 1
var previous_grounded := 0
var storm_clock := 0.0
func stream(name: String,loop := false) -> AudioStreamWAV:
	var s: AudioStreamWAV=load("res://assets/audio/"+name+".wav").duplicate()
	if loop: s.loop_mode=AudioStreamWAV.LOOP_FORWARD;s.loop_begin=0;s.loop_end=s.data.size()/2
	return s
func bus(name: String) -> void:
	if AudioServer.get_bus_index(name)>=0: return
	AudioServer.add_bus();var id := AudioServer.bus_count-1;AudioServer.set_bus_name(id,name);AudioServer.set_bus_send(id,"Master")
func local3d(name: String,channel: String,loop := false) -> AudioStreamPlayer3D:
	var p := AudioStreamPlayer3D.new();p.stream=stream(name,loop);p.bus=channel;p.max_distance=60;p.unit_size=4;car.add_child(p)
	if loop: p.play()
	return p
func local2d(name: String,channel: String,loop := false) -> AudioStreamPlayer:
	var p := AudioStreamPlayer.new();p.stream=stream(name,loop);p.bus=channel;add_child(p)
	if loop: p.play()
	return p
func _ready() -> void:
	for name in ["Engine","Effects","Environment","Music"]: bus(name)
	for name in PersistenceManager.save_data.volumes: set_volume(name,float(PersistenceManager.save_data.volumes[name]))
	engine=local3d("engine","Engine",true);load_engine=local3d("engine_load","Engine",true)
	tires=local3d("tires","Effects",true);gravel=local3d("gravel","Effects",true)
	horn=local3d("horn","Effects");impact=local3d("impact","Effects");shift_sound=local3d("shift","Effects");suspension_sound=local3d("suspension","Effects")
	car.collided.connect(func(loss: float):
		if loss>1: impact.play())
	wind=local2d("wind","Environment",true);rain=local2d("rain","Environment",true);thunder=local2d("thunder","Environment")
	music=local2d("music","Music",true);music.volume_db=-22
func set_volume(name: String,value: float) -> void:
	bus(name);AudioServer.set_bus_volume_db(AudioServer.get_bus_index(name),linear_to_db(maxf(0.0001,value)));PersistenceManager.save_data.volumes[name]=value
func _process(delta: float) -> void:
	var load_amount := absf(car.throttle_input)
	var pitch := clampf(car.rpm/1450*float(car.spec.engineBaseFreqHz)/48.0,0.55,4.2)
	engine.pitch_scale=pitch;load_engine.pitch_scale=pitch
	engine.volume_db=-15+load_amount*4 if car.fuel>0 and car.health>0 else -80
	load_engine.volume_db=-48+load_amount*29 if car.fuel>0 and car.health>0 else -80
	var rolling := minf(car.current_speed_kmh,85)*0.23
	tires.volume_db=-80 if car.current_speed_kmh<1 else -42+rolling
	gravel.volume_db=-80 if car.current_surface=="asphalt" or car.current_speed_kmh<2 else -35+rolling
	wind.volume_db=-38+minf(car.current_speed_kmh,100)*0.12
	rain.volume_db=-18 if weather!=null and "rain" in weather.current_weather_preset else -80
	if car.gear!=previous_gear: shift_sound.play();previous_gear=car.gear
	if previous_grounded<2 and car.grounded>=3 and car.current_speed_kmh>8: suspension_sound.play()
	previous_grounded=car.grounded;storm_clock+=delta
	if weather!=null and weather.current_weather_preset=="heavy_rain" and storm_clock>34:
		thunder.play();storm_clock=0
func _exit_tree() -> void:
	for player in [engine,load_engine,tires,gravel,horn,impact,shift_sound,suspension_sound,wind,rain,thunder,music]:
		if is_instance_valid(player): player.stop();player.stream=null
