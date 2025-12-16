# 최종 배포 가이드 (단계별 실행)

실제 사용자들이 사용할 수 있도록 배포하는 완전한 가이드입니다.

## 🎯 목표

Vercel + Supabase를 사용하여 완전히 작동하는 Weather Dashboard를 배포합니다.

---

## 1단계: Supabase 설정 (약 10분)

### 1.1 Supabase 계정 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일 회원가입

### 1.2 새 프로젝트 생성

1. 대시보드에서 "New Project" 클릭
2. 다음 정보 입력:
   - **Organization**: 기본 조직 사용 (또는 새로 생성)
   - **Name**: `weather-dashboard` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (기억해두세요!)
   - **Region**: Northeast Asia (Seoul) 또는 가장 가까운 지역
   - **Pricing Plan**: Free 선택
3. "Create new project" 클릭
4. 프로젝트 생성 완료 대기 (1-2분)

### 1.3 데이터베이스 스키마 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. "New query" 버튼 클릭
3. `supabase/schema.sql` 파일을 열어서 전체 내용 복사
4. SQL Editor에 붙여넣기
5. 우측 하단 "Run" 버튼 클릭 (또는 `Ctrl + Enter`)
6. "Success. No rows returned" 메시지 확인

### 1.4 API 키 확인

1. 왼쪽 메뉴에서 **Settings** > **API** 클릭
2. 다음 정보를 메모장에 복사해두기:
   - **Project URL**: `https://xxxxx.supabase.co` → 이것이 `SUPABASE_URL`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → 이것이 `SUPABASE_ANON_KEY`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → 이것이 `SUPABASE_SERVICE_KEY` ⚠️ 비공개

---

## 2단계: GitHub에 코드 업로드 (약 5분)

### 2.1 GitHub 저장소 생성

1. https://github.com/new 접속
2. 다음 입력:
   - **Repository name**: `weather-dashboard`
   - **Description**: (선택사항) "Weather Dashboard with Backend"
   - **Public** 또는 **Private** 선택
3. "Create repository" 클릭

### 2.2 로컬 코드 업로드

**방법 1: GitHub Desktop 사용 (가장 쉬움)**

1. GitHub Desktop 다운로드: https://desktop.github.com/
2. GitHub Desktop 실행
3. File > Clone repository
4. "URL" 탭 선택
5. 생성한 저장소 URL 입력: `https://github.com/사용자이름/weather-dashboard.git`
6. "Clone" 클릭
7. `weather-app` 폴더의 모든 파일을 클론된 폴더로 복사
8. GitHub Desktop에서 "Commit to main" 클릭
9. "Push origin" 클릭

**방법 2: 명령줄 사용**

```bash
# weather-app 폴더로 이동
cd weather-app

# Git 초기화 (이미 초기화되어 있지 않은 경우)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Weather Dashboard with Backend"

# GitHub 저장소 연결 (사용자이름과 저장소 이름 변경)
git remote add origin https://github.com/사용자이름/weather-dashboard.git

# 브랜치 이름 변경
git branch -M main

# 업로드
git push -u origin main
```

---

## 3단계: Vercel 배포 (약 5분)

### 3.1 Vercel 계정 생성

1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭 (GitHub 계정으로 로그인)

### 3.2 프로젝트 배포

1. Vercel 대시보드에서 "Add New..." > "Project" 클릭
2. "Import Git Repository"에서 방금 만든 GitHub 저장소 선택
3. "Import" 클릭
4. 프로젝트 설정:
   - **Framework Preset**: Other (또는 그대로 두기)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: (비워두기)
   - **Output Directory**: (비워두기)
5. "Deploy" 클릭
6. 배포 완료까지 1-2분 대기

### 3.3 환경 변수 설정

배포가 완료되면:

1. 프로젝트 대시보드에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 다음 환경 변수를 하나씩 추가:

#### 환경 변수 1: SUPABASE_URL
- **Key**: `SUPABASE_URL`
- **Value**: Supabase에서 복사한 Project URL (예: `https://xxxxx.supabase.co`)
- **Environment**: Production, Preview, Development 모두 체크
- "Save" 클릭

#### 환경 변수 2: SUPABASE_SERVICE_KEY
- **Key**: `SUPABASE_SERVICE_KEY`
- **Value**: Supabase에서 복사한 service_role key
- **Environment**: Production, Preview, Development 모두 체크
- "Save" 클릭

#### 환경 변수 3: OPENWEATHER_API_KEY
- **Key**: `OPENWEATHER_API_KEY`
- **Value**: OpenWeatherMap API 키 (`script.js`에 있던 키)
- **Environment**: Production, Preview, Development 모두 체크
- "Save" 클릭

### 3.4 재배포

환경 변수를 추가한 후 반드시 재배포해야 합니다:

1. **Deployments** 탭 클릭
2. 가장 최신 배포 옆 "..." 메뉴 클릭
3. "Redeploy" 클릭
4. "Use existing Build Cache" 체크 해제 (환경 변수 적용을 위해)
5. "Redeploy" 클릭
6. 배포 완료까지 1-2분 대기

---

## 4단계: 테스트 (약 5분)

### 4.1 기본 접속 확인

1. Vercel 대시보드에서 배포된 URL 확인 (예: `https://weather-dashboard.vercel.app`)
2. 브라우저에서 해당 URL 접속
3. 메인 페이지가 정상적으로 로드되는지 확인

### 4.2 회원가입 테스트

1. 우측 상단 "로그인" 클릭
2. "회원가입" 링크 클릭
3. 테스트 이메일과 비밀번호 입력 (예: `test@example.com` / `test1234`)
4. "회원가입" 버튼 클릭
5. 로그인 페이지로 리다이렉트되는지 확인

### 4.3 로그인 테스트

1. 방금 가입한 이메일과 비밀번호로 로그인
2. 메인 페이지로 이동되며 우측 상단에 이메일이 표시되는지 확인

### 4.4 날씨 검색 테스트

1. 검색창에 "서울" 입력
2. 자동완성 드롭다운에서 "Seoul, KR" 선택
3. 날씨 정보가 정상적으로 표시되는지 확인

### 4.5 즐겨찾기 테스트

1. 날씨 정보가 표시된 상태에서 별 아이콘 클릭
2. 별 아이콘이 채워지는지 확인
3. 상단 메뉴에서 "즐겨찾기" 클릭
4. 방금 추가한 도시가 목록에 나타나는지 확인
5. 별 아이콘을 다시 클릭하여 제거 테스트

### 4.6 일주일 예보 테스트

1. 메인 페이지에서 도시 검색
2. "일주일 날씨 예보" 버튼 클릭
3. 모달이 열리며 예보 정보가 표시되는지 확인
4. 카드형/그래프형 전환 테스트

---

## 5단계: 사용자 공개

### 5.1 최종 확인

모든 테스트가 통과되면:

- [ ] 회원가입/로그인 정상 작동
- [ ] 날씨 검색 정상 작동
- [ ] 즐겨찾기 추가/삭제 정상 작동
- [ ] 일주일 예보 정상 작동
- [ ] HTTPS로 접속됨 (주소창에 자물쇠 아이콘)

### 5.2 사용자에게 안내

다음 정보를 사용자에게 전달:

1. **접속 주소**: `https://your-project-name.vercel.app`
2. **사용 방법**: 간단한 가이드 제공
3. **지원**: 문제 발생 시 연락처

---

## 🔍 문제 해결

### 환경 변수가 적용되지 않음

**증상**: API 호출 시 오류 발생

**해결**:
1. Vercel Settings > Environment Variables에서 변수가 올바르게 설정되었는지 확인
2. **반드시 재배포** (Deployments > ... > Redeploy)
3. 재배포 시 "Use existing Build Cache" 체크 해제

### 데이터베이스 오류

**증상**: 즐겨찾기 추가/조회가 작동하지 않음

**해결**:
1. Supabase 대시보드 > Table Editor에서 `favorites` 테이블이 있는지 확인
2. SQL Editor에서 `schema.sql`을 다시 실행
3. Supabase Settings > API에서 키가 올바른지 확인

### 로그인 오류

**증상**: 로그인 시 "인증이 필요합니다" 오류

**해결**:
1. Supabase Authentication > Settings에서 이메일 인증이 활성화되어 있는지 확인
2. 브라우저 콘솔(F12)에서 오류 메시지 확인
3. Vercel Functions Log에서 API 오류 확인

---

## ✅ 완료!

이제 실제 사용자들이 서비스를 사용할 수 있습니다!

추가 질문이나 문제가 있으면 Vercel 및 Supabase 로그를 확인하세요.

