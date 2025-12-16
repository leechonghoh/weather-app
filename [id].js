// DELETE /api/favorites/[id] - 즐겨찾기 삭제

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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 인증 확인
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const userId = await getUserIdFromToken(token);

  if (!userId) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '즐겨찾기 ID가 필요합니다.' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 먼저 해당 즐겨찾기가 사용자의 것인지 확인
    const { data: favorite, error: checkError } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !favorite) {
      return res.status(404).json({ error: '즐겨찾기를 찾을 수 없습니다.' });
    }

    if (favorite.user_id !== userId) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 삭제
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete favorite error:', error);
      return res.status(500).json({ error: '즐겨찾기 삭제에 실패했습니다.' });
    }

    return res.status(200).json({ message: '즐겨찾기가 삭제되었습니다.' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

