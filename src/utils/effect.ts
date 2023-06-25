/*
 * @Author: 1179373677@qq.com
 * @Date: 2022-06-27 16:07:15
 * @LastEditors: 1179373677@qq.com
 * @LastEditTime: 2022-07-01 15:09:41
 * @Description: 
 */
export const vertexShader: string = `
varying vec3 vPosition;
varying vec2 vUv;
void main() { 
    vUv = uv; 
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vPosition = position;
}`

export const vertexShader1: string = `
uniform float width;
uniform float height;
uniform float domWidth;
uniform float domHeight;

varying vec2 vUv;
 
void main() {
    vUv = uv;
    vec4 proj = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    gl_Position = vec4(
        proj.x / proj.w  + position.x * width / domWidth,
        proj.y / proj.w + position.y * height / domHeight,
        proj.z / proj.w,
        1.0
    );
}`
export const circleSpreadShader: string = `
    uniform float iTime; 
    varying vec2 vUv;       
    uniform vec3 color;  
    uniform float width;
    uniform float height;    
    void main(void) {
        float time = sin(fract(iTime / 2.5)) * 0.8 - 0.3;
        float d = length(vUv - vec2(0.5));
        vec3 f = (smoothstep(0.12, 0.1, d))*color;
        if(d < 0.28+time) {
            f += (smoothstep(0.0+time, 0.28+time, d))*0.5*color; 
        }else if(d < 0.3+time) {
            f += (smoothstep(0.3+time, 0.28+time, d))*0.5*color; 
        }
        if(d < 0.5+time ) {
            f += (smoothstep(0.0+time, 0.5+time, d))*0.08*color; 
        }
        vec3 colors = mix(f, color, color);
        gl_FragColor = vec4(colors, f.r+f.g+f.b);
    }`
export const planeFragmentShader: string = `
    uniform float iTime; 
    varying vec2 vUv; 
    uniform sampler2D map;
    void main(void) {
        vec4 mapcol = texture2D(map,vUv);
        if(mapcol.r < 0.5 && mapcol.r < 0.5 && mapcol.b < 0.5){
            mapcol.a = 0.0;
        }
        gl_FragColor = mapcol;
    }`