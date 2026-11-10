class_name RaycastVehicleBody
extends RigidBody3D
signal collided(loss: float)
var spec: Dictionary
var custom: Dictionary = {}
var visual: VehicleVisual
var rays: Array[RayCast3D] = []
var throttle_input := 0.0
var brake_input := 0.0
var steer_input := 0.0
var handbrake_active := false
var current_steer_rad := 0.0
var current_speed_kmh := 0.0
var current_surface := "asphalt"
var wet_grip := 1.0
var rpm := 800.0
var gear := 1
var automatic := true
var drivetrain := "4H"
var diff_lock := false
var assists := true
var hdc := false
var fuel := 85.0
var health := 100.0
var temperature := 80.0
var cargo_integrity := 100.0
var grounded := 0
var spin := 0.0
var shift_cooldown := 0.0
var suspension: float
var wheel_radius: float
var pending_transform := Transform3D.IDENTITY
var teleport_pending := false
func _ready() -> void:
	if spec.is_empty(): spec = VehicleFleetRegistry.get_spec("shahiq")
	mass = float(spec.baseMassKg)+float(spec.maxCargoKg)*float(custom.get("cargo",0.0))/100.0
	fuel = float(spec.fuelTankLiters)
	suspension = float(spec.suspensionRestLengthM)+float(custom.get("height",0.0))
	wheel_radius = float(spec.wheelRadiusM)
	drivetrain = spec.defaultDrivetrain
	center_of_mass_mode = CENTER_OF_MASS_MODE_CUSTOM
	center_of_mass = Vector3(0,float(spec.centerOfMassOffsetY),0)
	continuous_cd = true
	contact_monitor = true
	max_contacts_reported = 8
	linear_damp = 0.04
	angular_damp = 0.5
	var shape := CollisionShape3D.new(); var box := BoxShape3D.new()
	box.size = Vector3(float(spec.trackWidthM)*0.88,0.65,float(spec.wheelbaseM)+1.2)
	shape.shape=box;shape.position.y=0.35;add_child(shape)
	var cabin := CollisionShape3D.new();var cabin_box := BoxShape3D.new()
	var full_length := float(spec.wheelbaseM)+1.45
	var bus: bool=spec.id=="hafilat";var sedan: bool=spec.id in ["madina","barq"]
	var pickup: bool=spec.id in ["saqr","badiya","munqidh","jabal"]
	cabin_box.size=Vector3(float(spec.trackWidthM)*0.82,0.95 if bus else (0.40 if sedan else 0.58),full_length*(0.30 if pickup else 0.58))
	cabin.shape=cabin_box;cabin.position=Vector3(0,0.86 if bus else (0.45 if sedan else 0.64),-full_length*0.16 if pickup else full_length*0.03);add_child(cabin)
	visual=VehicleVisual.new(); add_child(visual); visual.build(spec,custom)
	for i in range(4):
		var ray := RayCast3D.new()
		ray.position=Vector3((-1.0 if i%2==0 else 1.0)*float(spec.trackWidthM)*0.5,0,(-1.0 if i<2 else 1.0)*float(spec.wheelbaseM)*0.5)
		ray.target_position=Vector3.DOWN*(suspension+wheel_radius)
		ray.add_exception(self); add_child(ray); rays.append(ray)
	body_entered.connect(_on_body_entered)
func teleport_to(destination: Transform3D) -> void:
	pending_transform=destination;teleport_pending=true;freeze=false;sleeping=false
	set_drive_inputs(0,1,0,false)
func _integrate_forces(state: PhysicsDirectBodyState3D) -> void:
	if not teleport_pending: return
	state.transform=pending_transform;state.linear_velocity=Vector3.ZERO;state.angular_velocity=Vector3.ZERO
	linear_velocity=Vector3.ZERO;angular_velocity=Vector3.ZERO;teleport_pending=false
	reset_physics_interpolation()
func set_drive_inputs(throttle: float, brake: float, steer: float, handbrake: bool) -> void:
	throttle_input=clampf(throttle,-1,1); brake_input=clampf(brake,0,1); steer_input=clampf(steer,-1,1); handbrake_active=handbrake
func shift(direction: int) -> void:
	gear=clampi(gear+direction,1,int(spec.forwardGearsCount)); shift_cooldown=0.3
func set_drivetrain_next() -> void:
	var modes: Array=spec.supportedDrivetrains
	drivetrain=modes[(modes.find(drivetrain)+1)%modes.size()]
func repair() -> void:
	health=100; fuel=float(spec.fuelTankLiters); temperature=80
func _on_body_entered(_body: Node) -> void:
	var loss := maxf(0.0,linear_velocity.length()-3.0)*1.8
	health=maxf(0,health-loss); cargo_integrity=maxf(0,cargo_integrity-loss*0.6); collided.emit(loss)
func _physics_process(delta: float) -> void:
	if teleport_pending: return
	var forward := -global_basis.z
	var speed := linear_velocity.dot(forward)
	current_speed_kmh = linear_velocity.length()*3.6
	shift_cooldown=maxf(0,shift_cooldown-delta)
	if throttle_input<0: gear=1
	var ratio := lerpf(3.6,0.75,float(gear-1)/maxf(1,float(spec.forwardGearsCount)-1))
	var low := 2.5 if drivetrain=="4L" else 1.0
	rpm=clampf(absf(speed)/wheel_radius*ratio*3.7*low*60/TAU+float(spec.idleRpm)*absf(throttle_input),float(spec.idleRpm),float(spec.redlineRpm))
	if automatic and shift_cooldown<=0 and throttle_input>=0:
		if rpm>float(spec.redlineRpm)*0.82 and gear<int(spec.forwardGearsCount): shift(1)
		elif rpm<float(spec.redlineRpm)*0.28 and gear>1: shift(-1)
	var steer_limit := float(spec.maxSteerAngleRad)/(1.0+absf(speed)*0.018)
	var target_steer := signf(steer_input)*pow(absf(steer_input),1.15)*steer_limit
	current_steer_rad=move_toward(current_steer_rad,target_steer,float(spec.steerSpeedRadPerSec)/(1.0+absf(speed)*0.025)*delta)
	spin -= speed/wheel_radius*delta
	grounded=0
	for i in range(4):
		var ray := rays[i]
		ray.rotation.y=-current_steer_rad if i<2 else 0.0
		ray.force_raycast_update()
		var length := suspension
		if ray.is_colliding():
			grounded+=1
			var hit := ray.get_collision_point()
			var normal := ray.get_collision_normal()
			length=clampf(ray.global_position.distance_to(hit)-wheel_radius,0,suspension)
			var offset := hit-global_position
			var velocity := linear_velocity+angular_velocity.cross(offset)
			var spring := maxf(0,(suspension-length)*float(spec.suspensionStiffness)-velocity.dot(normal)*float(spec.suspensionDamping))
			spring=minf(spring,mass*9.81*2.0)
			var collider := ray.get_collider()
			current_surface=str(collider.get_meta("surface_type","asphalt"))
			var mu: float={"asphalt":1.08,"dirt":0.78,"mud":0.52,"sand":0.58}.get(current_surface,0.7)
			var tire := str(custom.get("tire", spec.defaultTireType))
			if tire=="mud_rock" and current_surface in ["mud","dirt"]: mu*=1.25
			if tire=="sand_dune" and current_surface=="sand": mu*=1.4
			mu*=wet_grip
			var wheel_forward := -ray.global_basis.z.slide(normal).normalized()
			var wheel_right := wheel_forward.cross(normal).normalized()
			var driven := (i<2 if drivetrain=="FWD" else (i>=2 if drivetrain in ["2H","RWD"] else true))
			var torque_curve := 0.55+0.45*sin(clampf(rpm/float(spec.redlineRpm),0,1)*PI)
			var engine := throttle_input*float(spec.maxEngineTorqueNm)*torque_curve*ratio*3.7*low/wheel_radius*0.85
			engine *= float(custom.get("power",1.0))
			var long_force := engine/(2.0 if drivetrain in ["FWD","RWD","2H"] else 4.0) if driven and fuel>0 and health>0 and shift_cooldown<=0 else 0.0
			var braking := brake_input
			if hdc and absf(speed)>5: braking=maxf(braking,0.6)
			if handbrake_active and i>=2: braking=1
			var brake_force := -velocity.dot(wheel_forward)*mass/4.0/maxf(delta,0.001)
			var brake_share := 0.30 if i<2 else 0.20
			long_force += clampf(brake_force,-float(spec.maxBrakeForceN)*braking*brake_share,float(spec.maxBrakeForceN)*braking*brake_share)
			long_force -= speed*float(spec.rollingResistance)*0.025
			var lateral := -velocity.dot(wheel_right)*mass*2.5/4.0
			if handbrake_active and i>=2: lateral*=0.25
			if diff_lock: lateral*=1.1
			var limit := spring*mu
			if assists: long_force=clampf(long_force,-limit,limit)
			var tire_force := Vector2(long_force,lateral).limit_length(limit)
			apply_force(normal*spring+wheel_forward*tire_force.x+wheel_right*tire_force.y,offset)
		visual.update_wheel(i,ray.position,length,current_steer_rad,spin)
	if assists and grounded>=3:
		apply_torque(-global_basis.z*angular_velocity.dot(global_basis.z)*mass*0.6)
	apply_central_force(-linear_velocity*linear_velocity.length()*float(spec.dragCoefficient)*0.4)
	fuel=maxf(0,fuel-float(spec.baseFuelBurnLPerMin)/60.0*(0.15+absf(throttle_input))*delta)
	temperature=move_toward(temperature,78+25*absf(throttle_input),delta*0.1)
	visual.brake_material.emission=Color.RED*(2.0 if brake_input>0 else 0.1)
