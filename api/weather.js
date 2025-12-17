// GET /api/weather?q=city 또는 ?lat=lat&lon=lon - 날씨 정보 조회 (API 키 프록시)

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

  const { q, lat, lon } = req.query;

  // 도시 이름 또는 좌표 중 하나는 필수
  if (!q && (!lat || !lon)) {
    return res.status(400).json({ error: '도시 이름 또는 좌표를 입력해주세요.' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY is not set');
    return res.status(500).json({ error: '서버 설정 오류입니다.' });
  }

  try {
    let url;
    // 좌표로 조회하는 경우
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    } else {
      // 도시 이름으로 조회하는 경우
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${apiKey}&units=metric&lang=kr`;
    }
    
    // API 키를 마스킹하여 로그 출력 (보안)
    const maskedUrl = url.replace(apiKey, '***');
    console.log('OpenWeatherMap API URL:', maskedUrl);
    console.log('Query parameters:', { q, lat, lon });
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = '날씨 정보를 가져오는데 실패했습니다.';
      let errorDetails = null;
      
      // OpenWeatherMap API의 에러 응답 파싱 시도
      try {
        const errorData = await response.json();
        console.error('OpenWeatherMap API error response:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        errorDetails = errorData;
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트 응답 확인
        try {
          const textResponse = await response.text();
          console.error('OpenWeatherMap API text error response:', textResponse);
          errorMessage = textResponse || errorMessage;
        } catch (textError) {
          console.error('Failed to read error response:', textError);
        }
      }
      
      // OpenWeatherMap API의 일반적인 에러 코드 처리
      if (response.status === 401) {
        return res.status(500).json({ 
          error: 'API 키 오류입니다. OPENWEATHER_API_KEY 환경 변수를 확인해주세요.',
          details: errorDetails
        });
      } else if (response.status === 404) {
        // 404인 경우에도 실제 에러 메시지 포함
        return res.status(404).json({ 
          error: errorMessage || '도시를 찾을 수 없습니다.',
          details: errorDetails
        });
      } else if (response.status === 429) {
        return res.status(429).json({ 
          error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          details: errorDetails
        });
      } else {
        return res.status(response.status).json({ 
          error: errorMessage,
          details: errorDetails
        });
      }
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
}

