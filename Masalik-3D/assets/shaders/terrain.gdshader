shader_type spatial;
uniform vec4 base_color : source_color = vec4(0.5,0.4,0.3,1.0);
varying vec3 world_pos;
varying vec3 world_n;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void vertex() {world_n=normalize(MODEL_NORMAL_MATRIX*NORMAL);world_pos=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment() {
 float fine=noise(world_pos.xz*2.0)*0.5+noise(world_pos.xz*0.07)*0.5;
 float strata=sin(world_pos.y*2.1+sin(world_pos.x*0.1))*0.045;
 float rock=(1.0-smoothstep(0.52,0.86,abs(world_n.y)));
 float dry=noise(world_pos.xz*0.012)*0.35;
 vec3 earth=mix(base_color.rgb,vec3(0.36,0.31,0.24),max(rock,dry));
 ALBEDO=earth*(0.86+0.18*fine+strata);
 ROUGHNESS=0.95;
}
