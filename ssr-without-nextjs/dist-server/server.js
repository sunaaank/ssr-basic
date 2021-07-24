"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var url = _interopRequireWildcard(require("url"));

var _server = require("react-dom/server");

var _react = _interopRequireDefault(require("react"));

var _App = _interopRequireDefault(require("./App"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 서버에 사용되는 기능이 모여있음
// 미들웨어, url경로 설정 가능
const app = (0, _express.default)(); // webpack 빌드 후 생성되는 html 파일을 가져온다

const html = _fs.default.readFileSync(_path.default.resolve(__dirname, "../dist/index.html"), "utf8"); // url이 ist로 시작하는 경우, dist 폴더 밑에 있는 정적 파일로 연결한다


app.use("/dist", _express.default.static("dist")); // 브라우저에서 자동요청 파일이 처리되지 않도록 한다

app.get("/favicon.ico", (req, res) => res.sendStatus(204)); // 나머지 경우를 처리한다

app.get("*", (req, res) => {
  const baseURL = "http://" + req.headers.host + "/";
  const parsedUrl = new URL(req.url, baseURL);
  const page = parsedUrl.pathname ? parsedUrl.pathname.substr(1) : "home"; // App 컴포넌트 렌더링을 한다(어떤 요청이 들어와도 home 컴포넌트를 렌더링한다)

  const renderString = (0, _server.renderToString)( /*#__PURE__*/_react.default.createElement(_App.default, {
    page: page
  }));
  const initialData = {
    page
  }; // 렌더링 결과를 반영해서 HTML을 완성한다
  // HTML 파일을 클라이언트에 전송한다

  const result = html.replace(`<div id="root'></div>`, `<div id="root">${renderString}</div>`).replace("__DATA_FROM_SERVER__", JSON.stringify(initialData));
  res.send(result);
}); // 3000번 포트로 들어오는 클라이언트의 요청을 기다린다

app.listen(3000);