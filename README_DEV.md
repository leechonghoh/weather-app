<<<<<<< Updated upstream
# 로컬 개발 서버 실행 가이드

## 문제 해결: "서버 연결 오류입니다. API 서버가 실행 중인지 확인해주세요."

이 오류는 API 엔드포인트가 작동하지 않을 때 발생합니다. 다음 방법 중 하나를 사용하세요.

## 방법 1: Express 개발 서버 사용 (권장)

### 1단계: 의존성 설치

```bash
npm install
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

또는

```bash
node dev-server.js
```

### 3단계: 브라우저에서 접속

```
http://localhost:3000
```

## 방법 2: Vercel CLI 사용

### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

### 2단계: Vercel 개발 서버 실행

```bash
npm run dev:vercel
```

또는

```bash
vercel dev
```

### 3단계: 브라우저에서 접속

Vercel이 제공하는 주소로 접속 (일반적으로 `http://localhost:3000`)

## 환경 변수 설정

로컬 개발을 위해 `.env` 파일을 생성하세요:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

## 문제 해결

### "Cannot find module 'express'" 오류

의존성을 설치하세요:
```bash
npm install
```

### 포트가 이미 사용 중입니다

`dev-server.js` 파일에서 `PORT` 값을 변경하세요 (예: 3001, 3002 등)

### API가 여전히 작동하지 않습니다

1. 브라우저 개발자 도구(F12)의 콘솔을 확인하세요
2. 서버 콘솔 로그를 확인하세요
3. `.env` 파일이 올바르게 설정되었는지 확인하세요

=======
# 로컬 개발 서버 실행 가이드

## 문제 해결: "서버 연결 오류입니다. API 서버가 실행 중인지 확인해주세요."

이 오류는 API 엔드포인트가 작동하지 않을 때 발생합니다. 다음 방법 중 하나를 사용하세요.

## 방법 1: Express 개발 서버 사용 (권장)

### 1단계: 의존성 설치

```bash
npm install
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

또는

```bash
node dev-server.js
```

### 3단계: 브라우저에서 접속

```
http://localhost:3000
```

## 방법 2: Vercel CLI 사용

### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

### 2단계: Vercel 개발 서버 실행

```bash
npm run dev:vercel
```

또는

```bash
vercel dev
```

### 3단계: 브라우저에서 접속

Vercel이 제공하는 주소로 접속 (일반적으로 `http://localhost:3000`)

## 환경 변수 설정

로컬 개발을 위해 `.env` 파일을 생성하세요:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

## 문제 해결

### "Cannot find module 'express'" 오류

의존성을 설치하세요:
```bash
npm install
```

### 포트가 이미 사용 중입니다

`dev-server.js` 파일에서 `PORT` 값을 변경하세요 (예: 3001, 3002 등)

### API가 여전히 작동하지 않습니다

1. 브라우저 개발자 도구(F12)의 콘솔을 확인하세요
2. 서버 콘솔 로그를 확인하세요
3. `.env` 파일이 올바르게 설정되었는지 확인하세요

>>>>>>> Stashed changes
