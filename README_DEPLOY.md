# 🚀 실제 사용자 배포 가이드

이 문서는 **FINAL_SETUP.md**를 간단하게 요약한 것입니다.
실제 사용자들이 사용할 수 있도록 배포하는 가장 중요한 단계만 포함되어 있습니다.

## ⚡ 빠른 배포 (3단계)

### 1️⃣ Supabase 설정 (10분)

1. https://supabase.com → 회원가입 → 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 파일 내용 실행
3. Settings > API에서 키 복사 (Project URL, service_role key)

### 2️⃣ GitHub 업로드 (5분)

1. GitHub에 새 저장소 생성
2. `weather-app` 폴더의 모든 파일 업로드

### 3️⃣ Vercel 배포 (5분)

1. https://vercel.com → GitHub로 로그인 → 프로젝트 Import
2. Settings > Environment Variables에 다음 추가:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `OPENWEATHER_API_KEY`
3. 재배포 (Deployments > Redeploy)

**완료!** 사용자들에게 배포된 URL을 공유하세요.

---

## 📖 상세 가이드

더 자세한 설명이 필요하면 **FINAL_SETUP.md** 파일을 참고하세요.

---

## ✅ 배포 후 확인사항

- [ ] 회원가입 작동 확인
- [ ] 로그인 작동 확인
- [ ] 날씨 검색 작동 확인
- [ ] 즐겨찾기 추가/삭제 작동 확인

---

## 🎉 사용자 공개

모든 확인사항이 완료되면 사용자들에게 다음을 공유:

1. **접속 주소**: `https://your-project.vercel.app`
2. **사용 방법**: 간단한 가이드 제공

