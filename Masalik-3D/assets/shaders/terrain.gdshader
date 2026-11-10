shader_type spatial;
uniform vec4 base_color : source_color = vec4(0.5,0.4,0.3,1.0);
varying vec3 world_pos;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void vertex() {world_pos=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment() {
 float fine=hash(floor(world_pos.xz*8.0));
 float strata=sin(world_pos.y*2.1+sin(world_pos.x*0.1))*0.045;
 ALBEDO=base_color.rgb*(0.85+0.2*fine+strata);
 ROUGHNESS=0.95;
}
