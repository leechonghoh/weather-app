#!/usr/bin/env python3
"""
간단한 HTTP 서버 실행 스크립트
개발/테스트 목적으로 사용하세요.

사용법:
    python server.py
    또는
    python3 server.py

브라우저에서 http://localhost:8000 접근
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # 로그 형식 개선
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def main():
    # 현재 스크립트가 있는 디렉토리로 이동
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"\n{'='*60}")
            print(f"Weather Dashboard 서버가 시작되었습니다!")
            print(f"{'='*60}")
            print(f"\n서버 주소: http://localhost:{PORT}")
            print(f"서버 주소: http://127.0.0.1:{PORT}")
            print(f"\n서버를 중지하려면 Ctrl+C를 누르세요.")
            print(f"{'='*60}\n")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n서버가 종료되었습니다.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n오류: 포트 {PORT}가 이미 사용 중입니다.")
            print(f"다른 포트를 사용하려면 PORT 변수를 변경하세요.")
        else:
            print(f"\n오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

