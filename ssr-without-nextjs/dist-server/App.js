"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = App;

var _react = _interopRequireWildcard(require("react"));

var _Home = _interopRequireDefault(require("./Home"));

var _About = _interopRequireDefault(require("./About"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function App({
  pageProp
}) {
  const [page, setPage] = (0, _react.useState)(pageProp);
  (0, _react.useEffect)(() => {
    // SPA를 직접 구현하기 위함. 브라우저에서 뒤로가기 버튼을 클릭하면 onpopstate 함수가 호출됨.
    window.onpopstate = event => {
      setPage(event.state);
    };
  }, []); // 특정 페이지로 이동하는 버튼의 이벤트 처리 함수.

  function onChangePage(e) {
    const newPage = e.target.dataset.page; // pushState 메서드를 통해 브라우저에게 주소가 변경되었음을 알림

    window.history.pushState(newPage, "", `/${newPage}`);
    setPage(newPage);
  } // page 상태값에 따라 렌더링할 페이지의 컴포넌트가 결정됨.


  const PageComponent = page === "home" ? _Home.default : _About.default;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "container"
  }, /*#__PURE__*/_react.default.createElement("button", {
    "data-page": "home",
    onClick: onChangePage
  }, "Home"), /*#__PURE__*/_react.default.createElement("button", {
    "data-page": "about",
    onClick: onChangePage
  }, "About"), /*#__PURE__*/_react.default.createElement(PageComponent, null));
}