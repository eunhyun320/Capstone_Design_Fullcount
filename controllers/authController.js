const bcrypt = require('bcrypt');
const pool = require('../common/db');

exports.showLogin = (req, res) => {
  if (req.session?.user) return res.redirect('/admin');
  res.render('login/Login.html');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await pool.query(
    'SELECT admin_id, username, password, name FROM admin_users WHERE username=? LIMIT 1',
    [username]
  );
  if (!user) return res.send("<script>alert('계정 없음');history.back();</script>");
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.send("<script>alert('비밀번호 오류');history.back();</script>");
  
  // 세션 데이터: { pkid, user_id, name }
  req.session.user = { 
    pkid: user.admin_id, 
    user_id: user.username, 
    name: user.name 
  };
  
  // last_login 업데이트
  await pool.query(
    'UPDATE admin_users SET last_login = NOW() WHERE admin_id = ?',
    [user.admin_id]
  );
  
  const dest = req.session.returnTo || '/admin';
  delete req.session.returnTo;
  res.send(`<script>alert('로그인 성공');location.href='${dest}';</script>`);
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.clearCookie('admin_session');
    res.send("<script>alert('로그아웃');location.href='/';</script>");
  });
};
