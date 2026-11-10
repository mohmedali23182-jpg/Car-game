class_name DrivingInstruments
extends Control
var car: RaycastVehicleBody
var speed_text: Label
var gear_text: Label
func _ready() -> void:
	mouse_filter=Control.MOUSE_FILTER_IGNORE
	speed_text=Label.new();speed_text.add_theme_font_size_override("font_size",42);speed_text.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;speed_text.position=Vector2(75,13);speed_text.size=Vector2(130,65);add_child(speed_text)
	gear_text=Label.new();gear_text.add_theme_font_size_override("font_size",14);gear_text.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;gear_text.position=Vector2(40,78);gear_text.size=Vector2(200,30);add_child(gear_text)
func _process(_delta: float) -> void:
	if car==null: return
	speed_text.text="%03d" % int(car.current_speed_kmh)
	gear_text.text="km/h    %s %d    %s" % ["D" if car.throttle_input>=0 else "R",car.gear,car.drivetrain]
	queue_redraw()
func _draw() -> void:
	if car==null: return
	var panel := StyleBoxFlat.new();panel.bg_color=Color(0.04,0.07,0.085,0.82);panel.set_corner_radius_all(24);panel.border_color=Color(0.75,0.65,0.45,0.6);panel.set_border_width_all(1)
	draw_style_box(panel,Rect2(0,0,280,124))
	var center := Vector2(140,85)
	draw_arc(center,82,PI*1.1,PI*1.9,48,Color("3c484a"),4,true)
	draw_arc(center,82,PI*1.1,PI*1.1+PI*0.8*clampf(car.rpm/float(car.spec.redlineRpm),0,1),48,MasalikUI.GOLD,4,true)
	for i in range(9):
		var direction := Vector2.from_angle(PI*1.1+i*PI*0.1)
		draw_line(center+direction*89,center+direction*94,Color("b9b9ad"),1,true)
	var fuel := clampf(car.fuel/float(car.spec.fuelTankLiters),0,1)
	draw_line(Vector2(35,112),Vector2(245,112),Color("384349"),3)
	draw_line(Vector2(35,112),Vector2(35+210*fuel,112),Color("d2a968") if fuel>0.15 else Color("c3644d"),3)
