<<<<<<< Updated upstream
#!/usr/bin/env python3
"""
완전한 개발 서버 (API 라우팅 포함)
Python만 설치되어 있으면 작동합니다!

사용법:
    python server_with_api.py
    또는
    python3 server_with_api.py

브라우저에서 http://localhost:8000 접근
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

PORT = 8000

# 환경 변수 로드 (선택사항)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv가 없어도 작동

# 환경 변수 가져오기
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')


class APIHandler:
    """API 요청을 처리하는 클래스"""
    
    @staticmethod
    def handle_register(req_data):
        """회원가입 API 처리"""
        try:
            email = req_data.get('email', '').strip()
            password = req_data.get('password', '')
            name = req_data.get('name', '').strip()
            
            # 입력값 검증
            if not email or not password:
                return {
                    'status': 400,
                    'data': {'error': '이메일과 비밀번호를 입력해주세요.'}
                }
            
            if len(password) < 6:
                return {
                    'status': 400,
                    'data': {'error': '비밀번호는 6자 이상이어야 합니다.'}
                }
            
            # 이메일 형식 검증
            import re
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, email):
                return {
                    'status': 400,
                    'data': {'error': '올바른 이메일 형식을 입력해주세요.'}
                }
            
            # Supabase 설정 확인
            if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다. SUPABASE_URL과 SUPABASE_SERVICE_KEY를 확인해주세요.'}
                }
            
            # Supabase API 호출
            try:
                import urllib.request
                import urllib.parse
                
                url = f"{SUPABASE_URL}/auth/v1/signup"
                data = {
                    'email': email,
                    'password': password,
                    'data': {
                        'name': name or email.split('@')[0]
                    }
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
                    }
                )
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    
                    return {
                        'status': 201,
                        'data': {
                            'user': {
                                'id': result.get('user', {}).get('id'),
                                'email': result.get('user', {}).get('email', email),
                                'name': result.get('user', {}).get('user_metadata', {}).get('name', name or email.split('@')[0])
                            },
                            'token': result.get('session', {}).get('access_token') if result.get('session') else None,
                            'refresh_token': result.get('session', {}).get('refresh_token') if result.get('session') else None,
                            'message': '회원가입이 완료되었습니다.' if result.get('session') else '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
                            'requiresEmailConfirmation': not bool(result.get('session'))
                        }
                    }
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                try:
                    error_data = json.loads(error_body)
                    error_msg = error_data.get('message', '회원가입 중 오류가 발생했습니다.')
                except:
                    error_msg = error_body or '회원가입 중 오류가 발생했습니다.'
                
                if 'already' in error_msg.lower() or 'exists' in error_msg.lower():
                    return {
                        'status': 409,
                        'data': {'error': '이미 등록된 이메일입니다.'}
                    }
                
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
            except Exception as e:
                return {
                    'status': 500,
                    'data': {'error': f'서버 오류: {str(e)}'}
                }
                
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }
    
    @staticmethod
    def handle_login(req_data):
        """로그인 API 처리"""
        try:
            email = req_data.get('email', '').strip()
            password = req_data.get('password', '')
            
            if not email or not password:
                return {
                    'status': 400,
                    'data': {'error': '이메일과 비밀번호를 입력해주세요.'}
                }
            
            if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다.'}
                }
            
            try:
                url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
                data = {
                    'email': email,
                    'password': password
                }
                
                req = urllib.request.Request(
                    url,
                    data=urllib.parse.urlencode(data).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
                    }
                )
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    
                    return {
                        'status': 200,
                        'data': {
                            'user': {
                                'id': result.get('user', {}).get('id'),
                                'email': result.get('user', {}).get('email', email),
                                'name': result.get('user', {}).get('user_metadata', {}).get('name', email.split('@')[0])
                            },
                            'token': result.get('access_token'),
                            'refresh_token': result.get('refresh_token')
                        }
                    }
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                try:
                    error_data = json.loads(error_body)
                    error_msg = error_data.get('error_description', error_data.get('message', '로그인 중 오류가 발생했습니다.'))
                except:
                    error_msg = '이메일 또는 비밀번호가 올바르지 않습니다.'
                
                if e.code == 401:
                    return {
                        'status': 401,
                        'data': {'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}
                    }
                
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
            except Exception as e:
                return {
                    'status': 500,
                    'data': {'error': f'서버 오류: {str(e)}'}
                }
                
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }
    
    @staticmethod
    def handle_weather(query_params):
        """날씨 API 처리"""
        try:
            q = query_params.get('q', [''])[0]
            lat = query_params.get('lat', [''])[0]
            lon = query_params.get('lon', [''])[0]
            
            if not q and (not lat or not lon):
                return {
                    'status': 400,
                    'data': {'error': '도시 이름 또는 좌표를 입력해주세요.'}
                }
            
            if not OPENWEATHER_API_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다. OPENWEATHER_API_KEY를 확인해주세요.'}
                }
            
            # OpenWeatherMap API 호출
            if lat and lon:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=kr"
            else:
                import urllib.parse
                url = f"https://api.openweathermap.org/data/2.5/weather?q={urllib.parse.quote(q)}&appid={OPENWEATHER_API_KEY}&units=metric&lang=kr"
            
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                return {
                    'status': 200,
                    'data': data
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                error_msg = error_data.get('message', '날씨 정보를 가져오는데 실패했습니다.')
            except:
                error_msg = '날씨 정보를 가져오는데 실패했습니다.'
            
            if e.code == 404:
                return {
                    'status': 404,
                    'data': {'error': '도시를 찾을 수 없습니다.'}
                }
            elif e.code == 401:
                return {
                    'status': 500,
                    'data': {'error': 'API 키 오류입니다.'}
                }
            else:
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        """CORS preflight 요청 처리"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def end_headers(self):
        # CORS 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        """GET 요청 처리"""
        # API 요청인지 확인
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # 정적 파일 서빙
            super().do_GET()
    
    def do_POST(self):
        """POST 요청 처리"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_error(404, "Not Found")
    
    def handle_api_request(self):
        """API 요청 처리"""
        try:
            # 요청 본문 읽기
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b''
            
            # 쿼리 파라미터 파싱
            parsed_path = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_path.query)
            
            # 요청 본문 파싱 (POST인 경우)
            req_data = {}
            if body:
                try:
                    req_data = json.loads(body.decode('utf-8'))
                except:
                    pass
            
            # API 경로에 따라 처리
            if self.path.startswith('/api/auth/register'):
                result = APIHandler.handle_register(req_data)
            elif self.path.startswith('/api/auth/login'):
                result = APIHandler.handle_login(req_data)
            elif self.path.startswith('/api/weather'):
                result = APIHandler.handle_weather(query_params)
            elif self.path.startswith('/api/forecast'):
                # 예보는 날씨와 유사하게 처리 (간단화)
                result = APIHandler.handle_weather(query_params)
            else:
                result = {
                    'status': 404,
                    'data': {'error': 'API 엔드포인트를 찾을 수 없습니다.'}
                }
            
            # 응답 전송
            self.send_response(result['status'])
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result['data'], ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        # 로그 형식 개선
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))


def main():
    # 현재 스크립트가 있는 디렉토리로 이동
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 환경 변수 확인
    print("\n환경 변수 확인:")
    print(f"  SUPABASE_URL: {'설정됨' if SUPABASE_URL else '❌ 설정되지 않음'}")
    print(f"  SUPABASE_SERVICE_KEY: {'설정됨' if SUPABASE_SERVICE_KEY else '❌ 설정되지 않음'}")
    print(f"  OPENWEATHER_API_KEY: {'설정됨' if OPENWEATHER_API_KEY else '❌ 설정되지 않음'}")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("\n⚠️  경고: Supabase 환경 변수가 설정되지 않았습니다.")
        print("   회원가입/로그인 기능이 작동하지 않을 수 있습니다.")
        print("   .env 파일을 생성하거나 환경 변수를 설정해주세요.\n")
    
    if not OPENWEATHER_API_KEY:
        print("\n⚠️  경고: OpenWeatherMap API 키가 설정되지 않았습니다.")
        print("   날씨 조회 기능이 작동하지 않을 수 있습니다.\n")
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"\n{'='*60}")
            print(f"✅ Weather Dashboard 서버가 시작되었습니다!")
            print(f"{'='*60}")
            print(f"\n🌐 서버 주소: http://localhost:{PORT}")
            print(f"🌐 서버 주소: http://127.0.0.1:{PORT}")
            print(f"\n📝 API 엔드포인트:")
            print(f"   - POST /api/auth/register (회원가입)")
            print(f"   - POST /api/auth/login (로그인)")
            print(f"   - GET  /api/weather?q=도시명 (날씨 조회)")
            print(f"\n⏹️  서버를 중지하려면 Ctrl+C를 누르세요.")
            print(f"{'='*60}\n")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n서버가 종료되었습니다.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ 오류: 포트 {PORT}가 이미 사용 중입니다.")
            print(f"   다른 포트를 사용하려면 PORT 변수를 변경하세요.")
        else:
            print(f"\n❌ 오류 발생: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

=======
#!/usr/bin/env python3
"""
완전한 개발 서버 (API 라우팅 포함)
Python만 설치되어 있으면 작동합니다!

사용법:
    python server_with_api.py
    또는
    python3 server_with_api.py

브라우저에서 http://localhost:8000 접근
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

PORT = 8000

# 환경 변수 로드 (선택사항)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv가 없어도 작동

# 환경 변수 가져오기
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')


class APIHandler:
    """API 요청을 처리하는 클래스"""
    
    @staticmethod
    def handle_register(req_data):
        """회원가입 API 처리"""
        try:
            email = req_data.get('email', '').strip()
            password = req_data.get('password', '')
            name = req_data.get('name', '').strip()
            
            # 입력값 검증
            if not email or not password:
                return {
                    'status': 400,
                    'data': {'error': '이메일과 비밀번호를 입력해주세요.'}
                }
            
            if len(password) < 6:
                return {
                    'status': 400,
                    'data': {'error': '비밀번호는 6자 이상이어야 합니다.'}
                }
            
            # 이메일 형식 검증
            import re
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, email):
                return {
                    'status': 400,
                    'data': {'error': '올바른 이메일 형식을 입력해주세요.'}
                }
            
            # Supabase 설정 확인
            if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다. SUPABASE_URL과 SUPABASE_SERVICE_KEY를 확인해주세요.'}
                }
            
            # Supabase API 호출
            try:
                import urllib.request
                import urllib.parse
                
                url = f"{SUPABASE_URL}/auth/v1/signup"
                data = {
                    'email': email,
                    'password': password,
                    'data': {
                        'name': name or email.split('@')[0]
                    }
                }
                
                req = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
                    }
                )
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    
                    return {
                        'status': 201,
                        'data': {
                            'user': {
                                'id': result.get('user', {}).get('id'),
                                'email': result.get('user', {}).get('email', email),
                                'name': result.get('user', {}).get('user_metadata', {}).get('name', name or email.split('@')[0])
                            },
                            'token': result.get('session', {}).get('access_token') if result.get('session') else None,
                            'refresh_token': result.get('session', {}).get('refresh_token') if result.get('session') else None,
                            'message': '회원가입이 완료되었습니다.' if result.get('session') else '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
                            'requiresEmailConfirmation': not bool(result.get('session'))
                        }
                    }
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                try:
                    error_data = json.loads(error_body)
                    error_msg = error_data.get('message', '회원가입 중 오류가 발생했습니다.')
                except:
                    error_msg = error_body or '회원가입 중 오류가 발생했습니다.'
                
                if 'already' in error_msg.lower() or 'exists' in error_msg.lower():
                    return {
                        'status': 409,
                        'data': {'error': '이미 등록된 이메일입니다.'}
                    }
                
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
            except Exception as e:
                return {
                    'status': 500,
                    'data': {'error': f'서버 오류: {str(e)}'}
                }
                
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }
    
    @staticmethod
    def handle_login(req_data):
        """로그인 API 처리"""
        try:
            email = req_data.get('email', '').strip()
            password = req_data.get('password', '')
            
            if not email or not password:
                return {
                    'status': 400,
                    'data': {'error': '이메일과 비밀번호를 입력해주세요.'}
                }
            
            if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다.'}
                }
            
            try:
                url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
                data = {
                    'email': email,
                    'password': password
                }
                
                req = urllib.request.Request(
                    url,
                    data=urllib.parse.urlencode(data).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
                    }
                )
                
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    
                    return {
                        'status': 200,
                        'data': {
                            'user': {
                                'id': result.get('user', {}).get('id'),
                                'email': result.get('user', {}).get('email', email),
                                'name': result.get('user', {}).get('user_metadata', {}).get('name', email.split('@')[0])
                            },
                            'token': result.get('access_token'),
                            'refresh_token': result.get('refresh_token')
                        }
                    }
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                try:
                    error_data = json.loads(error_body)
                    error_msg = error_data.get('error_description', error_data.get('message', '로그인 중 오류가 발생했습니다.'))
                except:
                    error_msg = '이메일 또는 비밀번호가 올바르지 않습니다.'
                
                if e.code == 401:
                    return {
                        'status': 401,
                        'data': {'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}
                    }
                
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
            except Exception as e:
                return {
                    'status': 500,
                    'data': {'error': f'서버 오류: {str(e)}'}
                }
                
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }
    
    @staticmethod
    def handle_weather(query_params):
        """날씨 API 처리"""
        try:
            q = query_params.get('q', [''])[0]
            lat = query_params.get('lat', [''])[0]
            lon = query_params.get('lon', [''])[0]
            
            if not q and (not lat or not lon):
                return {
                    'status': 400,
                    'data': {'error': '도시 이름 또는 좌표를 입력해주세요.'}
                }
            
            if not OPENWEATHER_API_KEY:
                return {
                    'status': 500,
                    'data': {'error': '서버 설정 오류입니다. OPENWEATHER_API_KEY를 확인해주세요.'}
                }
            
            # OpenWeatherMap API 호출
            if lat and lon:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=kr"
            else:
                import urllib.parse
                url = f"https://api.openweathermap.org/data/2.5/weather?q={urllib.parse.quote(q)}&appid={OPENWEATHER_API_KEY}&units=metric&lang=kr"
            
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                return {
                    'status': 200,
                    'data': data
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                error_msg = error_data.get('message', '날씨 정보를 가져오는데 실패했습니다.')
            except:
                error_msg = '날씨 정보를 가져오는데 실패했습니다.'
            
            if e.code == 404:
                return {
                    'status': 404,
                    'data': {'error': '도시를 찾을 수 없습니다.'}
                }
            elif e.code == 401:
                return {
                    'status': 500,
                    'data': {'error': 'API 키 오류입니다.'}
                }
            else:
                return {
                    'status': e.code,
                    'data': {'error': error_msg}
                }
        except Exception as e:
            return {
                'status': 500,
                'data': {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            }


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        """CORS preflight 요청 처리"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def end_headers(self):
        # CORS 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        """GET 요청 처리"""
        # API 요청인지 확인
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # 정적 파일 서빙
            super().do_GET()
    
    def do_POST(self):
        """POST 요청 처리"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_error(404, "Not Found")
    
    def handle_api_request(self):
        """API 요청 처리"""
        try:
            # 요청 본문 읽기
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b''
            
            # 쿼리 파라미터 파싱
            parsed_path = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_path.query)
            
            # 요청 본문 파싱 (POST인 경우)
            req_data = {}
            if body:
                try:
                    req_data = json.loads(body.decode('utf-8'))
                except:
                    pass
            
            # API 경로에 따라 처리
            if self.path.startswith('/api/auth/register'):
                result = APIHandler.handle_register(req_data)
            elif self.path.startswith('/api/auth/login'):
                result = APIHandler.handle_login(req_data)
            elif self.path.startswith('/api/weather'):
                result = APIHandler.handle_weather(query_params)
            elif self.path.startswith('/api/forecast'):
                # 예보는 날씨와 유사하게 처리 (간단화)
                result = APIHandler.handle_weather(query_params)
            else:
                result = {
                    'status': 404,
                    'data': {'error': 'API 엔드포인트를 찾을 수 없습니다.'}
                }
            
            # 응답 전송
            self.send_response(result['status'])
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result['data'], ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {'error': f'서버 오류가 발생했습니다: {str(e)}'}
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        # 로그 형식 개선
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))


def main():
    # 현재 스크립트가 있는 디렉토리로 이동
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 환경 변수 확인
    print("\n환경 변수 확인:")
    print(f"  SUPABASE_URL: {'설정됨' if SUPABASE_URL else '❌ 설정되지 않음'}")
    print(f"  SUPABASE_SERVICE_KEY: {'설정됨' if SUPABASE_SERVICE_KEY else '❌ 설정되지 않음'}")
    print(f"  OPENWEATHER_API_KEY: {'설정됨' if OPENWEATHER_API_KEY else '❌ 설정되지 않음'}")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("\n⚠️  경고: Supabase 환경 변수가 설정되지 않았습니다.")
        print("   회원가입/로그인 기능이 작동하지 않을 수 있습니다.")
        print("   .env 파일을 생성하거나 환경 변수를 설정해주세요.\n")
    
    if not OPENWEATHER_API_KEY:
        print("\n⚠️  경고: OpenWeatherMap API 키가 설정되지 않았습니다.")
        print("   날씨 조회 기능이 작동하지 않을 수 있습니다.\n")
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"\n{'='*60}")
            print(f"✅ Weather Dashboard 서버가 시작되었습니다!")
            print(f"{'='*60}")
            print(f"\n🌐 서버 주소: http://localhost:{PORT}")
            print(f"🌐 서버 주소: http://127.0.0.1:{PORT}")
            print(f"\n📝 API 엔드포인트:")
            print(f"   - POST /api/auth/register (회원가입)")
            print(f"   - POST /api/auth/login (로그인)")
            print(f"   - GET  /api/weather?q=도시명 (날씨 조회)")
            print(f"\n⏹️  서버를 중지하려면 Ctrl+C를 누르세요.")
            print(f"{'='*60}\n")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n서버가 종료되었습니다.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ 오류: 포트 {PORT}가 이미 사용 중입니다.")
            print(f"   다른 포트를 사용하려면 PORT 변수를 변경하세요.")
        else:
            print(f"\n❌ 오류 발생: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

>>>>>>> Stashed changes
