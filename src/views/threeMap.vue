<template>
  <div class="three-view">
    <div id="scene-view"></div>
    <!-- <ControlUI v-if="loading" @changeItem="changeItem" class="controlUI"></ControlUI> -->
    <!-- 信息框 -->
    <div class="point-note" v-show="noteShow">
      <div class="trangle"></div>
      <div class="info-box">
        <div class="top-wrap" @click="routerInto">
          <div>
            <div class="point-note-title"></div>
            <div class="point-note-detail"></div>
          </div>
        </div>
        <ul class="info-content">
          <!-- <li v-for="item in showNodeData" :key="item.id">
            <span class="name">{{ item.displayName }}</span>
            <span class="value"
              >{{ item.dataValue }}<span class="unit">{{ item.dataUnit }}</span></span
            >
          </li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import { THREE, createScene, clear, TWEEN, CSS2DObject, createText } from "@/utils/initScene";
import THREEMAP from "@/utils/three-map";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { fetchJson } from '@/api/fetch'
import createFlyLine from "@/utils/flyLine"
import {
  vertexShader,
  vertexShader1,
  circleSpreadShader,
  planeFragmentShader,
  fragmentShader,
  gradientShader,
  gradientHeightShader
} from "@/utils/effect";
type objType = {
  adcode:number;
  level:string|number;
  center: number[],
  postion: object,
}
type Position = {
    x: number,
    y: number,
    z: number
}
type config = {level: string|number, moveY:number, position: {x: number, y: number, z: number}, depth:number, scale:number, size: number}
let ControlUI = defineAsyncComponent( () => import('../components/controlUI.vue'))
let map: THREEMAP;
let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
let css2Render;
let css3Render
let hemLight: THREE.HemisphereLight;
let dirLight: THREE.DirectionalLight;
let controls;
let activeProvice:Ref<any> = ref({
  adcode: 'china-aliyun',
  center: [116.405285, 39.904989],
  level: "country",
  postion: {x: 0, y: 700, z: 800}
})
let lastProvice:Ref<any> = ref({})
let noteShow:Ref<boolean> = ref(false)
let infoElement:HTMLElement
let activeItem:object = ref({})
let clock = new THREE.Clock();
let infoObj:CSS2DObject
let color = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];
let levelConfig:{country: config,province:config, 3:config} = {
  country: {level: 'country', moveY: 10, position: {x: 2, y: 100, z: 60}, depth: 10, scale: 0.5, size: 400},
  province: {level: 'province', moveY: 3, position: {x: 8, y: 100, z: 60}, depth: 2, scale: 0.1, size: 100},
  3: {level: 3, moveY: 1, position: {x: 8, y: 50, z: 60}, depth: 1, scale: 0.04, size: 30},
}
let loading:Ref<boolean> = ref(true)
// 飞线起点和终点列表
let flyLineStart:Position
// 加载
async function getMapData(url: string, layer:number) {
  const data:any = await fetchJson(url)
  if(!data) return
  let uvs:Array<number>=[]
  // 将Sgeo转换回Shape
  // const texture = new THREE.TextureLoader().load('/source/manshe_h.png');
  // const Bumptexture = new THREE.TextureLoader().load('/source/dem.png');
  // let Normaltexture = new THREE.TextureLoader().load('/source/normal.png');
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // const repeatX = 0.9;
  // const repeatY = 0.5;
  // texture.repeat.set(repeatX, repeatY);
  // const offsetX = (1 - repeatX)/2;
  // const offsetY = (1 - repeatY)/2 + 0.01;
  // texture.offset.set(offsetX, offsetY);

  const meshGroup: THREE.Group = new THREE.Group();
  let temp = data.features || data.geometries
  temp.forEach((item: any, index: number) => {
    let list:any = item.geometry || item
    let g = new THREE.Group()
    let minX = 9999, minY = 9999, maxX = -9999, maxY = -9999;
    list.coordinates.forEach((ele: any, i: number) => {
      const shape = new THREE.Shape();
      let borderLine:THREE.Vector3[] = [] 
      let borderLine2:number[] = [] 
      ele.forEach((val: any, idx:number) => {
        if(Array.isArray(val[0])) {
          val.forEach((p: any, i: number) => {
            var { x, y } = map.lngLatToXy(p[0], p[1]);
            i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
            borderLine.push(new THREE.Vector3(x, y, 0))
            borderLine2.push(x, y, 0)
            minX = minX < p[0] ? minX : p[0] 
            minY = minY < p[1] ? minY : p[1] 
            maxX = maxX > p[0] ? maxX : p[0] 
            maxY = maxY > p[1] ? maxY : p[1]
          });
        }else{
          var { x, y } = map.lngLatToXy(val[0], val[1]);
          idx === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
          borderLine.push(new THREE.Vector3(x, y, 0))
          borderLine2.push(x, y, 0)
          minX = minX < val[0] ? minX : val[0] 
          minY = minY < val[1] ? minY : val[1] 
          maxX = maxX > val[0] ? maxX : val[0] 
          maxY = maxY > val[1] ? maxY : val[1]
        }
      });
      // const curveLine = addBorderLine(borderLine, "#ffffff")
      const curveLine = addBorderLine2(borderLine)
      const Sgeo = new THREE.ShapeBufferGeometry(shape);
      uvs.push(...Sgeo.attributes.uv.array);
      const extrudeSettings = {
        depth: -levelConfig[activeProvice.value.level].depth,
        bevelEnabled: true,
        bevelSegments: 0,
        steps: 1,
        bevelSize: 0,
        bevelThickness: 0,
      };
      const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          uniforms: {
            iTime: { value: 0 },
            // color: { value: new THREE.Color(0x0077ff) },
            // color1: { value: new THREE.Color(0x00ffee) },
            lightPosition: { value: dirLight.position },
            color: { value: new THREE.Color(0xffffff) },
            color1: { value: new THREE.Color(0x1b2060) }
          },
          side: 1,
          vertexShader,
          depthTest: true,
          depthWrite: true,
          // blending: THREE.AdditiveBlending,
          fragmentShader: gradientHeightShader
        })
      );
      let center = item.properties.center
      g.userData = {
        ...item.properties, 
        center: center || activeProvice.value.center,
        adcode: item.properties.adcode || item.properties.id
      }
      g.add(mesh, curveLine)
      mesh.layers.set(layer);
      curveLine.layers.set(layer);
    });
    let center = item.properties.center
    if(center || activeProvice.value.level!='country') {
      center = item.properties.center || [minX + (maxX-minX)/2, minY + (maxY-minY)/2]
      g.userData.center = center
      let {x, y} = map.lngLatToXy(center[0], center[1]);
      let text = createText({name: item.properties.name, position: {x,y,z: 1} })
      let markCone = createPointGeo({
        color: new THREE.Color(0xff0000),
        position: {x, y,z: 1},
        rotation: {x: 3*Math.PI/2, y: 0, z: 0 },
        time: 1000
      })
      let s = levelConfig[activeProvice.value.level].scale
      text.scale.set(s, s, s)
      text.layers.set(layer);
      markCone.scale.set(s, s, s)
      markCone.layers.set(layer);
      if(index==0) {
        flyLineStart = {x,y,z: 0}
      }else{
        let {flyPoint, flyLine} = createFlyLine(flyLineStart, {x,y,z: -1}, levelConfig[activeProvice.value.level].size)
        flyPoint.layers.set(layer)
        flyLine.layers.set(layer)
        g.add(flyPoint, flyLine)
      } 
      g.add(markCone, text)
    }
   
    // 点击切换地图
    g.on('click', (group: THREE.Object3D, mesh: THREE.Object3D, point: THREE.Vector3) => {
      if(activeProvice.value.adcode == group.userData.adcode || activeProvice.value.level == 3) return
      lastProvice.value = {...activeProvice.value}
      activeProvice.value ={...group.userData}
      map.setCenter(group.userData.center[0], group.userData.center[1])
      changeItem()
    })
    // hover悬浮地图
    g.on('hover', (group: THREE.Object3D, mesh: THREE.Object3D, point: THREE.Vector3) => {
      new TWEEN.Tween(g.position).to({x: 0, y: 0, z: levelConfig[activeProvice.value.level].moveY}, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
      g.traverse((child) => {
        if (child.type === "Mesh") {
          if (child.material.uniforms) { 
            // child.material.uniforms.color.value = new THREE.Color(0xff0000)
            // child.material.uniforms.color1.value =  new THREE.Color(0xff00ff) 
            child.material.uniforms.color.value = new THREE.Color(0xffffff)
            child.material.uniforms.color1.value =  new THREE.Color(0x0077ff) 
          }
        }
      })
      addTextInfo(group.userData, layer)
    },(group: THREE.Object3D, mesh: THREE.Object3D, point: THREE.Vector3) => {
      new TWEEN.Tween(g.position).to({x: 0, y: 0, z: 0}, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .start()
      g.traverse((child) => {
        if (child.type === "Mesh") {
          if (child.material.uniforms) { 
            // child.material.uniforms.color.value = new THREE.Color(0x0077ff)
            // child.material.uniforms.color1.value =  new THREE.Color(0x00ffee) 
            child.material.uniforms.color.value = new THREE.Color(0xffffff)
            child.material.uniforms.color1.value =  new THREE.Color(0x1b2060)
          }
        }
      })
      addTextInfo(group.userData, layer)
    })
    meshGroup.add(g);
  });
  // uv归一化
  let minU = 999, minV = 999, maxU = -999, maxV = -999;
  for (let i = 0; i < uvs.length; i += 2) {
    const u = uvs[i], v = uvs[i+1];
    minU = Math.min(minU, u);
    minV = Math.min(minV, v); 
    maxU = Math.max(maxU, u);
    maxV = Math.max(maxV, v);
  }
  const rangeU = maxU - minU, rangeV = maxV - minV;
  meshGroup.name = 'Group_' + activeProvice.value.level
  meshGroup.traverse(mesh => {
      if(!mesh.isMesh) return 
      let geoUvs = mesh.geometry.attributes.uv.array
      for (let i = 0; i < geoUvs.length; i += 2) {
        geoUvs[i] = (geoUvs[i] - minU) / rangeU;
        geoUvs[i+1] = (geoUvs[i+1] - minV) / rangeV;
      }
  })
  meshGroup.on(
    "click",
    (group: THREE.Object3D, mesh: THREE.Object3D, point: THREE.Vector3) => {
      const { lng, lat } = map.xyToLngLat(point.x, -point.z);
      // createIcon({ lng, lat }, g);
      // createCircle({ lng, lat }, color[Math.floor(Math.random()*10)], mesh)
      // console.log(lng, lat);
    }
  );
  scene.add(meshGroup);
  return meshGroup
}
const createPointGeo = (item:any) => {
  const { color, time, position, rotation } = item
  // 八面体
  const eightGeo = new THREE.ConeGeometry( 5, 10, 4, 1, true)
  let material = new THREE.MeshBasicMaterial({
        color: color,
        side: 1,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        wireframe: false
  })
  let mesh = new THREE.Mesh(eightGeo, material)
  mesh.position.copy(position);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z)
  let T1 = new TWEEN.Tween(mesh.position).to({ z: levelConfig[activeProvice.value.level].moveY }, time)
  let T2 = new TWEEN.Tween(mesh.position).to({ z: levelConfig[activeProvice.value.level].moveY * 3/2 }, time)
  T1.start()
  T1.chain(T2)
  T2.chain(T1)
  
  let T3 = new TWEEN.Tween(mesh.rotation).to({ y: Math.PI*2 }, time*5)
  let T4 = new TWEEN.Tween(mesh.rotation).to({ y: 0 }, time*5)
  T3.start()
  T3.chain(T4)
  T4.chain(T3)
  return mesh
}
// 添加信息text
const addTextInfo = (item:any, layer:number) => {
  // 提示文本创建if(infoObj!== null)
  if (infoObj !== null) {
    scene.remove(infoObj)
  }
  if (item.adcode == activeItem.value.adcode && noteShow.value) {
    noteShow.value = false
    activeItem.value = {}
    return false
  } else {
    noteShow.value = true
    activeItem.value = item
  }
  infoElement.querySelector('.point-note-title').innerText = item.name
  infoElement.querySelector('.point-note-detail').innerText = item.adcode
  infoObj = new CSS2DObject(infoElement)
  const { x, y } = map.lngLatToXy(item.center[0], item.center[1])
  infoObj.position.set(x, y, 0)
  infoObj.layers.set(layer)
  scene.add(infoObj)
}
async function fetchAreaPos(url: string) {
  const data = await fetch(url).then((res) => {
    return res.json();
  });
  data.features.forEach((item: any, index:number) => {
    let position = item.properties.center;
    createCircle({ lng: position[0], lat: position[1] }, color[index], scene);
  });
}
//
function createIcon(point: { lng: number; lat: number }) {
  let icon = new THREE.Sprite(
    new THREE.SpriteMaterial()
  );
  var position = map.lngLatToXy(point.lng, point.lat);
  icon.position.set(position.x, position.y, 0.5);
  icon.scale.set(0.5, 0.5, 0.5);
  scene.add(icon);
}
function createPalne() {
  const planeGeo = new THREE.PlaneGeometry(150, 150, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 }
    },
    side: 2,
    transparent: true,
    vertexShader,
    fragmentShader: planeFragmentShader,
  });
  const plane = new THREE.Mesh(planeGeo, material);
  plane.position.set(0, 0, 0);
  scene.add(plane);
}
function createCircle(point: { lng: number; lat: number }, color:string, g:THREE.Object3D) {
  const circleGeo = new THREE.CircleGeometry(20, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      color: { value: new THREE.Color(color || 0xff0000) },
    },
    side: 2,
    transparent: true,
    vertexShader,
    depthTest: false,
    fragmentShader: circleSpreadShader,
  });
  const circle = new THREE.Mesh(circleGeo, material);
  var position = map.lngLatToXy(point.lng, point.lat);
  circle.position.set(position.x, position.y, 1);
  g.add(circle);
}
// 添加边框线
function addBorderLine(borderLine:THREE.Vector3[], color: string) {
  const curvePath = new THREE.CurvePath()
  borderLine.forEach((p, i) => {
    if ((i + 1) % 2 === 0) {
      const line = new THREE.LineCurve3(borderLine[i - 1], borderLine[i])
      curvePath.curves.push(line)
    }
  })
  const geometry = new THREE.TubeGeometry(curvePath, borderLine.length, 2, 32, true)
  const material = new THREE.MeshBasicMaterial({
    depthTest: false,
    depthWrite: false,
    color: color
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}
function addBorderLine2(data:any) {
  var geometry = new THREE.BufferGeometry().setFromPoints( data );
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 1,
    transparent: false,
    depthTest: false,
    depthWrite: false
  });
  var line = new THREE.Line(geometry, lineMaterial);
  return line
}
const changeItem = async () => {
  let item:objType = activeProvice.value
  let basePath:string
  let layer = 0
  camera.position.set(0,700,800)
  switch(item.level) {
    case 'country': basePath = './source/map/'; layer = 0;
      break;
    case 'province': basePath = './source/map/province/';layer = 1;
      break;
    case 3: basePath = './source/map/city/'; layer = 2;
      break;
  }
  camera.layers.set(layer)
  let object:THREE.Group = scene.getObjectByName('Group_'+item.level)
  if(object && item.level=='country') {
    let pos:{x: number,y: number,z: number } = levelConfig[activeProvice.value.level].position
    let postion = item.postion || {
      x: object.position.x + pos.x,
      y: object.position.y + pos.y,
      z: object.position.z + pos.z
    }
    new TWEEN.Tween(camera.position).to(postion, 500)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
  }else{
    let lastObj = scene.getObjectByName('Group_'+activeProvice.value.level)
    lastObj?.traverse(obj => {
      if(obj.isCSS3DObject) {
        obj.parent.remove(obj)
      }
    })
    scene.remove(object)
    object = await getMapData(`${basePath}${item.adcode}.json`, layer);
    let pos:{x: number,y: number,z: number } = levelConfig[activeProvice.value.level].position
    let postion = item.postion || {
      x: object.position.x + pos.x,
      y: object.position.y + pos.y,
      z: object.position.z + pos.z
    }
    new TWEEN.Tween(camera.position).to(postion, 500)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
  }
}
const goHome = () => {
  if(activeProvice.value.adcode == 'china-aliyun') return
  let object = scene.getObjectByName('Group_'+activeProvice.value.level)
  object?.traverse(obj => {
    if(obj.isCSS3DObject) {
      obj.parent.remove(obj)
    }
  })
  scene.remove(object)
  activeProvice.value = {...lastProvice.value}
  lastProvice.value = {
    adcode: 'china-aliyun',
    center: [116.405285, 39.904989],
    level: "country",
    postion: {x: 0, y: 700, z: 800}
  }
  map.setCenter(activeProvice.value.center[0], activeProvice.value.center[1])
  changeItem()
}
// 窗口变化
onMounted(() => {
  let mapView = document.querySelector("#scene-view") as HTMLElement;
  map = new THREEMAP([116.405285, 39.904989], [0, 0])
  const res = createScene(mapView, {
    animate: () => {
      const elapsedTime = clock.getElapsedTime();
      if(scene) {
        scene.traverse((child) => {
          if (child.material && child.material.uniforms) {
            child.material.uniforms.iTime.value = elapsedTime;
          }
        });
      }
    },
  });
  scene = res.scene;
  camera = res.camera;
  renderer = res.renderer;
  hemLight = res.hemLight;
  dirLight = res.dirLight;
  controls = res.controls;
  css2Render = res.css2Render;
  css3Render = res.css3Render;
  camera.position.set(0, 700, 800);
  camera.layers.set(0)
  scene.rotateX(-Math.PI / 2); //坐标系发生改变
  controls.minDistance = 5;
  controls.maxDistance = 6371.393;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.3;
  getMapData("./source/map/china-aliyun.json", 0);
  window.addEventListener('dblclick', goHome)
  // 信息文本
  infoElement = document.querySelector('.point-note')
});
// 销毁实例
onUnmounted(() => {
  window.removeEventListener('dblclick', goHome)
  clear();
});
</script>

<style lang="less" scoped>
.three-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  #scene-view {
    width: 100%;
    height: 100%;
    background: url('~@/assets/image/bg.png'), radial-gradient(circle, rgb(27, 53, 106) 5%, #000 76%);
    display: block;
    overflow: hidden;
  }
  .controlUI {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 199;
    color: #eee;
  }
}
</style>
<style lang="less">
@activeColor: #4ff5e4;
.city-area {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(233, 212, 212);
  background-image: linear-gradient(-180deg, rgba(10, 212, 243, 0.1), rgb(0, 0, 13, 0.8) 90%);
  border: 1px solid #eee;
  font-size: 12px;
  padding: 0 3px;
  border-radius: 2px;
  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #00ff00;
    border-radius: 50%;
    margin-right: 3px;
  }
}
.point-note {
  text-align: start;
  position: relative;
  line-height: 16px;
  color: @activeColor;
  .trangle {
    position: absolute;
    left: calc(50% + 1px);
    top: 50%;
    transform: translate(-50%, -100%) rotateZ(8deg);
    width: 8px;
    height: 8px;
    border-top: 10px solid @activeColor;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    opacity: 0;
    animation: my_fadeInleft 0.1s ease-in forwards;
  }
  &::after {
    content: '';
    display: block;
    width: 0px;
    height: 1.5px;
    background: @activeColor;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: rotateZ(-80deg);
    transform-origin: left center;
    animation: my_widthShow1 0.2s linear 0.1s forwards;
    @keyframes my_widthShow1 {
      from {
        width: 0;
      }
      to {
        width: 80px;
      }
    }
  }
  &::before {
    content: '';
    display: block;
    width: 0px;
    height: 1.5px;
    background: @activeColor;
    position: absolute;
    transform: rotateZ(-5deg);
    transform-origin: left center;
    left: calc(50% + 13.1px);
    top: calc(50% - 79px);
    animation: my_widthShow2 0.2s linear 0.3s forwards;
    @keyframes my_widthShow2 {
      from {
        width: 0;
      }
      to {
        width: 20px;
      }
    }
  }
  .info-box {
    width: 290px;
    position: absolute;
    top: 50%;
    left: calc(50% + 33px);
    transform: translateY(calc(-50% - 79px));
    padding: 10px 15px 0px 15px;
    background: rgba(16, 16, 15, 0.7);
    border-left: 5px solid @activeColor;
    // border-right: 2px solid @activeColor;
    opacity: 0;
    animation: my_fadeInleft 0.3s ease-in 0.5s forwards;
    @keyframes my_fadeInleft {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    &::before {
      content: '';
      display: block;
      width: calc(100% + 4px);
      height: 10px;
      background-size: 100% 100%;
      position: absolute;
      top: -9.7px;
      left: -2px;
    }
    &::after {
      content: '';
      display: block;
      width: calc(100% + 4px);
      height: 10px;
      background-size: 100% 100%;
      position: absolute;
      bottom: -9.8px;
      left: -2px;
    }
    .top-wrap {
      display: flex;
      align-items: center;
      border-bottom: 1px solid @activeColor;
      margin-bottom: 10px;
      padding: 2px;
      position: relative;
      .type-icon {
        width: 36px;
        height: 36px;
        text-align: center;
        line-height: 36px;
        margin-top: -5px;
        margin-right: 12px;
        background-color: @activeColor;
        color: @activeColor;
        border-radius: 50%;
      }
      .head-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .point-note-title {
        width: 190px;
        font-family: 'zuiguan';
        font-size: 14px;
        line-height: 22px;
        color: @activeColor;
      }
      .point-note-detail {
        width: 190px;
        font-size: 12px;
        color: @activeColor;
        margin-bottom: 8px;
      }
      .right-icon {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
    .info-content {
      color: #fff;
      width: 100%;
      li {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'zuiguan';
        line-height: 24px;
        .name {
          font-size: 12px;
        }
        .value {
          font-size: 14px;
        }
        .unit {
          font-size: 12px;
          transform: scale(0.8);
          color: #aaaaaa;
          display: inline-block;
          width: 50px;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>