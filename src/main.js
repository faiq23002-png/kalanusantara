// ============================================================================
// src/main.js
// Main Application Orchestrator v3 — Kala Nusantara: Bhayangkara Majapahit
// Alur v3: Loading Berkarakter -> "Ketuk untuk Mulai" -> Intro Netral (Sekali) ->
// Setup Profil (Nama/Karakter/Senjata) -> Beranda 2 Kartu (Lontar & Bata) ->
// Pemilih Stage ("Baca Materi Dulu" / Main) -> Gameplay (D-Pad 4 Arah / 8 Arah)
// ============================================================================

import { StorageAdapter } from './systems/StorageAdapter.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { downloadRaporPNG, getPersonalAdviceData } from './systems/ReportGenerator.js';
import { PlatformerScene } from './scenes/PlatformerScene.js';
import { iconSVG, starPairSVG } from './ui/icons.js';

const STAGE_BG_MAP = {
  1: './public/assets/environment/bg_stage1_trowulan.png',
  2: './public/assets/environment/bg_stage2_dermaga.png',
  3: './public/assets/environment/bg_stage3_candi_tikus.png',
  4: './public/assets/environment/bg_stage4_pelataran_agung.png'
};

const INTRO_SLIDES = [
  {
    badge: 'Museum Trowulan · Masa Kini',
    title: 'Cahaya Medali Surya Majapahit',
    desc: 'Saat jemarimu menyentuh ukiran Medali Surya Majapahit di dalam etalase kaca, cahaya keemasan berpendar hebat dan menarik kesadaranmu menembus lorong waktu...',
    icon: 'surya'
  },
  {
    badge: 'Lorong Waktu · 1293–1350 M',
    title: 'Kabut Bayangan Lupa',
    desc: 'Kabut gelap bernama Bayangan Lupa berusaha menghapus ingatan sejarah Nusantara dari prasasti dan kitab-kitab kuno di ibu kota Majapahit.',
    icon: 'buku'
  },
  {
    badge: 'Gerbang Bentar Trowulan',
    title: 'Panggilan Pendekar Bhayangkara',
    desc: 'Di hadapan Gapura Wringin Lawang yang megah, Mahapatih Gajah Mada memanggilmu untuk memulihkan kembali pengetahuan sejarah yang hilang!',
    icon: 'gapura'
  }
];

const COSTUME_FILTERS = {
  bhayangkara: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))',
  pelaut_jung: 'hue-rotate(175deg) saturate(1.15) drop-shadow(0 6px 12px rgba(59,110,126,0.7))',
  ksatria_surya: 'sepia(0.35) saturate(1.6) brightness(1.06) drop-shadow(0 6px 14px rgba(216,164,68,0.85))'
};

class KalaNusantaraApp {
  constructor() {
    this.storage = new StorageAdapter();
    this.audio = new AudioSystem();

    this.balance = null;
    this.curriculumCP = null;
    this.stages = [];
    this.cards = [];
    this.questions = [];
    this.artifacts = [];
    this.characters = [];
    this.weapons = [];

    this.phaserGame = null;
    this.activeStage = null;
    this.pickerContext = 'petualangan'; // 'belajar' | 'petualangan'
    this.selectedPickerStage = null;
    this.studyCardIndex = 0;
    this.activeStageCards = [];
    this.balaiOptions = { isInGameReference: false, returnToStagePicker: false };
    this.selectedMuseumArt = null;

    // Setup Profil Draft State
    this.draftProfile = {
      nama: this.storage.state.profile.nama || 'Arka',
      karakter: this.storage.state.profile.karakter || 'arka',
      senjata: this.storage.state.profile.senjata || 'keris'
    };

    this.introSlideIdx = 0;
    this.loadingFactInterval = null;
    this.displayedGobog = this.storage.state.gobogCoins;
    this.gobogAnimFrame = null;

    this.quickCheckQuestions = [];
    this.quickCheckIndex = 0;
    this.gateQuestions = [];
    this.gateIndex = 0;
    this.gateCorrectCount = 0;
    this.gateWrongReviews = [];
    this.gateTimerInterval = null;
    this.lastStageRunData = null;

    this._init();
  }

  async _init() {
    this._hydrateStaticIcons();
    this._bindUIEvents();
    await this._runPreloaderSequence();
    this._handlePreviewQuery();
  }

  // ==========================================================================
  // 1. LOADING BERKARAKTER + BAR PROGRES NYATA + "TAHUKAH KAMU?" (Bagian 2.1)
  // ==========================================================================
  async _runPreloaderSequence() {
    const barFill = document.getElementById('loading-bar-fill');
    const pctText = document.getElementById('loading-pct-text');
    const statusText = document.getElementById('loading-status-text');
    const heroImg = document.getElementById('loading-hero-img');

    if (heroImg) {
      heroImg.src = './public/assets/characters/arka_laras_front.png';
    }

    const setProgress = (pct, msg) => {
      const clamped = Math.max(0, Math.min(100, Math.round(pct)));
      if (barFill) barFill.style.width = `${clamped}%`;
      if (pctText) pctText.textContent = `${clamped}%`;
      if (msg && statusText) statusText.textContent = msg;
    };

    const jsonTasks = [
      { key: 'balance', url: './src/config/balance.json' },
      { key: 'curriculumCP', url: './src/data/curriculum_cp.json' },
      { key: 'stages', url: './src/data/stages.json' },
      { key: 'cards', url: './src/data/cards.json' },
      { key: 'questions', url: './src/data/questions.json' },
      { key: 'artifacts', url: './src/data/artifacts.json' },
      { key: 'characters', url: './src/data/characters.json' },
      { key: 'weapons', url: './src/data/weapons.json' }
    ];

    const imgUrls = [
      './public/assets/characters/arka_laras_front.png',
      './public/assets/characters/arka_keris.png',
      './public/assets/characters/arka_panah.png',
      './public/assets/characters/arka_tombak.png',
      './public/assets/characters/laras_keris.png',
      './public/assets/characters/laras_panah.png',
      './public/assets/characters/laras_tombak.png',
      './public/assets/characters/npc_gajah_mada.png',
      './public/assets/items/item_quiver.png',
      './public/assets/environment/bg_stage1_trowulan.png',
      './public/assets/environment/bg_stage2_dermaga.png',
      './public/assets/environment/bg_stage3_candi_tikus.png',
      './public/assets/environment/bg_stage4_pelataran_agung.png'
    ];

    const totalSteps = jsonTasks.length + imgUrls.length;
    let completed = 0;

    for (const task of jsonTasks) {
      const res = await fetch(task.url);
      this[task.key] = await res.json();
      completed++;
      setProgress((completed / totalSteps) * 100, `Memuat data ${task.key}...`);
      if (task.key === 'cards') {
        this._startLoadingDidYouKnowTicker();
      }
    }

    const params = new URLSearchParams(window.location.search);
    const previewTarget = params.get('v3View') || params.get('afterView');
    if (previewTarget && previewTarget !== 'loading') {
      setProgress(100, 'Pustaka siap! Ketuk tombol di bawah untuk memulai.');
      document.getElementById('btn-tap-to-start')?.classList.remove('hidden');
      return;
    }

    await Promise.all(
      imgUrls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => {
              completed++;
              setProgress((completed / totalSteps) * 100, 'Memuat ilustrasi & pusaka Majapahit...');
              resolve();
            };
            img.src = src;
          })
      )
    );

    setProgress(100, 'Pustaka siap! Ketuk tombol di bawah untuk memulai.');
    document.getElementById('btn-tap-to-start')?.classList.remove('hidden');
  }

  _startLoadingDidYouKnowTicker() {
    const factEl = document.getElementById('loading-did-you-know');
    if (!factEl || !this.cards.length) return;

    let idx = 0;
    const renderFact = () => {
      const c = this.cards[idx % this.cards.length];
      factEl.innerHTML = c.text.replace(/\*\*(.*?)\*\*/g, '<mark>$1</mark>');
      idx++;
    };
    renderFact();
    clearInterval(this.loadingFactInterval);
    this.loadingFactInterval = setInterval(renderFact, 3000);
  }

  _hydrateStaticIcons() {
    const setIconOnly = (id, ico, size = 20) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = iconSVG(ico, size);
    };

    setIconOnly('rotate-ico-slot', 'surya', 38);
    setIconOnly('btn-open-museum', 'museum', 20);
    setIconOnly('btn-open-shop', 'toko', 20);
    setIconOnly('btn-open-rapor', 'rapor', 20);
    setIconOnly('btn-open-guru', 'guru', 20);
    setIconOnly('btn-open-settings', 'setelan', 20);
    setIconOnly('btn-hud-pause', 'jeda', 20);

    const setBtnWithText = (id, ico, text) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `${iconSVG(ico, 18)} <span>${text}</span>`;
    };

    setBtnWithText('btn-tap-to-start', 'main', 'Ketuk untuk Mulai');
    setBtnWithText('btn-beranda-open-belajar', 'buku', 'Buka Materi');
    setBtnWithText('btn-beranda-continue', 'main', 'Lanjutkan');
    setBtnWithText('btn-beranda-pick-stage', 'gapura', 'Pilih Stage');

    document.querySelectorAll('.ico-slot[data-ico]').forEach((slot) => {
      const name = slot.dataset.ico;
      const isBig = slot.closest('.big');
      slot.innerHTML = iconSVG(name, isBig ? 28 : 20);
    });
  }

  // Transisi Gerbang Bentar Membuka (Bagian 2.2)
  runWithGapuraTransition(switchFn) {
    const gate = document.getElementById('gapura-transition');
    this.audio.playGapuraTransition();
    if (!gate) {
      switchFn();
      return;
    }
    gate.classList.add('is-closed');
    setTimeout(() => {
      switchFn();
      setTimeout(() => {
        gate.classList.remove('is-closed');
      }, 90);
    }, 310);
  }

  _lockLandscapeAndFullscreen() {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    try {
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
    if (window.Capacitor?.Plugins?.ScreenOrientation) {
      try {
        window.Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (e) {}
    }
  }

  // Hapus / Reset Seluruh Data In-Game ke 0 & Kembali ke Halaman Pembuka ("Ketuk untuk Mulai")
  resetGameToZeroAndRestart() {
    clearInterval(this.gateTimerInterval);
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }

    this.storage.resetAllData();
    this.displayedGobog = 0;
    this.draftProfile = {
      nama: 'Arka',
      karakter: 'arka',
      senjata: 'keris'
    };

    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.add('hidden'));
    document.getElementById('gameplay-screen')?.classList.add('hidden');
    document.getElementById('menu-screen')?.classList.add('hidden');
    document.getElementById('setup-screen')?.classList.add('hidden');
    document.getElementById('intro-screen')?.classList.add('hidden');

    const heroImg = document.getElementById('loading-hero-img');
    if (heroImg) {
      heroImg.src = './public/assets/characters/arka_laras_front.png';
    }
    const statusText = document.getElementById('loading-status-text');
    if (statusText) {
      statusText.textContent = 'Data berhasil direset ke 0! Ketuk tombol di bawah untuk memulai dari awal.';
    }

    this.runWithGapuraTransition(() => {
      document.getElementById('loading-screen')?.classList.remove('hidden');
      document.getElementById('btn-tap-to-start')?.classList.remove('hidden');
      this._startLoadingDidYouKnowTicker();
    });
  }

  _bindUIEvents() {
    // Bunyi ketuk bonang/kenong gamelan pada semua tombol
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button, .choice-card, .weapon-choice-row, .stage-pick-card');
      if (btn) {
        this.audio.playGamelanClick(btn.classList.contains('btn--primary') ? 'kendang' : 'bonang');
      }
    });

    // Tombol Esc menutup kartu materi / modal non-ujian, namun TIDAK boleh melewati Gerbang Waktu!
    const nonDismissibleModals = new Set([
      'gerbang-waktu-modal',
      'cek-cepat-modal',
      'hasil-stage-modal',
      'epilog-modal'
    ]);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!document.getElementById('balai-belajar-modal')?.classList.contains('hidden')) {
          this.closeBalaiBelajarWithoutPenalty();
          return;
        }
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach((m) => {
          if (!nonDismissibleModals.has(m.id)) {
            m.classList.add('hidden');
          }
        });
        this._syncPhaserPauseState();
      }
    });

    // 0. Tombol Kunci Landscape Manual di Hint Layar & Interaksi Pertama
    document.getElementById('btn-force-landscape')?.addEventListener('click', () => {
      this._lockLandscapeAndFullscreen();
    });
    window.addEventListener('pointerdown', () => this._lockLandscapeAndFullscreen(), { once: true, passive: true });

    // 1. "Ketuk untuk Mulai" -> Buka Audio + Kunci Landscape + Lanjut ke Intro / Setup / Beranda
    document.getElementById('btn-tap-to-start')?.addEventListener('click', () => {
      this.audio.unlock();
      this._lockLandscapeAndFullscreen();
      clearInterval(this.loadingFactInterval);

      this.runWithGapuraTransition(() => {
        document.getElementById('loading-screen')?.classList.add('hidden');
        if (!this.storage.state.profile.introSeen) {
          this.openIntroSequence();
        } else if (!this.storage.state.profile.setupCompleted) {
          this.openSetupProfile();
        } else {
          this.showBeranda();
        }
      });
    });

    // 2. Navigasi Intro Netral & Tombol Lewati
    document.getElementById('btn-intro-next-slide')?.addEventListener('click', () => {
      if (this.introSlideIdx < INTRO_SLIDES.length - 1) {
        this.introSlideIdx++;
        this._renderIntroSlide();
      } else {
        this._finishIntroAndProceed();
      }
    });

    document.getElementById('btn-skip-intro')?.addEventListener('click', () => {
      this._finishIntroAndProceed();
    });

    // 3. Setup Profil: Nama -> Karakter -> Senjata
    const nameInp = document.getElementById('input-profile-name');
    if (nameInp) {
      nameInp.addEventListener('input', () => {
        this.draftProfile.nama = nameInp.value.slice(0, 16);
      });
    }

    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
      const inpVal = document.getElementById('input-profile-name')?.value.trim();
      const defaultCharName = this.draftProfile.karakter === 'laras' ? 'Laras' : 'Arka';
      this.storage.setProfile({
        nama: inpVal || defaultCharName,
        karakter: this.draftProfile.karakter,
        senjata: this.draftProfile.senjata,
        setupCompleted: true
      });
      this.runWithGapuraTransition(() => {
        document.getElementById('setup-screen')?.classList.add('hidden');
        this.showBeranda();
      });
    });

    // 4. Beranda: Ubah Profil, Reset Data, Kartu Balai Belajar, & Kartu Petualangan
    document.getElementById('btn-edit-name')?.addEventListener('click', () => {
      this.runWithGapuraTransition(() => {
        document.getElementById('menu-screen')?.classList.add('hidden');
        this.openSetupProfile();
      });
    });

    document.getElementById('btn-beranda-reset-data')?.addEventListener('click', () => {
      this.resetGameToZeroAndRestart();
    });

    document.getElementById('btn-setting-reset-data')?.addEventListener('click', () => {
      this.resetGameToZeroAndRestart();
    });

    document.getElementById('btn-beranda-open-belajar')?.addEventListener('click', () => {
      this.openStagePicker('belajar');
    });

    document.getElementById('btn-beranda-continue')?.addEventListener('click', () => {
      const targetId = this.storage.state.lastPlayedStage || 1;
      const st = this.stages.find((s) => s.id === targetId) || this.stages[0];
      const rec = this.storage.state.stageRecords[st.id];
      if (!rec?.studiedCards) {
        this.openStagePicker('petualangan', st.id);
      } else {
        this.runWithGapuraTransition(() => this.launchGameplayStage(st));
      }
    });

    document.getElementById('btn-beranda-pick-stage')?.addEventListener('click', () => {
      this.openStagePicker('petualangan');
    });

    // 5. Pemilih Stage: Toggle Mode & Aksi Utama
    document.querySelectorAll('[data-mode-select]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.storage.setMode(btn.dataset.modeSelect);
        this._syncStagePickerBottomBar();
      });
    });

    document.getElementById('btn-picker-secondary-learn')?.addEventListener('click', () => {
      if (!this.selectedPickerStage) return;
      document.getElementById('stage-picker-modal')?.classList.add('hidden');
      this.openBalaiBelajar(this.selectedPickerStage, {
        isInGameReference: false,
        returnToStagePicker: this.pickerContext === 'petualangan'
      });
    });

    document.getElementById('btn-picker-primary-action')?.addEventListener('click', () => {
      if (!this.selectedPickerStage) return;
      const st = this.selectedPickerStage;
      const isUnlocked = (this.storage.state.unlockedStages || [1]).includes(st.id);

      if (this.pickerContext === 'belajar') {
        document.getElementById('stage-picker-modal')?.classList.add('hidden');
        this.openBalaiBelajar(st, { isInGameReference: false, returnToStagePicker: false });
        return;
      }

      if (!isUnlocked) return;
      const rec = this.storage.state.stageRecords[st.id];
      // Aturan Bagian 3: Jika materi stage belum dibaca, tombol primer = "Baca Materi Dulu"
      if (!rec?.studiedCards) {
        document.getElementById('stage-picker-modal')?.classList.add('hidden');
        this.openBalaiBelajar(st, { isInGameReference: false, returnToStagePicker: true });
      } else {
        document.getElementById('stage-picker-modal')?.classList.add('hidden');
        this.runWithGapuraTransition(() => this.launchGameplayStage(st));
      }
    });

    // 6. Tombol Pojok Kanan Atas Beranda (Museum, Toko, Rapor, Info Guru, Setelan)
    document.getElementById('btn-open-museum')?.addEventListener('click', () => {
      this._renderMuseumModal();
      this.showModal('museum-modal');
    });
    document.getElementById('btn-open-shop')?.addEventListener('click', () => {
      this._renderShopModal();
      this.showModal('shop-modal');
    });
    document.getElementById('btn-open-rapor')?.addEventListener('click', () => {
      this._renderRaporModal();
      this.showModal('rapor-modal');
    });
    document.getElementById('btn-open-guru')?.addEventListener('click', () => {
      this._renderGuruModal();
      this.showModal('guru-modal');
    });
    document.getElementById('btn-open-settings')?.addEventListener('click', () => {
      this._renderSettingsModal();
      this.showModal('settings-modal');
    });
    document.getElementById('btn-download-rapor-png')?.addEventListener('click', () => {
      downloadRaporPNG(this.storage, this.stages, this.artifacts, this.cards);
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.closeModal)?.classList.add('hidden');
        this._syncPhaserPauseState();
      });
    });

    // Ketuk di luar kartu pada modal-overlay menutup modal (kecuali modal Gerbang Waktu/Hasil)
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay && !nonDismissibleModals.has(overlay.id)) {
          if (overlay.id === 'balai-belajar-modal') {
            this.closeBalaiBelajarWithoutPenalty();
          } else {
            overlay.classList.add('hidden');
            this._syncPhaserPauseState();
          }
        }
      });
    });

    // 7. Kartu Materi Lontar + Tombol Silang X (Bagian 4.4)
    document.getElementById('btn-close-balai-x')?.addEventListener('click', () => {
      this.closeBalaiBelajarWithoutPenalty();
    });

    document.getElementById('btn-card-prev')?.addEventListener('click', () => {
      if (this.studyCardIndex > 0) {
        this.studyCardIndex--;
        this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
        this._renderCurrentStudyCard();
      }
    });

    document.getElementById('btn-card-next')?.addEventListener('click', () => {
      if (this.studyCardIndex < this.activeStageCards.length - 1) {
        this.studyCardIndex++;
        this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
        this._renderCurrentStudyCard();
      } else {
        this.storage.markStageStudied(this.activeStage.id);
        document.getElementById('balai-belajar-modal')?.classList.add('hidden');
        this._syncPhaserPauseState();
        this.renderMainMenu();

        if (this.balaiOptions.isInGameReference) {
          return;
        }
        if (this.balaiOptions.returnToStagePicker) {
          this.openStagePicker('petualangan', this.activeStage.id);
        } else {
          this.openStagePicker('belajar', this.activeStage.id);
        }
      }
    });

    this._bindBalaiSwipe();
    this._bindDPad8Way();
    this._bindCombatClusterButtons();

    // Balon Dialog NPC & Menu Jeda
    document.getElementById('npc-dialog-balloon')?.addEventListener('click', () => {
      document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
    });

    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      this._renderPauseModal();
      this.showModal('pause-modal');
    });

    document.getElementById('btn-pause-jamu')?.addEventListener('click', () => {
      const scene = this._getActiveScene();
      if (!scene) return;
      if (this.storage.state.shop.jamuCount <= 0) {
        this.showNpcBalloon('Mahapatih Gajah Mada', 'Persediaan Jamu Tirta sudah habis. Tukarkan Gobog di Toko terlebih dahulu.');
        document.getElementById('pause-modal')?.classList.add('hidden');
        this._syncPhaserPauseState();
        return;
      }
      this.storage.state.shop.jamuCount--;
      this.storage.save();
      scene.hp = Math.min(scene.maxHp, scene.hp + this.balance.shop.jamuHealAmount);
      scene._syncHUD();
      this.audio.playQuizFeedback(true);
      document.getElementById('pause-modal')?.classList.add('hidden');
      this._syncPhaserPauseState();
      const pChar = this.storage.state.profile.karakter === 'laras' ? 'laras' : 'arka';
      const pWeap = ['keris', 'panah', 'tombak'].includes(this.storage.state.profile.senjata)
        ? this.storage.state.profile.senjata
        : 'keris';
      const heroSprite = `./public/assets/characters/${pChar}_${pWeap}.png`;
      this.showNpcBalloon(
        this.storage.state.profile.nama,
        `Segar kembali! Jamu Tirta memulihkan +${this.balance.shop.jamuHealAmount} HP.`,
        heroSprite
      );
    });

    document.getElementById('btn-pause-cards')?.addEventListener('click', () => {
      document.getElementById('pause-modal')?.classList.add('hidden');
      if (this.activeStage) {
        this.openBalaiBelajar(this.activeStage, { isInGameReference: true, returnToStagePicker: false });
      }
    });

    document.getElementById('btn-pause-audio')?.addEventListener('click', () => {
      this.audio.toggleMute();
      this._renderPauseModal();
    });

    document.getElementById('btn-pause-exit')?.addEventListener('click', () => {
      document.getElementById('pause-modal')?.classList.add('hidden');
      this.stopGameplayAndReturnMenu();
    });

    document.getElementById('btn-result-menu')?.addEventListener('click', () => {
      document.getElementById('hasil-stage-modal')?.classList.add('hidden');
      if (this.activeStage?.id === 4 && this.lastStageClearedSuccess) {
        this.showModal('epilog-modal');
      } else {
        this.stopGameplayAndReturnMenu();
      }
    });

    document.getElementById('btn-epilog-rapor')?.addEventListener('click', () => {
      document.getElementById('epilog-modal')?.classList.add('hidden');
      this.stopGameplayAndReturnMenu();
      setTimeout(() => {
        this._renderRaporModal();
        this.showModal('rapor-modal');
      }, 360);
    });

    document.getElementById('btn-epilog-beranda')?.addEventListener('click', () => {
      document.getElementById('epilog-modal')?.classList.add('hidden');
      this.stopGameplayAndReturnMenu();
    });

    // Tombol di dalam Modal Setelan (⚙)
    document.getElementById('btn-setting-audio')?.addEventListener('click', () => {
      this.audio.toggleMute();
      this._renderSettingsModal();
    });
    document.getElementById('btn-setting-jump-up')?.addEventListener('click', () => {
      const next = !this.storage.state.settings.jumpOnUp;
      this.storage.setSetting('jumpOnUp', next);
      this._renderSettingsModal();
    });
    document.getElementById('btn-setting-fx')?.addEventListener('click', () => {
      const next = this.storage.state.settings.visualEffects === 'penuh' ? 'hemat' : 'penuh';
      this.storage.setSetting('visualEffects', next);
      this._renderSettingsModal();
    });
  }

  // ==========================================================================
  // 2. INTRO NETRAL (Video MP4 dengan Fallback Storyboard Netral + Tombol Lewati)
  // ==========================================================================
  openIntroSequence() {
    this._lockLandscapeAndFullscreen();
    document.getElementById('intro-screen')?.classList.remove('hidden');
    this.introSlideIdx = 0;
    this._renderIntroSlide();

    // Tampilkan tombol Lewati setelah 1 detik (Bagian 2.3)
    const skipBtn = document.getElementById('btn-skip-intro');
    skipBtn?.classList.add('hidden');
    setTimeout(() => {
      skipBtn?.classList.remove('hidden');
    }, 1000);

    // Coba putar video MP4 bila tersedia; bila tidak ada, tetap di Storyboard Netral
    const videoEl = document.getElementById('intro-video-el');
    if (videoEl) {
      videoEl.src = './public/assets/video/intro.mp4';
      videoEl.onloadeddata = () => {
        document.getElementById('intro-storyboard-box')?.classList.add('hidden');
        videoEl.classList.remove('hidden');
        videoEl.play().catch(() => {});
      };
      videoEl.onended = () => this._finishIntroAndProceed();
      videoEl.onerror = () => {
        videoEl.classList.add('hidden');
        document.getElementById('intro-storyboard-box')?.classList.remove('hidden');
      };
    }
  }

  _renderIntroSlide() {
    const slide = INTRO_SLIDES[this.introSlideIdx] || INTRO_SLIDES[0];
    const orb = document.getElementById('intro-orb-icon');
    if (orb) orb.innerHTML = iconSVG(slide.icon, 34);
    const badge = document.getElementById('intro-step-badge');
    if (badge) badge.textContent = `${slide.badge} (${this.introSlideIdx + 1}/${INTRO_SLIDES.length})`;
    const title = document.getElementById('intro-step-title');
    if (title) title.textContent = slide.title;
    const desc = document.getElementById('intro-step-desc');
    if (desc) desc.textContent = slide.desc;

    const nextBtn = document.getElementById('btn-intro-next-slide');
    if (nextBtn) {
      nextBtn.textContent =
        this.introSlideIdx === INTRO_SLIDES.length - 1 ? 'Mulai Persiapan Pendekar ▸' : 'Lanjut Cerita ▸';
    }
  }

  _finishIntroAndProceed() {
    this.storage.setIntroSeen(true);
    const videoEl = document.getElementById('intro-video-el');
    if (videoEl) {
      try {
        videoEl.pause();
      } catch (e) {}
    }
    this.runWithGapuraTransition(() => {
      document.getElementById('intro-screen')?.classList.add('hidden');
      if (!this.storage.state.profile.setupCompleted) {
        this.openSetupProfile();
      } else {
        this.showBeranda();
      }
    });
  }

  // ==========================================================================
  // 3. SETUP PROFIL: NAMA -> KARAKTER (ARKA / LARAS) -> SENJATA (KERIS / PANAH / TOMBAK)
  // ==========================================================================
  openSetupProfile() {
    const p = this.storage.state.profile;
    this.draftProfile = {
      nama: p.nama || 'Arka',
      karakter: p.karakter || 'arka',
      senjata: p.senjata || 'keris'
    };

    document.getElementById('setup-screen')?.classList.remove('hidden');
    this._renderSetupProfileChoices();
  }

  _renderSetupProfileChoices() {
    const nameInput = document.getElementById('input-profile-name');
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = this.draftProfile.nama;
    }

    const charGrid = document.getElementById('setup-characters-grid');
    if (charGrid) {
      charGrid.innerHTML = this.characters
        .map((ch) => {
          const isSel = this.draftProfile.karakter === ch.id;
          const charSpriteWithWeap = (ch.spritesByWeapon && ch.spritesByWeapon[this.draftProfile.senjata])
            ? ch.spritesByWeapon[this.draftProfile.senjata]
            : (ch.spritesByWeapon?.keris || ch.sprite);
          return `
            <div class="choice-card ${isSel ? 'is-selected' : ''}" data-pick-char="${ch.id}">
              <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;height:98px;">
                <img src="${charSpriteWithWeap}" alt="${ch.defaultName}" style="max-height:94px;width:auto;object-fit:contain;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));" />
              </div>
              <h4>${ch.defaultName}</h4>
              <small>${ch.roleTitle}</small>
            </div>
          `;
        })
        .join('');

      charGrid.querySelectorAll('[data-pick-char]').forEach((card) => {
        card.addEventListener('click', () => {
          const pickedId = card.dataset.pickChar;
          const prevChar = this.draftProfile.karakter;
          this.draftProfile.karakter = pickedId;
          // Sesuaikan nama bawaan bila masih memakai nama default
          if (
            !this.draftProfile.nama ||
            this.draftProfile.nama === 'Arka' ||
            this.draftProfile.nama === 'Laras' ||
            prevChar !== pickedId
          ) {
            const currentInputVal = document.getElementById('input-profile-name')?.value.trim();
            if (!currentInputVal || currentInputVal === 'Arka' || currentInputVal === 'Laras') {
              this.draftProfile.nama = pickedId === 'laras' ? 'Laras' : 'Arka';
            }
          }
          this._renderSetupProfileChoices();
        });
      });
    }

    const weapList = document.getElementById('setup-weapons-list');
    if (weapList) {
      weapList.innerHTML = this.weapons
        .map((w) => {
          const isSel = this.draftProfile.senjata === w.id;
          return `
            <div class="weapon-choice-row ${isSel ? 'is-selected' : ''}" data-pick-weapon="${w.id}">
              <div class="weapon-ico-box">${iconSVG(w.icon, 22)}</div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font:800 0.9rem var(--font-display);color:var(--lontar);">${w.name}</strong>
                  <span style="font-size:0.72rem;font-weight:800;color:var(--emas-light);">${w.styleLabel}</span>
                </div>
                <div style="font-size:0.75rem;color:#d9c7a3;line-height:1.25;margin-top:2px;">
                  ${w.description}
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      weapList.querySelectorAll('[data-pick-weapon]').forEach((row) => {
        row.addEventListener('click', () => {
          this.draftProfile.senjata = row.dataset.pickWeapon;
          this._renderSetupProfileChoices();
        });
      });
    }
  }

  // ==========================================================================
  // 4. BERANDA BARU (Karakter Terpilih di Kiri + 2 Kartu Berbeda di Kanan)
  // ==========================================================================
  showBeranda() {
    document.getElementById('loading-screen')?.classList.add('hidden');
    document.getElementById('intro-screen')?.classList.add('hidden');
    document.getElementById('setup-screen')?.classList.add('hidden');
    document.getElementById('menu-screen')?.classList.remove('hidden');
    this.renderMainMenu();
  }

  renderMainMenu() {
    const st = this.storage.state;
    const profile = st.profile;

    const nameEl = document.getElementById('display-player-name');
    if (nameEl) nameEl.textContent = profile.nama || st.playerName || 'Arka';

    const charKey = profile.karakter === 'laras' ? 'laras' : 'arka';
    const validWeaps = ['keris', 'panah', 'tombak'];
    const weapKey = validWeaps.includes(profile.senjata) ? profile.senjata : 'keris';
    const heroImg = document.getElementById('beranda-hero-img');
    if (heroImg) {
      heroImg.src = `./public/assets/characters/${charKey}_${weapKey}.png`;
    }

    const weapObj = this.weapons.find((w) => w.id === profile.senjata) ||
      this.weapons[0] || { name: 'Keris', icon: 'keris' };
    const weapChip = document.getElementById('beranda-weapon-chip');
    if (weapChip) {
      weapChip.innerHTML = `${iconSVG(weapObj.icon, 15)} <span>${weapObj.name.split(' ')[0]}</span>`;
    }

    const gobogStat = document.getElementById('menu-gobog-stat');
    if (gobogStat) {
      gobogStat.innerHTML = `${iconSVG('gobog', 16)} <span>${st.gobogCoins} Gobog</span>`;
    }
    const artStat = document.getElementById('menu-art-stat');
    if (artStat) {
      artStat.innerHTML = `${iconSVG('artefak', 16)} <span>${st.collectedArtifacts.length}/${this.artifacts.length} Artefak</span>`;
    }

    // Kartu 1: Balai Belajar (Lontar)
    const studiedCount = this.stages.filter((s) => st.stageRecords[s.id]?.studiedCards).length;
    const materiStatus = document.getElementById('beranda-materi-status');
    if (materiStatus) {
      materiStatus.textContent = `${studiedCount} / ${this.stages.length} materi selesai`;
    }

    // Kartu 2: Petualangan (Bata)
    const lastStageId = st.lastPlayedStage || 1;
    const lastRec = st.stageRecords[lastStageId] || { stars: 0, bestAccuracy: 0 };
    const lastStageChip = document.getElementById('beranda-last-stage-chip');
    if (lastStageChip) {
      lastStageChip.innerHTML = `${starPairSVG(lastRec.stars, 3, 15)} <span>Stage ${lastStageId}</span>`;
    }
    const lastAccChip = document.getElementById('beranda-last-acc-chip');
    if (lastAccChip) {
      lastAccChip.textContent = `Akurasi ${lastRec.bestAccuracy || 0}%`;
    }
  }

  // ==========================================================================
  // 5. PEMILIH STAGE (Layar Penuh Horizontal + Logika "Baca Materi Dulu")
  // ==========================================================================
  openStagePicker(context = 'petualangan', initialStageId = null) {
    this.pickerContext = context;
    const targetId = initialStageId || this.storage.state.lastPlayedStage || 1;
    this.selectedPickerStage = this.stages.find((s) => s.id === Number(targetId)) || this.stages[0];

    const titleHead = document.getElementById('picker-title-head');
    const subText = document.getElementById('picker-subtitle-text');
    if (context === 'belajar') {
      if (titleHead) titleHead.textContent = 'BALAI BELAJAR — PILIH STAGE MATERI';
      if (subText) subText.textContent = 'Pilih stage untuk membaca kartu lontar sejarah Majapahit.';
    } else {
      if (titleHead) titleHead.textContent = 'PETUALANGAN — PILIH STAGE PERJALANAN';
      if (subText) subText.textContent = 'Baca materi lontar terlebih dahulu sebelum memasuki pertarungan stage.';
    }

    this._renderStagePickerCards();
    this._syncStagePickerBottomBar();
    this.showModal('stage-picker-modal');
  }

  _renderStagePickerCards() {
    const strip = document.getElementById('stage-picker-cards');
    if (!strip) return;

    const st = this.storage.state;
    const unlockedList = st.unlockedStages || [1, 2];

    strip.innerHTML = this.stages
      .map((stage) => {
        const isUnlocked = unlockedList.includes(stage.id);
        const isSelected = this.selectedPickerStage?.id === stage.id;
        const rec = st.stageRecords[stage.id] || { stars: 0, bestAccuracy: 0, studiedCards: false };
        const bgUrl = STAGE_BG_MAP[stage.id] || STAGE_BG_MAP[1];

        return `
          <div
            class="stage-pick-card ${isSelected ? 'is-selected' : ''} ${!isUnlocked && this.pickerContext === 'petualangan' ? 'is-locked' : ''}"
            data-picker-stage="${stage.id}"
          >
            <div class="stage-pick-art" style="background-image:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.7)),url('${bgUrl}');">
              <span class="chip" style="padding:3px 8px;font-size:0.72rem;">Stage ${stage.id}</span>
              <span class="chip" style="padding:3px 8px;font-size:0.72rem;">
                ${isUnlocked ? starPairSVG(rec.stars, 3, 12) : iconSVG('gembok', 14)}
              </span>
            </div>
            <div class="stage-pick-body">
              <div>
                <h4>${stage.subtitle}</h4>
                <div class="stage-pick-env">${stage.environment}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.74rem;font-weight:800;margin-top:4px;">
                <span style="color:${rec.studiedCards ? '#8ce99a' : 'var(--emas-light)'};">
                  ${rec.studiedCards ? '✓ Materi Selesai' : '• Belum Dibaca'}
                </span>
                <span>${rec.bestAccuracy || 0}%</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    strip.querySelectorAll('[data-picker-stage]').forEach((card) => {
      card.addEventListener('click', () => {
        const sid = Number(card.dataset.pickerStage);
        const found = this.stages.find((s) => s.id === sid);
        if (!found) return;
        this.selectedPickerStage = found;
        this._renderStagePickerCards();
        this._syncStagePickerBottomBar();

        if (this.pickerContext === 'belajar') {
          document.getElementById('stage-picker-modal')?.classList.add('hidden');
          this.openBalaiBelajar(found, { isInGameReference: false, returnToStagePicker: false });
        }
      });
    });
  }

  _syncStagePickerBottomBar() {
    const mode = this.storage.state.gameMode;
    document.querySelectorAll('[data-mode-select]').forEach((chip) => {
      const active = chip.dataset.modeSelect === mode;
      chip.style.borderColor = active ? 'var(--emas-light)' : '#9c8f7c';
      chip.style.color = active ? 'var(--emas-light)' : '#f3e7d0';
    });

    const stage = this.selectedPickerStage || this.stages[0];
    const isUnlocked = (this.storage.state.unlockedStages || [1, 2]).includes(stage.id);
    const rec = this.storage.state.stageRecords[stage.id] || { studiedCards: false };

    const secBtn = document.getElementById('btn-picker-secondary-learn');
    const priBtn = document.getElementById('btn-picker-primary-action');

    if (this.pickerContext === 'belajar') {
      secBtn?.classList.add('hidden');
      if (priBtn) {
        priBtn.disabled = false;
        priBtn.className = 'btn btn--lontar';
        priBtn.innerHTML = `${iconSVG('buku', 18)} <span>Buka Kartu Stage ${stage.id}</span>`;
      }
      return;
    }

    // Mode Petualangan:
    if (!isUnlocked) {
      secBtn?.classList.remove('hidden');
      if (secBtn) secBtn.innerHTML = `${iconSVG('buku', 16)} <span>Baca Materi</span>`;
      if (priBtn) {
        priBtn.disabled = true;
        priBtn.className = 'btn';
        priBtn.innerHTML = `${iconSVG('gembok', 18)} <span>Stage Terkunci</span>`;
      }
    } else if (!rec.studiedCards) {
      // Bagian 3: Jika materi stage belum dibaca, tombol primer berubah menjadi "Baca Materi Dulu"
      secBtn?.classList.add('hidden');
      if (priBtn) {
        priBtn.disabled = false;
        priBtn.className = 'btn btn--lontar';
        priBtn.innerHTML = `${iconSVG('buku', 18)} <span>Baca Materi Dulu (Stage ${stage.id})</span>`;
      }
    } else {
      secBtn?.classList.remove('hidden');
      if (secBtn) secBtn.innerHTML = `${iconSVG('buku', 16)} <span>Ulang Materi</span>`;
      if (priBtn) {
        priBtn.disabled = false;
        priBtn.className = 'btn btn--primary';
        priBtn.innerHTML = `${iconSVG('main', 18)} <span>Main Stage ${stage.id}</span>`;
      }
    }
  }

  // ==========================================================================
  // 6. KARTU MATERI LONTAR + TOMBOL SILANG X (Menutup Tidak Menghukum — Bagian 4.4)
  // ==========================================================================
  openBalaiBelajar(stageObj, options = {}, targetCardId = null) {
    this.activeStage = stageObj;
    this.balaiOptions = {
      isInGameReference: Boolean(options.isInGameReference),
      returnToStagePicker: Boolean(options.returnToStagePicker)
    };
    this.activeStageCards = this.cards.filter((c) => c.stage === stageObj.id);

    const savedIdx = this.storage.state.stageRecords[stageObj.id]?.lastCardIndex || 0;
    this.studyCardIndex = Math.min(savedIdx, Math.max(0, this.activeStageCards.length - 1));

    if (targetCardId) {
      const idx = this.activeStageCards.findIndex((c) => c.id === targetCardId);
      if (idx >= 0) this.studyCardIndex = idx;
    }

    this._renderCurrentStudyCard();
    this.showModal('balai-belajar-modal');
  }

  closeBalaiBelajarWithoutPenalty() {
    if (this.activeStage) {
      this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
    }
    document.getElementById('balai-belajar-modal')?.classList.add('hidden');
    this._syncPhaserPauseState();
  }

  _renderCurrentStudyCard() {
    const card = this.activeStageCards[this.studyCardIndex];
    if (!card) return;

    const headEl = document.getElementById('balai-stage-title');
    if (headEl) {
      headEl.textContent = `Balai Belajar · Stage ${this.activeStage.id} (${this.activeStage.subtitle}) · Kartu ${this.studyCardIndex + 1}/${this.activeStageCards.length}`;
    }

    const bgImg = document.getElementById('balai-bg-img');
    const bgSrc = card.bgPreview || card.bgImg || STAGE_BG_MAP[this.activeStage?.id] || STAGE_BG_MAP[1];
    if (bgImg && bgSrc) bgImg.src = bgSrc;

    const fgImg = document.getElementById('balai-fg-img');
    if (fgImg && card.illustrationImg) fgImg.src = card.illustrationImg;

    document.getElementById('card-title-text').textContent = card.title;
    // Gunakan <mark> sesuai bata-ui.css (.card-lontar mark)
    const formatted = card.text.replace(/\*\*(.*?)\*\*/g, '<mark>$1</mark>');
    document.getElementById('card-body-text').innerHTML = formatted;
    document.getElementById('card-keyword-pill').textContent = `Kata kunci: ${card.keyword}`;

    const dotsBox = document.getElementById('balai-progress-dots');
    if (dotsBox) {
      dotsBox.innerHTML = this.activeStageCards
        .map((_, idx) => `<i class="${idx === this.studyCardIndex ? 'on' : ''}" data-dot-idx="${idx}" style="cursor:pointer;"></i>`)
        .join('');
      dotsBox.querySelectorAll('[data-dot-idx]').forEach((dot) => {
        dot.addEventListener('click', () => {
          this.studyCardIndex = Number(dot.dataset.dotIdx);
          this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
          this._renderCurrentStudyCard();
        });
      });
    }

    const prevBtn = document.getElementById('btn-card-prev');
    if (prevBtn) prevBtn.style.visibility = this.studyCardIndex > 0 ? 'visible' : 'hidden';

    const nextBtn = document.getElementById('btn-card-next');
    if (nextBtn) {
      const isLast = this.studyCardIndex === this.activeStageCards.length - 1;
      nextBtn.textContent = isLast
        ? this.balaiOptions.returnToStagePicker
          ? 'Selesai & Siap Main ▶'
          : 'Selesai Baca ▶'
        : 'Berikutnya ▶';
    }
  }

  _bindBalaiSwipe() {
    const swipeArea = document.getElementById('balai-swipe-area');
    if (!swipeArea) return;
    let startX = 0;
    swipeArea.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
    });
    swipeArea.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 45) {
        if (dx < 0 && this.studyCardIndex < this.activeStageCards.length - 1) {
          this.studyCardIndex++;
          this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
          this._renderCurrentStudyCard();
        } else if (dx > 0 && this.studyCardIndex > 0) {
          this.studyCardIndex--;
          this.storage.saveLastCardIndex(this.activeStage.id, this.studyCardIndex);
          this._renderCurrentStudyCard();
        }
      }
    });
  }

  // ==========================================================================
  // 7. KONTROL MOBILE BARU: KIRI = JALAN KIRI/KANAN, KANAN = LONCAT & NUNDUK + AKSI
  // ==========================================================================
  _bindDPad8Way() {
    const lrPad = document.getElementById('move-lr-touch-area') || document.getElementById('dpad-touch-area');
    const btnLeft = document.getElementById('dpad-left');
    const btnRight = document.getElementById('dpad-right');
    if (!lrPad) return;

    let activePointerId = null;

    const setLeftRight = (l, r) => {
      btnLeft?.classList.toggle('is-pressed', l);
      btnRight?.classList.toggle('is-pressed', r);

      const scene = this._getActiveScene();
      if (scene) {
        scene.touchInput.left = l;
        scene.touchInput.right = r;
        scene.touchInput.axisX = l ? -1 : r ? 1 : 0;
      }
    };

    const updateFromPointer = (clientX) => {
      const rect = lrPad.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (clientX < midX - 4) {
        setLeftRight(true, false);
      } else if (clientX > midX + 4) {
        setLeftRight(false, true);
      } else {
        setLeftRight(false, false);
      }
    };

    lrPad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      activePointerId = e.pointerId;
      try {
        lrPad.setPointerCapture(e.pointerId);
      } catch (err) {}
      updateFromPointer(e.clientX);
    });

    lrPad.addEventListener('pointermove', (e) => {
      if (e.pointerId !== activePointerId) return;
      updateFromPointer(e.clientX);
    });

    const resetLR = () => {
      activePointerId = null;
      setLeftRight(false, false);
    };

    lrPad.addEventListener('pointerup', resetLR);
    lrPad.addEventListener('pointercancel', resetLR);
  }

  _bindCombatClusterButtons() {
    const bindTap = (btnId, action) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.audio.unlock();
        action();
      });
    };

    bindTap('touch-punch', () => this._getActiveScene()?.performBasicPunch());
    bindTap('touch-jump', () => this._getActiveScene()?.performJump());
    bindTap('touch-skill1', () => this._getActiveScene()?.performSkill1Surya());
    bindTap('touch-skill2', () => this._getActiveScene()?.performSkill2Keris());
    bindTap('touch-dash', () => this._getActiveScene()?.performDash());
    bindTap('touch-ult', () => this._getActiveScene()?.performUltimatePalapa());

    // Tombol NUNDUK (Crouch ▼) di sisi kanan: tahan untuk nunduk merendah!
    const crouchBtn = document.getElementById('touch-crouch');
    if (crouchBtn) {
      const setCrouch = (isDown) => {
        crouchBtn.classList.toggle('is-pressed', isDown);
        const scene = this._getActiveScene();
        if (scene) {
          scene.touchInput.down = isDown;
        }
      };

      crouchBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.audio.unlock();
        try {
          crouchBtn.setPointerCapture(e.pointerId);
        } catch (err) {}
        setCrouch(true);
      });
      crouchBtn.addEventListener('pointerup', () => setCrouch(false));
      crouchBtn.addEventListener('pointercancel', () => setCrouch(false));
      crouchBtn.addEventListener('pointerleave', () => setCrouch(false));
    }
  }

  _getActiveScene() {
    return this.phaserGame?.scene?.getScene('PlatformerScene');
  }

  _syncPhaserPauseState() {
    const scene = this._getActiveScene();
    if (!scene || !scene.scene) return;

    const blockingModalIds = [
      'pause-modal',
      'balai-belajar-modal',
      'settings-modal',
      'gerbang-waktu-modal',
      'cek-cepat-modal',
      'hasil-stage-modal',
      'epilog-modal'
    ];
    const anyOpen = blockingModalIds.some((id) => {
      const el = document.getElementById(id);
      return el && !el.classList.contains('hidden');
    });

    try {
      if (anyOpen && !scene.scene.isPaused()) {
        scene.scene.pause();
      } else if (!anyOpen && scene.scene.isPaused()) {
        scene.scene.resume();
      }
    } catch (e) {}
  }

  // ==========================================================================
  // 8. GAMEPLAY STAGE (HUD Ramping + Senjata Terpilih + Counter Panah + Balon Dialog)
  // ==========================================================================
  launchGameplayStage(stageObj) {
    this.activeStage = stageObj;
    this.storage.setLastPlayedStage(stageObj.id);

    document.getElementById('loading-screen')?.classList.add('hidden');
    document.getElementById('menu-screen')?.classList.add('hidden');
    document.getElementById('gameplay-screen')?.classList.remove('hidden');
    document.getElementById('boss-question-banner')?.classList.add('hidden');

    // Sesuaikan ikon & label senjata di HUD dengan pilihan pemain
    const weapId = this.storage.state.profile.senjata || 'keris';
    const weapObj = this.weapons.find((w) => w.id === weapId) || { name: 'Keris', icon: 'keris', skill2Name: 'Gelombang Keris' };
    const weapLabel = document.getElementById('hud-weapon-label');
    if (weapLabel) weapLabel.textContent = weapObj.name.split(' ')[0];
    const atkIco = document.getElementById('hud-attack-ico');
    if (atkIco) atkIco.innerHTML = iconSVG(weapObj.icon, 28);
    const s2Slot = document.querySelector('#touch-skill2 .ico-slot');
    if (s2Slot) s2Slot.innerHTML = iconSVG(weapObj.icon, 20);
    const s2Btn = document.getElementById('touch-skill2');
    if (s2Btn) s2Btn.title = `${weapObj.skill2Name || 'Jurus Senjata'} [L]`;

    const arrowChip = document.getElementById('hud-arrow-counter');
    if (arrowChip) {
      arrowChip.classList.toggle('hidden', weapId !== 'panah');
    }

    const splash = document.getElementById('stage-intro-splash');
    if (splash) {
      splash.textContent = `${stageObj.title} — ${stageObj.subtitle}`;
      splash.classList.remove('hidden');
      clearTimeout(this._splashTimeout);
      this._splashTimeout = setTimeout(() => splash.classList.add('hidden'), 2000);
    }

    const personalizedIntro = (stageObj.npcDialogIntro || '').replace(/Arka/g, this.storage.state.profile.nama);
    this.showNpcBalloon(
      stageObj.npcName || 'Mahapatih Gajah Mada',
      personalizedIntro,
      './public/assets/characters/npc_gajah_mada.png'
    );

    this.audio.startGamelanLoop();

    const stageArtifacts = this.artifacts.filter((a) => a.stage === stageObj.id);

    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }

    const config = {
      type: window.Phaser.AUTO,
      parent: 'phaser-game-container',
      width: 1280,
      height: 720,
      scale: {
        mode: window.Phaser.Scale.FIT,
        autoCenter: window.Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [PlatformerScene]
    };

    this.phaserGame = new window.Phaser.Game(config);
    this.phaserGame.scene.start('PlatformerScene', {
      stageConfig: stageObj,
      balance: this.balance,
      artifactsList: stageArtifacts,
      storage: this.storage,
      audioSys: this.audio,
      callbacks: {
        onHUDUpdate: (hudState) => this._updateGameplayHUD(hudState),
        onNPCDialog: (dlg) =>
          this.showNpcBalloon(
            dlg.speaker || stageObj.npcName || 'Mahapatih Gajah Mada',
            (dlg.text || '').replace(/Arka/g, this.storage.state.profile.nama),
            dlg.portrait || './public/assets/characters/npc_gajah_mada.png'
          ),
        onBossShieldQuestion: (qObj, pillarChoices) => this._updateBossQuestionBanner(qObj, pillarChoices),
        onBannerMessage: (msg) =>
          this.showNpcBalloon(
            stageObj.npcName || 'Mahapatih Gajah Mada',
            msg.replace(/Arka/g, this.storage.state.profile.nama)
          ),
        onReachTimeGate: (runData) => this.openGerbangWaktu(runData),
        getWeightedBossQuestion: () => {
          const picked = this.storage.getWeightedBossQuestions(this.questions, 1);
          return picked[0] || this.questions[0];
        }
      }
    });
  }

  _updateBossQuestionBanner(qObj, pillarChoices) {
    const banner = document.getElementById('boss-question-banner');
    if (!banner) return;
    if (!qObj) {
      banner.classList.add('hidden');
      return;
    }
    const labels = ['A', 'B', 'C'];
    const optsSummary = Array.isArray(pillarChoices)
      ? pillarChoices.map((c, idx) => `[Pilar ${labels[idx]}] ${c.text}`).join('  ·  ')
      : '';
    banner.innerHTML = `
      <div style="color:var(--emas-light);font-size:0.74rem;text-transform:uppercase;letter-spacing:0.04em;">
        Ujian Perisai Kala — Pukul Pilar Prasasti yang Tepat!
      </div>
      <div style="margin-top:2px;">${qObj.prompt}</div>
      ${optsSummary ? `<div style="font-size:0.75rem;color:#e6d2aa;margin-top:3px;">${optsSummary}</div>` : ''}
    `;
    banner.classList.remove('hidden');
  }

  _updateGameplayHUD(st) {
    const hpFill = document.getElementById('hud-hp-bar');
    if (hpFill) hpFill.style.width = `${Math.max(0, (st.hp / st.maxHp) * 100)}%`;
    const hpText = document.getElementById('hud-hp-text');
    if (hpText) hpText.textContent = `${st.hp}/${st.maxHp}`;

    const enFill = document.getElementById('hud-energy-bar');
    if (enFill) enFill.style.width = `${Math.max(0, Math.min(100, st.energy || 0))}%`;

    this._animateGobogCounter(st.gobog);

    const artCounter = document.getElementById('hud-art-counter');
    if (artCounter) {
      artCounter.innerHTML = `${iconSVG('artefak', 15)} <span>${st.artifactsCount}/3</span>`;
    }

    // Counter Anak Panah Terbatas (Khusus Senjata Panah)
    const arrowChip = document.getElementById('hud-arrow-counter');
    if (arrowChip) {
      const activeWeap = st.weapon || this.storage.state.profile.senjata;
      if (activeWeap === 'panah') {
        arrowChip.classList.remove('hidden');
        const arrNow = st.arrows ?? 15;
        const arrMax = st.maxArrows ?? 15;
        const lowColor = arrNow <= 3 ? '#ff8787' : 'var(--emas-light)';
        arrowChip.innerHTML = `${iconSVG('panah', 15)} <span style="color:${lowColor};">Panah: ${arrNow}/${arrMax}</span>`;
      } else {
        arrowChip.classList.add('hidden');
      }
    }

    const ultBtn = document.getElementById('touch-ult');
    if (ultBtn) {
      ultBtn.classList.toggle('hidden', (st.energy || 0) < 100);
    }
  }

  _animateGobogCounter(targetGobog) {
    const el = document.getElementById('hud-gobog-counter');
    if (!el) return;

    if (this.displayedGobog === targetGobog) {
      el.innerHTML = `${iconSVG('gobog', 15)} <span>${targetGobog}</span>`;
      return;
    }

    cancelAnimationFrame(this.gobogAnimFrame);
    const step = () => {
      if (this.displayedGobog < targetGobog) {
        this.displayedGobog = Math.min(
          targetGobog,
          this.displayedGobog + Math.ceil((targetGobog - this.displayedGobog) / 4)
        );
      } else if (this.displayedGobog > targetGobog) {
        this.displayedGobog = targetGobog;
      }
      el.innerHTML = `${iconSVG('gobog', 15)} <span>${this.displayedGobog}</span>`;
      if (this.displayedGobog !== targetGobog) {
        this.gobogAnimFrame = requestAnimationFrame(step);
      }
    };
    this.gobogAnimFrame = requestAnimationFrame(step);
  }

  showNpcBalloon(speaker, text, portraitSrc = './public/assets/characters/npc_gajah_mada.png') {
    const balloon = document.getElementById('npc-dialog-balloon');
    if (!balloon) return;

    const imgEl = document.getElementById('npc-balloon-img');
    if (imgEl) imgEl.src = portraitSrc;

    const spkEl = document.getElementById('npc-balloon-speaker');
    if (spkEl) spkEl.textContent = speaker;

    const txtEl = document.getElementById('npc-balloon-text');
    if (txtEl) txtEl.textContent = text.replace(/^["']|["']$/g, '');

    balloon.classList.remove('hidden');
    clearTimeout(this._balloonTimeout);
    this._balloonTimeout = setTimeout(() => balloon.classList.add('hidden'), 5200);
  }

  _renderPauseModal() {
    const jamuCount = this.storage.state.shop.jamuCount;
    const jamuBtn = document.getElementById('btn-pause-jamu');
    if (jamuBtn) {
      jamuBtn.innerHTML = `${iconSVG('jamu', 18)} <span>Minum Jamu Tirta (+${this.balance.shop.jamuHealAmount} HP) · Sisa ${jamuCount}</span>`;
    }
    const cardsBtn = document.getElementById('btn-pause-cards');
    if (cardsBtn) {
      cardsBtn.innerHTML = `${iconSVG('buku', 18)} <span>Buka Kartu Materi Stage Ini</span>`;
    }
    const audioBtn = document.getElementById('btn-pause-audio');
    if (audioBtn) {
      audioBtn.innerHTML = `${iconSVG('suara', 18)} <span>Suara Gamelan: ${this.audio.muted ? 'Mati' : 'Aktif'}</span>`;
    }
    const exitBtn = document.getElementById('btn-pause-exit');
    if (exitBtn) {
      exitBtn.innerHTML = `${iconSVG('gapura', 18)} <span>Kembali ke Beranda</span>`;
    }
  }

  _renderSettingsModal() {
    const s = this.storage.state.settings;
    const audioBtn = document.getElementById('btn-setting-audio');
    if (audioBtn) audioBtn.textContent = this.audio.muted ? 'Mati' : 'Aktif';

    const jumpBtn = document.getElementById('btn-setting-jump-up');
    if (jumpBtn) jumpBtn.textContent = s.jumpOnUp ? 'Aktif (↑ = Lompat)' : 'Tombol Kanan (▲/▼)';

    const fxBtn = document.getElementById('btn-setting-fx');
    if (fxBtn) fxBtn.textContent = s.visualEffects === 'penuh' ? 'Penuh' : 'Hemat';
  }

  stopGameplayAndReturnMenu() {
    clearInterval(this.gateTimerInterval);
    document.getElementById('boss-question-banner')?.classList.add('hidden');
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }
    this.runWithGapuraTransition(() => {
      document.getElementById('gameplay-screen')?.classList.add('hidden');
      this.showBeranda();
    });
  }

  // ==========================================================================
  // 9. GERBANG WAKTU (Acak Opsi Jawaban + Syarat Lulus >= 60%) & HASIL STAGE
  // ==========================================================================
  openGerbangWaktu(runData) {
    this.lastStageRunData = runData;
    this.gateQuestions = this.questions.filter((q) => q.stage === this.activeStage.id);
    this.gateIndex = 0;
    this.gateCorrectCount = 0;
    this.gateWrongReviews = [];

    this._renderGateQuestionStep();
    this.showModal('gerbang-waktu-modal');
  }

  _renderGateQuestionStep() {
    clearInterval(this.gateTimerInterval);
    const q = this.gateQuestions[this.gateIndex];
    if (!q) {
      document.getElementById('gerbang-waktu-modal')?.classList.add('hidden');
      this._showStageResultScreen();
      return;
    }

    const modeCfg = this.balance.modes[this.storage.state.gameMode];
    const timerBadge = document.getElementById('gate-timer-badge');

    if (modeCfg.quizTimerSec > 0) {
      let timeLeft = modeCfg.quizTimerSec;
      timerBadge.textContent = `Sisa Waktu: ${timeLeft} dtk`;
      this.gateTimerInterval = setInterval(() => {
        timeLeft--;
        timerBadge.textContent = `Sisa Waktu: ${timeLeft} dtk`;
        if (timeLeft <= 0) {
          clearInterval(this.gateTimerInterval);
          this._submitGateAnswer(q, false);
        }
      }, 1000);
    } else {
      timerBadge.textContent = 'Mode Belajar (Tanpa Timer)';
    }

    document.getElementById('gate-progress-title').textContent =
      `Ujian Gerbang Waktu · Soal ${this.gateIndex + 1}/${this.gateQuestions.length}`;
    document.getElementById('gate-question-prompt').textContent = q.prompt;

    // Acak urutan opsi saat ditampilkan agar posisi jawaban tidak bisa dihafal!
    const indexedOpts = q.options.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
    for (let i = indexedOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedOpts[i], indexedOpts[j]] = [indexedOpts[j], indexedOpts[i]];
    }

    const box = document.getElementById('gate-options-container');
    box.innerHTML = indexedOpts
      .map(
        (item, i) => `
        <button type="button" class="quiz-opt-btn" data-correct="${item.isCorrect}">
          ${String.fromCharCode(65 + i)}. ${item.text}
        </button>
      `
      )
      .join('');

    box.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearInterval(this.gateTimerInterval);
        const isCorrect = btn.dataset.correct === 'true';
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => this._submitGateAnswer(q, isCorrect), 450);
      });
    });
  }

  _submitGateAnswer(qObj, isCorrect) {
    this.audio.playQuizFeedback(isCorrect);
    this.storage.recordQuestionAttempt(qObj, isCorrect);

    if (isCorrect) {
      this.gateCorrectCount++;
      this.storage.addGobog(5);
    } else {
      const card = this.cards.find((c) => c.id === qObj.cardRef);
      this.gateWrongReviews.push({
        prompt: qObj.prompt,
        explanation: qObj.explanation,
        cardKeyword: card ? card.keyword : ''
      });
    }

    this.gateIndex++;
    this._renderGateQuestionStep();
  }

  _showStageResultScreen() {
    const totalQ = this.gateQuestions.length || 5;
    const accuracyPct = Math.round((this.gateCorrectCount / totalQ) * 100);
    const artCount = this.lastStageRunData?.artifactsCollected?.length || 0;
    const elapsedSec = this.lastStageRunData?.elapsedSec || 120;
    const passedGate = accuracyPct >= 60;
    this.lastStageClearedSuccess = passedGate;

    let stars = passedGate ? 1 : 0;
    if (accuracyPct >= 60 && (artCount >= 1 || accuracyPct >= 80)) stars = 2;
    if (accuracyPct >= 80 && artCount >= 2) stars = 3;

    this.storage.recordStageClear(this.activeStage.id, stars, accuracyPct, elapsedSec);

    document.getElementById('res-stage-title').textContent = passedGate
      ? `${this.activeStage.title} Tuntas!`
      : `Gerbang Waktu Belum Terbuka (Butuh ≥ 60%)`;

    const starsBox = document.getElementById('res-stars-display');
    if (starsBox) {
      starsBox.innerHTML = starPairSVG(stars, 3, 30);
    }

    document.getElementById('res-stats-summary').innerHTML = `
      <span>Akurasi: <b>${accuracyPct}%</b> (${this.gateCorrectCount}/${totalQ})</span> ·
      <span>Artefak: <b>${artCount}/3</b></span> ·
      <span>Waktu: <b>${elapsedSec} dtk</b></span>
    `;

    const resBtn = document.getElementById('btn-result-menu');
    if (resBtn) {
      if (this.activeStage?.id === 4 && passedGate) {
        resBtn.textContent = 'Saksikan Epilog Pemulihan Nusantara ▸';
      } else {
        resBtn.textContent = 'Kembali ke Beranda';
      }
    }

    const reviewBox = document.getElementById('res-wrong-review');
    if (this.gateWrongReviews.length === 0) {
      reviewBox.innerHTML = `<div style="background:var(--lumut);color:#fff;padding:8px 12px;border-radius:4px;font-weight:800;text-align:center;">Sempurna! Semua soal Gerbang Waktu dijawab tepat.</div>`;
    } else {
      reviewBox.innerHTML = this.gateWrongReviews
        .map(
          (r) => `
          <div style="background:rgba(255,248,225,0.75);border-left:4px solid var(--bata);padding:6px 10px;border-radius:4px;margin-bottom:6px;font-size:0.82rem;">
            <strong>${r.prompt}</strong>
            <div>${r.explanation}</div>
          </div>
        `
        )
        .join('');
    }

    this.showModal('hasil-stage-modal');
  }

  // ==========================================================================
  // 10. MUSEUM, TOKO, RAPOR LONTAR, & INFO GURU
  // ==========================================================================
  _renderMuseumModal() {
    const collected = this.storage.state.collectedArtifacts;
    const shelves = document.getElementById('museum-shelves-grid');
    if (!shelves) return;

    if (!this.selectedMuseumArt) {
      this.selectedMuseumArt = this.artifacts.find((a) => collected.includes(a.id)) || this.artifacts[0];
    }

    shelves.innerHTML = this.artifacts
      .map((art) => {
        const isUnlocked = collected.includes(art.id);
        const isSelected = this.selectedMuseumArt?.id === art.id;
        return `
          <div class="pedestal-slot ${isSelected ? 'selected' : ''}" data-art-id="${art.id}">
            <div>
              <img src="${art.iconImg}" alt="${art.name}" class="${isUnlocked ? '' : 'locked-silhouette'}" />
            </div>
            <div style="font-size:0.74rem;font-weight:800;margin-top:4px;color:var(--lontar);">
              ${isUnlocked ? art.name : '??? (Stage ' + art.stage + ')'}
            </div>
          </div>
        `;
      })
      .join('');

    shelves.querySelectorAll('[data-art-id]').forEach((slot) => {
      slot.addEventListener('click', () => {
        const found = this.artifacts.find((a) => a.id === slot.dataset.artId);
        if (found) {
          this.selectedMuseumArt = found;
          this._renderMuseumModal();
        }
      });
    });

    const pane = document.getElementById('museum-detail-pane');
    if (pane && this.selectedMuseumArt) {
      const art = this.selectedMuseumArt;
      const isUnlocked = collected.includes(art.id);
      pane.innerHTML = `
        <div style="text-align:center;margin-bottom:6px;">
          <img src="${art.iconImg}" alt="${art.name}" style="width:58px;height:58px;object-fit:contain;" class="${isUnlocked ? '' : 'locked-silhouette'}" />
        </div>
        <span class="kunci" style="font-size:0.74rem;padding:2px 8px;margin-bottom:6px;">${art.kindLabel}</span>
        <h4 style="font:800 1rem var(--font-display);color:#5a2a14;margin-bottom:4px;">
          ${isUnlocked ? art.name : 'Artefak Belum Ditemukan'}
        </h4>
        <p style="font-size:0.82rem;line-height:1.35;color:var(--tinta);text-shadow:none;">
          ${isUnlocked ? art.blurb : `Jelajahi Stage ${art.stage} dan pukul Blok Prasasti Surya untuk membuka catatan artefak ini.`}
        </p>
      `;
    }
  }

  _renderShopModal() {
    const shopState = this.storage.state.shop;
    const coins = this.storage.state.gobogCoins;
    const profile = this.storage.state.profile;

    const badge = document.getElementById('shop-coins-badge');
    if (badge) badge.innerHTML = `${iconSVG('gobog', 16)} <span>${coins} Gobog</span>`;

    const activeCostumeObj =
      this.balance.shop.costumes.find((c) => c.id === shopState.activeCostume) || this.balance.shop.costumes[0];
    const pChar = profile.karakter === 'laras' ? 'laras' : 'arka';
    const pWeap = ['keris', 'panah', 'tombak'].includes(profile.senjata) ? profile.senjata : 'keris';
    const arkaImg = document.getElementById('shop-arka-img');
    if (arkaImg) {
      arkaImg.src = `./public/assets/characters/${pChar}_${pWeap}.png`;
      arkaImg.style.filter = COSTUME_FILTERS[activeCostumeObj.id] || COSTUME_FILTERS.bhayangkara;
    }
    const cTitle = document.getElementById('shop-costume-title');
    if (cTitle) cTitle.textContent = activeCostumeObj.name;
    const cNote = document.getElementById('shop-costume-note');
    if (cNote) cNote.textContent = activeCostumeObj.historicalNote;

    const box = document.getElementById('shop-items-body');
    if (!box) return;

    let html = `
      <div class="shop-item-card">
        <div>
          <strong style="font-size:0.85rem;">Jamu Tirta Amerta (+${this.balance.shop.jamuHealAmount} HP)</strong>
          <div style="font-size:0.74rem;color:#d9c7a3;">Dimiliki: ${shopState.jamuCount} Botol</div>
        </div>
        <button type="button" id="btn-buy-jamu" class="btn btn--stone" style="min-height:38px;padding:0.3em 0.9em;font-size:0.78rem;">
          ${this.balance.shop.jamuHealCost} Gobog
        </button>
      </div>

      <div class="shop-item-card">
        <div>
          <strong style="font-size:0.85rem;">Sabuk Ketahanan (HP 100 → ${this.balance.hero.upgradedMaxHp})</strong>
          <div style="font-size:0.74rem;color:#d9c7a3;">${shopState.maxHpUpgraded ? 'Sudah aktif permanen' : 'Upgrade batas HP maksimum'}</div>
        </div>
        <button type="button" id="btn-buy-hp" class="btn btn--stone" style="min-height:38px;padding:0.3em 0.9em;font-size:0.78rem;" ${shopState.maxHpUpgraded ? 'disabled' : ''}>
          ${shopState.maxHpUpgraded ? 'Aktif' : `${this.balance.shop.maxHpUpgradeCost} Gobog`}
        </button>
      </div>
    `;

    html += this.balance.shop.costumes
      .map((c) => {
        const owned = shopState.unlockedCostumes.includes(c.id);
        const active = shopState.activeCostume === c.id;
        return `
          <div class="shop-item-card">
            <div>
              <strong style="font-size:0.85rem;">${c.name}</strong>
              <div style="font-size:0.73rem;color:#d9c7a3;">${c.historicalNote}</div>
            </div>
            <button type="button" class="btn ${active ? 'btn--lontar' : 'btn--stone'}" style="min-height:38px;padding:0.3em 0.9em;font-size:0.78rem;" data-costume-id="${c.id}" data-costume-cost="${c.cost}">
              ${active ? 'Dipakai' : owned ? 'Pakai' : `${c.cost} Gobog`}
            </button>
          </div>
        `;
      })
      .join('');

    box.innerHTML = html;

    document.getElementById('btn-buy-jamu')?.addEventListener('click', () => {
      if (this.storage.state.gobogCoins < this.balance.shop.jamuHealCost) return;
      this.storage.addGobog(-this.balance.shop.jamuHealCost);
      this.storage.state.shop.jamuCount++;
      this.storage.save();
      this.audio.playCoinGobog();
      this._renderShopModal();
      this.renderMainMenu();
    });

    document.getElementById('btn-buy-hp')?.addEventListener('click', () => {
      if (shopState.maxHpUpgraded || this.storage.state.gobogCoins < this.balance.shop.maxHpUpgradeCost) return;
      this.storage.addGobog(-this.balance.shop.maxHpUpgradeCost);
      this.storage.state.shop.maxHpUpgraded = true;
      this.storage.save();
      this.audio.playQuizFeedback(true);
      this._renderShopModal();
      this.renderMainMenu();
    });

    box.querySelectorAll('[data-costume-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cid = btn.dataset.costumeId;
        const cost = Number(btn.dataset.costumeCost);
        if (!shopState.unlockedCostumes.includes(cid)) {
          if (this.storage.state.gobogCoins < cost) return;
          this.storage.addGobog(-cost);
          shopState.unlockedCostumes.push(cid);
        }
        shopState.activeCostume = cid;
        this.storage.save();
        this.audio.playQuizFeedback(true);
        this._renderShopModal();
        this.renderMainMenu();
      });
    });
  }

  _renderRaporModal() {
    const head = document.getElementById('rapor-title-head');
    if (head) head.textContent = `Lontar Rapor Pendekar — ${this.storage.state.profile.nama}`;

    const ringsGrid = document.getElementById('rapor-rings-grid');
    if (ringsGrid) {
      const circumference = 138.2; // 2 * PI * 22
      ringsGrid.innerHTML = this.stages
        .map((st) => {
          const rec = this.storage.state.stageRecords[st.id] || { stars: 0, bestAccuracy: 0 };
          const pct = Math.max(0, Math.min(100, rec.bestAccuracy || 0));
          const offset = circumference * (1 - pct / 100);
          const strokeColor = pct >= 60 ? '#4F6F3B' : '#B4492F';

          return `
            <div class="rapor-ring-card">
              <div class="ring-svg-wrap">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(42,26,18,0.16)" stroke-width="5" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset.toFixed(1)}"
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <span class="ring-pct-label">${pct}%</span>
              </div>
              <div style="font-size:0.74rem;font-weight:800;color:var(--tinta);">Stage ${st.id}</div>
              <div>${starPairSVG(rec.stars, 3, 11)}</div>
            </div>
          `;
        })
        .join('');
    }

    const adviceBox = document.getElementById('rapor-advice-box');
    if (adviceBox) {
      const advice = getPersonalAdviceData(this.storage, this.cards);
      adviceBox.innerHTML = `
        <div style="font-size:0.82rem;">
          <strong style="color:var(--emas-light);display:block;">Saran Belajar Personal:</strong>
          <span>"${advice.sentence}"</span>
        </div>
        <button type="button" id="btn-rapor-jump-card" class="btn btn--lontar" style="min-height:38px;padding:0.3em 0.9em;font-size:0.78rem;">
          Buka Kartu ▸
        </button>
      `;

      document.getElementById('btn-rapor-jump-card')?.addEventListener('click', () => {
        document.getElementById('rapor-modal')?.classList.add('hidden');
        this._syncPhaserPauseState();
        const targetCard = advice.card || this.cards[0];
        const stageObj = this.stages.find((s) => s.id === targetCard.stage) || this.stages[0];
        this.openBalaiBelajar(stageObj, { isInGameReference: false, returnToStagePicker: false }, targetCard.id);
      });
    }
  }

  _renderGuruModal() {
    const box = document.getElementById('guru-content-body');
    if (!box || !this.curriculumCP) return;

    box.innerHTML = `
      <div style="margin-bottom:8px;">
        <strong>${this.curriculumCP.mappingHeader || 'Tujuan pembelajaran game ini, dipetakan ke CP'}:</strong>
        <div>Acuan: ${this.curriculumCP.curriculumStandard}</div>
      </div>
      ${this.curriculumCP.targetLevels
        .map(
          (lvl) => `
          <div style="background:rgba(255,248,225,0.65);border:2px solid #5a2a14;padding:8px 10px;border-radius:4px;margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>${lvl.jenjang}</strong>
              <span class="kunci" style="padding:2px 8px;font-size:0.72rem;">${lvl.fase} · ${lvl.mapel}</span>
            </div>
            <div style="margin-top:4px;">${lvl.tpSummary}</div>
          </div>
        `
        )
        .join('')}
      <div style="font-size:0.78rem;margin-top:6px;">
        <strong>Catatan Historiografi:</strong> ${this.curriculumCP.historiographyNote}
      </div>
    `;
  }

  showModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
    this._syncPhaserPauseState();
  }

  _handlePreviewQuery() {
    const params = new URLSearchParams(window.location.search);
    const v3View = params.get('v3View') || params.get('afterView');
    if (!v3View) return;

    if (v3View === 'loading') {
      // Biarkan di layar loading + tombol Ketuk untuk Mulai
      return;
    }

    document.getElementById('loading-screen')?.classList.add('hidden');

    if (v3View === 'intro') {
      this.openIntroSequence();
      document.getElementById('btn-skip-intro')?.classList.remove('hidden');
    } else if (v3View === 'setup') {
      this.openSetupProfile();
    } else if (v3View === 'beranda' || v3View === 'menu') {
      this.showBeranda();
    } else if (v3View === 'picker') {
      this.showBeranda();
      this.openStagePicker('petualangan', 2);
    } else if (v3View === 'balai') {
      this.showBeranda();
      this.openBalaiBelajar(this.stages[0], { isInGameReference: false, returnToStagePicker: false });
    } else if (v3View === 'gameplay') {
      this.launchGameplayStage(this.stages[0]);
    } else if (v3View === 'gameplay_panah') {
      this.storage.state.profile.senjata = 'panah';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(380, 560);
          scene.performBasicPunch();
        }
      }, 80);
    } else if (v3View === 'gameplay_walk') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'keris';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(260, 560);
          scene.touchInput.right = true;
        }
      }, 80);
    } else if (v3View === 'gameplay_jump') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'keris';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(320, 560);
          scene.performJump();
        }
      }, 80);
    } else if (v3View === 'gameplay_crouch') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'keris';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(360, 560);
          scene.touchInput.down = true;
          document.getElementById('touch-crouch')?.classList.add('is-pressed');
        }
      }, 80);
    } else if (v3View === 'gameplay_laras_panah') {
      this.storage.state.profile.karakter = 'laras';
      this.storage.state.profile.senjata = 'panah';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(280, 560);
          scene.touchInput.right = true;
        }
      }, 80);
    } else if (v3View === 'gameplay_keris') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'keris';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(480, 560);
          scene.touchInput.right = true;
        }
      }, 80);
    } else if (v3View === 'gameplay_tier4') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'keris';
      this.launchGameplayStage(this.stages[0]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          // Panjat di Lantai 4 Menara 1 (x=800, y=140)
          scene.player.setPosition(800, 140);
          scene.player.setVelocity(0, 0);
          scene.cameras.main.pan(800, 240, 0);
        }
      }, 80);
    } else if (v3View === 'stage2') {
      this.launchGameplayStage(this.stages[1]);
    } else if (v3View === 'stage3') {
      this.storage.state.profile.karakter = 'laras';
      this.storage.state.profile.senjata = 'tombak';
      this.launchGameplayStage(this.stages[2]);
      setTimeout(() => {
        document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
        document.getElementById('stage-intro-splash')?.classList.add('hidden');
        const scene = this._getActiveScene();
        if (scene && scene.player) {
          scene.player.x = 350;
          scene.performBasicPunch();
        }
      }, 1100);
    } else if (v3View === 'stage4') {
      this.storage.state.profile.karakter = 'arka';
      this.storage.state.profile.senjata = 'panah';
      this.launchGameplayStage(this.stages[3]);
      const waitReady = setInterval(() => {
        const scene = this._getActiveScene();
        if (scene && scene.player && scene.player.body) {
          clearInterval(waitReady);
          document.getElementById('npc-dialog-balloon')?.classList.add('hidden');
          document.getElementById('stage-intro-splash')?.classList.add('hidden');
          scene.player.setPosition(6420, 560);
          scene.cameras.main.centerOn(6540, 360);
          scene.performSkill2Keris();
          if (scene.bossUnit && scene.bossUnit.active) {
            scene._performBossJumpSlam(scene.bossUnit, -1);
          }
        }
      }, 80);
    } else if (v3View === 'epilog') {
      this.showBeranda();
      this.showModal('epilog-modal');
    } else if (v3View === 'settings') {
      this.showBeranda();
      this._renderSettingsModal();
      this.showModal('settings-modal');
    } else if (v3View === 'museum') {
      this.showBeranda();
      this._renderMuseumModal();
      this.showModal('museum-modal');
    } else if (v3View === 'toko') {
      this.showBeranda();
      this._renderShopModal();
      this.showModal('shop-modal');
    } else if (v3View === 'rapor') {
      this.showBeranda();
      this._renderRaporModal();
      this.showModal('rapor-modal');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.kalaApp = new KalaNusantaraApp();
});
