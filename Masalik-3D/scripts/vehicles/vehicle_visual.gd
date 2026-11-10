class_name VehicleVisual
extends Node3D
## Original offline vehicle meshes. Distinct regional silhouettes; no brand logos.
var paint := StandardMaterial3D.new()
var wheels: Array[Node3D] = []
var headlights: Array[SpotLight3D] = []
var brake_material := StandardMaterial3D.new()
var spec: Dictionary
var driver_wheel: Node3D
const BODY_HEIGHT_SCALE := 0.75
const BODY_HEIGHT_OFFSET := -0.125
var accessories: Dictionary = {}
func material(color: String, metal := 0.0, rough := 0.7) -> StandardMaterial3D:
	var m := StandardMaterial3D.new();m.albedo_color=Color(color);m.metallic=metal;m.roughness=rough
	m.cull_mode=BaseMaterial3D.CULL_DISABLED
	return m
func build(s: Dictionary, custom: Dictionary = {}) -> void:
	spec=s
	paint=material(str(custom.get("paint",s.defaultPaintHex)),0.38,0.31)
	var glass := material("20343f",0.35,0.18)
	var windscreen := material("687f87",0.05,0.12);windscreen.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;windscreen.albedo_color.a=0.12
	var black := material("161d22",0.1,0.83)
	var silver := material(str(custom.get("rim","a7adb2")),0.85,0.24)
	var trim := material("424745",0.3,0.55)
	var seat := material("533d30",0,0.95)
	var width: float=float(s.trackWidthM)
	var length: float=float(s.wheelbaseM)+1.45
	var half := width*0.5
	var bus: bool=s.id=="hafilat"
	var pickup: bool=s.id in ["saqr","badiya","munqidh"]
	var truck: bool=s.id=="jabal"
	var sedan: bool=s.id in ["madina","barq"]
	var classic: bool=s.id=="aseel"
	var belt := 0.55 if sedan else 0.7
	var roof := 1.03 if sedan else (1.95 if bus else 1.46)
	if s.id=="barq": roof=0.87
	var front := -length*0.5
	var rear := length*0.5
	# Chamfered body loft: bumper/hood/shoulder/trunk profiles replace the old solid cube.
	loft([
		Vector4(front,half*0.82,0.02,belt*0.65),
		Vector4(front+0.20,half,0.02,belt*0.83),
		Vector4(front+length*0.25,half,0.03,belt),
		Vector4(rear-0.26,half,0.04,belt),
		Vector4(rear,half*0.90,0.08,belt*0.84)],paint)
	part(Vector3(width*0.91,belt*0.82,0.055),Vector3(0,belt*0.46,rear+0.018),paint)
	# Dark sill and chrome bumper strips separate the body panels.
	for side in [-1.0,1.0]:
		part(Vector3(0.045,belt*0.72,float(s.wheelbaseM)*0.68),Vector3(side*(half+0.005),belt*0.43,0.05),paint)
		part(Vector3(0.10,0.16,length*0.8),Vector3(side*(half+0.01),0.08,0),black)
		part(Vector3(0.08,0.035,length*0.7),Vector3(side*(half+0.015),belt*0.75,0.1),silver)
		part(Vector3(0.25,0.13,0.14),Vector3(side*(half+0.10),belt+0.3,front+length*0.31),trim)
		part(Vector3(0.03,0.10,0.13),Vector3(side*(half+0.23),belt+0.3,front+length*0.31),silver)
	var cabin_front := front+length*(0.06 if bus or truck else 0.28)
	var cabin_rear := rear-length*(0.05 if bus else (0.56 if pickup or truck else 0.17))
	var roof_front := cabin_front+(0.18 if classic or bus else 0.42)
	var roof_rear := cabin_rear-(0.12 if classic or bus else 0.23)
	if s.id=="rahhal": roof_rear-=0.28
	if s.id=="barq": roof_front+=0.12
	var roof_half := half*(0.86 if bus or classic else 0.77)
	# Visible glazing, thin pillars, roof; the cabin is open internally.
	quad([Vector3(-half*0.9,belt,cabin_front),Vector3(half*0.9,belt,cabin_front),Vector3(roof_half,roof,roof_front),Vector3(-roof_half,roof,roof_front)],windscreen)
	quad([Vector3(-half*0.90,belt,cabin_rear),Vector3(-roof_half,roof,roof_rear),Vector3(roof_half,roof,roof_rear),Vector3(half*0.9,belt,cabin_rear)],glass)
	part(Vector3(roof_half*2+0.10,0.10,maxf(0.3,roof_rear-roof_front)),Vector3(0,roof+0.045,(roof_front+roof_rear)*0.5),paint)
	for side in [-1.0,1.0]:
		var x: float=side*half*0.94;var rx: float=side*roof_half
		quad([Vector3(x,belt+0.07,cabin_front+0.10),Vector3(x,belt+0.07,cabin_rear-0.10),Vector3(rx,roof-0.05,roof_rear),Vector3(rx,roof-0.05,roof_front)],glass)
		beam(Vector3(x,belt,cabin_front),Vector3(rx,roof,roof_front),0.07,paint)
		beam(Vector3(x,belt,cabin_rear),Vector3(rx,roof,roof_rear),0.08,paint)
		var windows := 5 if bus else (1 if pickup or truck else 2)
		for n in range(windows):
			var f := float(n+1)/float(windows+1)
			var z := lerpf(roof_front,roof_rear,f)
			beam(Vector3(x,belt,z),Vector3(rx,roof,z),0.055,paint)
			part(Vector3(0.025,belt*0.6,0.015),Vector3(side*(half+0.02),belt*0.35,z),trim)
			part(Vector3(0.055,0.04,0.19),Vector3(side*(half+0.05),belt*0.78,z+0.12),silver)
	# Bed/loadbox differences for pickup, recovery and heavy haul vehicles.
	if pickup or truck:
		var bed_start := cabin_rear+0.13;var bed_length := rear-bed_start-0.12
		part(Vector3(width*0.86,0.08,bed_length),Vector3(0,belt*0.55,bed_start+bed_length*0.5),black)
		for side in [-1.0,1.0]:
			part(Vector3(0.10,0.5,bed_length),Vector3(side*half*0.94,belt+0.05,bed_start+bed_length*0.5),paint)
			if truck:
				for z in range(4): part(Vector3(0.08,1.05,0.08),Vector3(side*half*0.96,belt+0.4,lerpf(bed_start,rear,float(z)/3)),silver)
		part(Vector3(width*0.91,0.5,0.10),Vector3(0,belt+0.05,rear-0.08),paint)
		if float(custom.get("cargo",0))>0:
			for i in range(3): part(Vector3(width*0.65,0.35,bed_length*0.22),Vector3(0,belt+0.25,bed_start+bed_length*(0.2+0.27*i)),material("8c683f"))
	# Continuous door sills and painted wheel-arch lips give the chassis a full body.
	for side in [-1.0,1.0]:
		part(Vector3(0.09,0.82,maxf(0.5,float(s.wheelbaseM)-2*float(s.wheelRadiusM)-0.18)),Vector3(side*(half+0.02),-0.04,0),paint)
		for axle in [-1.0,1.0]:
			var wheel_z: float=axle*float(s.wheelbaseM)*0.5
			var radius: float=float(s.wheelRadiusM)+0.07
			for segment in range(16):
				var a := PI*float(segment)/16;var b := PI*float(segment+1)/16
				var x: float=side*(half+0.08)
				quad([Vector3(x,-0.5+sin(a)*radius/BODY_HEIGHT_SCALE,wheel_z+cos(a)*radius),Vector3(x,-0.5+sin(b)*radius/BODY_HEIGHT_SCALE,wheel_z+cos(b)*radius),Vector3(x,-0.5+sin(b)*(radius+0.08)/BODY_HEIGHT_SCALE,wheel_z+cos(b)*(radius+0.08)),Vector3(x,-0.5+sin(a)*(radius+0.08)/BODY_HEIGHT_SCALE,wheel_z+cos(a)*(radius+0.08))],trim)
	# Shaped grille, slim running lights and front/rear reflectors.
	part(Vector3(width*0.7,0.24,0.05),Vector3(0,belt*0.44,front-0.03),black)
	for bar in range(5): part(Vector3(width*0.63,0.019,0.06),Vector3(0,belt*0.31+bar*0.043,front-0.06),silver)
	var lamp := material("ede5cc",0.2,0.18);lamp.emission_enabled=true;lamp.emission=Color("d7c9a6")*0.5
	brake_material=material("6f1214",0.2,0.25);brake_material.emission_enabled=true
	for side in [-1.0,1.0]:
		part(Vector3(width*0.20,0.17,0.07),Vector3(side*half*0.75,belt*0.65,front-0.03),lamp)
		part(Vector3(width*0.21,0.045,0.08),Vector3(side*half*0.74,belt*0.84,front-0.04),silver)
		part(Vector3(0.17,0.30,0.055),Vector3(side*half*0.82,belt*0.55,rear+0.02),brake_material)
		part(Vector3(0.17,0.06,0.06),Vector3(side*half*0.82,belt*0.45,rear+0.025),lamp)
		var light := SpotLight3D.new();light.position=Vector3(side*half*0.75,belt*0.65,front-0.07);light.spot_range=42;light.spot_angle=32;light.light_energy=1.8;add_child(light);headlights.append(light)
	part(Vector3(width*0.95,0.14,0.20),Vector3(0,0.02,front),trim)
	part(Vector3(width*0.95,0.16,0.18),Vector3(0,0.02,rear),silver)
	# Plate is an actual local 3D panel with readable embedded Arabic typography.
	part(Vector3(0.54,0.17,0.04),Vector3(0,0.28,rear+0.06),material("e6dfcb"))
	var plate := Label3D.new();plate.text="تعز  ٤٠٢١";plate.font=load("res://assets/fonts/NotoSansArabic-Regular.ttf");plate.font_size=36;plate.pixel_size=0.0015;plate.position=Vector3(0,0.28,rear+0.085);plate.modulate=Color("17242b");plate.outline_size=0;add_child(plate)
	if not sedan and not pickup and not truck:
		var spare := MeshInstance3D.new();var tire := CylinderMesh.new();tire.top_radius=float(s.wheelRadiusM)*0.92;tire.bottom_radius=tire.top_radius;tire.height=0.24;tire.radial_segments=24;spare.mesh=tire;spare.rotation.x=PI/2;spare.position=Vector3(half*0.35,belt+0.15,rear+0.15);spare.material_override=black;add_child(spare)
	# Detailed cabin: dash, seats, instrument strip and animated steering wheel.
	part(Vector3(width*0.78,0.19,0.38),Vector3(0,belt+0.05,cabin_front+0.35),trim)
	part(Vector3(0.46,0.09,0.08),Vector3(-width*0.22,belt+0.19,cabin_front+0.58),black)
	for side in [-1.0,1.0]:
		part(Vector3(0.52,0.14,0.60),Vector3(side*width*0.22,0.5,roof_front+0.75),seat)
		part(Vector3(0.5,0.55,0.14),Vector3(side*width*0.22,0.78,roof_front+1.0),seat)
		part(Vector3(0.25,0.18,0.13),Vector3(side*width*0.22,1.14,roof_front+1.0),seat)
	driver_wheel=Node3D.new();driver_wheel.position=Vector3(-width*0.22,minf(roof-0.35,1.22 if bus else belt+0.34),cabin_front+0.78);add_child(driver_wheel)
	var steering := TorusMesh.new();steering.inner_radius=0.17;steering.outer_radius=0.20;steering.rings=24;steering.ring_segments=8
	var sm := MeshInstance3D.new();sm.mesh=steering;sm.rotation.x=PI/2;sm.material_override=black;driver_wheel.add_child(sm)
	part_on(driver_wheel,Vector3(0.32,0.04,0.06),Vector3.ZERO,trim)
	part_on(driver_wheel,Vector3(0.06,0.18,0.06),Vector3(0,-0.06,0),trim)
	if bool(custom.get("roof",false)) and not sedan:
		for side in [-1.0,1.0]: part(Vector3(0.06,0.08,maxf(0.4,roof_rear-roof_front)),Vector3(side*roof_half,roof+0.15,(roof_front+roof_rear)*0.5),silver)
		for f in [0.1,0.5,0.9]: part(Vector3(roof_half*2,0.055,0.06),Vector3(0,roof+0.19,lerpf(roof_front,roof_rear,f)),silver)
	if s.id=="munqidh":
		var emergency := material("a52816");emergency.emission_enabled=true;emergency.emission=Color("e05024")
		part(Vector3(width*0.6,0.12,0.2),Vector3(0,roof+0.17,(roof_front+roof_rear)*0.5),emergency)
	for i in range(4):
		var wheel := Node3D.new();add_child(wheel);wheels.append(wheel)
		var pivot := Node3D.new();wheel.add_child(pivot)
		var radius: float=float(s.wheelRadiusM);var tire_width: float=float(s.wheelWidthM)
		var tire := CylinderMesh.new();tire.top_radius=radius;tire.bottom_radius=radius;tire.height=tire_width;tire.radial_segments=24
		var mi := MeshInstance3D.new();mi.mesh=tire;mi.rotation.z=PI/2;mi.material_override=black;pivot.add_child(mi)
		var rim := CylinderMesh.new();rim.top_radius=radius*0.60;rim.bottom_radius=rim.top_radius;rim.height=tire_width+0.012;rim.radial_segments=20
		mi=MeshInstance3D.new();mi.mesh=rim;mi.rotation.z=PI/2;mi.material_override=trim;pivot.add_child(mi)
		for n in range(6):
			var spoke := MeshInstance3D.new();var box := BoxMesh.new();box.size=Vector3(tire_width+0.03,radius*0.95,0.065);spoke.mesh=box;spoke.rotation.x=n*PI/3;spoke.material_override=silver;pivot.add_child(spoke)
		for n in range(18):
			var tread := MeshInstance3D.new();var box := BoxMesh.new();box.size=Vector3(tire_width*1.01,0.018 if sedan or bus else 0.035,0.045 if sedan or bus else 0.075);tread.mesh=box;tread.material_override=trim;tread.position=Vector3(0,cos(n*TAU/18)*radius,sin(n*TAU/18)*radius);tread.rotation.x=n*TAU/18;pivot.add_child(tread)
		batch_static(pivot)
		wheel.position=Vector3((-1.0 if i%2==0 else 1.0)*float(s.trackWidthM)*0.5,-0.5,(-1.0 if i<2 else 1.0)*float(s.wheelbaseM)*0.5)
	batch_static(self)
	var body := Node3D.new();body.name="BodyShell"
	for child in get_children():
		if child in wheels: continue
		remove_child(child);body.add_child(child)
	add_child(body);body.scale.y=BODY_HEIGHT_SCALE;body.position.y=BODY_HEIGHT_OFFSET
	driver_wheel.scale.y=1.0/BODY_HEIGHT_SCALE
func loft(rings: Array, mat: Material) -> void:
	var profiles: Array=[]
	for r: Vector4 in rings:
		var w := r.y;var bottom := r.z;var top := r.w
		profiles.append([Vector3(-w+0.08,bottom,r.x),Vector3(w-0.08,bottom,r.x),Vector3(w,bottom+0.09,r.x),Vector3(w,top-0.08,r.x),Vector3(w-0.08,top,r.x),Vector3(-w+0.08,top,r.x),Vector3(-w,top-0.08,r.x),Vector3(-w,bottom+0.09,r.x)])
	for i in range(profiles.size()-1):
		for j in range(8): quad([profiles[i][j],profiles[i][(j+1)%8],profiles[i+1][(j+1)%8],profiles[i+1][j]],mat)
	for j in range(1,7):
		quad([profiles[0][0],profiles[0][j],profiles[0][j+1],profiles[0][0]],mat)
		quad([profiles[-1][0],profiles[-1][j+1],profiles[-1][j],profiles[-1][0]],mat)
func quad(vertices: Array, mat: Material) -> void:
	var st := SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in [0,2,1,0,3,2]: st.add_vertex(vertices[index])
	st.generate_normals();var mi := MeshInstance3D.new();mi.mesh=st.commit();mi.material_override=mat;add_child(mi)
func beam(a: Vector3,b: Vector3, thickness: float,mat: Material) -> void:
	var node := MeshInstance3D.new();var mesh := BoxMesh.new();mesh.size=Vector3(thickness,a.distance_to(b),thickness);node.mesh=mesh;node.position=(a+b)*0.5;node.material_override=mat;add_child(node)
	node.quaternion=Quaternion(Vector3.UP,(b-a).normalized())
func part(size: Vector3,pos: Vector3,mat: Material) -> void: part_on(self,size,pos,mat)
func part_on(parent: Node3D,size: Vector3,pos: Vector3,mat: Material) -> void:
	var mi := MeshInstance3D.new();var box := BoxMesh.new();box.size=size;mi.mesh=box;mi.position=pos;mi.material_override=mat;parent.add_child(mi)
func update_wheel(i: int,origin: Vector3,length: float,steering: float,spin: float) -> void:
	if is_instance_valid(driver_wheel): driver_wheel.rotation.z=-steering*10
	wheels[i].position=origin+Vector3.DOWN*length;wheels[i].rotation.y=-steering if i<2 else 0.0;wheels[i].get_child(0).rotation.x=spin

func batch_static(parent: Node3D) -> void:
	var groups: Dictionary={}
	for child in parent.get_children():
		if not child is MeshInstance3D or child.mesh==null: continue
		var mat: Material=child.material_override
		if mat==null: continue
		var id := mat.get_instance_id()
		if not groups.has(id):
			var st := SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES);st.set_material(mat);groups[id]=st
		groups[id].append_from(child.mesh,0,child.transform)
		parent.remove_child(child);child.queue_free()
	var combined := ArrayMesh.new()
	for tool in groups.values(): tool.commit(combined)
	if combined.get_surface_count()>0:
		var instance := MeshInstance3D.new();instance.mesh=combined;parent.add_child(instance)
