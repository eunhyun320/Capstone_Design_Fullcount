var mapOptions = {
    center: new naver.maps.LatLng(35.840906, 128.681488),
    zoom: 18
};


var api_map = new naver.maps.Map('api_map', mapOptions);
// 1. 폴리곤으로 표시할 좌표 배열을 준비합니다. (가장 바깥쪽 좌표부터 시계방향 또는 반시계방향으로)
// 예시: 1루 내야석 부근을 나타내는 가상 좌표 배열
// 1. 표시할 마커 데이터 정의 (음식 이름: (위도, 경도) 형식)


var foodMarkersData = [
    { name: 'CU(1층)', lat: 35.8416621, lng: 128.6823173, type: '매점' }, // CU도 매점으로 변경
    { name: '버터우드', lat: 35.8416461, lng: 128.6822179, type: '매점' },
    { name: '알통떡강정(1층)', lat: 35.8416727, lng: 128.6820677, type: '매점' },
    { name: '스트릿츄러스(1층)', lat: 35.8416727, lng: 128.6821000, type: '매점' },
    { name: '&지코바(1층)', lat: 35.8412811, lng: 128.6803687, type: '매점' },
    { name: 'WOKSTER', lat: 35.84400, lng: 128.68070, type: '매점' },
    { name: '맘스터치', lat: 35.84824, lng: 128.6805, type: '매점' },
    { name: '버터우드X상하목장', lat: 35.84390, lng: 128.68075, type: '매점' },
    { name: '브뤼셀프라이', lat: 35.8411685, lng: 128.6808656, type: '매점' },
    { name: 'CU(2층)', lat: 35.84165, lng: 128.68115, type: '매점' }, // CU도 매점으로 변경
    { name: '파파존스피자', lat: 35.84165, lng: 128.6811, type: '매점' },
    { name: '리얼키친더홈', lat: 35.8416463, lng: 128.6812752, type: '매점' },
    { name: '북촌손만두(2층)', lat: 35.8418208, lng: 128.681, type: '매점' },
    { name: '해피치즈스마일(2층)', lat: 35.8412212, lng: 128.6809734, type: '매점' },
    { name: '해피크레페', lat: 35.84150, lng: 128.68180, type: '매점' },
    { name: '맥주부스(2층) - 리얼키친더흥맥주', lat: 35.8414724, lng: 128.6823676, type: '매점' },
    { name: '몽블랑드파리', lat: 35.8412213, lng: 128.6824749, type: '매점' },
    { name: '리얼피그', lat: 35.84122, lng: 128.6808, type: '매점' },
    { name: '블루독', lat: 35.84122, lng: 128.6811, type: '매점' },
    { name: '만재네', lat: 35.84100, lng: 128.6806, type: '매점' },
    { name: '전설스낵', lat: 35.84110, lng: 128.6806, type: '매점' },
    { name: '북촌손만두(3층)', lat: 35.84092, lng: 128.6807, type: '매점' },
    { name: '전설꼬치', lat: 35.84122, lng: 128.681, type: '매점' },
    { name: '알통떡강정(3층)', lat: 35.84122, lng: 128.6807, type: '매점' },
    // { name: '5직떡볶이', lat: 35.84105, lng: 128.6804, type: '매점' },
    { name: '해피치즈스마일(3층)', lat: 35.84122, lng: 128.681, type: '매점' },
    { name: '리얼누들', lat: 35.84098, lng: 128.6806, type: '매점' },
    { name: '버터우드(3층)', lat: 35.84100, lng: 128.6807, type: '매점' },
    { name: '맥주부스(3층)', lat: 35.84136, lng: 128.6807, type: '매점' },
    { name: '파티플로어(4층)', lat: 35.8402311, lng: 128.6813372, type: '매점' },
    { name: '맥주부스(4층)', lat: 35.840229, lng: 128.6813821, type: '매점' },
    { name: 'CU(5층)', lat: 35.8415599, lng: 128.6810882, type: '매점' }, // CU도 매점으로 변경
    { name: '빙수집', lat: 35.8415376, lng: 128.6810621, type: '매점' },
    { name: 'STATION&해피치즈스마일', lat: 35.8414713, lng: 128.6809434, type: '매점' },
    { name: '장여사 나뭇잎 손만두', lat: 35.84160, lng: 128.68100, type: '매점' },
    { name: '지코바(5층)', lat: 35.84154, lng: 128.68115, type: '매점' },
    { name: '요아정', lat: 35.8415208, lng: 128.6810225, type: '매점' },
    { name: '스트릿츄러스(5층)', lat: 35.84158, lng: 128.68095, type: '매점' },
    { name: '맥주부스(5층)', lat: 35.84162, lng: 128.68098, type: '매점' }
];

var facilitiesData = [
    { name: '편의시설구분용테스터', lat: 35.8410691, lng: 128.6817501, type: '편의시설' },
    { name: '출입구-1(AWAY)', lat: 35.84008, lng: 128.6812, type: '편의시설' },
    { name: '출입구-2(HOME)', lat: 35.84129, lng: 128.6827, type: '편의시설' },
    { name: '출입구-3(외야)', lat: 35.8411, lng: 128.6803, type: '편의시설' },
    { name: '물품보관소-1', lat: 35.8411669, lng: 128.6803432, type: '편의시설' },
    { name: '물품보관소-2', lat: 35.8410331, lng: 128.6802568, type: '편의시설' }, // 추정된 위치
    { name: '수유실(3층 T3-1)', lat: 35.8408419, lng: 128.6807053, type: '편의시설' },
    { name: '수유실(3층 T1-1)', lat: 35.8403456, lng: 128.6812941, type: '편의시설' },
    { name: '수유실(스카이석 09)', lat: 35.8407753, lng: 128.6805136, type: '편의시설' }
]

var markersData = foodMarkersData.concat(facilitiesData);

// 2. 커스텀 마커 아이콘 설정 (원하는 이미지 URL로 변경)
var foodIcon = {
    url: '../assets/img/marker/marker_green.png', // 👈 모든 먹거리에 사용할 아이콘
    size: new naver.maps.Size(22, 33),
    scaledSize: new naver.maps.Size(22, 33),
    anchor: new naver.maps.Point(11, 33)
};
var facilityIcon = {
    url: './assets/img/marker/marker_blue.png', // 👈 편의시설용 이미지 URL
    size: new naver.maps.Size(22, 33),
    scaledSize: new naver.maps.Size(22, 33),
    anchor: new naver.maps.Point(11, 33)
};

// ----------------------------------------------------
// ✨ 이름 표시를 위한 InfoWindow 객체 정의
// 마커 이름 표시용 InfoWindow를 하나만 생성합니다.
var infowindow = new naver.maps.InfoWindow({
    content: '',
    maxWidth: 200,
    backgroundColor: "#fff",
    borderWidth: 1,
    anchorSize: new naver.maps.Size(10, 10),
    anchorColor: "#fff",
    pixelOffset: new naver.maps.Point(0, -10) // 마커 상단에서 약간 떨어지게 위치 조정
});
// ----------------------------------------------------


// 3. 마커 생성 및 지도에 표시
var markers = []; 

markersData.forEach(function (data) {
    var position = new naver.maps.LatLng(data.lat, data.lng);

    // 🌟 상점 유형에 따라 사용할 아이콘 선택
    var iconToUse = data.type === '편의시설' ? facilityIcon : foodIcon;

    var marker = new naver.maps.Marker({
        map: api_map, 
        position: position,
        title: data.name, 
        icon: iconToUse // 👈 분기된 아이콘 적용 
    });

    markers.push(marker);

    // ----------------------------------------------------
    // ✨ 마우스 오버/클릭 시 이름 표시 이벤트 리스너 추가
    var contentString = [
        '<div style="padding:10px; text-align:center;">',
        '   <h4 style="margin:0; font-size:14px; color:#333;">' + data.name + '</h4>',
        '</div>'
    ].join('');

    // 1. PC: 마우스 오버 시 InfoWindow 표시
    naver.maps.Event.addListener(marker, 'mouseover', function (e) {
        infowindow.setContent(contentString);
        infowindow.open(api_map, marker);
    });

    // 2. PC: 마우스 아웃 시 InfoWindow 닫기
    naver.maps.Event.addListener(marker, 'mouseout', function (e) {
        infowindow.close();
    });

    // 3. PC/모바일: 마커 클릭 시 InfoWindow 토글
    naver.maps.Event.addListener(marker, 'click', function (e) {
        if (infowindow.getMap() && infowindow.getContent().includes(data.name)) {
            // 현재 InfoWindow가 열려 있고, 이 마커의 정보라면 닫기
            infowindow.close();
        } else {
            // InfoWindow 열기 (또는 다른 마커의 정보가 열려있다면 내용 업데이트 후 열기)
            infowindow.setContent(contentString);
            infowindow.open(api_map, marker);
        }
    });
    // ----------------------------------------------------
});

naver.maps.Event.addListener(api_map, 'click', function (e) {
    // 클릭한 지점의 위도와 경도를 가져옵니다.
    var lat = e.coord.lat();
    var lng = e.coord.lng();

    // 브라우저 개발자 콘솔에 좌표를 출력합니다. (F12 키로 확인)
    console.log('클릭한 위치의 위도: ' + lat);
    console.log('클릭한 위치의 경도: ' + lng);

    // 복사하기 쉬운 형태로도 출력해 줍니다.
    console.log('new naver.maps.LatLng(' + lat + ', ' + lng + '),');
});