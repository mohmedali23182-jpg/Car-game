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
func _ready() -> void:
	regions = JSON.parse_string(FileAccess.get_file_as_string("res://data/maps/regions.json"))
	noise.seed = 326
	noise.frequency = 0.006
	build_path()
	for key in ["asphalt", "mud", "sand", "terrain", "stone", "window", "green", "gold", "sea"]:
		var m := StandardMaterial3D.new()
		m.albedo_color = {"asphalt": Color("42464a"), "mud": Color("735a3e"), "sand": Color("c6a572"), "terrain": Color("877654"), "stone": Color("9a8064"), "window": Color("223642"), "green": Color("667948"), "gold": Color("e9c475"), "sea": Color("277e92")}[key]
		m.roughness = 0.9
		if key in ["terrain", "sand", "green"]:
			var shader_material := ShaderMaterial.new()
			shader_material.shader=load("res://assets/shaders/terrain.gdshader")
			shader_material.set_shader_parameter("base_color",m.albedo_color)
			materials[key]=shader_material
		else: materials[key] = m
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
func height_point(index: int, lateral: float) -> Vector3:
	var p := points[index] + rights[index] * lateral
	var edge := maxf(0.0, absf(lateral)-8.0)
	var mountain := 0.9 + noise.get_noise_2d(p.x, p.z)
	var r := region_at(index*STEP)
	var amp: float = [0.7, 1.1, 0.4, 0.06, 0.1, 0.12][r]
	p.y += edge * mountain * float(amp) - 0.15
	if r == 0 and edge > 12: p.y = floorf(p.y / 5.0) * 5.0
	return p
func build_chunk(id: int) -> Node3D:
	var root := Node3D.new()
	root.name = "Sector_%02d" % id
	add_child(root)
	var first := int(id*CHUNK/STEP)
	var end := int((id+1)*CHUNK/STEP)
	var road := SurfaceTool.new()
	road.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in range(first, end):
		var a := points[i]-rights[i]*5.5
		var b := points[i]+rights[i]*5.5
		var c := points[i+1]-rights[i+1]*5.5
		var d := points[i+1]+rights[i+1]*5.5
		triangle(road, a,b,c); triangle(road,b,d,c)
	mesh_body(root, road, materials[surface_at(id*CHUNK)], surface_at(id*CHUNK))
	var terrain := SurfaceTool.new()
	terrain.begin(Mesh.PRIMITIVE_TRIANGLES)
	var offsets := [-700.0,-300.0,-120.0,-45.0,-12.0,0.0,12.0,45.0,120.0,300.0,700.0]
	for i in range(first, end, 5):
		for j in range(offsets.size()-1):
			var a := height_point(i, offsets[j]); var b := height_point(i, offsets[j+1])
			var c := height_point(i+5, offsets[j]); var d := height_point(i+5, offsets[j+1])
			triangle(terrain,a,b,c); triangle(terrain,b,d,c)
	var region := region_at(id*CHUNK)
	mesh_body(root,terrain,materials["sand" if region == 5 else ("green" if region == 0 else "terrain")],"sand" if region == 5 else "dirt")
	# Center markings and verge stones are instanced with distance culling.
	var marks: Array[Transform3D] = []
	for i in range(first+2,end,4):
		marks.append(Transform3D(basis_at(i*STEP), points[i]+Vector3.UP*0.03))
	var box := BoxMesh.new(); box.size = Vector3(0.12,0.035,3.0)
	instances(root,box,materials.gold,marks,450.0)
	var stones: Array[Transform3D] = []
	for i in range(first+1,end,4):
		for side in [-1.0,1.0]:
			stones.append(Transform3D(basis_at(i*STEP),points[i]+rights[i]*side*6.3+Vector3.UP*0.3))
	box = BoxMesh.new(); box.size = Vector3(0.25,0.6,0.4)
	instances(root,box,materials.stone,stones,300.0)
	# Local architecture: stacked stone houses, white trim and inset windows.
	for i in range(first+15,end,35):
		var side := -1.0 if i%2 == 0 else 1.0
		var center := height_point(i,side*24)
		for floor_id in range(2 + i%3):
			box_node(root,Vector3(6,2.8,5),center+Vector3(0,1.4+floor_id*2.9,0),materials.stone,true)
			box_node(root,Vector3(6.1,0.15,5.1),center+Vector3(0,2.8+floor_id*2.9,0),materials.gold,false)
			for wx in [-1.8,0.0,1.8]:
				box_node(root,Vector3(0.65,1.0,0.08),center+Vector3(wx,1.5+floor_id*2.9,2.55),materials.window,false)
	if region == 4:
		var sea := MeshInstance3D.new();var plane := PlaneMesh.new();plane.size=Vector2(900,900);plane.subdivide_width=24;plane.subdivide_depth=24
		sea.mesh=plane;sea.position=point_at(id*CHUNK+250)+Vector3(-480,-8,0)
		var water := ShaderMaterial.new();water.shader=load("res://assets/shaders/sea.gdshader");sea.material_override=water;root.add_child(sea)
	# Vegetation and natural rocks, deterministic at every sector boundary.
	var trunks: Array[Transform3D]=[];var crowns: Array[Transform3D]=[]
	for i in range(first+6,end,7):
		var lateral := (18.0+float(i%4)*12.0)*(-1.0 if i%2==0 else 1.0)
		var center := height_point(i,lateral)
		if region not in [1,5]:
			trunks.append(Transform3D(Basis.IDENTITY,center+Vector3.UP*2.0))
			crowns.append(Transform3D(Basis.IDENTITY.scaled(Vector3(1.0+(i%3)*0.2,1,1)),center+Vector3.UP*4.2))
		elif i%3==0:
			var rock := MeshInstance3D.new();var stone := SphereMesh.new();stone.radius=1.2+float(i%3);stone.height=stone.radius*1.4;stone.radial_segments=8;stone.rings=4
			rock.mesh=stone;rock.position=center;rock.material_override=materials.terrain;root.add_child(rock);rock.create_trimesh_collision();rock.visibility_range_end=400
	if not trunks.is_empty():
		var trunk := CylinderMesh.new();trunk.top_radius=0.16;trunk.bottom_radius=0.25;trunk.height=4;trunk.radial_segments=6
		instances(root,trunk,materials.stone,trunks,350)
		var crown := SphereMesh.new();crown.radius=2.2;crown.height=2.3;crown.radial_segments=8;crown.rings=4
		instances(root,crown,materials.green,crowns,350)
	# Drive-through tunnel portal with collidable roof and sides; clear width 11m.
	if id==6:
		for i in range(first+30,first+50,4):
			var frame := Node3D.new();root.add_child(frame);frame.position=points[i];frame.basis=basis_at(i*STEP)
			for side in [-1.0,1.0]: box_node(frame,Vector3(1.2,7,16),Vector3(side*6.2,3.5,0),materials.stone,true)
			box_node(frame,Vector3(13.5,1.2,16),Vector3(0,7.2,0),materials.stone,true)
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
		transform.basis=transform.basis.scaled(mi.mesh.size)
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
