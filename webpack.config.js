// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

module.exports = {
  watch: false,
  target: 'electron-renderer',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/renderer.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
