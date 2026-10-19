// ============================================================================
// src/scenes/PlatformerScene.js
// Phaser 3 2D Action-Platformer Brawler Scene (v3.2 — Dunia Hidup & Senjata Aktif)
// - 4 Latar Berbeda per Stage + Stage Panjang (4200px) Parallax Seamless
// - Dunia Hidup: Awan Bergerak, Burung Terbang Kepak Sayap, Daun Gugur, Kunang-kunang
// - Spritesheet 8 Pose Karakter (Idle, Jalan Kanan/Kiri, Jongkok, Persiapan Loncat,
//   Loncat Naik, Melayang Turun, Mendarat) + Kaki Menapak Presisi & Bayangan Tanah
// - Senjata Terpilih Dipegang Karakter (Keris, Busur Panah Jemparing, Tombak Waos)
// - Musuh Bayangan Petarung Melawan dengan Tinju & Boss Kala Aktif Bergerak/Melompat
// ============================================================================

export class PlatformerScene extends window.Phaser.Scene {
  constructor() {
    super({ key: 'PlatformerScene' });
  }

  init(data) {
    this.stageConfig = data.stageConfig;
    this.balance = data.balance;
    this.artifactsList = data.artifactsList || [];
    this.storage = data.storage;
    this.audioSys = data.audioSys;
    this.callbacks = data.callbacks || {};

    this.modeKey = this.storage.state.gameMode || 'belajar';
    this.modeCfg = this.balance.modes[this.modeKey];

    const baseHp = this.storage.state.shop.maxHpUpgraded
      ? this.balance.hero.upgradedMaxHp
      : this.balance.hero.maxHp;
    this.maxHp = baseHp;
    this.hp = baseHp;
    this.energy = this.stageConfig.id === 4 ? 60 : 30;
    this.comboStep = 0;
    this.comboResetTimer = 0;
    this.jumpCount = 0;
    this.facing = 1;
    this.damageMultiplier = 1.0;

    // Senjata & Karakter aktif dari profil
    this.selectedCharacter = this.storage.state.profile?.karakter || 'arka';
    this.selectedWeapon = this.storage.state.profile?.senjata || 'keris';

    // Sistem Anak Panah Terbatas + Looting In-Game (Khusus Senjata Busur Panah)
    this.maxArrows = this.balance.hero?.maxArrows || 15;
    this.arrows = this.maxArrows;

    // Cooldowns & State Animasi Karakter
    this.cdSkill1 = 0;
    this.cdSkill2 = 0;
    this.cdDash = 0;
    this.isDashing = false;
    this.attackLockUntil = 0;
    this.attackAnimUntil = 0;
    this.jumpPrepUntil = 0;
    this.landAnimUntil = 0;
    this.wasOnGround = true;
    this.isCrouching = false;
    this.wasCrouching = false;
    this.stepDustTimer = 0;
    this.weaponSwingOffset = { x: 0, y: 0, angle: 0 };

    this.stageStartTime = Date.now();
    this.collectedStageArtifacts = [];
    this.harmonySwitchesActive = { siwa: false, buddha: false };
    this.brickBridgeBuilt = false;
    this.gateTriggered = false;

    this.bossUnit = null;
    this.bossShieldActive = false;
    this.bossShieldUsed = false;
    this.bossStunUntil = 0;
    this.bossPillars = [];

    // Ambient world arrays
    this.clouds = [];
    this.birds = [];
    this.fallingLeaves = [];
    this.fireflies = [];
  }

  preload() {
    // 1. 4 Latar Berbeda untuk Stage 1, 2, 3, dan 4
    this.load.image('bg_stage_1', './public/assets/environment/bg_stage1_trowulan.png');
    this.load.image('bg_stage_2', './public/assets/environment/bg_stage2_dermaga.png');
    this.load.image('bg_stage_3', './public/assets/environment/bg_stage3_candi_tikus.png');
    this.load.image('bg_stage_4', './public/assets/environment/bg_stage4_pelataran_agung.png');

    // 2. Karakter Utama dengan Senjata Menyatu di Tangan (Arka & Laras - Keris / Panah / Tombak)
    this.load.image('arka_keris', './public/assets/characters/arka_keris.png');
    this.load.image('arka_panah', './public/assets/characters/arka_panah.png');
    this.load.image('arka_tombak', './public/assets/characters/arka_tombak.png');
    this.load.image('laras_keris', './public/assets/characters/laras_keris.png');
    this.load.image('laras_panah', './public/assets/characters/laras_panah.png');
    this.load.image('laras_tombak', './public/assets/characters/laras_tombak.png');
    this.load.image('npc_gajah_mada', './public/assets/characters/npc_gajah_mada.png');

    // 3. Musuh Petarung Tinju & Boss Kala
    this.load.image('bayangan_petarung', './public/assets/enemies/bayangan_petarung.png');
    this.load.image('bayangan_tombak', './public/assets/enemies/bayangan_tombak.png');
    this.load.image('boss_kala', './public/assets/enemies/boss_kala.png');

    // 4. Senjata & Proyektil + Looting Anak Panah (item_quiver)
    this.load.image('weapon_keris', './public/assets/items/weapon_keris.png');
    this.load.image('weapon_panah', './public/assets/items/weapon_panah.png');
    this.load.image('weapon_arrow', './public/assets/items/weapon_arrow.png');
    this.load.image('weapon_tombak', './public/assets/items/weapon_tombak.png');
    this.load.image('item_quiver', './public/assets/items/item_quiver.png');

    // 5. Tiles & Item Dunia
    this.load.image('tile_brick', './public/assets/items/tile_brick.png');
    this.load.image('tile_wood', './public/assets/items/tile_wood.png');
    this.load.image('block_prasasti', './public/assets/items/block_prasasti.png');
    this.load.image('coin_gobog', './public/assets/items/coin_gobog.png');
    this.load.image('vfx_surya', './public/assets/items/vfx_surya.png');
    this.load.image('vfx_keris', './public/assets/items/vfx_keris.png');

    this.artifactsList.forEach((art) => {
      if (art.iconImg) {
        this.load.image(`art_${art.id}`, art.iconImg);
      }
    });
  }

  create() {
    // Stage diperpanjang menjadi 4200px agar perjalanan jauh lebih luas!
    const worldWidth = 4200;
    const worldHeight = 720;
    this.worldWidth = worldWidth;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // 1. Background Unik Sesuai Stage (1=Trowulan, 2=Dermaga, 3=Candi Tikus, 4=Pelataran Agung)
    const bgKey = `bg_stage_${this.stageConfig.id}` || 'bg_stage_1';
    this.bgTile = this.add
      .tileSprite(0, 0, 1280, 720, this.textures.exists(bgKey) ? bgKey : 'bg_stage_1')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-30);

    // 2. Bangun Efek Dunia Hidup (Awan Gerak, Burung Terbang, Daun Gugur, Siluet Parallax)
    this._createAmbientWorld(worldWidth);

    // 3. Grup Physics
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.crackedWalls = this.physics.add.staticGroup();
    this.prasastiBlocks = this.physics.add.staticGroup();
    this.coinsGroup = this.physics.add.group({ allowGravity: false });
    this.quiversGroup = this.physics.add.group({ allowGravity: false });
    this.artifactsGroup = this.physics.add.group({ allowGravity: false });
    this.enemiesGroup = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group({ allowGravity: false });
    this.enemyProjectiles = this.physics.add.group({ allowGravity: false });

    this._buildStageLevel(worldWidth);

    // 4. Karakter Utama dengan Senjata Menyatu di Tangan (Integrated Weapon Sprite)
    this.selectedCharacter = this.storage.state.profile?.karakter === 'laras' ? 'laras' : 'arka';
    const validWeapons = ['keris', 'panah', 'tombak'];
    this.selectedWeapon = validWeapons.includes(this.storage.state.profile?.senjata)
      ? this.storage.state.profile.senjata
      : 'keris';
    this.heroTexKey = `${this.selectedCharacter}_${this.selectedWeapon}`;

    // Bayangan elips di tanah tepat di bawah telapak kaki
    this.playerShadow = this.add
      .ellipse(140, 636, 54, 14, 0x120905, 0.52)
      .setDepth(8);

    // 1. Sprite Physics Murni (Hitbox solid yang tidak pernah di-scale saat render, bebas glitch tanah)
    this.player = this.physics.add.sprite(140, 560, this.heroTexKey);
    this.player.setVisible(false);
    this.player.setDisplaySize(96, 126);
    this.player.body.setSize(48, 106);
    this.player.body.setOffset((this.player.width - 48) * 0.5, this.player.height - 106);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1020);
    this.player.setDepth(10);

    // 2. Sprite Visual Karakter (Rendering independen berporos telapak kaki origin 0.5, 1.0)
    this.heroVisual = this.add.image(140, 560, this.heroTexKey).setDepth(10);
    this.heroVisual.setOrigin(0.5, 1.0);
    this.heroAttackOffsetX = 0;

    const tex = this.textures.get(this.heroTexKey);
    const sourceImg = tex?.getSourceImage();
    const natW = sourceImg?.naturalWidth || sourceImg?.width || 286;
    const natH = sourceImg?.naturalHeight || sourceImg?.height || 337;
    const targetH = 126;
    const targetW = Math.round(targetH * (natW / natH));

    this.heroVisual.setDisplaySize(targetW, targetH);
    this.baseVisualScaleX = this.heroVisual.scaleX;
    this.baseVisualScaleY = this.heroVisual.scaleY;

    const activeCostumeId = this.storage.state.shop.activeCostume || 'bhayangkara';
    const costumeObj = this.balance.shop.costumes.find((c) => c.id === activeCostumeId);
    if (costumeObj && costumeObj.tint && Number(costumeObj.tint) !== 0xffffff) {
      this.heroVisual.setTint(Number(costumeObj.tint));
    }

    this.lastCheckpoint = { x: 140, y: 550 };
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 6. Colliders & Overlaps
    this.physics.add.collider(this.player, this.platforms, () => {
      if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.jumpCount = 0;
      }
    });
    this.physics.add.collider(this.player, this.movingPlatforms, () => {
      if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.jumpCount = 0;
      }
    });
    this.physics.add.collider(this.player, this.crackedWalls);
    this.physics.add.collider(this.enemiesGroup, this.platforms);
    this.physics.add.collider(this.enemiesGroup, this.crackedWalls);

    this.physics.add.collider(this.player, this.prasastiBlocks, (player, block) => {
      if (player.body.touching.up || Math.abs(player.x - block.x) < 58) {
        this._triggerPrasastiBlock(block);
      }
    });

    this.physics.add.overlap(this.player, this.coinsGroup, (player, coin) => {
      coin.destroy();
      this.storage.addGobog(1);
      this.energy = Math.min(100, this.energy + 5);
      this.audioSys.playCoinGobog();
      this._syncHUD();
    });

    this.physics.add.overlap(this.player, this.quiversGroup, (player, quiver) => {
      quiver.getData('labelObj')?.destroy();
      quiver.destroy();
      const refill = this.balance.hero?.arrowLootAmount || 5;
      this.arrows = Math.min(this.maxArrows, this.arrows + refill);
      this.audioSys.playCoinGobog();
      this._showFloatingText(this.player.x, this.player.y - 45, `+${refill} Anak Panah (${this.arrows}/${this.maxArrows})`, '#F2D27A');
      this._syncHUD();
    });

    this.physics.add.overlap(this.player, this.artifactsGroup, (player, artSprite) => {
      const artData = artSprite.getData('artifact');
      artSprite.getData('labelObj')?.destroy();
      artSprite.destroy();
      if (artData) {
        this.storage.collectArtifact(artData.id);
        if (!this.collectedStageArtifacts.includes(artData.id)) {
          this.collectedStageArtifacts.push(artData.id);
        }
        this.audioSys.playQuizFeedback(true);
        this.callbacks.onNPCDialog?.({
          speaker: artData.name,
          portrait: artData.iconImg || `./public/assets/characters/${this.heroTexKey}.png`,
          text: `${artData.kindLabel}: ${artData.blurb}`
        });
        this._syncHUD();
      }
    });

    this.physics.add.overlap(this.projectilesGroup, this.enemiesGroup, (proj, enemy) => {
      if (!proj.active || !enemy.active) return;
      if (proj.getData('hitEnemies')?.has(enemy)) return;
      proj.getData('hitEnemies')?.add(enemy);

      const breaksShield = !!proj.getData('breaksShield');
      this._damageEnemy(enemy, proj.getData('damage') || 26, breaksShield);

      // Efek percikan panah/keris mengenai target
      const spark = this.add.image(proj.x, proj.y, 'vfx_surya').setDisplaySize(38, 38).setDepth(15);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 1.4,
        duration: 160,
        onComplete: () => spark.destroy()
      });

      const left = (proj.getData('pierceLeft') || 1) - 1;
      proj.setData('pierceLeft', left);
      if (left <= 0) proj.destroy();
    });

    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, eProj) => {
      eProj.destroy();
      this._damagePlayer(11);
    });

    // 7. Input Keyboard + D-Pad 8 Arah
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      A: window.Phaser.Input.Keyboard.KeyCodes.A,
      D: window.Phaser.Input.Keyboard.KeyCodes.D,
      W: window.Phaser.Input.Keyboard.KeyCodes.W,
      S: window.Phaser.Input.Keyboard.KeyCodes.S,
      SPACE: window.Phaser.Input.Keyboard.KeyCodes.SPACE,
      J: window.Phaser.Input.Keyboard.KeyCodes.J,
      K: window.Phaser.Input.Keyboard.KeyCodes.K,
      L: window.Phaser.Input.Keyboard.KeyCodes.L,
      U: window.Phaser.Input.Keyboard.KeyCodes.U,
      SHIFT: window.Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    this.touchInput = { left: false, right: false, up: false, down: false, axisX: 0 };
    this._syncHUD();
  }

  _syncHeroBody(isCrouching = false) {
    if (!this.player?.body) return;
    const bw = 48;
    const bh = isCrouching ? 58 : 106;
    const ox = (this.player.width - bw) * 0.5;
    const oy = this.player.height - bh;
    this.player.body.setSize(bw, bh);
    this.player.body.setOffset(ox, oy);
  }

  // ==========================================================================
  // DUNIA HIDUP: AWAN GERAK, BURUNG TERBANG, DAUN GUGUR, & PARALLAX PANJANG
  // ==========================================================================
  _createAmbientWorld(worldWidth) {
    const isHemat = this.storage.state.settings?.visualEffects === 'hemat';
    const stageId = this.stageConfig.id;

    // 1. Awan Bergerak di Langit (Parallax Lembut)
    const cloudCount = isHemat ? 5 : 10;
    const cloudColor = stageId === 4 ? 0x3b2d54 : stageId === 3 ? 0xffd29d : 0xfff5e4;
    const cloudAlpha = stageId === 4 ? 0.32 : 0.55;

    for (let i = 0; i < cloudCount; i++) {
      const cx = (i * (worldWidth / cloudCount)) + window.Phaser.Math.Between(0, 220);
      const cy = window.Phaser.Math.Between(48, 195);
      const scale = window.Phaser.Math.FloatBetween(0.75, 1.35);
      const cloudContainer = this.add.container(cx, cy).setScrollFactor(0.22).setDepth(-22);

      const c1 = this.add.ellipse(0, 0, 120 * scale, 38 * scale, cloudColor, cloudAlpha);
      const c2 = this.add.ellipse(-28 * scale, 6 * scale, 76 * scale, 28 * scale, cloudColor, cloudAlpha * 0.9);
      const c3 = this.add.ellipse(32 * scale, 5 * scale, 82 * scale, 30 * scale, cloudColor, cloudAlpha * 0.9);
      cloudContainer.add([c2, c3, c1]);

      this.clouds.push({
        obj: cloudContainer,
        speed: window.Phaser.Math.FloatBetween(14, 28),
        baseY: cy,
        phase: i * 1.1
      });
    }

    // 2. Kawanan Burung Terbang dengan Kepakan Sayap Animasi
    const birdCount = isHemat ? 4 : 8;
    const birdColor = stageId === 4 ? 0xf2d27a : 0x2a1a12;
    this.birdGfx = this.add.graphics().setScrollFactor(0.35).setDepth(-18);

    for (let i = 0; i < birdCount; i++) {
      this.birds.push({
        x: window.Phaser.Math.Between(80, 1800),
        y: window.Phaser.Math.Between(70, 240),
        speedX: window.Phaser.Math.FloatBetween(42, 68),
        wingPhase: window.Phaser.Math.FloatBetween(0, Math.PI * 2),
        wingSpeed: window.Phaser.Math.FloatBetween(7.5, 11.0),
        size: window.Phaser.Math.FloatBetween(9, 15),
        color: birdColor
      });
    }

    // 3. Ornamen Siluet Mid-Ground Sepanjang 4200px (Agar Stage Terasa Panjang & Berprogres)
    const pillarStep = 480;
    for (let px = 360; px < worldWidth - 300; px += pillarStep) {
      // Siluet Gapura / Umbul-umbul Majapahit di kejauhan
      const bannerPole = this.add
        .rectangle(px, 545, 8, 175, 0x2a1a12, 0.55)
        .setScrollFactor(0.68)
        .setDepth(-12);
      const bannerCloth = this.add
        .polygon(px + 14, 515, [0, 0, 26, 8, 22, 68, 0, 56], stageId === 2 ? 0x3b6e7e : 0xb4492f, 0.65)
        .setScrollFactor(0.68)
        .setDepth(-12);
      this.tweens.add({
        targets: bannerCloth,
        angle: { from: -3, to: 4 },
        duration: 1400 + (px % 500),
        yoyo: true,
        repeat: -1
      });

      // Obor Menyala di Stage 4 (atau Lentera Taman di Stage 1/3)
      if (stageId === 4 || stageId === 3 || px % 960 === 360) {
        const torchHalo = this.add
          .circle(px, 460, 26, 0xf2d27a, stageId === 4 ? 0.35 : 0.2)
          .setScrollFactor(0.68)
          .setDepth(-11);
        const torchCore = this.add
          .circle(px, 460, 9, 0xff9f1c, 0.85)
          .setScrollFactor(0.68)
          .setDepth(-11);
        this.tweens.add({
          targets: [torchHalo, torchCore],
          scale: { from: 0.85, to: 1.22 },
          alpha: { from: 0.22, to: 0.48 },
          duration: 420 + (px % 200),
          yoyo: true,
          repeat: -1
        });
      }
    }

    // 4. Daun Gugur Melayang & Berayuntertiup Angin (Seluruh Stage)
    const leafCount = isHemat ? 14 : 32;
    const leafPalette =
      stageId === 1
        ? [0xd8a444, 0xb4492f, 0x6a8d48] // Daun beringin & maja keemasan
        : stageId === 2
          ? [0x6a8d48, 0xd8a444, 0xf2e3c2] // Daun kelapa & kelopak pantai
          : stageId === 3
            ? [0xf4a261, 0xe76f51, 0xd8a444] // Kelopak teratai & daun senja Candi Tikus
            : [0xf2d27a, 0xb4492f, 0xff9f1c]; // Bara emas & daun malam Pelataran Agung

    for (let i = 0; i < leafCount; i++) {
      const lx = window.Phaser.Math.Between(0, 1280);
      const ly = window.Phaser.Math.Between(0, 720);
      const color = leafPalette[i % leafPalette.length];
      const leaf = this.add
        .ellipse(lx, ly, window.Phaser.Math.Between(9, 14), window.Phaser.Math.Between(5, 8), color, 0.86)
        .setStrokeStyle(1, 0x2a1a12, 0.65)
        .setScrollFactor(0)
        .setDepth(25);

      this.fallingLeaves.push({
        sprite: leaf,
        x: lx,
        y: ly,
        fallSpeed: window.Phaser.Math.FloatBetween(28, 54),
        driftSpeed: window.Phaser.Math.FloatBetween(-22, -8),
        swayAmp: window.Phaser.Math.FloatBetween(18, 36),
        swayFreq: window.Phaser.Math.FloatBetween(1.4, 2.6),
        phase: window.Phaser.Math.FloatBetween(0, Math.PI * 2),
        rotSpeed: window.Phaser.Math.FloatBetween(45, 110)
      });
    }
  }

  _updateAmbientWorld(time, delta) {
    const dt = delta / 1000;
    const tSec = time / 1000;

    // 1. Parallax Background Panjang
    if (this.bgTile) {
      this.bgTile.tilePositionX = this.cameras.main.scrollX * 0.42;
    }

    // 2. Awan Bergerak
    for (const c of this.clouds) {
      c.obj.x -= c.speed * dt;
      c.obj.y = c.baseY + Math.sin(tSec * 0.8 + c.phase) * 4;
      if (c.obj.x < -160) {
        c.obj.x = 1650;
      }
    }

    // 3. Burung Terbang dengan Kepakan Sayap
    if (this.birdGfx) {
      this.birdGfx.clear();
      for (const b of this.birds) {
        b.x += b.speedX * dt;
        b.wingPhase += b.wingSpeed * dt;
        if (b.x > 1750) {
          b.x = -120;
          b.y = window.Phaser.Math.Between(65, 235);
        }
        const wingY = Math.sin(b.wingPhase) * (b.size * 0.65);
        const by = b.y + Math.cos(b.wingPhase * 0.5) * 3;

        this.birdGfx.lineStyle(2.6, b.color, 0.85);
        this.birdGfx.beginPath();
        this.birdGfx.moveTo(b.x - b.size, by - wingY);
        this.birdGfx.lineTo(b.x, by);
        this.birdGfx.lineTo(b.x + b.size, by - wingY);
        this.birdGfx.strokePath();
      }
    }

    // 4. Daun Gugur Berayun
    for (const lf of this.fallingLeaves) {
      lf.y += lf.fallSpeed * dt;
      lf.x += lf.driftSpeed * dt + Math.sin(tSec * lf.swayFreq + lf.phase) * lf.swayAmp * dt;
      lf.sprite.setPosition(lf.x, lf.y);
      lf.sprite.angle += lf.rotSpeed * dt;

      if (lf.y > 735) {
        lf.y = -15;
        lf.x = window.Phaser.Math.Between(20, 1340);
      }
      if (lf.x < -30) {
        lf.x = 1310;
      } else if (lf.x > 1320) {
        lf.x = -10;
      }
    }
  }

  // ==========================================================================
  // LEVEL BUILDER (DIPERPANJANG SAMPAI 4200px)
  // ==========================================================================
  _buildStageLevel(worldWidth) {
    const groundY = 668;
    const mainTileKey = this.stageConfig.id === 2 ? 'tile_wood' : 'tile_brick';

    for (let x = 32; x < worldWidth; x += 64) {
      if (x >= 1150 && x <= 1350 && this.stageConfig.id !== 4) {
        continue;
      }
      const tile = this.platforms.create(x, groundY, mainTileKey);
      tile.setDisplaySize(64, 64).refreshBody();
    }

    // Platform Bertingkat Sepanjang 4200px
    const platformLayouts = [
      { x: 420, y: 525, count: 4 },
      { x: 820, y: 425, count: 4 },
      { x: 1520, y: 515, count: 5 },
      { x: 1960, y: 410, count: 4 },
      { x: 2380, y: 510, count: 4 },
      { x: 2780, y: 415, count: 4 },
      { x: 3180, y: 515, count: 5 }
    ];

    platformLayouts.forEach((p) => {
      for (let i = 0; i < p.count; i++) {
        const t = this.platforms.create(p.x + i * 64, p.y, mainTileKey);
        t.setDisplaySize(64, 38).refreshBody();
      }
    });

    // Mekanik Khas Stage
    if (this.stageConfig.id === 1) {
      this.brickTrigger = this.add.rectangle(1080, 608, 44, 58, 0xd8a444).setStrokeStyle(2, 0xf2e3c2);
      this.add.text(1015, 552, 'Tuas Susun Bata', {
        fontFamily: 'NusantaraBody, sans-serif',
        fontSize: '12px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12dd',
        padding: { x: 6, y: 3 }
      });

      const wall = this.crackedWalls.create(1650, 430, 'tile_brick');
      wall.setDisplaySize(48, 130).setTint(0xb4492f).refreshBody();
      wall.setData(
        'label',
        this.add.text(1590, 345, 'Bata Retak (Skill Surya)', {
          fontFamily: 'NusantaraBody, sans-serif',
          fontSize: '11.5px',
          color: '#F2E3C2',
          backgroundColor: '#2A1A12dd',
          padding: { x: 5, y: 3 }
        })
      );
    } else if (this.stageConfig.id === 2) {
      this.jungPlatform = this.movingPlatforms.create(1250, 565, 'tile_wood');
      this.jungPlatform.setDisplaySize(192, 40);
      this.jungLabel = this.add.text(1185, 522, 'Anjungan Kapal Jung', {
        fontFamily: 'NusantaraBody, sans-serif',
        fontSize: '12px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12dd',
        padding: { x: 6, y: 3 }
      });
    } else if (this.stageConfig.id === 3) {
      this.switchSiwa = this.add.rectangle(880, 370, 38, 52, 0xb4492f).setStrokeStyle(2, 0xf2e3c2);
      this.add.text(840, 328, 'Arca Siwa', {
        fontSize: '11.5px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12dd',
        padding: { x: 5, y: 2 }
      });

      this.switchBuddha = this.add.rectangle(1060, 598, 38, 52, 0x3b6e7e).setStrokeStyle(2, 0xf2e3c2);
      this.add.text(1015, 555, 'Arca Buddha', {
        fontSize: '11.5px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12dd',
        padding: { x: 5, y: 2 }
      });
    }

    // 3 Blok Prasasti Lempeng Batu Berukir Surya
    const prasastiPositions = [
      { x: 540, y: 390, idx: 0 },
      { x: 1680, y: 375, idx: 1 },
      { x: 2900, y: 285, idx: 2 }
    ];
    prasastiPositions.forEach((bp) => {
      const b = this.prasastiBlocks.create(bp.x, bp.y, 'block_prasasti');
      b.setDisplaySize(54, 54).refreshBody();
      b.setData('factText', this.stageConfig.prasastiBlocks[bp.idx] || this.stageConfig.prasastiBlocks[0]);
      b.setData('used', false);
      this.tweens.add({
        targets: b,
        alpha: { from: 0.88, to: 1 },
        duration: 1100,
        yoyo: true,
        repeat: -1
      });
    });

    // Koin Gobog Sepanjang Stage
    for (let i = 0; i < 22; i++) {
      const cx = 300 + i * 165;
      const cy = i % 2 === 0 ? 595 : 445;
      const c = this.coinsGroup.create(cx, cy, 'coin_gobog');
      c.setDisplaySize(32, 32);
    }

    // Looting Anak Panah (Item Quiver +5 Panah) di Sepanjang Arena
    const quiverSpots = [
      { x: 510, y: 480 },
      { x: 1120, y: 590 },
      { x: 1740, y: 470 },
      { x: 2440, y: 465 },
      { x: 2940, y: 370 },
      { x: 3360, y: 590 }
    ];
    quiverSpots.forEach((qp) => this._spawnArrowLoot(qp.x, qp.y));

    // 3 Artefak dengan Ikon Asli
    const artPositions = [
      { x: 920, y: 360 },
      { x: 2080, y: 345 },
      { x: 3320, y: 445 }
    ];
    this.artifactsList.slice(0, 3).forEach((art, idx) => {
      const pos = artPositions[idx] || artPositions[0];
      const texKey = this.textures.exists(`art_${art.id}`) ? `art_${art.id}` : 'block_prasasti';
      const sprite = this.artifactsGroup.create(pos.x, pos.y, texKey);
      sprite.setDisplaySize(52, 52);
      sprite.setData('artifact', art);

      this.tweens.add({
        targets: sprite,
        y: pos.y - 7,
        duration: 950,
        yoyo: true,
        repeat: -1
      });

      const lbl = this.add.text(pos.x - 48, pos.y - 44, art.name, {
        fontFamily: 'NusantaraBody, sans-serif',
        fontSize: '11px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12dd',
        padding: { x: 5, y: 2 }
      });
      sprite.setData('labelObj', lbl);
    });

    // Checkpoint Pendopo di Tengah Stage
    this.checkpointZone = this.add.rectangle(2250, 598, 64, 88, 0x4f6f3b, 0.4).setStrokeStyle(2, 0xd8a444);
    this.add.text(2195, 525, 'Pendopo Pujangga', {
      fontFamily: 'NusantaraBody, sans-serif',
      fontSize: '11.5px',
      color: '#F2E3C2',
      backgroundColor: '#2A1A12dd',
      padding: { x: 5, y: 2 }
    });

    // Musuh Bayangan Petarung (Melawan dengan Tinju Bela Diri!)
    const enemySpots = [
      { x: 460, y: 550, type: 'bayangan_petarung' },
      { x: 820, y: 550, type: 'bayangan_petarung' },
      { x: 1020, y: 340, type: 'bayangan_petarung' },
      { x: 1580, y: 550, type: 'bayangan_perisai' },
      { x: 2040, y: 330, type: 'bayangan_petarung' },
      { x: 2540, y: 550, type: 'bayangan_petarung' },
      { x: 3020, y: 550, type: 'bayangan_perisai' },
      { x: 3480, y: 550, type: 'bayangan_petarung' }
    ];
    enemySpots.forEach((sp) => this._spawnShadowEnemy(sp.x, sp.y, sp.type));

    if (this.stageConfig.id === 4) {
      this._spawnBossKala(3620, 500);
    }

    // NPC Gerbang Waktu di Ujung Stage (x = 3980)
    this.npcGate = this.add.image(3980, 582, 'npc_gajah_mada').setDisplaySize(90, 126);
    this.add.text(3905, 492, `Gerbang Waktu\n${this.stageConfig.npcName}`, {
      fontFamily: 'NusantaraBody, sans-serif',
      fontSize: '12.5px',
      color: '#D8A444',
      align: 'center',
      backgroundColor: '#2A1A12ee',
      padding: { x: 7, y: 4 }
    });
  }

  _spawnArrowLoot(x, y) {
    if (!this.textures.exists('item_quiver')) return;
    const qv = this.quiversGroup.create(x, y, 'item_quiver');
    qv.setDisplaySize(44, 44);
    qv.setDepth(11);
    this.tweens.add({
      targets: qv,
      y: y - 6,
      duration: 850,
      yoyo: true,
      repeat: -1
    });
    const lbl = this.add.text(x - 28, y - 34, '+5 Panah', {
      fontFamily: 'NusantaraBody, sans-serif',
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#F2D27A',
      backgroundColor: '#2A1A12cc',
      padding: { x: 4, y: 1 }
    }).setDepth(11);
    qv.setData('labelObj', lbl);
  }

  // ==========================================================================
  // MUSUH PETARUNG TINJU & BOSS KALA YANG AKTIF BERGERAK/MELOMPAT
  // ==========================================================================
  _spawnShadowEnemy(x, y, typeKey) {
    const cfg = this.balance.enemies[typeKey] || this.balance.enemies.bayangan_petarung || this.balance.enemies.bayangan_tombak;
    const maxHp = Math.round(cfg.hp * this.modeCfg.enemyHpMultiplier);

    // Pakai sprite Bayangan Petarung (tanpa tombak, bertangan tinju energi cyan-ungu!)
    const tex = this.textures.exists('bayangan_petarung') ? 'bayangan_petarung' : 'bayangan_tombak';
    const enemy = this.enemiesGroup.create(x, y, tex);
    enemy.setDisplaySize(86, 86);
    enemy.body.setSize(enemy.width * 0.62, enemy.height * 0.86);
    enemy.body.setOffset(enemy.width * 0.19, enemy.height * 0.12);
    enemy.setCollideWorldBounds(true);
    enemy.setGravityY(980);
    enemy.setDepth(9);

    if (typeKey === 'bayangan_perisai') enemy.setTint(0x70e2ff);

    enemy.setData('typeKey', typeKey);
    enemy.setData('name', cfg.name);
    enemy.setData('hp', maxHp);
    enemy.setData('maxHp', maxHp);
    enemy.setData('damage', Math.round(cfg.damage * this.modeCfg.enemyDmgMultiplier));
    enemy.setData('speed', cfg.speed || 115);
    enemy.setData('frontImmune', !!cfg.frontImmuneToBasic);
    enemy.setData('homeX', x);
    enemy.setData('patrolDir', -1);
    enemy.setData('punchCooldown', 600);
    enemy.setData('isPunching', false);

    const hpBarGfx = this.add.graphics().setDepth(14);
    enemy.setData('hpBarGfx', hpBarGfx);
    this._drawEnemyHpBar(enemy);
  }

  _spawnBossKala(x, y) {
    const cfg = this.balance.enemies.boss_kala;
    const maxHp = Math.round(cfg.hp * this.modeCfg.enemyHpMultiplier);

    const boss = this.enemiesGroup.create(x, y, 'boss_kala');
    boss.setDisplaySize(172, 172);
    boss.body.setSize(boss.width * 0.66, boss.height * 0.86);
    boss.body.setOffset(boss.width * 0.17, boss.height * 0.12);
    boss.setCollideWorldBounds(true);
    boss.setGravityY(980);
    boss.setDepth(11);

    boss.setData('typeKey', 'boss_kala');
    boss.setData('isBoss', true);
    boss.setData('name', cfg.name);
    boss.setData('hp', maxHp);
    boss.setData('maxHp', maxHp);
    boss.setData('damage', Math.round(cfg.damage * this.modeCfg.enemyDmgMultiplier));
    boss.setData('speed', cfg.speed || 150);
    boss.setData('homeX', x);
    boss.setData('patrolDir', -1);
    boss.setData('punchCooldown', 1100);
    boss.setData('jumpCooldown', 3200);
    boss.setData('dashCooldown', 4800);
    boss.setData('wasAirborne', false);

    const hpBarGfx = this.add.graphics().setDepth(15);
    boss.setData('hpBarGfx', hpBarGfx);
    this._drawEnemyHpBar(boss);
    this.bossUnit = boss;
  }

  _performEnemyPunch(enemy, dirToPlayer) {
    if (!enemy || !enemy.active || enemy.getData('isPunching')) return;
    enemy.setData('isPunching', true);
    enemy.setData('punchCooldown', 1150);

    // Kuda-kuda maju memukul dengan tinju bayangan
    enemy.setFlipX(dirToPlayer > 0);
    enemy.setVelocityX(dirToPlayer * 230);

    const origScaleX = enemy.scaleX;
    const origScaleY = enemy.scaleY;
    this.tweens.add({
      targets: enemy,
      scaleX: origScaleX * 1.22,
      scaleY: origScaleY * 0.92,
      duration: 110,
      yoyo: true,
      onComplete: () => {
        if (enemy.active) {
          enemy.setDisplaySize(86, 86);
          enemy.setData('isPunching', false);
        }
      }
    });

    // Efek Visual Tinju Bayangan (Fist Impact Wave)
    const punchX = enemy.x + dirToPlayer * 52;
    const punchY = enemy.y - 4;
    const fistGfx = this.add.graphics().setDepth(15);
    fistGfx.fillStyle(0x9d4edd, 0.85);
    fistGfx.lineStyle(3, 0x70e2ff, 1);
    fistGfx.fillCircle(punchX, punchY, 20);
    fistGfx.strokeCircle(punchX, punchY, 22);

    this.tweens.add({
      targets: fistGfx,
      alpha: 0,
      duration: 210,
      onComplete: () => fistGfx.destroy()
    });

    // Cek apakah tinju mengenai pemain
    this.time.delayedCall(65, () => {
      if (!enemy.active || !this.player?.active || this.isDashing) return;
      const dist = window.Phaser.Math.Distance.Between(punchX, punchY, this.player.x, this.player.y);
      if (dist <= 78) {
        this._damagePlayer(enemy.getData('damage') || 10);
        this.player.setVelocityX(dirToPlayer * 190);
      }
    });
  }

  _performBossPunch(boss, dirToPlayer) {
    if (!boss || !boss.active) return;
    boss.setData('punchCooldown', 1450);
    boss.setFlipX(dirToPlayer > 0);
    boss.setVelocityX(dirToPlayer * 340);

    this.audioSys.playPunch(3);
    this.cameras.main.shake(150, 0.009);

    const hitX = boss.x + dirToPlayer * 95;
    const hitY = boss.y + 10;
    const smashFx = this.add.image(hitX, hitY, 'vfx_surya').setDisplaySize(115, 115).setTint(0xb4492f).setDepth(16);
    this.tweens.add({
      targets: smashFx,
      scale: 1.55,
      alpha: 0,
      duration: 280,
      onComplete: () => smashFx.destroy()
    });

    if (!this.isDashing && window.Phaser.Math.Distance.Between(hitX, hitY, this.player.x, this.player.y) <= 115) {
      this._damagePlayer(boss.getData('damage') || 18);
      this.player.setVelocity(dirToPlayer * 280, -220);
    }
  }

  _performBossJumpSlam(boss, dirToPlayer) {
    if (!boss || !boss.active || !boss.body.touching.down) return;
    boss.setData('jumpCooldown', 4200);
    boss.setData('wasAirborne', true);
    boss.setFlipX(dirToPlayer > 0);

    // Boss melompat tinggi mengejar posisi pemain!
    boss.setVelocity(dirToPlayer * 275, -560);
    this._showFloatingText(boss.x, boss.y - 90, 'Hentakan Kala!', '#D8A444');
  }

  _drawEnemyHpBar(enemy) {
    const gfx = enemy.getData('hpBarGfx');
    if (!gfx) return;
    gfx.clear();
    const isBoss = enemy.getData('isBoss');
    const w = isBoss ? 120 : 54;
    const h = isBoss ? 10 : 6;
    const bx = enemy.x - w / 2;
    const by = enemy.y - (isBoss ? 102 : 54);
    const ratio = Math.max(0, enemy.getData('hp') / enemy.getData('maxHp'));

    gfx.fillStyle(0x2a1a12, 0.92);
    gfx.fillRoundedRect(bx - 2, by - 2, w + 4, h + 4, 3);
    gfx.fillStyle(isBoss ? 0xd8a444 : 0xb4492f, 1);
    gfx.fillRoundedRect(bx, by, w * ratio, h, 2);
  }

  // ==========================================================================
  // SISTEM SERANGAN SENJATA TERPILIH: KERIS, PANAH JEMPARING, & TOMBAK WAOS
  // ==========================================================================
  performBasicPunch() {
    const now = this.time.now;
    if (now < this.attackLockUntil) return;

    this.selectedWeapon = this.storage.state.profile?.senjata || 'keris';
    this.attackAnimUntil = now + 220;

    if (this.selectedWeapon === 'panah') {
      this._performBowShot(now);
    } else if (this.selectedWeapon === 'tombak') {
      this._performSpearThrust(now);
    } else {
      this._performKerisSlash(now);
    }
  }

  _performBowShot(now) {
    this.attackLockUntil = now + 230;
    this.audioSys.playPunch(1);

    // Jika anak panah habis, lakukan pukulan busur jarak dekat & beri tahu pemain untuk ambil loot panah!
    if (this.arrows <= 0) {
      this._showFloatingText(this.player.x, this.player.y - 48, 'Panah Habis! Ambil Panah (+5) di Arena!', '#E76F51');
      this.heroAttackOffsetX = this.facing * 8;
      this.tweens.add({
        targets: this,
        heroAttackOffsetX: 0,
        duration: 75,
        ease: 'Quad.easeOut'
      });
      const hitX = this.player.x + this.facing * 54;
      const hitY = this.player.y - (this.isCrouching ? -8 : 6);
      this._checkBossPillarHit(hitX, hitY);
      this.enemiesGroup.getChildren().forEach((enemy) => {
        if (!enemy.active) return;
        if (window.Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) <= 82) {
          this._damageEnemy(enemy, Math.round(12 * this.damageMultiplier), false);
        }
      });
      this._syncHUD();
      return;
    }

    // Kurangi 1 anak panah setiap tembakan
    this.arrows = Math.max(0, this.arrows - 1);

    // Hitung arah bidikan (lurus, serong atas, atau serong bawah di udara)
    const aimUp = this.cursors.up.isDown || this.keys.W.isDown || this.touchInput.up;
    const aimDown = (this.cursors.down.isDown || this.keys.S.isDown || this.touchInput.down) && !this.player.body.touching.down;

    let angleDeg = 0;
    if (aimUp) angleDeg = -28;
    else if (aimDown) angleDeg = 28;

    // Hentakan tembakan busur pada visual karakter
    this.heroAttackOffsetX = -this.facing * 8;
    this.tweens.add({
      targets: this,
      heroAttackOffsetX: 0,
      duration: 85,
      ease: 'Quad.easeOut'
    });

    const spawnX = this.player.x + this.facing * 42;
    const spawnY = this.player.y + (this.isCrouching ? 16 : -12);
    const rad = window.Phaser.Math.DegToRad(angleDeg);
    const speed = 760;
    const vx = Math.cos(rad) * speed * this.facing;
    const vy = Math.sin(rad) * speed;

    const arrow = this.projectilesGroup.create(spawnX, spawnY, 'weapon_arrow');
    arrow.setDisplaySize(68, 20);
    arrow.setFlipX(this.facing < 0);
    arrow.setAngle(this.facing > 0 ? angleDeg : -angleDeg);
    arrow.setVelocity(vx, vy);
    arrow.setDepth(14);

    const dmg = Math.round(24 * this.damageMultiplier);
    arrow.setData('damage', dmg);
    arrow.setData('pierceLeft', 1);
    arrow.setData('hitEnemies', new Set());
    arrow.setData('isArrow', true);

    // Cek juga pukulan Pilar Boss saat panah melintas
    this._checkBossPillarHit(spawnX + this.facing * 120, spawnY);

    this.time.delayedCall(1250, () => {
      if (arrow.active) arrow.destroy();
    });
    this._syncHUD();
  }

  _performSpearThrust(now) {
    this.attackLockUntil = now + 240;
    if (now > this.comboResetTimer) this.comboStep = 0;
    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = now + 950;
    this.audioSys.playPunch(this.comboStep);

    // Dorongan tusukan tombak waos pada visual karakter
    this.heroAttackOffsetX = this.facing * 16;
    this.tweens.add({
      targets: this,
      heroAttackOffsetX: 0,
      duration: 90,
      ease: 'Quad.easeOut'
    });

    // Garis kilatan tusukan tombak (jangkauan menengah-jauh 145px, menembus 2 musuh!)
    const thrustGfx = this.add.graphics().setDepth(15);
    const startX = this.player.x + this.facing * 24;
    const endX = this.player.x + this.facing * 155;
    const lineY = this.player.y + (this.isCrouching ? 16 : -8);

    thrustGfx.lineStyle(6, 0xf2d27a, 0.95);
    thrustGfx.beginPath();
    thrustGfx.moveTo(startX, lineY);
    thrustGfx.lineTo(endX, lineY);
    thrustGfx.strokePath();

    this.tweens.add({
      targets: thrustGfx,
      alpha: 0,
      duration: 170,
      onComplete: () => thrustGfx.destroy()
    });

    const baseDmg = (this.balance.hero.comboDamage[this.comboStep - 1] || 18) + 4;
    const dmg = Math.round(baseDmg * this.damageMultiplier);

    this._checkBossPillarHit((startX + endX) / 2, lineY);

    // Tembus maksimal 2 musuh di jalur tusukan tombak
    let hitCount = 0;
    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (!enemy.active || hitCount >= 2) return;
      const dx = (enemy.x - this.player.x) * this.facing;
      const dy = Math.abs(enemy.y - lineY);
      if (dx >= -10 && dx <= 160 && dy <= 75) {
        hitCount++;
        this._damageEnemy(enemy, dmg, this.comboStep === 3);
      }
    });
  }

  _performKerisSlash(now) {
    this.attackLockUntil = now + 195;
    const isAirborne = !this.player.body.touching.down;
    let dmg = this.balance.hero.airKickDamage;

    if (isAirborne) {
      this.audioSys.playPunch(2);
    } else {
      if (now > this.comboResetTimer) this.comboStep = 0;
      this.comboStep = (this.comboStep % 3) + 1;
      this.comboResetTimer = now + 950;
      dmg = this.balance.hero.comboDamage[this.comboStep - 1] || 16;
      this.audioSys.playPunch(this.comboStep);
    }
    dmg = Math.round(dmg * this.damageMultiplier);

    // Hentakan tebasan keris maju ke depan pada visual karakter
    this.heroAttackOffsetX = this.facing * 12;
    this.tweens.add({
      targets: this,
      heroAttackOffsetX: 0,
      duration: 75,
      ease: 'Quad.easeOut'
    });

    const hitX = this.player.x + this.facing * 64;
    const hitY = this.player.y + (this.isCrouching ? 16 : -8);

    // Efek busur tebasan Keris emas-merah
    const slashGfx = this.add.graphics().setDepth(15);
    slashGfx.lineStyle(5, this.comboStep === 3 ? 0xf2d27a : 0xb4492f, 0.95);
    slashGfx.beginPath();
    slashGfx.arc(
      this.player.x + this.facing * 24,
      hitY,
      46,
      this.facing > 0 ? -0.9 : Math.PI - 0.9,
      this.facing > 0 ? 0.9 : Math.PI + 0.9,
      false
    );
    slashGfx.strokePath();
    this.tweens.add({
      targets: slashGfx,
      alpha: 0,
      duration: 165,
      onComplete: () => slashGfx.destroy()
    });

    this._checkBossPillarHit(hitX, hitY);

    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = window.Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
      const reach = enemy.getData('isBoss') ? 120 : 88;
      if (dist <= reach) {
        const isFinisher = this.comboStep === 3;
        this._damageEnemy(enemy, dmg, isFinisher);
        if (isFinisher) {
          this.cameras.main.shake(100, 0.005);
        }
      }
    });
  }

  performSkill1Surya() {
    const now = this.time.now;
    if (now < this.cdSkill1) return;
    this.cdSkill1 = now + this.balance.hero.skill1.cooldownSec * 1000;
    this.attackAnimUntil = now + 260;

    this.audioSys.playSkillSurya();
    this.player.setVelocityX(this.facing * 420);

    const fxX = this.player.x + this.facing * 75;
    const fx = this.add.image(fxX, this.player.y, 'vfx_surya').setDisplaySize(96, 96).setDepth(16);
    this.tweens.add({
      targets: fx,
      angle: 180,
      scale: 1.5,
      alpha: 0,
      duration: 340,
      onComplete: () => fx.destroy()
    });

    this.crackedWalls.getChildren().forEach((wall) => {
      if (!wall.active) return;
      if (window.Phaser.Math.Distance.Between(this.player.x, this.player.y, wall.x, wall.y) < 140) {
        wall.getData('label')?.destroy();
        wall.destroy();
        this.cameras.main.shake(160, 0.01);
      }
    });

    this._checkBossPillarHit(fxX, this.player.y);

    const dmg = Math.round(this.balance.hero.skill1.damage * this.damageMultiplier);
    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (window.Phaser.Math.Distance.Between(fxX, this.player.y, enemy.x, enemy.y) <= 140) {
        this._damageEnemy(enemy, dmg, true);
      }
    });
    this._syncHUD();
  }

  performSkill2Keris() {
    const now = this.time.now;
    if (now < this.cdSkill2) return;

    this.selectedWeapon = this.storage.state.profile?.senjata || 'keris';
    if (this.selectedWeapon === 'panah') {
      if (this.arrows < 3) {
        this._showFloatingText(this.player.x, this.player.y - 48, 'Butuh 3 Anak Panah untuk Hujan Panah!', '#E76F51');
        return;
      }
      this.arrows = Math.max(0, this.arrows - 3);
    }

    this.cdSkill2 = now + this.balance.hero.skill2.cooldownSec * 1000;
    this.attackAnimUntil = now + 280;

    this.audioSys.playSkillSurya();
    const baseDmg = Math.round(this.balance.hero.skill2.damage * this.damageMultiplier);

    if (this.selectedWeapon === 'panah') {
      // JURUS PANAH: Hujan Panah Surya (5 anak panah menyebar & menghujam musuh!)
      const angles = [-26, -13, 0, 10, 20];
      angles.forEach((deg, idx) => {
        this.time.delayedCall(idx * 45, () => {
          if (!this.player?.active) return;
          const rad = window.Phaser.Math.DegToRad(deg);
          const arr = this.projectilesGroup.create(this.player.x + this.facing * 40, this.player.y - 16, 'weapon_arrow');
          arr.setDisplaySize(72, 22);
          arr.setFlipX(this.facing < 0);
          arr.setAngle(this.facing > 0 ? deg : -deg);
          arr.setVelocity(Math.cos(rad) * 720 * this.facing, Math.sin(rad) * 720);
          arr.setData('damage', Math.round(baseDmg * 0.65));
          arr.setData('pierceLeft', 2);
          arr.setData('breaksShield', true);
          arr.setData('hitEnemies', new Set());
          arr.setData('isArrow', true);
          this.time.delayedCall(1400, () => {
            if (arr.active) arr.destroy();
          });
        });
      });
    } else if (this.selectedWeapon === 'tombak') {
      // JURUS TOMBAK: Sapuan Tombak Putar + Gelombang Tombak Menembus
      const ring = this.add.circle(this.player.x, this.player.y, 115, 0xd8a444, 0.35).setStrokeStyle(4, 0xf2d27a).setDepth(15);
      this.tweens.add({
        targets: ring,
        scale: 1.4,
        alpha: 0,
        duration: 280,
        onComplete: () => ring.destroy()
      });
      this.enemiesGroup.getChildren().forEach((enemy) => {
        if (!enemy.active) return;
        if (window.Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= 155) {
          this._damageEnemy(enemy, baseDmg, true);
        }
      });
      const spearWave = this.projectilesGroup.create(this.player.x + this.facing * 50, this.player.y - 6, 'weapon_tombak');
      spearWave.setDisplaySize(110, 32);
      spearWave.setFlipX(this.facing < 0);
      spearWave.setVelocityX(this.facing * 620);
      spearWave.setData('damage', baseDmg);
      spearWave.setData('pierceLeft', 4);
      spearWave.setData('breaksShield', true);
      spearWave.setData('hitEnemies', new Set());
      this.time.delayedCall(1400, () => {
        if (spearWave.active) spearWave.destroy();
      });
    } else {
      // JURUS KERIS: Gelombang Keris Nagasasra
      const wave = this.projectilesGroup.create(this.player.x + this.facing * 45, this.player.y, 'vfx_keris');
      wave.setDisplaySize(76, 44);
      wave.setFlipX(this.facing < 0);
      wave.setVelocityX(this.facing * 580);
      wave.setData('damage', baseDmg);
      wave.setData('pierceLeft', this.balance.hero.skill2.pierceCount);
      wave.setData('breaksShield', true);
      wave.setData('hitEnemies', new Set());

      this.time.delayedCall(1600, () => {
        if (wave.active) wave.destroy();
      });
    }
    this._syncHUD();
  }

  performDash() {
    const now = this.time.now;
    if (now < this.cdDash) return;
    this.cdDash = now + this.balance.hero.dashCooldownMs;
    this.isDashing = true;

    this.player.setVelocityX(this.facing * this.balance.hero.dashSpeed);
    this.heroVisual?.setAlpha(0.6);
    this._spawnStepDust(this.player.x, this.player.body.bottom, 3);
    this.time.delayedCall(this.balance.hero.dashDurationMs, () => {
      this.isDashing = false;
      this.heroVisual?.setAlpha(1);
    });
  }

  performUltimatePalapa() {
    if (this.energy < 100) return;
    this.energy = 0;
    this.audioSys.playGongBoss();
    this.cameras.main.shake(320, 0.015);

    const bigSurya = this.add.image(this.player.x, this.player.y - 30, 'vfx_surya').setDisplaySize(260, 260).setDepth(18);
    this.tweens.add({
      targets: bigSurya,
      scale: 2.2,
      alpha: 0,
      duration: 650,
      onComplete: () => bigSurya.destroy()
    });

    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (window.Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= 380) {
        let ultDmg = this.balance.hero.ultimate.damage;
        if (enemy.getData('isBoss')) {
          ultDmg = Math.min(ultDmg, Math.round(enemy.getData('maxHp') * 0.2));
        }
        this._damageEnemy(enemy, ultDmg, true);
      }
    });
    this._syncHUD();
  }

  performJump() {
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;
    if (onGround) {
      // Fase Persiapan Loncat (jongkok 65ms lalu melesat naik)
      this.jumpPrepUntil = this.time.now + 75;
      this._spawnStepDust(this.player.x, this.player.body.bottom, 3);
      this.player.setVelocityY(-this.balance.hero.jumpForce);
      this.jumpCount = 1;
    } else if (this.jumpCount < 2) {
      this.player.setVelocityY(-this.balance.hero.doubleJumpForce);
      this.jumpCount = 2;
      this._spawnStepDust(this.player.x, this.player.body.bottom, 2);
    }
  }

  _spawnStepDust(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      const dx = window.Phaser.Math.Between(-14, 14);
      const puff = this.add
        .circle(x + dx, y - 4, window.Phaser.Math.Between(4, 8), 0xe6d2aa, 0.55)
        .setDepth(9);
      this.tweens.add({
        targets: puff,
        y: y - window.Phaser.Math.Between(14, 26),
        x: x + dx - this.facing * window.Phaser.Math.Between(8, 20),
        scale: 1.5,
        alpha: 0,
        duration: 260,
        onComplete: () => puff.destroy()
      });
    }
  }

  // Efek Pecah Aksara Kawi Emas saat Bayangan Lupa Dikalahkan (Memulihkan Ingatan!)
  _spawnKawiShatter(x, y) {
    const glyphs = ['ꦄ', 'ꦑ', 'ꦪ', 'ꦱ', 'ꦩ', 'ꦗ'];
    for (let i = 0; i < 5; i++) {
      const ch = glyphs[i % glyphs.length];
      const g = this.add
        .text(x, y, ch, {
          fontFamily: 'NusantaraDisplay, serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#F2D27A',
          stroke: '#2A1A12',
          strokeThickness: 3
        })
        .setDepth(18);
      const angle = (Math.PI * 2 * i) / 5 - 0.5;
      const dist = window.Phaser.Math.Between(36, 68);
      this.tweens.add({
        targets: g,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 22,
        alpha: 0,
        scale: 1.35,
        duration: 560,
        onComplete: () => g.destroy()
      });
    }
  }

  _damageEnemy(enemy, rawDmg, breaksShield) {
    if (!enemy || !enemy.active) return;

    if (enemy.getData('isBoss') && this.bossShieldActive) {
      this._showFloatingText(enemy.x, enemy.y - 50, 'Perisai Aktif! Pukul Pilar A/B/C!', '#D8A444');
      return;
    }

    if (enemy.getData('frontImmune') && !breaksShield) {
      this._showFloatingText(enemy.x, enemy.y - 40, 'Tertangkis! Gunakan Skill Surya/Jurus!', '#F2E3C2');
      return;
    }

    const hp = Math.max(0, enemy.getData('hp') - rawDmg);
    enemy.setData('hp', hp);
    this.energy = Math.min(100, this.energy + 8);

    enemy.setTintFill(0xffffff);
    this.time.delayedCall(65, () => {
      if (!enemy.active) return;
      enemy.clearTint();
      const tk = enemy.getData('typeKey');
      if (tk === 'bayangan_perisai') enemy.setTint(0x70e2ff);
    });

    enemy.setVelocityX(this.facing * 150);
    this._showFloatingText(enemy.x, enemy.y - 35, `-${rawDmg}`, '#F2E3C2');
    this._drawEnemyHpBar(enemy);

    if (
      enemy.getData('isBoss') &&
      !this.bossShieldUsed &&
      hp > 0 &&
      hp <= enemy.getData('maxHp') * 0.5
    ) {
      this._activateBossPrasastiShield(enemy);
    }

    if (hp <= 0) {
      const ex = enemy.x;
      const ey = enemy.y;
      enemy.getData('hpBarGfx')?.destroy();
      const isBoss = enemy.getData('isBoss');
      enemy.destroy();

      // Efek pecah aksara Kawi & drop loot anak panah!
      this._spawnKawiShatter(ex, ey);
      if (!isBoss && (this.selectedWeapon === 'panah' || Math.random() < 0.55)) {
        this._spawnArrowLoot(ex, ey + 10);
      }

      this.storage.addGobog(isBoss ? 25 : 4);
      if (isBoss) {
        this.audioSys.playGongBoss();
        this.callbacks.onBossShieldQuestion?.(null);
        this.callbacks.onNPCDialog?.({
          speaker: 'Kala Penjaga Candi Agung',
          portrait: './public/assets/enemies/boss_kala.png',
          text: 'Kabut Lupa telah sirna! Kesadaranku sebagai penjaga candi telah pulih. Masuki Gerbang Waktu di kanan, Bhayangkara!'
        });
      }
    }
    this._syncHUD();
  }

  _activateBossPrasastiShield(boss) {
    this.bossShieldActive = true;
    this.bossShieldUsed = true;
    this.audioSys.playGongBoss();

    const qObj = this.callbacks.getWeightedBossQuestion?.();
    if (!qObj) {
      this.bossShieldActive = false;
      return;
    }
    this.activeBossQuestion = qObj;

    // Pilih 3 opsi (1 jawaban benar + 2 pengecoh) lalu acak urutannya agar tidak selalu di Pilar A/B!
    const correctOpt = { text: qObj.options[qObj.answer], isCorrect: true };
    const wrongOpts = qObj.options
      .map((text, idx) => ({ text, isCorrect: idx === qObj.answer }))
      .filter((o) => !o.isCorrect)
      .slice(0, 2);
    const pillarChoices = [correctOpt, ...wrongOpts];
    for (let i = pillarChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pillarChoices[i], pillarChoices[j]] = [pillarChoices[j], pillarChoices[i]];
    }

    this.callbacks.onBossShieldQuestion?.(qObj, pillarChoices);
    this.callbacks.onNPCDialog?.({
      speaker: 'Kala Penjaga Candi Agung',
      portrait: './public/assets/enemies/boss_kala.png',
      text: `Ujian Prasasti: "${qObj.prompt}" — Serang Pilar A, B, atau C yang benar!`
    });

    const labels = ['A', 'B', 'C'];
    const baseX = Math.max(3050, Math.min(3550, boss.x - 180));
    this.bossPillars.forEach((p) => p.destroy());
    this.bossPillars = [];

    for (let i = 0; i < 3; i++) {
      const px = baseX + i * 165;
      const py = 575;
      const choice = pillarChoices[i];
      const pillar = this.add.image(px, py, 'block_prasasti').setDisplaySize(60, 88);
      const txt = this.add.text(px - 65, py - 82, `[Pilar ${labels[i]}]\n${choice.text}`, {
        fontFamily: 'NusantaraBody, sans-serif',
        fontSize: '11.5px',
        color: '#F2E3C2',
        backgroundColor: '#2A1A12ee',
        padding: { x: 6, y: 4 },
        wordWrap: { width: 135 }
      });
      this.bossPillars.push({
        idx: i,
        isCorrect: choice.isCorrect,
        x: px,
        y: py,
        destroy: () => {
          pillar.destroy();
          txt.destroy();
        }
      });
    }
  }

  _checkBossPillarHit(hitX, hitY) {
    if (!this.bossShieldActive || !this.activeBossQuestion) return;

    for (const p of this.bossPillars) {
      if (window.Phaser.Math.Distance.Between(hitX, hitY, p.x, p.y) < 95) {
        const isCorrect = Boolean(p.isCorrect);
        this.storage.recordQuestionAttempt(this.activeBossQuestion, isCorrect);

        if (isCorrect) {
          this.bossShieldActive = false;
          this.bossStunUntil = this.time.now + 5000;
          this.bossPillars.forEach((item) => item.destroy());
          this.bossPillars = [];
          this.callbacks.onBossShieldQuestion?.(null);
          this.audioSys.playQuizFeedback(true);
          this.cameras.main.shake(240, 0.012);
          this.callbacks.onNPCDialog?.({
            speaker: 'Mahapatih Gajah Mada',
            portrait: './public/assets/characters/npc_gajah_mada.png',
            text: 'Tepat! Seranganmu memecahkan perisai Kala! Serang sekarang!'
          });
        } else {
          this.audioSys.playQuizFeedback(false);
          this._damagePlayer(15);
          this.callbacks.onNPCDialog?.({
            speaker: 'Kala Penjaga Candi',
            portrait: './public/assets/enemies/boss_kala.png',
            text: `Pilar keliru! Ingat: ${this.activeBossQuestion.explanation}`
          });
        }
        break;
      }
    }
  }

  _damagePlayer(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    this.cameras.main.shake(90, 0.005);
    this._showFloatingText(this.player.x, this.player.y - 50, `-${dmg} HP`, '#B4492F');

    if (this.heroVisual) {
      this.heroVisual.setTint(0xff6666);
      this.time.delayedCall(160, () => {
        if (!this.heroVisual?.active) return;
        const activeCostumeId = this.storage.state.shop.activeCostume || 'bhayangkara';
        const costumeObj = this.balance.shop.costumes.find((c) => c.id === activeCostumeId);
        if (costumeObj && costumeObj.tint && Number(costumeObj.tint) !== 0xffffff) {
          this.heroVisual.setTint(Number(costumeObj.tint));
        } else {
          this.heroVisual.clearTint();
        }
      });
    }

    if (this.hp <= 0) {
      this.hp = this.maxHp;
      this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y - 30);
      this.player.setVelocity(0, 0);
    }
    this._syncHUD();
  }

  _triggerPrasastiBlock(block) {
    if (block.getData('used')) return;
    block.setData('used', true);
    block.setTint(0x7f7065);

    this.storage.addGobog(3);
    this.energy = Math.min(100, this.energy + 12);
    this.arrows = Math.min(this.maxArrows, this.arrows + 5);
    this.audioSys.playCoinGobog();

    const fact = block.getData('factText');
    this.callbacks.onNPCDialog?.({
      speaker: 'Prasasti Surya',
      portrait: './public/assets/items/block_prasasti.png',
      text: fact
    });
    this._syncHUD();
  }

  _showFloatingText(x, y, message, color = '#F2E3C2') {
    const t = this.add.text(x - 28, y, message, {
      fontFamily: 'NusantaraBody, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color,
      stroke: '#2A1A12',
      strokeThickness: 3
    }).setDepth(20);
    this.tweens.add({
      targets: t,
      y: y - 38,
      alpha: 0,
      duration: 700,
      onComplete: () => t.destroy()
    });
  }

  _syncHUD() {
    const now = this.time?.now || 0;
    const s1Ratio = Math.max(0, (this.cdSkill1 - now) / (this.balance.hero.skill1.cooldownSec * 1000));
    const s2Ratio = Math.max(0, (this.cdSkill2 - now) / (this.balance.hero.skill2.cooldownSec * 1000));
    const dashRatio = Math.max(0, (this.cdDash - now) / this.balance.hero.dashCooldownMs);

    this.callbacks.onHUDUpdate?.({
      hp: this.hp,
      maxHp: this.maxHp,
      energy: Math.floor(this.energy),
      gobog: this.storage.state.gobogCoins,
      arrows: this.arrows,
      maxArrows: this.maxArrows,
      weapon: this.selectedWeapon,
      artifactsCount: this.collectedStageArtifacts.length,
      cdRatios: { s1: s1Ratio, s2: s2Ratio, dash: dashRatio }
    });
  }

  update(time, delta) {
    if (!this.player?.body) return;

    // 1. Update Efek Dunia Hidup & Parallax Background Panjang
    this._updateAmbientWorld(time, delta);

    const onGround = this.player.body.touching.down || this.player.body.blocked.down;
    const moveLeft = this.cursors.left.isDown || this.keys.A.isDown || this.touchInput.left || this.touchInput.axisX < -0.22;
    const moveRight = this.cursors.right.isDown || this.keys.D.isDown || this.touchInput.right || this.touchInput.axisX > 0.22;
    const crouchDown = (this.cursors.down.isDown || this.keys.S.isDown || this.touchInput.down) && onGround;
    this.isCrouching = crouchDown;

    // Saat Nunduk (Crouch), perkecil hitbox secara nyata!
    if (crouchDown !== this.wasCrouching) {
      this.wasCrouching = crouchDown;
      this._syncHeroBody(crouchDown);
      if (crouchDown) {
        this._spawnStepDust(this.player.x, this.player.body.bottom, 2);
      }
    }

    // Deteksi Mendarat (Landing Pose + Debu Tanah)
    if (!this.wasOnGround && onGround) {
      this.landAnimUntil = time + 145;
      this._spawnStepDust(this.player.x, this.player.body.bottom, 3);
    }
    this.wasOnGround = onGround;

    // 2. Pergerakan Kiri / Kanan / Jongkok (Nunduk)
    if (!this.isDashing) {
      const speed = crouchDown ? this.balance.hero.moveSpeed * 0.42 : this.balance.hero.moveSpeed;
      if (moveLeft) {
        this.player.setVelocityX(-speed);
        this.player.setFlipX(true);
        this.facing = -1;
      } else if (moveRight) {
        this.player.setVelocityX(speed);
        this.player.setFlipX(false);
        this.facing = 1;
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 3. State Machine Animasi Pose Karakter (Visual Bebas Glitch, Berporos di Telapak Kaki)
    const footX = this.player.x + (this.heroAttackOffsetX || 0);
    const footY = this.player.body.bottom;
    const baseSx = this.baseVisualScaleX;
    const baseSy = this.baseVisualScaleY;

    this.heroVisual.setFlipX(this.facing < 0);

    if (time < this.jumpPrepUntil) {
      // Persiapan loncat (jongkok sekejap)
      this.heroVisual.setPosition(footX, footY);
      this.heroVisual.setScale(baseSx * 1.08, baseSy * 0.82);
      this.heroVisual.setAngle(this.facing * 2);
    } else if (!onGround) {
      this.heroVisual.setPosition(footX, footY);
      if (this.player.body.velocity.y < -35) {
        // Melenting ke atas (stretch vertikal)
        this.heroVisual.setScale(baseSx * 0.94, baseSy * 1.08);
        this.heroVisual.setAngle(-this.facing * 3);
      } else {
        // Meluncur turun (condong ke depan arah gerak)
        this.heroVisual.setScale(baseSx * 1.02, baseSy * 0.98);
        this.heroVisual.setAngle(this.facing * 4);
      }
    } else if (time < this.landAnimUntil || crouchDown) {
      // Nunduk / Mendarat (jongkok rendah & telapak kaki tetap menapak tanah)
      this.heroVisual.setPosition(footX, footY);
      this.heroVisual.setScale(baseSx * 1.1, baseSy * (crouchDown ? 0.72 : 0.88));
      this.heroVisual.setAngle(0);
    } else if (Math.abs(this.player.body.velocity.x) > 15) {
      // Berjalan dinamis: langkah kaki mengangkat berirama & badan condong maju
      const stepCycle = time * 0.016;
      const stepBobY = Math.abs(Math.sin(stepCycle)) * 2.8;
      const walkTilt = this.facing * Math.sin(stepCycle) * 3.2;

      this.heroVisual.setPosition(footX, footY - stepBobY);
      this.heroVisual.setScale(baseSx, baseSy);
      this.heroVisual.setAngle(walkTilt);

      if (time > this.stepDustTimer) {
        this.stepDustTimer = time + 240;
        this._spawnStepDust(footX - this.facing * 10, footY, 1);
      }
    } else {
      // Diam / Stay di tempat: bernapas halus tanpa pergeseran tanah
      const breath = Math.sin(time * 0.0035) * 0.018;
      this.heroVisual.setPosition(footX, footY);
      this.heroVisual.setScale(baseSx, baseSy * (1.0 + breath));
      this.heroVisual.setAngle(0);
    }

    // Update Bayangan Tanah di Bawah Kaki Karakter
    if (this.playerShadow) {
      this.playerShadow.setPosition(this.player.x, footY - 2);
      this.playerShadow.setAlpha(onGround ? 0.52 : 0.24);
      this.playerShadow.setScale(onGround ? (crouchDown ? 1.18 : 1.0) : 0.72);
    }

    // 4. Input Aksi
    if (
      window.Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      window.Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      window.Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
    ) {
      this.performJump();
    }
    if (window.Phaser.Input.Keyboard.JustDown(this.keys.J)) this.performBasicPunch();
    if (window.Phaser.Input.Keyboard.JustDown(this.keys.K)) this.performSkill1Surya();
    if (window.Phaser.Input.Keyboard.JustDown(this.keys.L)) this.performSkill2Keris();
    if (window.Phaser.Input.Keyboard.JustDown(this.keys.SHIFT)) this.performDash();
    if (window.Phaser.Input.Keyboard.JustDown(this.keys.U)) this.performUltimatePalapa();

    if (this.player.y > 705) {
      this._damagePlayer(this.modeCfg.cannotDie ? 0 : 15);
      this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y - 30);
      this.player.setVelocity(0, 0);
    }

    // 5. Mekanik Khas Stage
    if (this.stageConfig.id === 1 && !this.brickBridgeBuilt && this.brickTrigger) {
      if (window.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.brickTrigger.x, this.brickTrigger.y) < 65) {
        this.brickBridgeBuilt = true;
        for (let bx = 1152; bx <= 1344; bx += 64) {
          const t = this.platforms.create(bx, 668, 'tile_brick');
          t.setDisplaySize(64, 64).refreshBody();
        }
        this.audioSys.playQuizFeedback(true);
      }
    } else if (this.stageConfig.id === 2 && this.jungPlatform) {
      this.jungPlatform.x = 1250 + Math.sin(time * 0.0022) * 95;
      this.jungPlatform.y = 565 + Math.cos(time * 0.003) * 16;
      this.jungPlatform.body.updateFromGameObject();
      if (this.jungLabel) {
        this.jungLabel.setPosition(this.jungPlatform.x - 65, this.jungPlatform.y - 42);
      }
    } else if (this.stageConfig.id === 3 && !this.brickBridgeBuilt) {
      if (this.switchSiwa && window.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.switchSiwa.x, this.switchSiwa.y) < 55) {
        this.harmonySwitchesActive.siwa = true;
        this.switchSiwa.setFillStyle(0x4f6f3b);
      }
      if (this.switchBuddha && window.Phaser.Math.Distance.Between(this.player.x, this.player.y, this.switchBuddha.x, this.switchBuddha.y) < 55) {
        this.harmonySwitchesActive.buddha = true;
        this.switchBuddha.setFillStyle(0x4f6f3b);
      }
      if (this.harmonySwitchesActive.siwa && this.harmonySwitchesActive.buddha) {
        this.brickBridgeBuilt = true;
        for (let bx = 1152; bx <= 1344; bx += 64) {
          const t = this.platforms.create(bx, 668, 'tile_brick');
          t.setDisplaySize(64, 64).refreshBody();
        }
        this.audioSys.playQuizFeedback(true);
      }
    }

    if (this.checkpointZone && Math.abs(this.player.x - 2250) < 52 && !this.checkpointReached) {
      this.checkpointReached = true;
      this.lastCheckpoint = { x: 2250, y: 550 };
      this.hp = this.maxHp;
      this.damageMultiplier = 1.35;
      this.audioSys.playQuizFeedback(true);
      this._syncHUD();
    }

    // 6. Update AI Musuh Petarung (Melawan dengan Tinju!) & Boss Kala (Aktif Bergerak/Melompat!)
    this.enemiesGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      this._drawEnemyHpBar(enemy);

      const isBoss = enemy.getData('isBoss');
      const dxToPlayer = this.player.x - enemy.x;
      const absDistX = Math.abs(dxToPlayer);
      const dirToPlayer = dxToPlayer < 0 ? -1 : 1;

      if (isBoss) {
        if (time < this.bossStunUntil) {
          enemy.setVelocityX(0);
          return;
        }

        // Efek hentakan saat Boss Kala mendarat dari lompatan
        const bossOnGround = enemy.body.touching.down || enemy.body.blocked.down;
        if (enemy.getData('wasAirborne') && bossOnGround) {
          enemy.setData('wasAirborne', false);
          this.cameras.main.shake(220, 0.012);
          this._spawnStepDust(enemy.x, enemy.body.bottom, 5);
          if (absDistX < 185 && !this.isDashing) {
            this._damagePlayer(14);
          }
        }

        // Boss Kala aktif mengejar & bertarung di arena (x = 2950 .. 3920)
        if (absDistX < 750) {
          const bossSpeed = enemy.getData('speed') || 150;
          if (absDistX > 85) {
            enemy.setVelocityX(dirToPlayer * bossSpeed);
          } else {
            enemy.setVelocityX(Math.sin(time * 0.008) * 65);
          }
          enemy.setFlipX(dirToPlayer > 0);

          let pCd = (enemy.getData('punchCooldown') || 1000) - delta;
          let jCd = (enemy.getData('jumpCooldown') || 3200) - delta;

          if (absDistX <= 150 && pCd <= 0) {
            this._performBossPunch(enemy, dirToPlayer);
            pCd = 1350;
          } else if (absDistX > 160 && absDistX < 520 && jCd <= 0 && bossOnGround) {
            this._performBossJumpSlam(enemy, dirToPlayer);
            jCd = 3800;
          }

          enemy.setData('punchCooldown', pCd);
          enemy.setData('jumpCooldown', jCd);
        } else {
          // Patroli aktif arena jika pemain masih jauh
          const homeX = enemy.getData('homeX');
          let dir = enemy.getData('patrolDir') || -1;
          if (enemy.x < homeX - 240) dir = 1;
          if (enemy.x > homeX + 180) dir = -1;
          enemy.setData('patrolDir', dir);
          enemy.setVelocityX(dir * 125);
          enemy.setFlipX(dir > 0);
        }
        return;
      }

      // Musuh Biasa (Bayangan Petarung): Kejar & Lawan dengan Tinju saat Pemain Mendekat!
      let punchCd = (enemy.getData('punchCooldown') || 600) - delta;
      enemy.setData('punchCooldown', punchCd);

      if (absDistX < 310 && Math.abs(this.player.y - enemy.y) < 120) {
        if (absDistX > 62 && !enemy.getData('isPunching')) {
          enemy.setVelocityX(dirToPlayer * ((enemy.getData('speed') || 115) * 1.18));
          enemy.setFlipX(dirToPlayer > 0);
        } else if (absDistX <= 84 && punchCd <= 0) {
          this._performEnemyPunch(enemy, dirToPlayer);
        }
      } else if (!enemy.getData('isPunching')) {
        const homeX = enemy.getData('homeX');
        let dir = enemy.getData('patrolDir') || -1;
        if (enemy.x < homeX - 135) dir = 1;
        if (enemy.x > homeX + 135) dir = -1;
        enemy.setData('patrolDir', dir);
        enemy.setVelocityX(dir * (enemy.getData('speed') || 110));
        enemy.setFlipX(dir > 0);
      }
    });

    // Cek panah aktif terhadap Pilar Boss
    this.projectilesGroup.getChildren().forEach((proj) => {
      if (proj.active && proj.getData('isArrow')) {
        this._checkBossPillarHit(proj.x, proj.y);
      }
    });

    if (this.cdSkill1 > time || this.cdSkill2 > time || this.cdDash > time) {
      this._syncHUD();
    }

    // 7. Gerbang Waktu di Ujung Stage Panjang (x >= 3930)
    if (!this.gateTriggered && this.player.x >= 3930) {
      if (this.stageConfig.id === 4 && this.bossUnit && this.bossUnit.active) {
        this.player.x = 3900;
      } else {
        this.gateTriggered = true;
        this.player.setVelocity(0, 0);
        const elapsedSec = Math.round((Date.now() - this.stageStartTime) / 1000);
        this.callbacks.onReachTimeGate?.({
          stageId: this.stageConfig.id,
          elapsedSec,
          artifactsCollected: this.collectedStageArtifacts
        });
      }
    }
  }
}
