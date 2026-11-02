/* script.js - logika bersama untuk semua halaman Pustaka Aksara */

/* ---------- utilitas ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const angka = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
const simpan = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const ambil = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
const pad = n => String(n).padStart(2, '0');
const stempel = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const tglID = s => new Date(String(s).replace(' ', 'T')).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
const jamID = s => String(s).slice(11, 16).replace(':', '.');
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/* sumber data: data.js + data tambahan yang disimpan di browser */
const semuaPengguna = () => dataPengguna.concat(ambil('penggunaBaru', []));
const katalog = () => dataKatalogBuku.concat(ambil('bukuBaru', []));
const semuaPesanan = () => Object.values(dataTracking).concat(ambil('pesananBaru', []));
const MISI = [{k:'katalog',t:'Kunjungi perbendaharaan buku (Katalog)'},{k:'tambah',t:'Tambahkan baris stok baru'},{k:'pesan',t:'Buat pesanan pertama'},{k:'lacak',t:'Lacak sebuah paket kiriman'}];
let sesi = null;
try { sesi = JSON.parse(sessionStorage.getItem('sesi')); } catch (e) {}

function toast(pesan, jenis = '') {
  let e = $('#toast');
  if (!e) { e = document.createElement('div'); e.id = 'toast'; e.setAttribute('role', 'status'); document.body.append(e); }
  e.textContent = pesan;
  e.className = 'show ' + jenis;
  clearTimeout(e.timer);
  e.timer = setTimeout(() => e.className = '', 3400);
}

/* validasi: daftar berisi pasangan [elemen, pesanGalat]; pesan kosong = valid */
function validasi(daftar) {
  let pertama = null;
  daftar.forEach(([el, msg]) => {
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const p = document.getElementById('err-' + el.id);
    if (p) p.textContent = msg || '';
    if (msg && !pertama) pertama = el;
  });
  if (pertama) pertama.focus();
  return !pertama;
}

const kunciMisi = () => 'misi' + (sesi ? sesi.id : 0);
function hud() {
  const mine = semuaPesanan().filter(o => o.nama === sesi.nama), m = ambil(kunciMisi(), {});
  const xp = mine.length * 60 + Object.keys(m).length * 25, lv = 1 + Math.floor(xp / 100);
  $('#avatar').textContent = sesi.nama[0].toUpperCase();
  $('#levelUser').textContent = `Lv. ${lv} ${sesi.role === 'Admin' ? 'Penguasa Guild' : 'Petualang'}`;
  $('#xpBar').style.width = (xp % 100) + '%';
  $('#koinUser').textContent = Math.round(mine.reduce((s, o) => s + angka(o.total), 0) / 1000).toLocaleString('id-ID');
}
function selesaiMisi(k) {
  const m = ambil(kunciMisi(), {}); if (m[k]) return;
  m[k] = 1; simpan(kunciMisi(), m);
  const x = MISI.find(i => i.k === k);
  setTimeout(() => toast(`Misi selesai: ${x.t} (+25 XP)`, 'misi'), 1300);
  hud();
}
const kelangkaan = b => { const h = angka(b.harga); return h >= 250000 ? ['legenda','Legendaris'] : h >= 220000 ? ['epik','Epik'] : h >= 200000 ? ['langka','Langka'] : h >= 180000 ? ['bagus','Bagus'] : ['biasa','Biasa']; };

function tambahKeranjang(kode) {
  const k = ambil('keranjang', []);
  const f = k.find(x => x.kode === kode);
  f ? f.qty++ : k.push({kode, qty: 1});
  simpan('keranjang', k);
}

/* ---------- LOGIN ---------- */
function initLogin() {
  if (sesi) { location.replace('dashboard.html'); return; }
  $('#formLogin').addEventListener('submit', e => {
    e.preventDefault();
    const em = $('#email').value.trim().toLowerCase(), pw = $('#password').value;
    const ok = validasi([[$('#email'), !em ? 'Email wajib diisi.' : !emailOk(em) ? 'Format email belum benar.' : ''], [$('#password'), !pw ? 'Password wajib diisi.' : '']]);
    if (!ok) return;
    const u = semuaPengguna().find(x => x.email.toLowerCase() === em && x.password === pw);
    if (!u) { alert('Email/password yang anda masukkan salah'); return; }
    sessionStorage.setItem('sesi', JSON.stringify({id: u.id, nama: u.nama, email: u.email, role: u.role}));
    location.href = 'dashboard.html';
  });

  $('#bukaLupa').onclick = () => $('#modalLupa').showModal();
  $('#bukaDaftar').onclick = () => $('#modalDaftar').showModal();
  $$('[data-tutup]').forEach(b => b.onclick = () => b.closest('dialog').close());

  $('#formLupa').addEventListener('submit', e => {
    e.preventDefault();
    const em = $('#lEmail').value.trim().toLowerCase();
    const ada = semuaPengguna().some(x => x.email.toLowerCase() === em);
    if (!validasi([[$('#lEmail'), !emailOk(em) ? 'Masukkan email yang valid.' : !ada ? 'Email ini belum terdaftar.' : '']])) return;
    $('#modalLupa').close();
    alert('Petunjuk pengaturan ulang password sudah dikirim ke ' + em);
  });

  $('#formDaftar').addEventListener('submit', e => {
    e.preventDefault();
    const nama = $('#dNama').value.trim(), em = $('#dEmail').value.trim().toLowerCase();
    const p1 = $('#dPass').value, p2 = $('#dPass2').value;
    const ok = validasi([
      [$('#dNama'), nama.length < 3 ? 'Nama minimal 3 karakter.' : ''],
      [$('#dEmail'), !emailOk(em) ? 'Masukkan email yang valid.' : semuaPengguna().some(x => x.email.toLowerCase() === em) ? 'Email sudah terdaftar, silakan login.' : ''],
      [$('#dPass'), p1.length < 6 ? 'Password minimal 6 karakter.' : ''],
      [$('#dPass2'), p1 !== p2 ? 'Ulangi password dengan isian yang sama.' : '']
    ]);
    if (!ok) return;
    const baru = ambil('penggunaBaru', []);
    baru.push({id: dataPengguna.length + baru.length + 1, nama, email: em, password: p1, role: 'User'});
    simpan('penggunaBaru', baru);
    e.target.reset();
    $('#modalDaftar').close();
    $('#email').value = em;
    toast('Akun dibuat. Silakan login dengan email tadi.');
  });
}

/* ---------- DASHBOARD ---------- */
function initDash() {
  const now = new Date(), jam = now.getHours();
  const waktu = jam < 11 ? 'pagi' : jam < 15 ? 'siang' : jam < 18 ? 'sore' : 'malam';
  $('#fase').textContent = {pagi: 'Fajar', siang: 'Tengah hari', sore: 'Senja', malam: 'Malam'}[waktu];
  $('#salam').textContent = `Selamat ${waktu}, Petualang ${sesi.nama.split(' ')[0]}`;
  $('#tanggal').textContent = now.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  const k = katalog(), p = semuaPesanan(), total = p.reduce((s, o) => s + angka(o.total), 0);
  $('#ringkas').textContent = `Perbendaharaan guild menyimpan ${k.reduce((s, b) => s + b.stok, 0).toLocaleString('id-ID')} eksemplar buku. Pilih lokasi tujuan Anda.`;
  $('#i1').textContent = `${k.length} judul tersimpan`;
  $('#i2').textContent = `${p.length} paket tercatat`;
  $('#i3').textContent = `Total ${rp(total)}`;
  $('#i4').textContent = `${p.length} transaksi`;
  const m = ambil(kunciMisi(), {}), n = MISI.filter(x => m[x.k]).length;
  $('#misiTeks').textContent = `${n} dari ${MISI.length} misi selesai. Tiap misi memberi 25 XP.`;
  $('#misiBar').style.width = (n / MISI.length * 100) + '%';
  $('#daftarMisi').innerHTML = MISI.map(x => `<li class="${m[x.k] ? 'selesai' : ''}"><span class="cek" aria-hidden="true">${m[x.k] ? '\u2714' : ''}</span><span>${esc(x.t)}</span><em>+25 XP</em></li>`).join('');
}

/* ---------- STOK ---------- */
function initStok() {
  const tb = $('#isiStok');
  const jumlahAwal = dataKatalogBuku.length;
  selesaiMisi('katalog');

  function buatBaris(b, idxBaru) {
    const tr = document.createElement('tr'), [rk, rn] = kelangkaan(b);
    tr.className = 'r-' + rk;
    const sampul = b.cover ? `<img src="${esc(b.cover)}" alt="Sampul ${esc(b.namaBarang)}">` : `<span class="sampul-kosong" aria-hidden="true">${esc(b.namaBarang[0].toUpperCase())}</span>`;
    const mt = b.stok < 200 ? 'm-low' : b.stok < 350 ? 'm-mid' : 'm-hi';
    tr.innerHTML = `<td>${sampul}</td><td>${esc(b.kodeBarang)}</td><td><strong>${esc(b.namaBarang)}</strong><span class="kelas">${rn}</span></td><td>${esc(b.jenisBarang)}</td><td>${esc(b.edisi)}</td>
      <td>${b.stok.toLocaleString('id-ID')} ${b.stok < 200 ? '<span class="lencana tipis">Menipis</span>' : ''}<div class="meter" aria-hidden="true"><i class="${mt}" style="width:${Math.min(100, b.stok / 6)}%"></i></div></td><td>${esc(b.harga)}</td>
      <td><button type="button" class="btn mini" data-pesan="${esc(b.kodeBarang)}">Pesan</button>
      ${idxBaru >= 0 ? `<button type="button" class="btn garis mini" data-hapus="${idxBaru}">Hapus</button>` : ''}</td>`;
    return tr;
  }
  function render() {
    tb.replaceChildren();
    const k = katalog();
    k.forEach((b, i) => tb.append(buatBaris(b, i >= jumlahAwal ? i - jumlahAwal : -1)));
    $('#ringkasStok').textContent = `${k.length} judul, ${k.reduce((s, b) => s + b.stok, 0).toLocaleString('id-ID')} eksemplar tersedia.`;
    $('#cari').dispatchEvent(new Event('input'));
  }

  $('#cari').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('tr', tb).forEach(tr => tr.hidden = !tr.textContent.toLowerCase().includes(q));
  });

  tb.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.pesan) {
      tambahKeranjang(t.dataset.pesan);
      toast('Ditambahkan ke pesanan: ' + katalog().find(b => b.kodeBarang === t.dataset.pesan).namaBarang);
    } else if (t.dataset.hapus !== undefined) {
      const a = ambil('bukuBaru', []); a.splice(+t.dataset.hapus, 1); simpan('bukuBaru', a);
      render(); toast('Baris stok dihapus.');
    }
  });

  $('#formStok').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements, kode = f.kode.value.trim().toUpperCase();
    const ok = validasi([
      [f.kode, !/^[A-Z]{4}\d{4}$/.test(kode) ? 'Kode terdiri dari 4 huruf dan 4 angka, contoh ASIP4301.' : katalog().some(b => b.kodeBarang === kode) ? 'Kode ini sudah dipakai buku lain.' : ''],
      [f.nama, f.nama.value.trim().length < 3 ? 'Judul minimal 3 karakter.' : ''],
      [f.jenis, ''],
      [f.edisi, !(+f.edisi.value >= 1) ? 'Edisi minimal 1.' : ''],
      [f.stok, f.stok.value === '' || +f.stok.value < 0 ? 'Isi stok dengan angka 0 atau lebih.' : ''],
      [f.harga, !(+f.harga.value >= 1000) ? 'Harga minimal Rp 1.000.' : '']
    ]);
    if (!ok) { toast('Data belum lengkap. Periksa isian yang bertanda merah.', 'err'); return; }
    const baru = ambil('bukuBaru', []);
    baru.push({kodeBarang: kode, namaBarang: f.nama.value.trim(), jenisBarang: f.jenis.value, edisi: String(f.edisi.value), stok: +f.stok.value, harga: rp(f.harga.value), cover: ''});
    simpan('bukuBaru', baru);
    tb.append(buatBaris(baru[baru.length - 1], baru.length - 1)); // tambah baris lewat DOM
    e.target.reset(); f.edisi.value = 1;
    render();
    toast('Baris stok baru ditambahkan.');
    selesaiMisi('tambah');
  });
  render();
}

/* ---------- CHECKOUT ---------- */
const ONGKIR = {'JNE': 15000, 'Pos Indonesia': 12000, 'J&T': 18000, 'SiCepat': 16000};

function initCheckout() {
  const tb = $('#isiKeranjang');
  $('#pilihBuku').innerHTML = katalog().map(b => `<option value="${esc(b.kodeBarang)}">${esc(b.namaBarang)} (${esc(b.harga)})</option>`).join('');
  if (sesi) { $('#pNama').value = sesi.nama; $('#pEmail').value = sesi.email || ''; }

  const keranjang = () => ambil('keranjang', []).filter(i => katalog().some(b => b.kodeBarang === i.kode));
  function hitung() {
    const sub = keranjang().reduce((s, i) => s + angka(katalog().find(b => b.kodeBarang === i.kode).harga) * i.qty, 0);
    const ong = sub ? (ONGKIR[$('#pEkspedisi').value] || 0) : 0;
    $('#vSub').textContent = rp(sub); $('#vOngkir').textContent = rp(ong); $('#vTotal').textContent = rp(sub + ong);
    return sub + ong;
  }
  function render() {
    const k = keranjang(), kat = katalog();
    tb.innerHTML = k.map((i, n) => {
      const b = kat.find(x => x.kodeBarang === i.kode);
      return `<tr><td>${esc(b.namaBarang)}<small>${esc(b.kodeBarang)}</small></td><td>${esc(b.harga)}</td>
      <td><input type="number" min="1" max="${b.stok}" value="${i.qty}" data-n="${n}" aria-label="Jumlah ${esc(b.namaBarang)}"></td>
      <td>${rp(angka(b.harga) * i.qty)}</td><td><button type="button" class="btn garis mini" data-hapus="${n}">Hapus</button></td></tr>`;
    }).join('') || '<tr><td colspan="5" class="kosong">Belum ada buku. Pilih dari daftar di bawah atau dari halaman Katalog.</td></tr>';
    hitung();
  }
  tb.addEventListener('change', e => {
    if (e.target.dataset.n === undefined) return;
    const k = keranjang(), i = k[+e.target.dataset.n], b = katalog().find(x => x.kodeBarang === i.kode);
    let q = parseInt(e.target.value, 10);
    if (!(q >= 1)) q = 1;
    if (q > b.stok) { q = b.stok; toast(`Stok ${b.namaBarang} hanya ${b.stok} eksemplar.`, 'err'); }
    i.qty = q; simpan('keranjang', k); render();
  });
  tb.addEventListener('click', e => {
    const t = e.target.closest('[data-hapus]'); if (!t) return;
    const k = keranjang(); k.splice(+t.dataset.hapus, 1); simpan('keranjang', k); render();
  });
  $('#tambahBuku').onclick = () => { tambahKeranjang($('#pilihBuku').value); render(); toast('Buku ditambahkan.'); };
  $('#pEkspedisi').addEventListener('change', hitung);

  $('#formPesan').addEventListener('submit', e => {
    e.preventDefault();
    const v = id => $('#' + id).value.trim();
    const ok = validasi([
      [$('#pNama'), v('pNama').length < 3 ? 'Nama minimal 3 karakter.' : ''],
      [$('#pEmail'), !emailOk(v('pEmail')) ? 'Masukkan email yang valid.' : ''],
      [$('#pTelp'), !/^0\d{9,12}$/.test(v('pTelp')) ? 'Nomor telepon diawali 0 dan terdiri dari 10 sampai 13 digit.' : ''],
      [$('#pAlamat'), v('pAlamat').length < 10 ? 'Alamat minimal 10 karakter agar kurir mudah menemukan.' : ''],
      [$('#pEkspedisi'), !v('pEkspedisi') ? 'Pilih ekspedisi.' : ''],
      [$('#pBayar'), !v('pBayar') ? 'Pilih metode pembayaran.' : '']
    ]);
    const k = keranjang();
    if (!k.length) { toast('Keranjang masih kosong. Tambahkan minimal satu buku.', 'err'); return; }
    if (!ok) { toast('Data belum lengkap. Periksa isian yang bertanda merah.', 'err'); return; }

    const now = new Date();
    let no; do { no = '2026' + (Math.floor(Math.random() * 9000) + 1000); } while (semuaPesanan().some(o => o.nomorDO === no));
    const total = hitung();
    const pesanan = {
      nomorDO: no, nama: v('pNama'), status: 'Diproses', ekspedisi: v('pEkspedisi'), tanggalKirim: stempel(now),
      paket: 'PKT' + no.slice(-4), total: rp(total), pembayaran: v('pBayar'), email: v('pEmail'), telepon: v('pTelp'), alamat: v('pAlamat'),
      items: k.map(i => ({kode: i.kode, qty: i.qty})),
      perjalanan: [{waktu: `${stempel(now)} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`, keterangan: 'Pesanan diterima. Pengirim: Universitas Terbuka'}]
    };
    const baru = ambil('pesananBaru', []); baru.push(pesanan); simpan('pesananBaru', baru);
    simpan('keranjang', []);
    selesaiMisi('pesan');
    $('#noDO').textContent = no; $('#totalSukses').textContent = rp(total);
    $('#linkLacak').href = 'tracking.html?do=' + no;
    $('#modalSukses').showModal();
    $('#pAlamat').value = ''; $('#pTelp').value = ''; $('#pEkspedisi').value = ''; $('#pBayar').value = '';
    render(); renderLaporan(); renderRiwayat();
  });
  $$('[data-tutup]').forEach(b => b.onclick = () => b.closest('dialog').close());

  function renderLaporan() {
    const p = semuaPesanan(), total = p.reduce((s, o) => s + angka(o.total), 0), per = {};
    p.forEach(o => per[o.ekspedisi] = (per[o.ekspedisi] || 0) + 1);
    const maks = Math.max(1, ...Object.values(per));
    $('#statPesanan').textContent = p.length;
    $('#statTotal').textContent = rp(total);
    $('#statRata').textContent = rp(Math.round(total / (p.length || 1)));
    $('#barEkspedisi').innerHTML = Object.entries(per).map(([n, j]) => `<li><span>${esc(n)}</span><div class="trek"><div class="bar" style="width:${j / maks * 100}%"></div></div><b>${j}</b></li>`).join('');
  }
  function renderRiwayat() {
    const p = semuaPesanan().sort((a, b) => (b.tanggalKirim + b.nomorDO).localeCompare(a.tanggalKirim + a.nomorDO));
    $('#isiRiwayat').innerHTML = p.map(o => `<tr><td>${esc(o.nomorDO)}</td><td>${tglID(o.tanggalKirim)}</td><td>${esc(o.nama)}</td><td>${esc(o.ekspedisi)}</td><td>${esc(o.total)}</td>
      <td><span class="lencana ${slug(o.status)}">${esc(o.status)}</span></td><td><a class="btn garis mini" href="tracking.html?do=${esc(o.nomorDO)}">Lacak</a></td></tr>`).join('');
  }
  function tampilTab() {
    const h = (location.hash || '#pesan').slice(1);
    const ada = ['pesan', 'laporan', 'riwayat'].includes(h) ? h : 'pesan';
    ['pesan', 'laporan', 'riwayat'].forEach(t => {
      $('#' + t).hidden = t !== ada;
      $(`.tab[href="#${t}"]`).classList.toggle('aktif', t === ada);
    });
  }
  window.addEventListener('hashchange', tampilTab);
  render(); renderLaporan(); renderRiwayat(); tampilTab();
}

/* ---------- TRACKING ---------- */
const slug = s => String(s).toLowerCase().replace(/\s+/g, '-');
const LANGKAH = ['Pesanan diterima', 'Tiba di hub', 'Dalam perjalanan', 'Selesai antar'];
function langkahKe(o) {
  const t = (o.perjalanan[o.perjalanan.length - 1] || {}).keterangan || '';
  return /^Selesai/i.test(t) ? 4 : /^(Diteruskan|Proses antar)/i.test(t) ? 3 : /^Tiba/i.test(t) ? 2 : 1;
}

function initTrack() {
  const inp = $('#nomorDO'), hasil = $('#hasil');
  function cari(no) {
    hasil.innerHTML = '';
    if (!no) { validasi([[inp, 'Masukkan nomor Delivery Order.']]); return; }
    const o = semuaPesanan().find(x => x.nomorDO === no);
    if (!o) { validasi([[inp, `Nomor DO ${no} tidak ditemukan. Periksa kembali atau coba 20230012.`]]); return; }
    validasi([[inp, '']]);
    selesaiMisi('lacak');
    const step = langkahKe(o);
    hasil.innerHTML = `<article class="panel" aria-labelledby="jHasil">
      <div class="hasil-kepala"><div><p class="ket">Nama pemesan</p><h2 id="jHasil">${esc(o.nama)}</h2></div><span class="lencana ${slug(o.status)}">${esc(o.status)}</span></div>
      <ol class="langkah" aria-label="Progres pengiriman">${LANGKAH.map((s, i) => `<li class="${i < step ? 'ok' : ''}${i === step - 1 ? ' now' : ''}">${s}</li>`).join('')}</ol>
      <dl class="detail">
        <div><dt>Ekspedisi</dt><dd>${esc(o.ekspedisi)}</dd></div>
        <div><dt>Tanggal kirim</dt><dd>${tglID(o.tanggalKirim)}</dd></div>
        <div><dt>Jenis paket</dt><dd>${esc(o.paket)}</dd></div>
        <div><dt>Total pembayaran</dt><dd>${esc(o.total)}</dd></div>
      </dl>
      <h3>Riwayat perjalanan</h3>
      <ul class="garis-waktu">${o.perjalanan.slice().reverse().map(p => `<li><time datetime="${esc(p.waktu.replace(' ', 'T'))}">${tglID(p.waktu)}, ${jamID(p.waktu)}</time>${esc(p.keterangan)}</li>`).join('')}</ul>
    </article>`;
  }
  $('#formTrack').addEventListener('submit', e => { e.preventDefault(); cari(inp.value.trim()); });
  $$('[data-contoh]').forEach(b => b.onclick = () => { inp.value = b.dataset.contoh; cari(b.dataset.contoh); });
  const q = new URLSearchParams(location.search).get('do');
  if (q) { inp.value = q; cari(q); }
}

/* ---------- penggerak halaman ---------- */
(function () {
  const h = document.body.dataset.page;
  if (h !== 'login') {
    if (!sesi) { location.replace('index.html'); return; }
    $('#namaUser').textContent = sesi.nama; hud();
    $('#keluar').onclick = () => { sessionStorage.removeItem('sesi'); location.href = 'index.html'; };
    $$('.atas nav a').forEach(a => { if (location.pathname.endsWith(a.getAttribute('href').split('#')[0])) a.setAttribute('aria-current', 'page'); });
  }
  ({login: initLogin, dashboard: initDash, stok: initStok, checkout: initCheckout, tracking: initTrack})[h]();
})();
