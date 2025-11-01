// models/locationModel.js
const pool = require('../common/db');
const DB = process.env.SVR_DB_NAME || process.env.DB_NAME || 'myapp_db';

/**
 * POI 목록 조회
 * - columns 예시: poi_id, name, type, desc, lat, lng, image_url 등
 * - 선택 필터: type, q(이름/설명 키워드)
 */
exports.getPoiList = async ({ type, q } = {}) => {
  const where = [];
  const params = [];

  if (type) {
    where.push('type = ?');
    params.push(type);
  }
  if (q) {
    where.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const sql = `
    SELECT poi_id, name, type, description, lat, lng, image_url, created_at, updated_at
      FROM \`${DB}\`.poi
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY poi_id DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
};
