import * as THREE from "three";
import { CSS3DRenderer, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
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
    controls: Controls,
    css2Render: CSS2DRenderer,
    css3Render: CSS3DRenderer
}
interface Options {
    animate?: Function,
    resize?: Function,
}
type Position = {
    x: number,
    y: number,
    z: number
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
let css3Render:any
let css2Render:any
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
        0.1,
        6000
    );
    objEvent = new Object3DEvent(domElemnt, scene, camera)
    renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        precision:"highp", 
        antialias: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    hemLight = new THREE.HemisphereLight(0x484848, 1.0);
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, -300, 100);
    camera.position.set(0, 50, 80);
    // const axesHelper = new THREE.AxesHelper(350);
    scene.add(hemLight, dirLight);
    domElemnt.appendChild(renderer.domElement);
    initStats()
    init3dTextRender(domElemnt)
    controls = CreatrControls(camera, domElemnt);
    resizeView()
    animate()
    return {
        scene,
        camera,
        renderer,
        hemLight,
        dirLight,
        controls,
        css2Render,
        css3Render,
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
    css2Render.render(scene, camera)
    css3Render.render(scene, camera)
}
// 初始化文本渲染器
const init3dTextRender = (domElemnt:HTMLElement) => {
    css3Render = new CSS3DRenderer()
    css3Render.domElement.style.position = 'absolute'
    css3Render.domElement.style.zIndex = 2
    css3Render.domElement.style.top = 0
    css3Render.domElement.style.left = 0
    css3Render.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    domElemnt.appendChild(css3Render.domElement)

    css2Render = new CSS2DRenderer()
    css2Render.domElement.style.position = 'absolute'
    css2Render.domElement.style.zIndex = 10
    css2Render.domElement.style.top = 0
    css2Render.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    domElemnt.appendChild(css2Render.domElement)
  }
 // 设置地区文本
 const createText = (item:{name:string, position:Position}) => {
    const element = document.createElement('div')
    element.className = 'city-area'
    element.innerText = item.name
    const css3Text = new CSS3DSprite(element)
    const { x, y, z } = item.position
    css3Text.position.set(x, y, z)
    return css3Text
  }
// 重置视图大小
const resizeView = () => {
    camera.aspect = domElemnt.clientWidth / domElemnt.clientHeight// 相机重置可视范围
    renderer.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    css2Render.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    css3Render.setSize(domElemnt.clientWidth, domElemnt.clientHeight)
    renderer.sortObjects = true;
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
    CSS3DSprite,
    CSS2DObject,
    createScene,
    clear,
    createText
}