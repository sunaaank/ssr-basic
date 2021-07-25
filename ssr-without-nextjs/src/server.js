import express from "express";
import LRUCache from "lru-cache";
import { ServerStyleSheet } from "styled-components";
import React from "react";
import { renderToNodeStream } from "react-dom/server";
import fs from "fs";
import path from "path";
import App from "./App";
import { Transform } from "stream";
import { renderPage, prerenderPages } from "./common";

const ssrCache = new LRUCache({
  // 💰 최대 100개의 페이지 캐싱, 각 아이템은 60초 동안 캐싱
  max: 100,
  maxAge: 1000 * 60,
});

// 중간에 삽입할 스트림을 생성해주는 함수
function createCacheStream(cacheKey, prefix, postfix) {
  // 스트림으로 전달된 모든 청크 데이터를 저장하는 배열
  const chunks = [];
  // Transform: 읽기 쓰기가 모두 가능한 스트림 객체
  return new Transform({
    // chunk 데이터를 받으면 호출되는 함수. 전달받은 chunk 데이터를 그대로 chunks에 넣음
    transform(data, _, callback) {
      chunks.push(data);
      callback(null, data);
    },
    // 청크 데이터가 모두 전달된 후 호출되는 함수. 완성된 HTML 데이터를 만들고 캐싱함
    flush(callback) {
      const data = [prefix, Buffer.concat(chunks).toString(), postfix];
      ssrCache.set(cacheKey, data.join(""));
      callback();
    },
  });
}

// 📧 미들웨어, url경로 설정 가능
const app = express();
// prerender.js 파일이 실행될 때 미리 렌더링 해놓은 페이지를 prerenderHtml 객체에 저장
const prerenderHtml = {};
for (const page of prerenderPages) {
  const pageHtml = fs.readFileSync(
    path.resolve(__dirname, `../dist/${page}.html`),
    "utf8"
  );
  prerenderHtml[page] = pageHtml;
}

const html = fs
  .readFileSync(path.resolve(__dirname, "../dist/index.html"), "utf8")
  .replace("__STYLE_FROM_SERVER__", "");

// url이 dist로 시작하는 경우, dist 폴더 밑에 있는 정적 파일로 연결한다
app.use("/dist", express.static("dist"));

// 브라우저에서 자동요청 파일이 처리되지 않도록 한다
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// 나머지 경우를 처리한다
app.get("*", (req, res) => {
  const baseURL = "http://" + req.headers.host + "/";

  // 📧 parsedUrl: url경로, 쿼리 파라미터 등 정보를 갖고 있음
  const parsedUrl = new URL(req.url, baseURL);
  // 💰 cacheKey: 쿼리파라미터를 포함하는 url
  const cacheKey = parsedUrl.path;
  // 💰 캐시가 존재한다면 캐싱된 값을 사용한다.
  if (ssrCache.has(cacheKey)) {
    console.log("캐시 사용");
    res.send(ssrCache.get(cacheKey));
    return;
  }

  // 📧 subStr(1): 1번째 위치 이후에서 시작해 문자열을 반환한다.
  // 📧 pathname 앞 슬러시를 제거해 page 변수를 받는다
  const page = parsedUrl.pathname ? parsedUrl.pathname.substr(1) : "home";

  const initialData = { page };

  // 미리 렌더링된 페이지가 아닌 경우에만 새로 렌더링한다.

  const isPrerender = prerenderPages.includes(page)
    ? prerenderHtml[page]
    : renderPage(page);
  const result = (isPrerender ? prerenderHtml[page] : html).replace(
    "__DATA_FROM_SERVER__",
    JSON.stringify(initialData)
  );
  // 💰 캐시가 존재하지 않으면 SSR 후 그 결과를 캐시에 저장한다
  if (isPrerender) {
    ssrCache.set(cacheKey, result);
    res.send(result);
  } else {
    // root 요소를 기준으로 이전 문자열과 이후 문자열로 나눈다. 이전 문자열은 바로 전송한다.
    const ROOT_TEXT = `<div id="root">`;
    const prefix = result.substr(
      0,
      result.indexOf(ROOT_TEXT) + ROOT_TEXT.length
    );
    const postfix = result.substr(prefix.length);
    res.write(prefix);
    const sheet = new ServerStyleSheet();
    const reactElement = sheet.collectStyles(<App page={page} />);
    // renderToNodeStream 함수를 호출해서 읽기 가능한 스트림 객체를 만든다. 스트림 방식을 사용할 때는 interleaveWithNodeStream 메서드를 호출해야 한다. 이 메서드는 renderStream에서 스타일 코드가 생성되도록 하는 역할을 함
    // 스타일 코드를 root 요소 내부에 삼입한다
    const renderStream = sheet.interleaveWithNodeStream(
      renderToNodeStream(reactElement)
    );
    // 생성한 스트림을 두 스트림 사이에 연결함.
    // 청크 데이터는 renderStream -> cacheStream -> res 순으로 흐름
    const cacheStream = createCacheStream(cacheKey, prefix, postfix);
    cacheStream.pipe(res);
    // pipe: renderStream 스트림과 res 스트림을 연결한다
    // end:false 옵션은 스트림이 종료됐을 때 res.end 메서드가 자동으로 호출되지 않도록 함
    renderStream.pipe(res, { end: false });
    renderStream.on("end", () => {
      res.end(postfix);
    });
  }
});

// 3000번 포트로 들어오는 클라이언트의 요청을 기다린다
app.listen(3000);
