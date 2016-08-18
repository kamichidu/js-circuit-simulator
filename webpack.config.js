module.exports= {
    entry: {
        app: './src/js/app.js'
    },
    output: {
        path: __dirname + '/target/',
        filename: '[name].js'
    },
    devtool: 'source-map'
};
