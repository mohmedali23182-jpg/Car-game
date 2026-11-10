class_name MasalikAudio
extends Node
var engine: AudioStreamPlayer3D
var wind: AudioStreamPlayer
var tires: AudioStreamPlayer3D
var horn: AudioStreamPlayer3D
var impact: AudioStreamPlayer3D
var music: AudioStreamPlayer
var car: RaycastVehicleBody
func stream(name: String, loop := false) -> AudioStreamWAV:
	var s: AudioStreamWAV=load("res://assets/audio/"+name+".wav").duplicate()
	if loop:
		s.loop_mode=AudioStreamWAV.LOOP_FORWARD;s.loop_begin=0;s.loop_end=s.data.size()/2
	return s
func bus(name: String) -> void:
	if AudioServer.get_bus_index(name)>=0: return
	AudioServer.add_bus();var id := AudioServer.bus_count-1;AudioServer.set_bus_name(id,name)
	AudioServer.set_bus_send(id,"Master")
func _ready() -> void:
	for name in ["Engine","Effects","Environment","Music"]: bus(name)
	for name in PersistenceManager.save_data.volumes: set_volume(name,float(PersistenceManager.save_data.volumes[name]))
	engine=AudioStreamPlayer3D.new();engine.stream=stream("engine",true);engine.bus="Engine";car.add_child(engine);engine.play()
	tires=AudioStreamPlayer3D.new();tires.stream=stream("tires",true);tires.bus="Effects";car.add_child(tires);tires.play()
	horn=AudioStreamPlayer3D.new();horn.stream=stream("horn");horn.bus="Effects";car.add_child(horn)
	impact=AudioStreamPlayer3D.new();impact.stream=stream("impact");impact.bus="Effects";car.add_child(impact)
	car.collided.connect(func(loss: float):
		if loss>1: impact.play())
	wind=AudioStreamPlayer.new();wind.stream=stream("wind",true);wind.bus="Environment";add_child(wind);wind.volume_db=-15;wind.play()
	music=AudioStreamPlayer.new();music.stream=stream("music",true);music.bus="Music";add_child(music);music.volume_db=-13;music.play()
func set_volume(name: String, value: float) -> void:
	bus(name)
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index(name),linear_to_db(maxf(0.0001,value)))
	PersistenceManager.save_data.volumes[name]=value
func _process(_delta: float) -> void:
	engine.pitch_scale=clampf(car.rpm/1500,0.6,3.5)
	engine.volume_db=-10+absf(car.throttle_input)*7
	tires.volume_db=-45+minf(car.current_speed_kmh,80)*0.35
	if car.current_surface!="asphalt": tires.volume_db+=5
