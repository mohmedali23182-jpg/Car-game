class_name MasalikMap
extends Control
var world: MasalikWorld
var car: RaycastVehicleBody
var compact := true
func _ready() -> void:
	mouse_filter=Control.MOUSE_FILTER_IGNORE
func _process(_delta: float) -> void: queue_redraw()
func _draw() -> void:
	if world==null or car==null: return
	draw_style_box(background(),Rect2(Vector2.ZERO,size))
	var points := PackedVector2Array()
	var center := car.position
	var scale := 0.22 if compact else 0.035
	for i in range(0,world.points.size(),4):
		var p: Vector3=world.points[i]-center
		var v := Vector2(p.x,p.z)*scale+size*0.5
		if Rect2(Vector2.ZERO,size).grow(40).has_point(v): points.append(v)
	if points.size()>1: draw_polyline(points,MasalikUI.GOLD,3,true)
	for stop in world.service_distances:
		var p := world.service_position(stop)-center
		var marker := Vector2(p.x,p.z)*scale+size*0.5
		if Rect2(Vector2.ZERO,size).has_point(marker):
			draw_circle(marker,4,Color("79b3bd"));draw_arc(marker,6,0,TAU,20,Color("79b3bd"),1)
	var c := size*0.5
	var heading := -Vector2(car.global_basis.z.x,car.global_basis.z.z).normalized()
	draw_colored_polygon(PackedVector2Array([c+heading*9,c+heading.rotated(2.5)*7,c+heading.rotated(-2.5)*7]),Color.WHITE)
func background() -> StyleBoxFlat:
	var b := StyleBoxFlat.new();b.bg_color=Color(0.03,0.07,0.1,0.8);b.set_corner_radius_all(16);b.set_border_width_all(1);b.border_color=MasalikUI.GOLD;return b
