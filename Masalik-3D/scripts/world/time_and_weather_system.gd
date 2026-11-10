extends Node
## TimeAndWeatherSystem — يتحكم في إضاءة السماء والضباب ومعامل بلل الطريق

var current_time_preset: String = "morning"
var current_weather_preset: String = "clear"

func get_weather_friction_multiplier(surface: String) -> float:
	match current_weather_preset:
		"light_rain":
			return 0.78 if surface == "mud" else 0.88
		"heavy_rain":
			return 0.65 if surface == "mud" else 0.76
		"sandstorm":
			return 0.86 if surface == "sand" else 0.90
		_:
			return 1.0
