const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    animationDemo: "./src/js/examples/animation.js",
    particleDemo: "./src/js/examples/particle.js",
    modelDemo: "./src/js/examples/model.js",
    showcaseDemo: "./src/js/examples/showcase.js",
<<<<<<< Updated upstream
    designer: "./src/js/designer/main.js",
=======
    radiosityTest: "./src/js/examples/radiosity.js",
>>>>>>> Stashed changes
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {}
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: ['css-loader']
          })
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      },
      {
        test: /\.(frag|vert|shader)$/,
        use: {
          loader: 'raw-loader',
          options: {}
        }
      }
    ]
  },
  plugins: [ 
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/examples/animation.html',
      filename: 'animation.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/examples/particle.html',
      filename: 'particle.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/examples/model.html',
      filename: 'model.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './src/examples/showcase.html',
      filename: 'showcase.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
<<<<<<< Updated upstream
      template: './src/designer.html',
      filename: 'designer.html'
=======
      template: './src/examples/radiosity.html',
      filename: 'radiosity.html'
>>>>>>> Stashed changes
    }),
    new CopyWebpackPlugin([
      {from: 'src/css', to: 'css', force: true}
    ]),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/examples/',
  }
};
