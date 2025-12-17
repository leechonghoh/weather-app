// API 베이스 URL (백엔드 API 사용)
const API_BASE_URL = window.location.origin;
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// API 키는 백엔드에서 관리하므로 클라이언트에서는 사용하지 않음
// 자동완성만 직접 호출 (선택사항 - 백엔드로 옮길 수도 있음)
const GEOCODING_API_KEY = 'b5acca763dca21b4cce9596ca25d1638';

// DOM 요소 가져오기
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');

// 자동완성 관련 변수
let autocompleteTimeout = null;
let selectedIndex = -1;

// 날씨 정보 표시 요소들
const cityName = document.getElementById('cityName');
const date = document.getElementById('date');
const temp = document.getElementById('temp');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const favoriteBtn = document.getElementById('favoriteBtn');
const detailBtn = document.getElementById('detailBtn');
const detailModal = document.getElementById('detailModal');
const closeModal = document.getElementById('closeModal');
const detailCityName = document.getElementById('detailCityName');
const detailContent = document.getElementById('detailContent');
const detailLoading = document.getElementById('detailLoading');
const cardViewBtn = document.getElementById('cardViewBtn');
const graphViewBtn = document.getElementById('graphViewBtn');

// 현재 선택된 도시 정보 저장
let currentCityData = null;
let currentForecastData = null; // 일주일 날씨 데이터 저장
let currentViewMode = 'card'; // 'card' or 'graph'

// 날씨 정보 가져오기 (백엔드 API 사용)
async function getWeather(city) {
    try {
        // 로딩 표시
        showLoading();
        hideError();
        hideWeatherInfo();

        // 백엔드 API 호출
        const apiUrl = `${API_BASE_URL}/api/weather?q=${encodeURIComponent(city)}`;
        console.log('Fetching weather for:', city);
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMessage = '날씨 정보를 가져오는데 실패했습니다.';
            let errorDetails = null;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                errorDetails = errorData.details;
                
                // API 키 오류인 경우 더 명확한 메시지
                if (errorMessage.includes('API 키') || errorMessage.includes('API key')) {
                    errorMessage = 'API 키 오류입니다. 서버 설정을 확인해주세요.';
                }
            } catch (parseError) {
                // JSON 파싱 실패 시 상태 코드에 따른 메시지
                if (response.status === 404) {
                    errorMessage = '도시를 찾을 수 없습니다.';
                } else if (response.status === 500) {
                    errorMessage = '서버 오류가 발생했습니다.';
                } else if (response.status === 400) {
                    errorMessage = '잘못된 요청입니다.';
                } else if (response.status === 401) {
                    errorMessage = 'API 키 오류입니다.';
                } else if (response.status === 429) {
                    errorMessage = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
                } else {
                    errorMessage = `오류가 발생했습니다. (상태 코드: ${response.status})`;
                }
            }
            
            console.error('Weather API error:', {
                status: response.status,
                message: errorMessage,
                details: errorDetails
            });
            
            throw new Error(errorMessage);
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('서버 응답을 처리할 수 없습니다.');
        }

        // 날씨 정보 표시
        displayWeather(data);

    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message);
        hideLoading();
    }
}

// 좌표로 날씨 정보 가져오기
async function getWeatherByCoords(lat, lon) {
    try {
        // 로딩 표시
        showLoading();
        hideError();
        hideWeatherInfo();

        // 백엔드 API 호출
        const response = await fetch(
            `${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`
        );

        if (!response.ok) {
            let errorMessage = '위치 기반 날씨 정보를 가져오는데 실패했습니다.';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                // JSON 파싱 실패 시 상태 코드에 따른 메시지
                if (response.status === 404) {
                    errorMessage = '해당 위치의 날씨 정보를 찾을 수 없습니다.';
                } else if (response.status === 500) {
                    errorMessage = '서버 오류가 발생했습니다.';
                } else {
                    errorMessage = `오류가 발생했습니다. (상태 코드: ${response.status})`;
                }
            }
            
            throw new Error(errorMessage);
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('서버 응답을 처리할 수 없습니다.');
        }

        // 날씨 정보 표시
        displayWeather(data);

    } catch (error) {
        // 위치 기반 날씨 조회 실패는 조용히 처리 (에러 메시지 표시 안 함)
        console.error('Location weather fetch error:', error);
        hideLoading();
        // 위치 기반 조회 실패 시 날씨 정보 숨김 상태 유지
        hideWeatherInfo();
    } finally {
        isLocationWeatherLoading = false;
    }
}

// 날씨 정보 화면에 표시
function displayWeather(data) {
    hideLoading();

    // 현재 도시 데이터 저장
    currentCityData = {
        name: data.name,
        country: data.sys.country,
        query: `${data.name},${data.sys.country}`, // 검색용 키
        lat: data.coord?.lat,
        lon: data.coord?.lon
    };

    // 도시 이름
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    // 현재 날짜
    const today = new Date();
    date.textContent = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    // 온도
    temp.textContent = Math.round(data.main.temp);

    // 체감온도
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    // 습도
    humidity.textContent = `${data.main.humidity}%`;

    // 풍속
    windSpeed.textContent = `${data.wind.speed} m/s`;

    // 기압
    pressure.textContent = `${data.main.pressure} hPa`;

    // 날씨 아이콘 및 설명
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    description.textContent = data.weather[0].description;

    // 즐겨찾기 버튼 상태 업데이트
    updateFavoriteButton();

    // 날씨 정보 표시
    showWeatherInfo();
}

// UI 상태 관리 함수들
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        hideAutocomplete();
        getWeather(city);
    } else {
        showError('도시 이름을 입력해주세요.');
    }
});

// Enter 키 입력 이벤트 (자동완성에서 처리되지 않은 경우만)
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && autocompleteDropdown.classList.contains('hidden')) {
        searchBtn.click();
    }
});

// 즐겨찾기 관련 함수들
function getFavorites() {
    const favorites = localStorage.getItem('weatherFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
}

function isFavorite(cityName, country) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.name === cityName && fav.country === country);
}

function addToFavorites(cityName, country, query) {
    const favorites = getFavorites();
    if (!isFavorite(cityName, country)) {
        favorites.push({ name: cityName, country: country, query: query });
        saveFavorites(favorites);
        return true;
    }
    return false;
}

function removeFromFavorites(cityName, country) {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => !(fav.name === cityName && fav.country === country));
    saveFavorites(filtered);
}

function updateFavoriteButton() {
    if (!currentCityData || !favoriteBtn) return;
    
    try {
        const isFav = isFavorite(currentCityData.name, currentCityData.country);
        
        const svgIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`;
        
        favoriteBtn.innerHTML = svgIcon;
        
        if (isFav) {
            favoriteBtn.classList.add('active');
            favoriteBtn.title = '즐겨찾기에서 제거';
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.title = '즐겨찾기에 추가';
        }
    } catch (error) {
        console.error('Update favorite button error:', error);
    }
}

// 자동완성 관련 함수들
async function searchCities(query) {
    if (!query || query.trim().length < 2) {
        hideAutocomplete();
        return;
    }

    try {
        const response = await fetch(
            `${GEOCODING_API_URL}?q=${encodeURIComponent(query)}&limit=10&appid=${GEOCODING_API_KEY}`
        );

        if (!response.ok) {
            return;
        }

        const cities = await response.json();
        displayAutocomplete(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        hideAutocomplete();
    }
}

function displayAutocomplete(cities) {
    if (cities.length === 0) {
        hideAutocomplete();
        return;
    }

    autocompleteDropdown.innerHTML = '';
    selectedIndex = -1;

    cities.forEach((city, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.dataset.index = index;

        const cityName = city.name;
        const state = city.state ? city.state + ', ' : '';
        const country = city.country;

        item.innerHTML = `
            <span class="autocomplete-city-name">${cityName}</span>
            <span class="autocomplete-city-info">
                ${state ? `<span class="autocomplete-state">${state}</span>` : ''}
                <span class="autocomplete-country">${country}</span>
            </span>
        `;

        item.addEventListener('click', () => {
            selectCity(city);
        });

        item.addEventListener('mouseenter', () => {
            removeSelection();
            item.classList.add('selected');
            selectedIndex = index;
        });

        autocompleteDropdown.appendChild(item);
    });

    autocompleteDropdown.classList.remove('hidden');
}

function hideAutocomplete() {
    autocompleteDropdown.classList.add('hidden');
    selectedIndex = -1;
}

function removeSelection() {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => item.classList.remove('selected'));
}

function selectCity(city) {
    const query = city.state 
        ? `${city.name}, ${city.state}, ${city.country}`
        : `${city.name}, ${city.country}`;
    
    cityInput.value = city.name;
    hideAutocomplete();
    getWeather(query);
}

// Debounce 함수
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(autocompleteTimeout);
        autocompleteTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// 자동완성 검색 (debounced)
const debouncedSearchCities = debounce(searchCities, 300);

// 입력 이벤트 리스너
cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        debouncedSearchCities(query);
    } else {
        hideAutocomplete();
    }
});

// 키보드 이벤트 처리 (화살표 키, Enter, Escape)
cityInput.addEventListener('keydown', (e) => {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        removeSelection();
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        removeSelection();
        if (selectedIndex >= 0) {
            items[selectedIndex].classList.add('selected');
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        items[selectedIndex].click();
    } else if (e.key === 'Escape') {
        hideAutocomplete();
    }
});

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-input-wrapper')) {
        hideAutocomplete();
    }
});

// 즐겨찾기 버튼 클릭 이벤트
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async () => {
        if (!currentCityData) return;

        try {
            const isFav = isFavorite(currentCityData.name, currentCityData.country);
            
            if (isFav) {
                // 즐겨찾기에서 제거
                removeFromFavorites(currentCityData.name, currentCityData.country);
            } else {
                // 즐겨찾기에 추가
                addToFavorites(
                    currentCityData.name, 
                    currentCityData.country, 
                    currentCityData.query
                );
            }
            updateFavoriteButton();
        } catch (error) {
            showError(error.message || '즐겨찾기 작업에 실패했습니다.');
        }
    });
}

// 일주일 날씨 정보 가져오기
async function getForecast(cityQuery) {
    try {
        detailLoading.classList.remove('hidden');
        detailContent.innerHTML = '';

        let url;
        // cityQuery가 좌표 형식인지 확인 (lat,lon)
        if (cityQuery.includes(',') && !isNaN(parseFloat(cityQuery.split(',')[0]))) {
            const [lat, lon] = cityQuery.split(',');
            url = `${API_BASE_URL}/api/forecast?lat=${lat}&lon=${lon}`;
        } else {
            url = `${API_BASE_URL}/api/forecast?q=${encodeURIComponent(cityQuery)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('일주일 날씨 정보를 가져올 수 없습니다.');
        }

        const data = await response.json();
        currentForecastData = data; // 데이터 저장
        renderForecastView();

    } catch (error) {
        detailContent.innerHTML = `<div class="error-message">${error.message}</div>`;
        detailLoading.classList.add('hidden');
    }
}

// 뷰 모드에 따라 표시
function renderForecastView() {
    if (!currentForecastData) return;
    
    detailLoading.classList.add('hidden');
    
    // 도시 이름 표시
    detailCityName.textContent = `${currentForecastData.city.name}, ${currentForecastData.city.country} - 일주일 날씨 예보`;

    if (currentViewMode === 'card') {
        displayForecastCard();
    } else {
        displayForecastGraph();
    }
}

// 카드형 뷰 표시
function displayForecastCard() {
    const data = currentForecastData;
    
    // 날짜별로 그룹화
    const forecastByDate = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        
        if (!forecastByDate[dateKey]) {
            forecastByDate[dateKey] = [];
        }
        forecastByDate[dateKey].push({
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            temp: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            windSpeed: item.wind.speed,
            pressure: item.main.pressure
        });
    });

    // HTML 생성
    let html = '<div class="forecast-container card-view">';
    
    Object.keys(forecastByDate).forEach(dateKey => {
        const items = forecastByDate[dateKey];
        const maxTemp = Math.max(...items.map(i => i.temp));
        const minTemp = Math.min(...items.map(i => i.temp));
        const mainIcon = items[Math.floor(items.length / 2)].icon;

        html += `
            <div class="forecast-day">
                <div class="forecast-day-header">
                    <h3>${dateKey}</h3>
                    <div class="forecast-day-temp-range">
                        <span class="max-temp">${maxTemp}°</span>
                        <span class="min-temp">${minTemp}°</span>
                    </div>
                </div>
                <div class="forecast-day-main">
                    <img src="https://openweathermap.org/img/wn/${mainIcon}@2x.png" alt="날씨 아이콘" class="forecast-main-icon">
                    <p class="forecast-main-desc">${items[Math.floor(items.length / 2)].description}</p>
                </div>
                <div class="forecast-hours">
        `;

        items.forEach(item => {
            html += `
                <div class="forecast-hour-item">
                    <div class="forecast-hour-time">${item.time}</div>
                    <img src="https://openweathermap.org/img/wn/${item.icon}.png" alt="${item.description}" class="forecast-hour-icon">
                    <div class="forecast-hour-temp">${item.temp}°</div>
                    <div class="forecast-hour-details">
                        <div>체감 ${item.feelsLike}°</div>
                        <div>습도 ${item.humidity}%</div>
                        <div>풍속 ${item.windSpeed}m/s</div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    detailContent.innerHTML = html;
}

// 그래프형 뷰 표시
function displayForecastGraph() {
    const data = currentForecastData;
    
    // 모든 데이터 포인트 정리 (시간순)
    const allDataPoints = data.list.map(item => {
        const date = new Date(item.dt * 1000);
        return {
            datetime: date,
            date: date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }),
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            temp: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            windSpeed: item.wind.speed
        };
    });

    // 온도 범위 계산
    const temps = allDataPoints.map(d => d.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const tempRange = maxTemp - minTemp || 1; // 0으로 나누기 방지
    const padding = 10; // 그래프 상하 여백

    // 그래프 높이
    const graphHeight = 400;
    const graphWidth = Math.max(800, allDataPoints.length * 60);

    // SVG 그래프 생성
    let html = `<div class="forecast-graph-container">`;
    
    // 날짜 구분선과 레이블
    html += `<div class="graph-wrapper">`;
    html += `<svg class="temperature-graph" width="${graphWidth}" height="${graphHeight + 100}">`;
    
    // 그리드 라인 (온도 기준선)
    for (let i = 0; i <= 5; i++) {
        const temp = minTemp + (tempRange / 5) * i;
        const y = graphHeight - ((temp - minTemp) / tempRange) * (graphHeight - padding * 2) - padding;
        html += `<line x1="50" y1="${y}" x2="${graphWidth - 50}" y2="${y}" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5"/>`;
        html += `<text x="40" y="${y + 5}" text-anchor="end" fill="#666" font-size="12">${Math.round(temp)}°</text>`;
    }

    // 온도 선 그래프 경로 생성
    let pathData = '';
    allDataPoints.forEach((point, index) => {
        const x = 50 + (index / (allDataPoints.length - 1)) * (graphWidth - 100);
        const y = graphHeight - ((point.temp - minTemp) / tempRange) * (graphHeight - padding * 2) - padding;
        
        if (index === 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });

    // 온도 선 그래프
    html += `<path d="${pathData}" fill="none" stroke="#667eea" stroke-width="3" class="temp-line"/>`;
    
    // 체감온도 선 그래프 경로 생성
    let feelsLikePath = '';
    allDataPoints.forEach((point, index) => {
        const x = 50 + (index / (allDataPoints.length - 1)) * (graphWidth - 100);
        const y = graphHeight - ((point.feelsLike - minTemp) / tempRange) * (graphHeight - padding * 2) - padding;
        
        if (index === 0) {
            feelsLikePath += `M ${x} ${y}`;
        } else {
            feelsLikePath += ` L ${x} ${y}`;
        }
    });

    // 체감온도 선 그래프
    html += `<path d="${feelsLikePath}" fill="none" stroke="#f5576c" stroke-width="2" stroke-dasharray="5,5" class="feels-like-line"/>`;

    // 데이터 포인트와 툴팁
    allDataPoints.forEach((point, index) => {
        const x = 50 + (index / (allDataPoints.length - 1)) * (graphWidth - 100);
        const y = graphHeight - ((point.temp - minTemp) / tempRange) * (graphHeight - padding * 2) - padding;
        
        html += `<circle cx="${x}" cy="${y}" r="5" fill="#667eea" class="data-point" data-index="${index}"/>`;
        
        // 수직선 (시간 표시)
        if (index % 2 === 0) {
            html += `<line x1="${x}" y1="${graphHeight - padding}" x2="${x}" y2="${graphHeight - padding + 10}" stroke="#999" stroke-width="1"/>`;
        }
    });

    html += `</svg>`;
    html += `</div>`;

    // 시간 레이블
    html += `<div class="graph-time-labels">`;
    allDataPoints.forEach((point, index) => {
        if (index % 2 === 0) {
            const x = 50 + (index / (allDataPoints.length - 1)) * (graphWidth - 100);
            html += `<div class="time-label" style="left: ${x}px;">
                <div class="time-value">${point.time}</div>
                <div class="date-value">${point.date}</div>
            </div>`;
        }
    });
    html += `</div>`;

    // 범례
    html += `<div class="graph-legend">
        <div class="legend-item">
            <span class="legend-line temp-legend"></span>
            <span>온도</span>
        </div>
        <div class="legend-item">
            <span class="legend-line feels-like-legend"></span>
            <span>체감온도</span>
        </div>
    </div>`;

    // 상세 정보 (호버 시 표시)
    html += `<div class="graph-tooltip" id="graphTooltip"></div>`;

    // 데이터 포인트 상세 정보
    html += `<div class="graph-data-points">`;
    allDataPoints.forEach((point, index) => {
        html += `
            <div class="graph-data-item" data-index="${index}">
                <div class="graph-data-time">${point.time}</div>
                <div class="graph-data-date">${point.date}</div>
                <img src="https://openweathermap.org/img/wn/${point.icon}.png" alt="${point.description}" class="graph-data-icon">
                <div class="graph-data-temp">${point.temp}°C</div>
                <div class="graph-data-details">
                    <div>체감: ${point.feelsLike}°C</div>
                    <div>습도: ${point.humidity}%</div>
                    <div>풍속: ${point.windSpeed}m/s</div>
                    <div>${point.description}</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    html += `</div>`;
    detailContent.innerHTML = html;

    // 툴팁 이벤트 추가
    addGraphTooltips(allDataPoints, maxTemp, minTemp, tempRange, graphWidth, graphHeight, padding);
}

// 그래프 툴팁 기능
function addGraphTooltips(allDataPoints, maxTemp, minTemp, tempRange, graphWidth, graphHeight, padding) {
    const tooltip = document.getElementById('graphTooltip');
    const dataPoints = document.querySelectorAll('.data-point');
    
    dataPoints.forEach((point, index) => {
        const data = allDataPoints[index];
        
        point.addEventListener('mouseenter', (e) => {
            const x = e.clientX - detailContent.getBoundingClientRect().left;
            const y = e.clientY - detailContent.getBoundingClientRect().top;
            
            tooltip.style.display = 'block';
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y - 10}px`;
            tooltip.innerHTML = `
                <div><strong>${data.time}</strong> ${data.date}</div>
                <div>온도: ${data.temp}°C</div>
                <div>체감: ${data.feelsLike}°C</div>
                <div>습도: ${data.humidity}%</div>
                <div>${data.description}</div>
            `;
        });
        
        point.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

// 모달 열기/닫기
function openDetailModal() {
    if (!currentCityData) return;
    detailModal.classList.remove('hidden');
    
    // 좌표가 있으면 좌표로, 없으면 도시 이름으로 조회
    if (currentCityData.lat && currentCityData.lon) {
        getForecast(`${currentCityData.lat},${currentCityData.lon}`);
    } else {
        getForecast(currentCityData.query);
    }
}

function closeDetailModal() {
    detailModal.classList.add('hidden');
}

// 상세보기 버튼 이벤트
if (detailBtn) {
    detailBtn.addEventListener('click', openDetailModal);
}

// 모달 닫기 이벤트
if (closeModal) {
    closeModal.addEventListener('click', closeDetailModal);
}

// 모달 배경 클릭 시 닫기
if (detailModal) {
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            closeDetailModal();
        }
    });
}

// 뷰 모드 전환
function switchViewMode(mode) {
    currentViewMode = mode;
    
    // 버튼 상태 업데이트
    if (mode === 'card') {
        cardViewBtn.classList.add('active');
        graphViewBtn.classList.remove('active');
    } else {
        cardViewBtn.classList.remove('active');
        graphViewBtn.classList.add('active');
    }
    
    // 뷰 다시 렌더링
    if (currentForecastData) {
        renderForecastView();
    }
}

// 뷰 전환 버튼 이벤트
if (cardViewBtn) {
    cardViewBtn.addEventListener('click', () => switchViewMode('card'));
}

if (graphViewBtn) {
    graphViewBtn.addEventListener('click', () => switchViewMode('graph'));
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
        closeDetailModal();
    }
});

// 위치 조회 중인지 추적하는 플래그
let isLocationWeatherLoading = false;

// 사용자 위치 가져오기 및 날씨 자동 로드
function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        hideLoading();
        isLocationWeatherLoading = false;
        return;
    }

    isLocationWeatherLoading = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon).finally(() => {
                isLocationWeatherLoading = false;
            });
        },
        (error) => {
            // 위치 정보를 가져올 수 없는 경우 조용히 처리
            console.log('Location access denied or unavailable:', error.message);
            hideLoading();
            isLocationWeatherLoading = false;
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // 5분 캐시
        }
    );
}

// 페이지 로드 시 포커스 설정 및 위치 기반 날씨 로드
window.addEventListener('load', () => {
    cityInput.focus();
    
    // 현재 도시 데이터가 없으면 위치 기반 날씨 자동 로드
    if (!currentCityData) {
        getCurrentLocationWeather();
    } else {
        hideLoading();
        isLocationWeatherLoading = false;
    }
});

