extends Node
## WorldStreamingManager — يدير تحميل وتفريغ قطاعات العالم الثلاثين (15.0 كم) دون فقدان التصادم

const TOTAL_ROAD_LENGTH_M: float = 15000.0
const CHUNK_LENGTH_M: float = 500.0
const TOTAL_CHUNKS: int = 30
const ACTIVE_RADIUS_CHUNKS: int = 3

var active_chunk_id: int = 0
var loaded_chunks: Dictionary = {}

func update_player_distance(distance_m: float) -> void:
	var new_chunk: int = clampi(int(distance_m / CHUNK_LENGTH_M), 0, TOTAL_CHUNKS - 1)
	active_chunk_id = new_chunk
	for cid in range(TOTAL_CHUNKS):
		var should_be_active: bool = absi(cid - active_chunk_id) <= ACTIVE_RADIUS_CHUNKS
		loaded_chunks[cid] = should_be_active
