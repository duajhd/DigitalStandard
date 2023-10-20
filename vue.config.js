module.exports = {
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.pdf$/i,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            ],
        }
    }
,
    publicPath: './',  // 执行 npm run build 统一配置路径
    devServer: {
        proxy: {
            '/api/action:': {
                target: 'http://std.samr.gov.cn/gb/search/gbDetailed',
                changeOrigin: true,
                pathRewrite: {
                    ['^/api/action']: ''
                }
            },

        }

    }

}