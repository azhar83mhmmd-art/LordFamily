// ============================================
// FLASH PEAK COMMUNITY — REGISTRATION SERVER
// Express + Socket.IO (real-time join feed)
// ============================================

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory member store (swap for a real DB in production) ──
let members = [];
const usedIds = new Set();
const POSITIONS = ['ST', 'CM', 'WF', 'CB'];

// Non-sequential unique member ID, e.g. FP-7K2Q9X
function nextMemberId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id;
  do {
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    id = 'FP-' + code;
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

function isTaken(field, value) {
  const v = String(value).trim().toLowerCase();
  return members.some((m) => String(m[field]).trim().toLowerCase() === v);
}

io.on('connection', (socket) => {
  // Send current roster + live count to whoever just connected
  socket.emit('members:sync', members);
  io.emit('viewers:count', io.engine.clientsCount);

  socket.on('member:register', (payload, ack) => {
    const nama = (payload?.nama || '').trim();
    const usia = parseInt(payload?.usia, 10);
    const gameId = (payload?.gameId || '').trim();
    const username = (payload?.username || '').trim();
    const alasan = (payload?.alasan || '').trim();
    const avatar = (payload?.avatar || 'avatar1.svg').trim();
    const posisi = (payload?.posisi || '').trim().toUpperCase();

    const errors = {};
    if (!nama || nama.length < 3) errors.nama = 'Nama minimal 3 karakter';
    if (!usia || usia < 10 || usia > 80) errors.usia = 'Usia tidak valid';
    if (!gameId) errors.gameId = 'ID Game wajib diisi';
    if (!username || username.length < 3) errors.username = 'Username minimal 3 karakter';
    if (!alasan || alasan.length < 10) errors.alasan = 'Ceritakan alasanmu (min. 10 karakter)';
    if (!POSITIONS.includes(posisi)) errors.posisi = 'Pilih posisi (ST, CM, WF, atau CB)';

    if (!errors.username && isTaken('username', username)) errors.username = 'Username sudah dipakai lord lain';
    if (!errors.gameId && isTaken('gameId', gameId)) errors.gameId = 'ID Game sudah terdaftar';

    if (Object.keys(errors).length > 0) {
      if (typeof ack === 'function') ack({ ok: false, errors });
      return;
    }

    const member = {
      memberId: nextMemberId(),
      nama,
      usia,
      gameId,
      username,
      alasan,
      avatar,
      posisi,
      status: 'succeed',
      joinedAt: new Date().toISOString(),
    };

    members.push(member);

    // Broadcast to EVERY connected client (registrant + all viewers)
    io.emit('member:notification', {
      nama: member.nama,
      usia: member.usia,
      status: member.status,
    });
    io.emit('members:sync', members);

    if (typeof ack === 'function') ack({ ok: true, member });
  });

  socket.on('disconnect', () => {
    io.emit('viewers:count', io.engine.clientsCount);
  });
});

app.get('/api/members', (req, res) => {
  res.json(members);
});

server.listen(PORT, () => {
  console.log('Flash Peak Community server running → http://localhost:' + PORT);
});
