// models/locationModel.js (수정된 코드)

/**
 * 🏟️ POI 마커 데이터 (DB 대체용)
 * NOTE: DB 모델의 getPoiList 함수에서 예상하는 필드 이름으로 데이터를 매핑해야 합니다.
 * DB 필드: poi_id, name, type, desc, lat, lng, image_url, floor
 */
const foodMarkersData = [
    { name: 'CU(1층)', lat: 35.8416621, lng: 128.6823173, type: '매점', floor: '1층' }, // 'type'을 '매점'으로 사용
    { name: '버터우드', lat: 35.8416461, lng: 128.6822179, type: '매점', floor: '1층' },
    { name: '알통떡강정(1층)', lat: 35.8416727, lng: 128.6820677, type: '매점', floor: '1층' },
    { name: '스트릿츄러스(1층)', lat: 35.8416727, lng: 128.6821000, type: '매점', floor: '1층' },
    { name: '&지코바(1층)', lat: 35.8412811, lng: 128.6803687, type: '매점', floor: '1층' },
    { name: 'WOKSTER', lat: 35.84400, lng: 128.68070, type: '매점', floor: '2층' }, // 층 정보 추정
    { name: '맘스터치', lat: 35.84824, lng: 128.6805, type: '매점', floor: '2층' }, // 층 정보 추정
    { name: '버터우드X상하목장', lat: 35.84390, lng: 128.68075, type: '매점', floor: '2층' }, // 층 정보 추정
    { name: '브뤼셀프라이', lat: 35.8411685, lng: 128.6808656, type: '매점', floor: '2층' }, // 층 정보 추정
    { name: 'CU(2층)', lat: 35.84165, lng: 128.68115, type: '매점', floor: '2층' },
    { name: '파파존스피자', lat: 35.84165, lng: 128.6811, type: '매점', floor: '2층' },
    { name: '리얼키친더홈', lat: 35.8416463, lng: 128.6812752, type: '매점', floor: '2층' },
    { name: '북촌손만두(2층)', lat: 35.8418208, lng: 128.681, type: '매점', floor: '2층' },
    { name: '해피치즈스마일(2층)', lat: 35.8412212, lng: 128.6809734, type: '매점', floor: '2층' },
    { name: '해피크레페', lat: 35.84150, lng: 128.68180, type: '매점', floor: '2층' }, // 층 정보 추정
    { name: '맥주부스(2층) - 리얼키친더흥맥주', lat: 35.8414724, lng: 128.6823676, type: '매점', floor: '2층' },
    { name: '몽블랑드파리', lat: 35.8412213, lng: 128.6824749, type: '매점', floor: '2층' },
    { name: '리얼피그', lat: 35.84122, lng: 128.6808, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '블루독', lat: 35.84122, lng: 128.6811, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '만재네', lat: 35.84100, lng: 128.6806, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '전설스낵', lat: 35.84110, lng: 128.6806, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '북촌손만두(3층)', lat: 35.84092, lng: 128.6807, type: '매점', floor: '3층' },
    { name: '전설꼬치', lat: 35.84122, lng: 128.681, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '알통떡강정(3층)', lat: 35.84122, lng: 128.6807, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '해피치즈스마일(3층)', lat: 35.84122, lng: 128.681, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '리얼누들', lat: 35.84098, lng: 128.6806, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '버터우드(3층)', lat: 35.84100, lng: 128.6807, type: '매점', floor: '3층' }, // 층 정보 추정
    { name: '맥주부스(3층)', lat: 35.84136, lng: 128.6807, type: '매점', floor: '3층' },
    { name: '파티플로어(4층)', lat: 35.8402311, lng: 128.6813372, type: '매점', floor: '4층' },
    { name: '맥주부스(4층)', lat: 35.840229, lng: 128.6813821, type: '매점', floor: '4층' },
    { name: 'CU(5층)', lat: 35.8415599, lng: 128.6810882, type: '매점', floor: '5층' },
    { name: '빙수집', lat: 35.8415376, lng: 128.6810621, type: '매점', floor: '5층' },
    { name: 'STATION&해피치즈스마일', lat: 35.8414713, lng: 128.6809434, type: '매점', floor: '5층' },
    { name: '장여사 나뭇잎 손만두', lat: 35.84160, lng: 128.68100, type: '매점', floor: '5층' }, // 층 정보 추정
    { name: '지코바(5층)', lat: 35.84154, lng: 128.68115, type: '매점', floor: '5층' },
    { name: '요아정', lat: 35.8415208, lng: 128.6810225, type: '매점', floor: '5층' },
    { name: '스트릿츄러스(5층)', lat: 35.84158, lng: 128.68095, type: '매점', floor: '5층' },
    { name: '맥주부스(5층)', lat: 35.84162, lng: 128.68098, type: '매점', floor: '5층' }
];

const facilitiesData = [
    { name: '편의시설구분용테스터', lat: 35.8410691, lng: 128.6817501, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '출입구-1(AWAY)', lat: 35.84008, lng: 128.6812, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '출입구-2(HOME)', lat: 35.84129, lng: 128.6827, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '출입구-3(외야)', lat: 35.8411, lng: 128.6803, type: '편의시설', floor: '1층' }, // 층 정보 추정
    
    { name: '수유실(3층 T3-1)', lat: 35.8408419, lng: 128.6807053, type: '편의시설', floor: '3층' },
    { name: '수유실(3층 T1-1)', lat: 35.8403456, lng: 128.6812941, type: '편의시설', floor: '3층' },
    { name: '수유실(스카이석 09)', lat: 35.8407753, lng: 128.6805136, type: '편의시설', floor: '3층' }, // 층 정보 추정
    { name: '화장실(U1 뒤)', lat: 35.8400641, lng: 128.6816383, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U8-U9 사이)', lat: 35.84015, lng: 128.6809087, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U15-U16 사이)', lat: 35.8407425, lng: 128.6803931, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U22-U23 사이)', lat: 35.8412899, lng: 128.680501, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '팀 스토어(3-6, 3-6 사이)', lat: 35.8412549, lng: 128.6809088, type: '편의시설', floor: '3층' } // 층 정보 추정
    
];

const allPoiData = [
    ...foodMarkersData.map((data, index) => ({
        poi_id: `F${index + 1}`,
        name: data.name,
        type: data.type,
        desc: data.name,
        lat: data.lat,
        lng: data.lng,
        floor: data.floor,
        image_url: data.type === '편의시설' ? '../assets/img/marker/marker_편의시설.png' : '../assets/img/marker/marker_먹거리.png'
    })),
    ...facilitiesData.map((data, index) => ({
        poi_id: `I${index + 1}`,
        name: data.name,
        type: data.type,
        desc: data.name,
        lat: data.lat,
        lng: data.lng,
        floor: data.floor,
        image_url: '../assets/img/marker/marker_편의시설.png'
    }))
];

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