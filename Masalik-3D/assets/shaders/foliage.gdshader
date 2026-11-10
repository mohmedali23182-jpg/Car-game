shader_type spatial;
render_mode cull_disabled;
varying vec3 wp;
void vertex(){wp=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;VERTEX.x+=sin(TIME*1.1+wp.x*0.2+wp.z*0.13)*max(VERTEX.y,0.0)*0.035;}
void fragment(){float variation=sin(wp.x*1.8+wp.y*2.3)*0.04;ALBEDO=vec3(0.22,0.29,0.13)+variation;ROUGHNESS=0.94;}
