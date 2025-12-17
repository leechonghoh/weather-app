# 🚀 시작하기

실제 사용자들이 사용할 수 있도록 배포하기 위한 **가장 중요한 문서**입니다.

## ⚡ 빠른 배포 (3단계, 약 20분)

### 1단계: Supabase 설정 (10분)

1. https://supabase.com → 회원가입 → "New Project"
2. SQL Editor에서 `supabase/schema.sql` 전체 내용 실행
3. Settings > API에서 키 복사:
   - Project URL → `SUPABASE_URL`
   - service_role key → `SUPABASE_SERVICE_KEY`

### 2단계: GitHub 업로드 (5분)

1. GitHub에 새 저장소 생성
2. `weather-app` 폴더의 모든 파일 업로드

### 3단계: Vercel 배포 (5분)

1. https://vercel.com → GitHub로 로그인
2. 저장소 Import → Deploy
3. Settings > Environment Variables에 추가:
   - `SUPABASE_URL` = Supabase Project URL
   - `SUPABASE_SERVICE_KEY` = Supabase service_role key
   - `OPENWEATHER_API_KEY` = OpenWeatherMap API 키
4. **재배포 필수** (Deployments > Redeploy)

**완료!** 🎉

---

## 📖 상세 가이드

더 자세한 설명이 필요하면 다음 파일들을 참고하세요:

- **FINAL_SETUP.md**: 완전한 단계별 가이드
- **DEPLOYMENT_CHECKLIST.md**: 체크리스트 및 문제 해결
- **SETUP_GUIDE.md**: Supabase 설정 상세 가이드

---

## ✅ 배포 후 확인

- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 날씨 검색 작동
- [ ] 즐겨찾기 추가/삭제 작동

모두 체크되면 사용자들에게 배포된 URL을 공유하세요!

