class_name MasalikSession
extends Node3D
var world: MasalikWorld
var car: RaycastVehicleBody
var camera: MasalikCameraController
var controls: DrivingControls
var missions: MasalikMissions
var weather: MasalikWeather
var traffic: MasalikTraffic
var audio: MasalikAudio
var hud: Control
var status: Label
var navigation: Label
var overlay: PanelContainer
var top: HBoxContainer
var save_clock := 0.0
var tow: RigidBody3D
var tow_attached := false
var capture_clock := 0.0
var instruments: DrivingInstruments
var starting_parked := true
var photo_previous_view := 0
var mini_map: MasalikMap
func _ready() -> void:
	world=MasalikWorld.new();add_child(world)
	missions=MasalikMissions.new();add_child(missions)
	var mission: Dictionary=get_tree().get_meta("mission",{})
	var selected: String=str(PersistenceManager.save_data.selected_vehicle_id)
	var distance := float(PersistenceManager.save_data.distance)
	var custom: Dictionary=PersistenceManager.save_data.vehicle_customizations.get(selected,{}).duplicate(true)
	if not mission.is_empty():
		selected=mission.recommendedVehicleId;distance=float(mission.startDistanceM)
		custom=PersistenceManager.save_data.vehicle_customizations.get(selected,{}).duplicate(true)
		custom.cargo=float(mission.get("cargoRequiredPct",0))
	car=RaycastVehicleBody.new();car.spec=VehicleFleetRegistry.get_spec(selected);car.custom=custom;car.position=world.point_at(distance)+Vector3.UP*1.2;car.basis=world.basis_at(distance)
	if not mission.is_empty() and float(mission.finishDistanceM)<distance: car.basis=car.basis.rotated(Vector3.UP,PI)
	add_child(car);world.player=car;world.distance=distance;world.last_index=int(distance/4);world.update_chunks(distance)
	if mission.is_empty():
		car.fuel=clampf(float(PersistenceManager.save_data.fuel),0,float(car.spec.fuelTankLiters));car.health=float(PersistenceManager.save_data.health)
	weather=MasalikWeather.new();add_child(weather);weather.follow=car
	if not mission.is_empty():
		weather.current_weather_preset=str(mission.weatherPreset)
		weather.hour={"sunrise":6.0,"morning":8.0,"noon":12.0,"afternoon":15.0,"sunset":18.0,"night":22.0}.get(mission.timeOfDayPreset,8.0)
	camera=MasalikCameraController.new();camera.target_vehicle=car;camera.position=car.position+car.basis.z*7+Vector3.UP*3;add_child(camera);camera.current=true
	traffic=MasalikTraffic.new();traffic.world=world;traffic.player=car;add_child(traffic)
	audio=MasalikAudio.new();audio.car=car;add_child(audio)
	if not mission.is_empty() and mission.category=="rescue": create_tow(distance+signf(float(mission.finishDistanceM)-distance)*80)
	build_hud()
	missions.finished.connect(results)
	if not mission.is_empty():
		missions.start(mission);marker(float(mission.finishDistanceM))
	QualityManager.changed.connect(apply_quality);apply_quality(QualityManager.current)
func apply_quality(preset: int) -> void:
	world.radius=[1,2,3][preset];traffic.active_count=[2,5,8][preset]
	weather.sun.shadow_enabled=preset>0
	camera.far=[450.0,850.0,1400.0][preset]
func marker(distance: float) -> void:
	var node := MeshInstance3D.new();var ring := TorusMesh.new();ring.inner_radius=4.8;ring.outer_radius=5.2
	var mat := StandardMaterial3D.new();mat.albedo_color=MasalikUI.GOLD;mat.emission_enabled=true;mat.emission=MasalikUI.GOLD
	node.mesh=ring;node.material_override=mat;node.position=world.point_at(distance)+Vector3.UP*0.35;add_child(node)
	var label := Label3D.new();label.text="الوجهة";label.font=load("res://assets/fonts/NotoSansArabic-Regular.ttf");label.font_size=80;label.pixel_size=0.02;label.billboard=BaseMaterial3D.BILLBOARD_ENABLED;label.position=node.position+Vector3.UP*7;add_child(label)
func create_tow(distance: float) -> void:
	tow=RigidBody3D.new();tow.mass=950; tow.position=world.point_at(distance)+Vector3.UP*1.3;tow.basis=world.basis_at(distance)
	var shape := CollisionShape3D.new();var box := BoxShape3D.new();box.size=Vector3(1.8,0.8,3.8);shape.shape=box;tow.add_child(shape)
	var visual := VehicleVisual.new();tow.add_child(visual);visual.build(VehicleFleetRegistry.get_spec("madina"));add_child(tow)
func toggle_tow() -> void:
	if tow==null: return
	if tow_attached: tow_attached=false;navigation.text="فُصل حبل السحب";return
	if car.position.distance_to(tow.position)<10 and car.current_speed_kmh<12:
		tow_attached=true;navigation.text="تم ربط حبل السحب — انطلق بهدوء"
	else: navigation.text="اقترب من المركبة العالقة وتوقف لربطها"
func build_hud() -> void:
	var canvas := CanvasLayer.new();add_child(canvas)
	hud=Control.new();hud.layout_direction=Control.LAYOUT_DIRECTION_LTR;hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);hud.mouse_filter=Control.MOUSE_FILTER_IGNORE;hud.theme=MasalikUI.theme();hud.process_mode=Node.PROCESS_MODE_ALWAYS;canvas.add_child(hud)
	controls=DrivingControls.new();hud.add_child(controls)
	top=HBoxContainer.new();top.position=Vector2(32,24);hud.add_child(top)
	MasalikUI.button(top,"Ⅱ",pause_menu).tooltip_text="توقف مؤقت"
	MasalikUI.button(top,"كاميرا",func(): camera.cycle_camera_view())
	MasalikUI.button(top,"بوق",func(): audio.horn.play())
	MasalikUI.button(top,"الأدوات",utility_menu)
	mini_map=MasalikMap.new();mini_map.world=world;mini_map.car=car;mini_map.size=Vector2(190,125);hud.add_child(mini_map)
	status=Label.new();status.add_theme_font_size_override("font_size",14);status.text_direction=Control.TEXT_DIRECTION_RTL;hud.add_child(status)
	navigation=Label.new();navigation.size=Vector2(650,75);navigation.add_theme_font_size_override("font_size",18);navigation.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;navigation.text_direction=Control.TEXT_DIRECTION_RTL;hud.add_child(navigation)
	instruments=DrivingInstruments.new();instruments.car=car;hud.add_child(instruments)
	var gears := HBoxContainer.new();gears.name="GearControls";hud.add_child(gears)
	MasalikUI.button(gears,"D / R",func():
		if car.current_speed_kmh<5: controls.reverse=not controls.reverse
		else: navigation.text="توقف أولًا قبل تبديل اتجاه الحركة")
	MasalikUI.button(gears,"−",func(): car.automatic=false;car.shift(-1))
	MasalikUI.button(gears,"+",func(): car.automatic=false;car.shift(1))
	if tow!=null: MasalikUI.button(top,"حبل سحب",toggle_tow)
func _physics_process(delta: float) -> void:
	if absf(controls.throttle)>0.04: starting_parked=false
	car.set_drive_inputs(controls.throttle,1.0 if starting_parked else controls.brake,controls.steer,controls.handbrake)
	car.wet_grip=weather.get_weather_friction_multiplier(car.current_surface)
	var lateral := car.position.distance_to(world.point_at(world.distance))
	if missions.running:
		if missions.active.category!="rescue" or tow_attached and tow.position.distance_to(world.point_at(float(missions.active.finishDistanceM)))<40:
			missions.update(delta,world.distance,car,lateral)
		else: missions.elapsed+=delta
		if missions.active.category in ["race","challenge"] and missions.elapsed>float(missions.active.targetTimeSec)*1.5:
			missions.running=false;results(false,"انتهى زمن التحدي — حاول مجددًا")
	if tow_attached and is_instance_valid(tow):
		var anchor := car.position+car.basis.z*3
		var vector := anchor-tow.position
		if vector.length()>4:
			var force := vector.normalized()*minf((vector.length()-4)*12000,25000)-tow.linear_velocity*600
			tow.apply_central_force(force);car.apply_central_force(-force)
	if car.position.y<world.point_at(world.distance).y-80: recover()
func _process(delta: float) -> void:
	save_clock+=delta;capture_clock+=delta
	if save_clock>15: save_clock=0;save_session()
	var safe := controls.safe_rect()
	top.position=safe.position+Vector2(4,2)
	mini_map.position=Vector2(safe.end.x-200,safe.position.y+4)
	status.position=Vector2(safe.end.x-255,safe.position.y+135);status.size=Vector2(245,36)
	status.text="وقود %.0f لتر  ·  سلامة %.0f٪" % [car.fuel,car.health]
	navigation.position=safe.position+Vector2(10,67)
	instruments.position=Vector2(safe.get_center().x-140,safe.end.y-142)
	hud.get_node("GearControls").position=Vector2(safe.end.x-236,safe.get_center().y-30)
	if missions.running:
		navigation.text=missions.active.titleAr+"\nالمتبقي %.0f م  |  %.0f ثانية  |  الحمولة %.0f%%" % [absf(float(missions.active.finishDistanceM)-world.distance),missions.elapsed,car.cargo_integrity]
	elif not camera.photo:
		navigation.text=str(world.regions[world.region_at(world.distance)].nameAr)+" | %.2f / 15 كم" % (world.distance/1000)
	if "--capture" in OS.get_cmdline_user_args() and capture_clock>4:
		get_viewport().get_texture().get_image().save_png("user://masalik-runtime.png");get_tree().quit()
func save_session() -> void:
	PersistenceManager.save_data.distance=world.distance
	PersistenceManager.save_data.fuel=car.fuel;PersistenceManager.save_data.health=car.health
	PersistenceManager.save_data_atomic()
func _notification(what: int) -> void:
	if what in [NOTIFICATION_APPLICATION_PAUSED,NOTIFICATION_APPLICATION_FOCUS_OUT] and is_instance_valid(car):
		controls.reset_input();car.set_drive_inputs(0,0,0,false);save_session()
		if not get_tree().paused: pause_menu()
	if what==NOTIFICATION_WM_GO_BACK_REQUEST and is_instance_valid(car): pause_menu()
func recover() -> void:
	car.freeze=true;car.position=world.point_at(world.distance)+Vector3.UP*1.2;car.basis=world.basis_at(world.distance);car.linear_velocity=Vector3.ZERO;car.angular_velocity=Vector3.ZERO;car.freeze=false;controls.reset_input();starting_parked=true
	if missions.running and missions.direction<0: car.basis=car.basis.rotated(Vector3.UP,PI)
func show_panel(title: String) -> VBoxContainer:
	controls.reset_input();controls.hide();top.hide();status.hide();navigation.hide();mini_map.hide();instruments.hide();hud.get_node("GearControls").hide()
	get_tree().paused=true
	var v := MasalikUI.panel(hud,title);overlay=v.get_parent().get_parent();return v
func resume() -> void:
	if is_instance_valid(overlay): overlay.queue_free()
	controls.editing=false;controls.reset_input();controls.show();top.show();status.show();navigation.show();mini_map.show();instruments.show();hud.get_node("GearControls").show();get_tree().paused=false
	if camera.photo:
		camera.current_view=photo_previous_view;camera.process_mode=Node.PROCESS_MODE_INHERIT
	camera.photo=false
func utility_menu() -> void:
	if is_instance_valid(overlay): return
	var v := show_panel("أدوات الرحلة")
	MasalikUI.button(v,"خريطة الطريق",func(): resume();map_screen())
	MasalikUI.button(v,"الأنوار الأمامية",func():
		for lamp in car.visual.headlights: lamp.visible=not lamp.visible
		resume())
	MasalikUI.button(v,"استعادة المركبة على الطريق",func(): recover();resume())
	MasalikUI.button(v,"التصوير",func(): resume();photo_mode())
	MasalikUI.button(v,"ناقل الحركة: "+("أوتوماتيكي" if car.automatic else "يدوي"),func(): car.automatic=not car.automatic;resume())
	MasalikUI.button(v,"متابعة",resume)
func pause_menu() -> void:
	if is_instance_valid(overlay): return
	var v := show_panel("استراحة على الطريق")
	MasalikUI.button(v,"متابعة",resume)
	MasalikUI.button(v,"حفظ الآن",func(): save_session();MasalikUI.label(v,"تم الحفظ محليًا"))
	MasalikUI.button(v,"استوديو التحكم",control_studio)
	MasalikUI.button(v,"نظام الدفع: "+car.drivetrain,func(): car.set_drivetrain_next();resume())
	MasalikUI.button(v,"قفل الدفرنس: "+str(car.diff_lock),func(): car.diff_lock=not car.diff_lock;resume())
	MasalikUI.button(v,"مساعدات ABS / TCS / ESC: "+str(car.assists),func(): car.assists=not car.assists;resume())
	MasalikUI.button(v,"مساعد نزول المنحدرات HDC: "+str(car.hdc),func(): car.hdc=not car.hdc;resume())
	MasalikUI.button(v,"صيانة وتعبئة الوقود — 100 عملة",func():
		if int(PersistenceManager.save_data.coins)>=100:
			PersistenceManager.save_data.coins-=100;car.repair();save_session();resume()
		else: MasalikUI.label(v,"العملات غير كافية. أكمل مهمة لكسب مكافآت."))
	var times := HBoxContainer.new();v.add_child(times)
	for h in [6,12,18,22]: MasalikUI.button(times,str(h)+":00",func(): weather.hour=float(h);resume())
	var weather_row := HFlowContainer.new();v.add_child(weather_row)
	for key in ["clear","cloudy","light_rain","heavy_rain","fog","sandstorm"]:
		MasalikUI.button(weather_row,{"clear":"صحو","cloudy":"غائم","light_rain":"مطر خفيف","heavy_rain":"مطر غزير","fog":"ضباب","sandstorm":"عاصفة رملية"}[key],func(): weather.current_weather_preset=key;resume())
	MasalikUI.button(v,"العودة للقائمة",func(): save_session();get_tree().paused=false;get_tree().change_scene_to_file("res://scenes/menus/MainMenu.tscn"))
func control_studio() -> void:
	overlay.queue_free();overlay=null
	controls.show();controls.editing=true
	var panel := PanelContainer.new();panel.position=Vector2(320,12);panel.size=Vector2(600,230);hud.add_child(panel);overlay=panel
	var v := VBoxContainer.new();panel.add_child(v)
	MasalikUI.label(v,"اسحب الأداة؛ اختر حجمها وشفافيتها")
	var size_slider := MasalikUI.slider(v,"الحجم",float(controls.layout[controls.selected][2]),55,250,func(value: float): controls.layout[controls.selected][2]=value;controls.queue_redraw())
	var opacity := MasalikUI.slider(v,"الشفافية",float(controls.layout[controls.selected][3]),0.15,1,func(value: float): controls.layout[controls.selected][3]=value;controls.queue_redraw())
	controls.changed.connect(func():
		if is_instance_valid(size_slider): size_slider.set_value_no_signal(float(controls.layout[controls.selected][2]));opacity.set_value_no_signal(float(controls.layout[controls.selected][3])))
	var row := HFlowContainer.new();v.add_child(row)
	MasalikUI.button(row,"إظهار/إخفاء",func(): controls.layout[controls.selected][4]=not bool(controls.layout[controls.selected][4]);controls.queue_redraw())
	MasalikUI.button(row,"أعسر/أيمن",func():
		for key in controls.layout: controls.layout[key][0]=1.0-float(controls.layout[key][0])
		controls.queue_redraw())
	MasalikUI.button(row,"افتراضي",func(): controls.layout=DrivingControls.DEFAULTS.duplicate(true);controls.queue_redraw())
	for name in ["default","layout_2","layout_3"]:
		MasalikUI.button(row,"تحميل "+name,func():
			PersistenceManager.save_data.active_layout=name;controls.layout=DrivingControls.DEFAULTS.duplicate(true);controls.layout.merge(PersistenceManager.save_data.layouts.get(name,{}),true);controls.queue_redraw())
	MasalikUI.button(row,"حفظ ومتابعة",func():
		PersistenceManager.save_data.layouts[PersistenceManager.save_data.active_layout]=controls.layout.duplicate(true);PersistenceManager.save_data_atomic();resume())
func map_screen() -> void:
	var v := show_panel("خريطة العالم — موقعك %.2f كم" % (world.distance/1000))
	var map := MasalikMap.new();map.world=world;map.car=car;map.compact=false;map.custom_minimum_size=Vector2(800,270);v.add_child(map)
	for i in range(world.regions.size()):
		var r: Dictionary=world.regions[i]
		MasalikUI.label(v,("◉ " if world.region_at(world.distance)==i else "○ ")+r.nameAr+" | %.1f – %.1f كم" % [float(r.startM)/1000,float(r.endM)/1000])
	MasalikUI.label(v,"الطريق متصل بين المناطق الست. الوجهة الذهبية تحدد نهاية المهمة.")
	MasalikUI.button(v,"متابعة القيادة",resume)
func photo_mode() -> void:
	var v := show_panel("التصوير — اسحب الشاشة لتدوير الكاميرا")
	photo_previous_view=camera.current_view;camera.photo=true;camera.current_view=5;camera.process_mode=Node.PROCESS_MODE_ALWAYS
	MasalikUI.slider(v,"التقريب",camera.orbit_distance,2,40,func(value: float): camera.orbit_distance=value)
	MasalikUI.button(v,"التقاط صورة محلية",func():
		overlay.hide();await RenderingServer.frame_post_draw
		var path := "user://MASALIK-%d.png" % int(Time.get_unix_time_from_system())
		var err := get_viewport().get_texture().get_image().save_png(path);overlay.show();MasalikUI.label(v,"حُفظت الصورة: "+ProjectSettings.globalize_path(path) if err==OK else "تعذر حفظ الصورة"))
	MasalikUI.button(v,"متابعة",resume)
func results(success: bool, message: String) -> void:
	if is_instance_valid(overlay): return
	save_session()
	var v := show_panel("نجاح المهمة" if success else "نهاية المحاولة")
	MasalikUI.label(v,message,28)
	MasalikUI.button(v,"قيادة حرة",resume)
	MasalikUI.button(v,"القائمة والمهام",func(): get_tree().paused=false;get_tree().change_scene_to_file("res://scenes/menus/MainMenu.tscn"))
