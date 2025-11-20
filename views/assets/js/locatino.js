// 검색 초기화
document.getElementById('btnClear')?.addEventListener('click', () => {
  const q = document.getElementById('q');
  if (!q) return;
  q.value = '';
  q.focus();
  filterList('');
});

// 검색 입력 필터
document.getElementById('q')?.addEventListener('input', (e) => {
  filterList(e.target.value);
});

function filterList(term = '') {
  term = term.trim().toLowerCase();
  document.querySelectorAll('.item').forEach(it => {
    const text = it.innerText.toLowerCase();
    it.style.display = text.includes(term) ? '' : 'none';
  });
}

// ⚠️ 타입 필터(레일/칩 공통) - 이 블록은 하단 익명 함수로 통합되어 삭제됨
// document.querySelectorAll('[data-filter]').forEach(btn => {
//   btn.addEventListener('click', () => {
//     const type = btn.getAttribute('data-filter');
//     if (type === 'route') return;
//     state.currentType = type;
//     applyFilter();
//     document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
//     btn.classList.add('active');
//   });
// });

// 더미 지도(배경만). 실제 API 붙이면 아래 블록 삭제.
(function fakeMap() {
  const el = document.getElementById('mapInner');
  if (!el) return;
  el.style.background = "repeating-linear-gradient(45deg,#eef1f3,#eef1f3 20px,#f7f9fb 20px,#f7f9fb 40px)";
  el.style.border = "1px solid #e5e7eb";
  el.style.zIndex = "0";   // 👈 지도 레이아웃을 맨 뒤로
  el.style.position = "relative"
})();

/* 카카오 지도 붙이는 예시 */


// ===== 모달(fab) =====
// (모달 로직은 변경 없음)
(() => {
  const modal = document.getElementById('chatModal');
  const fab = document.getElementById('fabBtn');
  const closeBtn = document.getElementById('chatClose');

  function openModal() {
    modal.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    // 도킹형(dock) 챗봇은 페이지 스크롤을 막지 않음
    if (!modal.classList.contains('dock')) {
      document.body.style.overflow = 'hidden';
    }
    // 도킹형이면 애니메이션용 클래스 추가
    if (modal.classList.contains('dock')) {
      modal.classList.add('show');
    }
    setTimeout(() => closeBtn?.focus(), 0);
  }
  function closeModal() {
    modal.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    // 도킹형(dock) 챗봇은 스크롤 원복 불필요, 일반 모달만 원복
    if (!modal.classList.contains('dock')) {
      document.body.style.overflow = '';
    }
    if (modal.classList.contains('dock')) {
      modal.classList.remove('show');
    }
    fab.focus();
  }

  fab?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target.matches('[data-dismiss="modal"], .modal__backdrop')) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });
})();


// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
// 💡 서버 fetch 대신 전역 markersData 배열을 사용하여 목록과 마커를 동시에 제어하는 통합 스크립트
(function () {
  const listEl = document.getElementById("resultList");
  // q_m 대신 상단의 q를 사용하도록 변경
  const qEl = document.getElementById("q");
  const clearBtn = document.getElementById("btnClear");
  const badge = { food: "먹거리", toilet: "편의시설" };

  // 💡 STATE 초기화: 전역 markersData를 사용하여 state.rows를 초기화합니다.
  // markersData는 이미 ID가 추가되고 병합된 배열이어야 합니다.
  const state = {
    // ... (state 로직은 변경 없음)
    rows: markersData.map(r => {
      // 이미지 경로 결정: 데이터에 image_path가 있으면 사용하고, 없으면 type에 따라 기본 마커 이미지를 사용합니다.
      let itemImage = '';
      if (r.image_path) {
        itemImage = r.image_path;
      } else if (r.type === '편의시설') {
        itemImage = '../assets/img/';
      } else {
        // '매점' 등 기타 유형
        itemImage = '../assets/img/location/foodicon.png';
      }

      return {
        // POI 모델의 최종 반환 형태(id, type, name, items, image, lat, lng)를 시뮬레이션
        id: r.id,
        type: r.type,
        name: r.name,
        // ⚠️ 수정! r.ui_description을 사용하여 이름 밑에 상세 설명 (detail | location) 표시
        items: r.ui_description || r.name,
        // ⚠️ 수정! itemImage 변수를 사용하여 개별 이미지 경로 반영
        image: itemImage,
        lat: r.lat,
        lng: r.lng,
        // 층 정보: '1층' -> '1', 'all' 등으로 통일
        floor: r.floor ? String(r.floor).replace('층', '') : 'all'
      };
    }),
    currentType: 'all',
    currentFloor: 'all'
  }

  function render(rows) {

    if (!rows || rows.length === 0) {

      listEl.innerHTML = '<p class="empty">표시할 항목이 없습니다.</p>';

      return;

    }

    listEl.innerHTML = rows.map(r => {

      // ... (dataType 결정 로직은 생략)

      let dataType;

      if (r.type === '매점') dataType = 'food';

      else if (r.type === '편의시설') dataType = 'toilet';

      else dataType = 'all';



      // r.image는 state 초기화에서 결정된 경로를 사용합니다.

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

    // 마커와 목록 항목을 연결하기 위한 클릭 리스너 (선택 사항)
    document.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;

        // 해당 ID의 마커를 찾아 지도 중심으로 이동하고 InfoWindow 열기
        const targetMarker = markers.find(m => m.poiId === id);
        if (targetMarker) {
          api_map.setCenter(targetMarker.getPosition());
          // 마커 클릭 이벤트를 강제로 발생시켜 InfoWindow 열기 (클릭 로직이 마커에 이미 구현되어 있어야 함)
          naver.maps.Event.trigger(targetMarker, 'click');
        }
      });
    });
  }

  // ✅ 검색어 + 타입 필터 통합 로직 (핵심)
  function applyFilter() {
    // ... (applyFilter 로직은 변경 없음)
    console.log('필터 시작');
    const q = (qEl?.value || "").trim().toLowerCase();
    const currentType = state.currentType;
    const currentFloor = state.currentFloor;

    const filtered = state.rows.filter(r => {
      // 1. 키워드 필터링 (이름 또는 설명)
      const text = `${r.name || ""} ${r.items || ""}`.toLowerCase();
      const passesKeyword = !q || text.includes(q);

      // 2. 타입 필터링 (POI 모델 type -> data-filter type)
      let poiType;
      if (r.type === '매점') poiType = 'food';
      else if (r.type === '편의시설') poiType = 'toilet';
      else poiType = 'all';
      const passesType = currentType === 'all' || poiType === currentType;

      let passesFloor = true;
      if (currentFloor !== 'all') {
        // r.floor는 '1', '2' 등으로 저장되어 있고, currentFloor도 '1', '2' 등으로 들어옴
        passesFloor = String(r.floor) === String(currentFloor);
      }

      return passesKeyword && passesType && passesFloor;
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
        // 숨길 때 InfoWindow도 닫기
        if (infowindow.getMap() && infowindow.getContent().includes(marker.getTitle())) {
          infowindow.close();
        }
      }
    });
  }

  // ✅ 입력 이벤트 (디바운스)
  // ... (입력 이벤트 로직은 변경 없음)
  let t;
  qEl?.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(applyFilter, 200);
  });

  // ✅ “×” 버튼 클릭 시 검색창 리셋 + 전체 표시
  // ... (클리어 버튼 로직은 변경 없음)
  clearBtn?.addEventListener("click", () => {
    qEl.value = "";
    applyFilter();
    qEl.focus();
  });

  // ✅ 타입 필터(레일/칩 공통) 로직 🚩이 부분을 올바르게 수정합니다.🚩
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter');

      if (type === 'route') return;

      // 💡 STATE 업데이트 후 applyFilter 호출
      state.currentType = type;
      applyFilter();

      // 🚩 버튼 강조 로직 추가/수정
      document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');

      // (기존의 모바일 칩 강조 로직은 제거)
      // document.querySelectorAll('.chip').forEach(c => c.style.outline = '');
      // if (btn.classList.contains('chip')) btn.style.outline = '2px solid var(--brand)';
    });
  });

  document.querySelectorAll('[data-floor]').forEach(btn => {
    // ... (층 필터 로직은 변경 없음)
    btn.addEventListener('click', () => {
      // 1. HTML data-floor 속성에서 층 값을 가져옴 ('all', '1', '2' 등)
      const floor = btn.getAttribute('data-floor');

      // 2. STATE 업데이트
      state.currentFloor = floor;

      // 3. 필터링 함수 호출
      applyFilter();

      // 4. 층 필터 버튼 시각적 업데이트 (active 클래스 토글)
      document.querySelectorAll('[data-floor]').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // 💡 초기 로드 시 필터 적용 (load 함수 대체)
  // ... (초기 로드 로직은 변경 없음)
  // DOMContentLoaded 시점에 데이터가 이미 로드된 것으로 간주하고 필터를 적용합니다.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFilters); // applyFilter 대신 initializeFilters 호출
  } else {
    initializeFilters(); // applyFilter 대신 initializeFilters 호출
  }
  // ✅ initializeFilters 함수는 이 위치에 그대로 두면 됩니다.
  function initializeFilters() {
    applyFilter();
    // ✅ 초기 로드 시 'all' 버튼에 active 클래스 추가
    const defaultBtn = document.querySelector('[data-filter="all"]');
    if (defaultBtn) {
      defaultBtn.classList.add('active');
    }
    // 🚩 초기 로드 시 층 필터 'all'도 함께 강조하려면 아래 코드 추가 🚩
    const defaultFloorBtn = document.querySelector('[data-floor="all"]');
    if (defaultFloorBtn) {
      defaultFloorBtn.classList.add('active');
    }
  }


  let lastScrollTop = 0;
  document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('mobileListToggle');
    const resultList = document.getElementById('resultList');
    // 🛑 BODY 스크롤 제어를 위해 참조
    const body = document.body;

    if (toggleBtn && resultList) {

      // 🛑 [Body 스크롤 방지 로직] 리스트 내부 터치는 이벤트 전달 방지 (푸터/지도 스크롤 막음)
      resultList.addEventListener('touchstart', function (e) {
        e.stopPropagation();
      });
      resultList.addEventListener('touchmove', function (e) {
        e.stopPropagation();
      });

      // 1. 버튼 클릭 시 토글 (기존 로직)
      toggleBtn.addEventListener('click', function () {
        resultList.classList.toggle('show-names');
        updateButtonState();
      });

      // 2. 리스트 아이템 클릭 시 닫기 (기존 로직)
      resultList.addEventListener('click', function (e) {
        if (e.target.closest('.item')) {
          resultList.classList.remove('show-names');
          updateButtonState();
        }
      });

      // 3. [스크롤 감지 로직] (수정된 로직)
      resultList.addEventListener('scroll', function () {
        const scrollHeight = resultList.scrollHeight;
        const scrollTop = resultList.scrollTop;
        const clientHeight = resultList.clientHeight;

        // 현재 스크롤 방향 판단
        const scrollingUp = scrollTop < lastScrollTop;

        // 맨 아래 도달 체크 (소수점 오차 방지를 위해 1픽셀 여유)
        const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 1);

        // ------------------------------------------------------------------
        // 스크롤 차단/허용 결정 로직
        // ------------------------------------------------------------------

        if (isAtBottom && !scrollingUp) {
          // [바닥 + 아래로 스크롤 시] : 스크롤을 멈춥니다.
          resultList.classList.add('no-inner-scroll');
        }
        // 🛑 바닥에 닿은 후 위로 스크롤하려고 하거나 중간일 경우 무조건 허용
        else {
          resultList.classList.remove('no-inner-scroll');
        }

        // 현재 스크롤 위치를 다음 체크를 위해 저장 (필수!)
        lastScrollTop = scrollTop;
      });

      // 4. [터치 종료 리스너] (스크롤 차단 해제 보조)
      resultList.addEventListener('touchend', function () {
        // 터치 종료 시 차단 클래스를 제거하여 다음 동작을 위해 준비
        if (resultList.classList.contains('no-inner-scroll')) {
          resultList.classList.remove('no-inner-scroll');
        }
      });

      // 5. [업데이트 함수] (Body 스크롤 락 추가)
      function updateButtonState() {
        const body = document.body;
        // 스크롤바 너비 계산 (PC 등 스크롤바가 있는 환경에서 레이아웃 밀림 방지)
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        if (resultList.classList.contains('show-names')) {
          // 목록이 열렸을 때 (목록 보기 상태)
          toggleBtn.textContent = '목록 닫기';
          toggleBtn.style.backgroundColor = '#555';

          // 🛑 [Body 스크롤 락 시작] 리스트 바깥 터치 시 페이지 움직임 차단
          if (scrollbarWidth > 0) {
            // 스크롤바 너비만큼 padding-right를 추가하여 레이아웃 밀림 보정
            body.style.paddingRight = `${scrollbarWidth}px`;
          }
          body.classList.add('no-scroll'); // CSS로 overflow: hidden 적용
        } else {
          // 목록이 닫혔을 때 (목록 숨김 상태)
          toggleBtn.textContent = '목록 보기';
          toggleBtn.style.backgroundColor = '#333';

          // 🛑 [Body 스크롤 락 해제]
          body.classList.remove('no-scroll');
          body.style.paddingRight = ''; // 보정 패딩 제거

          // 🛑 [내부 스크롤 잔여 클래스 제거] 
          // 혹시 모를 내부 스크롤 차단 잔여 클래스를 확실히 제거하여 다음 목록 열림에 대비
          resultList.classList.remove('no-inner-scroll');
        }
      }
    }
  });
})();