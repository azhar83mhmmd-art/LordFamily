// ============================================
// FLASH PEAK COMMUNITY — GET /api/members
// Baca daftar member (dipakai fallback awal / landing stat).
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('joined_at', { ascending: true });

  if (error) {
    res.status(500).json({ error: 'Gagal memuat data' });
    return;
  }

  res.status(200).json(
    data.map((row) => ({
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
    }))
  );
};
