// app.js (최종본)

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const app = express();
const weatherController = require('./controllers/weatherController');
const pool = require('./common/db');

// ---------------------------------------------------------------------
// 1) 공통 미들웨어
// ---------------------------------------------------------------------
// MySQL 세션 저장소 (관리자 전용)
const sessionStore = new MySQLStore({
  expiration: 1000 * 60 * 60 * 24, // 24시간
  createDatabaseTable: true,
  checkExpirationInterval: 1000 * 60 * 15, // 15분마다 만료된 세션 자동 정리
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  name: 'admin_session',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false, // 로그인 시에만 세션 생성
  cookie: { 
    httpOnly: true, 
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24시간
  }
}));
// ---------------------------------------------------------------------
// 2) 뷰 엔진 / 정적파일
// ---------------------------------------------------------------------
app.set('view engine', 'html');
const VIEWS_DIR = path.join(__dirname, 'views');

// ✅ nunjucks 환경 생성(한 번만)
const env = nunjucks.configure(VIEWS_DIR, {
  autoescape: true,
  express: app,
  watch: true
});

// 정적 리소스: /assets → views/assets
app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));

// 템플릿 전역 로그인 유저
app.use((req, res, next) => {
  res.locals.me = req.session.user || null;
  next();
});
// 날씨
app.use(weatherController.loadWeatherInfo);
// ---------------------------------------------------------------------
// 3) nunjucks 커스텀 필터 (date)
//    사용 예: {{ someDate | date('YYYY-MM-DD HH:mm') }}
// ---------------------------------------------------------------------
env.addFilter('date', function (value, fmt = 'YYYY-MM-DD HH:mm') {
  if (!value) return '';

  let d;
  if (value instanceof Date) d = value;
  else if (typeof value === 'string') {
    const s = value.includes('T') ? value : value.replace(' ', 'T');
    const t = Date.parse(s);
    if (Number.isNaN(t)) return value; // 파싱 실패 시 원문 그대로
    d = new Date(t);
  } else if (typeof value === 'number') d = new Date(value);
  else return '';

  const pad = (n) => String(n).padStart(2, '0');
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  return fmt
    .replace('YYYY', YYYY)
    .replace('MM', MM)
    .replace('DD', DD)
    .replace('HH', HH)
    .replace('mm', mm)
    .replace('ss', ss);
});

// ---------------------------------------------------------------------
// 4) 라우터
// ---------------------------------------------------------------------
app.use('/', require('./routers/public'));   // 사용자/공지 라우트
app.use('/', require('./routers/auth'));     // 로그인/로그아웃 등
app.use('/admin', require('./routers/admin'));// 관리자
app.use('/api/ai', require('./routers/FullCountAi')); // AI API 통일


// 헬스체크
app.get('/ping', (req, res) => res.send('pong'));
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use('/api', (req, res) => {
  res.status(404).json({ code: 404, message: `API not found: ${req.method} ${req.originalUrl}` });
});

// ---------------------------------------------------------------------
// 5) 서버 시작
// ---------------------------------------------------------------------
// Windows에서 80포트는 관리자 권한 필요할 수 있음. 문제면 PORT=3000 으로 실행.
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  // 웹 서버 - nginx 설정에 ip 번호 치고 들어오면 -> 도메인 연결되게 코드 추가 해 놨음
  console.log(`✅ Server running at http://43.200.212.37:${PORT}`);
  // 로컬
  // console.log(`✅ Server running at http://localhost:${PORT}`);
});
