
var mapOptions = {
    center: new naver.maps.LatLng(35.840906, 128.681488),
    zoom: 18
};

// 🚩 전역 지도 객체
var api_map = new naver.maps.Map('api_map', mapOptions);

// 1. 마커 데이터 정의
const foodMarkersData = [
  { "name": "CU(1층)", "lat": 35.8416621, "lng": 128.68232, "type": "매점", "floor": "1층", "is_floor_estimated": "", "detail": "1F-01, 1F-1B", "location": "외부", "image_path": "/assets/img/location/CU.png", "ui_description": "1F-01, 1F-1B | 외부" },
  { "name": "버터우드", "lat": 35.8416461, "lng": 128.68222, "type": "매점", "floor": "1층", "is_floor_estimated": "", "detail": "1F-02, 03", "location": "외부", "image_path": "/assets/img/location/ButterWood.jpg", "ui_description": "1F-02, 03 | 외부" },
  { "name": "알통떡강정(1층)", "lat": 35.8416727, "lng": 128.68207, "type": "매점", "floor": "1층", "is_floor_estimated": "", "detail": "1F-06", "location": "외부", "image_path": "/assets/img/location/Altongtteokgangjeong.jpeg", "ui_description": "1F-06 | 외부" },
  { "name": "스트릿츄러스(1층)", "lat": 35.8416727, "lng": 128.6821, "type": "매점", "floor": "1층", "is_floor_estimated": "", "detail": "1F-06", "location": "외부", "image_path": "/assets/img/location/sc.png", "ui_description": "1F-06 | 외부" },
  { "name": "&지코바(1층)", "lat": 35.8412811, "lng": 128.68037, "type": "매점", "floor": "1층", "is_floor_estimated": "", "detail": "", "location": "외부", "image_path": "/assets/img/location/gcova.png", "ui_description": " | 외부" },
  { "name": "WOKSTER", "lat": 35.8402606, "lng": 128.6806001, "type": "매점", "floor": "2층", "is_floor_estimated": "O", "detail": "2F-09", "location": "외부", "image_path": "/assets/img/location/wokster.jpg", "ui_description": "2F-09 | 외부" },
  { "name": "맘스터치", "lat": 35.8402383, "lng": 128.6805425, "type": "매점", "floor": "2층", "is_floor_estimated": "O", "detail": "2F-13", "location": "외부", "image_path": "/assets/img/location/Momstouch.png", "ui_description": "2F-13 | 외부" },
//   { "name": "버터우드X상하목장", "lat": 35.84390, "lng": 128.68075, "type": "매점", "floor": "2층", "is_floor_estimated": "O", "detail": "2F-08", "location": "외부", "image_path": "/assets/img/location/ButterWood.jpg", "ui_description": "2F-08 | 외부" },
  { "name": "브뤼셀프라이", "lat": 35.8411685, "lng": 128.6808656, "type": "매점", "floor": "2층", "is_floor_estimated": "O", "detail": "2F-10", "location": "외부", "image_path": "/assets/img/location/Brussels_fries.png", "ui_description": "2F-10 | 외부" },
  { "name": "CU(2층)", "lat": 35.84165, "lng": 128.68115, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-12", "location": "외부", "image_path": "/assets/img/location/CU.png", "ui_description": "2F-12 | 외부" },
  { "name": "파파존스피자", "lat": 35.84165, "lng": 128.6811, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "3F-18", "location": "외야", "image_path": "/assets/img/location/Papa_Johns.png", "ui_description": "3F-18 | 외야" },
  { "name": "리얼키친더홈", "lat": 35.8416463, "lng": 128.6812752, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-02, 2F-11", "location": "외야", "image_path": "/assets/img/location/rkh.jpg", "ui_description": "2F-02, 2F-11 | 외야" },
  { "name": "북촌손만두(2층)", "lat": 35.841208, "lng": 128.681, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-07", "location": "푸드스트리트", "image_path": "/assets/img/location/mandoo.jpg", "ui_description": "2F-07 | 푸드스트리트" },
  { "name": "해피치즈스마일(2층)", "lat": 35.841212, "lng": 128.68097, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-06", "location": "푸드스트리트", "image_path": "/assets/img/location/hcs.jpg", "ui_description": "2F-06 | 푸드스트리트" },
//   { "name": "해피크레페", "lat": 35.8415, "lng": 128.6818, "type": "매점", "floor": "2층", "is_floor_estimated": "O", "detail": "2F-03", "location": "푸드스트리트", "image_path": "", "ui_description": "2F-03 | 푸드스트리트" },
  { "name": "맥주부스(2층) - 리얼키친더홈맥주", "lat": 35.8414724, "lng": 128.68237, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-04", "location": "푸드스트리트", "image_path": "/assets/img/location/beer.png", "ui_description": "2F-04 | 푸드스트리트" },
  { "name": "몽블랑드파리", "lat": 35.8412213, "lng": 128.68247, "type": "매점", "floor": "2층", "is_floor_estimated": "", "detail": "2F-05", "location": "푸드스트리트", "image_path": "/assets/img/location/mbd.jpg", "ui_description": "2F-05 | 푸드스트리트" },
  { "name": "리얼피그", "lat": 35.84122, "lng": 128.6808, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-01, 3F-15", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-01, 3F-15 | 내야, 잔디석 하단" },
  { "name": "블루독", "lat": 35.84122, "lng": 128.6811, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-07", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-07 | 내야, 잔디석 하단" },
  { "name": "만재네", "lat": 35.841, "lng": 128.6806, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-03", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-03 | 내야, 잔디석 하단" },
  { "name": "전설스낵", "lat": 35.8411, "lng": 128.6806, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-01 ?", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-01 ? | 내야, 잔디석 하단" },
  { "name": "북촌손만두(3층)", "lat": 35.84092, "lng": 128.6807, "type": "매점", "floor": "3층", "is_floor_estimated": "", "detail": "3F-08, 17", "location": "내야, 잔디석 하단", "image_path": "/assets/img/location/mandoo.jpg", "ui_description": "3F-08, 17 | 내야, 잔디석 하단" },
  { "name": "전설꼬치", "lat": 35.84122, "lng": 128.681, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-12", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-12 | 내야, 잔디석 하단" },
  { "name": "알통떡강정(3층)", "lat": 35.84122, "lng": 128.6807, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-04", "location": "내야, 잔디석 하단", "image_path":  "/assets/img/location/Altongtteokgangjeong.jpeg", "ui_description": "3F-04 | 내야, 잔디석 하단" },
  { "name": "해피치즈스마일(3층)", "lat": 35.84122, "lng": 128.681, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-09", "location": "내야, 잔디석 하단", "image_path": "/assets/img/location/hcs.jpg", "ui_description": "3F-09 | 내야, 잔디석 하단" },
  { "name": "리얼누들", "lat": 35.84098, "lng": 128.6806, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "3F-11", "location": "내야, 잔디석 하단", "image_path": "", "ui_description": "3F-11 | 내야, 잔디석 하단" },
  { "name": "버터우드(3층)", "lat": 35.841, "lng": 128.6807, "type": "매점", "floor": "3층", "is_floor_estimated": "O", "detail": "", "location": "내야, 잔디석 하단", "image_path": "/assets/img/location/ButterWood.jpg", "ui_description": " | 내야, 잔디석 하단" },
  { "name": "맥주부스(3층)", "lat": 35.84136, "lng": 128.6807, "type": "매점", "floor": "3층", "is_floor_estimated": "", "detail": "3F-19", "location": "내야, 잔디석 하단", "image_path": "/assets/img/location/beer.png", "ui_description": "3F-19 | 내야, 잔디석 하단" },
  { "name": "파티플로어(4층)", "lat": 35.8402311, "lng": 128.68134, "type": "매점", "floor": "4층", "is_floor_estimated": "", "detail": "4F-01", "location": "스윗박스", "image_path": "", "ui_description": "4F-01 | 스윗박스" },
  { "name": "맥주부스(4층)", "lat": 35.840229, "lng": 128.68138, "type": "매점", "floor": "4층", "is_floor_estimated": "", "detail": "4F-03", "location": "스윗박스", "image_path": "", "ui_description": "4F-03 | 스윗박스" },
  { "name": "CU(5층)", "lat": 35.8415599, "lng": 128.68109, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-01", "location": "스카이 지정석", "image_path": "/assets/img/location/CU.png", "ui_description": "5F-01 | 스카이 지정석" },
  { "name": "빙수집", "lat": 35.841576, "lng": 128.68106, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-06", "location": "스카이 지정석", "image_path": "", "ui_description": "5F-06 | 스카이 지정석" },
  { "name": "STATION&해피치즈스마일", "lat": 35.8414713, "lng": 128.68094, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-08", "location": "스카이 지정석", "image_path": "/assets/img/location/hcs.jpg", "ui_description": "5F-08 | 스카이 지정석" },
  { "name": "장여사 나뭇잎 손만두", "lat": 35.8416, "lng": 128.681, "type": "매점", "floor": "5층", "is_floor_estimated": "O", "detail": "5F-02", "location": "스카이 지정석", "image_path": "", "ui_description": "5F-02 | 스카이 지정석" },
  { "name": "지코바(5층)", "lat": 35.84154, "lng": 128.68115, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-03", "location": "스카이 지정석", "image_path": "/assets/img/location/gcova.png", "ui_description": "5F-03 | 스카이 지정석" },
  { "name": "요아정", "lat": 35.8415208, "lng": 128.68102, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-09", "location": "스카이 지정석", "image_path": "/assets/img/location/yoajung.png", "ui_description": "5F-09 | 스카이 지정석" },
  { "name": "스트릿츄러스(5층)", "lat": 35.84158, "lng": 128.68102, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-05", "location": "스카이 지정석", "image_path": "/assets/img/location/sc.png", "ui_description": "5F-05 | 스카이 지정석" },
  { "name": "맥주부스(5층)", "lat": 35.84162, "lng": 128.68098, "type": "매점", "floor": "5층", "is_floor_estimated": "", "detail": "5F-08, 5F-04", "location": "스카이 지정석", "image_path": "/assets/img/location/beer.png", "ui_description": "5F-08, 5F-04 | 스카이 지정석" }
];

const facilitiesData = [
  { "name": "출입구-1", "lat": 35.84008, "lng": 128.682, "type": "편의시설", "floor": "2층", "is_floor_estimated": "O", "detail": "AWAY", "location": "", "image_path": "/assets/img/location/door.png", "ui_description": "AWAY_GATE-A" },
  { "name": "출입구-2", "lat": 35.84129, "lng": 128.6827, "type": "편의시설", "floor": "2층", "is_floor_estimated": "O", "detail": "HOME", "location": "", "image_path": "/assets/img/location/door.png", "ui_description": "HOME_GATE-C" },
  { "name": "출입구-3", "lat": 35.8411, "lng": 128.6803, "type": "편의시설", "floor": "2층", "is_floor_estimated": "O", "detail": "외야", "location": "", "image_path": "/assets/img/location/door.png", "ui_description": "외야_GATE-B" },
  { "name": "수유실", "lat": 35.8408419, "lng": 128.68071, "type": "편의시설", "floor": "3층", "is_floor_estimated": "", "detail": "3층 T3-1", "location": "", "image_path": "/assets/img/location/su.png", "ui_description": "3층 T3-1구역 뒤" },
  { "name": "수유실", "lat": 35.8403456, "lng": 128.68129, "type": "편의시설", "floor": "3층", "is_floor_estimated": "", "detail": "3층 T1-1", "location": "", "image_path": "/assets/img/location/su.png", "ui_description": "3층 T1-1구역 뒤" },
  { "name": "수유실", "lat": 35.8407753, "lng": 128.68051, "type": "편의시설", "floor": "5층", "is_floor_estimated": "O", "detail": "스카이석 09", "location": "", "image_path": "/assets/img/location/su.png", "ui_description": "스카이석 09 출입구 앞" },
  { "name": "화장실", lat: 35.8400641, lng: 128.6816383, "type": "편의시설", "floor": "5층", "is_floor_estimated": "", "detail": "U1 뒤", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "U1 구역 뒤" },
  { "name": "화장실", "lat": 35.84015, "lng": 128.68091, "type": "편의시설", "floor": "5층", "is_floor_estimated": "", "detail": "U8-U9 사이", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "U8-U9 사이" },
  { "name": "화장실", "lat": 35.8407425, "lng": 128.68039, "type": "편의시설", "floor": "5층", "is_floor_estimated": "", "detail": "U15-U16 사이", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "U15-U16 사이" },
  { "name": "화장실", "lat": 35.8412899, "lng": 128.6805, "type": "편의시설", "floor": "5층", "is_floor_estimated": "", "detail": "U22-U23 사이", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "U22-U23 사이" },
  { "name": "화장실", "lat":  35.8401725, "lng": 128.6807509, "type": "편의시설", "floor": "2층", "is_floor_estimated": "", "detail": "2층", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "2층" },
  { "name": "화장실", "lat": 35.8400589, "lng":128.6816817, "type": "편의시설", "floor": "2층", "is_floor_estimated": "", "detail": "2층", "location": "", "image_path": "/assets/img/location/to.png", "ui_description": "2층" },
  { "name": "팀 스토어", "lat": 35.8412549, "lng": 128.68091, "type": "편의시설", "floor": "3층", "is_floor_estimated": "O", "detail": "3-6, 3-6 사이", "location": "", "image_path": "/assets/img/location/store.png", "ui_description": "3-6, 3-6 사이" }
];

// 2. 고유 ID를 부여하여 데이터 병합
const foodWithId = foodMarkersData.map((data, index) => ({
    ...data,
    id: `F${index + 1}` // 먹거리 ID: F1, F2, ...
}));

const facilitiesWithId = facilitiesData.map((data, index) => ({
    ...data,
    id: `I${index + 1}` // 편의시설 ID: I1, I2, ...
}));

var markersData = foodWithId.concat(facilitiesWithId);


// 3. 커스텀 마커 아이콘 설정
var foodIcon = {
    url: '../assets/img/marker/marker_gray.png',
    size: new naver.maps.Size(22, 33),
    scaledSize: new naver.maps.Size(22, 33),
    anchor: new naver.maps.Point(11, 33)
};
var facilityIcon = {
    url: '../assets/img/marker/marker_blue.png',
    size: new naver.maps.Size(22, 33),
    scaledSize: new naver.maps.Size(22, 33),
    anchor: new naver.maps.Point(11, 33)
};
// 4. InfoWindow 객체 정의 (전역)
var infowindow = new naver.maps.InfoWindow({
    content: '', // 초기값은 비워둡니다 (나중에 채워짐)
    maxWidth: 300,
    backgroundColor: "#fff",
    borderColor: "#888",    // [디자인] 테두리 진한 회색
    borderWidth: 1,         // [디자인] 테두리 두께
    anchorSize: new naver.maps.Size(10, 10),
    anchorColor: "#fff",
    pixelOffset: new naver.maps.Point(0, -10)
});

// 5. 마커 생성 및 지도에 표시
// 🚩 전역 마커 객체 배열
var markers = []; 

markersData.forEach(function (data) {
    
    var position = new naver.maps.LatLng(data.lat, data.lng);
    var iconToUse = data.type === '편의시설' ? facilityIcon : foodIcon;

    var marker = new naver.maps.Marker({
        map: api_map, 
        position: position,
        title: data.name, 
        icon: iconToUse
    });
    
    // 💡 마커 객체에 데이터의 고유 ID를 연결
    marker.poiId = data.id; 
    
    markers.push(marker);

    // ----------------------------------------------------
    // ✨ 마우스 오버/클릭 시 이름 표시 이벤트 리스너 추가
    var contentString = [
        '<div style="padding: 10px 15px; text-align: center; font-size: 14px; font-weight: bold; color: #333; white-space: nowrap;">',
        data.name, // 데이터의 이름이 여기에 들어갑니다.
        '</div>'
    ].join('');

    naver.maps.Event.addListener(marker, 'mouseover', function (e) {
        infowindow.setContent(contentString);
        infowindow.open(api_map, marker);
    });

    naver.maps.Event.addListener(marker, 'mouseout', function (e) {
        infowindow.close();
    });

    naver.maps.Event.addListener(marker, 'click', function (e) {
        if (infowindow.getMap() && infowindow.getContent().includes(data.name)) {
            infowindow.close();
        } else {
            infowindow.setContent(contentString);
            infowindow.open(api_map, marker);
        }
    });
});
// ====================================================================

// --- 기타 모달/더미 지도 로직 (HTML에 직접 있다면 제거 필요) ---


// ====================================================================
// 6. 목록 및 필터링 로직 (검색 및 마커 제어)
// ====================================================================
(function () {
    const listEl = document.getElementById("resultList");
    // HTML에서 사용하는 ID를 직접 연결
    const qEl = document.getElementById("q"); 
    const clearBtn = document.getElementById("btnClear"); 
    const badge = { food: "먹거리", toilet: "편의시설" }; 

    // STATE 초기화: 전역 markersData를 사용하여 state.rows를 초기화
    const state = {
        rows: markersData.map(r => {
            // 1. 이미지 경로 결정: image_path가 있으면 우선 사용, 없으면 type에 따라 기본값 설정
            let itemImage = '';
            if (r.image_path) {
                // 개별 이미지 경로 사용
                itemImage = r.image_path;
            } else if (r.type === '편의시설') {
                // 편의시설 기본 마커
                itemImage = './assets/img/Map_Amenities.png';
            } else {
                // 매점(먹거리) 기본 마커
                itemImage = './assets/img/Food_icon.png';
            }

            return {
                // POI 모델의 최종 반환 형태를 시뮬레이션
                id: r.id,
                type: r.type, // '매점' 또는 '편의시설' (필터링에 사용됨)
                name: r.name,
                // ⚠️ UI 표시용: detail | location 조합 값 (이전의 'name' 대신 사용)
                items: r.ui_description || r.name, 
                // ⚠️ 개별 이미지 경로 반영
                image: itemImage, 
                lat: r.lat,
                lng: r.lng,
                // 층 정보: '1층' -> '1', 'all' 등으로 통일 (필터링에 사용됨)
                floor: r.floor ? String(r.floor).replace('층', '') : 'all' 
            };
        }),
        currentType: 'all', // 'all', 'food', 'toilet' 중 하나
        currentFloor: 'all' // 층 필터를 위한 초기값 추가 (선택 사항)
    };

    function render(rows) {
        if (!rows || rows.length === 0) {
            listEl.innerHTML = '<p class="empty">표시할 항목이 없습니다.</p>';
            return;
        }
        listEl.innerHTML = rows.map(r => {
            let dataType;
            if (r.type === '매점') dataType = 'food';
            else if (r.type === '편의시설') dataType = 'toilet';
            else dataType = 'all';

            const imgStyle = r.image ? ` style="background-image:url('${r.image}');"` : "";
            return `
                <article class="item" data-type="${dataType}" data-id="${r.id}"> 
                  <div class="thumb"${imgStyle}></div>
                  <div class="meta">
                    <h4 class="name">${r.name}</h4>
                    <p class="desc">${description}</p>
                  </div>
                  <span class="badge">${badge[dataType] || ""}</span> 
                </article>`;
        }).join("");
        
        // 목록 클릭 시 마커 이동/표시 로직 유지
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const targetMarker = markers.find(m => m.poiId === id);
                if (targetMarker) {
                    api_map.setCenter(targetMarker.getPosition());
                    naver.maps.Event.trigger(targetMarker, 'click');
                }
            });
        });
    }

    // ✅ 검색어 + 타입 필터 통합 로직 (핵심)
    function applyFilter() {
        const q = (qEl?.value || "").trim().toLowerCase();
        const currentType = state.currentType; 

        const filtered = state.rows.filter(r => {
            // 1. 키워드 필터링
            const text = `${r.name || ""} ${r.items || ""}`.toLowerCase();
            const passesKeyword = !q || text.includes(q);
            
            // 2. 타입 필터링
            let poiType;
            if (r.type === '매점') poiType = 'food';
            else if (r.type === '편의시설') poiType = 'toilet';
            else poiType = 'all';
            const passesType = currentType === 'all' || poiType === currentType;

            return passesKeyword && passesType;
        });

        // 💡 목록 (리스트) 렌더링
        render(filtered);

        // 🚩 마커 제어 로직 🚩
        const filteredIds = new Set(filtered.map(r => r.id));

        // 전역 'markers' 배열을 순회하며 마커 표시/숨김
        markers.forEach(marker => { 
            if (filteredIds.has(marker.poiId)) {
                marker.setMap(api_map); // 마커를 지도에 표시
            } else {
                marker.setMap(null); // 마커를 지도에서 숨김
                if (infowindow.getMap() && infowindow.getContent().includes(marker.getTitle())) {
                    infowindow.close();
                }
            }
        });
    }

    // ✅ 입력 이벤트 (디바운스) - 검색 입력 시 마커 필터링 호출
    let t;
    qEl?.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(applyFilter, 200);
    });

    // ✅ “×” 버튼 클릭 시 검색창 리셋 + 전체 표시
    clearBtn?.addEventListener("click", () => {
        qEl.value = "";
        applyFilter();
        qEl.focus();
    });

    // ✅ 타입 필터(레일) 로직 - 버튼 클릭 시 마커 필터링 호출
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-filter');
            if (type === 'route') return; 

            state.currentType = type;
            applyFilter(); 
        });
    });

    // 💡 초기 로드 시 필터 적용
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyFilter);
    } else {
        applyFilter();
    }
})();