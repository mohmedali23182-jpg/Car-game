class_name MasalikWorld
extends Node3D
const LENGTH := 15000.0
const STEP := 4.0
const CHUNK := 500.0
var points := PackedVector3Array()
var rights := PackedVector3Array()
var curve := Curve3D.new()
var chunks: Dictionary = {}
var player: Node3D
var distance := 40.0
var regions: Array = []
var noise := FastNoiseLite.new()
var tick := 0.0
var last_index := 10
var radius := 2
var materials: Dictionary = {}
var terrain_offsets: Array[float]=[]
var service_distances := [180.0,3500.0,6100.0,8500.0,11000.0,13700.0]
func _ready() -> void:
	regions = JSON.parse_string(FileAccess.get_file_as_string("res://data/maps/regions.json"))
	noise.seed = 326
	noise.frequency=0.006
	for x in range(-700,701,25): terrain_offsets.append(float(x))
	terrain_offsets.append_array([-12.0,-8.0,-5.5,5.5,8.0,12.0]);terrain_offsets.sort()
	build_path()
	for key in ["asphalt", "mud", "sand", "terrain", "stone", "window", "green", "gold", "sea"]:
		var m := StandardMaterial3D.new()
		m.albedo_color = {"asphalt": Color("42464a"), "mud": Color("735a3e"), "sand": Color("c6a572"), "terrain": Color("877654"), "stone": Color("9a8064"), "window": Color("223642"), "green": Color("485a35"), "gold": Color("e9c475"), "sea": Color("277e92")}[key]
		m.roughness = 0.9
		if key in ["terrain", "sand", "green"]:
			var shader_material := ShaderMaterial.new()
			shader_material.shader=load("res://assets/shaders/terrain.gdshader")
			shader_material.set_shader_parameter("base_color",m.albedo_color)
			materials[key]=shader_material
		else: materials[key] = m
	var road_mat := ShaderMaterial.new();road_mat.shader=load("res://assets/shaders/asphalt.gdshader");materials.asphalt=road_mat
	var stone_mat := ShaderMaterial.new();stone_mat.shader=load("res://assets/shaders/masonry.gdshader");materials.stone=stone_mat
	var white := StandardMaterial3D.new();white.albedo_color=Color("dcd7c7");white.roughness=0.82;materials.white=white
	var steel := StandardMaterial3D.new();steel.albedo_color=Color("747d80");steel.metallic=0.7;steel.roughness=0.42;materials.steel=steel
	var leaves := ShaderMaterial.new();leaves.shader=load("res://assets/shaders/foliage.gdshader");materials.foliage=leaves
	var crop_material := StandardMaterial3D.new();crop_material.albedo_color=Color("2d401d");crop_material.roughness=1.0;materials.crops=crop_material
	update_chunks(distance)
func build_path() -> void:
	points.clear()
	rights.clear()
	curve.clear_points()
	var p := Vector3.ZERO
	var heading := 0.0
	for i in range(3751):
		var s := i * STEP
		var curvature := 0.003 * sin(s * 0.009) + 0.002 * sin(s * 0.02)
		if s > 2500 and s < 5200: curvature *= 1.7
		if s > 7800: curvature *= 0.4
		heading += curvature * STEP
		# Continuous smooth elevation; no per-region discontinuity.
		var y := 180.0 * sin(s / LENGTH * TAU) + 25.0 * sin(s * 0.003)
		if i > 0: p += Vector3(sin(heading), 0, -cos(heading)) * STEP
		p.y = y
		points.append(p)
		curve.add_point(p)
	for i in range(points.size()):
		var tangent: Vector3 = points[mini(i + 1, points.size()-1)] - points[maxi(i-1, 0)]
		rights.append(tangent.cross(Vector3.UP).normalized())
func point_at(s: float) -> Vector3:
	var f := clampf(s / STEP, 0, points.size()-1.001)
	var i := int(f)
	return points[i].lerp(points[i+1], f-i)
func basis_at(s: float) -> Basis:
	var f := (point_at(minf(s+2, LENGTH)) - point_at(maxf(s-2, 0))).normalized()
	return Basis.looking_at(f, Vector3.UP)
func upright_basis(s: float) -> Basis:
	var forward := point_at(minf(s+2,LENGTH))-point_at(maxf(s-2,0))
	forward.y=0
	return Basis.looking_at(forward.normalized(),Vector3.UP)
func region_at(s: float) -> int:
	for i in range(regions.size()):
		if s < float(regions[i].endM): return i
	return 5
func surface_at(s: float) -> String:
	var r := region_at(s)
	return "mud" if r == 2 else ("sand" if r == 5 else "asphalt")
func nearest_distance(pos: Vector3, full := false) -> float:
	var best := INF
	var start := 0 if full else maxi(0, last_index-100)
	var end := points.size() if full else mini(points.size(), last_index+100)
	for i in range(start, end):
		var d := points[i].distance_squared_to(pos)
		if d < best:
			best = d
			last_index = i
	return last_index * STEP
func _process(delta: float) -> void:
	if not is_instance_valid(player): return
	distance = nearest_distance(player.global_position)
	tick += delta
	if tick > 0.2:
		tick = 0.0
		update_chunks(distance)
func update_chunks(s: float) -> void:
	var center := clampi(int(s / CHUNK), 0, 29)
	for id in chunks.keys():
		if absi(id-center) > radius:
			remove_child(chunks[id])
			chunks[id].queue_free()
			chunks.erase(id)
	for id in range(maxi(center-radius, 0), mini(center+radius+1, 30)):
		if not chunks.has(id): chunks[id] = build_chunk(id)
func triangle(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3) -> void:
	st.add_vertex(a); st.add_vertex(c); st.add_vertex(b)
func mesh_body(parent: Node3D, st: SurfaceTool, material: Material, surface: String) -> MeshInstance3D:
	st.generate_normals()
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = material
	parent.add_child(mi)
	mi.create_trimesh_collision()
	mi.get_child(0).set_meta("surface_type", surface)
	return mi
func height_point(index: int,lateral: float) -> Vector3:
	var p := points[index]+rights[index]*lateral
	var edge := maxf(0.0,absf(lateral)-8.0)
	var n := noise.get_noise_2d(p.x,p.z)
	var r := region_at(index*STEP)
	var elevation := 0.0
	match r:
		0,1:
			# An uphill cut on one side, an open valley on the other, with irregular ridges.
			if lateral<0: elevation=edge*(0.31+0.18*n)+maxf(0,edge-90)*0.15
			else: elevation=-minf(95,edge*0.22)+n*minf(edge,220)*0.18
		2: elevation=-edge*0.015+n*minf(edge*0.12,24)
		3: elevation=n*minf(edge*0.04,12)
		4: elevation=-minf(edge*0.15,14) if lateral<0 else edge*0.055+n*minf(edge*0.08,20)
		5: elevation=sin(p.x*0.035+p.z*0.017)*sin(p.z*0.023)*minf(edge*0.15,14)+n*minf(edge*0.06,9)
	p.y+=elevation-0.16
	if r==0 and lateral< -20 and edge<180: p.y=floorf(p.y/3.0)*3.0
	return p
func service_position(s: float) -> Vector3: return point_at(s)+basis_at(s).x*23.0
func nearest_service(pos: Vector3) -> float:
	var best := INF
	for s in service_distances: best=minf(best,pos.distance_to(service_position(s)))
	return best
func build_chunk(id: int) -> Node3D:
	var root := Node3D.new()
	root.name = "Sector_%02d" % id
	add_child(root)
	var first := int(id*CHUNK/STEP)
	var end := int((id+1)*CHUNK/STEP)
	var roads: Dictionary={}
	for i in range(first, end):
		var surface := surface_at(i*STEP)
		if not roads.has(surface):
			var tool := SurfaceTool.new();tool.begin(Mesh.PRIMITIVE_TRIANGLES);roads[surface]=tool
		var road: SurfaceTool=roads[surface]
		var a := points[i]-rights[i]*5.5
		var b := points[i]+rights[i]*5.5
		var c := points[i+1]-rights[i+1]*5.5
		var d := points[i+1]+rights[i+1]*5.5
		triangle(road, a,b,c); triangle(road,b,d,c)
	for surface in roads: mesh_body(root,roads[surface],materials[surface],surface)
	var terrain := SurfaceTool.new()
	terrain.begin(Mesh.PRIMITIVE_TRIANGLES)
	var offsets: Array[float]=terrain_offsets
	for i in range(first, end, 5):
		for j in range(offsets.size()-1):
			var a := height_point(i, offsets[j]); var b := height_point(i, offsets[j+1])
			var c := height_point(i+5, offsets[j]); var d := height_point(i+5, offsets[j+1])
			triangle(terrain,a,b,c); triangle(terrain,b,d,c)
	var region := region_at(id*CHUNK)
	mesh_body(root,terrain,materials["sand" if region == 5 else ("green" if region == 0 else "terrain")],"sand" if region == 5 else "dirt")
	# Lane geometry follows the same tested centerline, not a stretched generic plane.
	var marks: Array[Transform3D]=[];var edge_marks: Array[Transform3D]=[]
	var rails: Array[Transform3D]=[];var posts: Array[Transform3D]=[]
	for i in range(first,end):
		if surface_at(i*STEP)!="asphalt": continue
		var frame := basis_at((i+0.5)*STEP)
		var midpoint := (points[i]+points[i+1])*0.5
		for side in [-1.0,1.0]:
			edge_marks.append(Transform3D(frame,midpoint+rights[i]*side*4.9+Vector3.UP*0.025))
			var entrance := false
			for stop in service_distances:
				if side>0 and absf((i+0.5)*STEP-stop)<28: entrance=true
			if region in [0,1] and i%3==0 and not entrance:
				posts.append(Transform3D(frame,midpoint+rights[i]*side*6.15+Vector3.UP*0.45))
			if region in [0,1] and not entrance: rails.append(Transform3D(frame,midpoint+rights[i]*side*6.15+Vector3.UP*0.85))
		if i%4==0: marks.append(Transform3D(frame,midpoint+Vector3.UP*0.03))
	var box := BoxMesh.new();box.size=Vector3(0.14,0.025,3.4);instances(root,box,materials.gold,marks,500)
	box=BoxMesh.new();box.size=Vector3(0.13,0.025,4.15);instances(root,box,materials.white,edge_marks,500)
	box=BoxMesh.new();box.size=Vector3(0.10,0.24,4.2);instances(root,box,materials.steel,rails,450)
	if not rails.is_empty():
		var st := SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
		for transform in rails: st.append_from(box,0,transform)
		var body := StaticBody3D.new();var collision := CollisionShape3D.new();collision.shape=st.commit().create_trimesh_shape();body.add_child(collision);body.set_meta("surface_type","metal");root.add_child(body)
	box=BoxMesh.new();box.size=Vector3(0.12,0.9,0.12);instances(root,box,materials.steel,posts,450)
	# Local stone village frontage and white plaster surrounds, aligned toward the road.
	for i in range(first+15,end,35):
		var side := -1.0 if i%2==0 else 1.0
		var village := Node3D.new();root.add_child(village);village.position=height_point(i,side*21);village.basis=upright_basis(i*STEP).rotated(Vector3.UP,-side*PI/2)
		box_node(village,Vector3(6.2,1.6,5.2),Vector3(0,-0.8,0),materials.stone,true)
		for floor_id in range(2+i%3):
			var y := floor_id*2.9
			box_node(village,Vector3(6,2.8,5),Vector3(0,1.4+y,0),materials.stone,true)
			box_node(village,Vector3(6.12,0.13,5.12),Vector3(0,2.8+y,0),materials.white,false)
			for wx in [-1.8,0.0,1.8]:
				box_node(village,Vector3(0.98,1.33,0.09),Vector3(wx,1.5+y,2.56),materials.white,false)
				box_node(village,Vector3(0.72,1.08,0.10),Vector3(wx,1.5+y,2.62),materials.window,false)
				box_node(village,Vector3(0.045,1.05,0.13),Vector3(wx,1.5+y,2.68),materials.white,false)
				box_node(village,Vector3(0.72,0.045,0.13),Vector3(wx,1.7+y,2.68),materials.white,false)
		box_node(village,Vector3(1.15,2.05,0.14),Vector3(0,1.02,2.67),materials.window,false)
		if region in [0,3,4]:
			box_node(village,Vector3(5.6,0.16,1.5),Vector3(0,2.3,3.1),materials.green,false)
			text_sign(village,["بنّ يمني","ورشة المسالك","بقالة الوادي","استراحة القمم"][i%4],Vector3(0,2.65,2.75),Vector2(4.8,0.6),false)
	# Arabic directional signs, real-world-style markings and speed boards.
	var sign_frame := Node3D.new();root.add_child(sign_frame);sign_frame.position=point_at(id*CHUNK+110);sign_frame.basis=upright_basis(id*CHUNK+110)
	text_sign(sign_frame,str(regions[region].nameAr).split(" (")[0]+"  ↑",Vector3(8.5,3.6,0),Vector2(4.4,1.25),true)
	box_node(sign_frame,Vector3(0.10,3.2,0.10),Vector3(8.5,1.6,0),materials.steel,true)
	if region == 4:
		var sea := MeshInstance3D.new();var plane := PlaneMesh.new();plane.size=Vector2(900,900);plane.subdivide_width=24;plane.subdivide_depth=24
		sea.mesh=plane;sea.position=point_at(id*CHUNK+250)+Vector3(-480,-8,0)
		var water := ShaderMaterial.new();water.shader=load("res://assets/shaders/sea.gdshader");sea.material_override=water;root.add_child(sea)
	# Vegetation and natural rocks, deterministic at every sector boundary.
	var trunks: Array[Transform3D]=[];var crowns: Array[Transform3D]=[]
	var brown := StandardMaterial3D.new();brown.albedo_color=Color("4f4231");brown.roughness=1.0
	for i in range(first+6,end,7):
		var lateral := (18.0+float(i%4)*12.0)*(-1.0 if i%2==0 else 1.0)
		var center := height_point(i,lateral)
		if region not in [1,5]:
			trunks.append(Transform3D(Basis.IDENTITY,center+Vector3.UP*2.0))
			for cluster in range(3 if region not in [3,4] else 1):
				var offset := Vector3(sin(cluster*TAU/3)*1.0,4.0+float(cluster%2)*0.7,cos(cluster*TAU/3)*0.9) if region not in [3,4] else Vector3(0,4.1,0)
				crowns.append(Transform3D(Basis(Vector3.UP,float(i)*0.7),center+offset))
		elif i%3==0:
			var rock := MeshInstance3D.new();var stone := SphereMesh.new();stone.radius=1.2+float(i%3);stone.height=stone.radius*1.4;stone.radial_segments=8;stone.rings=4
			rock.mesh=stone;rock.position=center;rock.material_override=materials.terrain;root.add_child(rock);rock.create_trimesh_collision();rock.visibility_range_end=400
	if not trunks.is_empty():
		var trunk := CylinderMesh.new();trunk.top_radius=0.16;trunk.bottom_radius=0.25;trunk.height=4;trunk.radial_segments=6
		instances(root,trunk,brown,trunks,350)
		var crown := SphereMesh.new();crown.radius=1.8;crown.height=2.8;crown.radial_segments=12;crown.rings=8
		instances(root,palm_mesh() if region in [3,4] else crown,materials.foliage,crowns,420)
	# Drive-through tunnel portal with collidable roof and sides; clear width 11m.
	if id==6:
		for i in range(first+30,first+50,4):
			var frame := Node3D.new();root.add_child(frame);frame.position=points[i];frame.basis=basis_at(i*STEP)
			for side in [-1.0,1.0]: box_node(frame,Vector3(1.2,7,16),Vector3(side*6.2,3.5,0),materials.stone,true)
			box_node(frame,Vector3(13.5,1.2,16),Vector3(0,7.2,0),materials.stone,true)
	if region==0:
		var crops := SurfaceTool.new();crops.begin(Mesh.PRIMITIVE_TRIANGLES)
		for i in range(first+10,end-10,20):
			for lateral in [-30.0,-50.0,-70.0]:
				for row in range(6):
					var index0 := float(i)-1.5+float(row)*0.6
					for column in range(6):
						var left: float=lateral-6.5+float(column)*13.0/6
						var right := left+13.0/6
						var a := terrain_surface(index0,left)+Vector3.UP*0.035
						var b := terrain_surface(index0,right)+Vector3.UP*0.035
						var c := terrain_surface(index0+0.2,left)+Vector3.UP*0.035
						var d := terrain_surface(index0+0.2,right)+Vector3.UP*0.035
						triangle(crops,a,b,c);triangle(crops,b,d,c)
		crops.generate_normals();var field := MeshInstance3D.new();field.mesh=crops.commit();field.material_override=materials.crops;root.add_child(field)
	for s in service_distances:
		if int(s/CHUNK)==id: service_plaza(root,s)
	pack_architecture(root)
	return root
func pack_architecture(root: Node3D) -> void:
	var groups: Dictionary={}
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		if not mi.mesh is BoxMesh: continue
		var mat: Material=mi.material_override
		var key := mat.get_instance_id()
		if not groups.has(key): groups[key]={"material":mat,"transforms":[]}
		var transform: Transform3D=root.global_transform.affine_inverse()*mi.global_transform
		transform.basis=transform.basis*Basis.from_scale(mi.mesh.size)
		groups[key].transforms.append(transform)
		# Preserve collision child bodies; only the old visual draw is hidden.
		mi.hide()
	for group in groups.values():
		var transforms: Array[Transform3D]=[]
		transforms.assign(group.transforms)
		var cube := BoxMesh.new();cube.size=Vector3.ONE
		instances(root,cube,group.material,transforms,650)
func instances(parent: Node3D, mesh: Mesh, mat: Material, transforms: Array[Transform3D], max_distance: float) -> void:
	var mm := MultiMesh.new(); mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = mesh; mm.instance_count = transforms.size()
	for i in range(transforms.size()): mm.set_instance_transform(i,transforms[i])
	var node := MultiMeshInstance3D.new(); node.multimesh = mm; node.material_override = mat
	node.visibility_range_end = max_distance
	parent.add_child(node)
func box_node(parent: Node3D, size: Vector3, pos: Vector3, mat: Material, collision: bool) -> MeshInstance3D:
	var mi := MeshInstance3D.new(); var mesh := BoxMesh.new(); mesh.size = size
	mi.mesh = mesh; mi.position = pos; mi.material_override = mat
	mi.visibility_range_end = 650
	parent.add_child(mi)
	if collision: mi.create_trimesh_collision()
	return mi

func text_sign(parent: Node3D,text: String,pos: Vector3,dimensions: Vector2,green: bool) -> void:
	var backing := StandardMaterial3D.new();backing.albedo_color=Color("1d4e48") if green else Color("67492f")
	box_node(parent,Vector3(dimensions.x,dimensions.y,0.10),pos,backing,false)
	var label := Label3D.new();label.text=text;label.font=load("res://assets/fonts/NotoSansArabic-Regular.ttf");label.font_size=52;label.pixel_size=0.006;label.position=pos+Vector3(0,0,0.065);label.outline_size=0;label.modulate=Color("eae6d6");label.no_depth_test=false;parent.add_child(label)

func palm_mesh() -> ArrayMesh:
	var st := SurfaceTool.new();st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for frond in range(12):
		var angle := frond*TAU/12;var axis := Vector3(sin(angle),0,cos(angle));var side := axis.cross(Vector3.UP)
		for segment in range(5):
			var t0 := float(segment)/5;var t1 := float(segment+1)/5
			var a := axis*t0*3.3+Vector3.UP*(sin(t0*PI)*0.7-t0*0.4)
			var b := axis*t1*3.3+Vector3.UP*(sin(t1*PI)*0.7-t1*0.4)
			var wa := sin(t0*PI)*0.38+0.03;var wb := sin(t1*PI)*0.38+0.01
			triangle(st,a-side*wa,a+side*wa,b-side*wb);triangle(st,a+side*wa,b+side*wb,b-side*wb)
	st.generate_normals();return st.commit()
func service_plaza(parent: Node3D,s: float) -> void:
	var area := Node3D.new();area.name="ServicePlaza";parent.add_child(area);area.position=point_at(s);area.basis=upright_basis(s)
	# Parking court stays beyond the road's 11m driving corridor.
	box_node(area,Vector3(29,4,45),Vector3(22,-2.15,0),materials.stone,true)
	box_node(area,Vector3(29,0.35,45),Vector3(22,-0.20,0),materials.asphalt,true)
	box_node(area,Vector3(29,1.6,0.5),Vector3(22,-0.5,-22.5),materials.stone,true)
	box_node(area,Vector3(12,0.25,9),Vector3(23,4.3,-6),materials.white,true)
	for x in [18.0,28.0]:
		for z in [-9.0,-3.0]: box_node(area,Vector3(0.25,4.2,0.25),Vector3(x,2.1,z),materials.steel,true)
	for x in [20.0,26.0]:
		box_node(area,Vector3(0.8,1.6,0.6),Vector3(x,0.8,-6),materials.white,true)
		box_node(area,Vector3(0.67,0.4,0.05),Vector3(x,1.1,-5.67),materials.window,false)
	text_sign(area,"محطة المسالك · وقود وخدمة",Vector3(23,4.1,-1.4),Vector2(10,0.7),true)
	box_node(area,Vector3(11,3.1,7),Vector3(25,1.55,14),materials.stone,true)
	box_node(area,Vector3(7,2.6,0.10),Vector3(25,1.3,17.55),materials.window,false)
	text_sign(area,"استراحة البن اليمني",Vector3(25,3.3,17.6),Vector2(10,0.7),false)
	for space in range(4):
		box_node(area,Vector3(0.10,0.02,5),Vector3(10.5+space*2.8,0.025,7),materials.white,false)
	text_sign(area,"مواقف  P",Vector3(12,2.6,11),Vector2(3.0,0.65),true)

func terrain_surface(index: float,lateral: float) -> Vector3:
	# Barycentric sample of the same triangles used by the rendered/collidable terrain.
	var first := clampi(int(floorf(index/5))*5,0,3745)
	var next := first+5;var v := clampf((index-first)/5,0,1)
	var offsets: Array[float]=terrain_offsets
	var j := 0
	while j<offsets.size()-2 and lateral>offsets[j+1]: j+=1
	var u := clampf((lateral-offsets[j])/(offsets[j+1]-offsets[j]),0,1)
	var a := height_point(first,offsets[j]);var b := height_point(first,offsets[j+1]);var c := height_point(next,offsets[j]);var d := height_point(next,offsets[j+1])
	return a+(b-a)*u+(c-a)*v if u+v<=1 else d+(b-d)*(1-v)+(c-d)*(1-u)
