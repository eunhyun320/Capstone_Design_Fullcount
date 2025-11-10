// weatherService.js
const axios = require('axios');
const authKey = "94LfPg3YQdaC3z4N2JHWbA"; 
const daeguLionsPark = { nx: 89, ny: 90 };

const pad = (n) => String(n).padStart(2, '0');

/**
 * API 호출을 위한 기준 시간(tmfcDate)을 계산합니다. (단기예보용)
 * - 현재 시간 - 120분 (안전 여유)
 * - 3시간 간격 발표 시간(02, 05, 08...) 중 가장 가까운 과거 시각으로 맞춤
 */
const computeBaseTmfcDate = () => {
    const now = new Date();
    // 120분 전으로 이동하여 이미 발표된 데이터를 요청 (안전 여유)
    const safeNow = new Date(now.getTime() - 120 * 60 * 1000); 
    
    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let checkDate = new Date(safeNow.getTime());
    let baseHour = checkDate.getHours();
    
    // 현재 시간(시)보다 작거나 같은 가장 가까운 과거 발표 시각을 찾음
    let tmfcHourNum = baseTimes.findLast(h => h <= baseHour);

    if (tmfcHourNum === undefined) {
        tmfcHourNum = 23;
        checkDate.setDate(checkDate.getDate() - 1); 
    }
    
    checkDate.setHours(tmfcHourNum, 0, 0, 0);
    return checkDate;
};

// tmfc 포맷: YYYYMMDDHHMM (MM은 00으로 고정)
const formatTmfc = (d) => {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}00`;
};

// tmef 포맷: YYYYMMDDHH (시까지만 사용)
const formatTmef = (d) => {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}`;
};

/**
 * 그리드 응답에서 유효한 값을 파싱합니다.
 */
const parseValueForTime = (data, timeStr) => {
    if (!data) return '-99.00';
    
    // 1. 데이터 전체를 쉼표로 분리 (그리드 원본 데이터 형식에 맞춤)
    const parts = data.split(',').map(p => p.trim());

    // 2. 파싱된 값들 중에서 -99.00이 아닌 유효한 값을 찾습니다.
    const validValue = parts.find(p => {
        const num = parseFloat(p);
        // 숫자인지, 그리고 -90보다 큰지 확인 (-99.00을 제외)
        return !isNaN(num) && num > -90; 
    });

    if (validValue) {
        // console.log(`[파싱 성공] 유효 값 발견: ${validValue}`);
        return validValue;
    }
    
    // 3. 유효한 값이 없으면 -99.00 반환
    const firstPart = parts[0] || '-99.00';
    if (firstPart.startsWith('ErrorCode')) {
        return '-99.00';
    }
    
    console.warn(`[파싱 경고] 유효한 값 찾기 실패. 첫 번째 값 반환: ${firstPart}`);
    return firstPart; 
};

/**
 * 코드 값을 텍스트로 변환 (단기예보 기준)
 */
const getSkyState = (sky, pty) => {
    const s = parseInt(sky), p = parseInt(pty);
    
    // PTY(강수형태)가 우선
    if (p > 0) { 
        return {1: '비', 2: '비/눈', 3: '눈', 4: '소나기'}[p] || '강수';
    }
    // SKY(하늘상태)
    return {1: '맑음', 3: '구름많음', 4: '흐림'}[s] || '정보 없음';
};

/**
 * KMA 단기예보 데이터를 요청하고 가공하여 반환합니다.
 */
const fetchWeatherInfo = async () => {
    console.log("\n--- [KMA API 호출 시작 (단기예보)] ---");
    let tmfcDate = computeBaseTmfcDate();
    const vars = ['TMP', 'SKY', 'PTY', 'POP']; 
    
    // 최대 9시간 (3회 * 3시간)까지 과거 발표 데이터를 찾아 재시도
    for (let tried = 0; tried <= 3; tried++) {
        const tmfc = formatTmfc(tmfcDate);

        // 1. tmef (미래 예보 시각) 계산: 현재 시각 이후 가장 가까운 정시
        const now = new Date();
        let nextTmefDate = new Date(now.getTime());
        nextTmefDate.setMinutes(0, 0, 0); 
        nextTmefDate.setHours(nextTmefDate.getHours() + 1); 
        const tmef = formatTmef(nextTmefDate); 
        
        // console.log(`[시도 ${tried + 1}] 발표 시각 tmfc=${tmfc}, 미래 예보 시각 tmef=${tmef}`);
        
        try {
            const promises = vars.map(v => {
                // ❗️❗️ 최종 수정 URL: 성공했던 그리드 경로 (/cgi-bin/url/) 사용
                const url = `https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_shrt_grd?tmfc=${tmfc}&tmef=${tmef}&vars=${v}&nx=${daeguLionsPark.nx}&ny=${daeguLionsPark.ny}&authKey=${authKey}`;
                
                return axios.get(url, { responseType: 'text' })
                            .then(r => r.data)
                            .catch(e => {
                                console.warn(`[API 오류] ${v} 요청 실패: ${e.message}`);
                                return null;
                            });
            });
            
            const responses = await Promise.all(promises);
            
            // 1. API 호출 자체가 실패했는지 확인 (401, 404 등)
            if (responses.some(r => r === null)) { 
                tmfcDate = new Date(tmfcDate.getTime() - 3 * 60 * 60 * 1000); 
                continue; 
            }

            // 2. 응답 데이터를 파싱하고 -99.00(데이터 없음) 값 확인
            const parsedResults = responses.map(r => parseValueForTime(r, tmef));
            const [TMP, SKY, PTY, POP] = parsedResults;

            // TMP 값이라도 -99.00이 아니면 성공으로 간주 (최소한 유효한 데이터가 있다는 뜻)
            if (TMP === '-99.00' || SKY === '-99.00') { 
                console.warn(`[데이터 없음] API가 -99.00을 반환했습니다. 3시간 전 데이터로 재시도합니다.`);
                tmfcDate = new Date(tmfcDate.getTime() - 3 * 60 * 60 * 1000);
                continue; 
            }
            
            // 3. 데이터가 유효하면 값 가공 및 반환
            console.log(`[성공] 유효 데이터 시각: ${tmfc}. 예보 시각: ${tmef}`);
            
            const temp = parseFloat(TMP) < -90 ? "정보 없음" : `${TMP}℃`;
            
            let precipitationText;
            const popNum = parseFloat(POP);
            if (popNum < 0 || isNaN(popNum)) { 
                precipitationText = "정보 없음";
            } else if (popNum === 0) {
                precipitationText = "강수없음 (0%)";
            } else {
                precipitationText = `강수확률 ${popNum}%`;
            }
            
            const skyState = getSkyState(SKY, PTY);
            
            // 최종 반환 시각은 요청한 tmef 시각을 사용합니다.
            const finalDisplayHour = pad(nextTmefDate.getHours());
            const finalDisplayMonth = pad(nextTmefDate.getMonth() + 1);
            const finalDisplayDay = pad(nextTmefDate.getDate());

            return `대구 삼성 라이온즈파크 ${finalDisplayMonth}월 ${finalDisplayDay}일 ${finalDisplayHour}시 예보: 기온 ${temp}, 하늘 ${skyState}, 강수 ${precipitationText}`;
            
        } catch (e) { 
            console.error(`[예상치 못한 오류] ${e.message}. 3시간 전 데이터로 재시도합니다.`);
            tmfcDate = new Date(tmfcDate.getTime() - 3 * 60 * 60 * 1000); 
        }
    }
    
    console.error("--- [최대 재시도 횟수 초과] ---");
    return "대구 삼성 라이온즈파크 예보: 현재 유효한 단기예보 데이터가 없습니다.";
};

module.exports = { fetchWeatherInfo };