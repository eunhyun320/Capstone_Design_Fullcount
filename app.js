// // app.js (정리본)
// require('dotenv').config();
// const path = require('path');
// const express = require('express');
// const session = require('express-session');
// const nunjucks = require('nunjucks');
// const morgan = require('morgan');

// const app = express();

// // ---------------------------------------------------------------------
// // 1) 공통 미들웨어
// // ---------------------------------------------------------------------
// app.use(morgan('dev'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'change_this_secret', // // 나중에 .env 에서 관리
//   resave: false,
//   saveUninitialized: false,
//   cookie: { httpOnly: true, sameSite: 'lax' }
// }));

// // ---------------------------------------------------------------------
// // 2) 뷰 엔진 / 정적파일 (여기서 env 생성!)
// // ---------------------------------------------------------------------
// app.set('view engine', 'html');
// const VIEWS_DIR = path.join(__dirname, 'views');

// // ✅ nunjucks 환경을 변수에 담아야 아래에서 env.addFilter 가능
// const env = nunjucks.configure(VIEWS_DIR, {
//   autoescape: true,
//   express: app,
//   watch: true
// });

// // 정적 리소스: /assets → views/assets
// app.use('/assets', express.static(path.join(VIEWS_DIR, 'assets')));

// // 템플릿 전역 로그인 유저
// app.use((req, res, next) => {
//   res.locals.me = req.session.user || null;
//   next();
// });

// // ---------------------------------------------------------------------
// // 3) nunjucks 커스텀 필터 (라우터 장착 전에 정의해도 OK)
// // ---------------------------------------------------------------------
// // 사용 예: {{ someDate | date('YYYY-MM-DD HH:mm') }}
// env.addFilter('date', function (value, fmt = 'YYYY-MM-DD HH:mm') {
//   if (!value) return '';

//   let d;
//   if (value instanceof Date) d = value;
//   else if (typeof value === 'string') {
//     const s = value.includes('T') ? value : value.replace(' ', 'T');
//     const t = Date.parse(s);
//     if (Number.isNaN(t)) return value; // 파싱 실패 시 원문 그대로
//     d = new Date(t);
//   } else if (typeof value === 'number') {
//     d = new Date(value); // timestamp(ms)
//   } else {
//     return '';
//   }

//   const pad = (n) => String(n).padStart(2, '0');
//   const YYYY = d.getFullYear();
//   const MM = pad(d.getMonth() + 1);
//   const DD = pad(d.getDate());
//   const HH = pad(d.getHours());
//   const mm = pad(d.getMinutes());
//   const ss = pad(d.getSeconds());

//   return fmt
//     .replace('YYYY', YYYY)
//     .replace('MM', MM)
//     .replace('DD', DD)
//     .replace('HH', HH)
//     .replace('mm', mm)
//     .replace('ss', ss);
// });

// // ---------------------------------------------------------------------
// // 4) 라우터
// app.use((req, _res, next) => {
//   console.log('[REQ]', req.method, req.url);
//   next();
// });
// // ---------------------------------------------------------------------
// app.use('/', require('./routers/public'));
// app.use('/', require('./routers/auth'));
// app.use('/admin', require('./routers/admin'));


// // 헬스체크
// app.get('/ping', (req, res) => res.send('pong'));

// // ---------------------------------------------------------------------
// // 5) 서버 시작
// // ---------------------------------------------------------------------
// // ⚠️ Windows에서 80포트는 관리자 권한 필요할 수 있음. 문제면 3000으로 바꾸세요.
// const PORT = process.env.PORT ? Number(process.env.PORT) : 80;
// const HOST = '0.0.0.0';

// app.listen(PORT, HOST, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });


// app.js (최종본)

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const axios = require('axios');
const app = express();

// ---------------------------------------------------------------------
// 1) 공통 미들웨어
// ---------------------------------------------------------------------
// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret', // //.env 권장
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
// // ★★★ 안정성을 위해 '두 단계 이전' 발표 자료를 사용하는 코드 ★★★
// app.use(async (req, res, next) => {
//     const cacheDuration = 30 * 60 * 1000;

//     if (req.session.weatherInfo && req.session.weatherTimestamp) {
//         const age = Date.now() - req.session.weatherTimestamp;
//         if (age < cacheDuration) {
//             res.locals.weatherInfo = req.session.weatherInfo;
//             return next();
//         }
//     }

//     try {
//         console.log("\n-----------------------------------------");
//         console.log("[🚀 API 호출 시작] 새로운 날씨 정보를 가져옵니다...");

//         const authKey = '94LfPg3YQdaC3z4N2JHWbA';
//         const daeguLionsPark = { nx: 89, ny: 90 };
        
//         // ★★★ 여기가 핵심: '두 단계 이전' 발표 시각을 사용하도록 로직 변경 ★★★
//         const getUltraStableForecastTime = () => {
//             const now = new Date();
//             const nextHourDate = new Date(now);
//             nextHourDate.setHours(now.getHours() + 1);

//             let dateForFcst = new Date(now);
//             const currentHour = now.getHours();
//             const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];
//             let latestTmfcHour;

//             for (let i = availableTimes.length - 1; i >= 0; i--) {
//                 if (currentHour >= availableTimes[i]) {
//                     latestTmfcHour = availableTimes[i];
//                     break;
//                 }
//             }
//             if (latestTmfcHour === undefined) {
//                  latestTmfcHour = 23;
//                  dateForFcst.setDate(dateForFcst.getDate() - 1);
//             }

//             // 안정성을 위해, 찾은 최신 발표 시각보다 '두 단계 이전' 시각을 사용
//             const latestTmfcIndex = availableTimes.indexOf(latestTmfcHour);
//             let ultraStableTmfcHour;

//             if (latestTmfcIndex > 1) {
//                 // 두 단계 이전 발표 시각이 있다면 그것을 사용 (예: 23시 -> 17시)
//                 ultraStableTmfcHour = availableTimes[latestTmfcIndex - 2];
//             } else {
//                 // 그럴 수 없다면, 어제의 마지막에서 세 번째 발표(17시)를 사용
//                 ultraStableTmfcHour = 17;
//                 dateForFcst.setDate(dateForFcst.getDate() - 1);
//             }
            
//             const year = dateForFcst.getFullYear();
//             const month = String(dateForFcst.getMonth() + 1).padStart(2, '0');
//             const day = String(dateForFcst.getDate()).padStart(2, '0');
            
//             return {
//                 tmfc: `${year}${month}${day}${String(ultraStableTmfcHour).padStart(2, '0')}`,
//                 tmef: `${nextHourDate.getFullYear()}${String(nextHourDate.getMonth() + 1).padStart(2, '0')}${String(nextHourDate.getDate()).padStart(2, '0')}${String(nextHourDate.getHours()).padStart(2, '0')}`
//             };
//         };

//         const { tmfc, tmef } = getUltraStableForecastTime();
//         console.log(`[로그 1] 계산된 API 요청 시간: tmfc=${tmfc}, tmef=${tmef}`);
        
//         // --- 이하 로직은 동일 ---
//         const vars = ['TMP', 'SKY', 'PTY', 'POP'];
//         const promises = vars.map(v => {
//             const url = `https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_shrt_grd?tmfc=${tmfc}&tmef=${tmef}&vars=${v}&nx=${daeguLionsPark.nx}&ny=${daeguLionsPark.ny}&authKey=${authKey}`;
//             return axios.get(url).then(response => response.data);
//         });

//         const results = await Promise.all(promises);

//         const temperatureRaw = results[0].split('\n')[4].split(',')[2].trim();
//         const skyCode = results[1].split('\n')[4].split(',')[2].trim();
//         const ptyCode = results[2].split('\n')[4].split(',')[2].trim();
//         const precipitationRaw = results[3].split('\n')[4].split(',')[2].trim();
//         console.log(`[로그 4] 파싱된 데이터: 기온=${temperatureRaw}, 하늘=${skyCode}, 강수=${ptyCode}, 확률=${precipitationRaw}`);

//         const temperature = parseFloat(temperatureRaw) < -90 ? "정보 없음" : `${temperatureRaw}℃`;
//         const precipitation = parseFloat(precipitationRaw) < -90 ? "정보 없음" : `${precipitationRaw}%`;
        
//         const getSkyState = (sky, pty) => {
//             const skyStr = String(parseInt(sky));
//             const ptyStr = String(parseInt(pty));
//             if (parseFloat(pty) < 0 || parseFloat(sky) < 0) return "정보 없음";
//             if (ptyStr !== '0') {
//                 if (ptyStr === '1') return '비'; if (ptyStr === '2') return '비/눈';
//                 if (ptyStr === '3') return '눈'; if (ptyStr === '4') return '소나기';
//             }
//             if (skyStr === '1') return '맑음'; if (skyStr === '3') return '구름많음';
//             if (skyStr === '4') return '흐림'; return '정보 없음';
//         };
//         const skyState = getSkyState(skyCode, ptyCode);
        
//         const nextHourForDisplay = new Date();
//         nextHourForDisplay.setHours(nextHourForDisplay.getHours() + 1);
//         const month = String(nextHourForDisplay.getMonth() + 1).padStart(2, '0');
//         const day = String(nextHourForDisplay.getDate()).padStart(2, '0');
//         const hours = String(nextHourForDisplay.getHours()).padStart(2, '0');

//         const weatherText = `대구 삼성 라이온즈 파크 ${month}월 ${day}일 ${hours}시 예보 : 기온 ${temperature}, 하늘 ${skyState}, 강수확률 ${precipitation}`;
//         console.log(`[✅ 최종 결과] 생성된 날씨 정보: ${weatherText}`);
        
//         req.session.weatherInfo = weatherText;
//         req.session.weatherTimestamp = Date.now();
//         res.locals.weatherInfo = weatherText;

//     } catch (error) {
//         console.error("날씨 정보 조회 실패:", error.message);
//         res.locals.weatherInfo = "날씨 정보를 불러올 수 없습니다.";
//     }
    
//     next();
// });
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
app.use('/', require('./routers/public'));   // // 사용자/공지 라우트
app.use('/', require('./routers/auth'));     // // 로그인/로그아웃 등(있다면)
app.use('/admin', require('./routers/admin'));// // 관리자(있다면)

// 헬스체크
app.get('/ping', (req, res) => res.send('pong'));

// ---------------------------------------------------------------------
// 5) 서버 시작
// ---------------------------------------------------------------------
// ⚠️ Windows에서 80포트는 관리자 권한 필요할 수 있어요. 문제면 PORT=3000 으로 실행.
const PORT = process.env.PORT ? Number(process.env.PORT) : 80;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
