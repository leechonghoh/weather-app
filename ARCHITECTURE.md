# 시스템 아키텍처 설계

현재 시스템을 실제 DB 기반 백엔드로 전환하기 위한 아키텍처 설계 문서입니다.

## 현재 구조 (LocalStorage 기반)

```
Frontend (Browser)
  ├── localStorage에 즐겨찾기 저장
  ├── OpenWeatherMap API 직접 호출
  └── 사용자 인증 없음
```

**문제점:**
- 각 브라우저마다 다른 즐겨찾기
- 다른 기기에서 접근 불가
- API 키가 클라이언트에 노출
- 사용자 계정 시스템 없음

## 목표 구조 (DB 기반)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  index.html  │  │favorites.html│  │  login.html  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                │            │
│           └────────────────┼────────────────┘            │
│                            │                            │
│                    API 호출 (fetch)                      │
└────────────────────────────┼────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────┼────────────────────────────┐
│              Backend API (Vercel Serverless)            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  /api/auth/login     - 로그인                   │   │
│  │  /api/auth/register  - 회원가입                 │   │
│  │  /api/favorites      - 즐겨찾기 CRUD            │   │
│  │  /api/weather        - 날씨 정보 (API 키 프록시)│   │
│  └──────────────────────────────────────────────────┘   │
│                            │                            │
│                    JWT 토큰 인증                         │
└────────────────────────────┼────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
┌───────────────▼──────────┐  ┌──────────▼──────────────┐
│   Supabase (PostgreSQL)   │  │  OpenWeatherMap API     │
│  ┌──────────────────────┐ │  │                        │
│  │  users 테이블        │ │  │  (API 키 보호됨)       │
│  │  favorites 테이블    │ │  │                        │
│  └──────────────────────┘ │  │                        │
└───────────────────────────┘  └────────────────────────┘
```

## 데이터베이스 스키마

### Supabase Auth (자동 생성)
- `auth.users` - 사용자 인증 정보

### 커스텀 테이블

```sql
-- 즐겨찾기 테이블
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  query TEXT NOT NULL,  -- 검색용 쿼리 문자열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 같은 사용자가 같은 도시를 중복 추가 방지
  UNIQUE(user_id, city_name, country)
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 즐겨찾기만 조회/수정 가능
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## API 엔드포인트 설계

### 인증 API

#### POST /api/auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "사용자 이름"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "사용자 이름"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "사용자 이름"
  },
  "token": "jwt_token"
}
```

### 즐겨찾기 API

#### GET /api/favorites
```json
Headers:
  Authorization: Bearer jwt_token

Response (200):
{
  "favorites": [
    {
      "id": "uuid",
      "city_name": "Seoul",
      "country": "KR",
      "query": "Seoul,KR"
    },
    ...
  ]
}
```

#### POST /api/favorites
```json
Headers:
  Authorization: Bearer jwt_token

Request:
{
  "city_name": "Seoul",
  "country": "KR",
  "query": "Seoul,KR"
}

Response (201):
{
  "id": "uuid",
  "city_name": "Seoul",
  "country": "KR",
  "query": "Seoul,KR",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /api/favorites/:id
```json
Headers:
  Authorization: Bearer jwt_token

Response (200):
{
  "message": "즐겨찾기가 삭제되었습니다."
}
```

### 날씨 API

#### GET /api/weather?q=Seoul,KR
```json
Headers:
  Authorization: Bearer jwt_token (선택사항 - 로그인 사용자만)

Response (200):
{
  // OpenWeatherMap API 응답 그대로
}
```

## 환경 변수

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# OpenWeatherMap
OPENWEATHER_API_KEY=your-api-key

# JWT
JWT_SECRET=your-jwt-secret
```

## 프론트엔드 수정 사항

### 1. 인증 시스템 추가

- 로그인 페이지 (`login.html`)
- 회원가입 페이지 (`register.html`)
- 로그인 상태 관리
- 토큰 저장 (localStorage 또는 httpOnly cookie)

### 2. API 호출 전환

**기존:**
```javascript
// localStorage 사용
localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
```

**변경:**
```javascript
// API 호출
async function getFavorites() {
  const token = getAuthToken();
  const response = await fetch('/api/favorites', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

### 3. API 키 보호

**기존:**
```javascript
// script.js에 노출됨
const API_KEY = 'your-api-key';
```

**변경:**
```javascript
// 백엔드 API를 통해 호출
async function getWeather(city) {
  const response = await fetch(`/api/weather?q=${city}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  return await response.json();
}
```

## 보안 고려사항

1. **API 키 보호**
   - OpenWeatherMap API 키는 서버에서만 사용
   - 환경 변수로 관리
   - 클라이언트에 노출되지 않음

2. **인증 토큰**
   - JWT 토큰 사용
   - 만료 시간 설정 (예: 7일)
   - httpOnly cookie 사용 고려 (XSS 방지)

3. **데이터베이스 보안**
   - Row Level Security (RLS) 활성화
   - 사용자는 자신의 데이터만 접근 가능
   - SQL 인젝션 방지 (파라미터화된 쿼리)

4. **HTTPS 필수**
   - 모든 통신은 HTTPS로 암호화
   - Vercel, Supabase는 자동 HTTPS 제공

## 배포 단계

1. **Supabase 프로젝트 생성 및 설정**
   - 데이터베이스 스키마 생성
   - 인증 설정
   - API 키 확인

2. **Vercel 프로젝트 생성**
   - GitHub 저장소 연결
   - 환경 변수 설정
   - Serverless Functions 배포

3. **프론트엔드 수정**
   - API 호출로 전환
   - 인증 플로우 구현
   - 로그인/회원가입 페이지 추가

4. **테스트**
   - 회원가입/로그인 테스트
   - 즐겨찾기 CRUD 테스트
   - 날씨 정보 조회 테스트

5. **배포 및 모니터링**
   - 프로덕션 배포
   - 에러 로그 모니터링
   - 사용자 피드백 수집

## 예상 작업 시간

- Supabase 설정: 30분
- 데이터베이스 스키마 설계 및 구현: 1시간
- 백엔드 API 개발: 4-6시간
- 프론트엔드 수정: 3-4시간
- 테스트 및 버그 수정: 2-3시간
- 배포 및 문서화: 1시간

**총 예상 시간: 12-16시간**

## 기술 스택 요약

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js (Vercel Serverless Functions)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (JWT)
- **Hosting**: Vercel (Frontend + API)
- **External API**: OpenWeatherMap API

