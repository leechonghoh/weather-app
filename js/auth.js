// 인증 관련 유틸리티 함수

const API_BASE_URL = window.location.origin;

// 토큰 저장/조회/삭제
export function getAuthToken() {
    return localStorage.getItem('auth_token');
}

export function setAuthToken(token) {
    localStorage.setItem('auth_token', token);
}

export function removeAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
}

// 사용자 정보 저장/조회
export function getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
}

export function setUserInfo(user) {
    localStorage.setItem('user_info', JSON.stringify(user));
}

// 로그인 상태 확인
export function isAuthenticated() {
    return !!getAuthToken();
}

// API 호출 헬퍼 함수
export async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };
    
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('API call:', url);
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Endpoint:', endpoint);
        console.log('Method:', config.method || 'GET');
        
        const response = await fetch(url, config);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Content-Type 확인
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        if (!isJson) {
            // JSON이 아닌 경우 (HTML 에러 페이지 등)
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 500));
            
            if (response.status === 404) {
                throw new Error(`API 엔드포인트를 찾을 수 없습니다. (${url})\n\n가능한 원인:\n1. Vercel에 배포되지 않았습니다\n2. API 라우팅이 설정되지 않았습니다\n3. vercel.json 파일을 확인하세요`);
            } else if (response.status >= 500) {
                throw new Error(`서버 오류가 발생했습니다. (상태 코드: ${response.status})\n\nVercel 로그를 확인하세요.`);
            } else {
                throw new Error(`서버 응답 오류 (상태 코드: ${response.status})\n\n응답: ${text.substring(0, 100)}`);
            }
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.error || '요청에 실패했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        // 네트워크 오류 (fetch 실패)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`네트워크 오류: API 서버에 연결할 수 없습니다.\n\nURL: ${API_BASE_URL}${endpoint}\n\n가능한 원인:\n1. 인터넷 연결을 확인하세요\n2. Vercel에 배포되었는지 확인하세요\n3. 브라우저 콘솔(F12)에서 자세한 오류를 확인하세요`);
        }
        
        // JSON 파싱 오류인 경우 더 명확한 메시지
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            throw new Error(`서버 응답을 처리할 수 없습니다.\n\nAPI 엔드포인트: ${API_BASE_URL}${endpoint}\n\n가능한 원인:\n1. API가 HTML 페이지를 반환하고 있습니다\n2. Vercel 배포가 완료되지 않았습니다\n3. vercel.json 설정을 확인하세요`);
        }
        
        // 이미 Error 객체인 경우 그대로 전달
        if (error instanceof Error) {
            throw error;
        }
        
        // 기타 오류
        throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
}

// 회원가입
export async function register(email, password, name) {
    const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
    
    if (data.token) {
        setAuthToken(data.token);
        setUserInfo(data.user);
    }
    
    return data;
}

// 로그인
export async function login(email, password) {
    const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
        setAuthToken(data.token);
        setUserInfo(data.user);
    }
    
    return data;
}

// 로그아웃
export function logout() {
    removeAuthToken();
    window.location.href = '/login.html';
}

// 로그인이 필요한 페이지에서 인증 확인
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

