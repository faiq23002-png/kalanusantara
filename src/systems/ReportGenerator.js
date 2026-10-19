// ============================================================================
// src/systems/ReportGenerator.js
// Generator Lontar Rapor Pendekar Bhayangkara (Render ke Canvas & Unduh .PNG)
// Dirancang di atas tekstur kertas lontar (#F2E3C2) dengan cincin progres per stage
// dan 1 kalimat saran personal spesifik (Sumpah Palapa 1334 M & ID Kartu Valid).
// ============================================================================

export function getPersonalAdviceData(storage, cardsData) {
  const missedCard = storage.getMostMissedCard(cardsData);
  const adviceMap = {
    s1c1: 'Ulang bagian tahun berdirinya Majapahit (1293 M) oleh Raden Wijaya.',
    s1c2: 'Ulang bagian asal-usul nama Majapahit dari buah maja yang pahit di hutan Tarik.',
    s1c3: 'Ulang bagian letak ibu kota Majapahit di Trowulan, Mojokerto.',
    s1c4: 'Ulang bagian teknik bata gosok-rekat (kosod) dan Gapura Wringin Lawang.',
    s1c5: 'Ulang bagian fungsi uang logam Gobog dan celengan terakota Trowulan.',
    s2c1: 'Ulang bagian peran Majapahit sebagai kerajaan agraris sekaligus maritim.',
    s2c2: 'Ulang bagian fungsi jalur perdagangan Sungai Brantas ke pelabuhan laut.',
    s2c3: 'Ulang bagian teknologi dan fungsi Kapal Jung armada bahari Majapahit.',
    s2c4: 'Ulang bagian komoditas utama beras dan rempah-rempah Nusantara.',
    s2c5: 'Ulang bagian hubungan persahabatan negeri tetangga (Mitreka Satata).',
    s3c1: 'Ulang bagian kemajuan karya sastra pada masa Raja Hayam Wuruk.',
    s3c2: 'Ulang bagian Kitab Negarakertagama (1365 M) karya Mpu Prapanca.',
    s3c3: 'Ulang bagian Kitab Sutasoma karya Mpu Tantular dan semboyan Bhinneka Tunggal Ika.',
    s3c4: 'Ulang bagian makna Bhinneka Tunggal Ika (berbeda-beda tetapi tetap satu).',
    s3c5: 'Ulang bagian kerukunan Hindu-Siwa & Buddha serta petirtaan Candi Tikus.',
    s4c1: 'Ulang bagian masa puncak kejayaan Raja Hayam Wuruk (1350–1389 M).',
    s4c2: 'Ulang bagian peran kepemimpinan Mahapatih Gajah Mada.',
    s4c3: 'Ulang bagian ikrar Sumpah Palapa Mahapatih Gajah Mada (1334 M).',
    s4c4: 'Ulang bagian wilayah Nusantara yang disebut dalam Sumpah Palapa.',
    s4c5: 'Ulang bagian bentuk pengaruh dan hubungan dagang Majapahit di Nusantara.'
  };
  const sentence = (missedCard && adviceMap[missedCard.id])
    ? adviceMap[missedCard.id]
    : `Ulang bagian ${missedCard ? missedCard.title.toLowerCase() : 'tahun berdirinya Majapahit (1293 M)'}.`;

  return {
    sentence,
    card: missedCard || cardsData[0]
  };
}

export function downloadRaporPNG(storage, stagesData, artifactsData, cardsData = []) {
  const state = storage.state;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');

  // 1. Latar Kertas Lontar (#F5E8C8 -> #E2CC9F)
  const grad = ctx.createLinearGradient(0, 0, 0, 760);
  grad.addColorStop(0, '#F5E8C8');
  grad.addColorStop(1, '#E2CC9F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 760);

  // Serat halus kertas lontar
  ctx.strokeStyle = 'rgba(139, 98, 48, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 24; y < 740; y += 16) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(1050, y);
    ctx.stroke();
  }

  // Bingkai Ukiran Tipis Teak & Emas Tua
  ctx.strokeStyle = '#2A1A12';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, 1032, 712);
  ctx.strokeStyle = '#D8A444';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1008, 688);

  // 2. Header Rapor Lontar
  ctx.fillStyle = '#B4492F';
  ctx.font = 'bold 32px "NusantaraDisplay", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('LONTAR RAPOR PENDEKAR BHAYANGKARA', 540, 92);

  ctx.fillStyle = '#2A1A12';
  ctx.font = 'bold 19px "NusantaraBody", sans-serif';
  ctx.fillText(
    `Pendekar: ${state.playerName}   •   Mode: ${state.gameMode === 'belajar' ? 'Belajar (Anti-Gagal)' : 'Tantangan'}   •   Artefak: ${state.collectedArtifacts.length}/${artifactsData.length}`,
    540,
    130
  );

  // 3. Empat Cincin Progres Per Stage
  const ringRadius = 60;
  const startX = 180;
  const gapX = 240;
  const centerY = 282;

  stagesData.forEach((st, idx) => {
    const rec = state.stageRecords[st.id] || { stars: 0, bestAccuracy: 0, cleared: false };
    const cx = startX + idx * gapX;
    const pct = Math.max(0, Math.min(100, rec.bestAccuracy || 0));

    // Kotak Lontar per stage
    ctx.fillStyle = '#EFE0BA';
    ctx.fillRect(cx - 106, 175, 212, 290);
    ctx.strokeStyle = 'rgba(42, 26, 18, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 106, 175, 212, 290);

    // Lingkaran dasar cincin
    ctx.beginPath();
    ctx.arc(cx, centerY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(42, 26, 18, 0.16)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Busur progres
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * pct) / 100;
    ctx.beginPath();
    ctx.arc(cx, centerY, ringRadius, startAngle, endAngle);
    ctx.strokeStyle = pct >= 60 ? '#4F6F3B' : '#B4492F';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Angka persentase di tengah cincin
    ctx.fillStyle = '#2A1A12';
    ctx.font = 'bold 26px "NusantaraBody", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${pct}%`, cx, centerY + 9);

    // Nama Stage & Bintang (dengan pembungkus baris agar tidak tumpang tindih)
    ctx.fillStyle = '#2A1A12';
    ctx.font = 'bold 18px "NusantaraDisplay", serif';
    ctx.fillText(`Stage ${st.id}`, cx, 385);

    ctx.font = '13.5px "NusantaraBody", sans-serif';
    const shortSub = st.subtitle.length > 28 ? `${st.subtitle.slice(0, 27)}…` : st.subtitle;
    ctx.fillText(shortSub, cx, 410);

    ctx.fillStyle = '#B4492F';
    ctx.font = 'bold 15px "NusantaraBody", sans-serif';
    ctx.fillText(`Bintang: ${rec.stars}/3`, cx, 442);
  });

  // 4. Kotak Saran Personal (1 Kalimat Spesifik)
  const advice = getPersonalAdviceData(storage, cardsData);
  ctx.fillStyle = '#2A1A12';
  ctx.fillRect(74, 495, 932, 132);
  ctx.strokeStyle = '#D8A444';
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 495, 932, 132);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#D8A444';
  ctx.font = 'bold 20px "NusantaraDisplay", serif';
  ctx.fillText('Saran Belajar Personal:', 104, 536);

  ctx.fillStyle = '#F2E3C2';
  ctx.font = 'bold 21px "NusantaraBody", sans-serif';
  ctx.fillText(`"${advice.sentence}"`, 104, 574);

  ctx.fillStyle = '#C7B28E';
  ctx.font = '15.5px "NusantaraBody", sans-serif';
  ctx.fillText(
    `Kartu rujukan: ${advice.card ? advice.card.title : 'Pendiri & Tahun Berdiri (1293 M)'} — Tujuan Pembelajaran dipetakan ke CP SK BSKAP 032/H/KR/2024`,
    104,
    606
  );

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5A3E2B';
  ctx.font = 'bold 15px "NusantaraBody", sans-serif';
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillText(`Kala Nusantara: Bhayangkara Majapahit • Dicetak pada ${dateStr}`, 540, 695);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Lontar-Rapor-${state.playerName.replace(/\s+/g, '_')}.png`;
  link.href = dataUrl;
  link.click();
}
