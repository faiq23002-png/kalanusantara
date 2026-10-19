# Kala Nusantara — Spesifikasi Revisi v3
### Alur layar, identitas visual, karakter, kontrol, dunia, musuh

Lanjutan dari `CHRONO_JUMP_MAJAPAHIT_v2_REVISI.md`. Dokumen ini hanya memuat **perubahan**; bagian v2 yang tidak disebut di sini tetap berlaku (materi, soal, Mode Belajar/Tantangan, struktur data JSON, Rapor, Museum).

> **Aturan kerja untuk agent:** lakukan perubahan **terarah dan bertahap** sesuai urutan di bagian 12. Jangan menulis ulang proyek. Pertahankan pemisahan konten (JSON) dari logika, dan UI dari sistem game. Setiap tahap: screenshot sebelum/sesudah dan uji di viewport **800×360 landscape**.

**File pendamping:** `bata-ui.css` (UI kit, siap dipakai) dan `bata-ui-preview.html` (lihat tampilannya di browser).

---

## 1. Ringkasan Keputusan (13 permintaan)

| # | Permintaan | Keputusan |
|---|---|---|
| 1 | Loading + video intro | Loading berkarakter + judul → "Ketuk untuk Mulai" → video intro **hanya sekali** → setup profil. Video harus **netral karakter** (lihat 2.3) |
| 2 | Pisahkan materi dan game | Beranda punya **2 kartu berbeda**: *Balai Belajar* (lontar) dan *Petualangan* (bata). Karakter di kiri, menu di kanan |
| 3 | Latar beda tiap stage, panjang, animasi | Level lebar **~8-10 layar**, latar **berlapis (parallax)**, ambient: daun, burung, awan, dst. (bagian 7) |
| 4 | Karakter berjalan, tidak melayang | Set animasi lengkap + perbaikan penjangkaran kaki (bagian 5) |
| 5 | Serangan dasar pakai panah/keris | Senjata dipilih pemain: **Keris, Panah, Tombak** |
| 6 | Tombol silang di kartu materi | Tombol X di pojok kanan atas kartu (bagian 4.4) |
| 7 | HP: kontrol kanan-kiri-atas-bawah, bukan joystick | **D-pad 4 arah** (deteksi 8 arah) (bagian 6) |
| 8 | Musuh bertinju; boss bergerak; Gajah Mada jauh | Bagian 8 |
| 9 | 2 karakter + pilih nama/senjata | Layar **Setup Profil**: nama → karakter → senjata (bagian 2.4) |
| 10 | HP auto-landscape | Kunci orientasi di manifest + fallback (bagian 6.3) |
| 11 | Kartu/tombol bergaya bata kuno, bukan AI slop | **UI kit Bata Trowulan** (`bata-ui.css`), tekstur bisa diganti PNG generator (bagian 4) |
| 12 | Ciri khas game | Bagian 4.1 dan 8.3 |
| 13 | Blok bata tinggi, rasa parkour | Tambah **wall-jump** + menara bertingkat (bagian 7.4) |

---

## 2. Alur Layar

```
Loading (karakter + judul + progres bata)
  → "Ketuk untuk Mulai"          (membuka audio + layar penuh + kunci landscape)
  → [pertama kali saja] Video Intro "Arka tersedot ke Majapahit"  (ada tombol Lewati)
  → [pertama kali / sesi baru] Setup Profil: Nama → Karakter → Senjata
  → BERANDA
       ├─ Kartu "Balai Belajar" (materi)   → pilih stage → kartu-kartu lontar
       └─ Kartu "Petualangan"  (game)      → pilih stage → pilih mode → main
```

### 2.1 Loading
- Latar: ilustrasi stage 1 (pakai aset yang sudah ada), karakter terpilih (default: Arka) dengan animasi *idle*, logo **Kala Nusantara**.
- Bar progres bergaya bata, **terhubung ke progres loader Phaser yang sesungguhnya** (bukan animasi palsu).
- Di bawah bar: kalimat "Tahukah kamu?" yang berganti tiap ±3 detik, diambil dari `cards.json` (edukasi gratis selama menunggu).
- Selesai loading → teks berkedip **"Ketuk untuk Mulai"**. Ketukan ini **wajib**, karena browser/WebView memblokir audio sebelum ada sentuhan; di sini juga panggil layar penuh dan kunci landscape.

### 2.2 Transisi khas
Semua perpindahan layar besar memakai transisi **gerbang bentar membuka**: dua sisi gapura bata bergeser ke kiri-kanan (260-400 ms). Ini penanda identitas game (lihat 4.1).

### 2.3 Video Intro
- Format: MP4 (H.264 + AAC), **maksimal 720p, 15-20 MB**, `playsinline`, mulai setelah ketukan pengguna.
- Tombol **Lewati** muncul setelah 1 detik; simpan flag `introSeen=true` agar tidak diputar ulang. Kalau video gagal dimuat, langsung lanjut ke Setup (jangan buntu).
- **Konflik yang harus dihindari:** pemain bisa memilih karakter perempuan, jadi video **tidak boleh menampilkan wajah/tubuh Arka**. Pilihan, urut dari yang termurah:
  1. **Netral:** tampilkan tangan menyentuh **Medali Surya** di Museum Trowulan, cahaya menyedot, lalu melihat pelan ke gapura Majapahit dari sudut pandang orang pertama atau siluet dari belakang.
  2. Dua varian video (Arka dan karakter perempuan), diputar sesuai pilihan; ini mengharuskan Setup Profil **sebelum** video.
- Semua dialog dan Rapor memakai `{nama}` dari profil, **bukan** "Arka" yang ditulis mati.
- Alternatif ringan bila video belum siap: 5-6 panel ilustrasi bergerak halus (parallax + teks pendek).

### 2.4 Setup Profil (muncul pertama kali dan bisa diubah lewat tombol "Ubah" di beranda)
1. **Nama** (maks. 16 karakter, nama bawaan "Arka" / "Laras" menyesuaikan karakter).
2. **Karakter:** dua kartu dengan pratinjau animasi *idle*: **Arka** dan karakter perempuan (nama bawaan usulan: **Laras**; bisa diubah).
3. **Senjata:** tiga kartu (Keris, Panah, Tombak) dengan pratinjau animasi serangan singkat dan 1 baris deskripsi gaya main.
4. Simpan ke `profile` `{nama, karakter, senjata, introSeen}` lewat `StorageAdapter`.

---

## 3. Beranda (mengganti peta stage yang sekarang)

**Masalah di versi sekarang:** kotak stage putih menumpuk di kiri atas tanpa gaya, garis putus-putus tidak menghubungkan apa pun (jalur dan node tidak sinkron), tengah layar kosong, tombol MAIN tetap terlihat di balik panel stage. Hapus peta bebas ini.

**Tata letak baru (landscape):**
```
┌──────────────────────────────────────────────────────────────┐
│ KALA NUSANTARA                         [Museum][Toko][Rapor][Guru][⚙] │
│ Bhayangkara Majapahit                                        │
│ [◎ Gobog] [⚱ Artefak]                ┌─ KARTU LONTAR ─────┐ │
│                                       │ Balai Belajar      │ │
│        (KARAKTER TERPILIH,            │ 2/4 materi · [Buka]│ │
│         idle beranimasi,              └────────────────────┘ │
│         bernapas, senjata di          ┌─ KARTU BATA ───────┐ │
│         tangan, partikel halus)       │ Petualangan        │ │
│                                       │ [Lanjutkan][Stage] │ │
│ [Pendekar: nama · Ubah]               └────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```
- **Dua kartu berbeda material:** *materi = lontar + apit jati* (tenang, hangat), *game = bata + bingkai emas* (kuat, aksi). Pembeda itu sengaja agar pemain langsung paham mana belajar dan mana main.
- **Lanjutkan** membuka stage terakhir yang dimainkan (satu ketukan). **Pilih Stage** membuka pemilih stage.
- Tombol Museum, Toko, Rapor, Info Guru, Setelan = tombol ikon andesit di pojok kanan atas (dengan label saat ditahan/hover).
- Karakter di kiri berganti sesuai profil, dengan idle 6-8 frame yang berulang pelan dan partikel (kunang-kunang/daun) di sekitarnya.

**Pemilih stage (layar penuh, geser horizontal):** 4 kartu besar, masing-masing memakai **ilustrasi latar stage itu sendiri** sebagai gambar utama. Tiap kartu menampilkan: nama stage, bintang, akurasi, ikon status materi (lontar centang atau belum), dan gembok bila terkunci.
- Dari **Balai Belajar**, mengetuk stage membuka kartu-kartu materi stage itu.
- Dari **Petualangan**, mengetuk stage membuka panel bawah kecil: pilih Mode (Belajar/Tantangan) + tombol **Main**. Jika materi stage **belum dibaca**, tombol primer berubah menjadi **"Baca Materi Dulu"** yang langsung membuka kartunya, lalu otomatis kembali ke panel ini setelah selesai. Dengan begitu alur "materi dulu baru game" tetap terjaga walau sudah dipisah.

---

## 4. Identitas Visual & UI Kit "Bata Trowulan"

### 4.1 Ciri khas (diulang konsisten di semua elemen)
| Pilar | Wujud |
|---|---|
| **Bahan** | Bata merah (aksi/game) · andesit (sekunder) · lontar + kayu jati (materi/baca) · emas tua (hanya untuk hadiah/aksen) |
| **Bentuk** | Sudut **bertangga** pada semua tombol dan kartu (mengacu profil candi). Siluet **gapura bentar** untuk transisi dan ornamen |
| **Lambang** | **Surya Majapahit** (8 arah) untuk emblem, efek ultimate, ikon skill |
| **Efek khas** | **Bayangan Lupa pecah menjadi aksara Jawa Kuno/Kawi** yang melayang ke ikon *Kitab* di HUD (pengetahuan "kembali") |
| **Suara** | Gamelan berlapis; SFX tombol memakai ketuk bonang/kenong/kendang, bukan "klik" generik |
| **Tipografi** | Display serif berkarakter untuk judul (pada preview: fallback Cinzel/Georgia), body rounded sans yang mudah dibaca. **Bundel font lokal** (woff2), jangan CDN |

Hindari motif batik parang di visual Majapahit.

### 4.2 Aturan keterbacaan (penting agar tidak norak)
- **Teks panjang tidak pernah di atas tekstur bata.** Taruh di atas **lontar** (kartu materi, dialog, detail Museum) atau panel gelap redup.
- Bata hanya untuk tombol, bingkai, dan kartu navigasi. Judul pada bata diberi bayangan gelap tegas.
- Satu aksen emas per layar untuk hadiah/CTA utama; jangan semua elemen berbingkai emas.
- Tombol primer lebih **terang** dari kartu di belakangnya (sudah ditangani `.card-bata .btn`).

### 4.3 Pemakaian `bata-ui.css`
Salin ke `src/ui/` dan impor sekali. Kelas utama:

| Kelas | Fungsi |
|---|---|
| `.btn` | Tombol bata bertangga + bingkai emas (primer). `.btn--stone` sekunder, `.btn--lontar` aksi materi, `.btn--icon` kotak ikon, `.btn--lg` besar |
| `.card-bata` | Kartu game (bata gelap + bingkai emas) |
| `.card-lontar` | Kartu materi (daun lontar, apit jati, dua lubang) + `.hole.l/.r`, `<mark>` untuk kata kunci, `.kunci`, `.dots` |
| `.card__close` + `.x-glyph` | Tombol silang (lihat 4.4) |
| `.chip`, `.bar`, `.hud` | Penghitung, bar HP/Ult, panel HUD |
| `.dpad` + `.arrow.u/d/l/r` | D-pad 4 arah |
| `.logo`, `.logo-sub` | Judul emas bertulis |
| `.rotate-hint` | Layar "putar HP" (portrait) |

- Semua tekstur ada di variabel **`--tex-bata`, `--tex-andesit`, `--tex-lontar`, `--tex-teak`** (SVG prosedural sebagai pengganti sementara). Begitu tekstur PNG hasil generator siap, **cukup ganti isi variabel** itu; komponen tidak perlu diubah.
- Ikon di preview hanyalah *placeholder* garis. Ganti dengan **set ikon sendiri** (±16: keris, panah, tombak, surya, jamu, gobog, buku, museum, toko, rapor, guru, bintang, gembok, jeda, suara, setelan) dalam satu gaya.
- Untuk objek Phaser (bukan DOM), pakai **NineSlice** dengan PNG yang sama agar tampilannya identik.

### 4.4 Kartu materi + tombol silang (poin 6)
- Tombol **X** di pojok kanan atas kartu, ukuran ≥ 46 px, juga menutup lewat **Esc** (desktop) dan ketukan di luar kartu.
- Menutup **tidak menghukum**: simpan nomor kartu terakhir agar bisa dilanjutkan.
- Titik progres kartu (`.dots`), tombol **Sebelumnya/Berikutnya**, geser kiri-kanan di layar sentuh. Teks minimal 18 px.
- Ilustrasi kartu (artefak/tempat dari aset game) di sisi kiri teks; hindari emoji.

---

## 5. Karakter

### 5.1 Dua karakter, tiga senjata
- **Arka** (laki-laki) dan **karakter perempuan** (nama bawaan usulan *Laras*). Gaya: **semi-realistis**, outline dan pewarnaan **konsisten dengan latar** yang sudah ada (jangan ganti gaya antar aset).
- Kostum Bhayangkara: ikat kepala (*udheng*) merah, kain bawahan bata/merah tua, sabuk emas, lambang Surya Majapahit di dada. Versi perempuan: pakaian prajurit perempuan Jawa kuno (kain wiru, ikat dada berlapis zirah ringan, rambut disanggul/dikuncir, selendang).
- **Senjata (pilih di Setup):**

| Senjata | Gaya main | Serangan dasar | Skill 2 (spesial) |
|---|---|---|---|
| **Keris** | Dekat, cepat | Kombo 3 tebasan | Gelombang Keris |
| **Panah (jemparing)** | Jauh | Tembak lurus, bidik atas/bawah dengan ↑/↓, jeda tembak ±0,45 dtk, **amunisi tak terbatas** | Hujan Panah |
| **Tombak (waos)** | Jangkauan menengah | Tusukan menembus 2 musuh | Sapuan Tombak |

- **Skill 1 (Pukulan Surya)** sama untuk semua senjata (ledakan area, bisa memecah dinding retak).
- Karena kini serangan dasar berupa senjata, "tinju" dihapus dari pemain (tinju dipakai musuh, bagian 8).

### 5.2 Mengapa karakter "melayang" dan cara memperbaikinya
Penyebab umum: sprite satu pose tanpa animasi, titik tumpu sprite di tengah (bukan di telapak kaki), dan *hitbox* tidak selaras dengan gambar.
1. **Origin sprite = tengah-bawah (0.5, 1)**; atur *body offset* sehingga dasar hitbox tepat di telapak kaki.
2. **Animasi berjalan dikaitkan ke kecepatan**: kecepatan animasi ∝ |velocity.x|; bila berhenti, kembali ke *idle*.
3. **Bayangan lonjong** di bawah kaki + **debu langkah** (partikel kecil) saat berjalan/mendarat.
4. Kontak tanah: tahan 1-2 frame *landing* (squash) saat mendarat.
5. Rasa lompat: **coyote time ±100 ms**, **jump buffer ±120 ms**, tinggi lompat variabel (tahan = lebih tinggi).

### 5.3 Daftar animasi (frame sebagai titik awal)
Ukuran kanvas per frame **256×256**, latar transparan, **garis kaki di y = 232**, titik tumpu tengah-bawah, skala sama di semua frame. Hadap kanan saja; **kiri = *flip* horizontal di engine** (jangan membuat set kiri terpisah; menghemat separuh pekerjaan dan menjamin konsisten).

| Animasi | Frame | FPS | Loop |
|---|---|---|---|
| idle | 6 | 8 | ya |
| walk | 8 | 12 | ya |
| run | 8 | 14 | ya |
| crouch (turun) + crouch_idle | 2 + 2 | 10 | tidak / ya |
| crouch_walk (opsional) | 6 | 10 | ya |
| jump_prep (jongkok bersiap) | 2 | 14 | tidak |
| jump_rise | 2 | 10 | tidak |
| jump_fall | 2 | 10 | ya |
| land (+ debu) | 3 | 14 | tidak |
| double_jump (putar/salto) | 4 | 16 | tidak |
| dash | 3 | 16 | tidak |
| wall_slide + wall_jump | 2 + 2 | 10 | ya / tidak |
| hurt | 2 | 12 | tidak |
| down (jatuh/terkapar) | 3 | 10 | tidak |
| skill_cast | 4 | 14 | tidak |
| victory | 4 | 8 | ya |
| **serangan keris** (3 tebasan) | 4 × 3 | 16 | tidak |
| **serangan panah** (tarik, bidik, lepas) | 5 | 14 | tidak |
| **serangan tombak** (tusuk) | 5 | 14 | tidak |

**Trik penghematan:** **senjata disarungkan/digendong saat tidak menyerang** (keris di pinggang, panah dan busur di punggung, tombak di punggung), jadi semua frame non-serangan dipakai bersama oleh ketiga senjata. Hanya animasi serangan yang berbeda per senjata. Perkiraan: **±60 frame badan + ±22 frame serangan per karakter** (≈ 80), total ±165 untuk dua karakter. **MVP:** satu karakter (Arka) + Keris + animasi inti (idle, walk, jump_prep, jump_rise, jump_fall, land, crouch, hurt, 3 tebasan) ≈ 40 frame untuk membuktikan alurnya.

### 5.4 Alur produksi aset (risiko terbesar: konsistensi AI)
1. Buat **lembar referensi** per karakter (tampak depan, samping, belakang) dan kunci kostum/warna/proporsi.
2. Hasilkan animasi sebagai **klip pendek kamera statis, latar polos satu warna**, lalu **ekstrak 8-12 frame** dan hapus latar (cara ini jauh lebih konsisten antar frame dibanding membuat gambar per frame).
3. Rapikan: samakan skala dan garis kaki, kemas menjadi **texture atlas** (≤ 2048 px per sisi untuk HP menengah).
4. Penamaan: `{karakter}_{anim}_{nn}.png`, dan untuk serangan `{karakter}_{senjata}_{anim}_{nn}.png`.
5. Karakter ke-2 memakai **timing dan jumlah frame yang sama** agar kode animasi tidak bercabang.
Alternatif bila konsistensi frame gagal: *cut-out animation* (pisahkan badan menjadi bagian-bagian lalu animasikan dengan rangka).

---

## 6. Kontrol & Orientasi

### 6.1 D-pad 4 arah (bukan joystick)
- Salib tetap di kiri bawah: ↑ ← → ↓. Satu area sentuh, **deteksi 8 arah lewat sudut** (diagonal = dua arah sekaligus), tanpa input analog.
- **Fungsi:** ← → bergerak; **↓ jongkok** (juga turun dari platform tipis); **↑ bidik atas** (panah) / pegang pinggiran / masuk gerbang.
- **Lompat tetap tombol terpisah di kanan.** Alasan: berlari sambil melompat butuh dua ibu jari; kalau ↑ = lompat, jempol kiri harus menekan → dan ↑ bersamaan (sulit). Sediakan opsi di Setelan **"Lompat di ↑"** bagi yang lebih suka.
- Tombol kanan (ikon, bukan emoji, tanpa petunjuk keyboard di layar sentuh): **Serang** (besar), **Lompat**, **Dash**, **Skill 1**, **Skill 2**, **Ultimate** (muncul hanya saat bar penuh). Target sentuh ≥ 50-56 px, jarak antar tombol ≥ 10 px, transparan 85-90%, *haptic* ringan saat ditekan.
- Hint keyboard (`[Shift] [L] [K] [J]`) hanya tampil di perangkat tanpa layar sentuh (`pointer: fine`).

### 6.2 HUD ramping (HP landscape)
HP + Ult di kiri atas, gobog dan artefak kecil di sebelahnya, **satu tombol jeda** di kanan atas. Judul stage tampil 2 detik di awal lalu hilang. Jamu, Kartu Materi, Suara, dan Menu pindah ke menu jeda.

### 6.3 Auto-landscape (poin 10)
- **APK:** di `AndroidManifest.xml` set `android:screenOrientation="sensorLandscape"` pada activity utama (mencegah sempat tampil portrait), plus Capacitor `ScreenOrientation.lock({orientation:'landscape'})` sebagai pengaman.
- **Web/PWA:** `"orientation": "landscape"` di web manifest; setelah "Ketuk untuk Mulai" panggil layar penuh lalu `screen.orientation.lock('landscape')` (didukung Chrome Android; **tidak** didukung iOS Safari).
- **Fallback:** bila masih portrait, tampilkan `.rotate-hint` ("Putar HP-mu ke samping") dan jeda game.
- Hormati area aman layar: `env(safe-area-inset-*)` pada HUD dan kontrol.
- Resolusi logis game **1280×720**, skala FIT, tengah.

---

## 7. Dunia Game

### 7.1 Satu latar berbeda per stage (kini Stage 2 masih memakai latar Stage 1)
| Stage | Suasana | Elemen khas | Platform dominan |
|---|---|---|---|
| 1 Gerbang Trowulan | Pagi keemasan | Beringin besar, gapura bentar, kolam Segaran | Bata merah |
| 2 Dermaga Brantas | Siang cerah | Sungai lebar, kapal jung, layar, dermaga | **Papan kayu/dek** |
| 3 Candi Tikus | Senja ungu-oranye | Petirtaan, pancuran, teratai, candi | Batu andesit |
| 4 Pelataran Agung | Malam | Obor, istana, relief Kala | Bata gelap + batu |

### 7.2 Level panjang dan latar berlapis (parallax)
- Panjang level (px logis, tinggi 720): **S1 ≈ 9000, S2 ≈ 9000, S3 ≈ 8000, S4 ≈ 6000 + arena boss 1280**. Kamera mengikuti pemain (*lerp* halus) dan boleh vertikal untuk menara.
- Lapisan (dari jauh ke dekat) dengan faktor gulir: **langit 0,05 · gunung/awan jauh 0,15 · latar tengah (pohon, bangunan) 0,4 · lapisan dekat (daun, semak) 0,8 · platform & aksi 1,0 · foreground dekat 1,2**.
- Latar dibuat dari **ubin horizontal yang bisa diulang tanpa sambungan** (tiap ubin ≤ 2048 px lebar, pakai `tileSprite`), bukan satu gambar raksasa. Bangunan khas stage ditaruh sebagai prop terpisah pada titik-titik tertentu agar tidak terlihat berulang.

### 7.3 Animasi ambient (poin 3)
Gunakan sistem partikel/sprite Phaser, **semuanya dapat dimatikan** di Setelan ("Efek visual: Penuh/Hemat"). Batas partikel ≤ 40 aktif pada mode hemat, jeda emitter di luar layar.
| Efek | Stage | Rincian |
|---|---|---|
| **Daun gugur** | 1, 3 | 3 varian daun, melayang sinus + berputar, kecepatan acak, lebih padat di dekat pohon |
| **Burung terbang** | 1, 2 | Sprite 4 frame, melintas dengan jeda acak 8-20 dtk di ketinggian acak; camar di stage 2 |
| **Awan bergerak** | 1, 2, 3 | 3-4 sprite awan, gerak lambat, mengikuti lapisan parallax |
| **Air** | 2, 3 | Riak, kilau, kapal jung bergoyang halus, teratai bergoyang |
| **Kunang-kunang/kelopak** | 3 | Titik cahaya hangat dan kelopak teratai melayang |
| **Api obor/bara/abu, kelelawar** | 4 | Nyala obor berkedip, percikan naik, kelelawar sesekali |

### 7.4 Parkour dan blok bata tinggi (poin 13)
Satuan ubin **64 px**. Nilai awal (setel di `config/balance.json` agar mudah diubah):
- Lompat tunggal ≈ **2,5 ubin** · lompat ganda tambahan ≈ **+2 ubin** (total ≈ 4,5) · dash horizontal ≈ **4 ubin** (gravitasi awal ±1800 px/s², kecepatan lompat ±760 px/s).
- **Mekanik baru:** **wall-slide + wall-jump** pada dinding bata dan **mantel/pegang pinggiran** (↑ saat menempel di tepi). Dengan ini menara boleh jauh lebih tinggi dari 4,5 ubin.
- **Pola level:** menara bata bertumpuk setinggi **3-8 ubin**; dua dinding berhadapan berjarak ≤ 3 ubin untuk wall-jump berantai; tangga bata bergeser (*staggered*); bata rapuh yang runtuh 0,6 dtk setelah diinjak; bata bergerak vertikal/horizontal; celah lebar untuk dash-jump.
- Setiap bagian parkour memberi imbalan yang terlihat (artefak/gobog di puncak) dan **selalu ada jalur aman/mudah** di sekitarnya.
- **Mode Belajar:** jatuh tidak menghukum (respawn di titik pijak aman terakhir) dan muncul **bata bantu** opsional di menara tertinggi agar pemain yang lemah dalam parkour tetap bisa menamatkan stage.
- Tekstur bata tidak boleh seragam: variasi warna, lumut, adukan tak rata; tambah **bayangan jatuh** agar platform menyatu dengan latar lukis. Stage 2 memakai papan kayu, Stage 3 batu andesit.

---

## 8. Musuh, Boss, NPC

### 8.1 Musuh: "Bayangan Lupa" bertarung dengan tinju
Tidak ada musuh yang melempar senjata. Semua serangan jarak dekat, dengan **peringatan gerak 0,35-0,5 dtk** sebelum memukul (adil dan terbaca).
| Tipe | Perilaku |
|---|---|
| **Kepalan** | Mendekat, jab 2 kali |
| **Banting** | Lambat, serangan berat/menghantam tanah dengan peringatan jelas |
| **Lincah** | Berlari lalu *dash punch*, lemah terhadap serangan dari depan |
| **Penjaga** | Menahan dari depan; dipecahkan lewat skill atau serangan dari belakang |
- Bentuk: makhluk bayangan dari asap dan tinta, **mata menyala magenta** (agar kontras dengan latar hijau), kepalan besar, **tanpa senjata, tanpa darah**.
- Bar HP kecil di atas kepala (ganti angka `[21]` berfont monospace), kilatan putih saat terkena, *knockback* ringan, bayangan kaki.
- **Kematian khas:** tubuh pecah menjadi **aksara Kawi** yang melayang ke ikon Kitab di HUD (+ bunyi lonceng kecil).

### 8.2 Boss: Kala Penjaga Candi Agung (selalu bergerak)
- Mesin status: *mendekat → serang → mundur/lompat → ulang*; **tidak boleh diam lebih dari ~1 detik**.
- **Fase 1:** berjalan mengejar, hentakan tanah, **lompat ke pilar lalu menukik**, *charge* lurus (diberi peringatan).
- **Fase 2 (kebal, kuis):** boss **tetap bergerak** (mengitari arena, memanggil Bayangan Lupa, gelombang kejut) sementara pemain memukul **Pilar A/B/C** sesuai jawaban. Pilar salah memicu serangan balik, bukan gagal instan. Pada Mode Belajar tidak ada batas waktu.
- Ultimate maksimal 20% HP boss dan tidak menembus fase kebal.
- Kala digambarkan sebagai **penguji/penjaga yang tercemar Bayangan Lupa**, bukan iblis (Kala adalah dewa penjaga dalam tradisi; wajahnya motif asli di atas pintu candi).

### 8.3 NPC Gajah Mada
**Asumsi (koreksi bila keliru):** maksudnya NPC Gajah Mada tidak boleh berdiri dekat titik awal atau arena boss. Tempatkan **jauh**, di ujung stage di balik gerbang akhir (≥ 3 layar dari arena boss), atau hanya muncul sebagai potret dialog/siluet di latar. Ultimate "Amarah Sumpah Palapa" memunculkan aura-nya sementara, bukan karakter NPC yang menempel.

---

## 9. Prompt Aset (untuk generator gambar)
Semua dalam bahasa Inggris agar hasil lebih konsisten. Selalu tambahkan **gaya acuan** yang sama: *"painterly 2D game art, warm earthy palette, thick soft outline, matching an illustrated Majapahit temple landscape"*.

1. **Tekstur bata (seamless):** `seamless tileable texture of aged Majapahit red terracotta bricks, hand-laid with irregular tones and dark uneven mortar, subtle moss and wear, flat front view, no perspective, no text, 1024x1024`
2. **Tekstur andesit:** `seamless tileable dark grey-brown andesite stone blocks, weathered, uneven carved joints, flat front view, 1024x1024`
3. **Tekstur lontar:** `seamless tileable dried palm-leaf (lontar) manuscript surface, cream-yellow with fine horizontal fibers, light stains, no text, 1024x512`
4. **Tekstur kayu jati:** `seamless tileable dark teak wood grain, vertical, worn, 512x256`
5. **Bingkai tombol 9-slice:** `game UI button frame, stepped notched corners like a Javanese candi profile, carved red brick with thin gold inlay border, front view, isolated on transparent background, three states normal pressed disabled`
6. **Logo:** `carved gold lettering "Kala Nusantara" on a weathered stone plaque with a small Surya Majapahit eight-ray sun emblem, transparent background`
7. **Latar per stage (4 lapis tiap stage: langit, jauh, tengah, dekat; ubin horizontal tanpa sambungan):** tambahkan deskripsi dari tabel 7.1, misalnya Stage 2: `wide river dock at midday, Brantas river, large wooden Majapahit jung ships with sails, wooden piers, birds, warm sky, layered parallax, horizontally seamless`
8. **Lembar karakter:** `character turnaround sheet (front, side, back), young Majapahit Bhayangkara royal guard, red udheng headband, terracotta-red cloth, gold belt, Surya Majapahit chest emblem, semi-realistic proportions, neutral pose, plain background` (varian perempuan: `female ancient Javanese warrior, wiru cloth, layered chest wrap with light armor, hair in a bun, sash`)
9. **Musuh:** `shadow creature made of smoke and ink, glowing magenta eyes, bulky clenched fists, no weapons, front-facing side-view game sprite sheet, plain background`
10. **Animasi:** `<karakter> performing a <aksi> loop, orthographic side view, static camera, solid single-color background, consistent character design` lalu ekstrak frame (lihat 5.4).

---

## 10. Catatan Konten (dari kritik sebelumnya, masih berlaku)
- Label Museum disederhanakan jadi 3: **Temuan Arkeologi · Rekonstruksi · Legenda/Ilustrasi**.
- Panji merah-putih "Gula Kelapa" sebagai bendera Majapahit adalah narasi populer dengan bukti tipis; beri label **tradisi/ilustrasi**.
- Kutipan CP di halaman Info Guru: cocokkan dengan dokumen resmi sebelum dipakai; bila tidak, ubah menjadi "Tujuan pembelajaran game ini, dipetakan ke CP" tanpa tanda kutip.

---

## 11. Struktur Berkas yang Disarankan (tambahan terhadap v2)
```
src/ui/            bata-ui.css, components (Button, CardBata, CardLontar, Modal, DPad, HUD)
src/scenes/        BootScene(+Loading), TapToStartScene, IntroVideoScene, SetupScene, MenuScene, StagePickerScene, LearnScene, GameScene, BossScene, ...
src/systems/       InputSystem (D-pad 8 arah), AnimationSystem, AmbientSystem (daun/burung/awan), ParallaxSystem, PlayerAnchor
src/data/          characters.json, weapons.json, stages.json (layer latar + panjang level), enemies.json
public/assets/     characters/{arka,laras}/..., enemies/, bg/stage{1-4}/{sky,far,mid,near}.png, ui/, video/intro.mp4
```

---

## 12. Urutan Kerja & Kriteria Selesai

| Tahap | Isi | Selesai bila |
|---|---|---|
| **A** | Kunci landscape, Loading berkarakter, "Ketuk untuk Mulai", Setup Profil (nama/karakter/senjata), profil tersimpan | Dari buka app sampai Beranda tanpa error di HP dan web; audio berbunyi setelah ketukan |
| **B** | Pasang `bata-ui.css`, Beranda baru (2 kartu), pemilih stage, kartu materi lontar + **X**, hapus peta lama | Tidak ada emoji/kotak putih tersisa; alur "Baca Materi Dulu" bekerja; tampil rapi di 800×360 |
| **C** | Pipeline karakter + Arka + Keris, animasi inti, perbaikan penjangkaran kaki | Arka terlihat berjalan (kaki menapak), jongkok, bersiap lompat, melompat, mendarat; tidak melayang |
| **D** | D-pad 4 arah, wall-jump, mantel, menara bata tinggi di Stage 1 | Menara 6+ ubin bisa dipanjat lewat kombinasi gerak; kontrol nyaman di HP |
| **E** | Latar berlapis Stage 1 + ambient; lalu Stage 2, 3, 4 masing-masing latar sendiri | Tiap stage berbeda; level panjang; efek bisa dimatikan |
| **F** | Musuh bertinju + telegraf, efek pecah jadi aksara, boss bergerak, posisi Gajah Mada | Boss tidak pernah diam >1 dtk; semua serangan musuh jarak dekat |
| **G** | Karakter perempuan, Panah, Tombak, skill per senjata | Semua kombinasi karakter × senjata bisa dimainkan |
| **H** | Video intro (netral) + Lewati + flag `introSeen` | Diputar sekali; aman bila gagal dimuat |

**Urutan sengaja:** UI/alur (A, B) murah dan langsung terasa, tetapi **pipeline karakter (C) paling berisiko**, jadi dibuktikan lebih awal dengan 1 karakter + 1 senjata sebelum melipatgandakan aset.

---

## 13. Keputusan Terbuka (konfirmasi pemilik proyek)
1. Nama karakter perempuan (usulan: *Laras*) dan apakah video intro **netral** (disarankan) atau dua varian.
2. Gaya karakter final: semi-realistis dengan outline sama seperti latar (disarankan) atau lebih realistis.
3. Senjata ketiga: **Tombak** (disarankan) atau pilihan lain (cakra, golok, cambuk).
4. Tafsir poin Gajah Mada (bagian 8.3).
5. Apakah tombol "Lompat di ↑" disediakan sebagai opsi Setelan.
