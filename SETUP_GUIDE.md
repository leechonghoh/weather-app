# Vercel + Supabase 설정 가이드

이 가이드는 Vercel과 Supabase를 사용하여 Weather Dashboard를 배포하는 방법을 단계별로 안내합니다.

## 📋 사전 준비

1. GitHub 계정 (무료)
2. Supabase 계정 (무료)
3. Vercel 계정 (무료)
4. OpenWeatherMap API 키 (무료)

---

## 1단계: Supabase 프로젝트 설정

### 1.1 Supabase 회원가입 및 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (또는 이메일 회원가입)
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: `weather-dashboard` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (기억해두세요!)
   - **Region**: 가장 가까운 지역 선택 (예: Northeast Asia (Seoul))
   - **Pricing Plan**: Free 선택
6. "Create new project" 클릭
7. 프로젝트 생성 완료까지 1-2분 대기

### 1.2 데이터베이스 스키마 생성

1. Supabase 대시보드에서 프로젝트 선택
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. "New query" 클릭
4. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
5. "Run" 버튼 클릭 (또는 `Ctrl + Enter`)
6. "Success. No rows returned" 메시지 확인

### 1.3 API 키 확인

1. 왼쪽 메뉴에서 **Settings** > **API** 클릭
2. 다음 정보를 복사하여 메모장에 저장:
   - **Project URL**: `https://xxxxx.supabase.co` (SUPABASE_URL)
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (SUPABASE_ANON_KEY)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (SUPABASE_SERVICE_KEY) ⚠️ 비공개

### 1.4 인증 설정 (선택사항)

1. **Authentication** > **Settings** 메뉴로 이동
2. 이메일 인증이 기본적으로 활성화되어 있음
3. 필요시 소셜 로그인 (Google, GitHub 등) 활성화 가능

---

## 2단계: Vercel 프로젝트 설정

### 2.1 GitHub에 코드 업로드

1. GitHub에 새 저장소 생성:
   - https://github.com/new 접속
   - Repository name: `weather-dashboard`
   - Public 또는 Private 선택
   - "Create repository" 클릭

2. 로컬에서 Git 초기화 (이미 Git 저장소가 아니라면):
   ```bash
   cd weather-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/사용자이름/weather-dashboard.git
   git push -u origin main
   ```

### 2.2 Vercel에 프로젝트 배포

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Add New..." > "Project" 클릭
4. GitHub 저장소 선택 후 "Import" 클릭
5. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (기본값)
   - "Deploy" 클릭

### 2.3 환경 변수 설정

배포 후 프로젝트 설정에서 환경 변수를 추가해야 합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Environment Variables** 클릭
3. 다음 환경 변수 추가:

#### 필수 환경 변수:

| Key | Value | 설명 |
|-----|-------|------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Service Role Key (비공개) |
| `OPENWEATHER_API_KEY` | `your_openweather_api_key` | OpenWeatherMap API 키 |

4. 각 변수 추가 후:
   - **Environment**: Production, Preview, Development 모두 체크
   - "Save" 클릭
5. 환경 변수 추가 완료 후 프로젝트를 다시 배포해야 합니다:
   - **Deployments** 탭으로 이동
   - 최신 배포 옆 "..." 메뉴 > "Redeploy" 클릭

---

## 3단계: 프론트엔드 수정 (다음 단계에서 진행)

프론트엔드 코드를 수정하여 API를 호출하도록 변경해야 합니다.
이는 별도의 작업으로 진행됩니다.

---

## 4단계: 테스트

### 4.1 API 테스트

1. Vercel 배포 URL 확인 (예: `https://weather-dashboard.vercel.app`)
2. 브라우저에서 다음 URL 접속:
   - `https://your-project.vercel.app/api/weather?q=Seoul`
   - 날씨 정보가 JSON 형태로 반환되어야 합니다

### 4.2 회원가입 테스트

1. 프론트엔드에서 회원가입 페이지 접속
2. 이메일과 비밀번호 입력
3. 회원가입 성공 확인

### 4.3 로그인 및 즐겨찾기 테스트

1. 로그인 페이지에서 로그인
2. 날씨 검색 후 즐겨찾기 추가
3. 즐겨찾기 페이지에서 목록 확인

---

## 🔍 문제 해결

### 환경 변수가 적용되지 않음
- 환경 변수 추가 후 반드시 "Redeploy" 필요
- Vercel Functions Log에서 확인 가능

### 데이터베이스 연결 오류
- Supabase 프로젝트 URL과 키가 정확한지 확인
- Supabase 대시보드에서 프로젝트 상태 확인

### CORS 오류
- API 함수에 CORS 헤더가 설정되어 있는지 확인
- Vercel의 자동 CORS 처리 확인

### 인증 오류
- Supabase에서 인증 설정 확인
- 토큰이 올바르게 전달되는지 확인

---

## 📚 참고 자료

- Supabase 문서: https://supabase.com/docs
- Vercel 문서: https://vercel.com/docs
- Supabase Auth 문서: https://supabase.com/docs/guides/auth

---

## 다음 단계

환경 변수 설정이 완료되면 프론트엔드 코드를 수정하여 실제 API를 호출하도록 변경해야 합니다.

