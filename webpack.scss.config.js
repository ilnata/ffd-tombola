const path = require('path');

module.exports = {
    entry: ['./public/stylesheets/style.scss'],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/webpack.out.js',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'stylesheets/[name].css',
                        }
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: { url: false }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    }
};