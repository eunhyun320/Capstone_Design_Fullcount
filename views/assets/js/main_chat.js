// /assets/js/main_chat.js
import { ensureStart, ask, greet } from '/assets/js/aiCore.js';

(function () {
  const $wrap = document.getElementById('fcChat');
  const $log = document.getElementById('chatLog');
  const $input = document.getElementById('chatInput');
  if (!$wrap || !$log || !$input) return;

  // 🔵 모바일 키보드 높이 추정 → --kb-offset 에 반영
  const vv = window.visualViewport;
  if (vv) {
    const updateKbOffset = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--kb-offset', `${offset}px`);
    };

    vv.addEventListener('resize', updateKbOffset);
    vv.addEventListener('scroll', updateKbOffset);
    updateKbOffset();
  }

  // ✅ 항상 맨 아래로 보내는 함수
  function scrollBottom() {
    requestAnimationFrame(() => {
      $log.scrollTop = $log.scrollHeight;
    });
  }

  // ✅ 맨 위로 보내는 함수 (채팅 로그용)
  function scrollTopLog() {
    requestAnimationFrame(() => {
      $log.scrollTop = 0;
    });
  }

  /* ---------- 유틸: 로그 열기 ---------- */
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
      bubble.innerHTML = text || '';
    } else {
      bubble.textContent = text || '';
    }

    wrap.appendChild(bubble);
    $log.appendChild(wrap);
    scrollBottom(); // 기본은 아래로
  }

  function renderExtras(r) {
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

    scrollBottom();
  }

  /* ---------- 전송 ---------- */
  async function onSend() {
    const text = ($input.value || '').trim();
    if (!text) return;

    openLog();

    let started = false;
    try {
      started = await ensureStart();
    } catch (e) {
      /* noop */
    }

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
      await ensureStart();
      const g = await greet();
      row('bot', g.reply);
      renderExtras(g);
    } catch (e) {
      row('bot', '안내 메시지를 불러오지 못했습니다. 질문을 입력해 주세요.');
    }
  }

  // ✅ 처음 열었는지 여부
  let firstOpen = true;

  // ✅ 페이지 맨 위로 보내는 함수 (배경 스크롤용)
  function scrollPageTop() {
    const se = document.scrollingElement || document.documentElement;
    window.scrollTo(0, 0);
    se.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  /* ---------- 이벤트 ---------- */

  // ⬇️ 처음 클릭할 때: 포커스를 막고, 대화창 열고, 배경을 맨 위로만 올림
  $input.addEventListener('click', (e) => {
    if (firstOpen) {
      firstOpen = false;

      // 브라우저가 자동 포커스 → 자동 스크롤 하는 걸 막기
      e.preventDefault();

      // 1) 채팅창 열기
      openLog();

      // 2) 배경을 맨 위로
      scrollPageTop();

      // 3) 채팅 로그는 맨 위에서 시작
      scrollTopLog();

      // 4) 인사 메시지만 띄워주고, 키보드는 두 번째 탭에서 올라오도록 둔다
      greetOnce().catch(() => { });
      // ⚠ 여기서는 $input.focus() 안 함 → 브라우저가 다시 아래로 끌고 가지 않게
    } else {
      // 두 번째부터는 평소처럼: 포커스/키보드 O, 자동 스크롤 O
      // (이때는 브라우저 기본 동작으로 포커스 + 키보드가 올라옴)
      openLog();
      greetOnce().catch(() => { });
      scrollBottom();
    }
  });

  // 엔터로 전송
  $input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    if (!greeted) {
      greetOnce().then(onSend).catch(onSend);
    } else {
      onSend();
    }
  });
})();
