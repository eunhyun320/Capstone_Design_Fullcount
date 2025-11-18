/**
 * 로그인 체크 함수 - 어드민 페이지 요청마다 세션 검증
 * 세션 데이터: { pkid, user_id, name }
 */
function checkLogin(req, res, next) {
  // 세션이 존재하고 필수 데이터가 있는지 검증
  if (req.session?.user?.pkid && req.session?.user?.user_id && req.session?.user?.name) {
    return next();
  }
  
  // 로그인 실패 시 원래 요청 URL 저장
  req.session.returnTo = req.originalUrl;
  return res.send("<script>alert('관리자 전용입니다. 로그인하세요.');location.href='/login';</script>");
}

// 하위 호환성을 위한 alias
const requireLogin = checkLogin;

module.exports = { checkLogin, requireLogin };
