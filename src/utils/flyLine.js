import * as THREE from 'three'
// 飞线
const createFlyLine = (start, end, size=6000) =>{
    start = new THREE.Vector3(start.x, start.y, start.z )
    end = new THREE.Vector3(end.x, end.y, end.z )
    const { curve, mesh } = addLines(start, end, size)
    return {flyPoint: flyLine(curve, size), flyLine: mesh}
}
// 曲线
const addLines = ( v0, v3 ) => {
    var path = new THREE.LineCurve3(v0, v3)
    var p = path.getPoints(120)
    var d = v0.distanceTo( v3 )/2
    var v1 = new THREE.Vector3( p[40].x, p[40].y, p[40].z  + d)
    var v2 = new THREE.Vector3( p[80].x, p[80].y, p[80].z  + d)

    // 绘制三维三次贝赛尔曲线
    var curve = new THREE.CubicBezierCurve3( v0, v1, v2, v3 );
    var geometry = new THREE.BufferGeometry();
    var points = curve.getPoints( 150 );
    var positions = [];
    var colors = [], index = [];
    var color = new THREE.Color();
    /**
     * HSL中使用渐变
     * h — hue value between 0.0 and 1.0
     * s — 饱和度 between 0.0 and 1.0
     * l — 亮度 between 0.0 and 1.0
     */
    for (var j = 0; j < points.length; j ++) {
        color.setHSL( .31666+j*0.005,0.7, 0.7); //绿色
        // color.setHSL( .81666+j*0.0025, 0.88, 0.88); //粉色
        colors.push( color.r, color.g, color.b );
        positions.push( points[j].x, points[j].y, points[j].z );
        index.push(j/(points.length - 1))
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('index', new THREE.Float32BufferAttribute(index, 1))
    var matLine = new THREE.LineBasicMaterial( {
        vertexColors: true,
        transparent: true
    } );
    return {
    curve,
    mesh: new THREE.Line( geometry, matLine )
    }
}
// 路径飞线
const flyLine = (curve, size) => {
var positions = [], index = [], current = [];
let points = curve.getPoints(5000)
const geometry = new THREE.BufferGeometry().setFromPoints(points)

for (var j = 0; j < points.length; j++) {
    positions.push( points[j].x, points[j].y, points[j].z );
    index.push(j/(points.length - 1))
    current.push(j)
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
geometry.setAttribute('index', new THREE.Float32BufferAttribute(index, 1))
geometry.setAttribute('current', new THREE.Float32BufferAttribute(current, 1))
const material = new THREE.ShaderMaterial({
    uniforms: {
    iTime: { value: 0.0 },
    size: { value: size },
    uRange: { value: 500 },
    uTotal: { value: points.length},
    uColor: { value: new THREE.Color(0xffffff) },
    uColor1: { value: new THREE.Color(0xff0000) }
    },
    transparent: true,
    depthTest: false,
    side: 2,
    vertexShader: `
    attribute float index;
    attribute float current;
    uniform float size;
    uniform vec3 uColor;
    uniform vec3 uColor1;
    uniform float uRange;
    uniform float uTotal;
    uniform float iTime;
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
        // 需要当前显示的索引  
        float showNumber = uTotal * mod(iTime/3.0, 1.0);
        float s = size;
        if (showNumber > current && showNumber < current + uRange) {
            vOpacity = 1.0;
            s *= (current + uRange - showNumber) / uRange;
        } else {
            vOpacity = 0.0;
            s = 0.0;
        }
        // 顶点着色器计算后的Position
        // mix 混淆颜色
        vColor = mix(uColor, uColor1, index);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition; 
        // 大小
        gl_PointSize = s* 5.0 / (-mvPosition.z);
    }`,
    fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uColor1;
    varying vec3 vColor; 
    varying float vOpacity; 
    void main() {
        gl_FragColor = vec4(vColor, vOpacity);
    }`
})
const mesh = new THREE.Points(geometry, material)
return mesh
}
export default createFlyLine
