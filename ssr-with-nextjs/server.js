const express = require("express");
const next = require("next");
const url = require("url");
// SSR 결과를 캐싱하기 위해 lru-cache 패키지를 이용
const lruCache = require("lru-cache");

// 최대 100개의 항목 저장, 각 항목은 60초 동안 저장
const ssrCache = new lruCache({
  max: 100,
  maxAge: 1000 * 60,
});

const port = 3000;
// NODE_DEV 환경 변수에 따라 개발모드와 프로덕션 모드를 구분함
const dev = process.env.NODE_ENV !== "production";
// next를 실행하기 위해 필요한 객체와 함수를 생성
const app = next({ dev });
const handle = app.getRequestHandler();

// next의 준비과정이 끝나면 입력된 함수를 실행
app.prepare().then(() => {
  const server = express();

  // express 웹 서버에서 처리할 url 패턴을 등록함
  // ex) /page/1 요청이 들어오면 /page1로 리다이렉트
  // 이 부분 코드가 없으면 next 내장 웹서버와 같은 일을 함
  server.get("/page/:id", (req, res) => {
    res.redirect(`page${req.params.id}`);
  });

  // /page1, /page2 요청에 대해 SSR 결과를 캐싱함
  server.get(/^\/page[1-9]/, (req, res) => {
    // renderAndCache 함수에서 캐싱 기능 구현함
    return renderAndCache(req, res);
  });

  // 나머지 모든 요청은 handle 함수가 처리하도록 함
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  // 사용자 요청을 처리하기 위해 대기함
  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

const fs = require("fs");

const prerenderList = [
  { name: "page1", path: "/page1" },
  { name: "page2-hello", path: "/page2?text=hello" },
  { name: "page2-world", path: "/page2?text=world" },
];

// out 폴더에 있는 미리 렌더링된 HTML 파일을 읽어서 prerenderCache에 저장함.
// next export 명령어는 프로덕션 모드에서만 사용하므로 out 폴더 내용을 읽는 작업은 프로덕션 모드에서만 함
const prerenderCache = {};
if (!dev) {
  for (const info of prerenderList) {
    const { name, path } = info;
    const html = fs.readFileSync(`./out/${name}.html`, "utf8");
    prerenderCache[`/${name}`] = html;
  }
}

async function renderAndCache(req, res) {
  const parsedUrl = url.parse(req.url, true);
  // 쿼리 파라미터가 포함된 경로를 키로 사용함
  const cacheKey = parsedUrl.path;

  // 캐시가 존재하면 캐시에 저장된 값을 사용함
  if (ssrCache.has(cacheKey)) {
    console.log("캐시 사용");
    res.send(ssrCache.get(cacheKey));
    return;
  }

  // prerenderCache 이용, 미리 렌더링한 페이지라면 캐싱된 HTML 사용
  if (prerenderCache.hasOwnProperty(cacheKey)) {
    console.log("미리 랜더링한 HTML 사용");
    res.send(prerenderCache[cacheKey]);
    return;
  }

  try {
    const { query, pathname } = parsedUrl;
    // 캐시가 없으면 next의 renderToHTML 메서드 호출, await 키워드를 사용해 처리가 끝날 때 까지 기다림
    const html = await app.renderToHTML(req, res, pathname, query);
    if (res.statusCode === 200) {
      // renderToHTML함수가 정상적으로 처리됐으면 그 결과를 캐싱함
      ssrCache.set(cacheKey, html);
    }
    res.send(html);
  } catch (err) {
    app.renderError(err, req, res, pathname, query);
  }
}
