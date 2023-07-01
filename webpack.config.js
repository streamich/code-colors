const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: DEV ? 'development' : 'production',
  devtool: DEV ? 'source-map' : false,
  entry: {
    bundle: __dirname + '/src/index',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'code-colors',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  }
};
