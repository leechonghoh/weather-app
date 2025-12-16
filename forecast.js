// GET /api/forecast?q=city - 일주일 날씨 예보 조회 (API 키 프록시)

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: '도시 이름을 입력해주세요.' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY is not set');
    return res.status(500).json({ error: '서버 설정 오류입니다.' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric&lang=kr`;
    
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: '도시를 찾을 수 없습니다.' });
      } else if (response.status === 401) {
        return res.status(500).json({ error: 'API 키 오류입니다.' });
      } else {
        return res.status(response.status).json({ error: '날씨 예보를 가져오는데 실패했습니다.' });
      }
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Forecast API error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

