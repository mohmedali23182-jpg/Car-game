shader_type spatial;
uniform float wetness:hint_range(0.0,1.0)=0.0;
varying vec3 world_pos;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void vertex(){world_pos=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}
void fragment(){
 vec2 p=world_pos.xz;
 float grain=hash(floor(p*35.0));
 float patch=step(0.78,hash(floor(p/7.0)))*0.018;
 float crack=pow(1.0-abs(sin(p.x*0.27+sin(p.y*0.12)*1.8)),80.0)*0.035;
 ALBEDO=vec3(0.14,0.15,0.15)+(grain-0.5)*0.036-patch-crack;
 ALBEDO*=mix(1.0,0.6,wetness);
 ROUGHNESS=mix(0.91,0.30,wetness);
}
