class_name VehicleVisual
extends Node3D
var paint := StandardMaterial3D.new()
var wheels: Array[Node3D] = []
var headlights: Array[SpotLight3D] = []
var brake_material := StandardMaterial3D.new()
var spec: Dictionary
var driver_wheel: MeshInstance3D
func build(s: Dictionary, custom: Dictionary = {}) -> void:
	spec = s
	paint.albedo_color = Color(custom.get("paint", s.defaultPaintHex)); paint.metallic = 0.5; paint.roughness = 0.32
	var glass := StandardMaterial3D.new(); glass.albedo_color = Color("233f50"); glass.metallic = 0.65; glass.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA;glass.albedo_color.a=0.38
	var black := StandardMaterial3D.new(); black.albedo_color = Color("202326")
	var silver := StandardMaterial3D.new(); silver.albedo_color = Color(custom.get("rim", "c6c3b9")); silver.metallic = 0.8
	var length: float = float(s.wheelbaseM)+1.45
	var width: float = float(s.trackWidthM)
	var bus: bool = s.id == "hafilat"
	var truck: bool = s.id in ["jabal", "saqr", "badiya", "munqidh"]
	part(Vector3(width,0.48,length),Vector3(0,0.25,0),paint)
	if truck:
		part(Vector3(width*0.94,1.1,length*0.35),Vector3(0,0.95,-length*0.18),paint)
		part(Vector3(width*0.84,0.5,length*0.45),Vector3(0,0.58,length*0.22),black)
		for side in [-1.0,1.0]: part(Vector3(0.12,0.55,length*0.46),Vector3(side*width*0.47,0.65,length*0.22),paint)
	else:
		part(Vector3(width*0.9,1.0 if bus else 0.82,length*(0.88 if bus else 0.6)),Vector3(0,0.9,0.1),paint)
	part(Vector3(width*0.81,0.48,0.06),Vector3(0,1.04,-length*(0.365 if bus else 0.25)),glass)
	if not truck:
		part(Vector3(width*0.79,0.42,0.065),Vector3(0,1.03,length*(0.46 if bus else 0.33)),glass)
	# Local low-poly details distinguish the body, not downloaded model placeholders.
	for grille_x in [-0.5,-0.25,0.0,0.25,0.5]:
		part(Vector3(0.13,0.22,0.035),Vector3(grille_x,0.29,-length*0.511),black)
	var plate := Label3D.new();plate.text="مَسَالِك";plate.font=load("res://assets/fonts/NotoSansArabic-Regular.ttf");plate.font_size=42;plate.pixel_size=0.005;plate.position=Vector3(0,0.2,length*0.516);plate.rotation.y=PI;plate.modulate=Color("f4e6c8");add_child(plate)
	if s.id=="munqidh":
		part(Vector3(width*0.7,0.16,0.3),Vector3(0,1.65,-length*0.15),silver)
		var emergency := StandardMaterial3D.new();emergency.albedo_color=Color("d84025");emergency.emission_enabled=true;emergency.emission=Color("d84025")
		part(Vector3(width*0.55,0.14,0.25),Vector3(0,1.8,-length*0.15),emergency)
	for side in [-1.0,1.0]:
		part(Vector3(0.04,0.48,length*(0.72 if bus else 0.25)),Vector3(side*width*0.455,1.05,0.05),glass)
		part(Vector3(0.3,0.15,0.25),Vector3(side*(width*0.52),0.96,-length*0.22),black)
	part(Vector3(width+0.1,0.15,0.18),Vector3(0,0.1,-length*0.51),silver)
	part(Vector3(width+0.1,0.15,0.18),Vector3(0,0.1,length*0.51),silver)
	# A local modeled cabin for the actual interior camera.
	part(Vector3(width*0.78,0.2,0.4),Vector3(0,0.75,-length*0.22),black)
	for side in [-1.0,1.0]:
		part(Vector3(0.6,0.15,0.7),Vector3(side*width*0.22,0.58,0.15),black)
		part(Vector3(0.6,0.65,0.15),Vector3(side*width*0.22,0.92,0.45),black)
	driver_wheel=MeshInstance3D.new();var steering_mesh := TorusMesh.new();steering_mesh.inner_radius=0.17;steering_mesh.outer_radius=0.20;steering_mesh.rings=16;steering_mesh.ring_segments=8
	driver_wheel.mesh=steering_mesh;driver_wheel.material_override=black;driver_wheel.position=Vector3(-width*0.22,0.94,-0.62);driver_wheel.rotation.x=PI/2;add_child(driver_wheel)
	if bool(custom.get("roof",false)):
		for side in [-1.0,1.0]: part(Vector3(0.08,0.10,length*0.6),Vector3(side*width*0.4,1.5,0),silver)
		for z in [-0.6,0.0,0.6]: part(Vector3(width*0.85,0.08,0.08),Vector3(0,1.54,z),silver)
	var lamp := StandardMaterial3D.new(); lamp.albedo_color = Color("fff2ce"); lamp.emission_enabled=true; lamp.emission=Color("fff2ce")
	brake_material.albedo_color = Color("9e2923"); brake_material.emission_enabled = true
	for side in [-1.0,1.0]:
		part(Vector3(0.35,0.18,0.05),Vector3(side*width*0.35,0.4,-length*0.51),lamp)
		part(Vector3(0.3,0.16,0.05),Vector3(side*width*0.35,0.4,length*0.51),brake_material)
		var light := SpotLight3D.new(); light.position=Vector3(side*width*0.35,0.45,-length*0.51); light.spot_range=45; light.spot_angle=35; light.light_energy=2; add_child(light); headlights.append(light)
	for i in range(4):
		var wheel := Node3D.new(); add_child(wheel); wheels.append(wheel)
		var pivot := Node3D.new(); wheel.add_child(pivot)
		var tire := CylinderMesh.new(); tire.top_radius=float(s.wheelRadiusM); tire.bottom_radius=tire.top_radius; tire.height=float(s.wheelWidthM); tire.radial_segments=16
		var mi := MeshInstance3D.new(); mi.mesh=tire; mi.rotation.z=PI/2; mi.material_override=black; pivot.add_child(mi)
		var rim := CylinderMesh.new(); rim.top_radius=tire.top_radius*0.6; rim.bottom_radius=rim.top_radius; rim.height=tire.height+0.02; rim.radial_segments=12
		mi=MeshInstance3D.new(); mi.mesh=rim; mi.rotation.z=PI/2; mi.material_override=silver; pivot.add_child(mi)
		part_on(pivot,Vector3(tire.height+0.04,0.09,tire.top_radius*1.1),Vector3.ZERO,black)
		wheel.position = Vector3((-1.0 if i%2==0 else 1.0)*float(s.trackWidthM)*0.5,-0.5,(-1.0 if i<2 else 1.0)*float(s.wheelbaseM)*0.5)
func part(size: Vector3, pos: Vector3, mat: Material) -> void: part_on(self,size,pos,mat)
func part_on(parent: Node3D,size: Vector3,pos: Vector3,mat: Material) -> void:
	var mi := MeshInstance3D.new(); var box := BoxMesh.new(); box.size=size
	mi.mesh=box; mi.position=pos; mi.material_override=mat; parent.add_child(mi)
func update_wheel(i: int, origin: Vector3, length: float, steering: float, spin: float) -> void:
	if is_instance_valid(driver_wheel): driver_wheel.rotation.z=-steering*10
	wheels[i].position=origin+Vector3.DOWN*length
	wheels[i].rotation.y=-steering if i<2 else 0.0
	wheels[i].get_child(0).rotation.x=spin
