// 즐겨찾기 페이지 JavaScript (API 사용)

import { apiCall, requireAuth, isAuthenticated } from './js/auth.js';

const API_BASE_URL = window.location.origin;

// DOM 요소
const favoritesList = document.getElementById('favoritesList');
const emptyMessage = document.getElementById('emptyMessage');
const refreshAllBtn = document.getElementById('refreshAllBtn');

// 즐겨찾기 관련 함수들
async function getFavorites() {
    try {
        const data = await apiCall('/api/favorites');
        return data.favorites || [];
    } catch (error) {
        console.error('Get favorites error:', error);
        return [];
    }
}

async function removeFromFavorites(id) {
    try {
        await apiCall(`/api/favorites/${id}`, {
            method: 'DELETE',
        });
        await loadFavorites(); // 목록 새로고침
        return true;
    } catch (error) {
        console.error('Remove favorite error:', error);
        throw error;
    }
}

// 날씨 정보 가져오기 (백엔드 API 사용)
async function getWeatherForCity(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/weather?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
            throw new Error(errorData.error || '날씨 정보를 가져올 수 없습니다.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

// 날씨 카드 생성
function createWeatherCard(weatherData, favorite) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    card.dataset.favoriteId = favorite.id;

    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-city-name">${weatherData.name}, ${weatherData.sys.country}</h3>
            <div class="card-actions">
                <button class="card-refresh-btn" title="새로고침">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
                <button class="card-favorite-btn active" title="즐겨찾기에서 제거">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="card-main-info">
            <div class="card-temperature">
                ${Math.round(weatherData.main.temp)}°C
            </div>
            <div class="card-weather-icon">
                <img src="${iconUrl}" alt="${weatherData.weather[0].description}">
                <div class="card-description">${weatherData.weather[0].description}</div>
            </div>
        </div>
        <div class="card-details">
            <div class="card-detail-item">
                <span class="card-detail-label">체감온도</span>
                <span class="card-detail-value">${Math.round(weatherData.main.feels_like)}°C</span>
            </div>
            <div class="card-detail-item">
                <span class="card-detail-label">습도</span>
                <span class="card-detail-value">${weatherData.main.humidity}%</span>
            </div>
            <div class="card-detail-item">
                <span class="card-detail-label">풍속</span>
                <span class="card-detail-value">${weatherData.wind.speed} m/s</span>
            </div>
            <div class="card-detail-item">
                <span class="card-detail-label">기압</span>
                <span class="card-detail-value">${weatherData.main.pressure} hPa</span>
            </div>
        </div>
    `;

    // 즐겨찾기 제거 버튼 이벤트
    const favoriteBtn = card.querySelector('.card-favorite-btn');
    favoriteBtn.addEventListener('click', async () => {
        if (confirm('즐겨찾기에서 제거하시겠습니까?')) {
            try {
                await removeFromFavorites(favorite.id);
            } catch (error) {
                alert(error.message || '즐겨찾기 제거에 실패했습니다.');
            }
        }
    });

    // 새로고침 버튼 이벤트
    const refreshBtn = card.querySelector('.card-refresh-btn');
    refreshBtn.addEventListener('click', async () => {
        await refreshCard(card, favorite);
    });

    return card;
}

// 에러 카드 생성
function createErrorCard(favorite, errorMessage) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    card.dataset.favoriteId = favorite.id;

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-city-name">${favorite.city_name}, ${favorite.country}</h3>
            <div class="card-actions">
                <button class="card-refresh-btn" title="새로고침">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
                <button class="card-favorite-btn active" title="즐겨찾기에서 제거">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="card-error">${errorMessage}</div>
    `;

    // 즐겨찾기 제거 버튼
    const favoriteBtn = card.querySelector('.card-favorite-btn');
    favoriteBtn.addEventListener('click', async () => {
        if (confirm('즐겨찾기에서 제거하시겠습니까?')) {
            try {
                await removeFromFavorites(favorite.id);
            } catch (error) {
                alert(error.message || '즐겨찾기 제거에 실패했습니다.');
            }
        }
    });

    // 새로고침 버튼
    const refreshBtn = card.querySelector('.card-refresh-btn');
    refreshBtn.addEventListener('click', async () => {
        await refreshCard(card, favorite);
    });

    return card;
}

// 로딩 카드 생성
function createLoadingCard(favorite) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    card.innerHTML = `
        <div class="card-loading">
            <div class="spinner"></div>
            <p>날씨 정보를 불러오는 중...</p>
        </div>
    `;
    return card;
}

// 카드 새로고침
async function refreshCard(card, favorite) {
    const loadingCard = createLoadingCard(favorite);
    const parent = card.parentNode;
    parent.replaceChild(loadingCard, card);

    try {
        const weatherData = await getWeatherForCity(favorite.query);
        const newCard = createWeatherCard(weatherData, favorite);
        parent.replaceChild(newCard, loadingCard);
    } catch (error) {
        const errorCard = createErrorCard(favorite, error.message);
        parent.replaceChild(errorCard, loadingCard);
    }
}

// 즐겨찾기 목록 로드
async function loadFavorites() {
    // 인증 확인
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const favorites = await getFavorites();
        
        if (favorites.length === 0) {
            emptyMessage.classList.remove('hidden');
            favoritesList.innerHTML = '';
            refreshAllBtn.classList.add('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');
        refreshAllBtn.classList.remove('hidden');
        favoritesList.innerHTML = '';

        // 각 즐겨찾기에 대해 날씨 정보 가져오기
        for (const favorite of favorites) {
            const loadingCard = createLoadingCard(favorite);
            favoritesList.appendChild(loadingCard);

            try {
                const weatherData = await getWeatherForCity(favorite.query);
                const card = createWeatherCard(weatherData, favorite);
                favoritesList.replaceChild(card, loadingCard);
            } catch (error) {
                const errorCard = createErrorCard(favorite, error.message);
                favoritesList.replaceChild(errorCard, loadingCard);
            }
        }
    } catch (error) {
        console.error('Load favorites error:', error);
        if (error.message.includes('인증')) {
            window.location.href = '/login.html';
        } else {
            alert('즐겨찾기를 불러오는데 실패했습니다.');
        }
    }
}

// 모두 새로고침
if (refreshAllBtn) {
    refreshAllBtn.addEventListener('click', async () => {
        refreshAllBtn.disabled = true;
        refreshAllBtn.innerHTML = '<span>새로고침 중...</span>';
        
        await loadFavorites();
        
        refreshAllBtn.disabled = false;
        refreshAllBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>모두 새로고침</span>
        `;
    });
}

// 페이지 로드 시 즐겨찾기 목록 표시
window.addEventListener('load', () => {
    loadFavorites();
});
