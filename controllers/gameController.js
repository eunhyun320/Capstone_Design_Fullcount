// controllers/gameController.js
const pool = require('../common/db');
const gameModel = require('../models/gameModel');
const DB = process.env.SVR_DB_NAME || process.env.DB_NAME || 'myapp_db';

/* 서버 기동 시 테이블 보증 */
(async () => {
  await gameModel.ensureGamePage().catch(e => console.error('[ensure game_page]', e.message));
})();

/* ====== API ====== */
exports.getSchedules = async (req, res) => {
  try {
    const month = req.query.month; // YYYY-MM 형식
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: '월 정보가 필요합니다. (형식: YYYY-MM)'
      });
    }

    const schedules = await gameModel.getSchedules(month);
    // 클라이언트가 기대하는 형식으로 응답
    res.json({
      data: schedules,
      month: month
    });
  } catch (e) {
    console.error('[GET /api/schedules]', e);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

/* ====== 뷰 ====== */
exports.showMatchList = (req, res) => res.render('gameinfo/game_match_list.html');
exports.showResult = async (req, res) => {
  try {
    let gameId = req.query.id;

    // ID가 없으면 가장 최신 경기 ID 조회
    if (!gameId) {
      const latest = await gameModel.findLatest();
      if (!latest) {
        return res.render('gameinfo/gameinfo_result.html', {
          gameDetails: null,
          gameId: null,
          error: '등록된 경기 데이터가 없습니다.'
        });
      }
      // 최신 ID로 리다이렉트
      return res.redirect(`/gameinfo_result?id=${latest.game_id}`);
    }

    // ID가 있으면 상세 데이터 조회
    const gameDetails = await gameModel.getGameDetailsById(gameId);

    res.render('gameinfo/gameinfo_result.html', {
      gameDetails,
      gameId,
      error: null
    });

  } catch (e) {
    console.error('[showResult] 데이터 조회 오류', e);
    res.render('gameinfo/gameinfo_result.html', {
      gameDetails: null,
      gameId: null,
      error: '데이터 조회 중 오류가 발생했습니다.'
    });
  }
};

exports.showSchedule = (req, res) => res.render('gameinfo/schedule.html');

/* 라인업 보기 */
exports.showPlayerLineup = async (req, res) => {
  try {
    const gameId = Number(req.query.game_id || 0);
    const baseSQL = `
      SELECT g.game_id, g.game_date, g.game_time, g.venue,
             g.home_team_id, g.away_team_id, IFNULL(g.is_lineup_announced,0) AS is_lineup_announced,
             ht.team_code AS home_code, ht.team_name AS home_name, ht.logo_path AS home_logo, 
             ht.team_color AS home_color, ht.home_stadium AS home_stadium, 
             ht.season_record AS home_record, ht.short_name AS home_short, ht.team_rank AS home_rank,
             at.team_code AS away_code, at.team_name AS away_name, at.logo_path AS away_logo, 
             at.team_color AS away_color, at.home_stadium AS away_stadium,
             at.season_record AS away_record, at.short_name AS away_short, at.team_rank AS away_rank
        FROM \`${DB}\`.games g
        JOIN \`${DB}\`.t_team_info ht ON (
          CASE g.home_team_id 
            WHEN 1 THEN ht.team_code = 'E'
            WHEN 2 THEN ht.team_code = 'LG'
            WHEN 3 THEN ht.team_code = 'KIA'
            WHEN 4 THEN ht.team_code = 'SS'
            WHEN 5 THEN ht.team_code = 'NC'
            WHEN 6 THEN ht.team_code = 'KT'
            WHEN 7 THEN ht.team_code = 'LT'
            WHEN 8 THEN ht.team_code = 'OB'
            WHEN 9 THEN ht.team_code = 'HT'
            WHEN 10 THEN ht.team_code = 'WO'
            ELSE ht.team_code = 'E'
          END
        )
        JOIN \`${DB}\`.t_team_info at ON (
          CASE g.away_team_id 
            WHEN 1 THEN at.team_code = 'E'
            WHEN 2 THEN at.team_code = 'LG'
            WHEN 3 THEN at.team_code = 'KIA'
            WHEN 4 THEN at.team_code = 'SS'
            WHEN 5 THEN at.team_code = 'NC'
            WHEN 6 THEN at.team_code = 'KT'
            WHEN 7 THEN at.team_code = 'LT'
            WHEN 8 THEN at.team_code = 'OB'
            WHEN 9 THEN at.team_code = 'HT'
            WHEN 10 THEN at.team_code = 'WO'
            ELSE at.team_code = 'LG'
          END
        )`;
    const [gameRows] = gameId
      ? await pool.query(baseSQL + ' WHERE g.game_id=?', [gameId])
      : await pool.query(
          baseSQL + 
          ` WHERE EXISTS (
            SELECT 1 FROM \`${DB}\`.lineups l 
            WHERE l.game_id = g.game_id
          )
          ORDER BY g.game_date DESC, g.game_time DESC LIMIT 1`
        );

    if (!gameRows.length)
      return res.render('gameinfo/game_player_lineup.html', { game: null, home: null, away: null, home_lineup: [], away_lineup: [], error: '경기 데이터가 없습니다.' });

    const g = gameRows[0];
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
    
    console.log('📊 라인업 조회 결과:');
    console.log('  game_id:', g.game_id);
    console.log('  game_date:', g.game_date);
    console.log('  home_team_id:', g.home_team_id, '/ 라인업 수:', homeLineup.length);
    console.log('  away_team_id:', g.away_team_id, '/ 라인업 수:', awayLineup.length);
    if (homeLineup.length) console.log('  홈 첫번째:', homeLineup[0]);
    if (awayLineup.length) console.log('  어웨이 첫번째:', awayLineup[0]);
    
    const isAnnounced = (homeLineup.length > 0 && awayLineup.length > 0);

    // 날짜 포맷팅 (타임존 문제 방지)
    const formatDate = (date) => {
      // 문자열인 경우 (YYYY-MM-DD 형식)
      if (typeof date === 'string') {
        const dateOnly = date.slice(0, 10); // YYYY-MM-DD 부분만 추출
        const [year, month, day] = dateOnly.split('-').map(Number);

        // 타임존 오프셋을 고려하여 로컬 날짜 생성
        const localDate = new Date(year, month - 1, day);

        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[localDate.getDay()];
        return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekday})`;
      }

      // Date 객체인 경우
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[d.getDay()];
      return `${year}.${month}.${day} (${weekday})`;
    };

    res.render('gameinfo/game_player_lineup.html', {
      game: {
        ...g,
        game_date: formatDate(g.game_date),
        is_lineup_announced: isAnnounced
      },
      home: {
        team_code: g.home_code,
        team_name: g.home_name,
        team_logo: g.home_logo,
        color_primary: g.home_color,
        home_stadium: g.home_stadium,
        season_record: g.home_record,
        short_name: g.home_short,
        team_rank: g.home_rank
      },
      away: {
        team_code: g.away_code,
        team_name: g.away_name,
        team_logo: g.away_logo,
        color_primary: g.away_color,
        home_stadium: g.away_stadium,
        season_record: g.away_record,
        short_name: g.away_short,
        team_rank: g.away_rank
      },
      home_lineup: homeLineup,
      away_lineup: awayLineup,
      error: null
    });
  } catch (e) {
    console.error('[GET /game_player_lineup]', e);
    res.status(500).send(`<pre>${e.sqlMessage || e.message}</pre>`);
  }
};

/* ====== API ====== */
exports.createOrUpdateGame = async (req, res) => {
  try {
    const body = req.body || {};
    const gameDate = body.gameDate;
    if (!gameDate) return res.status(400).json({ ok: false, error: 'gameDate는 필수입니다.' });

    const found = await gameModel.findByDate(gameDate);
    if (found) {
      await gameModel.update(found.game_id, body);
      res.json({ ok: true, id: found.game_id, mode: 'update' });
    } else {
      const id = await gameModel.insert(gameDate, body);
      res.json({ ok: true, id, mode: 'insert' });
    }
  } catch (e) {
    console.error('[POST /api/game]', e);
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'invalid id' });

    const row = await gameModel.findById(id);
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });

    const body = req.body || {};
    const incomingDate = body.gameDate || body.game_date || null;
    if (incomingDate && String(incomingDate).slice(0, 10) !== String(row.game_date).slice(0, 10))
      return res.status(409).json({ ok: false, error: 'date_mismatch' });

    await gameModel.update(id, body);
    res.json({ ok: true, updated: true });
  } catch (e) {
    console.error('[PUT /api/game/:id]', e);
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.getLatestGame = async (req, res) => {
  try {
    const row = await gameModel.findLatest();
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    res.json({ ok: true, id: row.game_id, gameDate: row.game_date, ...payload });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'invalid id' });
    const row = await gameModel.findById(id);
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    res.json({ ok: true, id: row.game_id, gameDate: row.game_date, ...payload });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.getGameDate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'invalid id' });
    const gameDate = await gameModel.getDateById(id);
    if (!gameDate) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, game_date: gameDate });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

// 캘린더 - 검색용 키워드 추가 - 개발 완료 시 지울 예정
exports.getGameByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ ok: false, error: '필수 입력 누락 (date)' });

    // 1) 날짜 문자열 정제 (괄호(…GMT+09:00) 제거 등)
    let cleanDate = date;
    if (typeof date === 'string' && date.includes('GMT')) {
      cleanDate = date.replace(/\(.*\)/, '').trim();
    }

    // 2) YYYY-MM-DD로 정규화 (타임존 문제 방지)
    let formatted;
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      // 이미 YYYY-MM-DD 형식인 경우
      formatted = cleanDate;
    } else {
      // 다른 형식인 경우 Date 객체를 통해 변환 (주의: 타임존 고려)
      const d = new Date(cleanDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ ok: false, error: '잘못된 날짜 형식' });
      }

      // 로컬 시간 기준으로 YYYY-MM-DD 생성
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      formatted = `${yyyy}-${mm}-${dd}`;
    }
    // console.log('[DEBUG formattedDate]', formatted);

    // 3) DB 조회
    const game = await gameModel.getGameByDate(formatted);
    // console.log('[DEBUG game]', game);
    if (!game)
      return res.status(404).json({ ok: false, error: `해당 날짜(${formatted})의 경기가 없습니다.` });

    // ---------- 안전 포맷 유틸 (타임존 문제 방지) ----------
    // 'YYYY-MM-DD' → 'YYYY년 M월 D일' (타임존 영향 없음)
    const toKoreanDate = (ymd) => {
      if (typeof ymd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [y, m, d] = ymd.split('-').map(Number);
        return `${y}년 ${m}월 ${d}일`;
      }
      // Date 객체인 경우에도 타임존 문제 방지
      try {
        const dt = new Date(ymd);
        // UTC 날짜가 아닌 로컬 날짜로 처리
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1;
        const day = dt.getDate();
        return `${year}년 ${month}월 ${day}일`;
      } catch (error) {
        console.warn('날짜 변환 오류:', ymd);
        return String(ymd);
      }
    };

    // 'HH:MM' | 'HH:MM:SS' | Date → 'HH:MM:SS'
    const toTimeHHMMSS = (val) => {
      if (!val) return '';
      if (typeof val === 'string') {
        if (/^\d{2}:\d{2}:\d{2}$/.test(val)) return val;
        if (/^\d{2}:\d{2}$/.test(val)) return `${val}:00`;
        return '';
      }
      if (val instanceof Date) {
        const hh = String(val.getHours()).padStart(2, '0');
        const mm = String(val.getMinutes()).padStart(2, '0');
        const ss = String(val.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      return '';
    };
    // -----------------------------------



    // /game/details?gameId=123 요청을 처리
    exports.getGameDetails = async (req, res) => {
      // 쿼리 파라미터에서 gameId를 추출 (예: /game/details?gameId=123)
      const gameId = req.query.gameId;

      if (!gameId) {
        // 상세 페이지 이동 시 gameId가 없으면 400 에러
        return res.status(400).send('게임 ID가 필요합니다.');
      }

      try {
        // gameModel에서 해당 ID의 상세 데이터를 조회하는 함수 호출
        // 이 함수는 gameModel에 정의되어 있어야 함
        const details = await gameModel.getGameDetailsById(gameId);

        if (!details) {
          // 데이터가 없으면 404 에러 또는 상세 정보 없음 페이지 렌더링
          return res.status(404).send('해당 경기의 상세 정보를 찾을 수 없습니다.');
        }

        // TODO: 상세 페이지를 렌더링하거나 (HTML 응답), JSON으로 상세 데이터를 반환합니다 (API 응답).
        // 여기서는 예시로 JSON 데이터를 반환합니다.
        res.json({ gameId: gameId, details: details });

      } catch (error) {
        console.error(`경기 상세 정보 조회 오류 (ID: ${gameId}):`, error);
        res.status(500).send('서버 오류 발생');
      }
    };

    const dateKr = toKoreanDate(game.game_date);
    const timeFull = toTimeHHMMSS(game.game_time);
    // new model returns game_venue (COALESCE of home/away stadium); fall back to venue if present
    const venue = game.game_venue || game.venue || '';
    const display = `${dateKr}  ${timeFull} | ${venue}`;


    // 기본 로고(플레이스홀더) 경로 지정: 뷰 정적 디렉토리(/assets) 기준
    const placeholderLogo = '/assets/img/original_logo.png';
    if (!game.home_team_logo) game.home_team_logo = placeholderLogo;
    if (!game.away_team_logo) game.away_team_logo = placeholderLogo;

    res.json({ ok: true, display, game });
  } catch (e) {
    console.error('[GET /api/game-by-date]', e);
    res.status(500).json({ ok: false, error: e.message });
  }
};
exports.getGameDetails = async (req, res) => {
  // 쿼리 파라미터에서 gameId를 추출 (예: /game/details?gameId=123)
  const gameId = req.query.gameId;

  if (!gameId) {
    // 상세 페이지 이동 시 gameId가 없으면 400 에러
    return res.status(400).send('게임 ID가 필요합니다.');
  }

  try {
    // gameModel에서 해당 ID의 상세 데이터를 조회하는 함수 호출
    // 함수는 gameModel에 정의되어 있어야 함
    const details = await gameModel.getGameDetailsById(gameId);

    if (!details) {
      // 데이터가 없으면 404 에러 또는 상세 정보 없음 페이지 렌더링
      return res.status(404).send('해당 경기의 상세 정보를 찾을 수 없습니다.');
    }

  
    res.json({ gameId: gameId, details: details });

  } catch (error) {
    console.error(`경기 상세 정보 조회 오류 (ID: ${gameId}):`, error);
    res.status(500).send('서버 오류 발생');
  }
};

exports.getGameIdByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ ok: false, error: "date required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT game_id FROM game_page WHERE DATE(game_date) = DATE(?) LIMIT 1",
      [date]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "not found" });
    }

    return res.json({ ok: true, gameId: rows[0].game_id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "server error" });
  }
};




// 날짜로 경기 검색 (GET /game/findByDate)

exports.findByDate = async (req, res) => {
  const { date } = req.query;
  console.log('요청 받은 날짜:', date);

  try {
    const gameData = await gameModel.findGameByDate(date);
    console.log('DB에서 찾은 gameData:', gameData);

    if (gameData) {
      res.json({
        success: true,
        id: gameData.game_id,   // PK 컬럼명이 game_id인 거 반영
      });
    } else {
      res.json({
        success: false,
      });
    }
  } catch (error) {
    console.error('findByDate 오류:', error);
    res.status(500).json({
      success: false,
      error: 'DB Error',
    });
  }
};


exports.getNavById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) 이 id의 경기 날짜 가져오기
    const game = await gameModel.findGameDateById(id);
    if (!game || !game.game_date) {
      return res.status(404).json({ success: false, message: 'game not found' });
    }

    const gameDate = game.game_date; // Date 객체든 문자열이든 그대로 넘겨도 됨 

    // 2) 이전/다음 경기 찾기
    const nav = await gameModel.findPrevNextByDate(gameDate);

    return res.json({
      success: true,
      prevId: nav.prev ? nav.prev.game_id : null,
      nextId: nav.next ? nav.next.game_id : null,
      prevDate: nav.prev ? nav.prev.game_date : null,
      nextDate: nav.next ? nav.next.game_date : null,
    });
  } catch (err) {
    console.error('getNavById error:', err);
    return res.status(500).json({ success: false, message: 'server error' });
  }
};