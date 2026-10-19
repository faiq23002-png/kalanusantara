# Chrono Jump: Nusantara — Bhayangkara Majapahit
## Game Design Document v2 (Revisi, Siap Dikerjakan Agent)

**Genre:** 2D action-platformer brawler edukasi sejarah
**Platform:** Android (APK via Capacitor) + Web (Netlify)
**Target pemain:** **SMP kelas 7-8 (±12-14 th)**; SD kelas 5-6 tetap bisa lewat **Mode Belajar**
**Materi:** Majapahit level **dasar–menengah** (pengenalan, bukan analisis mendalam)
**Stack:** Phaser 3 + Vite + Capacitor (versi paket dicek saat implementasi)

> **Aturan kerja untuk agent:** kerjakan bertahap sesuai Roadmap (bagian 12). Saat iterasi, lakukan **perubahan terarah (targeted)**, jangan menulis ulang file besar tanpa alasan. Pisahkan konten dari kode (bagian 9). Isi materi di bagian 5 adalah **sumber kebenaran** untuk kartu belajar dan soal; jangan menambah fakta sejarah baru dari ingatan sendiri.

---

## 1. Perubahan Utama dari Versi 1

| Area | Versi 1 | Versi 2 |
|---|---|---|
| Alur | Main → kuis di gerbang | **Balai Belajar (materi) → Cek Cepat → Main → Gerbang/Boss → Rapor** |
| Target | Tidak ditentukan | SMP 7-8, materi dasar–menengah |
| Fakta | Ada beberapa keliru/diperdebatkan | Sudah dikoreksi (bagian 4) |
| Musuh | "Prajurit bayangan" generik | **Bayangan Lupa** (makhluk bayangan, bukan manusia/tokoh nyata) |
| Boss | Batara Kala sebagai monster jahat | **Kala Penjaga Candi** (penguji, tercemar Bayangan Lupa) |
| Kontrol | Dash via ketuk 2x | **Tombol Dash khusus**; skill dibuka bertahap |
| Aksesibilitas | Semua pemain harus bertarung | **Mode Belajar** (anti-gagal) + **Mode Tantangan** |
| Scope | 4 stage sekaligus | **Vertical slice Stage 1 dulu** |
| Audio | Howler.js | **Audio bawaan Phaser** |
| Konten | Tertanam di kode | **JSON data-driven** |

---

## 2. Premis & Lore ("Chrono Jump")

- Arka adalah siswa masa kini yang menyentuh **Medali Surya** di Museum Trowulan, lalu terlempar ke masa Majapahit dan dilatih sebagai **Bhayangkara** (pengawal kerajaan).
- Musuh adalah **Bayangan Lupa**: makhluk bayangan yang "memakan ingatan" tentang sejarah. Setiap fakta yang dipelajari melemahkan mereka. Ini membuat edukasi menjadi inti konflik, bukan tempelan.
- Setiap stage berakhir dengan **Gerbang Waktu** yang hanya terbuka jika Arka "mengingat" (menjawab) materi stage itu.
- Judul bisa diperluas ke era lain (Sriwijaya, Mataram, Demak) dengan kerangka yang sama.
- Tokoh sejarah (Gajah Mada, Hayam Wuruk, Prapanca, Tantular) muncul sebagai **pembimbing dalam perjalanan waktu**, bukan rangkaian peristiwa linear. Ini menjelaskan mengapa mereka bisa bertemu dalam satu cerita.

---

## 3. Alur Permainan (Core Loop)

```
Menu Utama
  └─ Pilih Stage
       ├─ 1. BALAI BELAJAR  (4-5 kartu geser, ±2-3 menit)
       ├─ 2. CEK CEPAT       (2 soal ringan, hanya umpan balik, bukan gerbang keras)
       ├─ 3. GAMEPLAY STAGE  (platform + tarung + artefak + blok prasasti)
       ├─ 4. GERBANG WAKTU / BOSS (soal dari materi stage)
       └─ 5. HASIL STAGE     (bintang 1-3, artefak, ringkasan jawaban salah)
Menu Museum  (kartu & artefak yang sudah dibuka, bisa dibaca ulang)
Rapor Pendekar (akurasi per stage, artefak, waktu, anjuran ulang)
```

**Aturan Balai Belajar:**
- Muncul otomatis pada kunjungan pertama ke stage; bisa dilewati pada percobaan berikutnya, tetapi tetap bisa dibuka dari Museum.
- 1 kartu = 1 fakta (maks. 2 kalimat) + 1 ilustrasi + 1 **kata kunci tebal**.
- Cek Cepat salah → tampilkan kartu terkait ("Baca lagi kartu ini"), tidak memblokir pemain.
- **Konten kartu harus identik dengan yang diuji.** Soal tidak boleh menguji hal yang tidak ada di kartu.

**Durasi sasaran:** 1 stage ≈ 8-12 menit total (muat dalam 1 jam pelajaran sebagai aktivitas kelas).

---

## 4. Koreksi Fakta (Wajib Dipatuhi)

| Topik | Tulis | Catatan |
|---|---|---|
| Berdirinya Majapahit | **1293 M**, Raden Wijaya | Setelah pasukan Mongol meninggalkan Jawa |
| Pengangkatan Gajah Mada | **1334 M** (Patih Amangkubhumi), bukan 1336 | Tahun menurut tradisi Pararaton |
| Masa Hayam Wuruk | **1350–1389 M**, gelar Rajasanagara | |
| Negarakertagama | **Mpu Prapanca, 1365 M** | |
| Bata merah | Teknik **gosok-rekat (kosod)** tanpa semen modern | Jangan tulis "gula merah" sebagai fakta; kalau dipakai, beri label "diduga" |
| Artefak | Pisahkan **Artefak Nyata** vs **Pusaka Legenda** | Keris Nagasasra, Mahkota Emas, Segel Sumpah Palapa = legenda/ilustrasi, bukan temuan arkeologi |
| Batara Kala | Dewa/penjaga; jangan digambarkan sebagai "iblis jahat" | Wajah Kala memang motif penjaga di atas pintu candi |
| Dwarapala | Jangan jadikan ikon Majapahit utama | Paling terkenal dari Singhasari; pakai relief Kala/gapura untuk Stage 4 |
| Cakupan Sumpah Palapa | Wilayah dalam daftar = **klaim/pengaruh**, bukan selalu kekuasaan langsung | Cukup disebut di kartu reflektif (Stage 4) |

**Ditunda ke versi lanjutan (jangan dimasukkan di MVP):** Ra Kuti (1319), tiga lingkar kekuasaan, dua Dharmadhyaksa, Mpu Nala sebagai soal, *Mitreka Satata* sebagai soal, Perang Bubat (sensitif dan sumbernya diperdebatkan; jika kelak dipakai, hanya sebagai adegan naratif tanpa pertarungan).

**Penghalusan visual:** jangan pakai motif batik parang untuk Majapahit. Gunakan Surya Majapahit (8 arah), teratai, sulur, dan kepala Kala.

> Sebelum rilis, minta guru/ahli sejarah memverifikasi isi materi dengan buku teks resmi jenjang SMP.

---

## 5. Materi per Stage (Sumber Kebenaran Kartu & Soal)

### Stage 1 — Gerbang Trowulan (Berdirinya Majapahit)
**Lingkungan:** gapura Wringin Lawang (candi bentar bata merah), pohon beringin, kolam Segaran.

**Kartu Belajar**
1. **Raden Wijaya** mendirikan kerajaan **Majapahit** pada tahun **1293 M**.
2. Menurut tradisi, nama Majapahit berasal dari **pohon maja** yang buahnya **pahit**.
3. **Ibu kota** Majapahit berada di **Trowulan**, Mojokerto, Jawa Timur.
4. Bangunan Majapahit banyak memakai **bata merah** yang digosok dan direkatkan tanpa semen modern. Contoh: **Gapura Wringin Lawang**.
5. Majapahit memakai uang logam berlubang bernama **gobog** dan meninggalkan **celengan terakota** di Trowulan.

**Soal (5)** — tahun berdiri (1293), pendiri (Raden Wijaya), ibu kota (Trowulan), bahan bangunan khas (bata merah), nama uang logam (gobog).

**Artefak (Nyata):** Koin Gobog, Celengan Terakota, Relief Surya Majapahit.

### Stage 2 — Dermaga Brantas (Maritim & Perdagangan)
**Lingkungan:** dermaga kayu Sungai Brantas, kapal jung raksasa di atas air.

**Kartu Belajar**
1. Majapahit adalah kerajaan **agraris** (padi) sekaligus **maritim** (laut).
2. **Sungai Brantas** menjadi jalur dagang dari pedalaman ke laut.
3. **Kapal jung** adalah kapal besar untuk berdagang dan berperang.
4. Barang dagangan penting: **beras** dan **rempah-rempah**.
5. Majapahit menjalin hubungan baik dengan negeri tetangga (bonus: disebut *Mitreka Satata*, tidak diujikan).

**Soal (5)** — jenis kerajaan (agraris dan maritim), nama kapal (jung), sungai utama (Brantas), komoditas (beras dan rempah), **sebab-akibat:** "Mengapa Majapahit disebut kerajaan maritim?" (karena punya armada kapal besar dan berdagang lewat laut).

**Artefak:** Miniatur Kapal Jung (nyata/rekonstruksi), Lumbung Padi dan Rempah (ilustrasi), Panji Armada (ilustrasi).

### Stage 3 — Candi Tikus & Sanggar Pujangga (Sastra & Toleransi)
**Lingkungan:** petirtaan Candi Tikus, pancuran teratai, pendopo, senja keemasan.

**Kartu Belajar**
1. Masa **Hayam Wuruk** adalah masa kemajuan **sastra**.
2. **Negarakertagama** ditulis **Mpu Prapanca** (1365 M): catatan pemerintahan, wilayah, dan perjalanan raja.
3. **Sutasoma** ditulis **Mpu Tantular**, memuat kalimat **Bhinneka Tunggal Ika**.
4. Artinya: **berbeda-beda tetapi tetap satu**; kini menjadi semboyan Indonesia.
5. Penganut **Hindu-Siwa** dan **Buddha** hidup berdampingan. **Candi Tikus** adalah petirtaan (tempat air suci) di Trowulan.

**Soal (5)** — penulis Negarakertagama (Prapanca), penulis Sutasoma (Tantular), arti Bhinneka Tunggal Ika, dua agama utama (Hindu-Siwa dan Buddha), **sebab-akibat:** "Mengapa Bhinneka Tunggal Ika dipakai sebagai semboyan Indonesia?" (karena maknanya persatuan dalam perbedaan, sesuai keberagaman Indonesia).

**Artefak:** Lontar Sutasoma, Lontar Negarakertagama (ilustrasi naskah), Arca Pancuran Teratai (ilustrasi dari Candi Tikus).

### Stage 4 — Pelataran Agung (Puncak Kejayaan, Boss)
**Lingkungan:** istana malam hari, obor, gerbang dengan relief Kala.

**Kartu Belajar**
1. Puncak kejayaan Majapahit di bawah **Hayam Wuruk (1350–1389 M)**.
2. Didampingi Mahapatih **Gajah Mada**.
3. **Sumpah Palapa:** Gajah Mada bersumpah tidak menikmati **palapa** sebelum **menyatukan Nusantara**. Ia diangkat Patih Amangkubhumi pada **1334 M**.
4. Contoh wilayah dalam sumpah: **Bali, Sunda, Palembang, Tumasik**.
5. *(Kartu reflektif)* Di banyak wilayah, kekuasaan Majapahit berupa **pengaruh dan hubungan**, bukan selalu pemerintahan langsung.

**Soal (5)** — raja puncak kejayaan (Hayam Wuruk), mahapatih (Gajah Mada), isi Sumpah Palapa (menyatukan Nusantara), rentang masa (1350–1389), **sebab-akibat:** "Mengapa masa Hayam Wuruk disebut masa kejayaan?" (wilayah luas, ekonomi makmur, sastra dan budaya berkembang).

**Artefak:** Keris Nagasasra (**Pusaka Legenda**), Mahkota Emas (ilustrasi), Segel Sumpah Palapa (ilustrasi). Tandai jelas di Museum bahwa ini simbol/legenda.

---

## 6. Sistem Pertarungan (Disederhanakan & Bertahap)

### Kontrol Mobile (landscape)
- **Kiri:** d-pad/joystick kiri-kanan.
- **Kanan:** `TINJU`, `LOMPAT`, `SKILL 1`, `SKILL 2`, `DASH` (tombol terpisah; **tidak** pakai ketuk 2x). `ULTIMATE` hanya muncul saat bar penuh.
- Ukuran tombol minimal 64 dp, area aman di tepi layar, haptic saat pukulan kena (plugin Capacitor).
- Keyboard (PC): panah/AD gerak, `J` tinju, `Spasi` lompat, `K`/`L` skill, `Shift` dash, `U` ultimate.

### Skill dibuka bertahap (tutorial in-level)
| Stage | Dibuka |
|---|---|
| 1 | Tinju kombo 3 hit, lompat, double jump; **Skill 1 (Pukulan Surya)** diajarkan di tengah stage untuk memecah tembok retak |
| 2 | **Skill 2 (Gelombang Keris)** dan Dash |
| 3 | Semua digunakan dalam puzzle gabungan |
| 4 | **Ultimate (Amarah Sumpah Palapa)** |

### Nilai awal (semua di `config/balance.json`, mudah disetel)
- Kombo: 15 / 20 / 35 (hit 3 = knockback + getar layar ringan). Serangan udara: tendangan menukik.
- Skill 1: 65 dmg, cooldown 4 dtk, menghancurkan dinding retak. Skill 2: 55 dmg, tembus 3 musuh, cooldown 6 dtk.
- Ultimate: isi bar dari pukulan, koin gobog, dan jawaban benar. **Tidak menembus fase perisai boss; maksimal 20% HP boss.**
- Musuh: Tombak (HP 40), Pemanah (HP 30), Perisai (HP 60, kebal serangan depan biasa), Boss (HP 600).

### Musuh: "Bayangan Lupa"
Bayangan Tombak, Bayangan Pemanah, Bayangan Perisai. Bentuk makhluk bayangan (tanpa darah, tanpa wajah manusia). Tidak memakai tokoh pemberontak nyata.

### Boss: Kala Penjaga Candi Agung
- **Fase 1 (100–50%):** hentakan tanah dan bola api gelap; pemain menghindar dan membalas.
- **Fase 2 (50%):** boss kebal, muncul **3 Pilar Prasasti (A/B/C)** dengan 1 soal. Pukul pilar yang benar → petir emas memecah perisai → boss pusing 5 dtk.
- **Pilar salah:** boss menyerang balik (kena sambaran), **bukan** instan kalah, supaya tidak bisa asal tebak tanpa risiko.
- **Soal boss:** ambil **3 soal acak** dari seluruh pool stage 1-4, dengan **bobot lebih tinggi untuk soal yang sebelumnya salah** (retrieval practice).
- Visual: kepala Kala sebagai motif penjaga candi (bukan iblis); tampilkan dialog bahwa Kala menguji kelayakan Arka dan terpengaruh Bayangan Lupa.

### Mode
- **Mode Belajar:** auto-combo, musuh lemah, Arka tidak bisa mati (respawn di checkpoint), waktu soal tanpa batas.
- **Mode Tantangan:** nilai standar, waktu soal terbatas, bintang bonus.

---

## 7. Mekanik Khas per Stage (Anti-Monoton)

| Stage | Mekanik | Mencerminkan materi |
|---|---|---|
| 1 | Susun/pasang bata untuk menutup celah jalan; pecahkan tembok retak dengan Skill 1 | Arsitektur bata merah |
| 2 | Platform kapal bergerak mengikuti ritme angin/gelombang | Maritim dan pelayaran |
| 3 | Pintu terbuka hanya jika **dua saklar (arca Siwa dan Buddha)** aktif bersamaan | Toleransi / Bhinneka |
| 4 | Boss kuis (bagian 6) | Puncak kejayaan |

**Struktur umum stage (3-5 menit):** pembuka NPC (≤15 dtk) → platforming → 3 artefak (1 di jalur utama, 1 di balik tembok/skill, 1 butuh eksplorasi) → checkpoint pendopo (NPC pujangga, soal ringan, buff) → gauntlet kecil → Gerbang Waktu/Boss.

**Blok Prasasti (`?`):** isinya potongan fakta ≤25 kata yang **mengulang kartu belajar** (bukan fakta baru).

---

## 8. Progres, Museum, Rapor, Toko

- **Bintang 1-3:** berdasarkan akurasi jawaban, artefak yang terkumpul, dan (Mode Tantangan) waktu.
- **Museum:** semua kartu dan artefak yang dibuka, ditandai **Nyata** atau **Legenda**.
- **Rapor Pendekar:** akurasi per stage, jumlah artefak, waktu, daftar topik yang perlu diulang (akurasi < 60%). Dapat diunduh sebagai **PNG** (render canvas, tanpa backend).
- **Toko (kecil saja):** pakai Koin Gobog untuk 3 hal: Jamu (pulih HP), 1 upgrade HP maksimal, **Kostum Sejarah** (Bhayangkara, Prajurit, Pujangga) yang masing-masing membuka kartu info. Hindari sistem upgrade berlapis.
- **Penyimpanan:** `@capacitor/preferences` (APK) / `localStorage` (web), lewat satu lapisan abstraksi `Storage`.

---

## 9. Arsitektur Kode (Modular, Data-Driven)

```
src/
  main.js
  config/        balance.json, controls.json
  data/          stages.json, cards.json, questions.json, artifacts.json, dialogs.json
  scenes/        BootScene, MenuScene, LearnScene, QuizScene, GameScene, BossScene, ResultScene, MuseumScene, ReportScene
  systems/       CombatSystem, InputSystem (touch+keyboard), ProgressSystem, QuizSystem, AudioSystem, StorageAdapter
  entities/      Player, enemies/*, Boss, Pickup, PrasastiBlock
  ui/            TouchControls, HUD, CardCarousel, QuestionModal
public/assets/   characters/ enemies/ environment/ items_vfx/ ui/ audio/
```

**Prinsip:** scene tidak berisi data soal/materi; sistem tidak tahu detail scene; pergantian soal/kartu cukup edit JSON tanpa menyentuh logika.

**Contoh skema data:**

```json
// data/cards.json
{ "stage": 1, "id": "s1c1",
  "text": "Raden Wijaya mendirikan Majapahit pada tahun 1293 M.",
  "keyword": "1293 M", "image": "cards/s1c1.png" }

// data/questions.json
{ "id": "s1q1", "stage": 1, "cardRef": "s1c1", "type": "mcq",
  "level": "ingat",
  "prompt": "Majapahit didirikan pada tahun...",
  "options": ["1293 M", "1350 M", "1389 M", "1511 M"],
  "answer": 0,
  "explanation": "Raden Wijaya mendirikan Majapahit tahun 1293 M." }

// data/artifacts.json
{ "id": "gobog", "stage": 1, "kind": "nyata",
  "name": "Koin Gobog", "blurb": "Uang logam berlubang dari masa Majapahit.",
  "icon": "items/gobog.png" }
```

Kolom `level` bernilai `ingat | pahami | sebab-akibat`. Setiap soal wajib punya `cardRef` (menjamin soal selalu ada dasar kartunya). Catat per soal: percobaan, benar/salah, waktu, untuk Rapor dan pembobotan soal boss.

---

## 10. Catatan Teknis

- **Audio:** pakai audio manager bawaan Phaser; buka audio setelah sentuhan pertama (aturan autoplay WebView).
- **Aset visual:** PNG transparan. Mulai dengan **1 pose per aksi** lalu animasikan lewat tween (squash/stretch, miring, bergoyang); tambah frame hanya bila perlu. Konsistensi sprite AI antar-frame adalah risiko terbesar; siapkan *style prompt* tunggal (palet, proporsi chibi, ketebalan outline).
- **Performa HP menengah:** texture atlas, ukuran tekstur terukur, latar dipecah **parallax layer**, hindari satu PNG raksasa per stage.
- **Game feel:** hit-stop 60-80 ms, getar kamera halus, tombol dengan efek tekan, haptic.
- **Musik:** gamelan berlapis adaptif (kendang masuk saat kombo, gong di pergantian fase boss, slendro lambat untuk Stage 3).
- **Capacitor:** kunci landscape, layar penuh, haptics, preferences. Build APK lewat Gradle/Android Studio atau **GitHub Actions** agar tak perlu IDE berat. Siapkan juga **web (Netlify)** sebagai jalur uji cepat.
- **Aksesibilitas:** tombol audio/getar, ukuran teks, kontras, tidak mengandalkan warna saja.

---

## 11. Aset yang Dibutuhkan (Ringkas)

- **Karakter:** Arka (idle, run, jump, punch 1-3, air-kick, skill pose), Gajah Mada, Hayam Wuruk, Mpu Prapanca/Tantular.
- **Musuh:** Bayangan Tombak/Pemanah/Perisai, Kala Penjaga.
- **Lingkungan:** latar 4 stage (parallax), tile bata merah, Blok Prasasti.
- **Item/VFX:** gobog, jamu, efek Surya, gelombang keris, petir emas.
- **UI:** kartu Balai Belajar (ilustrasi 20 kartu), ikon 12 artefak, tombol sentuh, bingkai Rapor.
- **Audio:** gamelan 4 trek (loop), SFX pukulan, skill, koin, benar/salah, gong boss.

---

## 12. Roadmap & Kriteria Selesai

1. **Fondasi:** setup Vite+Phaser+Capacitor, struktur folder, StorageAdapter, input sentuh+keyboard.
2. **Vertical Slice Stage 1:** Balai Belajar (5 kartu) + Cek Cepat + level + 1-2 jenis musuh + kombo + Skill 1 + Blok Prasasti + Gerbang Waktu + Hasil Stage + Mode Belajar.
3. **Sistem data & kuis:** semua JSON, QuizSystem dengan umpan balik, pencatatan jawaban.
4. **Stage 2 dan 3** dengan mekanik khas masing-masing.
5. **Stage 4 + Boss** dengan fase kuis dan soal berbobot.
6. **Museum, Rapor PNG, Toko kecil**, penyetelan keseimbangan, audio final.
7. **Build APK**, uji di beberapa HP, perbaikan performa.

**Kriteria selesai Vertical Slice (Stage 1):**
- Pemain bisa menyelesaikan Stage 1 dari Balai Belajar sampai Hasil Stage di Mode Belajar tanpa bisa mati.
- Setiap soal merujuk kartu (`cardRef`) yang valid.
- Mengganti teks kartu/soal hanya lewat JSON tanpa mengubah kode.
- Berjalan stabil di web dan di minimal 1 HP Android menengah.

---

## 13. Keputusan Terbuka (Konfirmasi Pemilik Proyek)

1. Nama final karakter, gaya ilustrasi (chibi anime) dan *style prompt* aset.
2. Bahasa antarmuka: Indonesia saja atau ada opsi Inggris.
3. Verifikasi isi materi oleh guru/ahli sejarah dan acuan buku teks yang dipakai.
4. Apakah nanti ada versi "lanjutan" (SMA) yang membuka materi tunda (Ra Kuti, tiga lingkar kekuasaan, dst.).
5. Mode Kelas opsional (kode kelas, ekspor hasil), atau cukup Rapor PNG.
