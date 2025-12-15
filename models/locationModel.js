// models/locationModel.js (최종 수정본)
const { allPoiData } = require('../Data/poiData');

/**
 * POI 마커 데이터 (DB 대체용: 메모리 배열 사용)
 * - NOTE: 프론트엔드에서 예상하는 필드 이름으로 데이터를 매핑합니다.
 */

/**
 * POI 목록 조회 (메모리 배열 사용)
 * - 선택 필터: type, q(이름/설명 키워드), floor (층)
 * @param {object} filterOptions - 필터 옵션
 * @param {string} [filterOptions.type] - 타입 필터 ('매점' 또는 '편의시설')
 * @param {string} [filterOptions.q] - 키워드 필터 (이름/설명)
 * @param {string} [filterOptions.floor] - 층 필터 (예: '1층', '2층' 등)
 * @returns {Promise<Array<object>>}
 */
exports.getPoiList = async ({ type, q, floor } = {}) => {
    // 1. 데이터 필터링 (WHERE 절 로직 구현)
    let filteredData = allPoiData.filter(r => {
        let passesTypeFilter = true;
        let passesKeywordFilter = true;
        let passesFloorFilter = true;

        // type 필터
        if (type) {
            passesTypeFilter = r.type === type;
        }

        // q (키워드) 필터
        if (q) {
            const lowerQ = q.toLowerCase();
            // r.name과 r.desc는 이전 poiData에서 정의한 필드
            const name = r.name ? r.name.toLowerCase() : '';
            const desc = r.desc ? r.desc.toLowerCase() : ''; 
            
            passesKeywordFilter = name.includes(lowerQ) || desc.includes(lowerQ);
        }

        // floor 필터
        if (floor) {
            const floorValue = String(floor).toLowerCase().replace('층', '');
            if (floorValue !== 'all' && floorValue !== '') {
                const poiFloorValue = r.floor ? String(r.floor).toLowerCase().replace('층', '') : '';
                passesFloorFilter = poiFloorValue === floorValue;
            }
        }
        
        return passesTypeFilter && passesKeywordFilter && passesFloorFilter;
    });

    // 2. 데이터 정렬
    // DB에서 가져온 데이터가 아니므로 'id' 필드를 기준으로 정렬합니다. (DB 필드인 poi_id 대신)
    filteredData.sort((a, b) => {
        // ID 필드를 F1, I1 등으로 가정하고 문자열 비교를 통해 내림차순 정렬
        if (b.id < a.id) return -1;
        if (b.id > a.id) return 1;
        return 0;
    });


    // 3. 필드 매핑 (클라이언트 요구사항에 맞춤)
    return filteredData.map(r => ({
        // r.id는 poiData에서 가공 시 할당된 'F1', 'I2' 같은 ID 값입니다.
        id: r.id, 
        type: r.type,
        name: r.name,
        items: r.desc, // description/desc -> items
        image: r.image_url || r.image_path, // image_url이 없으면 image_path를 사용 (poiData에 맞춤)
        lat: r.lat,
        lng: r.lng,
        floor: r.floor
    }));
};