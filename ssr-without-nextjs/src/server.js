import express from "express";
import LRUCache from "lru-cache";
import fs from "fs";
import path from "path";
import { renderPage, prerenderPages } from "./common";

const ssrCache = new LRUCache({
  // 💰 최대 100개의 페이지 캐싱, 각 아이템은 60초 동안 캐싱
  max: 100,
  maxAge: 1000 * 60,
});
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
  const pageHtml = prerenderPages.includes(page)
    ? prerenderHtml[page]
    : renderPage(page);
  const result = pageHtml.replace(
    "__DATA_FROM_SERVER__",
    JSON.stringify(initialData)
  );
  // 💰 캐시가 존재하지 않으면 SSR 후 그 결과를 캐시에 저장한다
  ssrCache.set(cacheKey, result);
  res.send(result);
});

// 3000번 포트로 들어오는 클라이언트의 요청을 기다린다
app.listen(3000);
