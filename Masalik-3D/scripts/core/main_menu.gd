extends Control
var content: VBoxContainer
var preview: SubViewport
var display_car: VehicleVisual
var selected := "shahiq"
var angle := 0.0
var catalog: Dictionary
var root_panel: PanelContainer
var rotate_preview := true
func _ready() -> void:
	theme=MasalikUI.theme()
	layout_direction=Control.LAYOUT_DIRECTION_RTL
	catalog=JSON.parse_string(FileAccess.get_file_as_string("res://data/missions/catalog.json"))
	selected=str(PersistenceManager.save_data.selected_vehicle_id)
	QualityManager.apply(int(PersistenceManager.save_data.quality))
	home()
func clear(title: String) -> void:
	for child in get_children(): remove_child(child);child.queue_free()
	preview=null;display_car=null
	content=MasalikUI.panel(self,title)
func home() -> void:
	clear("مَسَالِك  |  دروب اليمن")
	MasalikUI.label(content,"طريقك… حكايتك… من سفح تعز إلى أفق البحر",20)
	var row := HBoxContainer.new();row.custom_minimum_size.y=360;content.add_child(row)
	var actions := VBoxContainer.new();actions.custom_minimum_size.x=350;actions.size_flags_horizontal=Control.SIZE_EXPAND_FILL;row.add_child(actions)
	MasalikUI.button(actions,"متابعة الرحلة  ←",func(): launch({}))
	MasalikUI.button(actions,"القيادة الحرة · ست مناطق",regions_menu)
	MasalikUI.button(actions,"حكايات الطريق والتحديات",func(): missions_menu("story"))
	MasalikUI.button(actions,"الكراج · اختر رفيق الطريق",garage)
	MasalikUI.button(actions,"إعدادات القيادة والتحكم",settings)
	MasalikUI.button(actions,"سجل الرحلات والاعتمادات",credits)
	MasalikUI.button(actions,"ألبوم صور الرحلة",album)
	var preview_holder := SubViewportContainer.new();preview_holder.custom_minimum_size=Vector2(540,360);preview_holder.size_flags_horizontal=Control.SIZE_EXPAND_FILL;preview_holder.stretch=true;row.add_child(preview_holder)
	preview=SubViewport.new();preview.size=Vector2i(750,440);preview.own_world_3d=true;preview_holder.add_child(preview)
	var world_root := Node3D.new();preview.add_child(world_root);studio_environment(world_root)
	display_car=VehicleVisual.new();world_root.add_child(display_car);display_car.build(VehicleFleetRegistry.get_spec(selected),PersistenceManager.save_data.vehicle_customizations.get(selected,{}))
	var cam := Camera3D.new();cam.fov=32;cam.position=Vector3(3.5,1.9,4.8);world_root.add_child(cam);cam.look_at(Vector3(0,0.10,0));cam.current=true
	var light := DirectionalLight3D.new();light.rotation_degrees=Vector3(-35,-30,0);light.light_energy=1.5;world_root.add_child(light)
	var fill := OmniLight3D.new();fill.position=Vector3(-3,3,-3);fill.omni_range=15;fill.light_color=Color("a9c4cf");fill.light_energy=2;world_root.add_child(fill)
	var floor_mesh := MeshInstance3D.new();var plane := PlaneMesh.new();plane.size=Vector2(25,25);floor_mesh.mesh=plane;floor_mesh.position.y=-0.96
	var mat := StandardMaterial3D.new();mat.albedo_color=Color("17232a");mat.roughness=0.7;floor_mesh.material_override=mat;world_root.add_child(floor_mesh)
	var d: Dictionary=PersistenceManager.save_data
	MasalikUI.label(content,"%s  ·  المستوى %d  ·  %d عملة  ·  جميع الرحلات محلية" % [str(VehicleFleetRegistry.get_spec(selected).nameAr),1+int(d.xp)/1000,int(d.coins)],18)
func album() -> void:
	clear("ألبوم الرحلة");PhotoAlbum.populate(content,home)
func launch(mission: Dictionary) -> void:
	PersistenceManager.save_data.selected_vehicle_id=selected
	PersistenceManager.save_data_atomic()
	get_tree().set_meta("mission",mission)
	get_tree().change_scene_to_file("res://scenes/main/main_game.tscn")
func regions_menu() -> void:
	clear("القيادة الحرة — العالم المتصل")
	var regions: Array=JSON.parse_string(FileAccess.get_file_as_string("res://data/maps/regions.json"))
	for r in regions:
		MasalikUI.button(content,r.nameAr+"  |  "+r.subtitleAr,func():
			PersistenceManager.save_data.distance=float(r.startM)+40;launch({}))
	MasalikUI.button(content,"رجوع",home)
func missions_menu(category: String) -> void:
	clear("القصة والمهام — كل المحتوى محلي")
	var tabs := HFlowContainer.new();content.add_child(tabs)
	var names := {"story":"القصة","challenge":"النقيل","race":"سباق","cargo":"بضائع","passenger":"ركاب","rescue":"إنقاذ"}
	for key in names:
		MasalikUI.button(tabs,names[key],func(): missions_menu(key))
	var completed: Dictionary=PersistenceManager.save_data.completed
	for mission in catalog.missions:
		if mission.category!=category: continue
		var can_start := true
		if category=="story":
			var idx: int=catalog.missions.find(mission)
			if idx>0: can_start=completed.has(catalog.missions[idx-1].id)
		var b := MasalikUI.button(content,("✓ " if completed.has(mission.id) else "")+mission.titleAr,func(): briefing(mission))
		b.disabled=not can_start
	MasalikUI.button(content,"رجوع",home)
func briefing(mission: Dictionary) -> void:
	clear(mission.titleAr)
	for chapter in catalog.chapters:
		if int(chapter.chapterNumber)==int(mission.get("chapterNumber",0)):
			MasalikUI.label(content,chapter.introDialogueAr,22)
	MasalikUI.label(content,str(mission.get("dialogueBriefAr",mission.descriptionAr)),24)
	MasalikUI.label(content,mission.descriptionAr,20)
	MasalikUI.label(content,"%.2f كم · مكافأة %d عملة · الوقت المرجعي %d ثانية\nحافظ على الحمولة واتبع الطريق إلى علامة الوصول." % [absf(float(mission.finishDistanceM)-float(mission.startDistanceM))/1000,int(mission.rewardCoins),int(mission.targetTimeSec)])
	MasalikUI.label(content,"تُعار لك المركبة المناسبة للمهمة. المكافأة المالية تُمنح مرة واحدة؛ أفضل زمن يُحدّث عند الإعادة.",18)
	MasalikUI.button(content,"ابدأ المهمة",func(): launch(mission))
	MasalikUI.button(content,"رجوع",func(): missions_menu(mission.category))
func garage() -> void:
	clear("كراج المسالك — %d عملة" % int(PersistenceManager.save_data.coins))
	var row := HFlowContainer.new();content.add_child(row)
	for id in VehicleFleetRegistry.specs:
		var s: Dictionary=VehicleFleetRegistry.specs[id]
		MasalikUI.button(row,s.nameAr,func(): selected=id;garage())
	var spec: Dictionary=VehicleFleetRegistry.get_spec(selected)
	MasalikUI.label(content,spec.titleAr+" · "+str(spec.baseMassKg)+" كجم",24)
	var container := SubViewportContainer.new();container.custom_minimum_size=Vector2(700,360);container.stretch=true;content.add_child(container)
	container.gui_input.connect(func(event: InputEvent):
		if event is InputEventScreenDrag: display_car.rotation.y+=event.relative.x*0.01;rotate_preview=false
		if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT): display_car.rotation.y+=event.relative.x*0.01;rotate_preview=false)
	preview=SubViewport.new();preview.size=Vector2i(1000,300);preview.own_world_3d=true;container.add_child(preview)
	var root := Node3D.new();preview.add_child(root);studio_environment(root)
	display_car=VehicleVisual.new();root.add_child(display_car)
	var custom: Dictionary=PersistenceManager.save_data.vehicle_customizations.get(selected,{})
	display_car.build(spec,custom)
	var cam := Camera3D.new();cam.fov=32;cam.position=Vector3(3.5,1.9,4.8);root.add_child(cam);cam.look_at(Vector3(0,0.10,0));cam.current=true
	var light := DirectionalLight3D.new();light.rotation_degrees=Vector3(-45,-30,0);light.light_energy=2;root.add_child(light)
	var fill := OmniLight3D.new();fill.position=Vector3(-3,3,-2);fill.omni_range=20;root.add_child(fill)
	var paint_row := HBoxContainer.new();content.add_child(paint_row)
	MasalikUI.label(paint_row,"طلاء المركبة")
	var picker := ColorPickerButton.new();picker.color=Color(custom.get("paint",spec.defaultPaintHex));picker.custom_minimum_size=Vector2(120,45);paint_row.add_child(picker)
	picker.color_changed.connect(func(c: Color): set_custom("paint",c.to_html());display_car.paint.albedo_color=c)
	var rim := ColorPickerButton.new();rim.text="الجنوط";rim.color=Color(custom.get("rim","c6c3b9"));paint_row.add_child(rim)
	rim.color_changed.connect(func(c: Color): set_custom("rim",c.to_html());display_car.rim_material.albedo_color=c)
	MasalikUI.slider(content,"ارتفاع التعليق",float(custom.get("height",0)), -0.08,0.18,func(v: float): set_custom("height",v))
	var roof := CheckButton.new();roof.text="حامل أمتعة السقف";roof.button_pressed=bool(custom.get("roof",false));content.add_child(roof);roof.toggled.connect(func(on: bool): set_custom("roof",on);garage())
	var tires := OptionButton.new();content.add_child(tires)
	var tire_names := {"all_terrain":"إطارات متعددة التضاريس","mud_rock":"إطارات الصخر والطين","sand_dune":"إطارات الكثبان الرملية","highway_sport":"إطارات الأسفلت الرياضية"}
	for key in tire_names:
		tires.add_item(tire_names[key]);tires.set_item_metadata(tires.item_count-1,key)
		if key==str(custom.get("tire",spec.defaultTireType)): tires.select(tires.item_count-1)
	tires.item_selected.connect(func(i: int): set_custom("tire",tires.get_item_metadata(i)))
	var unlocked: bool=selected in PersistenceManager.save_data.unlocked
	if unlocked:
		MasalikUI.button(content,"اعتماد المركبة والقيادة",func(): PersistenceManager.save_data.selected_vehicle_id=selected;launch({}))
	else:
		var b := MasalikUI.button(content,"فتح المركبة — %d عملة" % int(spec.unlockPriceCoins),func():
			PersistenceManager.save_data.coins-=int(spec.unlockPriceCoins);PersistenceManager.save_data.unlocked.append(selected);PersistenceManager.save_data_atomic();garage())
		b.disabled=int(PersistenceManager.save_data.coins)<int(spec.unlockPriceCoins)
	MasalikUI.button(content,"ترقية المحرك (+10٪) — 400 عملة",func():
		if int(PersistenceManager.save_data.coins)>=400:
			PersistenceManager.save_data.coins-=400;set_custom("power",minf(1.5,float(custom.get("power",1))+0.1));garage())
	MasalikUI.button(content,"رجوع",func(): PersistenceManager.save_data_atomic();home())
func set_custom(key: String, value: Variant) -> void:
	var c: Dictionary=PersistenceManager.save_data.vehicle_customizations.get(selected,{})
	c[key]=value;PersistenceManager.save_data.vehicle_customizations[selected]=c
	PersistenceManager.save_data_atomic()
func settings() -> void:
	clear("إعدادات القيادة والجودة")
	var quality := OptionButton.new();content.add_child(quality)
	for text in ["اقتصادي — 30 FPS مستهدف","متوازن","عالٍ — 60 FPS مستهدف"]: quality.add_item(text)
	quality.select(int(PersistenceManager.save_data.quality))
	quality.item_selected.connect(func(i: int): PersistenceManager.save_data.quality=i;QualityManager.apply(i))
	var scheme := OptionButton.new();content.add_child(scheme)
	for text in ["الدركسون اللمسي","أزرار الاتجاه","إمالة الهاتف"]: scheme.add_item(text)
	scheme.select(int(PersistenceManager.save_data.control_scheme))
	scheme.item_selected.connect(func(i: int): PersistenceManager.save_data.control_scheme=i)
	MasalikUI.slider(content,"حساسية المقود",float(PersistenceManager.save_data.steering_sensitivity),0.3,2,func(v: float): PersistenceManager.save_data.steering_sensitivity=v)
	MasalikUI.slider(content,"سرعة العودة",float(PersistenceManager.save_data.steering_return),0.5,6,func(v: float): PersistenceManager.save_data.steering_return=v)
	MasalikUI.slider(content,"زاوية المقود",float(PersistenceManager.save_data.wheel_angle),90,360,func(v: float): PersistenceManager.save_data.wheel_angle=v)
	for bus in ["Music","Engine","Effects","Environment"]:
		MasalikUI.slider(content,{"Music":"الموسيقى","Engine":"صوت المحرك","Effects":"المؤثرات","Environment":"أصوات البيئة"}[bus],float(PersistenceManager.save_data.volumes.get(bus,0.8)),0,1,func(v: float): PersistenceManager.save_data.volumes[bus]=v)
	MasalikUI.button(content,"تصدير ملف الحفظ",func(): save_dialog(false))
	MasalikUI.button(content,"استيراد ملف حفظ",func(): save_dialog(true))
	MasalikUI.button(content,"حفظ ورجوع",func(): PersistenceManager.save_data_atomic();home())
func save_dialog(importing: bool) -> void:
	var dialog := FileDialog.new();dialog.use_native_dialog=true
	dialog.file_mode=FileDialog.FILE_MODE_OPEN_FILE if importing else FileDialog.FILE_MODE_SAVE_FILE
	dialog.access=FileDialog.ACCESS_FILESYSTEM;dialog.filters=PackedStringArray(["*.json ; MASALIK Save"])
	add_child(dialog);dialog.file_selected.connect(func(path: String):
		var ok: bool=PersistenceManager.import_save(path) if importing else PersistenceManager.export_save(path)
		MasalikUI.label(content,"تم بنجاح" if ok else "تعذر الوصول للملف أو الحفظ غير صالح");dialog.queue_free())
	dialog.popup_centered_ratio(0.8)
func credits() -> void:
	clear("سجل الرحلات والاعتمادات")
	var d: Dictionary=PersistenceManager.save_data
	MasalikUI.label(content,"المستوى %d · الخبرة %d · المهام المكتملة %d / 65\nالعملات %d" % [1+int(d.xp)/1000,int(d.xp),d.completed.size(),int(d.coins)],28)
	for id in d.completed: MasalikUI.label(content,"✓ "+id+" · %.1f ثانية" % float(d.completed[id].seconds))
	MasalikUI.label(content,"برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م",24)
	MasalikUI.label(content,"Godot Engine · Noto Sans Arabic (SIL OFL)\nالمجسمات الإجرائية والمقطوعة والأصوات مصنوعة محليًا. نسخة تطوير قيد التحقق على Android.")
	MasalikUI.button(content,"رجوع",home)
func _process(delta: float) -> void:
	if is_instance_valid(display_car) and rotate_preview: display_car.rotation.y+=delta*0.35

func studio_environment(parent: Node3D) -> void:
	var env := Environment.new();env.background_mode=Environment.BG_COLOR;env.background_color=Color("15232b");env.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR;env.ambient_light_color=Color("b3c2c5");env.ambient_light_energy=0.7;env.tonemap_mode=Environment.TONE_MAPPER_FILMIC
	var world := WorldEnvironment.new();world.environment=env;parent.add_child(world)
