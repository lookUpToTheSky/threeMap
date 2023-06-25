import {
    Vector2
} from 'three'
//比例 1:1000米
class THREEMAP {
    center: [number, number] = [0, 0] //中心经纬度
    xy: [number, number] = [0, 0] //对应three中心位置下x，y
    constructor(center: [number, number], xy: [number, number]) {
        this.center = center
    }
    // 经纬度转地图坐标
    lngLatToXy(
        lng: number,
        lat: number,
    ) {
        let a, dst;
        let north = new Vector2(0, 0);
        let arc = 6371.393;
        a = Math.atan(((lng - this.center[0]) / (lat - this.center[1])) * Math.cos(this.center[1]));
        dst = ((lat - this.center[1]) * ((arc * 2 * Math.PI) / 360)) / Math.cos(a);
        let b = north.angle() - a;

        return { x: Math.sin(b) * dst + this.xy[0], y: Math.cos(b) * dst + this.xy[1] };
    }
    // 地图坐标转经纬度
    xyToLngLat(
        x: number,
        y: number
    ) {
        let a, dst;
        let v1 = new Vector2(this.xy[0], this.xy[1]);
        let v2 = new Vector2(x, y);
        let north = new Vector2(0, 1);
        a = north.angle() - v2.clone().sub(v1).angle();
        dst = v1.clone().distanceTo(v2);
        let arc = 6371.393;
        let lng = this.center[0], lat = this.center[1];
        lng += (dst * Math.sin(-a)) / ((arc * Math.cos(lat) * 2 * Math.PI) / 360);
        lat += (dst * Math.cos(a)) / ((arc * 2 * Math.PI) / 360);

        return { lng, lat };
    }
}

export default THREEMAP