import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import React from "react";
import App from "./App";
import { ServerStyleSheet } from "styled-components";

// dist/index.html 파일의 내용을 가져온다
const html = fs.readFileSync(
  path.resolve(__dirname, "../dist/index.html"),
  "utf8"
);

// 미리 렌더링할 페이지의 목록을 정의한다
export const prerenderPages = ["home"];

// 페이지를 미리 렌더링해서 문자열을 반환하는 함수.
// prerender.js 파일에서는 __DATA_FROM_SERVER__ 문자열을 변환하지 못한 채로 각 페이지의 HTML 파일을 저장한다. 데이터는 서버에서 사용자 요청을 처리할 때 채워 넣는다.
export function renderPage(page) {
  const sheet = new ServerStyleSheet();
  const renderString = renderToString(sheet.collectStyles(<App page={page} />));
  const styles = sheet.getStyleTags();
  const result = html
    .replace(`<div id="root"></div>`, `<div id="root">${renderString}</div>`)
    .replace("__STYLE_FROM_SERVER__", styles);
  return result;
}
