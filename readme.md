# 서버사이드렌더링(SSR) 학습용 레파지토리

- 📚 책 <실전 리액트 프로그래밍(이재승)>의 `8장 서버사이드 렌더링 그리고 Next.js`를 참고했습니다.
- 본 레파지토리는 SSR 관련 프로젝트 두 개를 관리하고 있습니다.

<br/>
<br/>

## 📁 레파지토리 구성

### 1. ssr-with-nextjs: nextjs를 적용해 ssr를 구현한 프로젝트

#### 👩‍💻 실행 명령어

- `npm install`
- (개발모드 넥스트 실행) `npx next`
- (개발모드 생성폴더 삭제) `rm -rf .next`
- (프로덕션 모드 빌드 후 내장웹서버 실행)`npx next build` && `npx next start`
- (express 웹서버 실행) `node server.js`
- (production 모드로 실행시, 빌드 먼저 필요) `$npx next build` => `$ NODE_ENV=production node server.js`
- `npx next build && npx next export` => `$ NODE_ENV=production node server.js`
  <br/>
  : 전체 페이지를 미리 렌더링해(out폴더), 서버에서 넥스트를 실행하지 않아도 정적 페이지를 서비스할 수 있게 함.(쿼리파라미터도 미리 설정해주어야함)
  <br/>
  : 프로덕션모드에서만 out 폴더 내용 조회 가능

### 2. ssr-without-nextjs: nextjs 없이 기본적인 ssr을 구현한 프로젝트

#### 👩‍💻 실행 명령어

- `npm install`
- `npm run build`
- `npm start`

## 🎯 학습목표

- 리액트에서 제공하는 `renderToString`, `hydrate` 함수를 사용해본다.
- 서버에서 생성된 데이터를 클라이언트로 전달하는 방법을 알아본다.
- styled-components로 작성된 스타일이 SSR 시 어떻게 처리되는지 알아본다
- 서버용 번들 파일을 만드는 방법을 알아본다.

## 🎁 사용 패키지

### 🐧 ssr-with-nextjs

0. 넥스트(SSR 프레임워크) + 익스프레스(웹서버)

- `next`, `express`

1. 리액트

- `react`, `react-dom`

2. 웹팩

- `file-loader` (파일 내용 변경 시 파일 경로 변경)

3. caching

- `lru-cache`

### 🐧 ssr-without-nextjs

1. React

- `react`, `react-dom`

2. 바벨

- `@babel/core`, `@babel/preset-env`(클라이언트 바벨 프리셋), `@babel/preset-react`(클라이언트, 서버 바벨 프리셋)

3. 웹팩

- `webpack`, `webpack-cli`, `babel-loader`, `clean-webpack-plugin`, `html-webpack-plugin`

4. 서버사이드 렌더링

- `express`: 웹 서버용
- `@babel/cli`: 서버에서 사용될 JS파일을 컴파일할 때 사용(리액트 jsx문법으로 작성된 파일 변환)
- `@babel/plugin-transform-modules-commonjs`: ESM으로 작성된 모듈시스템을 commonJS로 변경

5. css-in-js

- `styled-components`

6. image module

- `webpack-node-externals` `file-loader`

7. caching

- `lru-cache`: 정해진 최대 캐시 개수를 초과하면 LRU(Least Recently Used) 알고리즘에 따라 가장 오랫동안 사용되지 않은 캐시를 제거함
