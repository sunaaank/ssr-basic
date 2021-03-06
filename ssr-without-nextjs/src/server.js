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
  // ๐ฐ ์ต๋ 100๊ฐ์ ํ์ด์ง ์บ์ฑ, ๊ฐ ์์ดํ์ 60์ด ๋์ ์บ์ฑ
  max: 100,
  maxAge: 1000 * 60,
});

// ์ค๊ฐ์ ์ฝ์ํ  ์คํธ๋ฆผ์ ์์ฑํด์ฃผ๋ ํจ์
function createCacheStream(cacheKey, prefix, postfix) {
  // ์คํธ๋ฆผ์ผ๋ก ์ ๋ฌ๋ ๋ชจ๋  ์ฒญํฌ ๋ฐ์ดํฐ๋ฅผ ์ ์ฅํ๋ ๋ฐฐ์ด
  const chunks = [];
  // Transform: ์ฝ๊ธฐ ์ฐ๊ธฐ๊ฐ ๋ชจ๋ ๊ฐ๋ฅํ ์คํธ๋ฆผ ๊ฐ์ฒด
  return new Transform({
    // chunk ๋ฐ์ดํฐ๋ฅผ ๋ฐ์ผ๋ฉด ํธ์ถ๋๋ ํจ์. ์ ๋ฌ๋ฐ์ chunk ๋ฐ์ดํฐ๋ฅผ ๊ทธ๋๋ก chunks์ ๋ฃ์
    transform(data, _, callback) {
      chunks.push(data);
      callback(null, data);
    },
    // ์ฒญํฌ ๋ฐ์ดํฐ๊ฐ ๋ชจ๋ ์ ๋ฌ๋ ํ ํธ์ถ๋๋ ํจ์. ์์ฑ๋ HTML ๋ฐ์ดํฐ๋ฅผ ๋ง๋ค๊ณ  ์บ์ฑํจ
    flush(callback) {
      const data = [prefix, Buffer.concat(chunks).toString(), postfix];
      ssrCache.set(cacheKey, data.join(""));
      callback();
    },
  });
}

// ๐ง ๋ฏธ๋ค์จ์ด, url๊ฒฝ๋ก ์ค์  ๊ฐ๋ฅ
const app = express();
// prerender.js ํ์ผ์ด ์คํ๋  ๋ ๋ฏธ๋ฆฌ ๋ ๋๋ง ํด๋์ ํ์ด์ง๋ฅผ prerenderHtml ๊ฐ์ฒด์ ์ ์ฅ
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

// url์ด dist๋ก ์์ํ๋ ๊ฒฝ์ฐ, dist ํด๋ ๋ฐ์ ์๋ ์ ์  ํ์ผ๋ก ์ฐ๊ฒฐํ๋ค
app.use("/dist", express.static("dist"));

// ๋ธ๋ผ์ฐ์ ์์ ์๋์์ฒญ ํ์ผ์ด ์ฒ๋ฆฌ๋์ง ์๋๋ก ํ๋ค
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// ๋๋จธ์ง ๊ฒฝ์ฐ๋ฅผ ์ฒ๋ฆฌํ๋ค
app.get("*", (req, res) => {
  const baseURL = "http://" + req.headers.host + "/";

  // ๐ง parsedUrl: url๊ฒฝ๋ก, ์ฟผ๋ฆฌ ํ๋ผ๋ฏธํฐ ๋ฑ ์ ๋ณด๋ฅผ ๊ฐ๊ณ  ์์
  const parsedUrl = new URL(req.url, baseURL);
  // ๐ฐ cacheKey: ์ฟผ๋ฆฌํ๋ผ๋ฏธํฐ๋ฅผ ํฌํจํ๋ url
  const cacheKey = parsedUrl.path;
  // ๐ฐ ์บ์๊ฐ ์กด์ฌํ๋ค๋ฉด ์บ์ฑ๋ ๊ฐ์ ์ฌ์ฉํ๋ค.
  if (ssrCache.has(cacheKey)) {
    console.log("์บ์ ์ฌ์ฉ");
    res.send(ssrCache.get(cacheKey));
    return;
  }

  // ๐ง subStr(1): 1๋ฒ์งธ ์์น ์ดํ์์ ์์ํด ๋ฌธ์์ด์ ๋ฐํํ๋ค.
  // ๐ง pathname ์ ์ฌ๋ฌ์๋ฅผ ์ ๊ฑฐํด page ๋ณ์๋ฅผ ๋ฐ๋๋ค
  const page = parsedUrl.pathname ? parsedUrl.pathname.substr(1) : "home";

  const initialData = { page };

  // ๋ฏธ๋ฆฌ ๋ ๋๋ง๋ ํ์ด์ง๊ฐ ์๋ ๊ฒฝ์ฐ์๋ง ์๋ก ๋ ๋๋งํ๋ค.

  const isPrerender = prerenderPages.includes(page)
    ? prerenderHtml[page]
    : renderPage(page);
  const result = (isPrerender ? prerenderHtml[page] : html).replace(
    "__DATA_FROM_SERVER__",
    JSON.stringify(initialData)
  );
  // ๐ฐ ์บ์๊ฐ ์กด์ฌํ์ง ์์ผ๋ฉด SSR ํ ๊ทธ ๊ฒฐ๊ณผ๋ฅผ ์บ์์ ์ ์ฅํ๋ค
  if (isPrerender) {
    ssrCache.set(cacheKey, result);
    res.send(result);
  } else {
    // root ์์๋ฅผ ๊ธฐ์ค์ผ๋ก ์ด์  ๋ฌธ์์ด๊ณผ ์ดํ ๋ฌธ์์ด๋ก ๋๋๋ค. ์ด์  ๋ฌธ์์ด์ ๋ฐ๋ก ์ ์กํ๋ค.
    const ROOT_TEXT = `<div id="root">`;
    const prefix = result.substr(
      0,
      result.indexOf(ROOT_TEXT) + ROOT_TEXT.length
    );
    const postfix = result.substr(prefix.length);
    res.write(prefix);
    const sheet = new ServerStyleSheet();
    const reactElement = sheet.collectStyles(<App page={page} />);
    // renderToNodeStream ํจ์๋ฅผ ํธ์ถํด์ ์ฝ๊ธฐ ๊ฐ๋ฅํ ์คํธ๋ฆผ ๊ฐ์ฒด๋ฅผ ๋ง๋ ๋ค. ์คํธ๋ฆผ ๋ฐฉ์์ ์ฌ์ฉํ  ๋๋ interleaveWithNodeStream ๋ฉ์๋๋ฅผ ํธ์ถํด์ผ ํ๋ค. ์ด ๋ฉ์๋๋ renderStream์์ ์คํ์ผ ์ฝ๋๊ฐ ์์ฑ๋๋๋ก ํ๋ ์ญํ ์ ํจ
    // ์คํ์ผ ์ฝ๋๋ฅผ root ์์ ๋ด๋ถ์ ์ผ์ํ๋ค
    const renderStream = sheet.interleaveWithNodeStream(
      renderToNodeStream(reactElement)
    );
    // ์์ฑํ ์คํธ๋ฆผ์ ๋ ์คํธ๋ฆผ ์ฌ์ด์ ์ฐ๊ฒฐํจ.
    // ์ฒญํฌ ๋ฐ์ดํฐ๋ renderStream -> cacheStream -> res ์์ผ๋ก ํ๋ฆ
    const cacheStream = createCacheStream(cacheKey, prefix, postfix);
    cacheStream.pipe(res);
    // pipe: renderStream ์คํธ๋ฆผ๊ณผ res ์คํธ๋ฆผ์ ์ฐ๊ฒฐํ๋ค
    // end:false ์ต์์ ์คํธ๋ฆผ์ด ์ข๋ฃ๋์ ๋ res.end ๋ฉ์๋๊ฐ ์๋์ผ๋ก ํธ์ถ๋์ง ์๋๋ก ํจ
    renderStream.pipe(res, { end: false });
    renderStream.on("end", () => {
      res.end(postfix);
    });
  }
});

// 3000๋ฒ ํฌํธ๋ก ๋ค์ด์ค๋ ํด๋ผ์ด์ธํธ์ ์์ฒญ์ ๊ธฐ๋ค๋ฆฐ๋ค
app.listen(3000);
