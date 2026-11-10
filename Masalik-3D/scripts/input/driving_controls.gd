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
const DEFAULTS := {"wheel":[0.16,0.72,210.0,0.85,true],"gas":[0.91,0.76,110.0,0.9,true],"brake":[0.78,0.79,98.0,0.9,true],"hand":[0.68,0.81,70.0,0.8,true],"left":[0.1,0.75,95.0,0.8,true],"right":[0.25,0.75,95.0,0.8,true]}
func _ready() -> void:
	mouse_filter=Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layout=DEFAULTS.duplicate(true)
	var data: Dictionary=PersistenceManager.save_data
	scheme=int(data.get("control_scheme",0))
	var active: String=str(data.get("active_layout","default"))
	if data.layouts.has(active): layout.merge(data.layouts[active],true)
	resized.connect(queue_redraw)
func rect_for(key: String) -> Rect2:
	var c: Array=layout[key]
	var sz := float(c[2])
	var center := Vector2(float(c[0])*size.x,float(c[1])*size.y)
	var margin := Vector2(24,24)
	var safe := DisplayServer.get_display_safe_area()
	if safe.size.x > 0 and DisplayServer.window_get_size().x > 0:
		var factor := size / Vector2(DisplayServer.window_get_size())
		margin.x = maxf(24,float(safe.position.x)*factor.x+8)
	center = center.clamp(Vector2.ONE*sz*0.5+margin,size-Vector2.ONE*sz*0.5-margin)
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
	if editing: return
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
	throttle=float(actions.has("gas") or Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP))
	if Input.is_physical_key_pressed(KEY_S): throttle=-1
	elif reverse: throttle=-throttle
	brake=float(actions.has("brake") or Input.is_physical_key_pressed(KEY_SPACE))
	handbrake=actions.has("hand") or Input.is_physical_key_pressed(KEY_H)
	if not Input.get_connected_joypads().is_empty():
		throttle=maxf(throttle,maxf(0,Input.get_joy_axis(0,JOY_AXIS_TRIGGER_RIGHT)))
		brake=maxf(brake,maxf(0,Input.get_joy_axis(0,JOY_AXIS_TRIGGER_LEFT)))
	queue_redraw()
func _draw() -> void:
	for key in layout:
		if not active(key): continue
		var rect := rect_for(key);var center := rect.get_center();var r := rect.size.x/2
		var color := Color("dcb779");color.a=float(layout[key][3])
		draw_circle(center,r,Color(0.04,0.08,0.1,color.a*0.8))
		draw_arc(center,r-3,0,TAU,64,color,3,true)
		if key=="wheel":
			draw_arc(center,r-15,0,TAU,64,color,12,true)
			for angle in [0.0,PI,PI/2]:
				var direction := Vector2.from_angle(angle+wheel_angle)
				draw_line(center+direction*15,center+direction*(r-20),color,10,true)
			draw_circle(center,20,color)
		else:
			var glyph: String={"gas":"▲","brake":"■","hand":"H","left":"◀","right":"▶"}[key]
			draw_string(ThemeDB.fallback_font,center+Vector2(-12,10),glyph,HORIZONTAL_ALIGNMENT_LEFT,-1,30,color)
		if editing and selected==key: draw_rect(rect,Color.WHITE,false,3)
