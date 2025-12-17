<<<<<<< Updated upstream
/**
 * 로컬 개발 서버 (Express 기반)
 * API 라우팅을 포함한 개발 서버
 * 
 * 사용법:
 *     npm install express cors dotenv
 *     node dev-server.js
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API 라우트 동적 로드
async function loadApiRoute(apiPath) {
  try {
    const handler = require(path.resolve(apiPath));
    return handler.default || handler;
  } catch (error) {
    console.error(`Failed to load API route: ${apiPath}`, error);
    return null;
  }
}

// API 라우트 처리
app.all('/api/*', async (req, res) => {
  try {
    // /api/auth/register -> ./api/auth/register.js
    const apiPath = req.path.replace('/api', './api') + '.js';
    const handler = await loadApiRoute(apiPath);
    
    if (!handler) {
      return res.status(404).json({ error: 'API 엔드포인트를 찾을 수 없습니다.' });
    }

    // Vercel 스타일의 req, res 객체 생성
    const vercelReq = {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers,
    };

    const vercelRes = {
      status: (code) => ({
        json: (data) => {
          res.status(code).json(data);
        },
        end: () => {
          res.status(code).end();
        },
      }),
      setHeader: (name, value) => {
        res.setHeader(name, value);
      },
      json: (data) => {
        res.json(data);
      },
    };

    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 정적 파일 서빙
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path === '/' ? 'index.html' : req.path));
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Weather Dashboard 개발 서버가 시작되었습니다!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n서버 주소: http://localhost:${PORT}`);
  console.log(`서버 주소: http://127.0.0.1:${PORT}`);
  console.log(`\nAPI 엔드포인트: http://localhost:${PORT}/api/*`);
  console.log(`\n서버를 중지하려면 Ctrl+C를 누르세요.`);
  console.log(`${'='.repeat(60)}\n`);
});

=======
/**
 * 로컬 개발 서버 (Express 기반)
 * API 라우팅을 포함한 개발 서버
 * 
 * 사용법:
 *     npm install express cors dotenv
 *     node dev-server.js
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API 라우트 동적 로드
async function loadApiRoute(apiPath) {
  try {
    const handler = require(path.resolve(apiPath));
    return handler.default || handler;
  } catch (error) {
    console.error(`Failed to load API route: ${apiPath}`, error);
    return null;
  }
}

// API 라우트 처리
app.all('/api/*', async (req, res) => {
  try {
    // /api/auth/register -> ./api/auth/register.js
    const apiPath = req.path.replace('/api', './api') + '.js';
    const handler = await loadApiRoute(apiPath);
    
    if (!handler) {
      return res.status(404).json({ error: 'API 엔드포인트를 찾을 수 없습니다.' });
    }

    // Vercel 스타일의 req, res 객체 생성
    const vercelReq = {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers,
    };

    const vercelRes = {
      status: (code) => ({
        json: (data) => {
          res.status(code).json(data);
        },
        end: () => {
          res.status(code).end();
        },
      }),
      setHeader: (name, value) => {
        res.setHeader(name, value);
      },
      json: (data) => {
        res.json(data);
      },
    };

    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 정적 파일 서빙
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path === '/' ? 'index.html' : req.path));
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Weather Dashboard 개발 서버가 시작되었습니다!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n서버 주소: http://localhost:${PORT}`);
  console.log(`서버 주소: http://127.0.0.1:${PORT}`);
  console.log(`\nAPI 엔드포인트: http://localhost:${PORT}/api/*`);
  console.log(`\n서버를 중지하려면 Ctrl+C를 누르세요.`);
  console.log(`${'='.repeat(60)}\n`);
});

>>>>>>> Stashed changes
