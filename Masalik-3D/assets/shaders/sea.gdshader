shader_type spatial;
varying vec3 wp;
void vertex() {
 wp=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;
 VERTEX.y+=sin(wp.x*0.08+TIME)*0.2+cos(wp.z*0.12+TIME*0.7)*0.15;
}
void fragment() {
 float ripples=sin(wp.x*0.2+wp.z*0.12+TIME*2.0)*0.08;
 ALBEDO=vec3(0.06,0.3,0.4)+ripples;
 METALLIC=0.3;ROUGHNESS=0.25;
}
