const weatherService = require('../services/weatherService');

/**
 * 날씨 정보를 세션 캐시를 기반으로 조회하고 res.locals에 주입하는 미들웨어
 */
exports.loadWeatherInfo = async (req, res, next) => {
    const cacheDuration = 30 * 60 * 1000; // 30분 캐시

    // 1. 캐시 확인
    if (req.session.weatherInfo && req.session.weatherTimestamp) {
        const age = Date.now() - req.session.weatherTimestamp;
        if (age < cacheDuration) {
            res.locals.weatherInfo = req.session.weatherInfo;
            return next();
        }
    }

    // 2. 캐시 없음 → API 호출
    try {
        const weatherInfo = await weatherService.fetchWeatherInfo(); 

        // 3. 캐시 저장
        req.session.weatherInfo = weatherInfo;
        req.session.weatherTimestamp = Date.now();
        res.locals.weatherInfo = weatherInfo;

    } catch (error) {
        console.error("날씨 정보 조회 실패:", error.message);

        if (req.session.weatherInfo) {
            res.locals.weatherInfo = req.session.weatherInfo;
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
