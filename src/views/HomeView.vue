<template>
  <div class="three-view">
    <a-button type="primary" @click="onSave">保存 </a-button>
    <div id="map_container"></div>
  </div>
</template>

<script lang="ts" setup>
// import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { onMounted, onUnmounted } from "vue";
import { THREE, createScene, clear } from '@/utils/initScene'
import {
  initMap,
  snowStyle,
  darkStyle,
  purpleStyle,
  whiteStyle,
  Customstyle,
} from "@/utils/map-common";
import {
  vertexShader,
  vertexShader1,
  circleSpreadShader,
  planeFragmentShader,
} from "@/utils/effect";
import { Sprite } from "three";
declare const BMapGL: any;
declare const mapvgl: any;
let map: any;
let threeLayer: any;
let clock = new THREE.Clock();
let circle: THREE.Mesh;
let shaderList: THREE.Mesh[] = [];
let pointList: number[][] = [
  [116.462928, 39.914272],
  [116.4817928, 39.924472],
  [116.412928, 39.934672],
  [116.476928, 39.943972],
  [116.422928, 39.954972],
  [116.433928, 39.964972],
  [116.382928, 39.924972],
  [116.373928, 39.914972],
];
let lineLayer: any;
let lineData: {
    geometry: {
        type: string;
        coordinates: [number, number][];
    };
}[] = [{"geometry":{"type":"LineString","coordinates":[[12713154.89058,2570504.87958],[12712123.53257,2570555.10933],[12712126.16105,2570583.99638],[12712101.05665,2570585.03644],[12712080.45876,2570543.88341],[12712026.24915,2570539.8182],[12712005.97697,2570558.18286],[12711898.50972,2570567.43429],[12711628.10468,2570604.01529],[12711423.32703,2570683.34136],[12711073.65152,2570802.14889],[12710900.53766,2570835.07175],[12710743.37044,2570844.68944],[12710661.27093,2570832.30534],[12710574.95743,2570832.30534],[12710463.39776,2570828.18666],[12710361.76165,2570824.07264],[12710309.71217,2570813.80795],[12710255.39186,2570830.24542],[12710199.87347,2570836.42869],[12710088.40792,2570867.50352],[12710176.35999,2571055.29318],[12710178.21279,2571119.31109],[12710255.73323,2571239.9237],[12710480.58107,2571590.54919],[12710697.16662,2571943.58907],[12710325.26309,2572149.83882],[12710368.59035,2572557.42424],[12710437.4533,2572829.33123],[12710692.13474,2572674.54965],[12710707.66487,2572729.45251],[12710803.9785,2572889.15327],[12710826.79944,2572969.33585],[12710794.0301,2572981.05844],[12710773.66237,2573007.09101],[12710767.35503,2573032.25669],[12710826.83717,2573023.83343],[12710881.71128,2573013.05459],[12710885.87417,2573058.95863],[12710905.78273,2573078.59923],[12710928.11919,2573179.05872],[12711143.69068,2573185.89057],[12711144.70671,2573131.6766],[12711217.00892,2573131.6766],[12711243.26281,2573172.24271],[12711243.39739,2573235.90086],[12711314.0712,2573397.70758],[12711348.25782,2573446.96904],[12711352.56324,2573495.77462],[12711542.81593,2573479.78432],[12711597.56957,2573568.9036],[12712089.60369,2573530.68951],[12712172.49014,2573607.28095],[12712334.1552,2573585.6384],[12712395.71385,2573423.02302],[12712463.18773,2573417.65038],[12712468.64261,2573499.51485],[12712628.0664,2573503.68098],[12712564.68592,2573445.99072],[12712558.73824,2573377.73297],[12712539.88719,2573307.51992],[12712583.9721,2573302.40075],[12712574.44183,2573268.13466],[12712537.71756,2573266.87511],[12712548.75462,2572928.8263],[12712579.96306,2572925.10346],[12712584.67084,2572863.9585],[12712614.2791,2572862.75271],[12712614.65421,2572918.91251],[12712696.86077,2572931.31165],[12712724.8411,2572913.97212],[12712709.70776,2572874.84045],[12712822.17106,2572868.78828],[12712831.00155,2572906.58208],[12712875.08444,2572904.12419],[12712890.28768,2572886.99489],[12712933.31803,2572888.21402],[12712925.07016,2572841.16109],[12712907.40639,2572768.38716],[12713095.39961,2572732.93724],[12713016.68945,2572526.07825],[12712981.84246,2572276.08606],[12713024.73096,2572328.97597],[12713053.24415,2572317.5088],[12713074.89954,2572332.81482],[12713318.07821,2572316.3155],[12713425.79755,2572317.68435],[12713487.82709,2572404.52369],[12713539.59569,2572402.65294],[12713598.91788,2572497.45391],[12713679.79636,2572452.96737],[12713728.60095,2572422.14227],[12713818.71501,2572401.49711],[12714363.15429,2572376.10488],[12714087.32826,2571730.9379],[12713832.31816,2571275.3095],[12713637.93139,2571090.77649],[12713491.21396,2571001.33668],[12713342.48889,2570876.54106],[12713212.09019,2570660.77712],[12713159.09482,2570507.00815]]}}]
var projection = mapvgl.MercatorProjection;
var point1 = projection.convertLL2MC(new BMapGL.Point(114.191, 22.638));
console.log(point1)
let mapView = document.querySelector("#map_container")
let textureIcon = new THREE.TextureLoader().load("/source/human.png");
// 创建box
const createBox = () => {
  // 坐标装换
  const circleGeo = new THREE.CircleGeometry(50, 64);
  circle = new THREE.Mesh(
    circleGeo,
    new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) },
        width: { value: 0.5 },
        height: {
          value: 0.5,
        },
        domWidth: {
          value: mapView?.clientWidth,
        },
        domHeight: {
          value: mapView?.clientHeight,
        },
      },
      side: 2,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      vertexShader: vertexShader,
      blending: THREE.AdditiveBlending,
      fragmentShader: circleSpreadShader,
    })
  );
  let boxGeo = new THREE.BoxGeometry(50, 50, 200, 8);
  let boxMesh = new THREE.Mesh(
    boxGeo,
    new THREE.MeshBasicMaterial({
      color: 0x41dd9c,
      wireframe: true,
      transparent: false,
    })
  );
  pointList.forEach((v) => {
    var point = projection.convertLL2MC(new BMapGL.Point(v[0], v[1]));
    let newMesh = circle.clone();
    let cloneBoxMesh = boxMesh.clone();
    newMesh.position.set(point.lng, point.lat, 201);
    cloneBoxMesh.position.set(point.lng, point.lat, 100);
    threeLayer.add(newMesh);
    threeLayer.add(cloneBoxMesh);
    shaderList.push(newMesh);
  });
};
function createArea() {
  const shape = new THREE.Shape();
  const lineList:number[] = []
  lineData[0].geometry.coordinates.forEach((item, i) => {
    var { lng, lat } = projection.convertLL2MC(
      new BMapGL.Point(item[0], item[1])
    );
    const x = lng;
    const y = lat;
    lineList.push(x,y,205)
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  })
  let line = addLine(lineList, 0x6DD0FF)
  threeLayer.add(line)
  const Sgeo = new THREE.ShapeGeometry(shape);
  const topMesh = new THREE.Mesh(
    Sgeo,
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: "#0644BA"
    })
  );
  topMesh.position.z = 204
  threeLayer.add(topMesh);

  const extrudeSettings = { depth: 200, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
  const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: "#3666CE"
    })
  );
  threeLayer.add(mesh);

  const extrudeSettings1 = { depth: 60, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
  const geometry1 = new THREE.ExtrudeGeometry( shape, extrudeSettings1 );
  const mesh1 = new THREE.Mesh(
    geometry1,
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: "#E8FBFF"
    })
  );
  mesh1.position.z = -60
  threeLayer.add(mesh1);
}

function addLine(borderLine:any, color:any) {
    const geometry = new LineGeometry()
    geometry.setPositions(borderLine)
    const material = new LineMaterial({
      color,
      linewidth: 0.005
    })
    const line = new Line2(geometry, material)
    line.computeLineDistances()
    return line
}
function createPalne() {
  let center = [114.19, 22.63];
  const planeGeo = new THREE.PlaneGeometry(15000, 15000, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      map: {
        value: new THREE.TextureLoader().load("/source/map@3x.png"),
      },
    },
    side: 2,
    transparent: false,
    vertexShader,
    fragmentShader: planeFragmentShader,
  });
  var point = projection.convertLL2MC(new BMapGL.Point(center[0], center[1]));
  const plane = new THREE.Mesh(planeGeo, material);
  plane.position.set(point.lng, point.lat, 126);
  threeLayer.add(plane);
}
function onSave() {
    console.log(JSON.stringify(lineData))
}
const setLayer = () => {
  var view = new mapvgl.View({
    // effects: [
    //   new mapvgl.BrightEffect({
    //     threshold: 0.2,
    //     blurSize: 0.1,
    //     clarity: 0.1,
    //   }),
    // ],
    map: map,
  });
  // 创建 three.js 图层
  threeLayer = new mapvgl.ThreeLayer();
  view.addLayer(threeLayer);

  lineLayer = new mapvgl.FlyLineLayer({
    speed: 6,
    color: "rgb(0,220,220)",
    textureColor: function (data: any) {
      return "#56ccdd";
    },
    textureWidth: 3,
    textureLength: 10,
  });
  view.addLayer(lineLayer);
  // lineLayer.setData(lineData);
  // const light = new THREE.HemisphereLight( 0x404040, 1 );
  // threeLayer.add( light );
};

// 加载
async function fetchJson(url: string) {
  const data = await fetch(url).then((res) => {
    return res.json();
  });
  let color = [
    "#ffddcc",
    "#ccadda",
    "#addaca",
    "#12dda3",
    "#dd283d",
    "#ddffdc",
    "#dadccd",
  ];
  const meshGroup: THREE.Group = new THREE.Group();
  data.features.forEach((item: any, index: number) => {
    item.geometry.coordinates.forEach((ele: any) => {
      const shape = new THREE.Shape();
      const borderLine: number[] = [];
      ele.forEach((val: any) => {
        val.forEach((p: any, i: number) => {
          var { lng, lat } = projection.convertLL2MC(
            new BMapGL.Point(p[0], p[1])
          );
          const x = lng;
          const y = lat;
          i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
          borderLine.push(x, y, 0);
        });
      });
      // const curveLine = this.addBorderLine(borderLine, 0xffffff);
      const Sgeo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(
        Sgeo,
        new THREE.MeshBasicMaterial({
          color: color[index],
          depthWrite: true,
          depthTest: false,
          transparent: true,
          // opacity: 0.5,
        })
      );
      meshGroup.add(mesh);
    });
  });
  threeLayer.add(meshGroup);
}
function createIcon(point: { lng: number; lat: number }) {
  let icon = new Sprite(
    new THREE.SpriteMaterial({
      map: textureIcon,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
  );
  var position = projection.convertLL2MC(
    new BMapGL.Point(point.lng, point.lat)
  );
  icon.position.set(position.lng, position.lat, 0);
  icon.scale.set(150, 150, 150);
  threeLayer.add(icon);
}
async function fetchAreaPos(url: string) {
  const data = await fetch(url).then((res) => {
    return res.json();
  });
  data.features.forEach( (item:any) => {
    let position = item.properties.center
    createIcon({ lng: position[0], lat: position[1] })
  })
}
function setEvent() {
  map.addEventListener("click", (target: any) => {
    let point = target.point;
    createIcon(point);
    lineData[0].geometry.coordinates.push([point.lng, point.lat])
    lineLayer.setData(lineData);
  });
}
// 窗口变化
onMounted(() => {
  let mapView = document.querySelector("#map_container") as HTMLElement
  // const {
  //       scene,
  //       camera,
  //       renderer,
  //       hemLight,
  //       dirLight,
  //       controls
  // } = createScene(mapView)
  map = initMap("map_container", {
    // tilt: 73,
    // heading: 64.5,
    tilt: 15,
    heading: 0,
    // center: [116.403928, 39.914972],
    center: [114.191, 22.638],
    zoom: 15,
    minZoom: 1,
    maxZoom: 18,
    style: Customstyle,
  });
  setLayer();
  // createBox();
  fetchJson("/source/szCity.json");;
  fetchAreaPos("/source/area.json")
  // createArea()
  // setEvent();
  createPalne();
  // render();
});
function render() {
  const elapsedTime = clock.getElapsedTime();
  shaderList.forEach((child) => {
    child.material.uniforms.iTime.value = elapsedTime;
    threeLayer.add(child);
  });
  requestAnimationFrame(render);
}
// 销毁实例
onUnmounted(() => {});
</script>

<style lang="less" scoped>
.three-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  &-content {
    width: 100%;
    height: 100%;
    display: block;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
  }
  #map_container {
    width: 60%;
    height: 60%;
    background-color: antiquewhite;
  }
}
</style>