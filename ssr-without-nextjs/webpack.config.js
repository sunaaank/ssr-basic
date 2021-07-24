const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    // html-webpack-plugin이 HTML 생성 시 HTML 내부 리소스 파일의 경로를 만들 때 사용
    // publicPath 설정 없이 생성된 HTML 파일은 브라우저에서 바로 실행하면 문제X
    // BUT SSR 할 때는 문제가 됨.
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        // 모든 자바스크립트 파일을 babel-loader로 처리한다
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          // webpack은 클라이언트 코드에 대해서만 실행함. 따라서 babel-loader가 클라이언트 설정으로 실행되도록 함
          options: {
            configFile: path.resolve(__dirname, ".babelrc.client.js"),
          },
        },
      },
    ],
  },
  plugins: [
    // template/index.html 파일을 기반으로 HTML 파일을 생성한다
    new HtmlWebpackPlugin({
      template: "./template/index.html",
    }),
  ],
  mode: "production",
};
