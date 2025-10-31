// 모듈
const express = require('express');
const router = express.Router();
const pool = require('../common/db'); // 파일명 소문자

// ★ 환경변수 키는 대문자, 코드 상수명은 DB로 통일
const DB = process.env.SVR_DB_NAME || process.env.DB_NAME || 'myapp_db';

/* ===== 로그인 ===== */
router.get(
  ['/login', '/Login', '/login.html', '/Login.html', '/login/Login.html'],
  (req, res) => res.render('login/Login.html')
);

/* ===== 선수단 정보 ===== */
router.get(['/teaminfo_coach', '/teaminfo_coach.html'], (req, res) => res.render('teaminfo/teaminfo_coach.html'));
router.get(['/teaminfo_hitter', '/teaminfo_hitter.html'], (req, res) => res.render('teaminfo/teaminfo_hitter.html'));
router.get(['/teaminfo_pitcher', '/teaminfo_pitcher.html'], (req, res) => res.render('teaminfo/teaminfo_pitcher.html'));
router.get(['/teaminfo_main', '/teaminfo_main.html'], (req, res) => res.render('teaminfo/teaminfo_main.html'));
router.get('/playerinfodetail', async (req, res, next) => {
  try {
    const playerId = req.query.player_id && Number(req.query.player_id);
    if (!playerId) return res.status(400).send('player_id가 필요합니다.');

    const [rows] = await pool.query(
      `
      SELECT 
        pi.*,
        DATE_FORMAT(pi.birthdate, '%Y년 %c월 %e일') AS birthdate_kr
      FROM player_info pi
      WHERE pi.player_id = ?
      LIMIT 1
      `,
      [playerId]
    );

    if (!rows.length) {
      return res.status(404).send(`선수를 찾을 수 없습니다. (player_id=${playerId})`);
    }

    const p = { ...rows[0], birthdate: rows[0].birthdate_kr };
    delete p.birthdate_kr;

    res.render('teaminfo/playerinfodetail.html', { p });
  } catch (err) {
    next(err);
  }
});

/* ===== 경기정보 ===== */
router.get(['/game_match_list', '/game_match_list.html'], (req, res) => res.render('gameinfo/game_match_list.html'));
router.get(['/gameinfo_result', '/gameinfo_result.html'], (req, res) => res.render('gameinfo/gameinfo_result.html'));
// ─────────────────────────────────────────────
// 테이블 보증: game_page (PK: game_id)
// ─────────────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS \`${DB}\`.\`game_page\` (
    game_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    game_date  DATE NULL,
    payload    JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id),
    KEY idx_game_date (game_date),
    KEY idx_updated_at (updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`).catch(e => console.error('[ensure game_page]', e.sqlMessage || e.message));

/** 생성: POST /api/game  → { ok:true, id } */
// /api/game : 날짜가 같으면 덮어쓰기, 아니면 새로 추가 (2단계 방식)
router.post('/api/game', async (req, res) => {
  try {
    const body = req.body || {};
    const gameDate = body.gameDate;
    if (!gameDate) {
      return res.status(400).json({ ok: false, error: 'gameDate는 필수입니다.' });
    }

    const jsonBlob = JSON.stringify(body);

    // 1) 같은 날짜가 이미 있는지 먼저 확인
    const [sel] = await pool.execute(
      `SELECT game_id, game_date FROM \`${DB}\`.game_page WHERE game_date = DATE(?) LIMIT 1`,
      [gameDate]
    );

    console.log('[POST /api/game] date=', gameDate, 'select=', sel);

    if (sel.length > 0) {
      // 2-A) 있으면 그 행을 UPDATE (덮어쓰기)
      const id = sel[0].game_id;
      const [upd] = await pool.execute(
        `UPDATE \`${DB}\`.game_page
           SET payload = ?, updated_at = CURRENT_TIMESTAMP
         WHERE game_id = ?`,
        [jsonBlob, id]
      );
      console.log('[POST /api/game] mode=update id=', id, 'affected=', upd.affectedRows);
      return res.json({ ok: true, id, mode: 'update' });
    } else {
      // 2-B) 없으면 새로 INSERT
      const [ins] = await pool.execute(
        `INSERT INTO \`${DB}\`.game_page (game_date, payload)
         VALUES (DATE(?), ?)`,
        [gameDate, jsonBlob]
      );
      console.log('[POST /api/game] mode=insert id=', ins.insertId);
      return res.json({ ok: true, id: ins.insertId, mode: 'insert' });
    }
  } catch (e) {
    console.error('[POST /api/game] error', e);
    return res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});


/** 수정: PUT /api/game/:id  (id = game_id) */
// ✅ PUT: payload만 수정. 날짜(game_date)는 절대 변경하지 않음.
//    그리고 몸체에 gameDate가 들어와도, DB의 기존 날짜와 다르면 409로 거부.
router.put('/api/game/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'invalid id' });
    }

    // 1) 현재 레코드의 날짜를 먼저 읽음
    const [curRows] = await pool.execute(
      `SELECT game_date FROM \`${DB}\`.game_page WHERE game_id = ? LIMIT 1`,
      [id]
    );
    if (!curRows.length) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }
    const currentDate = curRows[0].game_date; // Date 객체 또는 문자열

    // 2) 클라이언트가 보낸 body
    const body = req.body || {};
    const incomingDate = body.gameDate || body.game_date || null; // 혹시 섞여 들어오면 확인
    // 날짜가 들어왔고, DB의 날짜와 다르면 업데이트 거부
    if (incomingDate && String(incomingDate).slice(0, 10) !== String(currentDate).slice(0, 10)) {
      return res.status(409).json({ ok: false, error: 'date_mismatch' });
    }

    // 3) 날짜는 건드리지 않고 payload만 갱신
    //    (혹시 body에 gameDate가 들어와도 저장하지 않도록 제거)
    if ('gameDate' in body) delete body.gameDate;
    if ('game_date' in body) delete body.game_date;

    const jsonBlob = JSON.stringify(body);

    const [r] = await pool.execute(
      `UPDATE \`${DB}\`.game_page
         SET payload = ?, updated_at = CURRENT_TIMESTAMP
       WHERE game_id = ?`,
      [jsonBlob, id]
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }
    res.json({ ok: true, updated: true });
  } catch (e) {
    console.error('[PUT /api/game/:id] error', e);
    res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});



// 최신 한 건
router.get('/api/game/latest', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT game_id, game_date, payload
         FROM \`${DB}\`.game_page
        ORDER BY updated_at DESC, game_id DESC
        LIMIT 1`
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'not_found' });
    const row = rows[0];
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    res.json({ ok: true, id: row.game_id, gameDate: row.game_date, ...payload });
  } catch (e) { next(e); }
});

// id로 조회
router.get('/api/game/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'invalid id' });
    const [rows] = await pool.query(
      `SELECT game_id, game_date, payload
         FROM \`${DB}\`.game_page
        WHERE game_id=? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'not_found' });
    const row = rows[0];
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    res.json({ ok: true, id: row.game_id, gameDate: row.game_date, ...payload });
  } catch (e) { next(e); }
});

/* 날짜 가져오기 */
router.get('/api/game/:id/date', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'invalid id' });
    }

    // ✅ SQL에서 문자열로 강제 변환
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(game_date, '%Y-%m-%d') AS game_date 
         FROM \`${DB}\`.game_page 
        WHERE game_id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'not_found' });
    }

    const gameDate = rows[0].game_date; // 이미 문자열 형태 (예: '2025-10-03')
    res.json({ ok: true, game_date: gameDate });
  } catch (e) {
    console.error('[GET /api/game/:id/date] error', e);
    res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});




/* ===== 라인업: 파일형 → 표준 경로 리다이렉트 ===== */
/** 과거 파일형 경로 → 표준 경로로 리다이렉트(유지하면 좋음) */
router.get(['/game_player_lineup.html'], (req, res) => {
  const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, '/game_player_lineup' + q);
});

/** 사용자 라인업 보기 (이미 있는 템플릿: views/gameinfo/game_player_lineup.html) */
router.get('/game_player_lineup', async (req, res) => {
  try {
    const gameId = Number(req.query.game_id || 0);

    const base = `
      SELECT g.game_id, g.game_date, g.game_time, g.venue,
             g.home_team_id, g.away_team_id, IFNULL(g.is_lineup_announced,0) AS is_lineup_announced,
             ht.team_name AS home_name, ht.team_logo AS home_logo, ht.color_primary AS home_color,
             at.team_name AS away_name, at.team_logo AS away_logo, at.color_primary AS away_color
        FROM \`${DB}\`.games g
        JOIN \`${DB}\`.teams ht ON ht.team_id = g.home_team_id
        JOIN \`${DB}\`.teams at ON at.team_id = g.away_team_id
    `;
    const [gameRows] = gameId
      ? await pool.query(base + ' WHERE g.game_id=?', [gameId])
      : await pool.query(base + ' ORDER BY g.game_date DESC, g.game_time DESC LIMIT 1');

    if (!gameRows.length) {
      return res.render('gameinfo/game_player_lineup.html', {
        game: null, home: null, away: null, home_lineup: [], away_lineup: [],
        error: '경기 데이터가 없습니다.'
      });
    }

    const g = gameRows[0];
    const d = new Date(g.game_date);
    const dateLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    const timeLabel = (t => typeof t === 'string' ? t.slice(0, 5)
      : `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`)(g.game_time);

    const lineupSQL = `
      SELECT l.order_num,
             CASE WHEN l.order_num=10 THEN 'P' ELSE CAST(l.order_num AS CHAR) END AS order_label,
             l.player_name, COALESCE(l.position_kr,'') AS position_kr
        FROM \`${DB}\`.lineups l
       WHERE l.game_id=? AND l.team_id=?
       ORDER BY l.order_num
    `;
    const [homeLineup] = await pool.query(lineupSQL, [g.game_id, g.home_team_id]);
    const [awayLineup] = await pool.query(lineupSQL, [g.game_id, g.away_team_id]);

    const isAnnounced = Number(g.is_lineup_announced) === 1 ||
      (homeLineup.length > 0 && awayLineup.length > 0);

    res.render('gameinfo/game_player_lineup.html', {
      game: {
        game_id: g.game_id,
        game_date: dateLabel,
        game_time: timeLabel,
        venue: g.venue,
        is_lineup_announced: isAnnounced
      },
      home: { team_name: g.home_name, team_logo: g.home_logo, color_primary: g.home_color },
      away: { team_name: g.away_name, team_logo: g.away_logo, color_primary: g.away_color },
      home_lineup: homeLineup,
      away_lineup: awayLineup,
      error: null
    });
  } catch (e) {
    console.error('[GET /game_player_lineup]', e);
    res.status(500).send(`<pre>${e.sqlMessage || e.message || String(e)}</pre>`);
  }
});
/* ===== 걍기일정 ===== */
router.get(['/schedule', '/schedule.html'], (req, res) => res.render('gameinfo/schedule.html'));
router.get(['/gameinfo/schedule', '/gameinfo/schedule.html'], (req, res) => res.render('gameinfo/schedule.html'));


/* ===== 야구 규칙 ===== */
router.get(['/rules_attack', '/rules_attack.html'], (req, res) => res.render('rules/rules_attack.html'));
router.get(['/rules', '/rules.html'], (req, res) => res.render('rules/rules.html'));

/* ===== 위치 안내 ===== */
router.get(['/location_come', '/location_come.html'], (req, res) => res.render('location/location_come.html'));
router.get(['/location', '/location.html'], (req, res) => res.render('location/location.html'));
router.get('/poi', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM poi');
    res.json(rows);
  } catch (err) {
    console.error('[GET /api/poi]', err);
    res.status(500).send('DB 오류 발생');
  }
});

/* ===== 고객지원 루트 ===== */
router.get(['/support', '/support.html'], (req, res) => res.render('support/support.html'));
// // FAQ 목록 API (support.js가 /faq로 호출)
router.get('/faq', async (req, res) => {
  try {
    const [rows] = await pool.query(
      // // 스키마명은 환경변수에서 받은 DB 사용
      `SELECT id, question, answer 
         FROM \`${DB}\`.faqs
        ORDER BY id DESC`
    );
    res.json(rows); // // support.js가 기대하는 JSON
  } catch (e) {
    console.error('[GET /faq]', e);
    res.status(500).json({ error: 'DB 오류' });
  }
});

/* ===== 과거 공지 목록 경로 → 동적 목록으로 리다이렉트 ===== */
router.get(
  ['/support/announcement_list', '/support/announcement_list.html'],
  (req, res) => {
    const q = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.redirect(301, '/announcements' + q);
  }
);

/* ===== 공지 목록 ===== */
router.get([
  '/announcements',
  '/support/announcements',
  '/announcement_list',
  '/announcement_list.html'
], async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         notice_id, title, category, is_pinned, view_count,
         IFNULL(publish_at, created_at) AS published_at
       FROM \`${DB}\`.notices
       WHERE status='PUBLISHED'
         AND (publish_at IS NULL OR publish_at <= CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+09:00'))
         AND (expire_at  IS NULL OR expire_at  >  CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+09:00'))
         AND deleted_at IS NULL
       ORDER BY is_pinned DESC, published_at DESC, created_at DESC
       LIMIT 100`
    );

    res.render('support/announcement_list.html', {
      notices: rows,
      items: rows // 호환용(다른 include에서 items 참조 시)
    });
  } catch (e) { next(e); }
});

/* ===== 공지 상세 ===== */
router.get([
  '/announcements/:id',
  '/support/announcements/:id',
  '/announcement_detail',
  '/announcement_detail.html'
], async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) return res.status(400).send('잘못된 요청');

    const [[item]] = await pool.query(
      `SELECT 
         notice_id, title, content_md, category, view_count,
         IFNULL(publish_at, created_at) AS published_at
       FROM \`${DB}\`.notices
       WHERE notice_id=?
         AND status='PUBLISHED'
         AND (publish_at IS NULL OR publish_at <= CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+09:00'))
         AND (expire_at  IS NULL OR expire_at  >  CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+09:00'))
         AND deleted_at IS NULL`,
      [id]
    );

    if (!item) return res.status(404).send('공지를 찾을 수 없습니다.');

    // 조회수 +1 (실패 무시)
    pool.query(`UPDATE \`${DB}\`.notices SET view_count=view_count+1 WHERE notice_id=?`, [id]).catch(() => { });

    res.render('support/announcement_detail.html', {
      notice: item,
      item: item // 호환용
    });
  } catch (e) { next(e); }
});

/* ===== 문의하기 페이지 ===== */
router.get(
  ['/inquiry', '/Inquiry_details', '/Inquiry_details.html', '/support/Inquiry_details.html'],
  (req, res) => res.render('support/Inquiry_details.html')
);
router.get(
  ['/inquiry/history', '/Inquiry_history', '/Inquiry_history.html', '/support/Inquiry_history.html'],
  (req, res) => res.render('support/Inquiry_history.html')
);

/* ===== 문의 API ===== */
router.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, category, messagetitle, message } = req.body || {};
    if (!name || !email || !category || !messagetitle || !message) {
      return res.status(400).json({ ok: false, error: '필수 입력 누락' });
    }
    const [r] = await pool.query(
      `INSERT INTO \`${DB}\`.inquiries (name,email,category,title,message) VALUES (?,?,?,?,?)`,
      [name.trim(), email.trim(), category.trim(), messagetitle.trim(), message.trim()]
    );
    res.json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error('[POST /api/inquiries]', e);
    res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});

router.get('/api/inquiries', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id,name,email,category,title,message,status,created_at
         FROM \`${DB}\`.inquiries
        ORDER BY created_at DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});

/* ===== 경기결과 API (날짜별 조회) - 2안 (임시) ===== */
router.get('/api/game-by-date', async (req, res) => {
  try {
    // 1. URL에서 ?date=... 값 가져오기
    const { date } = req.query; // (여기엔 'Thu Oct 16 2025...'가 들어옴)

    if (!date) {
      return res.status(400).json({ ok: false, error: '필수 입력 누락 (date)' });
    }

    // --- ★★★★★ 이 부분이 수정/추가되어야 합니다 ★★★★★ ---

    // 2. 받은 긴 문자열을 JavaScript 날짜 객체로 변환
    const dateObj = new Date(date);

    // 3. 'YYYY-MM-DD' 형식으로 포맷팅 (예: 2025-10-16)
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // (0~11이라 +1 필요)
    const day = dateObj.getDate().toString().padStart(2, '0');

    // 이 변수에 '2025-10-16'이 담깁니다.
    const formattedDate = `${year}-${month}-${day}`;
    console.log("문지열" + formattedDate);

    // --- ★★★★★ 여기까지 ★★★★★ ---


    // 4. SQL 쿼리 수정 (조인 조건을 팀 이름으로 변경)
    const sql = `
        SELECT
            g.game_date,
            g.game_day,
            SUBSTRING(g.game_time, 1, 5) AS game_time,
            g.score_home,
            g.score_away,
            g.result,
            
            COALESCE(th.home_stadium, ta.home_stadium) AS game_venue,
            
            -- DB 기록 유무에 따른 game_status (간단 구현)
            CASE
                WHEN g.result IS NOT NULL THEN 1  -- 결과 값이 있으면 종료 (가장 안전한 방식)
                ELSE 2
            END AS game_status,
            
            -- 투수 정보: 필드가 없으므로 임시 문자열 반환
            '투수 정보' AS win_pitcher, 
            '투수 정보' AS lose_pitcher,
            '투수 정보' AS save_pitcher,
            
            g.team_home AS home_team_name_in_list, -- List에 저장된 한글 이름 그대로 유지
            g.team_away AS away_team_name_in_list,
            
            th.team_name AS home_team_name,       -- t_team_info의 공식 이름
            ta.team_name AS away_team_name,       
            th.logo_path AS home_team_logo,       -- 로고 경로 가져오기 성공 기대!
            ta.logo_path AS away_team_logo,
            th.season_record AS home_team_record,
            ta.season_record AS away_team_record
        FROM
        ${DB}.game_schedule_list g
    -- 🚨 조인 조건을 g.team_home (한글 약어)와 th.short_name으로 변경
    LEFT JOIN ${DB}.t_team_info th ON g.team_home = th.short_name 
    LEFT JOIN ${DB}.t_team_info ta ON g.team_away = ta.short_name 
    WHERE
            g.game_date = ?
        LIMIT 1;
    `;
    // 5. 쿼리 실행
    const [rows] = await pool.query(sql, [formattedDate]);

    // 6. 결과 반환: 데이터가 있으면 무조건 경기 종료로 간주
    if (rows && rows.length > 0) {
      // 'game_status' 필드가 없으므로, game: rows[0]을 반환하면 JS에서 데이터 존재 여부로 판단함
      res.json({ ok: true, game: rows[0] });
    } else {
      // 404 응답 (경기 정보 없음)
      res.status(404).json({ ok: false, error: '해당 날짜의 경기가 없습니다.' });
    }

  } catch (e) {
    console.error('[GET /api/game-by-date] (2안)', e);
    res.status(500).json({ ok: false, error: e.sqlMessage || e.message });
  }
});


/* ===== 루트 ===== */
router.get(['/', '/index', '/index.html'], (req, res) => res.render('index.html'));

module.exports = router;
