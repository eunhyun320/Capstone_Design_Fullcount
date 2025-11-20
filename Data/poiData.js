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

// 1. ID와 UI 필드를 포함하여 매점 데이터를 가공
const foodWithProcessedData = foodMarkersData.map((data, index) => ({
  id: `F${index + 1}`,
  ...data,
  // 클라이언트 통합 스크립트에서 예상하는 필드를 명시적으로 추가
  image_url: data.image_path || (data.type === '편의시설' ? '../assets/img/marker/marker_편의시설.png' : '../assets/img/marker/marker_먹거리.png'),
  desc: data.ui_description // POI 모델의 'desc' 필드를 UI 설명으로 사용
}));

// 2. ID와 UI 필드를 포함하여 편의시설 데이터를 가공
const facilitiesWithProcessedData = facilitiesData.map((data, index) => ({
  id: `I${index + 1}`,
  ...data,
  // 클라이언트 통합 스크립트에서 예상하는 필드를 명시적으로 추가
  ui_description: data.name, // 편의시설은 ui_description이 없으므로 name 사용 (필요 시 detail | location 조합)
  image_path: '',
  image_url: '../assets/img/marker/marker_편의시설.png',
  desc: data.name // POI 모델의 'desc' 필드를 이름으로 사용
}));


// 💡 최종 병합된 데이터 배열 (클라이언트 JS에서 markersData로 사용될 배열)
const finalMarkersData = foodWithProcessedData.concat(facilitiesWithProcessedData);

var markersData = finalMarkersData;
// 💡 Node.js (CommonJS) 모듈 내보내기
module.exports = {

  allPoiData: finalMarkersData
};
