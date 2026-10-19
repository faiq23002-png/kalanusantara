# Kala Nusantara: Bhayangkara Majapahit (v3.3)

Game edukasi aksi-platformer 2D (Phaser 3 + DOM UI "Bata Trowulan" + Capacitor Android) yang mengangkat sejarah dan kebudayaan **Kemaharajaan Majapahit (1293–1500 M)** sesuai **Kurikulum Merdeka (BSKAP 046/2025)**.

## Fitur Utama (v3.3)
- **Alur Belajar → Petualangan → Gerbang Waktu → Rapor**:
  - **20 Kartu Lontar Balai Belajar** (5 kartu per stage) dengan ilustrasi latar stage & sorotan kata kunci.
  - **20 Soal HOTS Gerbang Waktu** (terdistribusi acak A/B/C/D + pengacakan opsi runtime) dengan syarat ketuntasan **≥ 60%** untuk membuka stage berikutnya.
  - **Lontar Rapor Pendekar** yang dapat diunduh sebagai gambar PNG (`1280×720`) beserta saran belajar personal.
- **2 Karakter & 3 Senjata Pusaka yang Dipegang Langsung**:
  - **Arka** (Pendekar Bhayangkara) & **Laras** (Srikandi Bhayangkara) dengan spritesheet 8 pose (**Idle, Jalan Kanan/Kiri, Nunduk/Jongkok, Persiapan Loncat, Loncat Naik, Melayang Turun, Mendarat**).
  - **Keris Luk Tujuh** (tebasan cepat jarak dekat + *Gelombang Keris*), **Busur Panah Jemparing** (serangan jarak jauh dengan **batas 15/15 anak panah** + **looting anak panah `+5 Panah` di dalam stage** + *Hujan Panah Surya*), dan **Tombak Waos** (tusukan menengah menembus 2 musuh + *Sapuan Tombak*).
- **Kontrol Mobile Ergonomis (800×360 Landscape)**:
  - **Sisi Kiri Layar**: Tombol khusus **KIRI (`◀`)** & **KANAN (`▶`)** (`.move-lr-pad`).
  - **Sisi Kanan Layar**: Tombol **LONCAT (`▲`)** & **NUNDUK (`▼`)** berdampingan dengan **SERANG**, **Skill 1**, **Skill 2**, **Dash**, dan **Ultimate Sumpah Palapa**.
- **Dunia Hidup 4 Stage Berbeda (4200px)**:
  - Stage 1: *Gapura Wringin Lawang, Trowulan*
  - Stage 2: *Dermaga Sungai Brantas & Kapal Jung*
  - Stage 3: *Petirtaan Candi Tikus & Sanggar Pujangga*
  - Stage 4: *Pelataran Agung Istana Wilwatikta* (Pertarungan **Boss Kala Penjaga Candi Agung** yang aktif mengejar/melompat + Ujian 3 Pilar Prasasti + **Epilog Pemulihan Ingatan Nusantara**)
- **100% Offline-Ready**: Phaser 3 (`public/vendor/phaser.min.js`) dan seluruh font TrueType (`DisplayFont-Bold.ttf`, `BodyFont-Regular.ttf`, `BodyFont-Bold.ttf`) dibundel secara lokal untuk APK Android offline.

## Cara Menjalankan Server Lokal
```bash
cd /Users/macproi52019/Documents/kala-nusantara-majapahit
npx serve -l 8090
```
Lalu buka `http://localhost:8090` di browser (atau gunakan mode responsif `800×360` landscape).

## Build APK Android (Capacitor)
```bash
npx cap sync android
npx cap open android
```
