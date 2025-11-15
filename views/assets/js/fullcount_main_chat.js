// /assets/js/chat_widget.js
// 모달 토글 + 메인과 동일한 대화 이벤트(ensureStart/greet/ask) + quick/links 렌더

(() => {


  console.log('[fullcount_main_chat] loaded v4');

  // 동적 import로 모듈/비모듈 어디서든 동작
  let ensureStart, ask, greet;
  const importCore = async () => {
    if (ensureStart && ask && greet) return;
    const core = await import('/assets/js/aiCore.js');
    ensureStart = core.ensureStart;
    ask = core.ask;
    greet = core.greet;
  };

  const modal = document.getElementById('chatModal');
  const fab = document.getElementById('fabBtn');
  const closeBtn = document.getElementById('chatClose');
  const $wrap = document.getElementById('fcChat');     // 메인과 동일 컨테이너(로그 오픈용)
  const $log = document.getElementById('chatLog');
  const $input = document.getElementById('chatInput');
  const $send = document.getElementById('chatSend');


  const sendBtn = document.getElementById("chatSend");

  /* 전송 버튼 누를 때 input 포커스가 유지되도록 */
  sendBtn.addEventListener("mousedown", function (e) {
    e.preventDefault(); // 버튼 클릭 시 포커스 이동(blur) 방지
  });

  if (!modal || !fab || !$log || !$input) return;

  /* ===== 공통 렌더(메인과 동일한 마크업) ===== */
  // function row(role, text) {
  //   const wrap = document.createElement('div');
  //   wrap.className = `fc-row ${role}`;
  //   if (role === 'bot') {
  //     const avatar = document.createElement('div');
  //     avatar.className = 'fc-avatar';
  //     wrap.appendChild(avatar);
  //   }
  //   const bubble = document.createElement('div');
  //   bubble.className = 'fc-bubble';
  //   bubble.innerHTML  = text || '';
  //   wrap.appendChild(bubble);
  //   $log.appendChild(wrap);
  //   $log.scrollTop = $log.scrollHeight;

  //   return wrap;
  // }





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
      // ✅ 링크 포함 HTML 그대로 렌더
      bubble.innerHTML = text || '';
    } else {
      bubble.textContent = text || '';
    }

    wrap.appendChild(bubble);
    $log.appendChild(wrap);
    $log.scrollTop = $log.scrollHeight;
    return wrap;
  }



  function renderExtras(r) {
    // 빠른질문
    if (Array.isArray(r?.quick) && r.quick.length) {
      const wrap = document.createElement('div');
      wrap.className = 'fc-quick';
      r.quick.forEach(label => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'fc-quick__btn';
        b.textContent = label;
        b.addEventListener('click', async () => {
          $input.value = label;
          await onSend();
        });
        wrap.appendChild(b);
      });
      $log.appendChild(wrap);
    }
    // 링크
    if (Array.isArray(r?.links) && r.links.length) {
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

  /* ===== 모달 토글 ===== */
  // function openModal() {
  //   modal.hidden = false;
  //   modal.classList.add('show');
  //   fab.setAttribute('aria-expanded', 'true');
  //   setTimeout(() => ($input || closeBtn || fab)?.focus(), 0);
  //   greetOnce().catch(() => { });   // 열릴 때 1회 인사 시도
  // }
  // function closeModal() {
  //   modal.classList.remove('show');
  //   modal.hidden = true;
  //   fab.setAttribute('aria-expanded', 'false');
  //   fab.focus();
  // }

  // // fab.addEventListener('click', openModal);

  // closeBtn?.addEventListener('click', closeModal);
  // modal.addEventListener('click', (e) => {
  //   if (e.target.matches('[data-dismiss="modal"], .modal__backdrop')) closeModal();
  // });
  // window.addEventListener('keydown', (e) => {
  //   if (e.key === 'Escape' && !modal.hidden) closeModal();
  // });
  /* ===== 모달 토글 ===== */
  // 모달 열려있는지 여부를 JS가 직접 기억
  let isOpen = false;

  function openModal() {
    if (isOpen) return;      // 이미 열려있으면 또 열지 않음
    isOpen = true;

    modal.hidden = false;
    modal.classList.add('show');
    fab.setAttribute('aria-expanded', 'true');
    setTimeout(() => ($input || closeBtn || fab)?.focus(), 0);
    greetOnce().catch(() => { });   // 열릴 때 1회 인사 시도
  }

  function closeModal() {
    if (!isOpen) return;     // 이미 닫혀있으면 무시
    isOpen = false;

    modal.classList.remove('show');
    modal.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  // ✅ fab 버튼 클릭 시 토글
  fab.addEventListener('click', () => {
    if (isOpen) {
      closeModal();  // 열려 있으면 닫기
    } else {
      openModal();   // 닫혀 있으면 열기
    }
  });

  // X 버튼으로 닫기
  closeBtn?.addEventListener('click', closeModal);

  // 배경 클릭으로 닫기
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-dismiss="modal"], .modal__backdrop')) {
      closeModal();
    }
  });

  // ESC 키로 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen && !modal.hidden) {
      closeModal();
    }
  });

  /* ===== 대화 이벤트(메인과 동일 플로우) ===== */
  let greeted = false;
  async function greetOnce() {
    if (greeted) return;
    greeted = true;

    await importCore();
    const started = await ensureStart();
    if (!started) {
      row('bot', '초기화에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    // 모달에서도 로그 영역 열기
    $wrap?.classList.add('active');

    // 프롬프트 기반 인사($start$) 수신
    const g = await greet();
    row('bot', g.reply);
    renderExtras(g);
  }

  let busy = false;
  async function onSend() {
    if (busy) return;
    const text = ($input.value || '').trim();
    if (!text) return;

    await importCore();

    const started = await ensureStart();
    if (!started) {
      row('bot', '초기화에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    row('user', text);
    $input.value = '';

    busy = true;
    try {
      // const r = await ask(text);
      // row('bot', r.reply, true);
      const r = await ask(text);
      row('bot', r.reply);
      renderExtras(r);
    } catch (e) {
      // console.error('widget ask error', e); // suppressed per request
      row('bot', '서버와 연결할 수 없습니다.');
    } finally {
      busy = false;
      $input?.focus();
    }
  }

  // 입력 포커스/클릭 시 1회 인사
  $input.addEventListener('focus', () => { greetOnce().catch(() => { }); });
  $input.addEventListener('click', () => { greetOnce().catch(() => { }); });

  // Enter 전송: 인사 전이면 먼저 인사 후 전송
  $input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    if (!greeted) {
      greetOnce().then(onSend).catch(onSend);
    } else {
      onSend();
    }
  });

  // 전송 버튼
  $send?.addEventListener('click', onSend);

  sendBtn.addEventListener("mousedown", function (e) {
    e.preventDefault(); // 버튼 클릭 시 포커스 이동(blur) 방지
  });

  sendBtn.addEventListener("click", function () {
    const msg = $input.value.trim();
    if (!msg) return;

    // 메시지 전송 처리…

    // 전송 후에도 input 포커스 유지
    $input.focus();
  });

})();
