// ============================================
// FLASH PEAK COMMUNITY — /api/register (Vercel Function)
// Insert dilakukan di server pakai SERVICE ROLE key,
// supaya validasi & uniqueness tetap terjaga (browser tidak
// diizinkan insert langsung — lihat sql/schema.sql).
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const POSITIONS = ['ST', 'CM', 'WF', 'CB'];

function nextMemberId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return 'FP-' + code;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, errors: { _: 'Method not allowed' } });
    return;
  }

  const payload = req.body || {};
  const nama = (payload.nama || '').trim();
  const usia = parseInt(payload.usia, 10);
  const gameId = (payload.gameId || '').trim();
  const username = (payload.username || '').trim();
  const alasan = (payload.alasan || '').trim();
  const avatar = (payload.avatar || 'avatar1.svg').trim();
  const posisi = (payload.posisi || '').trim().toUpperCase();

  const errors = {};
  if (!nama || nama.length < 3) errors.nama = 'Nama minimal 3 karakter';
  if (!usia || usia < 10 || usia > 80) errors.usia = 'Usia tidak valid';
  if (!gameId) errors.gameId = 'ID Game wajib diisi';
  if (!username || username.length < 3) errors.username = 'Username minimal 3 karakter';
  if (!alasan || alasan.length < 10) errors.alasan = 'Ceritakan alasanmu (min. 10 karakter)';
  if (!POSITIONS.includes(posisi)) errors.posisi = 'Pilih posisi (ST, CM, WF, atau CB)';

  if (Object.keys(errors).length === 0) {
    // Cek uniqueness lewat query (index unique di DB tetap jadi pengaman terakhir)
    const { data: existing, error: checkErr } = await supabase
      .from('members')
      .select('username, game_id')
      .or(`username.ilike.${username},game_id.ilike.${gameId}`);

    if (checkErr) {
      res.status(500).json({ ok: false, errors: { _: 'Gagal memeriksa data, coba lagi.' } });
      return;
    }
    if (existing?.some((m) => m.username.toLowerCase() === username.toLowerCase())) {
      errors.username = 'Username sudah dipakai lord lain';
    }
    if (existing?.some((m) => m.game_id.toLowerCase() === gameId.toLowerCase())) {
      errors.gameId = 'ID Game sudah terdaftar';
    }
  }

  if (Object.keys(errors).length > 0) {
    res.status(200).json({ ok: false, errors });
    return;
  }

  // Retry sekali kalau memberId bentrok (sangat jarang, tapi jaga-jaga)
  for (let attempt = 0; attempt < 3; attempt++) {
    const memberId = nextMemberId();
    const { data, error } = await supabase
      .from('members')
      .insert({
        member_id: memberId,
        nama,
        usia,
        game_id: gameId,
        username,
        alasan,
        avatar,
        posisi,
        status: 'succeed',
      })
      .select()
      .single();

    if (!error) {
      res.status(200).json({ ok: true, member: toClientShape(data) });
      return;
    }

    // 23505 = unique_violation di Postgres
    if (error.code === '23505' && attempt < 2) continue;

    res.status(200).json({ ok: false, errors: { _: 'Gagal menyimpan, coba lagi.' } });
    return;
  }
};

function toClientShape(row) {
  return {
    memberId: row.member_id,
    nama: row.nama,
    usia: row.usia,
    gameId: row.game_id,
    username: row.username,
    alasan: row.alasan,
    avatar: row.avatar,
    posisi: row.posisi,
    status: row.status,
    joinedAt: row.joined_at,
  };
}
