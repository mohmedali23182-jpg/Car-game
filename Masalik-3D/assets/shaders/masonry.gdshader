shader_type spatial;
uniform vec4 base_color:source_color=vec4(0.49,0.43,0.34,1.0);
varying vec3 wp;
varying vec3 n;
void vertex(){wp=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;n=normalize((MODEL_NORMAL_MATRIX*NORMAL));}
void fragment(){
 vec2 p=abs(n.x)>0.6?wp.zy:wp.xy;
 float row=floor(p.y*3.2);
 vec2 cell=fract(vec2(p.x*1.6+mod(row,2.0)*0.5,p.y*3.2));
 float mortar=step(0.035,cell.x)*step(0.05,cell.y);
 float variation=fract(sin(dot(floor(p*vec2(1.6,3.2)),vec2(12.9898,78.233)))*43758.5453);
 ALBEDO=mix(vec3(0.24,0.22,0.19),base_color.rgb*(0.83+variation*0.24),mortar);
 ROUGHNESS=0.94;
}
