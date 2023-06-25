import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls'
const { Object3DEvent } = require('@/utils/object3DEvent.js')
const Stats = require('three/examples/jsm/libs/stats.module.js').default
const { TWEEN } = require('three/examples/jsm/libs/tween.module.min.js')
interface SceneObj {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    hemLight: THREE.HemisphereLight;
    dirLight: THREE.DirectionalLight;
    controls: Controls
}
interface Options {
    animate?: Function,
    resize?: Function,
}
type Controls = OrbitControls | FirstPersonControls | FlyControls | TrackballControls | ArcballControls
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let hemLight: THREE.HemisphereLight;
let dirLight: THREE.DirectionalLight;
let controls: Controls
let animateId: number
let domElemnt: HTMLElement
let animateFunc: Function
let resizeFunc: Function
let clock = new THREE.Clock()
let objEvent: any
let stats: any
// 创建场景
const createScene = (el: HTMLElement, options?: Options): SceneObj => {
    if (options) {
        if (options.animate) animateFunc = options.animate;
        if (options.resize) resizeFunc = options.resize;
    }
    domElemnt = el
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        45,
        domElemnt.clientWidth / domElemnt.clientHeight,
        1,
        6371.393 * 2
    );
    objEvent = new Object3DEvent(domElemnt, scene, camera)
    renderer = new THREE.WebGL1Renderer({ 
        alpha: true,
        precision:"highp", 
        antialias: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    hemLight = new THREE.HemisphereLight(0x484848, 1.0);
    dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, -200, 300);
    camera.position.set(0, 50, 80);
    // const axesHelper = new THREE.AxesHelper(350);
    scene.add(hemLight, dirLight);
    controls = CreatrControls(camera, domElemnt);
    domElemnt.appendChild(renderer.domElement);
    initStats()
    resizeView()
    animate()
    return {
        scene,
        camera,
        renderer,
        hemLight,
        dirLight,
        controls
    }
}
// 设置控制器
type ContralParams = (TCamera: THREE.Camera, domElement: HTMLElement) => Controls
const CreatrControls: ContralParams = (TCamera, domElement) => {
    const controls = new OrbitControls(TCamera, domElement)
    return controls
}
function initStats() {
    stats = new Stats();
    stats.setMode(0)
    // stats.setMode(1)
    stats.domElement.style.position = 'absolute'; //绝对坐标  
    stats.domElement.style.left = '0px';// (0,0)px,左上角  
    stats.domElement.style.top = '0px';
    domElemnt.appendChild(stats.domElement);
}
// 更新视图
const updatedView = () => {
    let delta = clock.getDelta()
    controls.update(delta)
    TWEEN.update()
    stats.update();//这个函数真好用  
    renderer.render(scene, camera)
}
// 重置视图大小
const resizeView = () => {
    camera.aspect = domElemnt.clientWidth / domElemnt.clientHeight// 相机重置可视范围
    renderer.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    if (resizeFunc) resizeFunc()
}
//动画渲染
const animate = () => {
    updatedView()
    if (animateFunc) animateFunc()
    animateId = requestAnimationFrame(animate)
}
// 窗口变化
window.addEventListener('resize', resizeView)

const clear = (callback?: Function) => {
    scene.clear()
    renderer.dispose()
    objEvent.clear()
    cancelAnimationFrame(animateId)
    window.removeEventListener('resize', resizeView)
    if (callback) callback()
}

export {
    THREE,
    TWEEN,
    Stats,
    createScene,
    clear
}