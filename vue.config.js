const { defineConfig } = require('@vue/cli-service')
const path = require('path');
module.exports = defineConfig({
    publicPath: "/",
    outputDir: "dist",
    assetsDir: "static",
    productionSourceMap: false,
    transpileDependencies: true,
    lintOnSave: false,
    devServer: {
      host: "localhost",
      port: 8080,
      https: false,
      open: true,
      proxy: {//设置代理
        "/api": {
          target: "http://127.0.0.1:4523/m1/1163324-0-default",
          changeOrigin: true,//表示是否跨域请求
        }
      }
    },
    pluginOptions: {
        "style-resources-loader": {
            preProcessor: "less",
            patterns: [
               // 存放less变量文件的路径
                path.resolve(__dirname, "./src/assets/less/parameter.less")
            ]
        }
    },
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    modifyVars: {
                        'primary-color': '#ec6800'
                    },
                    javascriptEnabled: true,
                },
            },
        },
    }
})
