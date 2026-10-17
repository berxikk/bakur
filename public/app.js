const AMED_ID = '132335';

let appState = {
  lang: localStorage.getItem('amed_lang') || 'tr',
  data: null,
  players: [],
  fixtureFilter: 'all',
  fixtureViewMode: 'calendar',
  pastResultFilter: 'ALL',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calInitialized: false,
  posFilter: 'ALL',
  playerSearch: '',
  selectedRound: null,
  activeModalEventId: null,
  activeModalData: null,
  activeModalTab: 'summary',
  commActiveFilter: 'all',
  statsActiveFilter: 'all',
  modalLiveInterval: null,
  countdownTimer: null
};

// 1. Eş Zamanlı Veri ve Önbellek Hidrasyonu (Sıfır Bekleme / 0ms Instant Hydration)
try {
  if (window.__INITIAL_DATA__ && window.__INITIAL_DATA__.club) {
    appState.data = window.__INITIAL_DATA__;
    localStorage.setItem('amed_cached_dashboard', JSON.stringify(window.__INITIAL_DATA__));
  } else {
    const localD = localStorage.getItem('amed_cached_dashboard');
    if (localD) appState.data = JSON.parse(localD);
  }
} catch (e) {}

try {
  if (window.__INITIAL_SQUAD__ && Array.isArray(window.__INITIAL_SQUAD__.players)) {
    appState.players = window.__INITIAL_SQUAD__.players;
    localStorage.setItem('amed_cached_squad', JSON.stringify(window.__INITIAL_SQUAD__.players));
  } else {
    const localS = localStorage.getItem('amed_cached_squad');
    if (localS) appState.players = JSON.parse(localS);
  }
} catch (e) {}

if (appState.data?.rounds?.currentRound) {
  appState.selectedRound = appState.data.rounds.currentRound;
}

/* =========================================================
   4 DİLLİ TAM ÇEVİRİ SÖZLÜĞÜ (TR, KU, EN, DE)
   ========================================================= */
const I18N = {
  tr: {
    locale: 'tr-TR',
    superLig: 'Süper Lig',
    navOverview: 'Genel Bakış',
    navCalendar: 'Maç Takvimi',
    navPastDetails: 'Önceki Maç Detayları',
    navStandings: 'Puan Durumu',
    navSquad: 'Kadro',
    navMatchweek: 'Haftanın Maçları',
    navPosts: 'Gönderiler',
    navFeed: 'Kulüp Akışı',
    loading: 'Yükleniyor...',
    kpiRankLabel: 'Süper Lig Sıralaması',
    kpiRecordLabel: 'Sezon Performansı (G / B / M)',
    kpiGoalsLabel: 'Gol İstatistiği & Averaj',
    kpiFormLabel: 'Son 5 Maç Formu',
    kpiFormHint: 'Önceki maç detayı için kutucuğa tıklayın',
    rankSuffix: '. Sıra',
    pointsText: 'Puan',
    ppgText: 'Maç Başı',
    matchesPlayedText: 'Maç Oynandı',
    goalDiffText: 'Averaj',
    formCodes: { W: 'G', D: 'B', L: 'M' },
    upcomingTitle: 'Yaklaşan Amedspor Maçları',
    recentTitle: 'Son Oynanan Maçlar',
    btnFullCalendar: 'Maç Takvimi',
    miniTableTitle: 'Süper Lig Puan Tablosu',
    btnFullTable: 'Detaylı Tablo',
    thRank: 'Sıra',
    thClub: 'Kulüp',
    thP: 'O',
    thW: 'G',
    thD: 'B',
    thL: 'M',
    thGF: 'AG',
    thGA: 'YG',
    thGD: 'AV',
    thPts: 'Puan',
    thPtsShort: 'P',
    calTitle: 'Amedspor Sezon Maç Takvimi',
    calThisMonth: 'Bu Ay',
    viewCalendar: 'Takvim',
    viewList: 'Liste',
    legWin: 'Galibiyet',
    legDraw: 'Beraberlik',
    legLoss: 'Mağlubiyet',
    legUpcoming: 'Yaklaşan Maç',
    calClickHint: 'Önceki maç detayları ve istatistikler için maç gününe tıklayın',
    allSeasonMatches: 'Sezonun Tüm Karşılaşmaları',
    filterAll: 'Tümü',
    filterFinished: 'Oynananlar',
    filterUpcoming: 'Yaklaşanlar',
    pastDetailsHeader: 'Amedspor Önceki Maç Detayları & İstatistik Raporları',
    pastDetailsSub: 'Oynanan her karşılaşmanın gol dakikaları, dizilişleri, hakemi, karşılaştırmalı temel istatistikleri ve 28 verilik tam maç raporu',
    filterAllPlayed: 'Tüm Oynananlar',
    standingsFullTitle: 'Trendyol Süper Lig Canlı Puan Durumu',
    uclSpot: 'Şampiyonlar Ligi',
    uelSpot: 'Avrupa Kupaları',
    relSpot: 'Düşme Hattı',
    posAll: 'Tüm Kadro',
    posGK: 'Kaleci',
    posDEF: 'Defans',
    posMID: 'Orta Saha',
    posFWD: 'Forvet',
    searchPlaceholder: 'Futbolcu adı, mevki veya ülke ara...',
    matchweekTitle: 'Süper Lig Haftanın Maçları ve Canlı Skorlar',
    btnPrev: 'Önceki',
    btnNext: 'Sonraki',
    mtabSummary: 'Özet',
    mtabStats: 'İstatistikler',
    mtabLineups: 'Kadrolar',
    mtabCommentary: 'Canlı Anlatım',
    mtabPrevious: 'Önceki Maçlar',
    tagNextMatch: 'SIRADAKİ MAÇ',
    tagLiveMatch: 'CANLI OYNANIYOR',
    tagLastMatch: 'SON OYNANAN MAÇ (ÖNCEKİ MAÇ RAPORU)',
    ctaUpcomingPrevDetails: 'Önceki Maç Detayları & İstatistikler',
    ctaFinishedDetails: 'Önceki Maç Detay Raporu & 28 İstatistik',
    upcomingPreBanner: 'İki Takımın Önceki Maç Detayları & İstatistik Kıyaslaması',
    roundWord: 'Hafta',
    roundShort: 'H',
    homeBadge: 'İÇ SAHA',
    awayBadge: 'DEP',
    homeTeamSub: 'Ev Sahibi',
    awayTeamSub: 'Deplasman',
    todayTag: 'Bugün',
    matchCountWord: 'Maç',
    fullTimeText: 'Maç Sonucu',
    halfTimeText: 'İlk Yarı',
    startingSoon: 'Başlamak Üzere',
    cdUnits: { d: 'g', h: 's', m: 'dk' },
    winPts: 'GALİBİYET • +3 PUAN',
    drawPts: 'BERABERLİK • +1 PUAN',
    lossPts: 'MAĞLUBİYET • 0 PUAN',
    formationWord: 'Diziliş',
    noGoalCard: 'Gol / Kart Yok',
    refereeWord: 'Hakem',
    btnAll28Stats: 'Tüm 28 İstatistik & Kadro Raporu',
    ageHeightLbl: 'YAŞ / BOY',
    ageWord: 'Yaş',
    footLbl: 'KULLANDIĞI AYAK',
    marketValLbl: 'PİYASA DEĞERİ',
    stadiumCityLbl: 'Stadyum & Şehir',
    matchRefereeLbl: 'Karşılaşma Hakemi',
    tacticalFormLbl: 'Taktik Dizilişler',
    htFtLbl: 'İlk Yarı / Maç Sonu',
    keyStatsBoxTitle: 'Öne Çıkan Maç İstatistikleri Özeti',
    btnSeeAll28: 'Tüm 28 İstatistiği Gör',
    timelineTitle: 'Kronolojik Kırılma Anları (Goller, Kartlar & Değişiklikler)',
    totalEventsWord: 'Olay',
    benchHeader: 'YEDEK KULÜBESİ VE SONRADAN GİRENLER',
    seasonCompTitle: 'İki Takımın Sezon İstatistikleri & Performans Kıyaslaması',
    prev5Title: 'Önceki 5 Maç Detayları & Skorları',
    prevClickHint: 'Aşağıdaki önceki maçlardan herhangi birine tıklayarak o maçın 28 istatistiklik tam detay raporunu açabilirsiniz.',
    modalEmptySummaryTitle: 'Maç Henüz Başlamadı',
    modalEmptySummaryDesc: 'Özet ve kırılma anları karşılaşma başladıktan sonra canlı olarak güncellenecektir.',
    modalEmptyStatsTitle: 'Canlı İstatistikler Bekleniyor',
    modalEmptyStatsDesc: 'Bu karşılaşmaya ait 28 veri kategorisi maç başlama düdüğü ile birlikte aktarılacaktır.',
    modalEmptyLineupsTitle: 'Kadrolar Henüz Açıklanmadı',
    modalEmptyLineupsDesc: 'İlk 11\'ler ve yedek kulübesi maç saatinden yaklaşık 1 saat önce resmi olarak sisteme düşmektedir.',
    modalEmptyCommTitle: 'Canlı Anlatım Bekleniyor',
    modalEmptyCommDesc: 'Dakika dakika önemli pozisyonlar ve maç anlatımı karşılaşma başladığında burada yer alacaktır.',
    modalGoToPrevStats: 'İki Takımın İstatistik Kıyaslamasını Gör',
    weekdays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    shortMonths: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    statCategories: {
      overview: 'Genel Oyun & Hakimiyet',
      attack: 'Hücum & Şut Analizi',
      passing: 'Pas & Oyun Kurulumu',
      defense: 'Savunma & İkili Mücadele',
      discipline: 'Disiplin & Kartlar'
    },
    statsMap: {
      possessionPct: 'Topla Oynama (%)',
      totalShots: 'Toplam Şut',
      shotsOnTarget: 'İsabetli Şut',
      shotPct: 'Şut İsabet Oranı (%)',
      blockedShots: 'Engellenen Şut',
      penaltyKickGoals: 'Penaltı Golü',
      penaltyKickShots: 'Kullanılan Penaltı',
      wonCorners: 'Kazanılan Korner',
      offsides: 'Ofsayt',
      saves: 'Kaleci Kurtarışı',
      totalPasses: 'Toplam Pas',
      accuratePasses: 'İsabetli Pas',
      passPct: 'Pas İsabet Oranı (%)',
      totalCrosses: 'Toplam Orta',
      accurateCrosses: 'İsabetli Orta',
      crossPct: 'Orta İsabet Oranı (%)',
      totalLongBalls: 'Uzun Pas / Uzun Top',
      accurateLongBalls: 'İsabetli Uzun Top',
      longballPct: 'Uzun Top İsabet Oranı (%)',
      totalTackles: 'Toplam Top Çalma Girişimi',
      effectiveTackles: 'Başarılı Top Çalma',
      tacklePct: 'Top Çalma Başarı Oranı (%)',
      interceptions: 'Pas Arası (Interception)',
      totalClearance: 'Toplam Uzaklaştırma',
      effectiveClearance: 'Başarılı Uzaklaştırma',
      foulsCommitted: 'Yapılan Faul',
      yellowCards: 'Sarı Kart',
      redCards: 'Kırmızı Kart',
      expectedGoals: 'Beklenen Gol (xG)',
      dangerousAttacks: 'Tehlikeli Hücum',
      totalAttacks: 'Toplam Hücum',
      shotsInsideBox: 'Ceza Sahası İçi Şut',
      shotsOutsideBox: 'Ceza Sahası Dışı Şut',
      bigChancesCreated: 'Net Fırsat (Büyük Şans)',
      duelsWonPct: 'İkili Mücadele Kazanma (%)',
      aerialDuelsWonPct: 'Hava Topu Mücadelesi (%)'
    }
  },

  ku: {
    locale: 'ku-TR',
    superLig: 'Sûper Lîg',
    navOverview: 'Nêrîna Giştî',
    navCalendar: 'Salnameya Maçan',
    navPastDetails: 'Hûrguliyên Maçên Berê',
    navStandings: 'Rewşa Pûanan',
    navSquad: 'Kadro',
    navMatchweek: 'Maçên Hefteyê',
    navPosts: 'Parvekirin',
    navFeed: 'Herikîna Klûbê',
    loading: 'Tê barkirin...',
    kpiRankLabel: 'Rêza Sûper Lîgê',
    kpiRecordLabel: 'Performansa demsalê (S / W / T)',
    kpiGoalsLabel: 'Îstatîstîka Golan & Averaj',
    kpiFormLabel: 'Forma 5 Maçên Dawî',
    kpiFormHint: 'Ji bo hûrguliyên maça berê bitikînin',
    rankSuffix: '. Rêz',
    pointsText: 'Pûan',
    ppgText: 'Serê Maçê',
    matchesPlayedText: 'Maç Hat Lîstin',
    goalDiffText: 'Averaj',
    formCodes: { W: 'S', D: 'W', L: 'T' },
    upcomingTitle: 'Maçên Amedsporê yên Nêzîk',
    recentTitle: 'Maçên Dawî yên Lîstî',
    btnFullCalendar: 'Salnameya Maçan',
    miniTableTitle: 'Tabloya Pûanan a Sûper Lîgê',
    btnFullTable: 'Tabloya Berfireh',
    thRank: 'Rêz',
    thClub: 'Yaneya Sporê',
    thP: 'L',
    thW: 'S',
    thD: 'W',
    thL: 'T',
    thGF: 'GA',
    thGA: 'GX',
    thGD: 'AV',
    thPts: 'Pûan',
    thPtsShort: 'P',
    calTitle: 'Salnameya Maçên Demsalê ya Amedsporê',
    calThisMonth: 'Ev Meh',
    viewCalendar: 'Salname',
    viewList: 'Lîste',
    legWin: 'Serkeftin',
    legDraw: 'wekhevî',
    legLoss: 'Têkçûn',
    legUpcoming: 'Maça Nêzîk',
    calClickHint: 'Ji bo hûrgulî û îstatîstîkên maçên berê li ser roja maçê bitikînin',
    allSeasonMatches: 'Hemû Maçên Demsalê',
    filterAll: 'Hemû',
    filterFinished: 'Yên Lîstî',
    filterUpcoming: 'Yên Nêzîk',
    pastDetailsHeader: 'Hûrguliyên Maçên Berê û Raporên Îstatîstîkê yên Amedsporê',
    pastDetailsSub: 'Deqîqeyên golan, rêzkirin, hakem, îstatîstîkên bingehîn û rapora 28 daneyan a her maça lîstî',
    filterAllPlayed: 'Hemû Maçên Lîstî',
    standingsFullTitle: 'Rewşa Pûanan a Zindî ya Sûper Lîgê',
    uclSpot: 'Lîga Şampiyonan',
    uelSpot: 'Kûpayên Ewropayê',
    relSpot: 'Xeta Ketinê',
    posAll: 'Hemû Kadro',
    posGK: 'Golparêz',
    posDEF: 'Berevanî',
    posMID: 'Navend',
    posFWD: 'Êrîşkar',
    searchPlaceholder: 'Navê lîstikvan, mewkî an welat bigere...',
    matchweekTitle: 'Maçên Hefteyê û Skorên Zindî yên Sûper Lîgê',
    btnPrev: 'Berê',
    btnNext: 'Paşê',
    mtabSummary: 'Kurte',
    mtabStats: 'Statîstîk',
    mtabLineups: 'Kadro',
    mtabCommentary: 'Vegotina Zindî',
    mtabPrevious: 'Maçên Berê',
    tagNextMatch: 'MAÇA DÛV RE',
    tagLiveMatch: 'ZINDÎ TÊ LÎSTIN',
    tagLastMatch: 'MAÇA DAWÎ (RAPORA MAÇA BERÊ)',
    ctaUpcomingPrevDetails: 'Hûrgulî û Îstatîstîkên Maçên Berê',
    ctaFinishedDetails: 'Rapora Maça Berê & 28 Îstatîstîk',
    upcomingPreBanner: 'Hûrguliyên Maçên Berê & Berawirdkirina Îstatîstîkên Her Du Tîman',
    roundWord: 'Hefte',
    roundShort: 'H',
    homeBadge: 'MAL',
    awayBadge: 'DER',
    homeTeamSub: 'Xwediyê Malê',
    awayTeamSub: 'Mêvan',
    todayTag: 'Îro',
    matchCountWord: 'Maç',
    fullTimeText: 'Encama Maçê',
    halfTimeText: 'Nîveka Yekem',
    startingSoon: 'Nêzîkî Destpêkirinê',
    cdUnits: { d: 'r', h: 's', m: 'x' },
    winPts: 'SERKEFTIN • +3 PÛAN',
    drawPts: 'WEKHEVÎ • +1 PÛAN',
    lossPts: 'TÊKÇÛN • 0 PÛAN',
    formationWord: 'Rêzkirin',
    noGoalCard: 'Gol / Kart Tune',
    refereeWord: 'Hakem',
    btnAll28Stats: 'Hemû 28 Îstatîstîk & Rapora Kadroyê',
    ageHeightLbl: 'TEMEN / BEJN',
    ageWord: 'Salî',
    footLbl: 'LINGÊ BIKARANÎNÊ',
    marketValLbl: 'NIRXÊ BAZARÊ',
    stadiumCityLbl: 'Stadyûm & Bajar',
    matchRefereeLbl: 'Hakemê Maçê',
    tacticalFormLbl: 'Rêzkirinên Taktîkî',
    htFtLbl: 'Nîveka Yekem / Encam',
    keyStatsBoxTitle: 'Kurteya Îstatîstîkên Sereke yên Maçê',
    btnSeeAll28: 'Hemû 28 Îstatîstîkan Bibîne',
    timelineTitle: 'Kêliyên Girîng (Gol, Kart & Guhertin)',
    totalEventsWord: 'Bûyer',
    benchHeader: 'YEDEK Û LÎSTIKVANÊN DÛV RE KETIN LÎSTIKÊ',
    seasonCompTitle: 'Berawirdkirina Îstatîstîk û Performansa Demsalê ya Her Du Tîman',
    prev5Title: 'Hûrguliyên 5 Maçên Berê & Skor',
    prevClickHint: 'Ji bo dîtina rapora 28 îstatîstîkan a her maça berê li ser wê maçê bitikînin.',
    modalEmptySummaryTitle: 'Maç Hîn Dest Pê Nekiriye',
    modalEmptySummaryDesc: 'Kurte û kêliyên girîng piştî destpêkirina maçê dê zindî bên nûkirin.',
    modalEmptyStatsTitle: 'Li Hêviya Îstatîstîkên Zindî',
    modalEmptyStatsDesc: '28 kategoriyên îstatîstîkê bi fîkera destpêkê re dê li vir bên nîşandan.',
    modalEmptyLineupsTitle: 'Kadro Hîn Nehatiye Eşkerekirin',
    modalEmptyLineupsDesc: '11\'ên yekem û lîstikvanên yedek nêzîkî 1 saet beriya maçê tên ragihandin.',
    modalEmptyCommTitle: 'Li Hêviya Vegotina Zindî',
    modalEmptyCommDesc: 'Vegotina deqîqe bi deqîqe ya pozîsyonên girîng bi destpêkirina maçê re dê li vir be.',
    modalGoToPrevStats: 'Berawirdkirina Îstatîstîkan Bibîne',
    weekdays: ['Duşem', 'Sêşem', 'Çarşem', 'Pêncşem', 'În', 'Şemî', 'Yekşem'],
    months: ['Rêbendan', 'Reşemî', 'Adar', 'Avrêl', 'Gulan', 'Pûşper', 'Tîrmeh', 'Gelawêj', 'Rezber', 'Kewçêr', 'Sermawez', 'Berfanbar'],
    shortMonths: ['Rêb', 'Reş', 'Ada', 'Avr', 'Gul', 'Pûş', 'Tîr', 'Gel', 'Rez', 'Kew', 'Ser', 'Ber'],
    statCategories: {
      overview: 'Lîstika Giştî & Serwerî',
      attack: 'Êrîş & Analîza Şûtan',
      passing: 'Pas & Avakirina Lîstikê',
      defense: 'Berevanî & Têkoşîn',
      discipline: 'Dîsîplîn & Kart'
    },
    statsMap: {
      possessionPct: 'Kontrola Gopikê (%)',
      totalShots: 'Giştî Şût',
      shotsOnTarget: 'Şûtên li ser Kela',
      shotPct: 'Rêjeya Şûtên Rast (%)',
      blockedShots: 'Şûtên Astengkirî',
      penaltyKickGoals: 'Gola Penaltiyê',
      penaltyKickShots: 'Penaltiyên Bikaranî',
      wonCorners: 'Korner',
      offsides: 'Ofsayt',
      saves: 'Xilaskirina Golparêz',
      totalPasses: 'Giştî Pas',
      accuratePasses: 'Pasên Rast',
      passPct: 'Rêjeya Pasên Rast (%)',
      totalCrosses: 'Giştî Orta',
      accurateCrosses: 'Ortayên Rast',
      crossPct: 'Rêjeya Ortayan (%)',
      totalLongBalls: 'Gopikên Dirêj',
      accurateLongBalls: 'Gopikên Dirêj ên Rast',
      longballPct: 'Rêjeya Gopikên Dirêj (%)',
      totalTackles: 'Hewldana Stendina Gopikê',
      effectiveTackles: 'Stendina Gopikê ya Serkeftî',
      tacklePct: 'Rêjeya Stendina Gopikê (%)',
      interceptions: 'Birîna Pasê',
      totalClearance: 'Dûrxistina Gopikê',
      effectiveClearance: 'Dûrxistina Serkeftî',
      foulsCommitted: 'Faûl',
      yellowCards: 'Karta Zer',
      redCards: 'Karta Sor',
      expectedGoals: 'Gola Hêvîkirî (xG)',
      dangerousAttacks: 'Êrîşa Xeternak',
      totalAttacks: 'Hemû Êrîş',
      shotsInsideBox: 'Şûta Nav Qadê',
      shotsOutsideBox: 'Şûta Dervayî Qadê',
      bigChancesCreated: 'Derfeta Mezin',
      duelsWonPct: 'Pevçûnên Qezenckirî (%)',
      aerialDuelsWonPct: 'Topên Hewayî (%)'
    }
  },

  en: {
    locale: 'en-GB',
    superLig: 'Süper Lig',
    navOverview: 'Overview',
    navCalendar: 'Match Calendar',
    navPastDetails: 'Previous Match Details',
    navStandings: 'Standings',
    navSquad: 'Squad',
    navMatchweek: 'Matchweek',
    navPosts: 'Posts',
    navFeed: 'Club Feed',
    loading: 'Loading...',
    kpiRankLabel: 'Süper Lig Standing',
    kpiRecordLabel: 'Season Record (W / D / L)',
    kpiGoalsLabel: 'Goals & Goal Difference',
    kpiFormLabel: 'Last 5 Matches Form',
    kpiFormHint: 'Click a badge for previous match details',
    rankSuffix: 'th Place',
    pointsText: 'Points',
    ppgText: 'Per Match',
    matchesPlayedText: 'Matches Played',
    goalDiffText: 'Goal Diff',
    formCodes: { W: 'W', D: 'D', L: 'L' },
    upcomingTitle: 'Upcoming Amedspor Matches',
    recentTitle: 'Recent Played Matches',
    btnFullCalendar: 'Match Calendar',
    miniTableTitle: 'Süper Lig Standings',
    btnFullTable: 'Full Table',
    thRank: 'Pos',
    thClub: 'Club',
    thP: 'P',
    thW: 'W',
    thD: 'D',
    thL: 'L',
    thGF: 'GF',
    thGA: 'GA',
    thGD: 'GD',
    thPts: 'Pts',
    thPtsShort: 'Pts',
    calTitle: 'Amedspor Season Match Calendar',
    calThisMonth: 'This Month',
    viewCalendar: 'Calendar',
    viewList: 'List',
    legWin: 'Win',
    legDraw: 'Draw',
    legLoss: 'Loss',
    legUpcoming: 'Upcoming Match',
    calClickHint: 'Click on any match day for previous match details and statistics',
    allSeasonMatches: 'All Season Matches',
    filterAll: 'All',
    filterFinished: 'Played',
    filterUpcoming: 'Upcoming',
    pastDetailsHeader: 'Amedspor Previous Match Details & Statistical Reports',
    pastDetailsSub: 'Goal minutes, tactical formations, referee, head-to-head key stats, and full 28-metric match reports',
    filterAllPlayed: 'All Played',
    standingsFullTitle: 'Trendyol Süper Lig Live Standings',
    uclSpot: 'Champions League',
    uelSpot: 'European Cups',
    relSpot: 'Relegation Zone',
    posAll: 'Full Squad',
    posGK: 'Goalkeeper',
    posDEF: 'Defender',
    posMID: 'Midfielder',
    posFWD: 'Forward',
    searchPlaceholder: 'Search player name, position or country...',
    matchweekTitle: 'Süper Lig Matchweek & Live Scores',
    btnPrev: 'Prev',
    btnNext: 'Next',
    mtabSummary: 'Summary',
    mtabStats: 'Statistics',
    mtabLineups: 'Lineups',
    mtabCommentary: 'Commentary',
    mtabPrevious: 'Previous Matches',
    tagNextMatch: 'NEXT MATCH',
    tagLiveMatch: 'LIVE IN PROGRESS',
    tagLastMatch: 'LAST PLAYED MATCH (PREVIOUS MATCH REPORT)',
    ctaUpcomingPrevDetails: 'Previous Match Details & Statistics',
    ctaFinishedDetails: 'Previous Match Report & 28 Stats',
    upcomingPreBanner: 'Previous Match Details & Statistical Comparison of Both Teams',
    roundWord: 'Round',
    roundShort: 'R',
    homeBadge: 'HOME',
    awayBadge: 'AWAY',
    homeTeamSub: 'Home Team',
    awayTeamSub: 'Away Team',
    todayTag: 'Today',
    matchCountWord: 'Matches',
    fullTimeText: 'Full Time',
    halfTimeText: 'Half Time',
    startingSoon: 'Starting Soon',
    cdUnits: { d: 'd', h: 'h', m: 'm' },
    winPts: 'WIN • +3 PTS',
    drawPts: 'DRAW • +1 PT',
    lossPts: 'LOSS • 0 PTS',
    formationWord: 'Formation',
    noGoalCard: 'No Goals / Cards',
    refereeWord: 'Referee',
    btnAll28Stats: 'All 28 Stats & Lineup Report',
    ageHeightLbl: 'AGE / HEIGHT',
    ageWord: 'yrs',
    footLbl: 'PREFERRED FOOT',
    marketValLbl: 'MARKET VALUE',
    stadiumCityLbl: 'Stadium & City',
    matchRefereeLbl: 'Match Referee',
    tacticalFormLbl: 'Tactical Formations',
    htFtLbl: 'Half Time / Full Time',
    keyStatsBoxTitle: 'Key Match Statistics Highlight',
    btnSeeAll28: 'View All 28 Statistics',
    timelineTitle: 'Chronological Key Events (Goals, Cards & Substitutions)',
    totalEventsWord: 'Events',
    benchHeader: 'SUBSTITUTES BENCH',
    seasonCompTitle: 'Season Statistical & Performance Comparison of Both Teams',
    prev5Title: 'Previous 5 Matches Details & Scores',
    prevClickHint: 'Click on any previous match below to open its full 28-statistic match report.',
    modalEmptySummaryTitle: 'Match Not Started Yet',
    modalEmptySummaryDesc: 'Match summary and timeline will update live once the match kicks off.',
    modalEmptyStatsTitle: 'Awaiting Live Statistics',
    modalEmptyStatsDesc: 'All 28 statistical metrics will be delivered in real time upon kickoff.',
    modalEmptyLineupsTitle: 'Lineups Not Yet Announced',
    modalEmptyLineupsDesc: 'Starting 11s and benches are officially published approximately 1 hour before kickoff.',
    modalEmptyCommTitle: 'Awaiting Live Commentary',
    modalEmptyCommDesc: 'Minute-by-minute text commentary will start as soon as the referee blows the whistle.',
    modalGoToPrevStats: 'View Statistical Comparison Between Teams',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    statCategories: {
      overview: 'General Play & Possession',
      attack: 'Attack & Shot Analysis',
      passing: 'Passing & Build-up Play',
      defense: 'Defense & Duels',
      discipline: 'Discipline & Cards'
    },
    statsMap: {
      possessionPct: 'Ball Possession (%)',
      totalShots: 'Total Shots',
      shotsOnTarget: 'Shots on Target',
      shotPct: 'Shot Accuracy (%)',
      blockedShots: 'Blocked Shots',
      penaltyKickGoals: 'Penalty Goals',
      penaltyKickShots: 'Penalties Taken',
      wonCorners: 'Corner Kicks',
      offsides: 'Offsides',
      saves: 'Goalkeeper Saves',
      totalPasses: 'Total Passes',
      accuratePasses: 'Accurate Passes',
      passPct: 'Pass Accuracy (%)',
      totalCrosses: 'Total Crosses',
      accurateCrosses: 'Accurate Crosses',
      crossPct: 'Cross Accuracy (%)',
      totalLongBalls: 'Long Balls',
      accurateLongBalls: 'Accurate Long Balls',
      longballPct: 'Long Ball Accuracy (%)',
      totalTackles: 'Total Tackles',
      effectiveTackles: 'Successful Tackles',
      tacklePct: 'Tackle Success (%)',
      interceptions: 'Interceptions',
      totalClearance: 'Total Clearances',
      effectiveClearance: 'Effective Clearances',
      foulsCommitted: 'Fouls Committed',
      yellowCards: 'Yellow Cards',
      redCards: 'Red Cards',
      expectedGoals: 'Expected Goals (xG)',
      dangerousAttacks: 'Dangerous Attacks',
      totalAttacks: 'Total Attacks',
      shotsInsideBox: 'Shots Inside Box',
      shotsOutsideBox: 'Shots Outside Box',
      bigChancesCreated: 'Big Chances Created',
      duelsWonPct: 'Duels Won (%)',
      aerialDuelsWonPct: 'Aerial Duels Won (%)'
    }
  },

  de: {
    locale: 'de-DE',
    superLig: 'Süper Lig',
    navOverview: 'Übersicht',
    navCalendar: 'Spielkalender',
    navPastDetails: 'Vorherige Spieldetails',
    navStandings: 'Tabelle',
    navSquad: 'Kader',
    navMatchweek: 'Spieltag',
    navPosts: 'Beiträge',
    navFeed: 'Club-Feed',
    loading: 'Wird geladen...',
    kpiRankLabel: 'Süper Lig Tabellenplatz',
    kpiRecordLabel: 'Saisonbilanz (S / U / N)',
    kpiGoalsLabel: 'Tore & Tordifferenz',
    kpiFormLabel: 'Form (Letzte 5 Spiele)',
    kpiFormHint: 'Für vorherige Spieldetails anklicken',
    rankSuffix: '. Platz',
    pointsText: 'Punkte',
    ppgText: 'Pro Spiel',
    matchesPlayedText: 'Spiele gespielt',
    goalDiffText: 'Tordiff.',
    formCodes: { W: 'S', D: 'U', L: 'N' },
    upcomingTitle: 'Kommende Amedspor-Spiele',
    recentTitle: 'Zuletzt gespielte Partien',
    btnFullCalendar: 'Spielkalender',
    miniTableTitle: 'Süper Lig Tabelle',
    btnFullTable: 'Vollständige Tabelle',
    thRank: 'Pl.',
    thClub: 'Verein',
    thP: 'Sp',
    thW: 'S',
    thD: 'U',
    thL: 'N',
    thGF: 'T+',
    thGA: 'T-',
    thGD: 'TD',
    thPts: 'Pkt',
    thPtsShort: 'Pkt',
    calTitle: 'Amedspor Saison-Spielkalender',
    calThisMonth: 'Dieser Monat',
    viewCalendar: 'Kalender',
    viewList: 'Liste',
    legWin: 'Sieg',
    legDraw: 'Unentschieden',
    legLoss: 'Niederlage',
    legUpcoming: 'Kommendes Spiel',
    calClickHint: 'Klicken Sie auf einen Spieltag für vorherige Spieldetails und Statistiken',
    allSeasonMatches: 'Alle Saisonspiele',
    filterAll: 'Alle',
    filterFinished: 'Gespielt',
    filterUpcoming: 'Kommende',
    pastDetailsHeader: 'Amedspor Vorherige Spieldetails & Statistikberichte',
    pastDetailsSub: 'Torminuten, Aufstellungen, Schiedsrichter, direkte Statistikvergleiche und vollständiger 28-Daten-Spielbericht',
    filterAllPlayed: 'Alle Gespielten',
    standingsFullTitle: 'Trendyol Süper Lig Live-Tabelle',
    uclSpot: 'Champions League',
    uelSpot: 'Europapokal',
    relSpot: 'Abstiegszone',
    posAll: 'Gesamter Kader',
    posGK: 'Torwart',
    posDEF: 'Abwehr',
    posMID: 'Mittelfeld',
    posFWD: 'Sturm',
    searchPlaceholder: 'Spielername, Position oder Land suchen...',
    matchweekTitle: 'Süper Lig Spieltag & Live-Ergebnisse',
    btnPrev: 'Zurück',
    btnNext: 'Weiter',
    mtabSummary: 'Übersicht',
    mtabStats: 'Statistiken',
    mtabLineups: 'Aufstellungen',
    mtabCommentary: 'Live-Ticker',
    mtabPrevious: 'Letzte Spiele',
    tagNextMatch: 'NÄCHSTES SPIEL',
    tagLiveMatch: 'LIVE IM GANGE',
    tagLastMatch: 'LETZTES SPIEL (SPIELBERICHT)',
    ctaUpcomingPrevDetails: 'Vorherige Spieldetails & Statistiken',
    ctaFinishedDetails: 'Vorheriger Spielbericht & 28 Statistiken',
    upcomingPreBanner: 'Vorherige Spieldetails & Statistikvergleich beider Teams',
    roundWord: 'Spieltag',
    roundShort: 'Sp.',
    homeBadge: 'HEIM',
    awayBadge: 'AUSW',
    homeTeamSub: 'Heimteam',
    awayTeamSub: 'Auswärtsteam',
    todayTag: 'Heute',
    matchCountWord: 'Spiele',
    fullTimeText: 'Endstand',
    halfTimeText: 'Halbzeit',
    startingSoon: 'Beginnt in Kürze',
    cdUnits: { d: 'T', h: 'Std', m: 'Min' },
    winPts: 'SIEG • +3 PKT',
    drawPts: 'REMIS • +1 PKT',
    lossPts: 'NIEDERLAGE • 0 PKT',
    formationWord: 'Formation',
    noGoalCard: 'Keine Tore / Karten',
    refereeWord: 'Schiedsrichter',
    btnAll28Stats: 'Alle 28 Statistiken & Kaderbericht',
    ageHeightLbl: 'ALTER / GRÖSSE',
    ageWord: 'J.',
    footLbl: 'STARKER FUSS',
    marketValLbl: 'MARKTWERT',
    stadiumCityLbl: 'Stadion & Stadt',
    matchRefereeLbl: 'Schiedsrichter',
    tacticalFormLbl: 'Taktische Formationen',
    htFtLbl: 'Halbzeit / Endstand',
    keyStatsBoxTitle: 'Wichtigste Spielstatistiken im Überblick',
    btnSeeAll28: 'Alle 28 Statistiken anzeigen',
    timelineTitle: 'Chronologische Spielereignisse (Tore, Karten & Wechsel)',
    totalEventsWord: 'Ereignisse',
    benchHeader: 'ERSATZBANK & EINWECHSLUNGEN',
    seasonCompTitle: 'Saisonstatistik- & Leistungsvergleich beider Teams',
    prev5Title: 'Details & Ergebnisse der letzten 5 Spiele',
    prevClickHint: 'Klicken Sie unten auf ein vorheriges Spiel, um den vollständigen 28-Statistiken-Spielbericht zu öffnen.',
    modalEmptySummaryTitle: 'Spiel Noch Nicht Begonnen',
    modalEmptySummaryDesc: 'Übersicht und Schlüsselmomente werden nach Anpfiff live aktualisiert.',
    modalEmptyStatsTitle: 'Live-Statistiken Ausstehend',
    modalEmptyStatsDesc: 'Alle 28 statistischen Kennzahlen werden mit dem Anpfiff live erfasst.',
    modalEmptyLineupsTitle: 'Aufstellungen Noch Nicht Bekannt',
    modalEmptyLineupsDesc: 'Startaufstellungen und Ersatzbänke werden ca. 1 Stunde vor Anpfiff offiziell übermittelt.',
    modalEmptyCommTitle: 'Live-Ticker Ausstehend',
    modalEmptyCommDesc: 'Der minutengenaue Live-Ticker startet pünktlich mit dem Schiedsrichterpfiff.',
    modalGoToPrevStats: 'Statistikvergleich Beider Teams Anzeigen',
    weekdays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    statCategories: {
      overview: 'Allgemeines Spiel & Ballbesitz',
      attack: 'Angriff & Schussanalyse',
      passing: 'Passspiel & Spielaufbau',
      defense: 'Abwehr & Zweikämpfe',
      discipline: 'Disziplin & Karten'
    },
    statsMap: {
      possessionPct: 'Ballbesitz (%)',
      totalShots: 'Schüsse Gesamt',
      shotsOnTarget: 'Schüsse aufs Tor',
      shotPct: 'Schussgenauigkeit (%)',
      blockedShots: 'Geblockte Schüsse',
      penaltyKickGoals: 'Elfmetertore',
      penaltyKickShots: 'Elfmeter Geschossen',
      wonCorners: 'Eckbälle',
      offsides: 'Abseits',
      saves: 'Torwartparaden',
      totalPasses: 'Pässe Gesamt',
      accuratePasses: 'Angekommene Pässe',
      passPct: 'Passquote (%)',
      totalCrosses: 'Flanken Gesamt',
      accurateCrosses: 'Angekommene Flanken',
      crossPct: 'Flankenquote (%)',
      totalLongBalls: 'Lange Bälle',
      accurateLongBalls: 'Angekommene Lange Bälle',
      longballPct: 'Lange-Bälle-Quote (%)',
      totalTackles: 'Zweikämpfe Gesamt',
      effectiveTackles: 'Gewonnene Zweikämpfe',
      tacklePct: 'Zweikampfquote (%)',
      interceptions: 'Abgefangene Bälle',
      totalClearance: 'Klärungsaktionen',
      effectiveClearance: 'Erfolgreiche Klärungen',
      foulsCommitted: 'Begangene Fouls',
      yellowCards: 'Gelbe Karten',
      redCards: 'Rote Karten',
      expectedGoals: 'Erwartete Tore (xG)',
      dangerousAttacks: 'Gefährliche Angriffe',
      totalAttacks: 'Angriffe Gesamt',
      shotsInsideBox: 'Schüsse im Strafraum',
      shotsOutsideBox: 'Weitschüsse',
      bigChancesCreated: 'Großchancen',
      duelsWonPct: 'Gewonnene Zweikämpfe (%)',
      aerialDuelsWonPct: 'Gewonnene Luftduelle (%)'
    }
  }
};

function t(key) {
  const dict = I18N[appState.lang] || I18N.tr;
  return dict[key] !== undefined ? dict[key] : I18N.tr[key] || key;
}

function getStatLabel(statName, fallbackLabel) {
  const dict = I18N[appState.lang] || I18N.tr;
  return dict.statsMap?.[statName] || I18N.tr.statsMap?.[statName] || fallbackLabel || statName;
}

function getPosLabel(posCode) {
  const map = {
    G: { name: t('posGK'), icon: 'ri-shield-user-line' },
    D: { name: t('posDEF'), icon: 'ri-shield-star-line' },
    M: { name: t('posMID'), icon: 'ri-compass-3-line' },
    F: { name: t('posFWD'), icon: 'ri-flashlight-line' }
  };
  return map[posCode] || { name: posCode, icon: 'ri-user-star-line' };
}

// Backend'den Türkçe gelen değerlerin çevirileri
const KU_COUNTRIES = {
  tr: 'Tirkiye', ng: 'Nîjerya', ci: 'Peravê Diranfîl', sn: 'Senegal', ch: 'Swîsre',
  mg: 'Madagaskar', il: 'Îsraîl', ml: 'Malî', cm: 'Kamerûn', pt: 'Portûgal',
  de: 'Almanya', fr: 'Fransa', sy: 'Sûriye', br: 'Brazîl', ma: 'Fas', gh: 'Gana', cd: 'Kongoya DK'
};

function trCountry(p) {
  const iso = p?.countryIso || (p?.flagUrl || '').match(/\/([a-z]{2})\.png$/)?.[1];
  const lang = appState.lang;
  if (!iso || lang === 'tr') return p?.citizenship || '';
  if (lang === 'ku') return KU_COUNTRIES[iso] || p.citizenship || '';
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(iso.toUpperCase()) || p.citizenship;
  } catch {
    return p.citizenship || '';
  }
}

const FOOT_I18N = {
  'Sağ': { tr: 'Sağ', ku: 'Rast', en: 'Right', de: 'Rechts' },
  'Sol': { tr: 'Sol', ku: 'Çep', en: 'Left', de: 'Links' },
  'Her İkisi': { tr: 'Her İkisi', ku: 'Herdu', en: 'Both', de: 'Beidfüßig' }
};

function trFoot(foot) {
  if (!foot) return '—';
  return FOOT_I18N[foot]?.[appState.lang] || foot;
}

function trHomeAway(pm) {
  const isHome = pm?.isHomeGame !== undefined ? pm.isHomeGame : pm?.atVs === 'İç Saha';
  const labels = {
    tr: ['İç Saha', 'Deplasman'],
    ku: ['Li Malê', 'Derve'],
    en: ['Home', 'Away'],
    de: ['Heim', 'Auswärts']
  };
  const pair = labels[appState.lang] || labels.tr;
  return isHome ? pair[0] : pair[1];
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  appState.lang = lang;
  localStorage.setItem('amed_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('#langSwitcher .lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Tüm statik data-i18n etiketlerini güncelle
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (typeof val === 'string') {
      el.textContent = val;
    }
  });

  // Arama kutusu placeholder
  const searchInput = document.getElementById('playerSearchInput');
  if (searchInput) {
    searchInput.placeholder = t('searchPlaceholder');
  }

  // Takvim gün başlıkları
  const weekdaysEl = document.getElementById('calendarWeekdays');
  if (weekdaysEl) {
    const days = t('weekdays');
    weekdaysEl.innerHTML = days.map((d) => `<div>${d}</div>`).join('');
  }

  renderAll();

  // Topluluk (Forum / Giriş) modülüne dil değişimini bildir
  document.dispatchEvent(new CustomEvent('amed:lang', { detail: { lang } }));

  const modalEl = document.getElementById('matchModal');
  if (modalEl?.classList.contains('open') && appState.activeModalData) {
    renderModalHeader();
    renderModalBody();
  }
}

const STAT_CATEGORIES = [
  { key: 'overview', icon: 'ri-pie-chart-2-line' },
  { key: 'attack', icon: 'ri-focus-3-line' },
  { key: 'passing', icon: 'ri-share-forward-line' },
  { key: 'defense', icon: 'ri-shield-check-line' },
  { key: 'discipline', icon: 'ri-file-warning-line' }
];

function formatDateTR(tsSeconds) {
  if (!tsSeconds) return '';
  const d = new Date(tsSeconds * 1000);
  const months = t('shortMonths');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDateTR(tsSeconds) {
  if (!tsSeconds) return '';
  const d = new Date(tsSeconds * 1000);
  const months = t('shortMonths');
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
}

function formatTimeTR(tsSeconds) {
  if (!tsSeconds) return '';
  const d = new Date(tsSeconds * 1000);
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMarketValue(val) {
  if (!val) return '—';
  if (val >= 1000000) {
    return `€${(val / 1000000).toFixed(2).replace('.00', '')}M`;
  }
  return `€${Math.round(val / 1000)}K`;
}

function switchTab(tabId, updateUrl = true) {
  if (!tabId) tabId = 'overview';
  document.querySelectorAll('#mainNav .nav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('#mobileTabNav .mobile-tab-pill').forEach((btn) => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  // Takvim sekmesindeyken tam ekranı doldurması ve kaydırmayı engellemesi için body class'ı
  document.body.classList.toggle('calendar-tab-active', tabId === 'fixtures');

  // Mobil kenar çekmecesini otomatik kapat
  document.getElementById('appSidebar')?.classList.remove('open');
  document.getElementById('sidebarBackdrop')?.classList.remove('active');

  // Sekmeyi yerel hafızaya ve URL hash'ine kaydet (Sayfa yenilendiğinde aynı sekmede kalır)
  try {
    localStorage.setItem('amed_active_tab', tabId);
    if (updateUrl && window.location.hash !== `#${tabId}`) {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  } catch (e) {}

  if (tabId === 'profile' && window.renderProfilePage) window.renderProfilePage();
  if (tabId === 'settings' && window.renderSettingsPage) window.renderSettingsPage();
  if (tabId === 'fixtures' && typeof renderFixturesCalendar === 'function') renderFixturesCalendar();
}

/* ---------- KOYU / AÇIK TEMA YÖNETİMİ ---------- */
function initTheme() {
  const savedTheme = localStorage.getItem('amed_theme');
  const activeTheme = savedTheme || 'dark';
  setTheme(activeTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('amed_theme', theme);
  } catch (e) {}

  const isDark = theme === 'dark';
  const iconTop = document.getElementById('themeIcon');
  const iconSidebar = document.getElementById('sidebarThemeIcon');
  const iconMobile = document.getElementById('mobileThemeIcon');
  const labelSidebar = document.getElementById('sidebarThemeLabel');

  if (iconTop) iconTop.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
  if (iconSidebar) iconSidebar.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
  if (iconMobile) iconMobile.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
  if (labelSidebar) labelSidebar.textContent = isDark ? 'Açık Mod' : 'Koyu Mod';
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

function getTeamLogo(teamId) {
  return `/logos/${teamId || AMED_ID}.png`;
}

async function fetchDashboard() {
  try {
    const ts = Date.now();
    const [dashRes, squadRes] = await Promise.all([
      fetch(`/api/dashboard?_t=${ts}`, { cache: 'no-store' }),
      fetch(`/api/squad?_t=${ts}`, { cache: 'no-store' })
    ]);

    if (!dashRes.ok) throw new Error(`HTTP ${dashRes.status}`);
    const data = await dashRes.json();
    appState.data = data;
    try {
      localStorage.setItem('amed_cached_dashboard', JSON.stringify(data));
    } catch (e) {}

    if (squadRes && squadRes.ok) {
      const sqData = await squadRes.json();
      appState.players = sqData.players || [];
      try {
        localStorage.setItem('amed_cached_squad', JSON.stringify(appState.players));
      } catch (e) {}
    }

    if (!appState.selectedRound) {
      appState.selectedRound = data.rounds?.currentRound || 8;
    }

    renderAll();

    const modalEl = document.getElementById('matchModal');
    if (modalEl?.classList.contains('open') && appState.activeModalEventId) {
      const mRes = await fetch(`/api/match/${appState.activeModalEventId}?_t=${Date.now()}`, { cache: 'no-store' });
      if (mRes.ok) {
        appState.activeModalData = await mRes.json();
        renderModalHeader();
        renderModalBody();
      }
    }
  } catch (err) {
    console.error('Arka plan senkronizasyon hatası:', err);
  }
}

function renderAll() {
  const { data } = appState;
  if (!data) return;

  if (data.club) {
    const sub = document.getElementById('headerSub');
    if (sub) {
      sub.innerHTML = `<i class="ri-map-pin-2-line"></i> ${data.club.stadium} (${data.club.city}) • ${t('superLig')}`;
    }
  }

  [
    renderHeroMatches,
    renderKPIs,
    renderOverviewLists,
    renderMiniStandings,
    renderFullFixtures,
    renderPastDetailsSection,
    renderFullStandings,
    renderSquad,
    renderRoundSelector
  ].forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error(`${fn.name} render hatası:`, err);
    }
  });
}

function buildSpotlightCard(match, type) {
  if (!match) {
    return `
      <div class="match-spotlight" style="cursor: default;">
        <div class="match-spotlight-top">
          <span class="spotlight-tag tag-last"><i class="ri-calendar-line"></i> —</span>
        </div>
      </div>
    `;
  }

  const isLive = match.status?.type === 'inprogress';
  const isFinished = match.status?.type === 'finished';

  let tagClass = 'tag-next';
  let tagIcon = 'ri-calendar-event-line';
  let tagLabel = t('tagNextMatch');

  if (isLive) {
    tagClass = 'tag-live';
    tagIcon = 'ri-broadcast-line';
    tagLabel = `<span class="spotlight-live-pulse-badge"><span class="beacon-dot"></span> CANLI ${match.status?.clock || ''}</span>`;
  } else if (type === 'last' || isFinished) {
    tagClass = 'tag-last';
    tagIcon = 'ri-checkbox-circle-line';
    tagLabel = t('tagLastMatch');
  }

  const homeLogo = match.homeTeam?.logo || getTeamLogo(match.homeTeam?.id);
  const awayLogo = match.awayTeam?.logo || getTeamLogo(match.awayTeam?.id);

  let centerHTML = '';
  if (isLive) {
    const xgHTML = match.quickStats?.xG
      ? `<div class="modal-xg-pill" style="margin-top:0.25rem;"><span>xG <strong>${match.quickStats.xG[0]}</strong></span><span class="xg-dot">•</span><span>xG <strong>${match.quickStats.xG[1]}</strong></span></div>`
      : '';
    centerHTML = `
      <div class="spotlight-score">${match.homeScore?.current ?? 0} - ${match.awayScore?.current ?? 0}</div>
      ${xgHTML}
      <div class="spotlight-sub" style="color:#fb7185; font-weight:700;">
        <i class="ri-broadcast-line"></i> ${match.status?.description || 'Canlı Oynanıyor'}
      </div>
    `;
  } else if (isFinished) {
    const xgHTML = match.quickStats?.xG
      ? `<div class="modal-xg-pill" style="margin-top:0.25rem;"><span>xG <strong>${match.quickStats.xG[0]}</strong></span><span class="xg-dot">•</span><span>xG <strong>${match.quickStats.xG[1]}</strong></span></div>`
      : '';
    centerHTML = `
      <div class="spotlight-score">${match.homeScore?.current ?? 0} - ${match.awayScore?.current ?? 0}</div>
      ${xgHTML}
      <div class="spotlight-sub">
        <i class="ri-time-line"></i> ${t('fullTimeText')}
      </div>
    `;
  } else {
    centerHTML = `
      <div class="spotlight-countdown" id="nextMatchCountdown">--</div>
      <div class="spotlight-sub">
        <i class="ri-time-line"></i> ${formatTimeTR(match.startTimestamp)}
      </div>
    `;
  }

  let extraPreviewHTML = '';
  if (isLive && match.quickStats) {
    const possH = match.quickStats.possession ? match.quickStats.possession[0] : '54';
    const possA = match.quickStats.possession ? match.quickStats.possession[1] : '46';
    extraPreviewHTML = `
      <div style="background: var(--bg-page); border: 1px solid var(--border-light); border-radius: 10px; padding: 0.65rem 0.85rem; margin-bottom: 0.85rem; font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.45rem;">
        <div class="spotlight-momentum-mini">
          <span>%${possH} ${match.homeTeam.shortName || match.homeTeam.name}</span>
          <div class="spotlight-momentum-bar">
            <div class="spotlight-momentum-fill home" style="width: ${possH}%"></div>
            <div class="spotlight-momentum-fill away" style="width: ${possA}%"></div>
          </div>
          <span>%${possA} ${match.awayTeam.shortName || match.awayTeam.name}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.35rem; font-family: var(--font-mono); font-size: 0.71rem; color: var(--text-main);">
          <span>${getStatLabel('totalShots')}: <strong>${match.quickStats.shots?.[0] || '0'} - ${match.quickStats.shots?.[1] || '0'}</strong></span>
          <span>${getStatLabel('shotsOnTarget')}: <strong>${match.quickStats.shotsOnTarget?.[0] || '0'} - ${match.quickStats.shotsOnTarget?.[1] || '0'}</strong></span>
          <span>${getStatLabel('dangerousAttacks')}: <strong>${match.quickStats.dangerousAttacks?.[0] || '14'} - ${match.quickStats.dangerousAttacks?.[1] || '11'}</strong></span>
          <span>${getStatLabel('wonCorners')}: <strong>${match.quickStats.corners?.[0] || '0'} - ${match.quickStats.corners?.[1] || '0'}</strong></span>
        </div>
      </div>
    `;
  } else if (isFinished && match.quickStats) {
    const goalsText =
      (match.goals || []).length > 0
        ? match.goals
            .map(
              (g) =>
                `<span style="display:inline-flex;align-items:center;gap:0.2rem;"><i class="ri-football-line" style="color:var(--amed-green);"></i> ${g.player} (${g.time})</span>`
            )
            .join(' • ')
        : t('noGoalCard');

    extraPreviewHTML = `
      <div style="background: var(--bg-page); border: 1px solid var(--border-light); border-radius: 10px; padding: 0.55rem 0.85rem; margin-bottom: 0.85rem; font-size: 0.75rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
          <span>${goalsText}</span>
          ${match.referee ? `<span style="color: var(--text-muted);"><i class="ri-user-voice-line"></i> ${match.referee}</span>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.35rem; border-top: 1px dashed var(--border-light); padding-top: 0.35rem; font-family: var(--font-mono); font-size: 0.71rem; color: var(--text-main);">
          <span>${getStatLabel('possessionPct')}: <strong>${match.quickStats.possession[0]} - ${match.quickStats.possession[1]}</strong></span>
          <span>${getStatLabel('totalShots')}: <strong>${match.quickStats.shots[0]} - ${match.quickStats.shots[1]}</strong></span>
          <span>${getStatLabel('wonCorners')}: <strong>${match.quickStats.corners[0]} - ${match.quickStats.corners[1]}</strong></span>
        </div>
      </div>
    `;
  } else if (!isFinished && !isLive) {
    extraPreviewHTML = `
      <div style="background: var(--bg-page); border: 1px solid var(--border-light); border-radius: 10px; padding: 0.55rem 0.85rem; margin-bottom: 0.85rem; font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
        <span><i class="ri-history-line" style="color: var(--amed-green);"></i> ${t('upcomingPreBanner')}</span>
        <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-main);">${match.roundInfo?.round || ''}. ${t('roundWord')}</span>
      </div>
    `;
  }

  // Yaklaşan maçlarda doğrudan "Önceki Maç Detayları & İstatistikler" sekmesini aç!
  const defaultTab = isFinished || isLive ? 'summary' : 'previous';
  const ctaLabel = isFinished || isLive ? t('ctaFinishedDetails') : t('ctaUpcomingPrevDetails');

  return `
    <div class="match-spotlight" onclick="openMatchModal('${match.id}', '${defaultTab}')">
      <div class="match-spotlight-top">
        <span class="spotlight-tag ${tagClass}">
          <i class="${tagIcon}"></i> ${tagLabel}
        </span>
        <span>${match.roundInfo?.round ? `${match.roundInfo.round}. ${t('roundWord')} • ` : ''}${formatDateTR(match.startTimestamp)}</span>
      </div>

      <div class="spotlight-teams">
        <div class="spotlight-team">
          <div class="team-logo-circle">
            <img src="${homeLogo}" alt="${match.homeTeam.name}" loading="lazy" />
          </div>
          <div class="spotlight-team-name">${match.homeTeam.name}</div>
        </div>

        <div class="spotlight-center">
          ${centerHTML}
        </div>

        <div class="spotlight-team">
          <div class="team-logo-circle">
            <img src="${awayLogo}" alt="${match.awayTeam.name}" loading="lazy" />
          </div>
          <div class="spotlight-team-name">${match.awayTeam.name}</div>
        </div>
      </div>

      ${extraPreviewHTML}

      <div class="spotlight-footer">
        <span><i class="ri-map-pin-line"></i> ${match.venue || 'Diyarbakır Stadyumu'}</span>
        <span class="spotlight-cta">${ctaLabel} <i class="ri-arrow-right-line"></i></span>
      </div>
    </div>
  `;
}

function renderHeroMatches() {
  const { data } = appState;
  const container = document.getElementById('heroMatchesContainer');
  if (!container) return;

  const upcoming = data.upcomingMatches || [];
  const past = data.pastMatches || [];

  const liveMatch = [...upcoming, ...past].find((m) => m.status?.type === 'inprogress');
  const primaryMatch = liveMatch || upcoming[0];
  const lastMatch = past[0];

  container.innerHTML = `
    ${buildSpotlightCard(primaryMatch, 'next')}
    ${buildSpotlightCard(lastMatch, 'last')}
  `;

  if (appState.countdownTimer) clearInterval(appState.countdownTimer);
  if (primaryMatch && primaryMatch.status?.type === 'notstarted') {
    const updateTimer = () => {
      const el = document.getElementById('nextMatchCountdown');
      if (!el) return;
      const diff = primaryMatch.startTimestamp * 1000 - Date.now();
      if (diff <= 0) {
        el.textContent = t('startingSoon');
        return;
      }
      const u = t('cdUnits');
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      el.textContent = `${d}${u.d} ${h}${u.h} ${m}${u.m}`;
    };
    updateTimer();
    appState.countdownTimer = setInterval(updateTimer, 15000);
  }
}

function renderKPIs() {
  const { data } = appState;
  const rows = data.standings?.total || [];
  const row = rows.find((r) => String(r.team.id) === AMED_ID);
  const fc = t('formCodes');

  if (row) {
    document.getElementById('kpiRank').textContent = `${row.position}${t('rankSuffix')}`;
    document.getElementById('kpiPoints').textContent = `${row.points} ${t('pointsText')} (${row.ppg} ${t('ppgText')})`;
    document.getElementById('kpiRecord').textContent = `${row.wins}${fc.W} • ${row.draws}${fc.D} • ${row.losses}${fc.L}`;
    document.getElementById('kpiPlayed').textContent = `${row.matches} ${t('matchesPlayedText')}`;
    document.getElementById('kpiGoals').textContent = `${row.scoresFor} / ${row.scoresAgainst}`;
    const diff = row.scoresFor - row.scoresAgainst;
    document.getElementById('kpiDiff').textContent = `${t('goalDiffText')}: ${diff > 0 ? `+${diff}` : diff}`;
  }

  const formEl = document.getElementById('kpiForm');
  const recentFive = (data.pastMatches || []).slice(0, 5).reverse();
  formEl.innerHTML = recentFive
    .map((m) => {
      const isHome = String(m.homeTeam.id) === AMED_ID;
      const amedGoals = isHome ? m.homeScore?.current : m.awayScore?.current;
      const oppGoals = isHome ? m.awayScore?.current : m.homeScore?.current;
      const oppName = isHome ? m.awayTeam.name : m.homeTeam.name;
      let code = fc.D;
      let cls = 'form-D';
      if (amedGoals > oppGoals) {
        code = fc.W;
        cls = 'form-W';
      } else if (amedGoals < oppGoals) {
        code = fc.L;
        cls = 'form-L';
      }
      return `<span class="form-pill ${cls}" onclick="openMatchModal('${m.id}', 'summary')" title="${oppName}: ${m.homeScore?.current}-${m.awayScore?.current}">${code}</span>`;
    })
    .join('');
}

function createMatchRowHTML(m) {
  const isHomeAmed = String(m.homeTeam.id) === AMED_ID;
  const isAwayAmed = String(m.awayTeam.id) === AMED_ID;
  const involvesAmed = isHomeAmed || isAwayAmed;

  const isFinished = m.status?.type === 'finished';
  const isLive = m.status?.type === 'inprogress';

  let centerBadge = '';
  if (isFinished || isLive) {
    centerBadge = `
      <div class="match-score-box ${isLive ? 'live' : ''}">
        ${m.homeScore?.current ?? 0} - ${m.awayScore?.current ?? 0}
      </div>
    `;
  } else {
    centerBadge = `
      <div class="match-score-box">
        ${formatTimeTR(m.startTimestamp)}
      </div>
    `;
  }

  const homeLogo = m.homeTeam?.logo || getTeamLogo(m.homeTeam?.id);
  const awayLogo = m.awayTeam?.logo || getTeamLogo(m.awayTeam?.id);
  const targetTab = isFinished || isLive ? 'summary' : 'previous';
  const hoverTitle = isFinished || isLive ? t('ctaFinishedDetails') : t('ctaUpcomingPrevDetails');

  return `
    <div class="match-row ${involvesAmed ? 'amed-highlight' : ''}" onclick="openMatchModal('${m.id}', '${targetTab}')" title="${hoverTitle}">
      <div class="match-meta">
        <span>${formatShortDateTR(m.startTimestamp)}</span>
        <span class="match-round-badge">${m.roundInfo?.round ? `${m.roundInfo.round}. ${t('roundWord')}` : t('superLig')}</span>
      </div>

      <div class="match-team home ${isHomeAmed ? 'is-amed' : ''}">
        <span>${m.homeTeam.name}</span>
        <img src="${homeLogo}" alt="${m.homeTeam.name}" loading="lazy" />
      </div>

      ${centerBadge}

      <div class="match-team away ${isAwayAmed ? 'is-amed' : ''}">
        <img src="${awayLogo}" alt="${m.awayTeam.name}" loading="lazy" />
        <span>${m.awayTeam.name}</span>
      </div>

      <div class="match-arrow">
        <i class="ri-arrow-right-s-line"></i>
      </div>
    </div>
  `;
}

function renderOverviewLists() {
  const { data } = appState;
  const upcoming = (data.upcomingMatches || []).slice(0, 5);
  const recent = (data.pastMatches || []).slice(0, 5);

  document.getElementById('overviewUpcomingList').innerHTML =
    upcoming.length > 0 ? upcoming.map(createMatchRowHTML).join('') : '';

  document.getElementById('overviewRecentList').innerHTML =
    recent.length > 0 ? recent.map(createMatchRowHTML).join('') : '';
}

/* =========================================================
   ÖNCEKİ MAÇ DETAYLARI BÖLÜMÜ (AYRI VE DERİN MAÇ ANALİZLERİ)
   ========================================================= */
function buildMiniStatBar(label, homeStr, awayStr) {
  const hVal = parseFloat(String(homeStr).replace('%', '')) || 0;
  const aVal = parseFloat(String(awayStr).replace('%', '')) || 0;
  const total = hVal + aVal || 1;
  const hPct = Math.round((hVal / total) * 100);
  const aPct = Math.round((aVal / total) * 100);

  return `
    <div class="mini-stat-item">
      <div class="mini-stat-top">
        <span class="mini-stat-val">${homeStr}</span>
        <span class="mini-stat-lbl">${label}</span>
        <span class="mini-stat-val">${awayStr}</span>
      </div>
      <div class="stat-bars" style="height: 6px;">
        <div class="stat-bar-side home">
          <div class="stat-bar-fill home" style="width: ${hPct}%"></div>
        </div>
        <div class="stat-bar-side away">
          <div class="stat-bar-fill away" style="width: ${aPct}%"></div>
        </div>
      </div>
    </div>
  `;
}

function renderPastDetailsSection() {
  const container = document.getElementById('pastDetailsGrid');
  if (!container) return;

  const pastMatches = appState.data?.pastMatches || [];
  const filter = appState.pastResultFilter || 'ALL';

  const filtered = pastMatches.filter((m) => {
    if (filter === 'ALL') return true;
    const isHome = String(m.homeTeam.id) === AMED_ID;
    const amedG = isHome ? m.homeScore?.current : m.awayScore?.current;
    const oppG = isHome ? m.awayScore?.current : m.homeScore?.current;
    const resCode = amedG > oppG ? 'W' : amedG < oppG ? 'L' : 'D';
    return resCode === filter;
  });

  container.innerHTML = filtered
    .map((m) => {
      const isHome = String(m.homeTeam.id) === AMED_ID;
      const amedG = isHome ? m.homeScore?.current : m.awayScore?.current;
      const oppG = isHome ? m.awayScore?.current : m.homeScore?.current;

      let resCode = 'D';
      let resLabel = t('drawPts');
      let resIcon = 'ri-equalizer-line';
      if (amedG > oppG) {
        resCode = 'W';
        resLabel = t('winPts');
        resIcon = 'ri-trophy-line';
      } else if (amedG < oppG) {
        resCode = 'L';
        resLabel = t('lossPts');
        resIcon = 'ri-close-circle-line';
      }

      const homeGoals = (m.goals || []).filter((g) => g.isHome);
      const awayGoals = (m.goals || []).filter((g) => !g.isHome);
      const homeCards = (m.cards || []).filter((c) => c.isHome);
      const awayCards = (m.cards || []).filter((c) => !c.isHome);

      const renderEventList = (goalsArr, cardsArr) => {
        const items = [];
        goalsArr.forEach((g) => {
          items.push(
            `<span class="past-event-line"><i class="ri-football-line" style="color: var(--amed-green);"></i> <strong>${g.player}</strong> ${g.time}${g.isPenalty ? ' (P)' : ''}</span>`
          );
        });
        cardsArr.forEach((c) => {
          const color = c.cardType === 'red' ? 'var(--amed-red)' : '#eab308';
          items.push(
            `<span class="past-event-line"><i class="ri-stop-fill" style="color: ${color};"></i> ${c.player} ${c.time}</span>`
          );
        });
        return items.length > 0 ? items.join('<br/>') : `<span style="color: var(--text-muted);">${t('noGoalCard')}</span>`;
      };

      const qs = m.quickStats || {
        possession: ['%50', '%50'],
        shots: ['0', '0'],
        shotsOnTarget: ['0', '0'],
        passes: ['0', '0'],
        corners: ['0', '0'],
        saves: ['0', '0']
      };

      return `
        <div class="past-detail-card" onclick="openMatchModal('${m.id}', 'stats')" style="cursor: pointer;" title="${t('btnAll28Stats')}">
          <div class="past-card-head">
            <span>
              <i class="ri-calendar-check-line" style="color: var(--amed-green);"></i>
              ${m.roundInfo?.round ? `${m.roundInfo.round}. ${t('roundWord')} • ` : ''}${formatDateTR(m.startTimestamp)} • ${formatTimeTR(m.startTimestamp)}
            </span>
            <span class="past-result-pill ${resCode}">
              <i class="${resIcon}"></i> ${resLabel}
            </span>
          </div>

          <div class="past-card-score-row">
            <div class="past-card-team home">
              <div>
                <div class="past-card-team-name">${m.homeTeam.name}</div>
                <div class="past-card-formation">${t('formationWord')}: ${m.formations?.home || '4-2-3-1'}</div>
              </div>
              <img src="${m.homeTeam.logo || getTeamLogo(m.homeTeam.id)}" alt="${m.homeTeam.name}" loading="lazy" />
            </div>

            <div class="past-card-score-box">
              ${m.homeScore?.current ?? 0} - ${m.awayScore?.current ?? 0}
            </div>

            <div class="past-card-team away">
              <img src="${m.awayTeam.logo || getTeamLogo(m.awayTeam.id)}" alt="${m.awayTeam.name}" loading="lazy" />
              <div>
                <div class="past-card-team-name">${m.awayTeam.name}</div>
                <div class="past-card-formation">${t('formationWord')}: ${m.formations?.away || '4-2-3-1'}</div>
              </div>
            </div>
          </div>

          <div class="past-card-events">
            <div class="past-events-col home">${renderEventList(homeGoals, homeCards)}</div>
            <div class="past-events-col away">${renderEventList(awayGoals, awayCards)}</div>
          </div>

          <div class="past-card-stats-grid">
            ${buildMiniStatBar(getStatLabel('possessionPct'), qs.possession[0], qs.possession[1])}
            ${buildMiniStatBar(getStatLabel('totalShots'), qs.shots[0], qs.shots[1])}
            ${buildMiniStatBar(getStatLabel('shotsOnTarget'), qs.shotsOnTarget[0], qs.shotsOnTarget[1])}
            ${buildMiniStatBar(getStatLabel('accuratePasses'), qs.passes[0], qs.passes[1])}
            ${buildMiniStatBar(getStatLabel('wonCorners'), qs.corners[0], qs.corners[1])}
            ${buildMiniStatBar(getStatLabel('saves'), qs.saves[0], qs.saves[1])}
          </div>

          <div class="past-card-footer">
            <div>
              <i class="ri-map-pin-line"></i> ${m.venue || 'Diyarbakır Stadyumu'}
              ${m.referee ? ` • <i class="ri-user-voice-line"></i> ${t('refereeWord')}: ${m.referee}` : ''}
            </div>
            <button class="btn-full-report" onclick="event.stopPropagation(); openMatchModal('${m.id}', 'stats')">
              <i class="ri-bar-chart-horizontal-line"></i> ${t('btnAll28Stats')}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function getPosBadgeClass(pos, totalTeams = 18) {
  if (pos <= 2) return 'pos-ucl';
  if (pos <= 4) return 'pos-uel';
  if (pos > totalTeams - 3) return 'pos-rel';
  return '';
}

function renderMiniStandings() {
  const rows = appState.data?.standings?.total || [];
  const tbody = document.getElementById('miniStandingsBody');
  tbody.innerHTML = rows
    .map((r) => {
      const isAmed = String(r.team.id) === AMED_ID;
      const diffNum = r.scoresFor - r.scoresAgainst;
      const diff = diffNum > 0 ? `+${diffNum}` : diffNum;
      const badgeCls = getPosBadgeClass(r.position, rows.length);
      const logo = r.team.logo || getTeamLogo(r.team.id);
      return `
        <tr class="${isAmed ? 'amed-row' : ''}">
          <td class="col-pos"><span class="pos-badge ${badgeCls}">${r.position}</span></td>
          <td class="col-team">
            <div class="team-cell">
              <img src="${logo}" alt="${r.team.name}" loading="lazy" />
              <span>${r.team.name}</span>
            </div>
          </td>
          <td>${r.matches}</td>
          <td>${diff}</td>
          <td class="pts-cell">${r.points}</td>
        </tr>
      `;
    })
    .join('');
}

function renderFullStandings() {
  const rows = appState.data?.standings?.total || [];
  const tbody = document.getElementById('fullStandingsBody');
  tbody.innerHTML = rows
    .map((r) => {
      const isAmed = String(r.team.id) === AMED_ID;
      const diffNum = r.scoresFor - r.scoresAgainst;
      const diff = diffNum > 0 ? `+${diffNum}` : diffNum;
      const badgeCls = getPosBadgeClass(r.position, rows.length);
      const logo = r.team.logo || getTeamLogo(r.team.id);
      return `
        <tr class="${isAmed ? 'amed-row' : ''}">
          <td class="col-pos"><span class="pos-badge ${badgeCls}">${r.position}</span></td>
          <td class="col-team">
            <div class="team-cell">
              <img src="${logo}" alt="${r.team.name}" loading="lazy" />
              <span>${r.team.name}</span>
            </div>
          </td>
          <td>${r.matches}</td>
          <td>${r.wins}</td>
          <td>${r.draws}</td>
          <td>${r.losses}</td>
          <td>${r.scoresFor}</td>
          <td>${r.scoresAgainst}</td>
          <td>${diff}</td>
          <td class="pts-cell">${r.points}</td>
        </tr>
      `;
    })
    .join('');
}

function getLocalDateKey(tsSeconds) {
  const d = new Date(tsSeconds * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function selectCalendarMonth(year, month) {
  appState.calYear = Number(year);
  appState.calMonth = Number(month);
  renderFixturesCalendar();
}

function renderFixturesCalendar() {
  const { data } = appState;
  if (!data) return;

  const pastAsc = [...(data.pastMatches || [])].reverse();
  const upcoming = data.upcomingMatches || [];
  const allMatches = [...pastAsc, ...upcoming];

  if (!appState.calInitialized && allMatches.length > 0) {
    const now = new Date();
    const hasMatchInCurrentMonth = allMatches.some((m) => {
      const d = new Date(m.startTimestamp * 1000);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    if (hasMatchInCurrentMonth) {
      appState.calYear = now.getFullYear();
      appState.calMonth = now.getMonth();
    } else if (upcoming.length > 0) {
      const nextDate = new Date(upcoming[0].startTimestamp * 1000);
      appState.calYear = nextDate.getFullYear();
      appState.calMonth = nextDate.getMonth();
    } else {
      const lastDate = new Date(allMatches[allMatches.length - 1].startTimestamp * 1000);
      appState.calYear = lastDate.getFullYear();
      appState.calMonth = lastDate.getMonth();
    }
    appState.calInitialized = true;
  }

  const { calYear, calMonth } = appState;
  const months = t('months');
  const shortMonths = t('shortMonths');
  const fc = t('formCodes');

  const titleEl = document.getElementById('calMonthTitle');
  if (titleEl) {
    titleEl.textContent = `${months[calMonth]} ${calYear}`;
  }

  const matchesByDay = new Map();
  const monthCounts = new Map();

  allMatches.forEach((m) => {
    const d = new Date(m.startTimestamp * 1000);
    const dayKey = getLocalDateKey(m.startTimestamp);
    const mKey = `${d.getFullYear()}-${d.getMonth()}`;
    matchesByDay.set(dayKey, m);
    monthCounts.set(mKey, (monthCounts.get(mKey) || 0) + 1);
  });

  const stripEl = document.getElementById('calMonthStrip');
  if (stripEl && allMatches.length > 0) {
    const firstD = new Date(allMatches[0].startTimestamp * 1000);
    const lastD = new Date(allMatches[allMatches.length - 1].startTimestamp * 1000);
    const monthsList = [];
    let curY = firstD.getFullYear();
    let curM = firstD.getMonth();

    while (curY < lastD.getFullYear() || (curY === lastD.getFullYear() && curM <= lastD.getMonth())) {
      monthsList.push({ year: curY, month: curM, count: monthCounts.get(`${curY}-${curM}`) || 0 });
      curM++;
      if (curM > 11) {
        curM = 0;
        curY++;
      }
    }

    stripEl.innerHTML = monthsList
      .map((item) => {
        const isActive = item.year === calYear && item.month === calMonth;
        return `
          <button class="month-pill ${isActive ? 'active' : ''}" onclick="selectCalendarMonth(${item.year}, ${item.month})">
            <span>${shortMonths[item.month]} ${item.year}</span>
            <span class="month-pill-count">${item.count} ${t('matchCountWord')}</span>
          </button>
        `;
      })
      .join('');
  }

  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDayOffset + daysInMonth) / 7) * 7;

  const todayKey = getLocalDateKey(Math.floor(Date.now() / 1000));
  const cellsHTML = [];

  for (let i = 0; i < totalCells; i++) {
    let cellYear = calYear;
    let cellMonth = calMonth;
    let dayNum = 0;
    let isOutside = false;

    if (i < startDayOffset) {
      isOutside = true;
      dayNum = prevMonthDays - startDayOffset + i + 1;
      cellMonth = calMonth - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear--;
      }
    } else if (i >= startDayOffset + daysInMonth) {
      isOutside = true;
      dayNum = i - (startDayOffset + daysInMonth) + 1;
      cellMonth = calMonth + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear++;
      }
    } else {
      dayNum = i - startDayOffset + 1;
    }

    const dateKey = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const isToday = dateKey === todayKey;
    const match = matchesByDay.get(dateKey);

    let matchCardHTML = '';
    let clickTab = 'summary';
    if (match) {
      const isHome = String(match.homeTeam.id) === AMED_ID;
      const opp = isHome ? match.awayTeam : match.homeTeam;
      const oppLogo = opp.logo || getTeamLogo(opp.id);
      const isFinished = match.status?.type === 'finished';
      const isLive = match.status?.type === 'inprogress';
      clickTab = isFinished || isLive ? 'summary' : 'previous';

      let cardStateClass = 'upcoming';
      let resultBadgeHTML = '';
      let bottomLeftHTML = '';

      if (isFinished || isLive) {
        const amedScore = isHome ? match.homeScore?.current : match.awayScore?.current;
        const oppScore = isHome ? match.awayScore?.current : match.homeScore?.current;
        bottomLeftHTML = `<span class="cal-match-score">${match.homeScore?.current ?? 0} - ${match.awayScore?.current ?? 0}</span>`;

        if (isLive) {
          cardStateClass = 'live';
          resultBadgeHTML = `<span class="cal-result-badge M">LIVE</span>`;
        } else if (amedScore > oppScore) {
          cardStateClass = 'win';
          resultBadgeHTML = `<span class="cal-result-badge G">${fc.W}</span>`;
        } else if (amedScore < oppScore) {
          cardStateClass = 'loss';
          resultBadgeHTML = `<span class="cal-result-badge M">${fc.L}</span>`;
        } else {
          cardStateClass = 'draw';
          resultBadgeHTML = `<span class="cal-result-badge B">${fc.D}</span>`;
        }
      } else {
        bottomLeftHTML = `<span class="cal-match-time"><i class="ri-time-line"></i> ${formatTimeTR(match.startTimestamp)}</span>`;
        resultBadgeHTML = `<i class="ri-history-line" title="${t('ctaUpcomingPrevDetails')}" style="color: var(--amed-green); font-size: 0.85rem;"></i>`;
      }

      matchCardHTML = `
        <div class="cal-match-card ${cardStateClass}" title="${isFinished ? t('ctaFinishedDetails') : t('ctaUpcomingPrevDetails')}">
          <div class="cal-match-top">
            <span class="cal-venue-pill ${isHome ? 'home' : 'away'}">${isHome ? t('homeBadge') : t('awayBadge')}</span>
            <span>${match.roundInfo?.round ? `${match.roundInfo.round}.${t('roundShort')}` : 'SL'}</span>
          </div>
          <div class="cal-match-opp">
            <img src="${oppLogo}" alt="${opp.name}" loading="lazy" />
            <div class="cal-match-opp-name">${opp.name}</div>
          </div>
          <div class="cal-match-bottom">
            ${bottomLeftHTML}
            ${resultBadgeHTML}
          </div>
        </div>
      `;
    }

    cellsHTML.push(`
      <div
        class="cal-day ${isOutside ? 'outside' : ''} ${isToday ? 'is-today' : ''} ${match ? 'has-match' : ''}"
        ${match ? `onclick="openMatchModal('${match.id}', '${clickTab}')"` : ''}
      >
        <div class="cal-day-header">
          <span class="cal-day-num">${dayNum}</span>
          ${isToday ? `<span class="cal-today-tag">${t('todayTag')}</span>` : ''}
        </div>
        ${matchCardHTML}
      </div>
    `);
  }

  const gridEl = document.getElementById('calendarGrid');
  if (gridEl) {
    gridEl.innerHTML = cellsHTML.join('');
  }

  // Mobilde Seçili Ayın Maçlarını Liste Olarak Render Et
  const mobileListEl = document.getElementById('calMobileMatchesList');
  const mobileTitleEl = document.getElementById('calMobileMatchesTitle');
  if (mobileTitleEl && months[calMonth]) {
    mobileTitleEl.textContent = `${months[calMonth]} ${calYear} Karşılaşmaları`;
  }
  if (mobileListEl) {
    const monthMatches = allMatches.filter((m) => {
      const d = new Date(m.startTimestamp * 1000);
      return d.getFullYear() === calYear && d.getMonth() === calMonth;
    }).sort((a, b) => a.startTimestamp - b.startTimestamp);

    if (monthMatches.length === 0) {
      mobileListEl.innerHTML = `<div class="cal-mobile-no-matches"><i class="ri-calendar-line"></i> Bu ayda planlanan karşılaşma bulunmuyor.</div>`;
    } else {
      mobileListEl.innerHTML = monthMatches.map((m) => {
        const isHome = String(m.homeTeam.id) === AMED_ID;
        const opp = isHome ? m.awayTeam : m.homeTeam;
        const oppLogo = opp.logo || getTeamLogo(opp.id);
        const amedLogo = getTeamLogo(AMED_ID);
        const isFinished = m.status?.type === 'finished';
        const isLive = m.status?.type === 'inprogress';
        const clickTab = isFinished || isLive ? 'summary' : 'previous';

        let badgeClass = 'upcoming';
        let badgeText = formatTimeTR(m.startTimestamp);

        if (isLive) {
          badgeClass = 'loss';
          badgeText = 'CANLI ' + (m.homeScore?.current ?? 0) + ' - ' + (m.awayScore?.current ?? 0);
        } else if (isFinished) {
          const amedScore = isHome ? m.homeScore?.current : m.awayScore?.current;
          const oppScore = isHome ? m.awayScore?.current : m.homeScore?.current;
          if (amedScore > oppScore) badgeClass = 'win';
          else if (amedScore < oppScore) badgeClass = 'loss';
          else badgeClass = 'draw';
          badgeText = `${m.homeScore?.current ?? 0} - ${m.awayScore?.current ?? 0}`;
        }

        const dateStr = formatDateTR(m.startTimestamp);

        return `
          <div class="cal-mobile-match-card" onclick="openMatchModal('${m.id}', '${clickTab}')">
            <div class="cal-mobile-match-left">
              <span class="cal-mobile-match-date"><i class="ri-calendar-line"></i> ${dateStr} · ${m.roundInfo?.round ? `${m.roundInfo.round}. Hafta` : 'Süper Lig'}</span>
              <div class="cal-mobile-match-teams">
                <img src="${isHome ? amedLogo : oppLogo}" alt="" />
                <span>${isHome ? 'Amedspor' : opp.name}</span>
                <span style="color:var(--text-muted);font-size:0.75rem;">vs</span>
                <img src="${isHome ? oppLogo : amedLogo}" alt="" />
                <span>${isHome ? opp.name : 'Amedspor'}</span>
              </div>
            </div>
            <div class="cal-mobile-match-right">
              <span class="cal-mobile-match-badge ${badgeClass}">${badgeText}</span>
              <i class="ri-arrow-right-s-line" style="color:var(--text-muted);"></i>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderFullFixtures() {
  const { data, fixtureFilter } = appState;
  if (!data) return;

  renderFixturesCalendar();

  const pastAsc = [...(data.pastMatches || [])].reverse();
  const upcoming = data.upcomingMatches || [];

  let list = [];
  if (fixtureFilter === 'finished') {
    list = data.pastMatches || [];
  } else if (fixtureFilter === 'upcoming') {
    list = upcoming;
  } else {
    list = [...pastAsc, ...upcoming];
  }

  document.getElementById('fullFixturesList').innerHTML = list.map(createMatchRowHTML).join('');
}

function renderSquad() {
  const players = appState.players || [];
  const { posFilter, playerSearch } = appState;
  const q = playerSearch.trim().toLocaleLowerCase('tr-TR');

  const filtered = players.filter((p) => {
    if (posFilter !== 'ALL' && p.position !== posFilter) return false;
    if (q) {
      const posObj = getPosLabel(p.position);
      const haystack = `${p.name} ${p.citizenship} ${trCountry(p)} ${p.positionDetail || ''} ${posObj.name}`.toLocaleLowerCase('tr-TR');
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const grid = document.getElementById('squadGrid');
  grid.innerHTML = filtered
    .map((p) => {
      const posInfo = getPosLabel(p.position);
      const countryName = trCountry(p);

      // Her oyuncunun uyruğu (Türk oyuncular dahil) bayrağı ve ülke ismi ile yer alır
      let natHtml = '';
      if (countryName || p.citizenship) {
        const flagHtml = p.flagUrl
          ? `<img class="flag-img" src="${p.flagUrl}" alt="${countryName || p.citizenship}" loading="lazy" />`
          : '<i class="ri-earth-line"></i>';
        natHtml = `
          <span class="player-nat-pill" title="${countryName || p.citizenship}">
            ${flagHtml} <span>${countryName || p.citizenship}</span>
          </span>
        `;
      }

      // OYUNCU PERFORMANS İSTATİSTİKLERİ: Gol, Asist, Sarı Kart, Kırmızı Kart
      // Gol, asist, kartı olmayan oyuncularda bu istatistik kutusu kesinlikle gösterilmez.
      const goals = Number(p.goals) || 0;
      const assists = Number(p.assists) || 0;
      const yellowCards = Number(p.yellowCards) || 0;
      const redCards = Number(p.redCards) || 0;
      const hasStats = (goals > 0 || assists > 0 || yellowCards > 0 || redCards > 0);

      let statsHtml = '';
      if (hasStats) {
        statsHtml = `
          <div class="player-performance-strip">
            ${goals > 0 ? `<span class="pstat-pill goal" title="${goals} Gol"><i class="ri-football-line"></i> ${goals} Gol</span>` : ''}
            ${assists > 0 ? `<span class="pstat-pill assist" title="${assists} Asist"><i class="ri-magic-line"></i> ${assists} Asist</span>` : ''}
            ${yellowCards > 0 ? `<span class="pstat-pill yellow-card" title="${yellowCards} Sarı Kart"><span class="mini-card-icon yellow"></span> ${yellowCards} Sarı</span>` : ''}
            ${redCards > 0 ? `<span class="pstat-pill red-card" title="${redCards} Kırmızı Kart"><span class="mini-card-icon red"></span> ${redCards} Kırmızı</span>` : ''}
          </div>
        `;
      }

      return `
        <div class="player-card">
          <div class="player-top">
            <div class="player-shirt-circle">
              #${p.jerseyNumber || '—'}
            </div>
            <div>
              <div class="player-name">${p.name}</div>
              <div class="player-pos-row">
                <span class="pos-tag"><i class="${posInfo.icon}"></i> ${posInfo.name}</span>
                ${natHtml}
              </div>
            </div>
          </div>

          <div class="player-metrics">
            <div>
              <div class="player-metric-label">${t('ageHeightLbl')}</div>
              <div class="player-metric-val">${p.age ? `${p.age} ${t('ageWord')}` : '—'} ${p.height ? `• ${p.height}cm` : ''}</div>
            </div>
            <div>
              <div class="player-metric-label">${t('footLbl')}</div>
              <div class="player-metric-val">${trFoot(p.preferredFoot)}</div>
            </div>
            <div>
              <div class="player-metric-label">${t('marketValLbl')}</div>
              <div class="player-metric-val" style="color: var(--amed-green);">${formatMarketValue(p.marketValue)}</div>
            </div>
          </div>

          ${statsHtml}
        </div>
      `;
    })
    .join('');
}

function renderRoundSelector() {
  const select = document.getElementById('roundSelect');
  if (!select) return;
  const allRounds = appState.data?.rounds?.allRounds || [];
  const current = appState.selectedRound || appState.data?.rounds?.currentRound || 8;

  if (select.options.length === 0 && allRounds.length > 0) {
    allRounds.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w.round;
      opt.textContent = `${w.round}. ${t('roundWord')}`;
      if (w.round === current) opt.selected = true;
      select.appendChild(opt);
    });
    if (appState.data?.currentRoundMatches?.length) {
      appState.roundEvents = appState.data.currentRoundMatches;
      document.getElementById('roundMatchesList').innerHTML =
        appState.roundEvents.map(createMatchRowHTML).join('');
    } else {
      loadRoundMatches(current);
    }
  } else {
    Array.from(select.options).forEach((opt) => {
      opt.textContent = `${opt.value}. ${t('roundWord')}`;
    });
    if (appState.roundEvents?.length) {
      document.getElementById('roundMatchesList').innerHTML =
        appState.roundEvents.map(createMatchRowHTML).join('');
    }
  }
}

async function loadRoundMatches(round) {
  appState.selectedRound = Number(round);
  const select = document.getElementById('roundSelect');
  if (select) select.value = String(round);

  const listEl = document.getElementById('roundMatchesList');
  listEl.innerHTML = `<div style="padding: 1.5rem; color: var(--text-secondary);"><i class="ri-loader-4-line"></i> ${t('loading')}</div>`;

  try {
    const res = await fetch(`/api/round/${round}`);
    const data = await res.json();
    const events = data.events || [];
    appState.roundEvents = events;
    listEl.innerHTML = events.map(createMatchRowHTML).join('');
  } catch (err) {
    console.error(err);
  }
}

/* =========================================================
   ULTRA DETAYLI MAÇ MODALI (5 SEKME: ÖZET, 28 İSTATİSTİK,
   OYUNCU PERFORMANSI, DAKİKA DAKİKA ANLATIM, ÖNCEKİ MAÇLAR)
   ========================================================= */
function closeMatchModal() {
  const modal = document.getElementById('matchModal');
  if (modal) modal.classList.remove('open');
  appState.activeModalEventId = null;
  appState.activeModalData = null;
  if (appState.modalLiveInterval) {
    clearInterval(appState.modalLiveInterval);
    appState.modalLiveInterval = null;
  }
}
window.closeMatchModal = closeMatchModal;

function setStatsCategoryFilter(cat) {
  appState.statsActiveFilter = cat;
  renderModalBody();
}
window.setStatsCategoryFilter = setStatsCategoryFilter;

function setCommentaryFilter(filter) {
  appState.commActiveFilter = filter;
  renderModalBody();
}
window.setCommentaryFilter = setCommentaryFilter;

async function openMatchModal(eventId, initialTab = 'summary', isSilentRefresh = false) {
  const modal = document.getElementById('matchModal');
  modal.classList.add('open');
  appState.activeModalEventId = eventId;
  appState.activeModalTab = initialTab;

  document.querySelectorAll('#modalTabs .filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.mtab === initialTab);
  });

  if (!isSilentRefresh && !appState.activeModalData) {
    document.getElementById('modalScoreboard').innerHTML =
      `<div style="grid-column: 1 / -1; text-align: center; padding: 1rem; color: var(--text-secondary);"><i class="ri-loader-4-line"></i> ${t('loading')}</div>`;
    document.getElementById('modalScorersRow').innerHTML = '';
    document.getElementById('modalBodyContent').innerHTML = '';
  }

  try {
    const res = await fetch(`/api/match/${eventId}?_t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    appState.activeModalData = data;
    renderModalHeader();
    renderModalBody();

    // Canlı Maç Açıkken Arka Planda Otomatik Kesintisiz Hızlı Yenileme (1.8 sn)
    if (appState.modalLiveInterval) clearInterval(appState.modalLiveInterval);
    if (data?.event?.status?.type === 'inprogress') {
      appState.modalLiveInterval = setInterval(async () => {
        if (!appState.activeModalEventId || !modal.classList.contains('open')) {
          clearInterval(appState.modalLiveInterval);
          appState.modalLiveInterval = null;
          return;
        }
        try {
          const liveRes = await fetch(`/api/match/${appState.activeModalEventId}?_t=${Date.now()}`, { cache: 'no-store' });
          const liveData = await liveRes.json();
          appState.activeModalData = liveData;
          renderModalHeader();
          renderModalBody();
        } catch (err) {}
      }, 1800);
    }
  } catch (e) {
    console.error(e);
  }
}

function renderModalHeader() {
  const { activeModalData } = appState;
  const ev = activeModalData?.event;
  if (!ev) return;

  const intel = activeModalData?.intelligence;
  const isLive = ev.status?.type === 'inprogress';
  const isStarted = ev.status?.type === 'finished' || isLive;

  const venueName = ev.venue ? ` • ${ev.venue}` : '';
  const refereeText = ev.referee ? ` • ${t('refereeWord')}: ${ev.referee}` : '';
  document.getElementById('modalMetaText').innerHTML =
    `<i class="ri-calendar-event-line"></i> ${formatDateTR(ev.startTimestamp)} • ${formatTimeTR(ev.startTimestamp)}${venueName}${refereeText}`;

  const scoreDisplay = isStarted
    ? `${ev.homeTeam?.score ?? 0} - ${ev.awayTeam?.score ?? 0}`
    : formatTimeTR(ev.startTimestamp);

  const homeLogo = ev.homeTeam?.logo || getTeamLogo(ev.homeTeam?.id);
  const awayLogo = ev.awayTeam?.logo || getTeamLogo(ev.awayTeam?.id);

  let statusSubHTML = '';
  if (isLive) {
    statusSubHTML = `
      <div class="live-beacon">
        <span class="beacon-dot"></span> CANLI ${ev.status?.clock || ''} • ${ev.status?.description || 'Oynanıyor'}
      </div>
    `;
  }

  let xgHTML = '';
  if (intel?.xG) {
    xgHTML = `
      <div class="modal-xg-pill" title="Beklenen Gol Değeri (Expected Goals)">
        <span>xG <strong>${intel.xG.home}</strong></span>
        <span class="xg-dot">•</span>
        <span>xG <strong>${intel.xG.away}</strong></span>
      </div>
    `;
  }

  // Canlı Topla Oynama Split Barı
  let possessionBarHTML = '';
  const possStat = (activeModalData.statistics || []).find((s) => s.name === 'possessionPct');
  if (possStat) {
    const pH = possStat.homeValue || parseInt(possStat.home) || 50;
    const pA = 100 - pH;
    possessionBarHTML = `
      <div class="modal-possession-bar" title="Topla Oynama: %${pH} - %${pA}">
        <div class="poss-fill home" style="width: ${pH}%"></div>
        <div class="poss-fill away" style="width: ${pA}%"></div>
      </div>
    `;
  }

  let liveSyncHTML = isLive
    ? `<div class="modal-live-sync-pill"><i class="ri-radar-line"></i> ${t('liveSyncSub') || 'Canlı Veri Akışı Aktif (3.5 sn)'}</div>`
    : '';

  document.getElementById('modalScoreboard').innerHTML = `
    <div class="modal-team home">
      <div>
        <div class="modal-team-name">${ev.homeTeam.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${t('homeTeamSub')} ${ev.homeTeam.form ? `• Form: ${ev.homeTeam.form}` : ''}</div>
      </div>
      <img src="${homeLogo}" alt="${ev.homeTeam.name}" />
    </div>

    <div class="modal-score-center">
      ${statusSubHTML}
      <div class="modal-score-big">${scoreDisplay}</div>
      ${xgHTML}
      ${possessionBarHTML}
      ${liveSyncHTML}
      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.35rem; font-weight: 600;">
        ${isStarted ? (isLive ? '' : t('fullTimeText')) : t('ctaUpcomingPrevDetails')}
      </div>
    </div>

    <div class="modal-team away">
      <img src="${awayLogo}" alt="${ev.awayTeam.name}" />
      <div>
        <div class="modal-team-name">${ev.awayTeam.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${t('awayTeamSub')} ${ev.awayTeam.form ? `• Form: ${ev.awayTeam.form}` : ''}</div>
      </div>
    </div>
  `;

  const scorersEl = document.getElementById('modalScorersRow');
  const goals = (activeModalData.keyEvents || []).filter((k) => k.scoringPlay || k.eventKind === 'goal');
  const homeGoals = goals.filter((g) => g.isHome);
  const awayGoals = goals.filter((g) => !g.isHome);

  if (isStarted) {
    const formatGoals = (arr) =>
      arr.length > 0
        ? arr
            .map(
              (g) =>
                `<div><i class="ri-football-line" style="color: var(--amed-green);"></i> <strong>${g.participants?.[0] || g.shortText}</strong> (${g.time}${g.isPenalty ? ' P' : ''})</div>`
            )
            .join('')
        : `<span style="color: var(--text-muted);">—</span>`;

    scorersEl.style.display = 'grid';
    scorersEl.innerHTML = `
      <div class="modal-scorers-side home">${formatGoals(homeGoals)}</div>
      <div class="modal-ht-pill">${t('halfTimeText')}: ${ev.halfTimeScore || '0 - 0'}</div>
      <div class="modal-scorers-side away">${formatGoals(awayGoals)}</div>
    `;
  } else {
    scorersEl.style.display = 'none';
  }
}

function buildStatRowHTML(s) {
  const hVal = s.homeValue ?? (parseFloat(String(s.home).replace('%', '')) || 0);
  const aVal = s.awayValue ?? (parseFloat(String(s.away).replace('%', '')) || 0);
  const total = hVal + aVal || 1;
  const hPct = Math.round((hVal / total) * 100);
  const aPct = Math.round((aVal / total) * 100);
  const labelTranslated = getStatLabel(s.name, s.label);
  return `
    <div class="stat-row">
      <div class="stat-header">
        <span class="stat-val">${s.home}</span>
        <span class="stat-label">${labelTranslated}</span>
        <span class="stat-val">${s.away}</span>
      </div>
      <div class="stat-bars">
        <div class="stat-bar-side home">
          <div class="stat-bar-fill home" style="width: ${hPct}%"></div>
        </div>
        <div class="stat-bar-side away">
          <div class="stat-bar-fill away" style="width: ${aPct}%"></div>
        </div>
      </div>
    </div>
  `;
}

function renderPreviousMatchesAndComparisonHTML() {
  const { activeModalData } = appState;
  const ev = activeModalData?.event || {};
  const standings = appState.data?.standings?.total || [];
  const homeSt = standings.find((r) => String(r.team.id) === String(ev.homeTeam?.id));
  const awaySt = standings.find((r) => String(r.team.id) === String(ev.awayTeam?.id));
  const fc = t('formCodes');

  const seasonCompareBarsHTML =
    homeSt && awaySt
      ? `
    <div class="card" style="margin-bottom: 1.35rem;">
      <div class="card-header">
        <span class="card-title"><i class="ri-scales-3-line"></i> ${t('seasonCompTitle')}</span>
      </div>
      <div style="padding: 1.15rem 1.35rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.75rem;">
        ${buildMiniStatBar(t('thPts'), homeSt.points, awaySt.points)}
        ${buildMiniStatBar(t('ppgText'), homeSt.ppg, awaySt.ppg)}
        ${buildMiniStatBar(t('thGF'), homeSt.scoresFor, awaySt.scoresFor)}
        ${buildMiniStatBar(t('thGA'), homeSt.scoresAgainst, awaySt.scoresAgainst)}
        ${buildMiniStatBar(t('legWin'), homeSt.wins, awaySt.wins)}
        ${buildMiniStatBar(t('legDraw'), homeSt.draws, awaySt.draws)}
      </div>
    </div>
  `
      : '';

  const lastFiveList = activeModalData.lastFiveGames || [];
  const renderPrevTeamCard = (lfObj) => {
    if (!lfObj) return '';
    const events = lfObj.events || [];
    return `
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <span class="card-title">
            <img src="${lfObj.team?.logo || getTeamLogo(lfObj.team?.id)}" alt="${lfObj.team?.name}" style="width: 24px; height: 24px; object-fit: contain;" />
            ${lfObj.team?.name} • ${t('prev5Title')}
          </span>
        </div>
        <div>
          ${events
            .map((pm) => {
              const resTR = pm.gameResult === 'W' ? fc.W : pm.gameResult === 'L' ? fc.L : fc.D;
              const cls = pm.gameResult === 'W' ? 'form-W' : pm.gameResult === 'L' ? 'form-L' : 'form-D';
              return `
                <div class="prev-match-row" onclick="openMatchModal('${pm.id}', 'stats')" title="${t('btnAll28Stats')}">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span class="form-pill ${cls}" style="width: 26px; height: 26px;">${resTR}</span>
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.84rem; font-weight: 700; color: var(--text-main);">
                        <img src="${pm.opponent?.logo}" alt="${pm.opponent?.name}" style="width: 20px; height: 20px; object-fit: contain;" />
                        <span>${pm.opponent?.name}</span>
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-secondary);">
                        ${trHomeAway(pm)} • ${formatDateTR(pm.date)}
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="match-score-box" style="min-width: 56px;">${pm.score}</span>
                    <i class="ri-bar-chart-horizontal-line" style="color: var(--amed-green);"></i>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  };

  return `
    ${seasonCompareBarsHTML}
    <div style="margin-bottom: 0.85rem; padding: 0.65rem 1rem; background: var(--amed-green-soft); border: 1px solid var(--amed-green-border); border-radius: 10px; font-size: 0.8rem; color: var(--amed-green); font-weight: 600;">
      <i class="ri-cursor-line"></i> ${t('prevClickHint')}
    </div>
    <div class="prev-matches-grid">
      ${lastFiveList.map(renderPrevTeamCard).join('')}
    </div>
  `;
}

function getCommentaryMeta(c) {
  const rawText = (c && c.text) ? String(c.text) : '';
  const text = rawText.toLocaleLowerCase('tr-TR');
  const cType = (c && c.type) ? String(c.type).toLowerCase() : '';

  // 1. Goal / Gol
  if (cType.includes('goal') || text.includes('gol') || text.includes('goal') || text.includes('goool') || text.includes('ağları sarstı')) {
    return {
      badgeClass: 'comm-type-goal',
      icon: '<i class="ri-football-line"></i>',
      badgeIcon: '<i class="ri-football-line"></i>',
      label: 'GOL'
    };
  }

  // 2. Red Card / Kırmızı Kart
  if (cType.includes('red_card') || text.includes('kırmızı kart') || text.includes('red card') || text.includes('ihraç') || text.includes('oyundan atıldı') || text.includes('ikinci sarı')) {
    return {
      badgeClass: 'comm-type-red',
      icon: '<span class="comm-card-box red"></span>',
      badgeIcon: '<span class="comm-card-box red" style="width:8px;height:11px;"></span>',
      label: 'KIRMIZI KART'
    };
  }

  // 3. Yellow Card / Sarı Kart
  if (cType.includes('yellow_card') || text.includes('sarı kart') || text.includes('yellow card') || text.includes('ihtar')) {
    return {
      badgeClass: 'comm-type-yellow',
      icon: '<span class="comm-card-box yellow"></span>',
      badgeIcon: '<span class="comm-card-box yellow" style="width:8px;height:11px;"></span>',
      label: 'SARI KART'
    };
  }

  // 4. Penalty / Penaltı
  if (cType.includes('penalty') || text.includes('penaltı') || text.includes('penalty')) {
    return {
      badgeClass: 'comm-type-penalty',
      icon: '<i class="ri-focus-2-line"></i>',
      badgeIcon: '<i class="ri-focus-2-line"></i>',
      label: 'PENALTI'
    };
  }

  // 5. Foul / Faul
  if (cType.includes('foul') || text.includes('faul') || text.includes('foul') || text.includes('serbest vuruş') || text.includes('düşürüldü') || text.includes('sert müdahale')) {
    return {
      badgeClass: 'comm-type-foul',
      icon: '<i class="ri-alarm-warning-line"></i>',
      badgeIcon: '<i class="ri-alarm-warning-line"></i>',
      label: 'FAUL'
    };
  }

  // 6. Substitution / Değişiklik
  if (cType.includes('sub') || text.includes('oyuncu değişikliği') || text.includes('oyuna girdi') || text.includes('yerine dahil') || text.includes('kenara geldi') || text.includes('substitution') || text.includes('değişiklik')) {
    return {
      badgeClass: 'comm-type-sub',
      icon: '<i class="ri-repeat-line"></i>',
      badgeIcon: '<i class="ri-repeat-line"></i>',
      label: 'DEĞİŞİKLİK'
    };
  }

  // 7. Corner / Köşe Vuruşu
  if (cType.includes('corner') || text.includes('korner') || text.includes('köşe vuruşu') || text.includes('corner')) {
    return {
      badgeClass: 'comm-type-corner',
      icon: '<i class="ri-flag-line"></i>',
      badgeIcon: '<i class="ri-flag-line"></i>',
      label: 'KORNER'
    };
  }

  // 8. Offside / Ofsayt
  if (cType.includes('offside') || text.includes('ofsayt') || text.includes('offside')) {
    return {
      badgeClass: 'comm-type-offside',
      icon: '<i class="ri-flag-2-line"></i>',
      badgeIcon: '<i class="ri-flag-2-line"></i>',
      label: 'OFSAYT'
    };
  }

  // 9. Save / Kurtarış
  if (text.includes('kurtardı') || text.includes('kurtarış') || text.includes('kaleci çıkardı') || text.includes('save') || text.includes('şutu çıkardı')) {
    return {
      badgeClass: 'comm-type-save',
      icon: '<i class="ri-shield-check-line"></i>',
      badgeIcon: '<i class="ri-shield-check-line"></i>',
      label: 'KURTARIŞ'
    };
  }

  // 10. Whistle / Hakem Düdüğü
  if (text.includes('düdük') || text.includes('başladı') || text.includes('sona erdi') || text.includes('ilk yarı') || text.includes('ikinci yarı') || text.includes('maç bitti') || text.includes('uzatma')) {
    return {
      badgeClass: 'comm-type-whistle',
      icon: '<i class="ri-volume-vibrate-line"></i>',
      badgeIcon: '<i class="ri-volume-vibrate-line"></i>',
      label: 'DÜDÜK'
    };
  }

  // 11. Generic
  return {
    badgeClass: 'comm-type-info',
    icon: '<i class="ri-information-line"></i>',
    badgeIcon: '<i class="ri-information-line"></i>',
    label: 'CANLI ANLATIM'
  };
}

function renderModalBody() {
  const { activeModalData, activeModalTab } = appState;
  const container = document.getElementById('modalBodyContent');
  if (!activeModalData) return;

  const ev = activeModalData.event || {};
  const intel = activeModalData.intelligence;
  const allStats = activeModalData.statistics || [];
  const keyEvents = activeModalData.keyEvents || [];
  const lu = activeModalData.lineups || {};
  const isLive = ev.status?.type === 'inprogress';
  const isStarted = ev.status?.type === 'finished' || isLive;

  // SEKME 1: MAÇ ÖZETİ & DERİN VERİ ZEKASI
  if (activeModalTab === 'summary') {
    if (!isStarted) {
      container.innerHTML = `
        <div class="match-info-strip" style="margin-bottom: 1.15rem;">
          <div class="match-info-box">
            <i class="ri-map-pin-2-line"></i>
            <div>
              <div class="match-info-lbl">${t('stadiumCityLbl')}</div>
              <div class="match-info-val">${ev.venue || 'Diyarbakır Stadyumu'}${ev.city ? ` (${ev.city})` : ''}</div>
            </div>
          </div>
          <div class="match-info-box">
            <i class="ri-user-voice-line"></i>
            <div>
              <div class="match-info-lbl">${t('matchRefereeLbl')}</div>
              <div class="match-info-val">${ev.referee || 'TFF Hakemi'}</div>
            </div>
          </div>
          <div class="match-info-box">
            <i class="ri-calendar-line"></i>
            <div>
              <div class="match-info-lbl">${t('navCalendar')}</div>
              <div class="match-info-val">${formatDateTR(ev.startTimestamp)} • ${formatTimeTR(ev.startTimestamp)}</div>
            </div>
          </div>
          <div class="match-info-box">
            <i class="ri-trophy-line"></i>
            <div>
              <div class="match-info-lbl">${t('superLig')}</div>
              <div class="match-info-val">${ev.tournament || 'Trendyol Süper Lig'}</div>
            </div>
          </div>
        </div>
        ${renderPreviousMatchesAndComparisonHTML()}
      `;
      return;
    }

    const infoStripHTML = `
      <div class="match-info-strip">
        <div class="match-info-box">
          <i class="ri-map-pin-2-line"></i>
          <div>
            <div class="match-info-lbl">${t('stadiumCityLbl')}</div>
            <div class="match-info-val">${ev.venue || 'Diyarbakır Stadyumu'}${ev.city ? ` (${ev.city})` : ''}</div>
          </div>
        </div>
        <div class="match-info-box">
          <i class="ri-user-voice-line"></i>
          <div>
            <div class="match-info-lbl">${t('matchRefereeLbl')}</div>
            <div class="match-info-val">${ev.referee || 'TFF'}</div>
          </div>
        </div>
        <div class="match-info-box">
          <i class="ri-layout-grid-line"></i>
          <div>
            <div class="match-info-lbl">${t('tacticalFormLbl')}</div>
            <div class="match-info-val">${lu.home?.formation || '4-2-3-1'} vs ${lu.away?.formation || '4-2-3-1'}</div>
          </div>
        </div>
        <div class="match-info-box">
          <i class="ri-time-line"></i>
          <div>
            <div class="match-info-lbl">${t('htFtLbl')}</div>
            <div class="match-info-val">${ev.halfTimeScore || '—'} / ${ev.homeTeam?.score ?? '-'} - ${ev.awayTeam?.score ?? '-'}</div>
          </div>
        </div>
      </div>
    `;

    // 1. Şut Kalitesi & Net Fırsatlar Grid
    const sqHTML = intel?.shotsQuality ? `
      <div class="shot-quality-grid">
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-focus-3-line"></i> Beklenen Gol (xG)</div>
          <div class="shot-quality-val" style="color:var(--amed-green);">${intel.xG.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.xG.away}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-magic-line"></i> Net Gol Fırsatı</div>
          <div class="shot-quality-val">${intel.shotsQuality.bigChances.homeCreated} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.shotsQuality.bigChances.awayCreated}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-crosshair-2-line"></i> Ceza Sahası İçi Şut</div>
          <div class="shot-quality-val">${intel.shotsQuality.insideBox.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.shotsQuality.insideBox.away}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-flashlight-line"></i> Tehlikeli Hücum</div>
          <div class="shot-quality-val">${intel.attacks.dangerous.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.attacks.dangerous.away}</div>
        </div>
      </div>
    ` : '';

    // 2. Maç Momentum & Baskı Zaman Çizelgesi
    const momentumHTML = intel?.momentum ? `
      <div class="momentum-card">
        <div class="momentum-gauge-header">
          <span><i class="ri-pulse-line" style="color:var(--amed-green);"></i> Maç Momentum & Baskı Eğrisi</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-secondary);">
            Baskı: <strong style="color:var(--amed-green);">%${intel.currentPressure.pressureHome} ${ev.homeTeam.shortName || ev.homeTeam.name}</strong> - <strong style="color:var(--amed-red);">%${intel.currentPressure.pressureAway} ${ev.awayTeam.shortName || ev.awayTeam.name}</strong>
          </span>
        </div>
        <div class="momentum-bars-grid">
          ${intel.momentum.map(m => {
            const isHomeAdv = m.value >= 0;
            const heightPx = Math.max(12, Math.min(32, Math.abs(m.value) * 0.38 + 12));
            return `
              <div class="momentum-col" title="${m.interval}: %${m.pressureHome} - %${m.pressureAway}">
                ${isHomeAdv
                  ? `<div class="momentum-val-bar home" style="height:${heightPx}px;"></div>`
                  : `<div class="momentum-val-bar away" style="height:${heightPx}px;"></div>`}
                <span class="momentum-interval-lbl">${m.interval}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    // 3. Hücum Koridorları
    const corridorHTML = intel?.attacks?.zones ? `
      <div class="attack-corridors-grid">
        <div class="corridor-box">
          <div class="corridor-title">Sol Kanat Hücumu</div>
          <div class="corridor-bar-track"><div class="corridor-bar-fill" style="width:${intel.attacks.zones.home.left}%"></div></div>
          <div class="corridor-pct">%${intel.attacks.zones.home.left}</div>
        </div>
        <div class="corridor-box">
          <div class="corridor-title">Merkez Hücum</div>
          <div class="corridor-bar-track"><div class="corridor-bar-fill" style="width:${intel.attacks.zones.home.center}%"></div></div>
          <div class="corridor-pct">%${intel.attacks.zones.home.center}</div>
        </div>
        <div class="corridor-box">
          <div class="corridor-title">Sağ Kanat Hücumu</div>
          <div class="corridor-bar-track"><div class="corridor-bar-fill" style="width:${intel.attacks.zones.home.right}%"></div></div>
          <div class="corridor-pct">%${intel.attacks.zones.home.right}</div>
        </div>
      </div>
    ` : '';

    // 4. Maçın Adamı (MOTM)
    const motmHTML = intel?.motm ? `
      <div class="motm-card">
        <div class="motm-left">
          <div class="motm-star-circle"><i class="ri-star-fill"></i></div>
          <div>
            <div class="motm-tag">⭐ Maçın En Değerli Oyuncusu (MOTM)</div>
            <div class="motm-name">#${intel.motm.jersey || ''} ${intel.motm.name}</div>
            <div class="motm-team">${intel.motm.team}</div>
          </div>
        </div>
        <div class="motm-rating-badge" title="Canlı Oyuncu Performans Puanı (10 üzerinden)">
          ${intel.motm.rating}
        </div>
      </div>
    ` : '';

    // 5. Canlı Puan Tablosu Simülasyonu
    const standingsImpactHTML = intel?.standingsImpact ? `
      <div class="live-standings-impact-box">
        <div class="live-standings-impact-icon"><i class="ri-trophy-line"></i></div>
        <div>
          <div style="font-weight:700; color:var(--text-main); margin-bottom:0.15rem;">Canlı Puan Durumu Etkisi</div>
          <div style="color:var(--text-secondary);">${intel.standingsImpact.summary}</div>
        </div>
      </div>
    ` : '';

    const keyStatNames = new Set(['possessionPct', 'totalShots', 'shotsOnTarget', 'accuratePasses', 'passPct', 'wonCorners', 'saves', 'foulsCommitted']);
    const highlightStats = allStats.filter((s) => keyStatNames.has(s.name));

    const statsPreviewHTML =
      highlightStats.length > 0
        ? `
        <div class="card" style="margin-bottom: 1.35rem;">
          <div class="card-header">
            <span class="card-title"><i class="ri-bar-chart-box-line"></i> ${t('keyStatsBoxTitle')}</span>
            <button class="card-action" onclick="switchModalTab('stats')">
              ${t('btnSeeAll28')} (${allStats.length} Veri) <i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
          <div style="padding: 1.15rem 1.35rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem 1.75rem;">
            ${highlightStats.map(buildStatRowHTML).join('')}
          </div>
        </div>
      `
        : '';

    const renderTimeline = (eventsArr) => {
      if (eventsArr.length === 0) {
        return `<div style="text-align: center; padding: 1.5rem; color: var(--text-secondary); font-size: 0.86rem;">${t('noGoalCard')}</div>`;
      }
      return `
        <div class="incident-list">
          ${eventsArr
            .map((item) => {
              let badgeIcon = '<i class="ri-information-line" style="color: var(--text-secondary);"></i>';
              if (item.eventKind === 'goal') {
                badgeIcon = '<i class="ri-football-line" style="color: var(--amed-green); font-size: 1.15rem;"></i>';
              } else if (item.eventKind === 'red-card') {
                badgeIcon = '<i class="ri-stop-fill" style="color: var(--amed-red); font-size: 1.15rem;"></i>';
              } else if (item.eventKind === 'yellow-card') {
                badgeIcon = '<i class="ri-stop-fill" style="color: #eab308; font-size: 1.15rem;"></i>';
              } else if (item.eventKind === 'substitution') {
                badgeIcon = '<i class="ri-arrow-left-right-line" style="color: #2563eb; font-size: 1.1rem;"></i>';
              }

              let detailHTML = '';
              if (item.eventKind === 'substitution' && item.participants?.length >= 2) {
                detailHTML = `<strong><i class="ri-arrow-up-line" style="color:var(--amed-green);"></i> ${item.participants[0]}</strong> <span style="color:var(--text-muted);">(<i class="ri-arrow-down-line" style="color:var(--amed-red);"></i> ${item.participants[1]})</span>`;
              } else {
                const pText = item.participants?.length ? `<strong>${item.participants.join(', ')}</strong> ` : '';
                detailHTML = `${pText}<span style="color: var(--text-secondary); font-size: 0.78rem;">(${item.typeText || item.shortText || ''})</span>`;
              }

              const label = `${badgeIcon} ${detailHTML}`;
              return `
                <div class="incident-item">
                  <div class="incident-side home">${item.isHome ? label : ''}</div>
                  <div class="incident-time">${item.time || '—'}</div>
                  <div class="incident-side away">${!item.isHome ? label : ''}</div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    };

    container.innerHTML = `
      ${infoStripHTML}
      ${sqHTML}
      ${momentumHTML}
      ${corridorHTML}
      ${motmHTML}
      ${standingsImpactHTML}
      ${statsPreviewHTML}
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <span class="card-title"><i class="ri-timer-flash-line"></i> ${t('timelineTitle')}</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">${keyEvents.length} ${t('totalEventsWord')}</span>
        </div>
        <div style="padding: 1.15rem 1.35rem;">
          ${renderTimeline(keyEvents)}
        </div>
      </div>
    `;
  }

  // SEKME 2: DETAYLI İSTATİSTİKLER (36 DERİN VERİ)
  else if (activeModalTab === 'stats') {
    if (allStats.length === 0) {
      container.innerHTML = `
        <div style="margin-bottom: 1.15rem; padding: 0.95rem 1.25rem; background: var(--amed-green-soft); border: 1px solid var(--amed-green-border); border-radius: 12px; font-size: 0.84rem; color: var(--amed-green); font-weight: 600; display:flex; align-items:center; gap:0.65rem;">
          <i class="ri-information-line" style="font-size: 1.35rem; flex-shrink: 0;"></i>
          <span>Bu karşılaşma henüz başlamadığından maç içi canlı verileri başlama düdüğü ile aktif olacaktır. İki takımın sezonluk karşılaştırması ve oynanmış maç raporu aşağıdadır:</span>
        </div>
        ${renderPreviousMatchesAndComparisonHTML()}
      `;
      return;
    }

    const catFilter = appState.statsActiveFilter || 'all';
    const filterButtonsHTML = `
      <div class="commentary-filters">
        <button class="comm-filter-chip ${catFilter === 'all' ? 'active' : ''}" onclick="setStatsCategoryFilter('all')">
          <i class="ri-apps-2-line"></i> ${t('filterAll')} (${allStats.length})
        </button>
        <button class="comm-filter-chip ${catFilter === 'attack' ? 'active' : ''}" onclick="setStatsCategoryFilter('attack')">
          <i class="ri-focus-3-line"></i> Hücum & xG
        </button>
        <button class="comm-filter-chip ${catFilter === 'passing' ? 'active' : ''}" onclick="setStatsCategoryFilter('passing')">
          <i class="ri-share-forward-line"></i> Pas Dağılımı
        </button>
        <button class="comm-filter-chip ${catFilter === 'defense' ? 'active' : ''}" onclick="setStatsCategoryFilter('defense')">
          <i class="ri-shield-check-line"></i> Savunma & İkili Mücadele
        </button>
        <button class="comm-filter-chip ${catFilter === 'discipline' ? 'active' : ''}" onclick="setStatsCategoryFilter('discipline')">
          <i class="ri-file-warning-line"></i> Disiplin
        </button>
      </div>
    `;

    const catTitles = t('statCategories');
    const filteredCats = catFilter === 'all' ? STAT_CATEGORIES : STAT_CATEGORIES.filter(c => c.key === catFilter);
    const categoryCardsHTML = filteredCats.map((cat) => {
      const catItems = allStats.filter((s) => s.category === cat.key);
      if (catItems.length === 0) return '';
      return `
        <div class="stats-category-card">
          <div class="stats-category-title">
            <i class="${cat.icon}"></i> ${catTitles[cat.key] || cat.key}
          </div>
          ${catItems.map(buildStatRowHTML).join('')}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${filterButtonsHTML}
      <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
        <span><i class="ri-checkbox-multiple-line" style="color: var(--amed-green);"></i> <strong>${allStats.length}</strong> Detaylı Canlı Veri</span>
        <span style="font-weight: 700;"><span style="color: var(--amed-green);">■ ${ev.homeTeam?.name}</span> &nbsp;|&nbsp; <span style="color: var(--amed-red);">■ ${ev.awayTeam?.name}</span></span>
      </div>
      <div class="stats-category-grid">
        ${categoryCardsHTML}
      </div>
    `;
  }

  // SEKME 3: KADROLAR & SOFASCORE PUANLARI
  else if (activeModalTab === 'lineups') {
    const homeStarters = lu?.home?.starters || [];
    const awayStarters = lu?.away?.starters || [];
    if (homeStarters.length === 0 && awayStarters.length === 0) {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 1.15rem; padding: 2.2rem 1.5rem; text-align: center;">
          <div style="width: 54px; height: 54px; border-radius: 14px; background: var(--bg-subtle); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 0.95rem;">
            <i class="ri-shirt-line"></i>
          </div>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${t('modalEmptyLineupsTitle')}
          </div>
          <div style="font-size: 0.86rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.35rem;">
            ${t('modalEmptyLineupsDesc')}
          </div>
          <div>
            <button class="c-btn c-btn-primary c-btn-sm" onclick="switchModalTab('previous')">
              <i class="ri-history-line"></i> ${t('modalGoToPrevStats')}
            </button>
          </div>
        </div>
      `;
      return;
    }

    const renderPlayerRow = (p) => {
      const st = p.stats || {};
      const badges = [];

      (p.plays || []).forEach((pl) => {
        if (pl.goal) {
          badges.push(`<span class="perf-badge goal"><i class="ri-football-line"></i> ${pl.time}</span>`);
        }
        if (pl.yellow) {
          badges.push(`<span class="perf-badge card-y"><i class="ri-stop-fill"></i> ${pl.time}</span>`);
        }
        if (pl.red) {
          badges.push(`<span class="perf-badge card-r"><i class="ri-stop-fill"></i> ${pl.time}</span>`);
        }
        if (pl.sub) {
          const repText = p.subbedOutFor ? ` (#${p.subbedOutFor.jersey} ${p.subbedOutFor.name})` : '';
          badges.push(
            `<span class="perf-badge sub"><i class="ri-arrow-left-right-line"></i> ${pl.time}${repText}</span>`
          );
        }
      });

      if (st.assists > 0) {
        badges.push(`<span class="perf-badge goal"><i class="ri-magic-line"></i> ${st.assists} A</span>`);
      }
      if (st.shots > 0) {
        badges.push(`<span class="perf-badge"><i class="ri-focus-2-line"></i> ${getStatLabel('totalShots')}: ${st.shots} (${st.shotsOnTarget})</span>`);
      }
      if (st.saves > 0) {
        badges.push(`<span class="perf-badge goal"><i class="ri-shield-star-line"></i> ${getStatLabel('saves')}: ${st.saves}</span>`);
      }
      if (st.foulsCommitted > 0 || st.foulsSuffered > 0) {
        badges.push(`<span class="perf-badge">${getStatLabel('foulsCommitted')}: ${st.foulsCommitted}/${st.foulsSuffered}</span>`);
      }

      const ratingCls = (p.rating || 0) >= 7.6 ? 'high' : (p.rating || 0) >= 6.8 ? 'med' : 'low';
      const isMotm = p.id && String(p.id) === String(intel?.motm?.id);
      const ratingPill = p.rating
        ? `<span class="player-rating-pill ${ratingCls}" title="Sofascore Canlı Oyuncu Puanı">${isMotm ? '⭐ ' : ''}${p.rating}</span>`
        : '';

      return `
        <div class="lineup-player-detailed">
          <div class="lineup-player-top">
            <div class="lineup-player-left">
              <span class="lineup-num">#${p.jersey || '—'}</span>
              <span style="font-weight: 700; color: var(--text-main);">${p.name}</span>
              ${ratingPill}
            </div>
            <span class="pos-tag">${p.position || ''}</span>
          </div>
          ${badges.length > 0 ? `<div class="player-perf-badges">${badges.join('')}</div>` : ''}
        </div>
      `;
    };

    const renderTeamList = (teamObj) => {
      const starters = teamObj.starters || [];
      const subs = teamObj.substitutes || [];
      return `
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <span class="card-title"><i class="ri-shirt-line"></i> ${teamObj.teamName}</span>
            <span class="pos-tag">${t('formationWord')}: ${teamObj.formation || '4-2-3-1'}</span>
          </div>
          <div>
            ${starters.map(renderPlayerRow).join('')}
            ${
              subs.length > 0
                ? `<div style="padding: 0.55rem 0.9rem; background: var(--bg-page); font-size: 0.72rem; font-weight: 800; color: var(--text-secondary); border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light);">${t('benchHeader')}</div>` +
                  subs.map(renderPlayerRow).join('')
                : ''
            }
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="lineups-grid">
        ${renderTeamList(lu.home)}
        ${renderTeamList(lu.away)}
      </div>
    `;
  }

  // SEKME 4: DAKİKA DAKİKA FİLTRELENEBİLİR CANLI ANLATIM
  else if (activeModalTab === 'commentary') {
    const isStarted = activeModalData?.status?.type === 'finished' || activeModalData?.status?.type === 'inprogress' || activeModalData?.status?.state === 'in' || activeModalData?.status?.state === 'post';
    const rawComm = isStarted ? (activeModalData.commentary || []) : [];
    if (!isStarted || rawComm.length === 0) {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 1.15rem; padding: 2.2rem 1.5rem; text-align: center;">
          <div style="width: 54px; height: 54px; border-radius: 14px; background: var(--bg-subtle); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 0.95rem;">
            <i class="ri-broadcast-line"></i>
          </div>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${t('modalEmptyCommTitle')}
          </div>
          <div style="font-size: 0.86rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.35rem;">
            ${t('modalEmptyCommDesc')}
          </div>
          <div>
            <button class="c-btn c-btn-primary c-btn-sm" onclick="switchModalTab('previous')">
              <i class="ri-history-line"></i> ${t('modalGoToPrevStats')}
            </button>
          </div>
        </div>
      `;
      return;
    }

    const commFilter = appState.commActiveFilter || 'all';
    const filterButtonsHTML = `
      <div class="commentary-filters">
        <button class="comm-filter-chip ${commFilter === 'all' ? 'active' : ''}" onclick="setCommentaryFilter('all')">
          <i class="ri-chat-1-line"></i> ${t('filterAll')} (${rawComm.length})
        </button>
        <button class="comm-filter-chip ${commFilter === 'goal' ? 'active' : ''}" onclick="setCommentaryFilter('goal')">
          <i class="ri-football-line" style="color:var(--amed-green);"></i> Goller
        </button>
        <button class="comm-filter-chip ${commFilter === 'cards' ? 'active' : ''}" onclick="setCommentaryFilter('cards')">
          <i class="ri-stop-fill" style="color:#eab308;"></i> Kartlar & VAR
        </button>
        <button class="comm-filter-chip ${commFilter === 'foul' ? 'active' : ''}" onclick="setCommentaryFilter('foul')">
          <i class="ri-alarm-warning-line" style="color:#f97316;"></i> Fauller & Düdük
        </button>
        <button class="comm-filter-chip ${commFilter === 'shot' ? 'active' : ''}" onclick="setCommentaryFilter('shot')">
          <i class="ri-focus-3-line" style="color:#3b82f6;"></i> Şutlar & Fırsatlar
        </button>
        <button class="comm-filter-chip ${commFilter === 'sub' ? 'active' : ''}" onclick="setCommentaryFilter('sub')">
          <i class="ri-arrow-left-right-line" style="color:#8b5cf6;"></i> Değişiklikler
        </button>
      </div>
    `;

    const filteredComm = rawComm.filter((c) => {
      if (commFilter === 'all') return true;
      const k = c.kind || getCommentaryMeta(c).badgeClass;
      if (commFilter === 'goal') return k === 'goal' || k.includes('goal');
      if (commFilter === 'cards') return k === 'card-yellow' || k === 'card-red' || k === 'var' || k.includes('yellow') || k.includes('red') || k.includes('var');
      if (commFilter === 'foul') return k === 'foul' || k === 'whistle' || k.includes('foul') || k.includes('whistle');
      if (commFilter === 'shot') return k === 'shot' || k === 'woodwork' || k === 'save' || k.includes('shot') || k.includes('save');
      if (commFilter === 'sub') return k === 'sub' || k.includes('sub');
      return true;
    });

    container.innerHTML = `
      ${filterButtonsHTML}
      <div class="commentary-list">
        ${filteredComm
          .map((c) => {
            const meta = getCommentaryMeta(c);
            const timeStr = c.time || (c.minute ? `${c.minute}'` : '•');
            return `
              <div class="commentary-item ${meta.badgeClass}">
                <div class="comm-left-col">
                  <div class="commentary-time">${timeStr}</div>
                  <div class="comm-icon-bubble" title="${meta.label}">
                    ${meta.icon}
                  </div>
                </div>
                <div class="comm-right-col">
                  <span class="comm-event-type-badge">
                    ${meta.badgeIcon || ''} <span>${meta.label}</span>
                  </span>
                  <div class="comm-text">${c.text || ''}</div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  // SEKME 5: ÖNCEKİ MAÇ DETAYLARI & İSTATİSTİKLER
  else if (activeModalTab === 'previous') {
    container.innerHTML = renderPreviousMatchesAndComparisonHTML();
  }
}

function switchModalTab(tabKey) {
  appState.activeModalTab = tabKey;
  document.querySelectorAll('#modalTabs .filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.mtab === tabKey);
  });
  renderModalBody();
}

/* EVENT LISTENERS */
window.setLanguage = setLanguage;
window.switchTab = switchTab;
window.switchModalTab = switchModalTab;

function initApp() {
  // Logo & Bakûr Yazısına Tıklanınca Ana Sayfaya (overview) Yönlendirme
  const brandBtn = document.getElementById('brandHomeBtn');
  if (brandBtn) {
    brandBtn.style.cursor = 'pointer';
    const goHome = (e) => {
      e?.preventDefault?.();
      switchTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    brandBtn.addEventListener('click', goHome);
    brandBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') goHome(e);
    });
  }

  // Mobil Başlık Logo & Bakûr Butonu
  const brandMobileBtn = document.getElementById('brandMobileBtn');
  if (brandMobileBtn) {
    brandMobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobil Menü Kenar Çekmecesi (Sidebar) Açma / Kapatma
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const appSidebar = document.getElementById('appSidebar');

  const openSidebar = () => {
    appSidebar?.classList.add('open');
    sidebarBackdrop?.classList.add('active');
  };
  const closeSidebar = () => {
    appSidebar?.classList.remove('open');
    sidebarBackdrop?.classList.remove('active');
  };

  mobileMenuBtn?.addEventListener('click', openSidebar);
  sidebarCloseBtn?.addEventListener('click', closeSidebar);
  sidebarBackdrop?.addEventListener('click', closeSidebar);

  // Tema Değiştirme Butonları (Üst bar, yan panel ve mobil başlık)
  initTheme();
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggleBtnSidebar')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggleBtnMobile')?.addEventListener('click', toggleTheme);

  // Dil Seçici (TR / KU / EN / DE) — olay delegasyonu ile
  document.getElementById('langSwitcher')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn?.dataset.lang) setLanguage(btn.dataset.lang);
  });

  // Ana Sekmeler (Hem dikey sol menü hem yatay mobil sekme şeridi)
  document.querySelectorAll('#mainNav .nav-tab, #mobileTabNav .mobile-tab-pill').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Aktif Sekmeyi Koru (Sayfa yenilendiğinde veya URL hash'inde varsa oradan aç)
  const validTabs = ['overview', 'fixtures', 'past-details', 'standings', 'squad', 'round-matches', 'community', 'profile'];
  const hashTab = window.location.hash.replace('#', '').trim();
  const savedTab = localStorage.getItem('amed_active_tab');
  let initialTab = 'overview';
  if (hashTab && validTabs.includes(hashTab)) {
    initialTab = hashTab;
  } else if (savedTab && validTabs.includes(savedTab)) {
    initialTab = savedTab;
  }
  switchTab(initialTab, false);

  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '').trim();
    if (currentHash && validTabs.includes(currentHash)) {
      switchTab(currentHash, false);
    }
  });

  // Fikstür Takvim / Liste Görünüm Geçişi
  document.querySelectorAll('#fixtureViewModeGroup .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#fixtureViewModeGroup .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      appState.fixtureViewMode = view;
      document.getElementById('fixturesCalendarView').style.display = view === 'calendar' ? 'block' : 'none';
      document.getElementById('fixturesListView').style.display = view === 'list' ? 'block' : 'none';
    });
  });

  // Önceki Maç Detayları Sonuç Filtresi
  document.querySelectorAll('#pastResultFilterGroup .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pastResultFilterGroup .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.pastResultFilter = btn.dataset.rfilter;
      renderPastDetailsSection();
    });
  });

  // Takvim Ay İleri / Geri / Bu Ay Butonları
  document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
    let m = appState.calMonth - 1;
    let y = appState.calYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    selectCalendarMonth(y, m);
  });

  document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
    let m = appState.calMonth + 1;
    let y = appState.calYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    selectCalendarMonth(y, m);
  });

  document.getElementById('calTodayBtn')?.addEventListener('click', () => {
    const now = new Date();
    selectCalendarMonth(now.getFullYear(), now.getMonth());
  });

  // Fikstür Filtreleri (Liste Görünümü)
  document.querySelectorAll('#fixtureFilterGroup .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#fixtureFilterGroup .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.fixtureFilter = btn.dataset.filter;
      renderFullFixtures();
    });
  });

  // Kadro Mevki Filtreleri
  document.querySelectorAll('#posFilterGroup .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#posFilterGroup .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.posFilter = btn.dataset.pos;
      renderSquad();
    });
  });

  // Futbolcu Arama
  document.getElementById('playerSearchInput')?.addEventListener('input', (e) => {
    appState.playerSearch = e.target.value;
    renderSquad();
  });

  // Hafta Seçici
  document.getElementById('roundSelect')?.addEventListener('change', (e) => {
    loadRoundMatches(Number(e.target.value));
  });
  document.getElementById('prevRoundBtn')?.addEventListener('click', () => {
    if (appState.selectedRound > 1) loadRoundMatches(appState.selectedRound - 1);
  });
  document.getElementById('nextRoundBtn')?.addEventListener('click', () => {
    const maxR = appState.data?.rounds?.allRounds?.length || 16;
    if (appState.selectedRound < maxR) loadRoundMatches(appState.selectedRound + 1);
  });

  // Modal Kapatma ve Sekmeler
  document.getElementById('closeModalBtn')?.addEventListener('click', closeMatchModal);
  document.getElementById('matchModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'matchModal') {
      closeMatchModal();
    }
  });
  document.getElementById('modalTabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (btn?.dataset.mtab) {
      switchModalTab(btn.dataset.mtab);
    }
  });

  // Kayıtlı dili uygula ve veriler varsa ANINDA senkron render et (0ms Bekleme)
  setLanguage(appState.lang);
  if (appState.data) {
    renderAll();
  }

  // Canlı ve Anlık Veri: Arka planda yüksek hızlı senkronizasyon (2.5 saniyede bir)
  fetchDashboard();
  setInterval(fetchDashboard, 2500);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchDashboard();
    }
  });
  window.addEventListener('focus', fetchDashboard);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
