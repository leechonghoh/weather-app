# 배포 가이드

이 문서는 Weather Dashboard 애플리케이션을 배포하는 방법을 안내합니다.

## 배포 전 준비사항

### 1. API 키 설정

1. `script.js` 파일을 열고 상단의 `API_KEY` 값을 설정합니다:
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```

2. `favorites.js` 파일에도 동일한 API 키를 설정합니다:
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```

### 2. 보안 고려사항

⚠️ **중요**: 현재 애플리케이션은 클라이언트 사이드에서 API 키를 사용합니다.
이는 브라우저 개발자 도구를 통해 API 키가 노출될 수 있음을 의미합니다.

**권장사항**:
- 개발/테스트 환경에서만 클라이언트 사이드 API 키 사용
- 프로덕션 환경에서는 백엔드 서버를 통해 API를 호출하는 것을 강력히 권장합니다
- OpenWeatherMap API 키 사용량 제한을 설정하세요

## 배포 방법

### 방법 1: 정적 파일 호스팅 (가장 간단)

이 애플리케이션은 순수 HTML/CSS/JavaScript로 작성되었으므로 
어떤 웹 서버에서도 호스팅할 수 있습니다.

#### GitHub Pages

1. GitHub 저장소에 코드를 업로드
2. Settings > Pages 메뉴로 이동
3. Source를 "main" 브랜치의 "/root" 또는 "/docs" 폴더로 설정
4. 저장소가 공개되어 있다면 `https://username.github.io/repository-name` 주소로 접근 가능

#### Netlify

1. [Netlify](https://www.netlify.com/)에 가입
2. "Add new site" > "Deploy manually" 선택
3. `weather-app` 폴더를 드래그 앤 드롭
4. 즉시 배포 완료

#### Vercel

1. [Vercel](https://vercel.com/)에 가입
2. "New Project" 클릭
3. GitHub 저장소 연결 또는 폴더 업로드
4. 배포 설정 없이 바로 배포 가능

### 방법 2: 자체 웹 서버

#### Apache 웹 서버

1. `weather-app` 폴더를 Apache의 `htdocs` 또는 `www` 디렉토리에 복사
2. 브라우저에서 `http://localhost/weather-app/` 접근

#### Nginx

1. `weather-app` 폴더를 적절한 위치에 배치 (예: `/var/www/weather-app`)
2. Nginx 설정 파일에 다음 추가:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/weather-app;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Nginx 재시작: `sudo systemctl restart nginx`

#### Python Simple HTTP Server (개발/테스트용)

```bash
cd weather-app
python -m http.server 8000
# 또는 Python 2의 경우: python -m SimpleHTTPServer 8000
```

브라우저에서 `http://localhost:8000` 접근

#### Node.js HTTP Server (개발/테스트용)

```bash
cd weather-app
npx http-server -p 8000
```

### 방법 3: 기업 내부 서버 배포

#### 내부 웹 서버

1. 회사 내부 웹 서버 (IIS, Apache, Nginx 등)에 파일 업로드
2. 적절한 디렉토리에 `weather-app` 폴더 복사
3. 내부 네트워크에서 접근 가능한 주소로 설정

#### 로컬 네트워크 공유

1. 공유 폴더에 `weather-app` 폴더 배치
2. 팀원들이 네트워크 경로를 통해 `index.html` 파일 열기
3. 또는 간단한 HTTP 서버 실행 (Python, Node.js 등)

## 배포 후 확인사항

1. ✅ API 키가 올바르게 설정되었는지 확인
2. ✅ 모든 페이지가 정상적으로 로드되는지 확인 (index.html, favorites.html)
3. ✅ 날씨 정보 검색이 정상 작동하는지 확인
4. ✅ 즐겨찾기 기능이 정상 작동하는지 확인
5. ✅ 브라우저 콘솔에 오류가 없는지 확인 (F12 > Console)

## 성능 최적화 (선택사항)

### 이미지 최적화

날씨 아이콘은 OpenWeatherMap에서 제공되므로 별도 최적화 불필요.

### 캐싱 설정

웹 서버 설정에서 정적 파일에 대한 캐싱 헤더 추가:

**Apache (.htaccess)**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

**Nginx**
```nginx
location ~* \.(css|js|png|jpg|jpeg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 문제 해결

### CORS 오류 발생

일부 브라우저에서 `file://` 프로토콜로 직접 열면 CORS 오류가 발생할 수 있습니다.
반드시 HTTP 서버를 통해 접근하세요.

### API 키 오류

- API 키가 올바르게 설정되었는지 확인
- OpenWeatherMap에서 API 키 활성화 확인
- API 호출 한도 확인

### 페이지가 로드되지 않음

- 파일 경로 확인
- 브라우저 콘솔에서 오류 확인
- 웹 서버 로그 확인

## 추가 보안 권장사항

1. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
2. **API 키 제한**: OpenWeatherMap에서 API 키의 사용 도메인을 제한하세요
3. **백엔드 프록시**: 가능하면 백엔드 서버를 통해 API를 호출하세요
4. **Rate Limiting**: API 호출 빈도에 제한을 두세요

## 지원

문제가 발생하면 다음을 확인하세요:
- 브라우저 콘솔 오류 메시지
- 네트워크 탭에서 API 호출 상태
- OpenWeatherMap API 상태 페이지

