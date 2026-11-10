extends Node
## TrafficAIManager — يدير مركبات المرور غير التابعة للاعب باستخدام Object Pooling

const MAX_TRAFFIC_POOL: int = 18
var active_traffic_count: int = 12

func set_traffic_density_for_quality(quality: String) -> void:
	match quality:
		"low": active_traffic_count = 6
		"medium": active_traffic_count = 12
		"high": active_traffic_count = 18
