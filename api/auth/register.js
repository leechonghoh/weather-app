// POST /api/auth/register
// 사용자 회원가입 API

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
    const { email, password, name } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '올바른 이메일 형식을 입력해주세요.' });
    }

    // Supabase 클라이언트 생성
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return res.status(500).json({ error: '서버 설정 오류입니다.' });
    }

    // Supabase 클라이언트 생성
    // service_role key를 사용하면 이메일 확인을 우회할 수 있음
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 회원가입
    // ⚠️ 중요: Supabase 설정에서 "Enable email confirmations"를 비활성화해야 합니다
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
        // 이메일 확인이 비활성화되어 있으면 세션이 바로 생성됨
      },
    });

    if (error) {
      console.error('Registration error:', error);
      
      // Supabase 에러 메시지 처리
      if (error.message.includes('already registered') || 
          error.message.includes('already exists') || 
          error.message.includes('User already registered') ||
          error.message.includes('already been registered')) {
        return res.status(409).json({ error: '이미 등록된 이메일입니다.' });
      }
      
      if (error.message.includes('Password')) {
        return res.status(400).json({ error: '비밀번호 형식이 올바르지 않습니다.' });
      }
      
      return res.status(500).json({ 
        error: error.message || '회원가입 중 오류가 발생했습니다.',
        hint: 'Supabase 설정에서 이메일 확인을 비활성화했는지 확인하세요.'
      });
    }

    // 사용자 정보 반환
    // 이메일 확인이 비활성화되어 있으면 세션이 생성됨
    if (data.user) {
      return res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || name || email.split('@')[0],
        },
        token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
        message: data.session 
          ? '회원가입이 완료되었습니다.' 
          : '회원가입이 완료되었습니다. Supabase 설정에서 이메일 확인을 비활성화하세요.',
        requiresEmailConfirmation: !data.session,
      });
    }

    // 예상치 못한 경우
    return res.status(500).json({ 
      error: '회원가입 중 오류가 발생했습니다.',
      hint: 'Supabase 설정을 확인하세요.'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

