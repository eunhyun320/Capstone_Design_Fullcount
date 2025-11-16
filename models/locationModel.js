// // models/locationModel.js
// const pool = require('../common/db');
// const DB = process.env.SVR_DB_NAME || process.env.DB_NAME || 'myapp_db';

// /**
//  * POI 목록 조회
//  * - columns 예시: poi_id, name, type, desc, lat, lng, image_url 등
//  * - 선택 필터: type, q(이름/설명 키워드)
//  */
// exports.getPoiList = async ({ type, q } = {}) => {
//   const where = [];
//   const params = [];

//   if (type) {
//     where.push('type = ?');
//     params.push(type);
//   }
//   if (q) {
//     where.push('(name LIKE ? OR description LIKE ?)');
//     params.push(`%${q}%`, `%${q}%`);
//   }

//   // 안전한 정렬 컬럼 선택: 테이블에 존재하는 후보 컬럼 중 하나를 사용
//   const candidates = ['poi_id', 'id', 'created_at', 'updated_at'];
//   const colsQuery = `
//     SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
//      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME IN (${candidates.map(()=>'?').join(',')})
//   `;
//   const colsParams = [DB, 'poi', ...candidates];
//   const [cols] = await pool.query(colsQuery, colsParams);
//   const present = new Set((cols || []).map(c => c.COLUMN_NAME));
//   const orderCol = candidates.find(c => present.has(c));

//   const sql = `
//     SELECT *
//       FROM \`${DB}\`.poi
//      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
//      ${orderCol ? 'ORDER BY ' + orderCol + ' DESC' : ''}
//   `;

//   const [rows] = await pool.query(sql, params);
//   // Map DB columns to frontend-friendly keys expected by locatino.js:
//   // { id, type, name, items, image, lat, lng, floor }
//   return rows.map(r => ({
//     // handle multiple possible column names to be robust against schema differences
//     id: r.poi_id || r.id,
//     type: r.type || r.category || '',
//     name: r.name || r.title || '',
//     items: r.description || r.desc || r.items || '',
//     image: r.image_url || r.image || r.img || '',
//     lat: r.lat || r.latitude || null,
//     lng: r.lng || r.longitude || null,
//     floor: r.floor || r.level || ''
//   }));
// };
/**
 * 🏟️ POI 마커 데이터 (DB 대체용)
 * * 실제 DB의 'poi' 테이블에서 가져온다고 가정했던 마커 데이터입니다.
 * DB 연결 없이 JavaScript 배열을 사용합니다.
 * * NOTE: DB 모델의 getPoiList 함수에서 예상하는 필드 이름으로 데이터를 매핑해야 합니다.
 * (id, type, name, items, image, lat, lng, floor)
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
    { name: '물품보관소-1', lat: 35.8411669, lng: 128.6803432, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '물품보관소-2', lat: 35.8410331, lng: 128.6802568, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '수유실(3층 T3-1)', lat: 35.8408419, lng: 128.6807053, type: '편의시설', floor: '3층' },
    { name: '수유실(3층 T1-1)', lat: 35.8403456, lng: 128.6812941, type: '편의시설', floor: '3층' },
    { name: '수유실(스카이석 09)', lat: 35.8407753, lng: 128.6805136, type: '편의시설', floor: '3층' }, // 층 정보 추정
    { name: '화장실(U1 뒤)', lat: 35.8400641, lng: 128.6816383, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U8-U9 사이)', lat: 35.84015, lng: 128.6809087, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U15-U16 사이)', lat: 35.8407425, lng: 128.6803931, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '화장실(U22-U23 사이)', lat: 35.8412899, lng: 128.680501, type: '편의시설', floor: '1층' }, // 층 정보 추정
    { name: '팀 스토어(3-6, 3-6 사이)', lat: 35.8412549, lng: 128.6809088, type: '편의시설', floor: '3층' } // 층 정보 추정
];

// foodMarkersData와 facilitiesData를 병합하고,
// DB 'poi' 테이블의 필드와 유사하도록 이름을 통일합니다.
const allPoiData = [
    ...foodMarkersData.map((data, index) => ({
        poi_id: `F${index + 1}`, // 고유 ID 생성 (DB의 poi_id 역할)
        name: data.name,
        type: data.type,
        desc: data.name, // 설명 필드는 일단 이름과 같게 설정
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
 * POI 목록 조회 (DB 사용하지 않음: 메모리 배열 사용)
 * - columns 예시: poi_id, name, type, desc, lat, lng, image_url 등
 * - 선택 필터: type, q(이름/설명 키워드)
 */
exports.getPoiList = async ({ type, q } = {}) => {
    // 1. 데이터 필터링 (WHERE 절 로직 구현)
    let filteredData = allPoiData.filter(r => {
        let passesTypeFilter = true;
        let passesKeywordFilter = true;

        // type 필터
        if (type) {
            passesTypeFilter = r.type === type;
        }

        // q (키워드) 필터
        if (q) {
            const lowerQ = q.toLowerCase();
            const name = r.name ? r.name.toLowerCase() : '';
            const desc = r.desc ? r.desc.toLowerCase() : ''; // desc 필드는 name과 같다고 가정
            
            passesKeywordFilter = name.includes(lowerQ) || desc.includes(lowerQ);
        }

        return passesTypeFilter && passesKeywordFilter;
    });

    // 2. 데이터 정렬 (ORDER BY 절 로직 구현 - 여기서는 단순 정렬 생략/ID 기준)
    // 메모리 배열에서는 복잡한 DB 정렬 로직 (ORDER BY 컬럼 존재 확인)을 생략합니다.
    // 여기서는 ID(poi_id)를 기준으로 내림차순 정렬을 유지합니다.
    filteredData.sort((a, b) => (b.poi_id > a.poi_id ? 1 : a.poi_id > b.poi_id ? -1 : 0));


    // 3. 필드 매핑
    // locatino.js에서 예상하는 프론트엔드 친화적인 키(id, type, name, items, image, lat, lng, floor)로 변환
    return filteredData.map(r => ({
        id: r.poi_id,
        type: r.type,
        name: r.name,
        items: r.desc, // DB에서 desc/description이 items로 매핑되었던 로직 유지
        image: r.image_url,
        lat: r.lat,
        lng: r.lng,
        floor: r.floor
    }));
};

// // 사용 예시:
// (async () => {
//     console.log('--- 전체 목록 (10개) ---');
//     const allPois = await exports.getPoiList();
//     console.log(allPois.slice(0, 10)); 
//     console.log('------------------------\n');

//     console.log('--- 타입: 매점 목록 (5개) ---');
//     const foodPois = await exports.getPoiList({ type: '매점' });
//     console.log(foodPois.slice(0, 5));
//     console.log('---------------------------\n');

//     console.log('--- 키워드: CU 목록 (모두) ---');
//     const cuPois = await exports.getPoiList({ q: 'CU' });
//     console.log(cuPois);
//     console.log('------------------------------\n');
// })();