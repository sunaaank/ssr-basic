// common.js 설정 가져오기
const config = require("./.babelrc.common.js");
// 서버에 필요한 추가 플러그인 추가
config.plugins.push("@babel/plugin-transform-modules-commonjs");
module.exports = config;
