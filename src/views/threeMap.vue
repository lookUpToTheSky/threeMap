<template>
  <div class="three-view">
    <div id="scene-view"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import { THREE, createScene, clear } from "@/utils/initScene";
import THREEMAP from "@/utils/three-map";
import {
  vertexShader,
  vertexShader1,
  circleSpreadShader,
  planeFragmentShader,
} from "@/utils/effect";
let map: THREEMAP;
let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
let hemLight: THREE.HemisphereLight;
let dirLight: THREE.DirectionalLight;
let controls;
let clock = new THREE.Clock();
let textureIcon = new THREE.TextureLoader().load("/source/icon.png");
// 加载
async function fetchJson(url: string) {
  const data = await fetch(url).then((res) => {
    return res.json();
  });
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
  const meshGroup: THREE.Group = new THREE.Group();
  data.features.forEach((item: any, index: number) => {
    item.geometry.coordinates.forEach((ele: any) => {
      const shape = new THREE.Shape();
      let borderLine:THREE.Vector3[] = [] 
      ele.forEach((val: any) => {
        val.forEach((p: any, i: number) => {
          var { x, y } = map.lngLatToXy(p[0], p[1]);
          i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
          borderLine.push(new THREE.Vector3(x, y, 0))
        });
      });
      const curveLine = addBorderLine(borderLine, 'orange')
      const Sgeo = new THREE.ShapeGeometry(shape);
      const meshPanle = new THREE.Mesh(
        Sgeo,
        new THREE.MeshPhongMaterial({
          side: 2,
          opacity: 1,
          transparent: false,
          color: "#5470c6",
        })
      );
      meshPanle.position.z = 0.01;
      const extrudeSettings = {
        depth: -0.5,
        bevelEnabled: true,
        bevelSegments: 32,
        steps: 1,
        bevelSize: 0,
        bevelThickness: 0,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide,
          color: "#00eeee",
        })
      );
      meshGroup.add(mesh, meshPanle, curveLine);
    });
  });
  meshGroup.on(
    "click",
    (group: THREE.Object3D, mesh: THREE.Object3D, point: THREE.Vector3) => {
      const { lng, lat } = map.xyToLngLat(point.x, -point.z);
      createIcon({ lng, lat });
      console.log(lng, lat);
    }
  );
  scene.add(meshGroup);
}
async function fetchAreaPos(url: string) {
  const data = await fetch(url).then((res) => {
    return res.json();
  });
  data.features.forEach((item: any) => {
    let position = item.properties.center;
    createCircle({ lng: position[0], lat: position[1] });
  });
}
//
function createIcon(point: { lng: number; lat: number }) {
  let icon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: textureIcon,
    })
  );
  var position = map.lngLatToXy(point.lng, point.lat);
  icon.position.set(position.x, position.y, 0.5);
  icon.scale.set(2, 2, 2);
  scene.add(icon);
}
function createPalne() {
  const planeGeo = new THREE.PlaneGeometry(150, 150, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      map: {
        value: new THREE.TextureLoader().load("/source/map@3x.png"),
      },
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
function createCircle(point: { lng: number; lat: number }) {
  const circleGeo = new THREE.CircleGeometry(1, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      color: { value: new THREE.Color(0xff0000) },
    },
    side: 2,
    transparent: true,
    vertexShader,
    fragmentShader: circleSpreadShader,
  });
  const circle = new THREE.Mesh(circleGeo, material);
  var position = map.lngLatToXy(point.lng, point.lat);
  circle.position.set(position.x, position.y, 0.02);
  scene.add(circle);
}
// 添加边框线
function addBorderLine(borderLine:THREE.Vector3[], color: string) {
  // const geometry = new THREE.BufferGeometry()
  // geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(borderLine), 3)
  // const material = new THREE.LineBasicMaterial({
  //   color
  // })
  // const line = new THREE.Line(geometry, material)
  const curvePath = new THREE.CurvePath()
  borderLine.forEach((p, i) => {
    if ((i + 1) % 2 === 0) {
      const line = new THREE.LineCurve3(borderLine[i - 1], borderLine[i])
      curvePath.curves.push(line)
    }
  })
  const geometry = new THREE.TubeGeometry(curvePath, borderLine.length, 0.08, 16, true)
  const material = new THREE.MeshBasicMaterial({
    color: color
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}
// 窗口变化
onMounted(() => {
  let mapView = document.querySelector("#scene-view") as HTMLElement;
  map = new THREEMAP([114.191, 22.638], [0, 0]);
  const res = createScene(mapView, {
    animate: () => {
      const elapsedTime = clock.getElapsedTime();
      if (scene) {
        scene.traverse((child) => {
          if (child.type === "Mesh") {
            if (child.material.uniforms) {
              child.material.uniforms.iTime.value = elapsedTime;
            }
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
  camera.position.set(0, 60, 80);
  scene.rotateX(-Math.PI / 2);
  controls.minDistance = 30;
  controls.maxDistance = 200;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  fetchJson("/source/szCity.json");
  fetchAreaPos("/source/area.json");
});
// 销毁实例
onUnmounted(() => {
  clear();
});
</script>

<style lang="less" scoped>
.three-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  #scene-view {
    width: 100%;
    height: 100%;
    background-color: #000;
    display: block;
    overflow: hidden;
  }
}
</style>