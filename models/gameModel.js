const pool = require('../common/db');
const DB = process.env.SVR_DB_NAME || process.env.DB_NAME || 'myapp_db';

exports.getGameById = async (id) => {
    const [rows] = await pool.query(
        `SELECT game_id, game_date, payload
         FROM \`${DB}\`.game_page
         WHERE game_id=? LIMIT 1`,
        [id]
    );
    if (!rows.length) return null;
    return {
        ...rows[0],
        payload: typeof rows[0].payload === 'string' ? JSON.parse(rows[0].payload) : rows[0].payload
    };
};

exports.getGameByDate = async (date) => {
    const sql = `
        SELECT
            g.id AS game_id,
            MAX(gp.game_id) AS page_id,
            g.game_date,
            g.game_day,
            SUBSTRING(g.game_time, 1, 5) AS game_time,
            g.score_home AS score_home,
            g.score_away AS score_away,
            g.result,

            MAX(COALESCE(th.home_stadium, ta.home_stadium)) AS game_venue,

            CASE
                WHEN g.result IS NOT NULL THEN 1
                ELSE 2
            END AS game_status,

            -- 승/세 투수 정보 추출 (JSON_TABLE 사용)
            MAX(CASE WHEN jt_pitcher.result_type = '승' THEN jt_pitcher.pitcher_name ELSE NULL END) AS win_pitcher,
            MAX(CASE WHEN jt_pitcher.result_type = '세' THEN jt_pitcher.pitcher_name ELSE NULL END) AS save_pitcher,
            
            -- 패전 투수 정보 추출 
            
            MAX(CASE WHEN jt_pitcher.result_type = '패' THEN jt_pitcher.pitcher_name ELSE NULL END) AS lose_pitcher,

            g.team_home AS home_team_name_in_list,
            g.team_away AS away_team_name_in_list,
            
            MAX(th.team_name) AS home_team_name,
            MAX(ta.team_name) AS away_team_name,
            MAX(th.logo_path) AS home_team_logo,
            MAX(ta.logo_path) AS away_team_logo,
            MAX(th.season_record) AS home_team_record,
            MAX(ta.season_record) AS away_team_record
        FROM \`${DB}\`.game_schedule_list g
        LEFT JOIN \`${DB}\`.t_team_info th ON g.team_home = th.short_name
        LEFT JOIN \`${DB}\`.t_team_info ta ON g.team_away = ta.short_name
        
        -- 1. 상세 정보를 가진 테이블과 '날짜' 기준으로 조인
        LEFT JOIN \`${DB}\`.game_page gp ON g.game_date = gp.game_date 
        
        -- 2. JSON_TABLE을 사용하여 승리팀 투수 기록 배열을 행으로 변환
        LEFT JOIN LATERAL (
            -- pitcherA의 투수 기록
            SELECT 
                pitcher_name, result_type
            FROM JSON_TABLE(
                gp.payload, 
                '$.tables.pitcherA.rows[*]' 
                COLUMNS(
                    pitcher_name VARCHAR(50) PATH '$[0]', 
                    result_type VARCHAR(10) PATH '$[2]'  
                )
            ) AS p_a
            
            UNION ALL
            
            -- pitcherB의 투수 기록
            SELECT 
                pitcher_name, result_type
            FROM JSON_TABLE(
                gp.payload, 
                '$.tables.pitcherB.rows[*]' 
                COLUMNS(
                    pitcher_name VARCHAR(50) PATH '$[0]', 
                    result_type VARCHAR(10) PATH '$[2]'  
                )
            ) AS p_b
        ) AS jt_pitcher ON 1 = 1  -- LATERAL 조인을 위한 구문
        
        WHERE g.game_date = ?
        
        -- GROUP BY 절을 g 테이블의 비집계 컬럼들로 정리
        GROUP BY 
            g.id, g.game_date, g.game_day, g.game_time, g.score_home, g.score_away, g.result, g.note,
            g.team_home, g.team_away
        LIMIT 1
    `;

    const [rows] = await pool.query(sql, [date]);
    return rows[0] || null;
};


exports.getGameDetailsById = async (scheduleId) => {
    const sql = `
        SELECT 
            g.game_date,
            gp.payload,
            gp.game_id AS page_id
        FROM game_schedule_list g
        LEFT JOIN game_page gp 
            ON gp.game_id = g.id   -- ✅ 날짜 + 팀 매칭 제거, id로 단일 연결
        WHERE g.id = ?
        LIMIT 1;
    `;

    const [rows] = await pool.query(sql, [scheduleId]);
    const row = rows[0];

    if (!row || !row.payload) return null;

    const details = typeof row.payload === 'string'
        ? JSON.parse(row.payload)
        : row.payload;

    return {
        gameDate: row.game_date,
        pageId: row.page_id,
        details
    };
};

exports.getGameIdByDate = async (date) => {
    const sql = `
        SELECT game_id
        FROM \`${DB}\`.game_page
        WHERE DATE(game_date) = DATE(?)
        LIMIT 1
    `;

    const [rows] = await pool.query(sql, [date]);
    return rows.length ? rows[0].game_id : null;
};

exports.getLineup = async (gameId, teamId) => {
    const sql = `
        SELECT l.order_num,
               CASE WHEN l.order_num=10 THEN 'P' ELSE CAST(l.order_num AS CHAR) END AS order_label,
               l.player_name, COALESCE(l.position_kr,'') AS position_kr
          FROM \`${DB}\`.lineups l
         WHERE l.game_id=? AND l.team_id=?
         ORDER BY l.order_num
    `;
    return pool.query(sql, [gameId, teamId]);
};

// 캘린더 - 검색용 키워드 추가 - 개발 완료 시 지울 예정
exports.getSchedules = async (month) => {
    const sql = `
        SELECT
            g.id AS game_id,
            DATE_FORMAT(g.game_date, '%Y-%m-%d') AS game_date,
            g.game_day,
            g.game_time,
            g.team_home,
            g.team_away,
            COALESCE(g.score_home, g.note) AS score_home,
            COALESCE(g.score_away, g.note) AS score_away,
            g.tv_channel,
            g.stadium,
            g.note,
            g.result,
            -- gp.review_url 대신, game_page 테이블의 id를 가져옵니다.
            gp.game_id AS game_page_id,
            CASE
                WHEN g.result IN ('win', 'lose', 'draw') THEN 1
                ELSE 0
            END AS is_finished
        FROM \`${DB}\`.game_schedule_list g
        -- 날짜를 기준으로 game_page 테이블과 LEFT JOIN
        LEFT JOIN \`${DB}\`.game_page gp ON DATE(g.game_date) = DATE(gp.game_date) 
        WHERE DATE_FORMAT(g.game_date, '%Y-%m') = ?
        ORDER BY g.game_date ASC, g.game_time ASC
    `;
    const [rows] = await pool.query(sql, [month]);
    return rows; // rows는 game_page_id 필드를 포함합니다.
};

exports.getLineup = async (gameId, teamId) => {
    const sql = `
        SELECT l.order_num,
               CASE WHEN l.order_num=10 THEN 'P' ELSE CAST(l.order_num AS CHAR) END AS order_label,
               l.player_name, COALESCE(l.position_kr,'') AS position_kr
          FROM \`${DB}\`.lineups l
         WHERE l.game_id=? AND l.team_id=?
         ORDER BY l.order_num
    `;
    return pool.query(sql, [gameId, teamId]);
};

/* ===== game_page 관련 유틸 (admin에서 사용하는 JSON 블롭 저장소) ===== */
exports.ensureGamePage = async () => {
    return pool.query(`
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
    `);
};

exports.findByDate = async (gameDate) => {
    const [rows] = await pool.query(
        `SELECT game_id, game_date, payload FROM \`${DB}\`.game_page WHERE game_date = DATE(?) LIMIT 1`,
        [gameDate]
    );
    return rows[0] || null;
};

exports.insert = async (gameDate, payload) => {
    const jsonBlob = JSON.stringify(payload);
    const [r] = await pool.execute(
        `INSERT INTO \`${DB}\`.game_page (game_date, payload) VALUES (DATE(?), ?)`,
        [gameDate, jsonBlob]
    );
    return r.insertId;
};

exports.update = async (id, payload) => {
    const jsonBlob = JSON.stringify(payload);
    const [r] = await pool.execute(
        `UPDATE \`${DB}\`.game_page SET payload = ?, updated_at = CURRENT_TIMESTAMP WHERE game_id = ?`,
        [jsonBlob, id]
    );
    return r.affectedRows > 0;
};

exports.findLatest = async () => {
    const [rows] = await pool.query(
        // 클릭 시 최신 날짜 보이게 수정
        `SELECT game_id, game_date, payload FROM \`${DB}\`.game_page ORDER BY game_date DESC, game_id DESC LIMIT 1`
    );
    return rows[0] || null;
};

exports.findById = async (id) => {
    const [rows] = await pool.query(
        `SELECT game_id, game_date, payload FROM \`${DB}\`.game_page WHERE game_id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};

exports.getDateById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT DATE_FORMAT(game_date, '%Y-%m-%d') AS game_date FROM \`${DB}\`.game_page WHERE game_id = ? LIMIT 1`,
        [id]
    );
    return rows.length ? rows[0].game_date : null;
};

exports.findScheduleByDate = async (date) => {
    const [rows] = await pool.query(
        `SELECT g.* FROM \`${DB}\`.game_schedule_list g WHERE g.game_date = ? LIMIT 1`,
        [date]
    );
    return rows[0] || null;
};


/*스코어보드 달력 선택 */
exports.findGameByDate = async (date) => {
    console.log('findGameByDate 파라미터 date:', date);

    const [rows] = await pool.query(
        `SELECT g.* 
         FROM game_page g 
         WHERE g.game_date = ? 
         LIMIT 1`,
        [date]
    );

    console.log('findGameByDate rows.length:', rows.length);
    if (rows[0]) {
        console.log('findGameByDate 첫 번째 row:', rows[0]);
    }

    return rows[0] || null;
};


/*1117 */

// 🔹 id로 game_date 가져오기
exports.findGameDateById = async (id) => {
    const sql = `
    SELECT game_date 
    FROM ${DB}.game_page 
    WHERE game_id = ?
  `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
};

// 🔹 game_date 기준 이전/다음 경기 찾기
exports.findPrevNextByDate = async (gameDate) => {
    // 이전 경기 (가장 가까운 과거)
    const prevSql = `
    SELECT game_id, game_date
    FROM ${DB}.game_page
    WHERE game_date < ?
    ORDER BY game_date DESC
    LIMIT 1
  `;
    const [prevRows] = await pool.query(prevSql, [gameDate]);

    // 다음 경기 (가장 가까운 미래)
    const nextSql = `
    SELECT game_id, game_date
    FROM ${DB}.game_page
    WHERE game_date > ?
    ORDER BY game_date ASC
    LIMIT 1
  `;
    const [nextRows] = await pool.query(nextSql, [gameDate]);

    return {
        prev: prevRows[0] || null,
        next: nextRows[0] || null,
    };
};


