# Analisis Menyeluruh — Kala Nusantara: Bhayangkara Majapahit

**Tanggal analisis:** 18 Oktober 2026  
**Versi proyek:** 2.0.0 (implementasi v3)  
**Cakupan:** konsep, lore, karakter, tema, alur, sistem, kualitas kode, aset visual, audio, kesiapan rilis APK/web.

---

## 1. Ringkasan Eksekutif

Proyek ini punya **konsep yang jauh di atas rata-rata game edukasi lokal**: premis "Bayangan Lupa" yang memakan ingatan sejarah membuat materi pelajaran menjadi inti konflik, bukan tempelan. Alur Balai Belajar → Gerbang Waktu → Rapor juga matang secara desain instruksional. UI kit "Bata Trowulan" adalah identitas visual yang kuat dan layak dipertahankan.

Namun, implementasi saat ini masih berstatus **prototipe/vertical slice yang belum stabil**, bukan versi v3 yang digambarkan dokumen. Jarak terbesar ada di lima hal:

1. **Integritas asesmen rusak** — semua 20 soal punya jawaban benar di opsi A, sehingga kuis bisa ditamatkan tanpa membaca.
2. **Kohesi seni belum tercapai** — ada 4 bahasa visual berbeda dalam satu game (latar painterly, karakter chibi, ikon pixel 64px, UI bata SVG).
3. **Lore vs aset bentrok** — musuh "Bayangan Lupa" tampil seperti ninja, boss Kala tampil seperti oni bertongkat kanabo; bertentangan dengan naskah yang menyebut Kala sebagai penjaga dan musuh tanpa senjata.
4. **Gameplay belum terasa seperti game** — level 4200px bisa ditembus dengan berlari, musuh opsional, tidak ada game over, jeda tidak benar-benar menjeda, dan karakter belum punya animasi serang.
5. **Kesiapan APK belum aman** — Phaser dimuat dari CDN, jadi APK offline akan gagal total; font body justru file HTML rusak.

**Verdict:** fondasi ide dan struktur data bagus; yang perlu dilakukan bukan membuat ulang, melainkan **stabilisasi (P0) → penguatan game feel (P1) → skala konten (P2)**.

---

## 2. Identitas Game

| Aspek | Isi |
|---|---|
| Judul | Kala Nusantara: Bhayangkara Majapahit |
| Genre | 2D action-platformer brawler edukasi sejarah |
| Target | SMP kelas 7–8 (utama), SD kelas 5–6 lewat Mode Belajar |
| Platform | Web (Netlify) + Android APK (Capacitor) |
| Orientasi | Landscape |
| Stack | Phaser 3.80.1 (CDN), ES modules, Capacitor, WebAudio, Canvas 2D |
| Konten | 4 stage, 20 kartu materi, 20 soal, 12 artefak, 2 karakter, 3 senjata |
| Durasi stage | Target desain 8–12 menit; realisasi saat ini ±1–3 menit |
| Mata pelajaran | IPS SMP Fase D, IPAS SD Fase B/C (Kurikulum Merdeka) |

**Kekuatan identitas:** nama "Kala" bermain pada dua makna (waktu dan Kala penjaga candi), "Bhayangkara" tepat untuk pengawal elit, "Arka" (matahari) selaras dengan Surya Majapahit, "Laras" (harmoni) selaras dengan tema Bhinneka Tunggal Ika.

---

## 3. Konsep & Lore

### Yang sudah kuat
- **Bayangan Lupa** sebagai antagonis adalah metafora edukatif yang elegan: melawan lupa = belajar. Ini membuat kuis tidak terasa ditempel.
- **Gerbang Waktu** sebagai gerbang retrieval practice; secara desain bagus, walau implementasinya belum menjadi gerbang sungguhan.
- **Balai Belajar** dengan kartu lontar, satu fakta per kartu, kata kunci tebal, dan `cardRef` pada soal — struktur yang benar untuk pembelajaran.
- **Gobog** sebagai mata uang, **Surya Majapahit** sebagai lambang/ultimate, **kosod** sebagai mekanik bata, dan **Sumpah Palapa** sebagai ultimate adalah ide-ide yang sangat layak dikembangkan.
- **Museum 3 label** (Temuan Arkeologi / Rekonstruksi / Legenda) adalah keputusan kuratorial yang dewasa dan jarang ditemukan di game edukasi.

### Yang belum tergarap
- "Lupa" belum punya **manifestasi visual**: musuh tidak pecah menjadi aksara Kawi, tidak ada efek ingatan kembali ke HUD, tidak ada korban/desa yang kehilangan nama. Konfliknya masih di dialog, belum di layar.
- **Tidak ada arc/ending.** Setelah stage 4, pemain kembali ke beranda tanpa penyelesaian naratif, tanpa epilog, tanpa "Kala pulih".
- **Gajah Mada** hanya muncul sebagai potret dialog dan patung statis di ujung stage; belum menjadi mentor yang bermakna.
- **Kala** sebagai "penguji yang tercemar" belum tampil di layar; asetnya justru monster jahat.

---

## 4. Alur Permainan & Status Implementasi

Alur aktual:

```
Loading (bar + fakta) → Ketuk untuk Mulai → Intro 3 panel (sekali)
→ Setup Profil (nama/karakter/senjata) → Beranda (2 kartu)
→ Pemilih Stage → Balai Belajar (5 kartu lontar) → Gameplay
→ Gerbang Waktu (5 soal) → Hasil Stage → Beranda
```

| Fitur | Status | Catatan |
|---|---|---|
| Loading berkarakter + bar | Sebagian | Bar hanya memuat 8 JSON + 7 gambar; aset gameplay (8 MB latar, spritesheet, musuh) dimuat lagi tanpa progres |
| Intro netral + skip | Berfungsi | Video tidak ada; fallback 3 panel. Flag `introSeen` bekerja |
| Setup profil | Berfungsi | Nama/karakter/senjata tersimpan; belum ada pratinjau animasi |
| Beranda 2 kartu | Berfungsi | Tata letak 800×360 terukur pas; kartu lontar sedikit meluber 8px (masih aman) |
| Pemilih stage | Berfungsi | Berupa grid 4 kolom, bukan carousel horizontal besar seperti v3 |
| "Baca Materi Dulu" | Berfungsi | Stage terkunci/materi belum dibaca ditangani |
| Balai Belajar + X | Berfungsi | **Bug:** `card.bgImg` tidak ada; data memakai `bgPreview`, jadi latar ilustrasi selalu stage 1 |
| Cek Cepat pra-main | **Tidak ada** | Modal `#cek-cepat-modal` dan variabel `quickCheckQuestions` mati; handoff mengklaim ini ada |
| Gameplay 4 stage | Berfungsi | Semua stage memakai panjang 4200px dan layout platform yang sama |
| Mekanik stage 1–3 | Sebagian | Stage 1: trigger bata otomatis; Stage 2: platform jung bergerak; Stage 3: dua saklar. Banyak berupa kotak berwarna, belum aset |
| Boss Kala | Berfungsi | Fase perisai 50%, 3 pilar, 1 soal. Masih ada bug opsi & prompt |
| Gerbang Waktu | Berfungsi | 5 soal per stage; **semua jawaban benar di A**; tidak ada ambang lulus; bisa ditutup lewat klik luar/Esc |
| Hasil stage | Berfungsi | Bintang 1–3; tidak ada tombol Ulangi/Baca Materi/Lanjut |
| Museum | Berfungsi | Data default menyimpan ID artefak palsu → 0 terbuka walau counter 3/12 |
| Toko | Sebagian | Kostum hanya tint/filter warna; ID filter tidak cocok; tombol 38px |
| Rapor PNG | Berfungsi | Teks subtitle berisiko tumpang tindih; font canvas tidak terdaftar; saran memakai ID kartu lama; ada fakta 1336 M |
| Info Guru | Rusak | `tpSummary` dan `historiographyNote` tidak ada di JSON → tampil "undefined" |
| Setelan | Berfungsi | Audio/lompat di ↑/efek visual. Mute tidak tersimpan; "hemat" hanya mengurangi ambient |
| Jeda | **Rusak** | Tidak memanggil `scene.pause()`; game terus berjalan di balik modal |

---

## 5. Kurikulum & Asesmen

### Data
- 20 kartu, 5 per stage; semua punya `keyword`.
- 20 soal, 5 per stage; semua punya `cardRef` valid (bagus).
- Level kognitif: 13 `ingat`, 4 `pahami`, 3 `sebab-akibat`.
- Semua soal 4 opsi.

### Masalah kritis
1. **Semua `answer` = 0.** Pemain bisa menekan A terus dan mendapat 100%. Ini merusak seluruh nilai edukatif dan membuat boss selalu Pilar A.
2. **Opsi tidak diacak**, urutan soal tetap. Retrieval practice menjadi hafalan posisi.
3. **Distraktor sering tidak masuk akal** ("Kapal Selam", "Batu Bara dan Minyak", "Karpet dan Gandum"), sehingga soal mudah ditebak tanpa pengetahuan.
4. **Tidak ada ambang lulus.** Salah semua tetap "Stage Tuntas" dan membuka stage berikutnya. Gerbang Waktu secara tematik tidak berfungsi sebagai gerbang.
5. **Tidak ada umpan balik langsung** saat jawaban salah; penjelasan baru muncul di akhir. V2 menginginkan "Baca lagi kartu ini".
6. **Boss memakai 3 opsi pertama** dari 4 opsi. Jika jawaban benar ada di indeks 3, soal mustahil dijawab.
7. **Prompt boss ditampilkan di balon NPC** yang dipotong 2 baris dan hilang setelah 5,2 detik; pemain tidak bisa membaca ulang soal.
8. **Tidak ada penilaian waktu** dalam bintang meski Mode Tantangan menjanjikan timer.
9. **Info Guru undefined** karena ketidakcocokan skema JSON.
10. **Label "Temuan Arkeologi"** untuk Lontar Sutasoma/Negarakertagama kurang tepat; keduanya naskah/salinan, bukan temuan galian Trowulan.

### Fakta yang perlu dikoreksi
- `ReportGenerator.js` menulis **Sumpah Palapa 1336 M**; sumber kebenaran proyek menetapkan **1334 M**.
- Stage 2 art memakai **galleon Eropa**, bukan jung Majapahit.
- Stage 1 art mengandung **lentera batu Jepang (toro)**.
- Boss memegang **kanabo** (gada berduri khas oni Jepang), bertentangan dengan aturan "tanpa senjata".
- Gajah Mada digambarkan seperti raja bermahkota emas; masih bisa diterima sebagai interpretasi, tetapi perlu konsistensi.

---

## 6. Karakter

### Arka
- **Desain aktual:** chibi anime, ikat kepala merah bertepi emas, rompi merah, celana hitam, bertelanjang kaki, kepalan tangan bercahaya emas.
- **Kesan:** enerjik, mudah dibaca, cocok untuk anak. Namun lebih terbaca sebagai "anak kung fu" generik daripada Bhayangkara Majapahit.
- **Yang hilang:** lambang Surya Majapahit di dada, sabuk emas, kain/udheng yang jelas, pelindung lengan, siluet khas.
- **Kekuatan:** palet merah-emas dan kepalan surya adalah motif bagus; pertahankan.

### Laras
- **Desain aktual:** basis tubuh/pose yang sama dengan Arka, diganti rambut sanggul dan kain cokelat-oranye.
- **Kesan:** terasa seperti gender-swap, bukan karakter dengan siluet dan kostum sendiri.
- **Yang diminta v3:** kain wiru, ikat dada berlapis zirah ringan, selendang, rambut disanggul; belum terlihat.
- **Risiko:** pemain perempuan mendapat representasi yang kurang setara; ini bukan sekadar estetika, tetapi pesan inklusi.

### Gajah Mada (NPC)
- Bergaya semi-realistis, berkostum emas, memegang tongkat naga. Kualitasnya justru lebih dekat ke arah visual yang diminta v3 daripada karakter utama.
- Tetapi gayanya tidak sama dengan Arka/Laras (chibi), sehingga terlihat berasal dari game lain.
- Posisi di stage 4: x=3980, boss di x=3627 → hanya ±360px dari arena boss, melanggar permintaan "jauh ≥3 layar".

### Bayangan Lupa
- **Aset petarung:** ninja ungu dengan mata cyan, bukan makhluk asap/tinta dengan mata magenta.
- **Aset tombak:** wraith chibi lucu dengan tombak ungu; tidak dipakai di gameplay.
- **Masalah:** dua aset musuh punya gaya berbeda; tidak ada satu pun yang menyampaikan "ingatan yang dimakan".
- **Efek kematian** tidak ada; musuh langsung hilang, padahal efek pecah menjadi aksara Kawi adalah ciri khas yang dijanjikan v3.

### Kala Penjaga Candi
- **Aset aktual:** raksasa oranye-emas bergaya oni/yaksha, wajah mengerikan, memegang gada berduri, dengan tangan melayang berukir rune.
- **Masalah:** ini bukan "penjaga candi yang tercemar"; ini iblis Jepang. Kanabo dan rune memperparah ketidaksesuaian budaya.
- **Yang diminta:** kepala Kala sebagai motif penjaga, bukan iblis; tanpa senjata; bergerak aktif; fase kuis.
- **Kekuatan:** tekstur armor dan warna tanah cocok dengan latar stage 4; siluet besar terbaca sebagai boss.

---

## 7. Dunia & Level

### Empat stage
| Stage | Latar | Kekuatan | Masalah |
|---|---|---|---|
| 1 Gerbang Trowulan | Gapura bentar, beringin, kolam, gunung | Komposisi paling ikonik; warna pagi keemasan | Ada lentera batu Jepang; platform bata terpisah dari latar |
| 2 Dermaga Brantas | Dermaga kayu, jung, kuali, karung | Suasana pelabuhan hidup; detail dagang | Kapal bergaya galleon Eropa, bukan jung |
| 3 Candi Tikus | Petirtaan, teratai, pendopo, senja | Paling kaya detail; petirtaan terbaca | Lentera Bali; figur pertapa generik; platform tidak menyatu |
| 4 Pelataran Agung | Gapura Kala, obor, panji Surya, malam | **Terbaik**; atmosfer, motif, dan warna paling Majapahit | Kanabo boss; arena tidak dibedakan dari level biasa |

### Struktur level
- Semua stage **4200px** (target v3: 6000–9000px), tinggi 720, ground di y=668.
- Layout platform identik untuk semua stage; hanya tekstur dan mekanik kecil yang berubah.
- **Tidak ada parallax berlapis.** Latar satu PNG 1280×720 dijadikan `tileSprite` dengan `scrollFactor(0)` dan `tilePositionX`. Efeknya: pengulangan gambar setiap 1280px dan seam vertikal.
- **Tidak ada wall-jump, wall-slide, mantle, coyote time, jump buffer, atau variable jump height.**
- Tinggi lompat aktual: `480²/(2×1020) ≈ 113px` = 1,76 tile; target v3 2,5 tile. Double jump menambah ±82px.
- Platform di y=425 (top 406) dari ground 636 berjarak 230px; tidak terjangkau lompat tunggal. Sebagian platform hanya dekoratif.
- **Tidak ada gerbang tempur.** Pemain bisa berlari dari x=0 ke x=3930 melewati hampir semua musuh. Stage 1 dan 3 punya penghalang mekanik; stage 2 tidak wajib memakai platform jung.
- Checkpoint di x=2250 hanya menyembuhkan dan memberi +35% damage, tanpa kuis/NPC seperti desain v2.
- Gate akhir hanya berupa gambar NPC Gajah Mada + teks, bukan gapura/portal.
- Ambient (awan, burung, daun) digambar dengan ellipse/line, bukan sprite painterly; terasa seperti placeholder di atas latar indah.

---

## 8. Gaya Aset & UI

### Palet
- Terakota `#B4492F`, emas `#D8A444` / `#F2D27A`, kayu jati `#2A1A12`, lontar `#F2E3C2`, lumut `#4F6F3B`, petirtaan `#3B6E7E`, andesit `#4A433D`.
- Palet ini **kuat, hangat, dan tepat** untuk Majapahit. Pertahankan sebagai dasar style guide.

### Inventaris gaya (masalah utama)
Ada empat bahasa visual yang saling bertabrakan:

1. **Latar painterly semi-realistis** — indah, detail, cahaya dramatis. Ini aset terbaik proyek.
2. **Karakter chibi anime** — outline tebal, permukaan halus, proporsi kepala besar. Berbeda dari latar.
3. **Ikon & tile pixel art 64×64** — Surya, gobog, prasasti, bata. Jika diperbesar (VFX 96–260px) menjadi kabur/pixelated.
4. **UI DOM "Bata Trowulan"** — tekstur SVG prosedural, sudut bertangga, emas. Konsepnya bagus, tetapi teksturnya masih generik.

**Rekomendasi arah:** pilih **semi-realistis painterly dengan outline lembut** (sesuai v3), lalu:
- buat ulang karakter agar menyatu dengan latar (bukan chibi),
- buat ulang musuh dan boss sesuai lore,
- ganti ikon 64px dengan ikon painted 256–512px atau SVG bertekstur,
- pertahankan UI kit bata, tetapi ganti tekstur SVG dengan PNG bata/andesit/lontar/jati yang dihasilkan dari style yang sama.

### Tipografi
- `DisplayFont-Bold.ttf` valid, ternyata **Philosopher**, bukan Cinzel. CSS menamainya "Cinzel" — menyesatkan, tetapi tampilannya masih pantas.
- `BodyFont-Regular.ttf` dan `BodyFont-Bold.ttf` **bukan font**: keduanya file HTML (kemungkinan gagal unduh). Akibatnya font body selalu fallback ke system sans.
- Phaser memakai `fontFamily: 'NusantaraBody'` yang **tidak didefinisikan** di CSS mana pun → teks in-game memakai sans-serif default.
- `ReportGenerator` memakai `"KalaDisplay"` dan `"KalaBody"` yang juga tidak didefinisikan → rapor memakai Georgia/sans.
- **Satu sistem font saja** harus ditetapkan: display (Philosopher/Cinzel) + body (Nunito/Baloo) + nama yang sama untuk DOM, Phaser, dan canvas.

### UI/UX
- **Kekuatan:** komponen `.btn`, `.card-bata`, `.card-lontar`, `.chip`, `.dpad`, `.hud` konsisten; target sentuh 50–56px; safe-area diperhatikan; tidak ada emoji; ikon SVG konsisten.
- **Masalah:**
  - Tombol Ultimate menempati grid yang sama dengan Skill 2 (`grid-column:1; grid-row:1`) → tumpang tindih saat muncul.
  - Tidak ada indikator cooldown di tombol skill meski `cdRatios` sudah dikirim.
  - Balon NPC dan splash judul sama-sama di `top: 54–56px` → saling menimpa saat stage dimulai.
  - Teks NPC dipotong 2 baris, padahal intro stage 2–3 kalimat.
  - Tombol toko 38px dan chip "Ubah" kecil, di bawah target sentuh.
  - Close X kartu lontar di `top:-30px` berisiko terpotong di viewport 360px.
  - Tidak ada tombol "Lanjutkan" di menu jeda; pemain harus klik luar.
  - Modal wajib (Gerbang Waktu, Hasil) bisa ditutup dengan klik luar/Esc.

### Audio
- Sepenuhnya sintetis WebAudio (sine/triangle/sawtooth), tangga nada pentatonik.
- Belum ada sampel gamelan, kendang, gong, ambient air/burung.
- Loop BGM sederhana tiap 520ms; belum adaptif mengikuti kombo/fase boss.
- Haptic sudah ada; mute tidak tersimpan.
- Untuk rasa "premium", audio adalah gap terbesar setelah animasi.

---

## 9. Arsitektur & Kualitas Teknis

### Struktur
- `index.html` 496 baris berisi 10+ layar/modal.
- `src/main.js` 1.828 baris; `PlatformerScene.js` 1.727 baris; CSS 1.030 + 152 baris.
- Tidak ada framework/build tool; Phaser dari CDN.
- Tidak ada folder `android/`; APK dibuat lewat GitHub Actions.
- Tidak ada README, LICENSE, test, linter, atau service worker.
- **Bukan git repository** — tidak ada riwayat/rollback.

### Kekuatan teknis
- Pemisahan konten JSON (cards/questions/artifacts/stages/balance) cukup baik.
- `StorageAdapter` punya niat baik untuk web + Capacitor.
- `ReportGenerator` tanpa backend adalah ide bagus.
- Foot anchoring karakter sudah benar: body bottom sejajar telapak kaki (diverifikasi: body bottom 636, sprite feet 637,7).
- Performa dasar Phaser sehat: 8 musuh, partikel kecil, tidak ada memory leak besar dalam satu sesi.

### Risiko teknis
| Risiko | Dampak | Bukti |
|---|---|---|
| Phaser dari CDN | APK offline gagal total; layar loading statis | `index.html:10` |
| Font body file HTML | Font kustom tidak pernah tampil; 520KB terbuang | `file public/assets/fonts/*` |
| Default save berisi progres palsu | Pemain baru melihat 2 bintang, 3 artefak yang tidak ada di museum | `StorageAdapter.js:26–43` |
| Preferences tidak pernah dibaca | Save APK tidak benar-benar memakaiPreferences | `StorageAdapter.js:51–80` |
| Jeda tidak memanggil `scene.pause()` | Musuh menyerang saat pemain membaca menu/kartu | tidak ada `scene.pause` di repo |
| Semua jawaban A | Asesmen tidak valid; boss selalu Pilar A | `questions.json` |
| `bgPreview` vs `bgImg` | Latar kartu materi selalu stage 1 | `main.js:979–980` |
| `tpSummary`/`historiographyNote` tidak ada | Info Guru menampilkan "undefined" | `main.js:1718,1724` |
| ID kostum filter tidak cocok | Pratinjau kostum tidak berubah | `main.js:43–47` vs `balance.json` |
| Prompt boss di balon 2 baris | Soal tidak terbaca; hilang setelah 5,2 dtk | `main.js:1295,1349`; `style.css:868` |
| Double submit kuis | Soal bisa terlewat saat timer dan klik bersamaan | `main.js:1371–1405` |
| D-pad "lompat di ↑" | Memicu lompat berulang saat pointermove | `main.js:1068–1070` |
| Ultimate overlap | Skill 2 tertutup saat ult muncul | `index.html:352`; `style.css:787–803` |
| Gate/result bisa ditutup klik luar | Alur wajib bisa di-bypass | `main.js:442–451` |
| Gajah Mada dekat boss | Melanggar arah desain v3 | `PlatformerScene.js:692,3627` |
| Tidak ada game over | Mode Tantangan tidak menantang | `PlatformerScene.js:1418–1429` |
| Latar tunggal 1280px | Seam/pengulangan tiap layar; bukan parallax | `PlatformerScene.js:133–137` |
| Aset 11MB tanpa atlas/WebP | Waktu muat & memori HP menengah | `public/assets` |
| `" isBossStage"` (spasi) | Data kotor/tidak terpakai | `stages.json:68` |
| Rapor teks tanpa wrap | Subtitle stage tumpang tindih di PNG | `ReportGenerator.js:118–127` |
| Saran rapor ID lama | Saran spesifik tidak pernah muncul | `ReportGenerator.js:10–19` |
| 1336 M di rapor | Fakta sejarah salah | `ReportGenerator.js:17` |

### Performa
- 4 latar × 2MB = 8MB, dimuat sekaligus di `preload` setiap stage (walaupun hanya 1 dipakai). Ini pemborosan; seharusnya hanya latar stage aktif.
- Tidak ada texture atlas; banyak tekstur kecil.
- `localStorage` ditulis setiap koin/soal; di HP lambat bisa menyebabkan hitch.
- Ambient menggambar ulang `Graphics` setiap frame; masih wajar.
- Canvas Phaser FIT 1280×720 pada layar 800×360 menghasilkan letterbox ~80px kiri-kanan; kontrol DOM menutupi area letterbox. Dapat diterima, tetapi bisa dibuat lebih imersif.

---

## 10. Kesesuaian dengan Dokumen v2/v3

| Permintaan v2/v3 | Status |
|---|---|
| Alur materi → cek cepat → main → gerbang → rapor | **Sebagian**; Cek Cepat tidak ada |
| 2 karakter, 3 senjata | **Ada**, tetapi Laras belum didesain ulang |
| Animasi lengkap (idle, walk, run, jump, land, attack, hurt, dash, wall) | **Tidak**; hanya 8 pose mirip |
| D-pad 4 arah, deteksi 8 arah | **Ada** |
| Wall-jump, mantle, menara bata tinggi | **Tidak ada** |
| Level 8–10 layar, parallax 4 lapis, ambient | **Tidak**; 4200px, 1 lapis |
| Latar berbeda tiap stage | **Ada** (tapi stage 2 anachronistic) |
| Musuh bertinju dengan telegraf 0,35–0,5 dtk | **Tidak**; serangan nyaris instan |
| Musuh pecah jadi aksara Kawi | **Tidak ada** |
| Boss bergerak, fase kuis pilar | **Ada**, tetapi prompt buruk & jawaban selalu A |
| Kala sebagai penjaga, bukan iblis | **Tidak**; aset oni |
| Gajah Mada jauh dari arena boss | **Tidak** |
| Toko kostum (bukan filter warna) | **Belum**; hanya tint/filter |
| Video intro netral | **Tidak ada**; fallback panel |
| Laporan PNG | **Ada**, perlu diperbaiki |
| CP Kurikulum Merdeka | **Ada**, tetapi tampil undefined |
| Data-driven penuh | **Sebagian**; level layout masih hardcoded |
| APK landscape penuh | **Belum**; manifest belum dikunci |

---

## 11. Rekomendasi Prioritas

### P0 — Stabilisasi & integritas (1–2 hari)
Tujuan: game tidak rusak, tidak bisa dicurangi, dan bisa dibuka offline.

1. **Bundle Phaser lokal** (`public/vendor/phaser.min.js`) dan hapus CDN; tambahkan fallback/error state.
2. **Perbaiki font**: unduh ulang BodyFont (Nunito/Baloo) yang valid; daftarkan `NusantaraBody` untuk Phaser; samakan nama font di CSS, Phaser, dan canvas.
3. **Reset/default save bersih**: hapus progres palsu, ID artefak lama, `q_s1_1`/`c_s1_1`; migrasi save lama dengan aman.
4. **Acak soal & opsi**; pastikan indeks jawaban tersebar; guard double-submit; batasi 3 opsi pilar boss yang selalu memuat jawaban benar.
5. **Perbaiki jeda**: `scene.pause()`/`resume()`, hentikan timer, tambah tombol "Lanjutkan"; larang klik luar/Esc pada modal wajib.
6. **Perbaiki `bgPreview`**, CP keys (`mappingSummary`, tambahkan `historiographyNote`), ID kostum, museum copy, dan bug UI (ultimate overlap, splash vs balon, D-pad jump repeat, shop 38px).
7. **Perbaiki rapor**: wrap teks, font canvas, ID saran, 1336 → 1334, sertakan waktu & topik <60%.
8. **Android**: `sensorLandscape` di manifest, back button, safe areas, orientasi.
9. **Dokumentasi**: README, salin v2/v3 ke `docs/`, update `AGENT_HANDOFF.md` agar tidak mengklaim fitur yang tidak ada; inisialisasi git.

### P1 — Game feel & seni (1–2 minggu)
1. **Pipeline animasi karakter**: minimal 40 frame Arka + keris (idle 6, walk 8, jump prep/rise/fall, land, crouch, hurt, 3 tebasan); frame 256×256, garis kaki y=232, origin tengah-bawah; satu style bible.
2. **Ulangi Laras** dengan siluet/kostum berbeda, bukan gender-swap.
3. **Musuh & boss redesign**: Bayangan Lupa = asap/tinta, mata magenta, tanpa senjata, pecah jadi aksara Kawi; Kala = topeng penjaga, tanpa kanabo.
4. **Combat**: telegraf 0,35–0,5 dtk, hurt/i-frames, hitstop 60–80ms, knockback, game over/retry di Mode Tantangan, checkpoint di titik aman terakhir.
5. **Level design**: 6000–9000px, 64px grid, wall-jump/mantle, coyote/buffer/variable jump, gerbang tempur wajib, menara bata, reward di puncak.
6. **Parallax 4 lapis** per stage, tile seamless, prop khas, platform menyatu dengan latar.
7. **NPC**: potret terpisah untuk nakhoda, pujangga, Hayam Wuruk; Gajah Mada jauh dari boss; dialog tidak terpotong.
8. **Audio**: sampel gamelan, lapisan adaptif, ambient, volume, mute tersimpan.
9. **HUD**: cooldown radial, ultimate terkunci per stage, buff checkpoint, hasil stage dengan Ulangi/Baca Materi/Lanjut.
10. **Ending stage 4**: Kala pulih, epilog, rapor akhir.

### P2 — Skala & ekosistem (1–2 bulan)
1. Stage/era baru (Sriwijaya, Mataram, Demak) dengan kerangka yang sama.
2. Variasi soal (benar/salah, menjodohkan, urutan, jawaban singkat), bank soal per level kognitif, spaced repetition.
3. Mode Kelas/guru: kode kelas, ekspor CSV/PNG, dashboard topik lemah.
4. Aksesibilitas: ukuran teks, mode buta warna, kurangi gerak, kontrol alternatif.
5. Lokalisasi ID/EN.
6. Analitik lokal (tanpa backend) untuk guru.
7. Polish rilis: ikon APK, splash, trailer, halaman toko, lisensi aset/font.

---

## 12. Peluang Pengembangan Jangka Panjang

- **Serial "Kala Nusantara"**: setiap era punya musuh "lupa" yang berbeda (Sriwijaya = kabut laut, Mataram = abu gunung, Demak = pasir pantai). Kerangka data, UI, dan rapor bisa dipakai ulang.
- **Museum hidup**: artefak yang dikumpulkan membuka diorama 3D/2.5D dan audio curator.
- **Mode guru**: susun "jalur belajar" dari kartu, pantau akurasi per CP, cetak rapor kelas.
- **Kolaborasi sekolah**: kontes desain kartu materi oleh siswa, dengan verifikasi guru.
- **Ekspansi budaya**: batik, gamelan, kuliner, arsitektur sebagai konten yang bisa diuji.
- **Merch/edukasi**: lontar rapor sebagai sertifikat, kartu fisik, poster Surya.

---

## 13. Catatan untuk Agent Berikutnya

**Jangan menulis ulang seluruh proyek.** Lakukan perubahan terarah dan uji di 800×360.

**Sumber kebenaran konten:**
- Fakta: `docs/CHRONO_JUMP_MAJAPAHIT_v2_REVISI.md` (salin dari Downloads) — 1293, 1334, 1350–1389, 1365, kosod, Kala penjaga, tanpa batik parang.
- UI/karakter/dunia: `docs/KALA_NUSANTARA_v3_REVISI_UI_KARAKTER_DUNIA.md`.
- Data: `src/data/*.json`; parameter: `src/config/balance.json`.

**Aturan:**
- Jangan hardcode materi/soal di scene; gunakan JSON.
- Setiap soal wajib `cardRef` valid.
- Jangan menambah fakta sejarah dari ingatan; verifikasi ke dokumen/guru.
- Jangan memakai emoji; ikuti `bata-ui.css`.
- Jangan mengganti gaya seni per aset; buat style bible dan patuhi.
- Uji dengan `npm start` di `http://localhost:8090`.

**Quick wins berikutnya (kalau waktu terbatas):** bundle Phaser, reset save, acak jawaban, pause, perbaiki CP/rapor, ganti font body. Enam hal ini langsung menaikkan kualitas build secara signifikan.

---

## Lampiran A — Inventaris File Utama

```
index.html                         496 baris, 10+ layar/modal
public/css/style.css              1.030 baris layout
src/ui/bata-ui.css                  152 baris UI kit
src/main.js                       1.828 baris orkestrasi
src/scenes/PlatformerScene.js     1.727 baris gameplay
src/systems/StorageAdapter.js      234 baris save
src/systems/AudioSystem.js         129 baris audio sintetis
src/systems/ReportGenerator.js     167 baris rapor PNG
src/data/cards.json                 20 kartu
src/data/questions.json             20 soal
src/data/artifacts.json             12 artefak
src/data/stages.json                4 stage
src/data/characters.json            2 karakter
src/data/weapons.json               3 senjata
src/data/curriculum_cp.json         pemetaan CP
src/config/balance.json             parameter gameplay
public/assets/                      11 MB (8 MB latar)
```

## Lampiran B — Hasil Uji Data

- `cards`: 20; `questions`: 20; `artifacts`: 12; `stages`: 4.
- `bad cardRef`: 0.
- Distribusi jawaban: `{0: 20}` — **semua A**.
- Jumlah opsi: semua 4.
- Level: 13 ingat, 4 pahami, 3 sebab-akibat.
- Artefak per stage: 3/3/3/3.
- Kartu per stage: 5/5/5/5.
- `stages.json` stage 4 memiliki key `" isBossStage"` (spasi di depan) yang tidak dipakai.
