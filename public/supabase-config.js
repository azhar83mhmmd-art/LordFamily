// ============================================
// FLASH PEAK COMMUNITY — SUPABASE CLIENT CONFIG
// Anon key ini AMAN dipakai di browser — hanya bisa SELECT
// (baca) tabel members lewat Row Level Security, tidak bisa
// INSERT/UPDATE/DELETE. Registrasi tetap lewat /api/register.
// ============================================

const SUPABASE_URL = 'https://gfcvpcuknvxgtfpncjdr.supabase.co;
const SUPABASE_ANON_KEY = 'sb_publishable_RWRZgTe2PfP7vJHG_gKPRw_t2WqtsYp';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
