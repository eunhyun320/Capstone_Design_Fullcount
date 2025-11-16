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

// 타입 필터(레일/칩 공통)
// document.querySelectorAll('[data-filter]').forEach(btn => {
//   btn.addEventListener('click', () => {
//     const type = btn.getAttribute('data-filter'); // route|food|toilet
//     document.querySelectorAll('.item').forEach(it => {
//       it.style.display = (type === 'all' || it.dataset.type === type) ? '' : 'none';
//     });
//     // 모바일 칩 강조
//     document.querySelectorAll('.chip').forEach(c => c.style.outline = '');
//     if (btn.classList.contains('chip')) btn.style.outline = '2px solid var(--brand)';
//   });
// });
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-filter'); // route|food|toilet

    // 💡 목록 필터링을 위해서 아래 로직을 호출:
    // 이 로직은 이제 하단의 (function(){...}) 블록으로 이동했습니다.

    // 💡 마커 필터링을 위해서 별도의 함수를 호출 (Naver Map API 연동 필요):
    // handleMapMarkers(type); 

    // ... (기존의 모바일 칩 강조 로직은 하단 블록으로 이동했음)
  });
});

// 더미 지도(배경만). 실제 API 붙이면 아래 블록 삭제.
(function fakeMap() {
  const el = document.getElementById('mapInner');
  if (!el) return;
  el.style.background = "repeating-linear-gradient(45deg,#eef1f3,#eef1f3 20px,#f7f9fb 20px,#f7f9fb 40px)";
  el.style.border = "1px solid #e5e7eb";
  el.style.zIndex = "0";   // 👈 지도 레이아웃을 맨 뒤로
  el.style.position = "relative"
})();

/* 카카오 지도 붙이는 예시 */


// ===== 모달(fab) =====
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
// (function () {
//   const listEl = document.getElementById("resultList");
//   const qEl = document.getElementById("q_m"); // ✅ 검색 input
//   const clearBtn = document.getElementById("btnClear_m"); // ✅ x버튼
//   const badge = { food: "먹거리", toilet: "화장실" };
//   const state = { rows: [] };

//   function render(rows) {
//     if (!rows || rows.length === 0) {
//       listEl.innerHTML = '<p class="empty">표시할 항목이 없습니다.</p>';
//       return;
//     }
//     listEl.innerHTML = rows.map(r => {
//       const imgStyle = r.image ? ` style="background-image:url('${r.image}');"` : "";
//       return `
//         <article class="item" data-type="${r.type}" data-id="${r.id}">
//           <div class="thumb"${imgStyle}></div>
//           <div class="meta">
//             <h4 class="name">${r.name}</h4>
//             <p class="desc">${r.items || ""}</p>
//           </div>
//           <span class="badge">${badge[r.type] || ""}</span>
//         </article>`;
//     }).join("");
//   }

//   // ✅ 검색어 필터
//   function applyFilter() {
//     const q = (qEl?.value || "").trim().toLowerCase();
//     const filtered = state.rows.filter(r => {
//       const text = `${r.name || ""} ${r.items || ""}`.toLowerCase();
//       return !q || text.includes(q);
//     });
//     render(filtered);
//   }

//   // ✅ 입력 이벤트 (디바운스)
//   let t;
//   qEl?.addEventListener("input", () => {
//     clearTimeout(t);
//     t = setTimeout(applyFilter, 200);
//   });

//   // ✅ “×” 버튼 클릭 시 검색창 리셋 + 전체 표시
//   clearBtn?.addEventListener("click", () => {
//     qEl.value = "";
//     applyFilter();
//     qEl.focus();
//   });

//   // ✅ 데이터 불러오기
//   async function load() {
//     try {
//       listEl.innerHTML = '<p class="loading">불러오는 중...</p>';
//       const res = await fetch("/poi");
//       // 서버 오류(비정상 응답)가 올 수 있으므로 res.ok 검사
//       if (!res.ok) {
//         // 시도: 응답이 JSON이면 그 내용을 읽어 에러 메시지를 사용
//         let errText = `HTTP ${res.status}`;
//         try {
//           const body = await res.json();
//           if (body && body.error) errText = body.error;
//         } catch (e) {
//           // 파싱 실패 시 텍스트로 읽어본다
//           try { errText = await res.text(); } catch (_) {}
//         }
//         throw new Error(errText);
//       }

//       const rows = await res.json();
//       state.rows = Array.isArray(rows) ? rows : [];
//       render(state.rows);
//     } catch (e) {
//       console.error("load error:", e);
//       listEl.innerHTML = '<p class="error">목록을 불러오지 못했습니다.</p>';
//     }
//   }

//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", load);
//   } else {
//     load();
//   }
// })();

// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
// 💡 서버 fetch 대신 전역 markersData 배열을 사용하여 목록과 마커를 동시에 제어하는 통합 스크립트
(function () {
    const listEl = document.getElementById("resultList");
    const qEl = document.getElementById("q_m"); // ✅ 검색 input
    const clearBtn = document.getElementById("btnClear_m"); // ✅ x버튼
    const badge = { food: "먹거리", toilet: "편의시설" }; 

    // 💡 STATE 초기화: 전역 markersData를 사용하여 state.rows를 초기화합니다.
    // markersData는 이미 ID가 추가되고 병합된 배열이어야 합니다.
    const state = {
        rows: markersData.map(r => ({
             // POI 모델의 최종 반환 형태(id, type, name, items, image, lat, lng)를 시뮬레이션
             id: r.id,
             type: r.type, // '매점' 또는 '편의시설' (POI 모델의 DB 필드 값)
             name: r.name,
             items: r.name, // 설명 필드는 임시로 이름과 동일하게 설정
             // 이미지 경로는 필요에 따라 markersData에 추가하거나 여기서 매핑합니다.
             image: r.type === '편의시설' ? '../assets/img/marker/marker_편의시설.png' : '../assets/img/marker/marker_먹거리.png',
             lat: r.lat,
             lng: r.lng,
             floor: '' // 층 정보가 필요하다면 markersData에 추가해야 합니다.
        })),
        currentType: 'all' // 'all', 'food', 'toilet' 중 하나
    };

    function render(rows) {
        if (!rows || rows.length === 0) {
            listEl.innerHTML = '<p class="empty">표시할 항목이 없습니다.</p>';
            return;
        }
        listEl.innerHTML = rows.map(r => {
            // POI 모델의 type 값 ('매점', '편의시설')을 HTML의 data-type ('food', 'toilet')으로 매핑
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
      console.log('필터 시작');
        const q = (qEl?.value || "").trim().toLowerCase();
        const currentType = state.currentType; 

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
                // 숨길 때 InfoWindow도 닫기
                if (infowindow.getMap() && infowindow.getContent().includes(marker.getTitle())) {
                    infowindow.close();
                }
            }
        });
    }

    // ✅ 입력 이벤트 (디바운스)
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

    // ✅ 타입 필터(레일/칩 공통) 로직
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-filter');

            if (type === 'route') return; 

            // 💡 STATE 업데이트 후 applyFilter 호출
            state.currentType = type;
            applyFilter(); 

            // 모바일 칩 강조
            document.querySelectorAll('.chip').forEach(c => c.style.outline = '');
            if (btn.classList.contains('chip')) btn.style.outline = '2px solid var(--brand)';
        });
    });

    // 💡 초기 로드 시 필터 적용 (load 함수 대체)
    // DOMContentLoaded 시점에 데이터가 이미 로드된 것으로 간주하고 필터를 적용합니다.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyFilter);
    } else {
        applyFilter();
    }
})();