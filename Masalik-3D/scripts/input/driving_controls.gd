class_name DrivingControls
extends Control
signal changed
var steer := 0.0
var throttle := 0.0
var brake := 0.0
var handbrake := false
var scheme := 0
var editing := false
var selected := "wheel"
var pointers: Dictionary = {}
var finger_positions: Dictionary = {}
var wheel_angle := 0.0
var last_angle := 0.0
var wheel_finger := -1
var reverse := false
var boxes: Dictionary = {}
var layout: Dictionary = {}
var captions: Dictionary={}
const DEFAULTS := {"wheel":[0.16,0.72,210.0,0.85,true],"gas":[0.91,0.76,110.0,0.9,true],"brake":[0.78,0.79,98.0,0.9,true],"hand":[0.68,0.81,70.0,0.8,true],"left":[0.1,0.75,95.0,0.8,true],"right":[0.25,0.75,95.0,0.8,true]}
func _ready() -> void:
	mouse_filter=Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layout=DEFAULTS.duplicate(true)
	var data: Dictionary=PersistenceManager.save_data
	scheme=int(data.get("control_scheme",0))
	var active: String=str(data.get("active_layout","default"))
	if data.layouts.has(active): layout.merge(data.layouts[active],true)
	for key in ["gas","brake","hand"]:
		var l := Label.new();l.text={"gas":"بنزين","brake":"بريك","hand":"تثبيت"}[key];l.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;l.add_theme_font_size_override("font_size",15);l.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(l);captions[key]=l
	resized.connect(queue_redraw)
func safe_rect() -> Rect2:
	var area := Rect2(Vector2(28,22),size-Vector2(56,44))
	var safe := DisplayServer.get_display_safe_area()
	var window := DisplayServer.window_get_size()
	if safe.size.x>0 and window.x>0 and window.y>0:
		var factor := size/Vector2(window)
		var p := Vector2(safe.position-DisplayServer.window_get_position())*factor
		var actual := Rect2(p,Vector2(safe.size)*factor).intersection(Rect2(Vector2.ZERO,size))
		if actual.size.x>size.x*0.5 and actual.size.y>size.y*0.5: area=area.intersection(actual.grow(-12))
	return area
func rect_for(key: String) -> Rect2:
	var c: Array=layout[key];var sz := float(c[2]);var area := safe_rect()
	var center := Vector2(float(c[0])*size.x,float(c[1])*size.y)
	center=center.clamp(area.position+Vector2.ONE*sz*0.5,area.end-Vector2.ONE*sz*0.5-Vector2(0,20))
	return Rect2(center-Vector2.ONE*sz*0.5,Vector2.ONE*sz)
func reset_input() -> void:
	pointers.clear();finger_positions.clear();wheel_finger=-1;steer=0;throttle=0;brake=0;handbrake=false;wheel_angle=0;queue_redraw()
func _notification(what: int) -> void:
	if what in [NOTIFICATION_APPLICATION_FOCUS_OUT,NOTIFICATION_APPLICATION_PAUSED]: reset_input()
func _input(event: InputEvent) -> void:
	if not is_visible_in_tree(): return
	var id := -2; var pos := Vector2.ZERO; var down := false;var release := false;var moving := false
	if event is InputEventScreenTouch:
		id=event.index;pos=event.position;down=event.pressed;release=not down
	elif event is InputEventScreenDrag:
		id=event.index;pos=event.position;moving=true
	elif event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_LEFT:
		id=100;pos=event.position;down=event.pressed;release=not down
	elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		id=100;pos=event.position;moving=true
	else: return
	pos=get_global_transform_with_canvas().affine_inverse()*pos
	if down:
		for key in layout:
			if not active(key): continue
			if rect_for(key).has_point(pos):
				pointers[id]=key;finger_positions[id]=pos
				if editing: selected=key; changed.emit()
				elif key=="wheel" and wheel_finger==-1:
					wheel_finger=id;last_angle=(pos-rect_for(key).get_center()).angle()
				get_viewport().set_input_as_handled();break
	if moving and pointers.has(id):
		var key: String=pointers[id]
		if editing:
			layout[key][0]=clampf(pos.x/size.x,0.06,0.94);layout[key][1]=clampf(pos.y/size.y,0.18,0.89)
		elif id==wheel_finger:
			var angle := (pos-rect_for("wheel").get_center()).angle()
			wheel_angle=clampf(wheel_angle+wrapf(angle-last_angle,-PI,PI),-max_angle(),max_angle());last_angle=angle
		finger_positions[id]=pos;get_viewport().set_input_as_handled()
	if release:
		pointers.erase(id);finger_positions.erase(id)
		if id==wheel_finger: wheel_finger=-1
	queue_redraw()
func active(key: String) -> bool:
	if editing: return key not in ["left","right"]
	if not bool(layout[key][4]): return false
	if key=="wheel": return scheme==0
	if key in ["left","right"]: return scheme==1
	return true
func max_angle() -> float: return deg_to_rad(float(PersistenceManager.save_data.wheel_angle))
func _process(delta: float) -> void:
	if editing:
		for key in captions:
			var rect := rect_for(key);captions[key].position=rect.position+Vector2(0,rect.size.y-4);captions[key].size=Vector2(rect.size.x,25)
		queue_redraw();return
	if wheel_finger==-1: wheel_angle=move_toward(wheel_angle,0,delta*float(PersistenceManager.save_data.steering_return))
	var actions: Array=pointers.values()
	var key_left := Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT)
	var key_right := Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT)
	var digital := float(actions.has("right") or key_right)-float(actions.has("left") or key_left)
	steer=wheel_angle/max_angle() if scheme==0 and digital==0 else move_toward(steer,digital,delta*3)
	if scheme==2: steer=clampf(-Input.get_gravity().x/5,-1,1)
	if not Input.get_connected_joypads().is_empty():
		var axis := Input.get_joy_axis(0,JOY_AXIS_LEFT_X)
		if absf(axis)>0.12: steer=axis
	steer=clampf(steer*float(PersistenceManager.save_data.steering_sensitivity),-1,1)
	var target_throttle := float(Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP))
	var target_brake := float(Input.is_physical_key_pressed(KEY_SPACE))
	for finger in pointers:
		var key: String=pointers[finger]
		if key in ["gas","brake"]:
			var amount := clampf(0.25+0.75*(1.0-(Vector2(finger_positions[finger]).y-rect_for(key).position.y)/rect_for(key).size.y),0.2,1.0)
			if key=="gas": target_throttle=maxf(target_throttle,amount)
			else: target_brake=maxf(target_brake,amount)
	throttle=move_toward(throttle,target_throttle,delta*7)
	if Input.is_physical_key_pressed(KEY_S): throttle=-1
	elif reverse: throttle=-throttle
	brake=move_toward(brake,target_brake,delta*9)
	handbrake=actions.has("hand") or Input.is_physical_key_pressed(KEY_H)
	if not Input.get_connected_joypads().is_empty():
		var trigger := maxf(0,Input.get_joy_axis(0,JOY_AXIS_TRIGGER_RIGHT))
		if trigger>absf(throttle): throttle=trigger*(-1.0 if reverse else 1.0)
		brake=maxf(brake,maxf(0,Input.get_joy_axis(0,JOY_AXIS_TRIGGER_LEFT)))
	for key in captions:
		var rect := rect_for(key);var l: Label=captions[key]
		l.position=rect.position+Vector2(0,rect.size.y-4);l.size=Vector2(rect.size.x,25);l.visible=active(key)
	queue_redraw()
func _draw() -> void:
	for key in layout:
		if not active(key): continue
		var rect := rect_for(key);var center := rect.get_center();var r := rect.size.x/2
		var opacity := float(layout[key][3]);var steel := Color(0.66,0.7,0.7,opacity)
		if key=="wheel":
			draw_circle(center,r,Color(0.025,0.04,0.045,opacity*0.65))
			draw_arc(center,r-9,0,TAU,80,Color(0.08,0.11,0.12,opacity),18,true)
			draw_arc(center,r-18,0,TAU,80,steel,2,true)
			for angle in [0.0,PI,PI/2]:
				var d := Vector2.from_angle(angle+wheel_angle)
				draw_line(center+d*17,center+d*(r-20),Color(0.23,0.28,0.3,opacity),13,true)
			draw_circle(center,24,Color(0.12,0.17,0.19,opacity))
			draw_arc(center,23,0,TAU,32,steel,1.5,true)
			var marker := Vector2.from_angle(-PI/2+wheel_angle)
			draw_line(center+marker*(r-16),center+marker*(r-2),MasalikUI.GOLD,5,true)
		else:
			var pressed: bool=pointers.values().has(key)
			if key in ["gas","brake"]:
				var pedal_size := Vector2(rect.size.x*0.50,rect.size.y*0.82) if key=="gas" else Vector2(rect.size.x*0.86,rect.size.y*0.62)
				var pedal := Rect2(center-pedal_size*0.5,pedal_size)
				var style := StyleBoxFlat.new();style.bg_color=Color(0.20,0.25,0.26,opacity) if not pressed else Color(0.49,0.41,0.26,opacity);style.border_color=steel;style.set_border_width_all(2);style.set_corner_radius_all(9)
				draw_style_box(style,pedal)
				for row in range(1,6):
					var y := pedal.position.y+pedal.size.y*float(row)/6
					draw_line(Vector2(pedal.position.x+8,y),Vector2(pedal.end.x-8,y),Color(0.06,0.09,0.10,opacity),4,true)
			else:
				draw_circle(center,r-5,Color(0.04,0.08,0.1,opacity*0.8));draw_arc(center,r-6,0,TAU,40,steel,2,true)
				draw_string(ThemeDB.fallback_font,center+Vector2(-9,9),{"hand":"P","left":"◀","right":"▶"}[key],HORIZONTAL_ALIGNMENT_LEFT,-1,25,steel)
		if editing and selected==key: draw_rect(rect,MasalikUI.GOLD,false,2)
