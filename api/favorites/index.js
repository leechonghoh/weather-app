// GET /api/favorites - 즐겨찾기 목록 조회
// POST /api/favorites - 즐겨찾기 추가

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// 토큰에서 사용자 ID 가져오기
async function getUserIdFromToken(token) {
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 인증 확인
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const userId = await getUserIdFromToken(token);

  if (!userId) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // GET: 즐겨찾기 목록 조회
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get favorites error:', error);
        return res.status(500).json({ error: '즐겨찾기를 불러오는데 실패했습니다.' });
      }

      return res.status(200).json({ favorites: data || [] });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }

  // POST: 즐겨찾기 추가
  if (req.method === 'POST') {
    try {
      const { city_name, country, query } = req.body;

      if (!city_name || !country || !query) {
        return res.status(400).json({ error: '도시 정보를 모두 입력해주세요.' });
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          city_name,
          country,
          query,
        })
        .select()
        .single();

      if (error) {
        console.error('Add favorite error:', error);
        
        if (error.code === '23505') { // Unique violation
          return res.status(409).json({ error: '이미 즐겨찾기에 추가된 도시입니다.' });
        }
        
        return res.status(500).json({ error: '즐겨찾기 추가에 실패했습니다.' });
      }

      return res.status(201).json({ favorite: data });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

