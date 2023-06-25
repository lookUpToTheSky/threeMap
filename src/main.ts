/*
 * @Author: 1179373677@qq.com
 * @Date: 2022-06-22 09:48:55
 * @LastEditors: 1179373677@qq.com
 * @LastEditTime: 2022-06-24 10:26:14
 * @Description: 
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import * as Icons from '@ant-design/icons-vue';
import { generate, presetPalettes } from '@ant-design/colors';

const themeColors = generate('#1890ff');

const app = createApp(App)
app.use(router).use(Antd).mount('#app')

// 全局使用图标
const icons: any = Icons;
for (const i in icons) {
    app.component(i, icons[i]);
}
