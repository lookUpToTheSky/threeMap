import {
    Vector2
} from 'three'
//比例 1:1000米
class THREEMAP {
    center: [number, number] = [0, 0] //中心经纬度
    xy: [number, number] = [0, 0] //对应three中心位置下x，y
    constructor(center: [number, number], xy: [number, number]) {
        this.center = center
        this.xy = xy
    }
    lngLatToXy(lng: number, lat: number) {
        // 地球半径（单位：千米）
        const radius = 637.1393;
      
        // 中心点经纬度
        const centerLng = this.center[0];
        const centerLat = this.center[1];
      
        // 将经纬度转换为弧度
        const lngRad = lng * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        const centerLngRad = centerLng * Math.PI / 180;
        const centerLatRad = centerLat * Math.PI / 180;
      
        // 计算平面坐标的x和y值
        const x = radius * (lngRad - centerLngRad) * Math.cos(centerLatRad);
        const y = radius * (latRad - centerLatRad);
      
        return { x, y };
    }
    xyToLngLat(x: number, y: number) {
        // 地球半径（单位：千米）
        const radius = 637.1393;
        
        // 中心点经纬度
        const centerLng = this.center[0];
        const centerLat = this.center[1];
        
        // 计算平面坐标系的中心点经纬度的弧度值
        const centerLngRad = centerLng * Math.PI / 180;
        const centerLatRad = centerLat * Math.PI / 180;
        
        // 计算经度和纬度的弧度值
        const lngRad = (x / radius / Math.cos(centerLatRad)) + centerLngRad;
        const latRad = (y / radius) + centerLatRad;
        
        // 将弧度值转换为经度和纬度的度数值
        const lng = lngRad * 180 / Math.PI;
        const lat = latRad * 180 / Math.PI;
        
        return { lng, lat };
    }
    setCenter( 
        lng: number,
        lat: number
    ) {
        lng = Math.floor(lng * 1000)/1000
        lat = Math.floor(lat * 1000)/1000
        this.center = [lng, lat]
    }
}

export default THREEMAP