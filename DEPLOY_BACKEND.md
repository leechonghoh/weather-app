# 백엔드 배포 가이드

실제 데이터베이스와 사용자 계정 시스템이 필요한 배포 가이드입니다.

## 🎯 필요한 구성 요소

1. **백엔드 서버** (API 서버)
   - 사용자 인증 (회원가입/로그인)
   - 즐겨찾기 CRUD API
   - OpenWeatherMap API 프록시 (API 키 보안)

2. **데이터베이스**
   - 사용자 정보 저장
   - 즐겨찾기 정보 저장

3. **프론트엔드** (현재 코드)
   - API 호출로 변경 필요

## 📊 배포 옵션 비교 및 추천

### 🥇 1순위 추천: Vercel (Frontend) + Supabase (Backend + DB)

**장점:**
- ✅ 완전 무료 티어 제공 (개인/소규모 프로젝트)
- ✅ 매우 빠른 설정 (1시간 이내 가능)
- ✅ 자동 HTTPS, CDN, 확장성
- ✅ PostgreSQL 데이터베이스 내장
- ✅ 사용자 인증 시스템 내장 (이메일, 소셜 로그인)
- ✅ 실시간 기능 지원 가능
- ✅ 프론트엔드와 백엔드 모두 무료 배포 가능

**단점:**
- ⚠️ 무료 티어에는 제한이 있음 (하지만 소규모 사용에는 충분)
- ⚠️ Vercel의 서버리스 함수는 10초 실행 제한 (대부분의 경우 문제 없음)

**비용:** 완전 무료 (소규모 사용 기준)

**난이도:** ⭐⭐☆☆☆ (중하 - 튜토리얼 따라하면 가능)

**추천 이유:**
- 기업 소개용으로 가장 빠르게 완성 가능
- 무료로 시작해서 필요시 유료로 업그레이드 가능
- 최신 기술 스택 (Next.js, PostgreSQL)
- 관리가 매우 쉬움

---

### 🥈 2순위 추천: Railway 또는 Render

**Railway (railway.app)**
- ✅ 간단한 Git 연동 배포
- ✅ PostgreSQL 자동 설정
- ✅ $5/월부터 시작 (무료 크레딧 제공)
- ✅ 서버리스 + 데이터베이스 통합 관리

**Render (render.com)**
- ✅ 무료 티어 제공 (제한적)
- ✅ PostgreSQL 무료 티어
- ✅ Git 연동 자동 배포
- ✅ 정적 사이트 무료 호스팅

**비용:** 무료 ~ $5/월

**난이도:** ⭐⭐⭐☆☆ (중간)

---

### 🥉 3순위 추천: AWS (Amplify + RDS) 또는 Google Cloud

**AWS**
- ✅ 기업용으로 가장 안정적
- ✅ 무료 티어 12개월 제공
- ⚠️ 설정이 복잡함
- ⚠️ 비용 관리 주의 필요

**Google Cloud**
- ✅ $300 무료 크레딧 제공
- ✅ Firebase와 통합 용이
- ⚠️ 설정 복잡도 높음

**비용:** 무료 티어 있음 (12개월), 이후 $20~50/월 예상

**난이도:** ⭐⭐⭐⭐☆ (중상 - 클라우드 경험 필요)

---

### 💼 4순위: 자체 서버 (VPS)

**DigitalOcean, Linode, AWS EC2 등**
- ✅ 완전한 제어권
- ✅ 기업 내부 서버도 가능
- ⚠️ 직접 서버 관리 필요
- ⚠️ 보안, 백업 등 직접 관리

**비용:** $5~20/월

**난이도:** ⭐⭐⭐⭐⭐ (상 - DevOps 지식 필요)

---

## 🎯 최종 추천: Vercel + Supabase 조합

### 왜 이 조합인가?

1. **빠른 개발 속도**
   - Supabase는 Firebase의 오픈소스 대체제로 PostgreSQL 기반
   - 인증, 데이터베이스, 스토리지가 모두 통합 제공
   - RESTful API 자동 생성

2. **비용 효율**
   - 무료 티어로 시작 가능
   - 사용자 500명 이하, 월 500MB DB까지 무료
   - 기업 소개용으로는 충분

3. **확장성**
   - 트래픽 증가 시 자동 스케일링
   - 필요시 유료 플랜으로 업그레이드 용이

4. **기업 이미지**
   - 최신 기술 스택 사용
   - 빠른 로딩 속도
   - 안정적인 인프라

### 예상 배포 시간

- Supabase 프로젝트 설정: 10분
- 데이터베이스 스키마 설계: 30분
- 백엔드 API 개발: 2-4시간
- 프론트엔드 연동: 1-2시간
- 테스트 및 배포: 1시간

**총 예상 시간: 5-8시간**

---

## 📋 구현 계획 (Vercel + Supabase 기준)

### 1단계: Supabase 프로젝트 설정

1. https://supabase.com 에서 회원가입
2. 새 프로젝트 생성
3. 데이터베이스 URL 및 API 키 확인

### 2단계: 데이터베이스 스키마 설계

```sql
-- 사용자 테이블 (Supabase에서 자동 생성됨)
-- auth.users 테이블 사용

-- 즐겨찾기 테이블
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, city_name, country)
);
```

### 3단계: 백엔드 API (Vercel Serverless Functions)

- `/api/auth/register` - 회원가입
- `/api/auth/login` - 로그인
- `/api/favorites` - 즐겨찾기 목록 조회
- `/api/favorites` POST - 즐겨찾기 추가
- `/api/favorites` DELETE - 즐겨찾기 삭제
- `/api/weather` - 날씨 정보 (API 키 프록시)

### 4단계: 프론트엔드 수정

- localStorage 제거
- API 호출로 변경
- 인증 토큰 관리
- 로그인/회원가입 페이지 추가

---

## 🔄 대안: Firebase (Google)

만약 Supabase 대신 Firebase를 선호한다면:

**장점:**
- ✅ Google 인프라 기반으로 매우 안정적
- ✅ 실시간 데이터베이스 (Firestore)
- ✅ 인증 시스템 강력
- ✅ 무료 티어 제공

**단점:**
- ⚠️ NoSQL 데이터베이스 (SQL이 아닌 문서 기반)
- ⚠️ Supabase 대비 설정이 약간 더 복잡

**비용:** 무료 티어 있음, 유료는 사용량 기반

---

## 💡 추가 고려사항

### 보안

1. **API 키 관리**
   - OpenWeatherMap API 키는 백엔드에서만 사용
   - 환경 변수로 관리
   - 클라이언트에 노출되지 않도록 주의

2. **인증 토큰**
   - JWT 토큰 사용
   - HTTPS 필수
   - 토큰 만료 시간 설정

3. **데이터베이스 보안**
   - Row Level Security (RLS) 설정
   - 사용자별 데이터 접근 제한

### 성능

1. **캐싱**
   - 날씨 데이터는 짧은 시간 캐싱 (5-10분)
   - API 호출 횟수 최소화

2. **데이터베이스 인덱스**
   - user_id, city_name 등 자주 조회하는 필드에 인덱스 추가

---

## 🚀 다음 단계

1. 배포 플랫폼 선택 (추천: Vercel + Supabase)
2. Supabase 프로젝트 생성
3. 데이터베이스 스키마 설계 및 구현
4. 백엔드 API 개발
5. 프론트엔드 수정 및 연동
6. 테스트 및 배포

---

## 📞 지원이 필요한 경우

- Supabase 공식 문서: https://supabase.com/docs
- Vercel 공식 문서: https://vercel.com/docs
- Firebase 공식 문서: https://firebase.google.com/docs

각 플랫폼의 튜토리얼을 따라하면 단계별로 구현할 수 있습니다.

