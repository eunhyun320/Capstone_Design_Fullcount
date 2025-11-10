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
            // 캐시가 유효하면 세션 값을 res.locals에 주입하고 종료
            res.locals.weatherInfo = req.session.weatherInfo;
            // console.log('[캐시] 날씨 정보 캐시 사용.');
            return next();
        }
    }

    // 2. 캐시가 없거나 만료되면 서비스(API) 호출
    try {
        // 비즈니스 로직을 Service에 위임
        const weatherText = await weatherService.fetchWeatherInfo();
        
        // 3. 세션과 res.locals에 저장 (캐시 업데이트)
        req.session.weatherInfo = weatherText;
        req.session.weatherTimestamp = Date.now();
        res.locals.weatherInfo = weatherText;

    } catch (error) {
        console.error("날씨 정보 조회 실패:", error.message);
        
        // API 호출 실패 시, 기존 캐시가 있으면 그대로 사용, 없으면 오류 메시지 할당
        if (req.session.weatherInfo) {
             res.locals.weatherInfo = req.session.weatherInfo;
             console.warn('[오류 처리] API 호출 실패로 인해 이전 캐시를 사용합니다.');
        } else {
            res.locals.weatherInfo = "날씨 정보를 불러올 수 없습니다.";
        }
    }

    // 4. 다음 미들웨어로 이동
    next();
};