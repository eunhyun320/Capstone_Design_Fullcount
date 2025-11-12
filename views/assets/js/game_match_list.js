(function () {
  const tbody = document.getElementById("scheduleBody");
  const currentMonthEl = document.getElementById("currentMonth");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  
  // 현재 날짜 기준으로 초기화
  let currentDate = new Date();
  
  function getLocalDateString(isoDateString) {
    if (!isoDateString) return '';
    // '2025-09-03T...' 와 같은 문자열에서 T 이후를 제거하여 UTC가 아닌 로컬 시간으로 간주하게 함
    const date = new Date(isoDateString.slice(0, 10));
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function updateMonthDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    currentMonthEl.textContent = `${year}년 ${month}월`;
  }
  
  function getCurrentMonthString() {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
  
  async function load() {
    try {
      tbody.innerHTML = `<tr><td colspan="7">불러오는 중...</td></tr>`;
      const monthString = getCurrentMonthString();
      const res = await fetch(`/api/schedules?month=${monthString}`);
      const json = await res.json();
      const rows = json.data || [];

      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="7">표시할 항목이 없습니다.</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.map(r => {
        // ⬇ 취소 경기 여부 확인
        const isCanceled =
          (r.note || '').includes('우천취소') ||
          (r.note || '').includes('그라운드사정');

        // ⬇ 리뷰 버튼은 취소 경기가 아닐 때만 표시
        const reviewUrlBase = "http://localhost/gameinfo_result?id=";

        const review =
          (!isCanceled && r.game_page_id) // review_url 대신 game_page_id가 존재하는지 확인
            ? `<a href="${reviewUrlBase}${r.game_page_id}" class="btn2">리뷰</a>`
            : '';
        // 이동일이나 휴식일 처리
        const isRestDay = (r.note || '').includes('이동일') || 
                         (r.note || '').includes('휴식') ||
                         (!r.team_home && !r.team_away && r.note);
        
        const matchInfo = isRestDay 
          ? ''  // 빈 칸으로 표시
          : `${r.team_home || '-'} <em>${r.score_home ?? ''} : ${r.score_away ?? ''}</em> ${r.team_away || '-'}`;

        return `
          <tr>
            <td>${r.game_date.slice(0, 10)}(${r.game_day || ''})</td>
            <td><b>${r.game_time ? r.game_time.slice(0, 5) : ''}</b></td>
            <td>${matchInfo}</td>
            <td>${review}</td>
            <td>${r.tv_channel || ''}</td>
            <td>${r.stadium || ''}</td>
            <td>${r.note || '-'}</td>
          </tr>`;
      }).join('');

    } catch (e) {
      console.error('load schedules error:', e);
      tbody.innerHTML = `<tr><td colspan="7">데이터를 불러오지 못했습니다.</td></tr>`;
    }
  }
  
  // 이전 달로 이동
  function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthDisplay();
    load();
  }
  
  // 다음 달로 이동
  function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthDisplay();
    load();
  }
  
  // 초기화
  function init() {
    updateMonthDisplay();
    
    // 이벤트 리스너 추가
    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    
    // 첫 데이터 로드
    load();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
