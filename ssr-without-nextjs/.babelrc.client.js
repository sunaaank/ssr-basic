// common.js 설정 가져오기
const config = require("./.babelrc.common.js");
// 클라이언트에 필요한 추가 프리셋 추가
config.presets.push("@babel/preset-env");
module.exports = config;
