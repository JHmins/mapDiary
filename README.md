# 지도 프로젝트

이 프로젝트는 카카오맵 API를 사용하여 웹 페이지에 지도를 표시하는 간단한 웹 애플리케이션이며, 점차 보완해나갈 예정입니다.

## 프로젝트 구조

```
myMapProject/
├── index.html      # 메인 HTML 파일
├── style.css       # 스타일시트
├── script.js       # 자바스크립트 파일
├── server.js       # Express 서버 설정
└── package.json    # 프로젝트 의존성 관리
```

## 주요 기능

- 카카오맵 API를 사용한 지도 표시
- 전체 화면 지도 뷰
- Express 서버를 통한 로컬 호스팅

## 설치 및 실행 방법

1. 프로젝트 의존성 설치:
   ```bash
   npm install
   ```

2. 서버 실행:
   ```bash
   npm start
   ```

3. 웹 브라우저에서 `http://localhost:3000` 접속

## 기술 스택

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- 카카오맵 API

## 파일 설명

### index.html
- 메인 HTML 파일
- 카카오맵 API 스크립트 포함
- 지도를 표시할 div 요소 포함

### style.css
- 전체 화면 지도 스타일링
- 기본 레이아웃 설정

### script.js
- 카카오맵 초기화 및 설정
- 지도 표시 로직

### server.js
- Express 서버 설정
- 정적 파일 제공
- 포트 3000에서 서버 실행

### package.json
- 프로젝트 메타데이터
- 의존성 관리 (Express.js)
- 스크립트 설정 
