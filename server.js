/**
 * 간단한 HTTP 서버 실행 스크립트 (Node.js)
 * 개발/테스트 목적으로 사용하세요.
 * 
 * 사용법:
 *     node server.js
 *     또는
 *     npm install -g http-server
 *     npx http-server -p 8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`서버 오류: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Weather Dashboard 서버가 시작되었습니다!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n서버 주소: http://localhost:${PORT}`);
    console.log(`서버 주소: http://127.0.0.1:${PORT}`);
    console.log(`\n서버를 중지하려면 Ctrl+C를 누르세요.`);
    console.log(`${'='.repeat(60)}\n`);
});

