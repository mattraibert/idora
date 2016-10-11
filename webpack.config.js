module.exports = {
  entry: './src/javascripts/main.js',
  output: {
    path: __dirname + '/build',
    publicPath: '/build/',
    filename: 'bundle.js'
  }
};
