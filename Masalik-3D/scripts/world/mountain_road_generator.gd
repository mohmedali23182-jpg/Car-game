class_name MountainRoadGenerator
extends Node3D
## مولّد عالم «طريق القمم» الجبلي (2 كيلومتر) مع تطابق كامل بين المرئيات والتصادمات

@export var road_length_m: float = 2000.0
@export var sample_step_m: float = 2.0
@export var road_width_m: float = 9.6

var road_points: PackedVector3Array = PackedVector3Array()

func _ready() -> void:
	generate_mountain_pass()

func generate_mountain_pass() -> void:
	road_points.clear()
	var count: int = int(road_length_m / sample_step_m) + 1
	var x: float = 0.0
	var z: float = 0.0
	var heading: float = 0.0

	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

	for i in range(count):
		var s: float = float(i) * sample_step_m
		var curvature: float = 0.0045 * sin(s * 0.0085) + 0.0062 * sin(s * 0.019 + 0.7)
		heading += curvature * sample_step_m
		var y: float = s * 0.092 + 14.0 * sin(clampf((s - 850.0) / 360.0 * PI, 0.0, PI))
		road_points.append(Vector3(x, y, z))
		x += sin(heading) * sample_step_m
		z -= cos(heading) * sample_step_m

	for i in range(count - 1):
		var p0: Vector3 = road_points[i]
		var p1: Vector3 = road_points[i + 1]
		var tangent: Vector3 = (p1 - p0).normalized()
		var right: Vector3 = tangent.cross(Vector3.UP).normalized() * (road_width_m * 0.5)

		var v00 := p0 - right
		var v01 := p0 + right
		var v10 := p1 - right
		var v11 := p1 + right

		st.set_normal(Vector3.UP)
		st.add_vertex(v00)
		st.add_vertex(v01)
		st.add_vertex(v10)
		st.add_vertex(v01)
		st.add_vertex(v11)
		st.add_vertex(v10)

	var road_mesh: ArrayMesh = st.commit()
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = "SummitRoadMesh"
	mesh_instance.mesh = road_mesh
	add_child(mesh_instance)
	mesh_instance.create_trimesh_collision()
