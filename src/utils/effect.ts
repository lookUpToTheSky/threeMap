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
varying vec3 vNormal;
varying vec3 vViewPosition;
void main() { 
    vUv = uv; 
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
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

export const fragmentShader: string = `
    uniform float iTime; 
    varying vec2 vUv;  
    uniform vec3 color;
    vec3 hsb2rgb(in vec3 c)
    {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                6.0)-3.0)-1.0,
        0.0,
        1.0 );
        rgb = rgb*rgb*(3.0-2.0*rgb);
        return c.z * mix( vec3(1.0), rgb, c.y);
    }

    void main(void) {
        // float time = iTime*1.;
        vec2 uv = (vUv - 0.5) * 2.0;
        float r = length(uv) * 1.8;
        vec3 opacity = hsb2rgb(vec3(0.24, 0.7, 0.4));
        
        float a = pow(r, 2.0);
        float b = sin(r * 0.8 - 1.6);
        float c = sin(r - 0.010);
        float s = sin(a - iTime * 3.0 + b) * r;
        
        opacity *= abs(1.0 / (s * 10.8)) - 0.01;
        gl_FragColor = vec4(color, opacity.x);
    }`
    export const gradientShader: string = `
        uniform float iTime;
        uniform vec3 color;
        uniform vec3 color1;
        varying vec2 vUv;

        void main()
        {
            float d = mod(-vUv.y + vUv.x * 0.5 - iTime*0.2, 1.0) - 0.55;
            vec3 vColor = mix(color, color1, d);
            gl_FragColor = vec4(vColor, 1.0);
        }`
    export const gradientHeightShader: string = `
        uniform float iTime;
        uniform vec3 color;
        uniform vec3 color1;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 lightPosition;
        vec3 HeightGradient(float d) {
                float indexMix = abs(vPosition.z / 10.0);
                vec3 lightColor = vec3(1.0, 1.0, 1.0);
                float t = fract(iTime*0.5);
                if(indexMix < (t + 0.1)) {
                    lightColor = mix(color, color1, indexMix+d);
                }
                if(indexMix > (t + 0.25)) {
                    lightColor = mix(color, color1, indexMix+d);
                }
                if(indexMix>0.95 && indexMix<1.0) {
                    lightColor = vec3(0.0, 1.0, 1.0);
                }
                return lightColor;
        }
        void main()
        {
            float d = mod(-vUv.y*vUv.x, 1.0);

            vec3 lightDirection = normalize(lightPosition - vViewPosition); // 光照方向
            // 计算漫反射
            float diffuse = max(dot(vNormal, lightDirection), 0.0);
            
            // 计算镜面反射
            vec3 viewDirection = normalize(vViewPosition);
            vec3 reflectDirection = reflect(-lightDirection, vNormal);
            float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 16.0);

            // 计算最终颜色
            vec3 color = HeightGradient(d); // 物体颜色
            vec3 ambient = vec3(0.2); // 环境光照强度
            vec3 diffuseColor = color * diffuse;
            vec3 specularColor = vec3(1.0) * specular;
            vec3 finalColor = ambient + diffuseColor + specularColor;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }`

    