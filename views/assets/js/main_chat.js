// /assets/js/main_chat.js
import { ensureStart, ask, greet } from '/assets/js/aiCore.js';

(function () {
  const $wrap = document.getElementById('fcChat');
  const $log = document.getElementById('chatLog');
  const $input = document.getElementById('chatInput');
  if (!$wrap || !$log || !$input) return;

  /* ---------- 유틸: 로그 열기(한 곳에서 관리) ---------- */
  function openLog() {
    if (!$wrap.classList.contains('active')) {
      $wrap.classList.add('active');
    }
  }

  /* ---------- 공통 렌더 ---------- */
  function row(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `fc-row ${role}`;
    if (role === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'fc-avatar';
      wrap.appendChild(avatar);
    }
    const bubble = document.createElement('div');
    bubble.className = 'fc-bubble';

    if (role === 'bot') {
      // ✅ AI 응답은 HTML 그대로 렌더 → <a> 링크 살아남
      bubble.innerHTML = text || '';
    } else {
      // 사용자 메시지는 그냥 텍스트로
      bubble.textContent = text || '';
    }

    wrap.appendChild(bubble);
    $log.appendChild(wrap);
    $log.scrollTop = $log.scrollHeight;
  }


  function renderExtras(r) {
    // 빠른질문
    if (Array.isArray(r.quick) && r.quick.length) {
      const wrap = document.createElement('div');
      wrap.className = 'fc-quick';
      r.quick.forEach(label => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fc-quick__btn';
        b.textContent = label;
        b.addEventListener('click', async () => {
          openLog();
          $input.value = label;
          await onSend();
        });
        wrap.appendChild(b);
      });
      $log.appendChild(wrap);
    }
    // 링크
    if (Array.isArray(r.links) && r.links.length) {
      const wrap = document.createElement('div');
      wrap.className = 'fc-links';
      r.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label || link.href;
        a.className = 'fc-link';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        wrap.appendChild(a);
      });
      $log.appendChild(wrap);
    }
    $log.scrollTop = $log.scrollHeight;
  }

  /* ---------- 전송 ---------- */
  async function onSend() {
    const text = ($input.value || '').trim();
    if (!text) return;

    openLog();

    let started = false;
    try {
      started = await ensureStart();
    } catch (e) { /* noop */ }
    if (!started) {
      row('bot', '초기화에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    row('user', text);
    $input.value = '';

    try {
      const r = await ask(text);
      row('bot', r.reply);
      renderExtras(r);
    } catch (e) {
      row('bot', '요청 처리 중 오류가 발생했습니다.');
    }
  }

  /* ---------- 첫 인사 1회 ---------- */
  let greeted = false;
  async function greetOnce() {
    if (greeted) return;
    greeted = true;

    openLog();

    try {
      await ensureStart();                  // 세션 보장
      const g = await greet();              // $start$ 인사
      row('bot', g.reply);
      renderExtras(g);
    } catch (e) {
      row('bot', '안내 메시지를 불러오지 못했습니다. 질문을 입력해 주세요.');
    }
  }

  /* ---------- 이벤트 ---------- */
  $input.addEventListener('focus', () => { greetOnce().catch(() => { }); openLog(); });
  $input.addEventListener('click', () => { greetOnce().catch(() => { }); openLog(); });

  // Enter 전송: 인사 전이면 먼저 인사 후 전송
  $input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (!greeted) {
      greetOnce().then(onSend).catch(onSend);
    } else {
      onSend();
    }
  });

  /* ===== 채팅창 활성화 시 body 클래스 추가 (PC + 모바일 공통) ===== */
  const observer = new MutationObserver(() => {
    if ($wrap.classList.contains('active')) {
      document.body.classList.add('chat-active');
    } else {
      document.body.classList.remove('chat-active');
    }
  });
  observer.observe($wrap, { attributes: true, attributeFilter: ['class'] });

  /* ===== 모바일 키보드 대응 로직 ===== */
  // 모바일 감지
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {

    // 입력창 포커스 시 처리
    $input.addEventListener('focus', () => {
      // 키보드가 올라올 때 최신 메시지로 스크롤
      setTimeout(() => {
        if ($log) {
          $log.scrollTop = $log.scrollHeight;
        }
      }, 300); // 키보드 애니메이션 대기
    });

    // 입력창 블러 시 처리
    $input.addEventListener('blur', () => {
      // 키보드 내려갈 때 레이아웃 재조정
      setTimeout(() => {
        if ($log) {
          $log.scrollTop = $log.scrollHeight;
        }
      }, 100);
    });

    // 화면 크기 변경 감지 (키보드 올라오는 것 감지)
    let lastHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const isKeyboardOpen = currentHeight < lastHeight * 0.8;
      
      if (isKeyboardOpen && $wrap.classList.contains('active')) {
        // 키보드가 올라왔을 때 채팅창 스크롤을 맨 아래로
        setTimeout(() => {
          if ($log) {
            $log.scrollTop = $log.scrollHeight;
          }
        }, 100);
      }
      
      lastHeight = currentHeight;
    });

    // iOS Visual Viewport API 지원 (더 정확한 키보드 감지)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if ($wrap.classList.contains('active') && document.activeElement === $input) {
          // 키보드가 화면을 차지하면 채팅창 최신 메시지로 스크롤
          setTimeout(() => {
            if ($log) {
              $log.scrollTop = $log.scrollHeight;
            }
          }, 50);
        }
      });
    }

    // 메시지 전송 후 자동 스크롤 강화
    const originalRow = row;
    row = function(role, text) {
      const result = originalRow(role, text);
      // 모바일에서는 메시지 추가 후 약간 지연시켜 스크롤
      setTimeout(() => {
        if ($log) {
          $log.scrollTop = $log.scrollHeight;
        }
      }, 50);
      return result;
    };
  }

})();
