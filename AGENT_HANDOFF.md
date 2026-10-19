# 🤖 AGENT HANDOFF & PANDUAN LANJUTAN (v2.0)
## **Kala Nusantara: Bhayangkara Majapahit**
**Lokasi Proyek:** `/Users/macproi52019/Documents/kala-nusantara-majapahit`  
**Dokumen Acuan Utama:** `/Users/macproi52019/Downloads/CHRONO_JUMP_MAJAPAHIT_v2_REVISI.md`

---

## 📌 1. Aturan Kerja Untuk Agent Selanjutnya (Gemini 3.8 Flash / Claude / Cursor)
1. **Perubahan Terarah (Targeted Edits):** Jangan menulis ulang file besar secara keseluruhan tanpa alasan. Gunakan *replace* pada bagian fungsi yang ingin diubah.
2. **Data-Driven (Jangan Hardcode Materi di Kode Scene):**
   * Semua kartu materi Balai Belajar ada di `src/data/cards.json`.
   * Semua soal Cek Cepat, Gerbang Waktu, dan Perisai Boss ada di `src/data/questions.json` (setiap soal wajib memiliki `cardRef` yang valid).
   * Semua artefak (dengan pembeda tegas `"kind": "nyata"` vs `"kind": "legenda"`) ada di `src/data/artifacts.json`.
   * Peta Capaian Pembelajaran (CP) Kurikulum Merdeka ada di `src/data/curriculum_cp.json`.
   * Parameter *damage*, HP musuh, *cooldown*, dan harga Toko Gobog ada di `src/config/balance.json`.
3. **Sumber Kebenaran Fakta Sejarah (Wajib Dipatuhi):**
   * Pendiri Majapahit: **Raden Wijaya, 1293 M**.
   * Pengangkatan Gajah Mada sebagai Patih Amangkubhumi & Sumpah Palapa: **1334 M** (bukan 1336).
   * Arsitektur bata merah: teknik **gosok-rekat (kosod)** tanpa semen modern.
   * Musuh adalah **Bayangan Lupa** (makhluk bayangan pemakan ingatan sejarah), dan Boss adalah **Kala Penjaga Candi Agung** (penguji kelayakan yang terpengaruh Bayangan Lupa).

---

## 📂 2. Struktur File Proyek Saat Ini

```text
/Users/macproi52019/Documents/kala-nusantara-majapahit/
├── index.html                           # Entry point HTML & 10 Layar/Modal Core Loop
├── package.json                         # Script server lokal & Capacitor APK
├── capacitor.config.json                # Konfigurasi Capacitor Android (Landscape Lock)
├── netlify.toml                         # Konfigurasi deploy instan ke Netlify
├── .github/workflows/build-android-apk.yml # Cloud compiler otomatis untuk file .APK
├── AGENT_HANDOFF.md                     # [FILE INI] Panduan estafet antar-model AI
├── public/
│   ├── css/style.css                    # Styling Terakota & Emas Surya + Tombol Sentuh >= 64dp
│   └── assets/
│       ├── characters/                  # arka_hero.png, npc_gajah_mada.png (PNG Transparan)
│       ├── enemies/                     # bayangan_tombak.png, boss_kala.png (PNG Transparan)
│       ├── environment/                 # bg_stage1_trowulan.png
│       └── items/                       # tile_brick.png, block_prasasti.png, coin_gobog.png, vfx_*.png
└── src/
    ├── main.js                          # Orchestrator Core Loop (Menu -> Balai Belajar -> Cek Cepat -> Game -> Rapor)
    ├── config/balance.json              # Parameter angka kombo, skill, musuh, & mode
    ├── data/
    │   ├── curriculum_cp.json           # Pemetaan resmi CP Kurikulum Merdeka (IPS SMP Fase D & IPAS SD)
    │   ├── stages.json                  # Konfigurasi Stage 1 s/d Stage 4
    │   ├── cards.json                   # 20 Kartu Balai Belajar (5 per Stage)
    │   ├── questions.json               # 20 Soal Terverifikasi dengan cardRef & level kognitif
    │   └── artifacts.json               # 12 Artefak (Nyata vs Legenda/Ilustrasi)
    ├── scenes/PlatformerScene.js        # Phaser 3 2D Action-Platformer Brawler Engine
    └── systems/
        ├── StorageAdapter.js            # Abstraksi localStorage + @capacitor/preferences
        ├── AudioSystem.js               # Gamelan Slendro Sintetis + SFX + Capacitor Haptics
        └── ReportGenerator.js           # Render & Download Rapor Pendekar sebagai file .PNG
```

---

## ✅ 3. Status Implementasi & Checklist Selanjutnya
- [x] **Alur Lengkap v2:** Menu Utama $\rightarrow$ Balai Belajar (5 Kartu Geser) $\rightarrow$ Cek Cepat (2 Soal Non-Blocking dengan Rujukan Kartu) $\rightarrow$ Gameplay Stage $\rightarrow$ Gerbang Waktu $\rightarrow$ Hasil Stage.
- [x] **Mode Belajar (Anti-Gagal)** untuk SD/Pemula & **Mode Tantangan (Timer)** untuk SMP Kelas 7–8.
- [x] **Pertarungan 2D Brawler:** Tinju Kombo 3-Hit, Tendangan Udara, Skill 1 (*Pukulan Bara Surya* penghancur tembok retak), Skill 2 (*Gelombang Keris*), Tombol *Dash* terpisah, dan *Ultimate* (*Amarah Sumpah Palapa* maks. 20% HP Boss).
- [x] **Mekanik Khas Stage 1–4:** Jembatan Bata Kosod (Stage 1), Anjungan Kapal Jung Bergerak (Stage 2), Saklar Harmoni Siwa-Buddha (Stage 3), dan Boss **Kala Penjaga Candi Agung** dengan **Fase 3 Pilar Prasasti (A/B/C)** di 50% HP (Stage 4).
- [x] **Aset Gambar `.PNG` Transparan Asli** (Bukan kotak CSS).
- [x] **Halaman CP Kurikulum Merdeka, Museum (Nyata vs Legenda), Toko Gobog, & Ekspor Rapor `.PNG`**.
