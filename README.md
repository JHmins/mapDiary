# 6차 수정 - Vercel 배포 및 카카오 API 보안 설정

## 1. Vercel 배포 설정
- https://map-diary.vercel.app/

### 1.1 package.json 수정
- Vercel 배포를 위한 스크립트 추가
  ```json
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'",
    "vercel-build": "echo 'No build step required'"
  }
  ```
- Node.js 버전 요구사항 추가
  ```json
  "engines": {
    "node": ">=14.0.0"
  }
  ```

### 1.2 server.js 수정
- 환경 변수 기반 포트 설정
- 카카오 API 키 제공 엔드포인트 추가
- 정적 파일 제공 방식 개선

## 2. 카카오 API 보안 강화

### 2.1 index.html 수정
- 카카오 API 키를 환경 변수로 관리하도록 변경
- API 키 동적 로딩 구현
- 지도 초기화 로직 개선

### 2.2 보안 설정
- 카카오 API 키를 클라이언트에 직접 노출하지 않도록 변경
- 환경 변수를 통한 API 키 관리

## 3. Vercel 환경 설정

### 3.1 환경 변수 설정
- KAKAO_API_KEY 환경 변수 추가
- 프로덕션 환경 설정

### 3.2 프레임워크 설정
- Framework Preset: Other
- Build Command: npm run build
- Output Directory: .
- Install Command: npm install

## 4. 보안 개선사항
- API 키 보안 강화
- 환경 변수 기반 설정

## 5. 참고사항
- Vercel 무료 플랜 사용
- Node.js 서버리스 환경 최적화
- 보안 강화를 위한 API 키 관리 방식 변경 