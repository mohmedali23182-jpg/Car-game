class_name MasalikMissions
extends Node
signal finished(success: bool, message: String)
var catalog: Dictionary
var active: Dictionary = {}
var elapsed := 0.0
var running := false
var previous_distance := 0.0
var direction := 1.0
func _ready() -> void:
	catalog=JSON.parse_string(FileAccess.get_file_as_string("res://data/missions/catalog.json"))
func start(mission: Dictionary) -> void:
	active=mission;elapsed=0;running=true
	direction=signf(float(active.finishDistanceM)-float(active.startDistanceM))
	previous_distance=float(active.startDistanceM)
func update(delta: float, distance: float, car: RaycastVehicleBody, lateral: float) -> void:
	if not running: return
	elapsed+=delta
	if car.health<=0 or car.cargo_integrity<float(active.get("minCargoIntegrityPct",0)):
		running=false;finished.emit(false,"فشلت المهمة — تضررت المركبة أو الحمولة");return
	# Finish only inside destination road corridor, crossing in the intended direction.
	var finish := float(active.finishDistanceM)
	if (distance-finish)*direction>=-12 and (previous_distance-finish)*direction<12 and lateral<12:
		complete(car)
	previous_distance=distance
func complete(car: RaycastVehicleBody) -> void:
	if not running: return
	running=false
	var d: Dictionary=PersistenceManager.save_data
	var first: bool = not d.completed.has(active.id)
	if first:
		d.coins+=int(active.rewardCoins);d.xp+=int(active.rewardXp)
	var previous: Dictionary=d.completed.get(active.id,{})
	d.completed[active.id]={"seconds":minf(elapsed,float(previous.get("seconds",INF))),"integrity":car.cargo_integrity,"vehicle":car.spec.id}
	PersistenceManager.save_data_atomic()
	finished.emit(true,"اكتملت المهمة! +%d عملة | الزمن %.1f ثانية" % [int(active.rewardCoins) if first else 0,elapsed])
