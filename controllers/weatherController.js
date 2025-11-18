const weatherService = require('../services/weatherService');

// 서버 메모리 캐시 (모든 사용자 공유)
let weatherCache = {
    data: null,
    timestamp: null
};

/**
 * 날씨 정보를 서버 메모리 캐시 기반으로 조회하고 res.locals에 주입하는 미들웨어
 */
exports.loadWeatherInfo = async (req, res, next) => {
    const cacheDuration = 30 * 60 * 1000; // 30분 캐시

    // 1. 메모리 캐시 확인
    if (weatherCache.data && weatherCache.timestamp) {
        const age = Date.now() - weatherCache.timestamp;
        if (age < cacheDuration) {
            res.locals.weatherInfo = weatherCache.data;
            return next();
        }
    }

    // 2. 캐시 없음 → API 호출
    try {
        const weatherInfo = await weatherService.fetchWeatherInfo(); 

        // 3. 서버 메모리에 캐시 저장
        weatherCache.data = weatherInfo;
        weatherCache.timestamp = Date.now();
        res.locals.weatherInfo = weatherInfo;

    } catch (error) {
        console.error("날씨 정보 조회 실패:", error.message);

        if (weatherCache.data) {
            res.locals.weatherInfo = weatherCache.data;
            console.warn('[오류 처리] 이전 캐시 사용.');
        } else {
            // PC/모바일 구분되니까 이렇게
            res.locals.weatherInfo = {
                pc: "날씨 정보를 불러올 수 없습니다.",
                mobile: "날씨 오류"
            };
        }
    }

    next();
};
