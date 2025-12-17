// POST /api/auth/login
// 사용자 로그인 API

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // Supabase 클라이언트 생성
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return res.status(500).json({ error: '서버 설정 오류입니다.' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }
      
      if (error.message.includes('Email not confirmed') || error.message.includes('email')) {
        return res.status(403).json({ error: '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.' });
      }
      
      return res.status(500).json({ error: error.message || '로그인 중 오류가 발생했습니다.' });
    }

    // 세션이 없는 경우 처리
    if (!data.session) {
      return res.status(401).json({ error: '세션을 생성할 수 없습니다.' });
    }

    // 사용자 정보 반환
    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
      },
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

