// ============================================================================
// src/systems/StorageAdapter.js
// Lapisan Abstraksi Penyimpanan v3.2:
// - Default save mulai bersih dari 0 (tanpa progres palsu)
// - Mendukung fitur Hapus / Reset Data Mulai dari 0 (resetAllData)
// ============================================================================

const STORAGE_KEY = 'kala_nusantara_save_v3';

const DEFAULT_SAVE = {
  playerName: 'Arka',
  hasSetPlayerName: false,
  profile: {
    nama: 'Arka',
    karakter: 'arka', // 'arka' | 'laras'
    senjata: 'keris', // 'keris' | 'panah' | 'tombak'
    introSeen: false,
    setupCompleted: false
  },
  settings: {
    jumpOnUp: false,
    visualEffects: 'penuh' // 'penuh' | 'hemat'
  },
  lastPlayedStage: 1,
  gameMode: 'belajar', // 'belajar' (Anti-Gagal) | 'tantangan' (Standar SMP)
  gobogCoins: 0,
  unlockedStages: [1],
  stageRecords: {
    1: { stars: 0, bestAccuracy: 0, bestTimeSec: null, studiedCards: false, cleared: false, lastCardIndex: 0 },
    2: { stars: 0, bestAccuracy: 0, bestTimeSec: null, studiedCards: false, cleared: false, lastCardIndex: 0 },
    3: { stars: 0, bestAccuracy: 0, bestTimeSec: null, studiedCards: false, cleared: false, lastCardIndex: 0 },
    4: { stars: 0, bestAccuracy: 0, bestTimeSec: null, studiedCards: false, cleared: false, lastCardIndex: 0 }
  },
  collectedArtifacts: [],
  questionStats: {},
  shop: {
    maxHpUpgraded: false,
    jamuCount: 1,
    unlockedCostumes: ['bhayangkara'],
    activeCostume: 'bhayangkara'
  }
};

export class StorageAdapter {
  constructor() {
    this.state = this._loadSync();
  }

  _loadSync() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_SAVE);
      const parsed = JSON.parse(raw);
      const merged = {
        ...structuredClone(DEFAULT_SAVE),
        ...parsed,
        profile: { ...structuredClone(DEFAULT_SAVE.profile), ...(parsed.profile || {}) },
        settings: { ...structuredClone(DEFAULT_SAVE.settings), ...(parsed.settings || {}) },
        stageRecords: { ...structuredClone(DEFAULT_SAVE.stageRecords), ...(parsed.stageRecords || {}) },
        shop: { ...structuredClone(DEFAULT_SAVE.shop), ...(parsed.shop || {}) }
      };
      // Bersihkan ID artefak lama yang tidak valid (mis. art_1_surya)
      if (Array.isArray(merged.collectedArtifacts)) {
        merged.collectedArtifacts = merged.collectedArtifacts.filter((id) => /^s[1-4]_/.test(id));
      } else {
        merged.collectedArtifacts = [];
      }
      merged.playerName = merged.profile.nama || merged.playerName || 'Arka';
      return merged;
    } catch (e) {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  save() {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY, serialized);
      if (window.Capacitor?.Plugins?.Preferences) {
        window.Capacitor.Plugins.Preferences.set({ key: STORAGE_KEY, value: serialized });
      }
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
  }

  resetAllData() {
    this.state = structuredClone(DEFAULT_SAVE);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('kala_nusantara_save_v1');
      localStorage.removeItem('kala_nusantara_save_v2');
      if (window.Capacitor?.Plugins?.Preferences) {
        window.Capacitor.Plugins.Preferences.remove({ key: STORAGE_KEY });
      }
    } catch (e) {
      console.warn('Reset storage warning:', e);
    }
    this.save();
    return this.state;
  }

  setProfile(partialProfile) {
    this.state.profile = {
      ...this.state.profile,
      ...partialProfile
    };
    if (this.state.profile.nama) {
      this.state.profile.nama = this.state.profile.nama.trim().slice(0, 16) || 'Arka';
      this.state.playerName = this.state.profile.nama;
      this.state.hasSetPlayerName = true;
    }
    this.save();
  }

  setIntroSeen(seen = true) {
    this.state.profile.introSeen = Boolean(seen);
    this.save();
  }

  setSetting(key, value) {
    this.state.settings[key] = value;
    this.save();
  }

  setMode(mode) {
    if (mode === 'belajar' || mode === 'tantangan') {
      this.state.gameMode = mode;
      this.save();
    }
  }

  setPlayerName(name) {
    const clean = (name || 'Arka').trim().slice(0, 16) || 'Arka';
    this.state.playerName = clean;
    this.state.profile.nama = clean;
    this.state.hasSetPlayerName = true;
    this.save();
  }

  setLastPlayedStage(stageId) {
    this.state.lastPlayedStage = Number(stageId) || 1;
    this.save();
  }

  saveLastCardIndex(stageId, cardIdx) {
    if (!this.state.stageRecords[stageId]) return;
    this.state.stageRecords[stageId].lastCardIndex = Math.max(0, Number(cardIdx) || 0);
    this.save();
  }

  markStageStudied(stageId) {
    if (!this.state.stageRecords[stageId]) return;
    this.state.stageRecords[stageId].studiedCards = true;
    this.state.stageRecords[stageId].lastCardIndex = 0;
    this.save();
  }

  recordQuestionAttempt(questionObj, isCorrect) {
    const qid = questionObj.id;
    if (!this.state.questionStats[qid]) {
      this.state.questionStats[qid] = {
        attempts: 0,
        correct: 0,
        wrong: 0,
        stage: questionObj.stage,
        cardRef: questionObj.cardRef
      };
    }
    const st = this.state.questionStats[qid];
    st.attempts += 1;
    if (isCorrect) st.correct += 1;
    else st.wrong += 1;
    this.save();
  }

  collectArtifact(artifactId) {
    if (!this.state.collectedArtifacts.includes(artifactId)) {
      this.state.collectedArtifacts.push(artifactId);
      this.save();
      return true;
    }
    return false;
  }

  addGobog(amount) {
    this.state.gobogCoins = Math.max(0, (this.state.gobogCoins || 0) + amount);
    this.save();
  }

  recordStageClear(stageId, stars, accuracyPct, timeSec, passedGate = true) {
    const rec = this.state.stageRecords[stageId] || {
      stars: 0,
      bestAccuracy: 0,
      bestTimeSec: null,
      studiedCards: true,
      cleared: false,
      lastCardIndex: 0
    };
    rec.bestAccuracy = Math.max(rec.bestAccuracy, accuracyPct);
    if (passedGate) {
      rec.cleared = true;
      rec.stars = Math.max(rec.stars, stars);
      if (rec.bestTimeSec === null || timeSec < rec.bestTimeSec) {
        rec.bestTimeSec = timeSec;
      }
      const nextStage = Number(stageId) + 1;
      if (nextStage <= 4 && !this.state.unlockedStages.includes(nextStage)) {
        this.state.unlockedStages.push(nextStage);
      }
      this.state.lastPlayedStage = nextStage <= 4 ? nextStage : Number(stageId);
    }
    this.state.stageRecords[stageId] = rec;
    this.save();
  }

  getMostMissedCard(allCards) {
    let worstCardId = null;
    let maxWrong = 0;
    Object.values(this.state.questionStats || {}).forEach((st) => {
      if (st.wrong > maxWrong && st.cardRef) {
        maxWrong = st.wrong;
        worstCardId = st.cardRef;
      }
    });
    if (worstCardId) {
      const found = allCards.find((c) => c.id === worstCardId);
      if (found) return found;
    }
    return allCards[0] || null;
  }

  getWeightedBossQuestions(allQuestions, count = 3) {
    const weightedPool = [];
    allQuestions.forEach((q) => {
      const stat = this.state.questionStats[q.id];
      const weight = stat && stat.wrong > 0 ? 3 + stat.wrong * 2 : 1;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(q);
      }
    });

    const chosen = [];
    const usedIds = new Set();
    const shuffled = weightedPool.sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        chosen.push(q);
        if (chosen.length >= count) break;
      }
    }
    return chosen;
  }
}
