// models/locationModel.js (수정된 코드)
const { allPoiData:markersData } = require('../Data/poiData'); // CommonJS 환경을 가정
/**
 * 🏟️ POI 마커 데이터 (DB 대체용)
 * NOTE: DB 모델의 getPoiList 함수에서 예상하는 필드 이름으로 데이터를 매핑해야 합니다.
 * DB 필드: poi_id, name, type, desc, lat, lng, image_url, floor
 */


/**
 * POI 목록 조회 (메모리 배열 사용)
 * - 선택 필터: type, q(이름/설명 키워드), floor (층)
 * @param {object} filterOptions - 필터 옵션
 * @param {string} [filterOptions.type] - 타입 필터 ('매점' 또는 '편의시설')
 * @param {string} [filterOptions.q] - 키워드 필터 (이름/설명)
 * @param {string} [filterOptions.floor] - 층 필터 (예: '1층', '2층' 등) 🚩 추가됨
 * @returns {Promise<Array<object>>}
 */
exports.getPoiList = async ({ type, q, floor } = {}) => { // 🚩 floor 매개변수 추가
    // 1. 데이터 필터링 (WHERE 절 로직 구현)
    let filteredData = allPoiData.filter(r => {
        let passesTypeFilter = true;
        let passesKeywordFilter = true;
        let passesFloorFilter = true; // 🚩 층 필터 플래그

        // type 필터
        if (type) {
            passesTypeFilter = r.type === type;
        }

        // q (키워드) 필터
        if (q) {
            const lowerQ = q.toLowerCase();
            const name = r.name ? r.name.toLowerCase() : '';
            const desc = r.desc ? r.desc.toLowerCase() : '';
            
            passesKeywordFilter = name.includes(lowerQ) || desc.includes(lowerQ);
        }

        // 🚩 floor 필터
        if (floor) {
            // floor 값이 'all'이 아니거나 빈 문자열이 아닌 경우에만 필터링 적용
            const floorValue = String(floor).toLowerCase().replace('층', '');
            if (floorValue !== 'all' && floorValue !== '') {
                // 데이터의 floor 값을 숫자 부분만 추출하여 비교 (예: '1층' -> '1')
                const poiFloorValue = r.floor ? String(r.floor).toLowerCase().replace('층', '') : '';
                passesFloorFilter = poiFloorValue === floorValue;
            }
        }
        
        return passesTypeFilter && passesKeywordFilter && passesFloorFilter; // 🚩 세 조건 모두 만족해야 함
    });

    // 2. 데이터 정렬 (여기서는 poi_id 기준 내림차순 정렬 유지)
    filteredData.sort((a, b) => (b.poi_id > a.poi_id ? 1 : a.poi_id > b.poi_id ? -1 : 0));


    // 3. 필드 매핑
    // locatino.js에서 예상하는 프론트엔드 친화적인 키로 변환
    return filteredData.map(r => ({
        id: r.poi_id,
        type: r.type,
        name: r.name,
        items: r.desc, // description/desc -> items
        image: r.image_url,
        lat: r.lat,
        lng: r.lng,
        floor: r.floor
    }));
};