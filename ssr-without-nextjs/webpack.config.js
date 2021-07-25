const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

function getConfig(isServer) {
  return {
    entry: isServer
      ? { server: "./src/server.js" }
      : { main: "./src/index.js" },
    output: {
      // 클라이언트는 브라우저의 캐싱효과때문에 chunkhash사용
      filename: isServer ? "[name].bundle.js" : "[name].[chunkhash].js",
      path: path.resolve(__dirname, "dist"),
      // html-webpack-plugin이 HTML 생성 시 HTML 내부 리소스 파일의 경로를 만들 때 사용
      // publicPath 설정 없이 생성된 HTML 파일은 브라우저에서 바로 실행하면 문제X
      // BUT SSR 할 때는 문제가 됨.
      publicPath: "/dist/",
    },
    // target 속성에 node 입력해 서버 코드 번들링
    target: isServer ? "node" : "web",
    externals: isServer ? [nodeExternals()] : [],
    node: {
      // false 안해주면 코드에서 dirname 사용할 때 "/"가 입력됨
      __dirname: false,
    },
    optimization: isServer
      ? { splitChunks: false, minimize: false }
      : undefined,
    module: {
      rules: [
        {
          // 모든 자바스크립트 파일을 babel-loader로 처리한다
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            // webpack은 클라이언트 코드에 대해서만 실행함. 따라서 babel-loader가 클라이언트 설정으로 실행되도록 함
            options: {
              configFile: path.resolve(
                __dirname,
                isServer ? ".babelrc.server.js" : ".babelrc.client.js"
              ),
            },
          },
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: {
            loader: "file-loader",
            // 파일 복사는 서버/클라 한쪽에서만
            options: { emitFile: isServer ? false : true },
          },
        },
      ],
    },
    plugins: isServer
      ? []
      : [
          // template/index.html 파일을 기반으로 HTML 파일을 생성한다
          new HtmlWebpackPlugin({
            template: "./template/index.html",
          }),
        ],
    mode: "production",
  };
}

module.exports = [getConfig(false), getConfig(true)];
