var mapOptions = {
    center: new naver.maps.LatLng(35.840906, 128.681488),
    zoom: 18
};

// 🚩 전역 지도 객체
var api_map = new naver.maps.Map('api_map', mapOptions);

// 1. 마커 데이터 정의
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
    url: '../assets/img/marker/marker_먹거리.png',
    size: new naver.maps.Size(33, 33),
    scaledSize: new naver.maps.Size(33, 33),
    anchor: new naver.maps.Point(16.5, 33)
};
var facilityIcon = {
    url: '../assets/img/marker/marker_편의시설.png',
    size: new naver.maps.Size(33, 33),
    scaledSize: new naver.maps.Size(33, 33),
    anchor: new naver.maps.Point(16.5, 33)
};
// 4. InfoWindow 객체 정의 (전역)
var infowindow = new naver.maps.InfoWindow({
    content: '',
    maxWidth: 200,
    backgroundColor: "#fff",
    borderWidth: 1,
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
        '<div style="padding:10px; text-align:center; background-color:#fff;">', // 배경색 추가 (비침 방지)
        '   <span style="font-size:14px; color:#333; white-space: nowrap;">' + data.name + '</span>', // h4 대신 span 사용 (여백 문제 해결)
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
        rows: markersData.map(r => ({
             id: r.id,
             type: r.type, 
             name: r.name,
             items: r.name, 
             image: r.type === '편의시설' ? './assets/img/Map_Amenities.png' : './assets/img/Food_icon.png',
             lat: r.lat,
             lng: r.lng,
             floor: '' 
        })),
        currentType: 'all'
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
                    <p class="desc">${r.items || ""}</p>
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