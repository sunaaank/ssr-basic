import express from "express";
import fs from "fs";
import path from "path";
import { ServerStyleSheet } from "styled-components";
import { renderToString } from "react-dom/server";
import React from "react";
import App from "./App";

// 📧 미들웨어, url경로 설정 가능
const app = express();

// webpack 빌드 후 생성되는 html 파일을 가져온다
const html = fs.readFileSync(
  path.resolve(__dirname, "../dist/index.html"),
  "utf8"
);

// url이 dist로 시작하는 경우, dist 폴더 밑에 있는 정적 파일로 연결한다
app.use("/dist", express.static("dist"));

// 브라우저에서 자동요청 파일이 처리되지 않도록 한다
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// 나머지 경우를 처리한다
app.get("*", (req, res) => {
  const baseURL = "http://" + req.headers.host + "/";

  // 📧 parsedUrl: url경로, 쿼리 파라미터 등 정보를 갖고 있음
  const parsedUrl = new URL(req.url, baseURL);

  // 📧 subStr(1): 1번째 위치 이후에서 시작해 문자열을 반환한다.
  // 📧 pathname 앞 슬러시를 제거해 page 변수를 받는다
  const page = parsedUrl.pathname ? parsedUrl.pathname.substr(1) : "home";

  // 🎨 스타일을 추출하는 데 사용될 객체를 생성한다
  const sheet = new ServerStyleSheet();

  // 📧 url로부터 계산된 페이지 정보를 App 컴포넌트에 Props로 사용한다
  // 🎨 collectStyles 메서드에 리액트 요소를 입력하면 스타일 정보를 수집하기 위한 코드가 리액트 요소에 삽입됨
  // 🎨 실제 스타일 정보는 renderToString 함수의 호출이 끝나야 수집할 수 있음
  const renderString = renderToString(sheet.collectStyles(<App page={page} />));

  //  🎨 getStyleTags 메서드를 호출하면 스타일 정보가 추출됨
  const styles = sheet.getStyleTags();
  const initialData = { page };

  // 렌더링 결과를 반영해서 HTML을 완성한다
  // HTML 파일을 클라이언트에 전송한다
  const result = html
    .replace(`<div id="root'></div>`, `<div id="root">${renderString}</div>`)
    .replace("__DATA_FROM_SERVER__", JSON.stringify(initialData))
    .replace("__STYLE_FROM_SERVER__", styles);
  res.send(result);
});

// 3000번 포트로 들어오는 클라이언트의 요청을 기다린다
app.listen(3000);
