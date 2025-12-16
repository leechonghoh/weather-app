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
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '요청에 실패했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
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

