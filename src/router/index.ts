/*
 * @Author: 1179373677@qq.com
 * @Date: 2022-06-22 09:48:55
 * @LastEditors: 1179373677@qq.com
 * @LastEditTime: 2022-06-30 09:27:02
 * @Description: 
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import login from '../views/login.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: login
  },{
    path: '/home',
    name: 'home',
    component: () => import('../views/homeView.vue')
  },{
    path: '/map',
    name: 'map',
    component: () => import('../views/threeMap.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
