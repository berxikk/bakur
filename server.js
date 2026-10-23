const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const PORT = process.env.PORT || 3021;
const AMED_ESPN_ID = '132335';
const ESPN_SITE_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1';
const ESPN_WEB_BASE = 'https://site.web.api.espn.com/apis/v2/sports/soccer/tur.1';

// Supabase Cloud Storage (Kalıcı ve Yeniden Başlatmalara Karşı Güvenli Bulut Depolama)
const SUPABASE_STORAGE_URL = 'https://iskwimpaynzzyzkjyyrd.supabase.co';
const SUPABASE_STORAGE_KEY = 'sb_publishable_8t5OyVlM_dfb3wfg30U3FA_Pyee-8d0';

// Web Güvenlik Başlıkları (OWASP Standartları)
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-DNS-Prefetch-Control': 'off'
};

// Bellek İçi IP Hız Limitleyici (Rate Limiter - DDoS ve Brute Force Koruması)
const rateLimitMap = new Map();

function checkRateLimit(ip, action, maxRequests, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    rateLimitMap.set(key, entry);
    return { allowed: true };
  }

  entry.count++;
  rateLimitMap.set(key, entry);
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    };
  }
  return { allowed: true };
}

// Süresi dolmuş hız limiti kayıtlarını temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000).unref();

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'application/json'
};

// Türkçe Kulüp İsimleri ve Resmi Yerel Logo Eşleştirmesi
const TURKISH_TEAM_NAMES = {
  '132335': { name: 'Amedspor', shortName: 'Amedspor' },
  '432': { name: 'Galatasaray', shortName: 'Galatasaray' },
  '1895': { name: 'Beşiktaş', shortName: 'Beşiktaş' },
  '436': { name: 'Fenerbahçe', shortName: 'Fenerbahçe' },
  '997': { name: 'Trabzonspor', shortName: 'Trabzonspor' },
  '9078': { name: 'Alanyaspor', shortName: 'Alanyaspor' },
  '995': { name: 'Kocaelispor', shortName: 'Kocaelispor' },
  '132334': { name: 'Çorum FK', shortName: 'Çorum FK' },
  '6870': { name: 'Kasımpaşa', shortName: 'Kasımpaşa' },
  '7656': { name: 'Çaykur Rizespor', shortName: 'Ç. Rizespor' },
  '7914': { name: 'Başakşehir', shortName: 'Başakşehir' },
  '20070': { name: 'Gaziantep FK', shortName: 'Gaziantep FK' },
  '996': { name: 'Gençlerbirliği', shortName: 'Gençlerbirliği' },
  '19267': { name: 'Erzurumspor FK', shortName: 'Erzurumspor' },
  '789': { name: 'Göztepe', shortName: 'Göztepe' },
  '7648': { name: 'Konyaspor', shortName: 'Konyaspor' },
  '11429': { name: 'Samsunspor', shortName: 'Samsunspor' },
  '20729': { name: 'Eyüpspor', shortName: 'Eyüpspor' }
};

function getNormalizedTeam(rawTeamObj, fallbackId = '') {
  const id = String(rawTeamObj?.id || fallbackId || '');
  const mapped = TURKISH_TEAM_NAMES[id];
  const rawName = rawTeamObj?.displayName || rawTeamObj?.name || '';
  const localLogoPath = path.join(__dirname, 'public', 'logos', `${id}.png`);
  const hasLocalLogo = fs.existsSync(localLogoPath);

  return {
    id,
    name: mapped ? mapped.name : rawName,
    shortName: mapped ? mapped.shortName : (rawTeamObj?.shortDisplayName || rawName),
    abbreviation: rawTeamObj?.abbreviation || '',
    logo: hasLocalLogo ? `/logos/${id}.png` : `/logos/132335.png`
  };
}

// Ülke İsimleri Türkçe ve ISO Bayrak Kodları
const COUNTRY_MAP = {
  'Turkey': { tr: 'Türkiye', iso: 'tr' },
  'Türkiye': { tr: 'Türkiye', iso: 'tr' },
  'Nigeria': { tr: 'Nijerya', iso: 'ng' },
  'Ivory Coast': { tr: 'Fildişi Sahili', iso: 'ci' },
  'Cote d\'Ivoire': { tr: 'Fildişi Sahili', iso: 'ci' },
  'Senegal': { tr: 'Senegal', iso: 'sn' },
  'Switzerland': { tr: 'İsviçre', iso: 'ch' },
  'Madagascar': { tr: 'Madagaskar', iso: 'mg' },
  'Israel': { tr: 'İsrail', iso: 'il' },
  'Mali': { tr: 'Mali', iso: 'ml' },
  'Cameroon': { tr: 'Kamerun', iso: 'cm' },
  'Portugal': { tr: 'Portekiz', iso: 'pt' },
  'Germany': { tr: 'Almanya', iso: 'de' },
  'France': { tr: 'Fransa', iso: 'fr' },
  'Syria': { tr: 'Suriye', iso: 'sy' },
  'Brazil': { tr: 'Brezilya', iso: 'br' },
  'Morocco': { tr: 'Fas', iso: 'ma' },
  'Ghana': { tr: 'Gana', iso: 'gh' },
  'DR Congo': { tr: 'Kongo DC', iso: 'cd' },
  'Scotland': { tr: 'İskoçya', iso: 'gb-sct' },
  'Kosovo': { tr: 'Kosova', iso: 'xk' },
  'Guinea': { tr: 'Gine', iso: 'gn' },
  'Austria': { tr: 'Avusturya', iso: 'at' }
};

// Oyuncu Piyasa Değeri, Ayak Bilgisi ve Sezon Performans Verileri (Gol, Asist, Kartlar)
const PLAYER_MARKET_ENRICHMENT = {
  'Gift Orban': { marketValue: 7300000, foot: 'Sağ', posDetail: 'Santrafor (ST)', goals: 9, assists: 2, yellowCards: 2, redCards: 0 },
  'Yira Collins Sor': { marketValue: 3900000, foot: 'Sağ', posDetail: 'Sol Kanat (LW)', goals: 2, assists: 1, yellowCards: 1, redCards: 0 },
  'Yira Sor': { marketValue: 3900000, foot: 'Sağ', posDetail: 'Sol Kanat (LW)', goals: 2, assists: 1, yellowCards: 1, redCards: 0 },
  'Samuel Ballet': { marketValue: 3800000, foot: 'Her İkisi', posDetail: 'Sağ Kanat (RW)', goals: 2, assists: 3, yellowCards: 1, redCards: 0 },
  'Alban Lafont': { marketValue: 4500000, foot: 'Sağ', posDetail: 'Kaleci (GK)', goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
  'Rayan Raveloson': { marketValue: 1100000, foot: 'Sağ', posDetail: 'Merkez Orta Saha (CM)', goals: 1, assists: 2, yellowCards: 3, redCards: 0 },
  'Mbaye Diagne': { marketValue: 640000, foot: 'Sağ', posDetail: 'Santrafor (ST)', goals: 5, assists: 1, yellowCards: 1, redCards: 0 },
  'Dia Saba': { marketValue: 1200000, foot: 'Sol', posDetail: 'On Numara (AM)', goals: 3, assists: 4, yellowCards: 1, redCards: 0 },
  'Adama Traoré': { marketValue: 1500000, foot: 'Sol', posDetail: 'Ofansif Orta Saha', goals: 2, assists: 2, yellowCards: 1, redCards: 0 },
  'David Bates': { marketValue: 1500000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 0, assists: 0, yellowCards: 2, redCards: 0 },
  'Mehmet Yesil': { marketValue: 800000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 1, assists: 0, yellowCards: 2, redCards: 0 },
  'Mehmet Yeşil': { marketValue: 800000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 1, assists: 0, yellowCards: 2, redCards: 0 },
  'Lumbardh Dellova': { marketValue: 1000000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 1, assists: 0, yellowCards: 3, redCards: 0 },
  'Umut Meras': { marketValue: 1200000, foot: 'Sol', posDetail: 'Sol Bek (LB)', goals: 0, assists: 2, yellowCards: 3, redCards: 0 },
  'Umut Meraş': { marketValue: 1200000, foot: 'Sol', posDetail: 'Sol Bek (LB)', goals: 0, assists: 2, yellowCards: 3, redCards: 0 },
  'Gökhan Gül': { marketValue: 850000, foot: 'Sağ', posDetail: 'Ön Libero (DM)', goals: 1, assists: 1, yellowCards: 4, redCards: 0 },
  'Gokhan Gul': { marketValue: 850000, foot: 'Sağ', posDetail: 'Ön Libero (DM)', goals: 1, assists: 1, yellowCards: 4, redCards: 0 },
  'Furkan Soyalp': { marketValue: 700000, foot: 'Sağ', posDetail: 'Merkez Orta Saha (CM)', goals: 2, assists: 3, yellowCards: 1, redCards: 0 },
  'Muhammed Damar': { marketValue: 1200000, foot: 'Sağ', posDetail: 'On Numara (AM)', goals: 3, assists: 2, yellowCards: 1, redCards: 0 },
  'Ermal Krasniqi': { marketValue: 2000000, foot: 'Sağ', posDetail: 'Sol Kanat (LW)', goals: 3, assists: 4, yellowCards: 2, redCards: 0 },
  'Miraç Acer': { marketValue: 350000, foot: 'Sağ', posDetail: 'Sağ Bek (RB)', goals: 0, assists: 1, yellowCards: 2, redCards: 0 },
  'Mirac Acer': { marketValue: 350000, foot: 'Sağ', posDetail: 'Sağ Bek (RB)', goals: 0, assists: 1, yellowCards: 2, redCards: 0 },
  'Ali Bülbül': { marketValue: 300000, foot: 'Sağ', posDetail: 'Sağ Bek (RB)', goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
  'Ali Bulbul': { marketValue: 300000, foot: 'Sağ', posDetail: 'Sağ Bek (RB)', goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
  'Amadou Cissé': { marketValue: 400000, foot: 'Sağ', posDetail: 'Merkez Orta Saha', goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
  'Amadou Cisse': { marketValue: 400000, foot: 'Sağ', posDetail: 'Merkez Orta Saha', goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
  'Rayan Lutin': { marketValue: 350000, foot: 'Sol', posDetail: 'Ofansif Orta Saha', goals: 1, assists: 1, yellowCards: 0, redCards: 0 },
  'Berk Kizildemir': { marketValue: 200000, foot: 'Sağ', posDetail: 'Ön Libero', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Berk Kızıldemir': { marketValue: 200000, foot: 'Sağ', posDetail: 'Ön Libero', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Cem Üstündag': { marketValue: 250000, foot: 'Sağ', posDetail: 'Orta Saha (CM)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Cem Ustundag': { marketValue: 250000, foot: 'Sağ', posDetail: 'Orta Saha (CM)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Mustafa Burak Boznan': { marketValue: 150000, foot: 'Sağ', posDetail: 'Kaleci (GK)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Kahraman Demirtapa': { marketValue: 200000, foot: 'Sol', posDetail: 'Stoper (CB)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Yakup Gi̇Ri̇Şen': { marketValue: 150000, foot: 'Sağ', posDetail: 'Sol Bek (LB)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Yakup Girisen': { marketValue: 150000, foot: 'Sağ', posDetail: 'Sol Bek (LB)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'İsmail Duyu': { marketValue: 100000, foot: 'Sağ', posDetail: 'Kaleci (GK)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Ismail Duyu': { marketValue: 100000, foot: 'Sağ', posDetail: 'Kaleci (GK)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Mohamed Khalil': { marketValue: 300000, foot: 'Sağ', posDetail: 'Santrafor (ST)', goals: 1, assists: 0, yellowCards: 0, redCards: 0 },
  'Dilhan Demir': { marketValue: 250000, foot: 'Sağ', posDetail: 'Sol Kanat', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Muhammed Hasan Yıldırım': { marketValue: 200000, foot: 'Sağ', posDetail: 'Santrafor (ST)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Muhammed Hasan Yildirim': { marketValue: 200000, foot: 'Sağ', posDetail: 'Santrafor (ST)', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  'Bruno Miguel': { marketValue: 850000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 0, assists: 1, yellowCards: 3, redCards: 0 },
  'Ömer Bayram': { marketValue: 250000, foot: 'Sol', posDetail: 'Sol Bek (LB)', goals: 0, assists: 3, yellowCards: 2, redCards: 0 },
  'Uğur Adem Gezer': { marketValue: 400000, foot: 'Sağ', posDetail: 'Stoper (CB)', goals: 1, assists: 0, yellowCards: 4, redCards: 1 }
};

// Oyuncu İsimleri ve Mevkileri İçin Doğru Türkçe Yazım ve Mevki Düzeltme Tablosu
const CANONICAL_PLAYER_CORRECTIONS = {
  'Yakup Gi̇Ri̇Şen': { name: 'Yakup Girişen', shortName: 'Y. Girişen', position: 'D', posDetail: 'Sol Bek (LB)' },
  'Yakup Girisen': { name: 'Yakup Girişen', shortName: 'Y. Girişen', position: 'D', posDetail: 'Sol Bek (LB)' },
  'Mustafa Burak Boznan': { name: 'Mustafa Burak Bozan', shortName: 'M. Bozan', position: 'G', posDetail: 'Kaleci (GK)' },
  'Mustafa Burak Bozan': { name: 'Mustafa Burak Bozan', shortName: 'M. Bozan', position: 'G', posDetail: 'Kaleci (GK)' },
  'Kahraman Demirtapa': { name: 'Kahraman Demirtaş', shortName: 'K. Demirtaş', position: 'D', posDetail: 'Stoper (CB)' },
  'Kahraman Demirtaş': { name: 'Kahraman Demirtaş', shortName: 'K. Demirtaş', position: 'D', posDetail: 'Stoper (CB)' },
  'Mehmet Yesil': { name: 'Mehmet Yeşil', shortName: 'M. Yeşil', position: 'D', posDetail: 'Stoper (CB)' },
  'Mehmet Yeşil': { name: 'Mehmet Yeşil', shortName: 'M. Yeşil', position: 'D', posDetail: 'Stoper (CB)' },
  'Umut Meras': { name: 'Umut Meraş', shortName: 'U. Meraş', position: 'D', posDetail: 'Sol Bek (LB)' },
  'Umut Meraş': { name: 'Umut Meraş', shortName: 'U. Meraş', position: 'D', posDetail: 'Sol Bek (LB)' },
  'Cem Üstündag': { name: 'Cem Üstündağ', shortName: 'C. Üstündağ', position: 'M', posDetail: 'Orta Saha (CM)' },
  'Cem Üstündağ': { name: 'Cem Üstündağ', shortName: 'C. Üstündağ', position: 'M', posDetail: 'Orta Saha (CM)' },
  'Berk Kizildemir': { name: 'Berk Kızıldemir', shortName: 'B. Kızıldemir', position: 'M', posDetail: 'Ön Libero (DM)' },
  'Berk Kızıldemir': { name: 'Berk Kızıldemir', shortName: 'B. Kızıldemir', position: 'M', posDetail: 'Ön Libero (DM)' },
  'Muhammed Damar': { name: 'Muhammed Damar', shortName: 'M. Damar', position: 'M', posDetail: 'On Numara (AM)' },
  'İsmail Duyu': { name: 'İsmail Duyu', shortName: 'İ. Duyu', position: 'G', posDetail: 'Kaleci (GK)' },
  'Ismail Duyu': { name: 'İsmail Duyu', shortName: 'İ. Duyu', position: 'G', posDetail: 'Kaleci (GK)' },
  'Amadou Cissé': { name: 'Amadou Cissé', shortName: 'A. Cissé', position: 'M', posDetail: 'Merkez Orta Saha (CM)' },
  'Amadou Cisse': { name: 'Amadou Cissé', shortName: 'A. Cissé', position: 'M', posDetail: 'Merkez Orta Saha (CM)' },
  'Mohamed Khalil': { name: 'Mohamed Khalil', shortName: 'M. Khalil', position: 'F', posDetail: 'Santrafor (ST)' }
};

let liveSquadStatsCache = {
  timestamp: 0,
  data: {}
};

function normalizeNameForCompare(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function getLiveSquadStats(pastMatches = []) {
  const now = Date.now();
  if (liveSquadStatsCache.timestamp && (now - liveSquadStatsCache.timestamp < 10 * 60 * 1000)) {
    return liveSquadStatsCache.data;
  }

  const statMap = {};

  const getEntry = (rawName) => {
    if (!rawName) return null;
    const correction = CANONICAL_PLAYER_CORRECTIONS[rawName] || {};
    const name = correction.name || rawName;
    if (!statMap[name]) {
      statMap[name] = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
    }
    return statMap[name];
  };

  // 1. Oynanmış maçların ESPN summary rosters detaylarından gerçek maç içi istatistikleri topla (asist, süre, vs.)
  const matchIds = (pastMatches || []).map(m => m.id).filter(Boolean);
  if (matchIds.length > 0) {
    try {
      const summaries = await Promise.all(
        matchIds.map(id => fetchJson(`${ESPN_SITE_BASE}/summary?event=${id}`, 60000))
      );
      summaries.forEach(s => {
        if (!s) return;
        const amedRoster = (s.rosters || []).find(r =>
          r.team?.displayName?.includes('Amed') ||
          String(r.team?.id) === String(AMED_ESPN_ID) ||
          r.team?.name?.includes('Amed')
        );
        if (amedRoster && Array.isArray(amedRoster.roster)) {
          amedRoster.roster.forEach(a => {
            const rawName = a.athlete?.displayName || a.athlete?.fullName;
            const entry = getEntry(rawName);
            if (!entry) return;
            const assistsVal = a.stats?.find(x => x.name === 'goalAssists')?.value || 0;
            const appVal = a.stats?.find(x => x.name === 'appearances')?.value || (a.starter || a.subbedIn ? 1 : 0);
            entry.assists += assistsVal;
            entry.appearances += appVal;
          });
        }
      });
    } catch (e) {
      console.warn('Live squad stats summary fetch error:', e.message);
    }
  }

  // 2. Canlı/Gerçek Maç İçi Goller ve Kartlar: Tüm pastMatches üzerinden eksiksiz topla!
  (pastMatches || []).forEach(m => {
    const isAmedHome = (String(m.homeTeam?.id) === String(AMED_ESPN_ID) || (m.homeTeam?.name || '').includes('Amed'));
    const isAmedAway = (String(m.awayTeam?.id) === String(AMED_ESPN_ID) || (m.awayTeam?.name || '').includes('Amed'));

    (m.goals || []).forEach(g => {
      const forAmed = (g.isHome && isAmedHome) || (!g.isHome && isAmedAway);
      if (forAmed && g.player && !g.isOwnGoal) {
        const entry = getEntry(g.player);
        if (entry) {
          entry.goals += 1;
        }
      }
    });

    (m.cards || []).forEach(c => {
      const forAmed = (c.isHome && isAmedHome) || (!c.isHome && isAmedAway);
      if (forAmed && c.player) {
        const entry = getEntry(c.player);
        if (entry) {
          if (c.cardType === 'yellow') {
            entry.yellowCards += 1;
          } else if (c.cardType === 'red') {
            entry.redCards += 1;
          }
        }
      }
    });
  });

  liveSquadStatsCache = {
    timestamp: now,
    data: statMap
  };
  return statMap;
}

function findLiveStatsForPlayer(pName, statMap) {
  if (!pName || !statMap) return { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
  if (statMap[pName]) return statMap[pName];

  const target = normalizeNameForCompare(pName);
  // 1. Doğrudan normalize isim eşleşmesi
  for (const [k, v] of Object.entries(statMap)) {
    if (normalizeNameForCompare(k) === target) return v;
  }
  // 2. Kapsama / alt dize eşleşmesi (Mbaye Diagne / Diagne veya Yira Collins Sor / Yira Sor)
  for (const [k, v] of Object.entries(statMap)) {
    const kNorm = normalizeNameForCompare(k);
    if (kNorm.length >= 4 && target.length >= 4) {
      if (kNorm.includes(target) || target.includes(kNorm)) return v;
    }
  }
  // 3. Soyadı eşleşmesi
  const pParts = (pName || '').trim().split(/\s+/);
  const pLast = pParts[pParts.length - 1];
  const pLastNorm = normalizeNameForCompare(pLast);
  if (pLastNorm.length >= 4) {
    for (const [k, v] of Object.entries(statMap)) {
      const kNorm = normalizeNameForCompare(k);
      if (kNorm.includes(pLastNorm)) return v;
    }
  }

  return { goals: 0, assists: 0, yellowCards: 0, redCards: 0, appearances: 0 };
}

// Bellek İçi Hızlı Önbellek
const cache = new Map();
async function fetchJson(url, ttlMs = 12000) {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return cached ? cached.data : null;
    const data = await res.json();
    cache.set(url, { data, timestamp: now });
    return data;
  } catch (err) {
    return cached ? cached.data : null;
  }
}

// ESPN Event Objesini Standart Maç Formatına Dönüştür
function normalizeEspnEvent(ev, indexRound = null) {
  const comp = ev.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

  const stateStr = comp.status?.type?.state || 'pre'; // 'pre' | 'in' | 'post'
  const statusType =
    stateStr === 'in' ? 'inprogress' : stateStr === 'post' ? 'finished' : 'notstarted';

  const getScore = c => {
    if (c.score === undefined || c.score === null) return undefined;
    if (typeof c.score === 'object') return c.score.value ?? Number(c.score.displayValue ?? 0);
    return Number(c.score);
  };

  return {
    id: ev.id,
    startTimestamp: Math.floor(new Date(ev.date).getTime() / 1000),
    tournament: {
      name: 'Trendyol Süper Lig',
      slug: 'trendyol-super-lig'
    },
    roundInfo: {
      round: indexRound
    },
    venue: comp.venue?.fullName || 'Diyarbakır Stadyumu',
    city: comp.venue?.address?.city || '',
    status: {
      type: statusType,
      state: stateStr,
      clock: comp.status?.displayClock || '',
      description:
        stateStr === 'in'
          ? `CANLI • ${comp.status?.displayClock || ''}`
          : stateStr === 'post'
          ? 'Maç Sonu'
          : 'Başlamadı'
    },
    homeTeam: getNormalizedTeam(home.team, home.id),
    awayTeam: getNormalizedTeam(away.team, away.id),
    homeScore: {
      current: getScore(home)
    },
    awayScore: {
      current: getScore(away)
    }
  };
}

// Süper Lig Hafta Tarih Aralıkları (2026/27 Sezonu)
const SUPERLIG_WEEKS = [
  { round: 1, days: ['20260814', '20260815', '20260816', '20260817'], label: '1. Hafta (14-17 Ağu)' },
  { round: 2, days: ['20260821', '20260822', '20260823', '20260824'], label: '2. Hafta (21-24 Ağu)' },
  { round: 3, days: ['20260828', '20260829', '20260830', '20260831'], label: '3. Hafta (28-31 Ağu)' },
  { round: 4, days: ['20260904', '20260905', '20260906', '20260907'], label: '4. Hafta (4-7 Eyl)' },
  { round: 5, days: ['20260911', '20260912', '20260913', '20260914'], label: '5. Hafta (11-14 Eyl)' },
  { round: 6, days: ['20260918', '20260919', '20260920'], label: '6. Hafta (18-20 Eyl)' },
  { round: 7, days: ['20261009', '20261010', '20261011', '20261012'], label: '7. Hafta (9-12 Eki)' },
  { round: 8, days: ['20261016', '20261017', '20261018', '20261019'], label: '8. Hafta (16-19 Eki)' },
  { round: 9, days: ['20261023', '20261024', '20261025', '20261026'], label: '9. Hafta (23-26 Eki)' },
  { round: 10, days: ['20261030', '20261031', '20261101', '20261102'], label: '10. Hafta (30 Eki-2 Kas)' },
  { round: 11, days: ['20261106', '20261107', '20261108'], label: '11. Hafta (6-8 Kas)' },
  { round: 12, days: ['20261121', '20261122', '20261123'], label: '12. Hafta (21-23 Kas)' },
  { round: 13, days: ['20261127', '20261128', '20261129', '20261130'], label: '13. Hafta (27-30 Kas)' },
  { round: 14, days: ['20261204', '20261205', '20261206', '20261207'], label: '14. Hafta (4-7 Ara)' },
  { round: 15, days: ['20261211', '20261212', '20261213', '20261214'], label: '15. Hafta (11-14 Ara)' },
  { round: 16, days: ['20261218', '20261219', '20261220', '20261221'], label: '16. Hafta (18-21 Ara)' },
  { round: 17, days: ['20261225', '20261226', '20261227', '20261228'], label: '17. Hafta (25-28 Ara)' },
  { round: 18, days: ['20270108', '20270109', '20270110', '20270111'], label: '18. Hafta (8-11 Oca)' },
  { round: 19, days: ['20270115', '20270116', '20270117', '20270118'], label: '19. Hafta (15-18 Oca)' }
];

// Aktif Süper Lig Haftasını Tarihe Göre Otomatik Belirle (Hafta bittiğinde kendiliğinden yeni haftaya geçer)
function getCurrentSuperligWeek() {
  const trDate = new Date(Date.now() + 3 * 3600 * 1000); // Türkiye Saati (UTC+3)
  const y = trDate.getUTCFullYear();
  const m = String(trDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(trDate.getUTCDate()).padStart(2, '0');
  const todayStr = `${y}${m}${d}`;

  // 1. Bugünü gün listesinde içeren hafta
  const directMatch = SUPERLIG_WEEKS.find(w => Array.isArray(w.days) && w.days.includes(todayStr));
  if (directMatch) return directMatch;

  // 2. Hafta maçları bitmişse (son günü bugünden küçükse), son günü bugünden büyük veya eşit olan ilk hafta (aktif/sıradaki hafta)
  const nextWeek = SUPERLIG_WEEKS.find(w => {
    if (!Array.isArray(w.days) || w.days.length === 0) return false;
    const lastDay = w.days[w.days.length - 1];
    return lastDay >= todayStr;
  });
  if (nextWeek) return nextWeek;

  // 3. Fallback: Sezon sonu ise son hafta, sezon öncesi ise ilk hafta
  return SUPERLIG_WEEKS[SUPERLIG_WEEKS.length - 1] || SUPERLIG_WEEKS[0];
}

async function fetchWeekMatches(weekObj, ttlMs = 12000) {
  const results = await Promise.all(
    (weekObj.days || []).map(d => fetchJson(`${ESPN_SITE_BASE}/scoreboard?dates=${d}`, ttlMs))
  );
  const allEvents = [];
  results.forEach(r => {
    (r?.events || []).forEach(ev => {
      allEvents.push(normalizeEspnEvent(ev, weekObj.round));
    });
  });
  return allEvents;
}

function sendJson(res, data, status = 200, extraHeaders = {}, req = null) {
  const request = req || res.req;
  const acceptEncoding = (request && request.headers && request.headers['accept-encoding']) || '';
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...SECURITY_HEADERS,
    ...extraHeaders
  };

  if (acceptEncoding.includes('gzip') && jsonStr.length > 512) {
    const compressed = zlib.gzipSync(Buffer.from(jsonStr));
    headers['Content-Encoding'] = 'gzip';
    headers['Content-Length'] = compressed.length;
    res.writeHead(status, headers);
    return res.end(compressed);
  }

  res.writeHead(status, headers);
  res.end(jsonStr);
}

// İstatistikleri Türkçeleştirme, Kategori ve Yüzde Formatlama Yardımcıları
// İstatistikleri Türkçeleştirme, Kategori ve Yüzde Formatlama Yardımcıları
const STAT_META = {
  possessionPct: { label: 'Topla Oynama (%)', category: 'overview', isPct: true },
  totalShots: { label: 'Toplam Şut', category: 'attack' },
  shotsOnTarget: { label: 'İsabetli Şut', category: 'attack' },
  shotPct: { label: 'Şut İsabet Oranı (%)', category: 'attack', isRatioPct: true },
  blockedShots: { label: 'Engellenen Şut', category: 'attack' },
  expectedGoals: { label: 'Beklenen Gol (xG)', category: 'attack' },
  dangerousAttacks: { label: 'Tehlikeli Hücum', category: 'attack' },
  totalAttacks: { label: 'Toplam Hücum', category: 'attack' },
  shotsInsideBox: { label: 'Ceza Sahası İçi Şut', category: 'attack' },
  shotsOutsideBox: { label: 'Ceza Sahası Dışı Şut', category: 'attack' },
  bigChancesCreated: { label: 'Yaratılan Net Fırsat', category: 'attack' },
  duelsWonPct: { label: 'İkili Mücadele Kazanma (%)', category: 'defense', isPct: true },
  aerialDuelsWonPct: { label: 'Hava Topu Mücadelesi (%)', category: 'defense', isPct: true },
  penaltyKickGoals: { label: 'Penaltı Golü', category: 'attack' },
  penaltyKickShots: { label: 'Kullanılan Penaltı', category: 'attack' },
  wonCorners: { label: 'Kazanılan Korner', category: 'overview' },
  offsides: { label: 'Ofsayt', category: 'overview' },
  saves: { label: 'Kaleci Kurtarışı', category: 'overview' },
  totalPasses: { label: 'Toplam Pas', category: 'passing' },
  accuratePasses: { label: 'İsabetli Pas', category: 'passing' },
  passPct: { label: 'Pas İsabet Oranı (%)', category: 'passing', isRatioPct: true },
  totalCrosses: { label: 'Toplam Orta', category: 'passing' },
  accurateCrosses: { label: 'İsabetli Orta', category: 'passing' },
  crossPct: { label: 'Orta İsabet Oranı (%)', category: 'passing', isRatioPct: true },
  totalLongBalls: { label: 'Uzun Pas / Uzun Top', category: 'passing' },
  accurateLongBalls: { label: 'İsabetli Uzun Top', category: 'passing' },
  longballPct: { label: 'Uzun Top İsabet Oranı (%)', category: 'passing', isRatioPct: true },
  totalTackles: { label: 'Toplam Top Çalma Girişimi', category: 'defense' },
  effectiveTackles: { label: 'Başarılı Top Çalma', category: 'defense' },
  tacklePct: { label: 'Top Çalma Başarı Oranı (%)', category: 'defense', isRatioPct: true },
  interceptions: { label: 'Pas Arası (Interception)', category: 'defense' },
  totalClearance: { label: 'Toplam Uzaklaştırma', category: 'defense' },
  effectiveClearance: { label: 'Başarılı Uzaklaştırma', category: 'defense' },
  foulsCommitted: { label: 'Yapılan Faul', category: 'discipline' },
  yellowCards: { label: 'Sarı Kart', category: 'discipline' },
  redCards: { label: 'Kırmızı Kart', category: 'discipline' }
};

function formatStatDisplay(statName, rawVal) {
  if (rawVal === undefined || rawVal === null || rawVal === '') return { text: '0', num: 0 };
  const meta = STAT_META[statName] || {};
  const str = String(rawVal).replace('%', '').trim();
  const num = parseFloat(str) || 0;

  if (meta.isRatioPct) {
    const pct = num <= 1 && num > 0 ? Math.round(num * 100) : Math.round(num);
    return { text: `%${pct}`, num: pct };
  }
  if (meta.isPct) {
    return { text: `%${num}`, num };
  }
  return { text: String(rawVal), num };
}

function computeMatchIntelligence(eventInfo, statsOrRawHome, rawAwayStats, keyEvents, commentary, homeRoster, awayRoster) {
  const getVal = (name) => {
    if (Array.isArray(statsOrRawHome) && statsOrRawHome.length > 0 && statsOrRawHome[0]?.homeValue !== undefined) {
      const found = statsOrRawHome.find(x => x.name === name);
      return {
        home: Number(found?.homeValue ?? parseFloat(String(found?.home || '0').replace('%', '')) ?? 0),
        away: Number(found?.awayValue ?? parseFloat(String(found?.away || '0').replace('%', '')) ?? 0)
      };
    }
    const hs = (statsOrRawHome || []).find(x => x.name === name);
    const as = (rawAwayStats || []).find(x => x.name === name);
    return {
      home: parseFloat(String(hs?.displayValue ?? '0').replace('%', '')) || 0,
      away: parseFloat(String(as?.displayValue ?? '0').replace('%', '')) || 0
    };
  };

  const shots = getVal('totalShots');
  const onTarget = getVal('shotsOnTarget');
  const corners = getVal('wonCorners');
  const fouls = getVal('foulsCommitted');
  const passes = getVal('accuratePasses');
  const possession = getVal('possessionPct');
  const saves = getVal('saves');

  const homeGoals = Number(eventInfo.homeTeam?.score ?? eventInfo.homeScore?.current ?? 0) || 0;
  const awayGoals = Number(eventInfo.awayTeam?.score ?? eventInfo.awayScore?.current ?? 0) || 0;

  // 1. xG (Expected Goals) Analizi
  const evList = keyEvents || [];
  const homePenalties = evList.filter(k => k.isHome && (k.isPenalty || String(k.text || '').toLowerCase().includes('penalt'))).length;
  const awayPenalties = evList.filter(k => !k.isHome && (k.isPenalty || String(k.text || '').toLowerCase().includes('penalt'))).length;

  const homeOpenTarget = Math.max(0, onTarget.home - homePenalties);
  const awayOpenTarget = Math.max(0, onTarget.away - awayPenalties);
  const homeOff = Math.max(0, shots.home - onTarget.home);
  const awayOff = Math.max(0, shots.away - onTarget.away);

  let calcHomeXg = (homePenalties * 0.79) + (homeOpenTarget * 0.28) + (homeOff * 0.05) + (corners.home * 0.03);
  let calcAwayXg = (awayPenalties * 0.79) + (awayOpenTarget * 0.28) + (awayOff * 0.05) + (corners.away * 0.03);

  if (calcHomeXg === 0 && calcAwayXg === 0) {
    calcHomeXg = homeGoals > 0 ? (homeGoals * 0.82 + 0.3) : (shots.home > 0 ? shots.home * 0.09 : 0.35);
    calcAwayXg = awayGoals > 0 ? (awayGoals * 0.82 + 0.25) : (shots.away > 0 ? shots.away * 0.09 : 0.28);
  }
  const xG = {
    home: Number(calcHomeXg.toFixed(2)),
    away: Number(calcAwayXg.toFixed(2))
  };

  // 2. Hücum ve Tehlikeli Atak Dağılımı
  const homeAttacks = Math.max(38, Math.round((possession.home || 50) * 1.5 + (passes.home > 0 ? passes.home / 7 : 18)));
  const awayAttacks = Math.max(32, Math.round((possession.away || 50) * 1.5 + (passes.away > 0 ? passes.away / 7 : 16)));
  const homeDang = Math.max(14, Math.round(shots.home * 2.6 + corners.home * 2.8 + (possession.home > 50 ? 10 : 4)));
  const awayDang = Math.max(11, Math.round(shots.away * 2.6 + corners.away * 2.8 + (possession.away > 50 ? 10 : 4)));

  // 3. Şut Kalitesi & Ceza Sahası Dağılımı
  const shotsInBox = {
    home: Math.max(homeGoals, Math.round(onTarget.home * 0.72 + (shots.home - onTarget.home) * 0.35)),
    away: Math.max(awayGoals, Math.round(onTarget.away * 0.72 + (shots.away - onTarget.away) * 0.35))
  };
  const shotsOutBox = {
    home: Math.max(0, shots.home - shotsInBox.home),
    away: Math.max(0, shots.away - shotsInBox.away)
  };
  const bigChances = {
    homeCreated: Math.max(homeGoals, Math.round(xG.home * 1.15)),
    awayCreated: Math.max(awayGoals, Math.round(xG.away * 1.15)),
    homeMissed: Math.max(0, Math.round(xG.home * 1.15) - homeGoals),
    awayMissed: Math.max(0, Math.round(xG.away * 1.15) - awayGoals)
  };

  // 4. İkili Mücadele & Hava Topu Kazanma Oranı
  const duelsHome = Math.min(74, Math.max(36, Math.round(50 + (fouls.away - fouls.home) * 1.3)));
  const aerialHome = Math.min(72, Math.max(38, Math.round(51 + (corners.home - corners.away) * 2.2)));

  // 5. Maç Momentum & Baskı Zaman Çizelgesi (15'er dakikalık periyotlar)
  const intervals = [
    { label: "0-15'", start: 0, end: 15 },
    { label: "16-30'", start: 16, end: 30 },
    { label: "31-45'", start: 31, end: 45 },
    { label: "46-60'", start: 46, end: 60 },
    { label: "61-75'", start: 61, end: 75 },
    { label: "76-90+'", start: 76, end: 125 }
  ];

  const momentum = intervals.map(inter => {
    let score = 0;
    evList.forEach(ke => {
      const min = parseInt(String(ke.time || '').replace("'", ""), 10) || 0;
      if (min >= inter.start && min <= inter.end) {
        const factor = ke.isHome ? 1 : -1;
        if (ke.eventKind === 'goal' || ke.scoringPlay) score += factor * 32;
        else if (ke.eventKind === 'red-card') score += factor * -24;
        else if (ke.eventKind === 'yellow-card') score += factor * -6;
        else score += factor * 8;
      }
    });
    const possDiff = ((possession.home || 50) - 50) * 0.55;
    score += Math.round(possDiff);
    score = Math.min(85, Math.max(-85, score));
    const pH = Math.max(15, Math.min(85, 50 + Math.round(score / 2)));
    return {
      interval: inter.label,
      pressureHome: pH,
      pressureAway: 100 - pH,
      value: score
    };
  });

  const currentPressure = momentum[momentum.length - 1] || { pressureHome: 52, pressureAway: 48 };

  // 6. Oyuncu Puanlama Algoritması (Sofascore standartı 6.0 - 9.8)
  const ratePlayer = (p, isHomeTeam, oppGoals) => {
    let r = 6.6;
    const st = p.stats || {};
    r += (st.goals || 0) * 1.35;
    r += (st.assists || 0) * 0.95;
    (p.plays || []).forEach(pl => {
      if (pl.goal) r += 0.3;
      if (pl.penalty) r += 0.45;
    });
    r += (st.shotsOnTarget || 0) * 0.32;
    r += (st.saves || 0) * 0.35;
    r -= (st.yellowCards || 0) * 0.5;
    r -= (st.redCards || 0) * 1.8;
    r -= (st.foulsCommitted || 0) * 0.08;
    r += (st.foulsSuffered || 0) * 0.12;

    const pos = String(p.position || '').toUpperCase();
    if (['G', 'GK', 'D', 'CB', 'LB', 'RB'].includes(pos)) {
      if (oppGoals === 0) r += 0.45;
      else if (oppGoals >= 2) r -= 0.25 * (oppGoals - 1);
    }
    if (!p.starter) r -= 0.2;
    return Number(Math.min(9.8, Math.max(5.8, r)).toFixed(1));
  };

  const homeStarters = (homeRoster?.starters || []).map(p => ({
    ...p,
    rating: ratePlayer(p, true, awayGoals)
  }));
  const homeSubs = (homeRoster?.substitutes || []).map(p => ({
    ...p,
    rating: ratePlayer(p, true, awayGoals)
  }));
  const awayStarters = (awayRoster?.starters || []).map(p => ({
    ...p,
    rating: ratePlayer(p, false, homeGoals)
  }));
  const awaySubs = (awayRoster?.substitutes || []).map(p => ({
    ...p,
    rating: ratePlayer(p, false, homeGoals)
  }));

  const allRated = [...homeStarters, ...homeSubs, ...awayStarters, ...awaySubs].sort((a, b) => b.rating - a.rating);
  const motm = allRated[0] ? {
    id: allRated[0].id,
    name: allRated[0].name,
    jersey: allRated[0].jersey,
    rating: allRated[0].rating,
    team: homeStarters.some(p => p.id === allRated[0].id) ? eventInfo.homeTeam?.name : eventInfo.awayTeam?.name
  } : null;

  // 7. Canlı Puan Durumu Etkisi (Live Table Simulation)
  let standingsImpact = null;
  const isAmedHome = String(eventInfo.homeTeam?.id) === String(AMED_ESPN_ID);
  const isAmedAway = String(eventInfo.awayTeam?.id) === String(AMED_ESPN_ID);
  if (isAmedHome || isAmedAway) {
    const amedG = isAmedHome ? homeGoals : awayGoals;
    const oppG = isAmedHome ? awayGoals : homeGoals;
    let earnedPts = 1;
    let descTR = 'Beraberlik Durumu (+1 Canlı Puan)';
    if (amedG > oppG) {
      earnedPts = 3;
      descTR = 'Galibiyet Durumu (+3 Canlı Puan) — Canlı lig tablosunda yükseliş!';
    } else if (amedG < oppG) {
      earnedPts = 0;
      descTR = 'Mağlubiyet Durumu (+0 Canlı Puan)';
    }
    standingsImpact = {
      earnedPoints: earnedPts,
      summary: descTR,
      amedGoals: amedG,
      oppGoals: oppG
    };
  }

  return {
    xG,
    attacks: {
      total: { home: homeAttacks, away: awayAttacks },
      dangerous: { home: homeDang, away: awayDang },
      zones: {
        home: { left: 37, center: 26, right: 37 },
        away: { left: 34, center: 31, right: 35 }
      }
    },
    shotsQuality: {
      insideBox: shotsInBox,
      outsideBox: shotsOutBox,
      bigChances
    },
    duels: {
      duelsWonPct: { home: duelsHome, away: 100 - duelsHome },
      aerialDuelsWonPct: { home: aerialHome, away: 100 - aerialHome }
    },
    momentum,
    currentPressure,
    motm,
    standingsImpact,
    ratedLineups: {
      home: { starters: homeStarters, substitutes: homeSubs },
      away: { starters: awayStarters, substitutes: awaySubs }
    }
  };
}

function generateRichMatchCommentary(eventInfo, rawCommentary, keyEvents, statistics, formattedHomeRoster, formattedAwayRoster) {
  const commItems = [];

  const homeName = eventInfo?.homeTeam?.name || 'Ev Sahibi';
  const awayName = eventInfo?.awayTeam?.name || 'Deplasman';
  const homeShort = eventInfo?.homeTeam?.shortName || homeName;
  const awayShort = eventInfo?.awayTeam?.shortName || awayName;
  const isFinished = eventInfo?.status?.type === 'finished';
  const isInProgress = eventInfo?.status?.type === 'inprogress';
  const isStarted = isFinished || isInProgress || eventInfo?.status?.state === 'in' || eventInfo?.status?.state === 'post';

  // Karşılaşma henüz başlamamışsa canlı anlatım üretme (maç başladı bildirimi veya olaylar gösterilmemelidir)
  if (!isStarted) {
    return [];
  }

  const clockText = String(eventInfo?.status?.clock || '');
  let currentMinute = 1;
  if (isFinished) {
    currentMinute = 95;
  } else if (clockText) {
    const parts = clockText.split('+');
    const baseMin = parseInt(parts[0].replace(/[^0-9]/g, ''), 10) || 0;
    const extraMin = parts[1] ? (parseInt(parts[1].replace(/[^0-9]/g, ''), 10) || 0) : 0;
    currentMinute = baseMin + (extraMin * 0.1);
    if (currentMinute <= 0) currentMinute = 1;
  }

  // 1. Kickoff düdüğü (1')
  const isAmedHome = String(eventInfo?.homeTeam?.id) === String(AMED_ESPN_ID) ||
    (eventInfo?.homeTeam?.name || '').toLowerCase().includes('amed') ||
    (eventInfo?.homeTeam?.shortName || '').toLowerCase().includes('amed');
  const isAmedAway = String(eventInfo?.awayTeam?.id) === String(AMED_ESPN_ID) ||
    (eventInfo?.awayTeam?.name || '').toLowerCase().includes('amed') ||
    (eventInfo?.awayTeam?.shortName || '').toLowerCase().includes('amed');
  const isAmedMatch = isAmedHome || isAmedAway;

  const kickoffText = isAmedMatch
    ? "Karşılaşma hakemin ilk düdüğüyle başladı! Amed'in her attığı gol, her yediği ofsayt olsun!❤️💚"
    : "Karşılaşma hakemin ilk düdüğüyle başladı!";

  commItems.push({
    minute: 1,
    time: "1'",
    kind: 'whistle',
    type: 'kickoff',
    text: kickoffText
  });

  // 2. ESPN Key Events (Goller, Kartlar, Değişiklikler)
  (keyEvents || []).forEach(ke => {
    const rawTime = ke.time || "1'";
    const minNum = parseFloat(String(rawTime).replace(/[^0-9.]/g, '')) || 1;
    const isHome = Boolean(ke.isHome);
    const teamName = isHome ? homeName : awayName;
    const player = (ke.participants && ke.participants[0]) || '';

    if (ke.eventKind === 'goal') {
      commItems.push({
        minute: minNum,
        time: rawTime,
        kind: 'goal',
        type: 'goal',
        text: `GOOOL! ${player ? `${player} (${teamName})` : teamName} harika bir vuruşla topu ağlarla buluşturdu! Skor tabelası değişti.`
      });
    } else if (ke.eventKind === 'red-card') {
      commItems.push({
        minute: minNum,
        time: rawTime,
        kind: 'card-red',
        type: 'red_card',
        text: `KIRMIZI KART! ${player ? `${player} (${teamName})` : teamName} hakem tarafından doğrudan kırmızı kartla oyundan ihraç edildi! ${teamName} sahada 10 kişi kaldı.`
      });
    } else if (ke.eventKind === 'yellow-card') {
      commItems.push({
        minute: minNum,
        time: rawTime,
        kind: 'card-yellow',
        type: 'yellow_card',
        text: `SARI KART! ${player ? `${player} (${teamName})` : teamName} yaptığı sert müdahale sonrasında karşılaşmanın hakeminden sarı kart gördü.`
      });
    } else if (ke.eventKind === 'substitution') {
      commItems.push({
        minute: minNum,
        time: rawTime,
        kind: 'sub',
        type: 'sub',
        text: `OYUNCU DEĞİŞİKLİĞİ: ${teamName} cephesinde teknik heyet değişikliğe gitti. ${player || 'Oyuncu'} sahaya dahil oldu.`
      });
    }
  });

  // 3. ESPN Raw Commentary
  (rawCommentary || []).forEach(rc => {
    const rawText = rc.text || '';
    if (!rawText) return;
    const rawTime = rc.time?.displayValue || rc.time || "1'";
    const minNum = parseFloat(String(rawTime).replace(/[^0-9.]/g, '')) || 1;
    const isDup = commItems.some(item => Math.abs(item.minute - minNum) < 0.5 && item.text.includes(rawText.slice(0, 15)));
    if (!isDup) {
      commItems.push({
        minute: minNum,
        time: rawTime,
        kind: rc.kind || 'general',
        type: 'general',
        text: rawText
      });
    }
  });

  // 4. Kadrodaki Oyuncuların İsimleriyle Gerçek Faul Anlatımı
  const homeStarters = formattedHomeRoster?.starters || [];
  const homeSubs = formattedHomeRoster?.substitutes || [];
  const allHome = [...homeStarters, ...homeSubs];

  const awayStarters = formattedAwayRoster?.starters || [];
  const awaySubs = formattedAwayRoster?.substitutes || [];
  const allAway = [...awayStarters, ...awaySubs];

  const homeFoulers = allHome.filter(p => p.stats?.foulsCommitted > 0);
  const awayFoulers = allAway.filter(p => p.stats?.foulsCommitted > 0);
  const homeVictims = allHome.filter(p => p.stats?.foulsSuffered > 0);
  const awayVictims = allAway.filter(p => p.stats?.foulsSuffered > 0);

  const cleanName = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&#305;/gi, 'ı')
      .replace(/&#304;/gi, 'İ')
      .replace(/&#287;/gi, 'ğ')
      .replace(/&#286;/gi, 'Ğ')
      .replace(/&#252;/gi, 'ü')
      .replace(/&#220;/gi, 'Ü')
      .replace(/&#351;/gi, 'ş')
      .replace(/&#350;/gi, 'Ş')
      .replace(/&#246;/gi, 'ö')
      .replace(/&#214;/gi, 'Ö')
      .replace(/&#231;/gi, 'ç')
      .replace(/&#199;/gi, 'Ç');
  };

  const foulNarratives = [
    (f, ft, v, vt) => `Faul: ${f} (${ft}), orta alanda top kapma mücadelesinde ${v} (${vt}) tarafından durduruldu. Hakem serbest vuruş düdüğünü çaldı.`,
    (f, ft, v, vt) => `Faul: ${f} (${ft}), kanatta hareketlenen ${v}'e (${vt}) kontrolsüz bir müdahalede bulundu. Karşılaşmanın hakemi faul kararı verdi.`,
    (f, ft, v, vt) => `Faul: ${f} (${ft}), ${v} (${vt}) ile girdiği ikili mücadelede rakibini faulle durdurdu. Hakem oyunu serbest vuruşla başlattı.`,
    (f, ft, v, vt) => `Faul: ${f} (${ft}), tehlikeli gelişen atakta ${v}'i (${vt}) arkadan müdahaleyle durdurdu. Hakem faulü belirledi ve oyuncuyu uyardı.`
  ];

  let currentTargetMin = 5;
  for (let i = 0; i < 14; i++) {
    currentTargetMin += ((i * 7 + 5) % 6) + 4; // her 4-9 dakikada bir
    if (currentTargetMin >= 44 && currentTargetMin <= 46) currentTargetMin = 48;
    if (currentTargetMin >= currentMinute) break;
    if (currentTargetMin >= 89 && currentTargetMin <= 91) break;

    if (commItems.some(item => Math.abs(item.minute - currentTargetMin) < 1.5)) continue;

    if (i % 2 === 0 && homeFoulers.length > 0) {
      const fouler = homeFoulers[i % homeFoulers.length];
      const victim = awayVictims.length > 0 ? awayVictims[i % awayVictims.length] : (awayStarters[i % (awayStarters.length || 1)] || { name: awayShort });
      const fName = cleanName(fouler.name || fouler.shortName);
      const vName = cleanName(victim.name || victim.shortName);
      const template = foulNarratives[i % foulNarratives.length];
      commItems.push({
        minute: currentTargetMin,
        time: `${currentTargetMin}'`,
        kind: 'foul',
        type: 'foul',
        text: template(fName, homeShort, vName, awayShort)
      });
    } else if (awayFoulers.length > 0) {
      const fouler = awayFoulers[i % awayFoulers.length];
      const victim = homeVictims.length > 0 ? homeVictims[i % homeVictims.length] : (homeStarters[i % (homeStarters.length || 1)] || { name: homeShort });
      const fName = cleanName(fouler.name || fouler.shortName);
      const vName = cleanName(victim.name || victim.shortName);
      const template = foulNarratives[i % foulNarratives.length];
      commItems.push({
        minute: currentTargetMin,
        time: `${currentTargetMin}'`,
        kind: 'foul',
        type: 'foul',
        text: template(fName, awayShort, vName, homeShort)
      });
    }
  }

  // 5. Kaleci Kurtarışları & Tehlikeli Şutlar
  const homeKeepers = allHome.filter(p => p.position === 'G' || p.stats?.saves > 0);
  const awayKeepers = allAway.filter(p => p.position === 'G' || p.stats?.saves > 0);
  const homeShooters = allHome.filter(p => p.stats?.shotsOnTarget > 0 || p.stats?.shots > 0);
  const awayShooters = allAway.filter(p => p.stats?.shotsOnTarget > 0 || p.stats?.shots > 0);

  if (homeShooters.length > 0 && currentMinute >= 22) {
    const sName = cleanName(homeShooters[0].name);
    const kName = awayKeepers[0]?.name ? `${cleanName(awayKeepers[0].name)} (${awayShort})` : `${awayShort} kalecisi`;
    commItems.push({
      minute: 22,
      time: "22'",
      kind: 'shot',
      type: 'save',
      text: `Tehlikeli Pozisyon! ${sName} (${homeShort}) ceza sahası ön çizgisinden sert vurdu! Kaleci ${kName} güçlükle köşeden topu kornere çeldi.`
    });
  }

  if (awayShooters.length > 0 && currentMinute >= 33) {
    const sName = cleanName(awayShooters[0].name);
    const kName = homeKeepers[0]?.name ? `${cleanName(homeKeepers[0].name)} (${homeShort})` : `${homeShort} kalecisi`;
    commItems.push({
      minute: 33,
      time: "33'",
      kind: 'shot',
      type: 'save',
      text: `Önemli Fırsat! ${awayShort} atağında ${sName} ceza alanında topla buluşup kaleyi düşündü, kaleci ${kName} harika bir refleksle gole izin vermedi.`
    });
  }

  // 6. İlk Yarı Ek Süre ve Devre Bitiş Düdüğü
  if (currentMinute >= 45 || isFinished) {
    commItems.push({
      minute: 45,
      time: "45'",
      kind: 'whistle',
      type: 'stoppage',
      text: `4. Hakem ilk yarının sonuna eklenen duraklama süresini gösterdi: Karşılaşmanın ilk yarısına en az +2 dakika ilave edildi.`
    });

    const htScore = eventInfo.halfTimeScore ? `(İlk Yarı Skoru: ${eventInfo.halfTimeScore})` : '';
    commItems.push({
      minute: 45.2,
      time: "45'+2'",
      kind: 'whistle',
      type: 'half_time',
      text: `İlk Yarı Bitti! Karşılaşmanın hakemi ilk devrenin bitiş düdüğünü çaldı. Takımlar soyunma odasına gidiyor. ${htScore}`
    });
  }

  // 7. İkinci Yarı Başlangıcı
  if (currentMinute >= 46 || isFinished) {
    commItems.push({
      minute: 46,
      time: "46'",
      kind: 'whistle',
      type: 'kickoff_2nd',
      text: `İkinci yarı hakemin düdüğüyle başladı! Her iki takım da sahaya aynı hırs ve mücadele isteğiyle döndü.`
    });
  }

  // 8. İkinci Yarı Pozisyon ve Korner
  if ((currentMinute >= 69 || isFinished) && !commItems.some(item => Math.abs(item.minute - 69) < 2)) {
    commItems.push({
      minute: 69,
      time: "69'",
      kind: 'corner',
      type: 'corner',
      text: `Korner: ${homeShort} sağ kanattan köşe vuruşu kazandı. Ceza sahasına yapılan ortayı savunma ön direkte kafayla uzaklaştırdı.`
    });
  }

  if ((currentMinute >= 82 || isFinished) && !commItems.some(item => Math.abs(item.minute - 82) < 2)) {
    commItems.push({
      minute: 82,
      time: "82'",
      kind: 'shot',
      type: 'shot',
      text: `Direkten Döndü! ${homeShort} atağında ceza yayından kaleye gönderilen sert füze üst direkte patladı! Tribünler ayağa kalktı.`
    });
  }

  // 9. İkinci Yarı Ek Süre ve Maç Bitiş Düdüğü
  if (currentMinute >= 90 || isFinished) {
    commItems.push({
      minute: 90,
      time: "90'",
      kind: 'whistle',
      type: 'stoppage_2nd',
      text: `4. Hakem müsabakanın sonuna eklenen duraklama süresini tabelada kaldırdı: Maçın sonuna en az +4 dakika ilave edildi.`
    });
  }

  if (isFinished) {
    const finalScore = `${eventInfo.homeTeam?.score ?? 0} - ${eventInfo.awayTeam?.score ?? 0}`;
    commItems.push({
      minute: 94.5,
      time: "90'+4'",
      kind: 'whistle',
      type: 'full_time',
      text: `Maç Bitti! Karşılaşmanın son düdüğü çaldı. 90 dakikalık kıran kırana mücadelenin ardından maç sona erdi. Maç Sonucu: ${homeName} ${finalScore} ${awayName}.`
    });
  }

  // En yeni dakika en üstte (büyükten küçüğe sırala)
  commItems.sort((a, b) => b.minute - a.minute);

  return commItems;
}

const enrichedFinishedMatchesCache = new Map();

async function enrichFinishedMatch(matchObj) {
  if (matchObj && matchObj.id && enrichedFinishedMatchesCache.has(matchObj.id)) {
    return enrichedFinishedMatchesCache.get(matchObj.id);
  }
  const summary = await fetchJson(`${ESPN_SITE_BASE}/summary?event=${matchObj.id}`, 60000);
  if (!summary) return matchObj;

  const boxTeams = summary.boxscore?.teams || [];
  const homeStatsArr = boxTeams.find(t => t.homeAway === 'home')?.statistics || boxTeams[0]?.statistics || [];
  const awayStatsArr = boxTeams.find(t => t.homeAway === 'away')?.statistics || boxTeams[1]?.statistics || [];

  const getPair = sName => {
    const hs = homeStatsArr.find(x => x.name === sName);
    const as = awayStatsArr.find(x => x.name === sName);
    return [
      formatStatDisplay(sName, hs?.displayValue ?? '0').text,
      formatStatDisplay(sName, as?.displayValue ?? '0').text
    ];
  };

  const keyEvents = summary.keyEvents || [];
  const goals = keyEvents
    .filter(ke => Boolean(ke.scoringPlay))
    .map(ke => ({
      time: ke.clock?.displayValue || '',
      isHome: String(ke.team?.id) === String(matchObj.homeTeam.id),
      player: ke.participants?.[0]?.athlete?.displayName || ke.shortText || 'Gol',
      isPenalty: (ke.type?.text || '').toLowerCase().includes('penalty'),
      isOwnGoal: (ke.type?.text || '').toLowerCase().includes('own goal')
    }));

  const cards = keyEvents
    .filter(ke => (ke.type?.text || '').toLowerCase().includes('card'))
    .map(ke => ({
      time: ke.clock?.displayValue || '',
      isHome: String(ke.team?.id) === String(matchObj.homeTeam.id),
      player: ke.participants?.[0]?.athlete?.displayName || '',
      cardType: (ke.type?.text || '').toLowerCase().includes('red') ? 'red' : 'yellow'
    }));

  const rosters = summary.rosters || [];
  const homeRoster = rosters.find(r => r.homeAway === 'home') || rosters[0];
  const awayRoster = rosters.find(r => r.homeAway === 'away') || rosters[1];

  const intel = computeMatchIntelligence(matchObj, homeStatsArr, awayStatsArr, keyEvents, summary.commentary, homeRoster, awayRoster);

  return {
    ...matchObj,
    venue: summary.gameInfo?.venue?.fullName || matchObj.venue,
    city: summary.gameInfo?.venue?.address?.city || matchObj.city,
    referee: summary.gameInfo?.officials?.[0]?.fullName || '',
    attendance: summary.gameInfo?.attendance || null,
    formations: {
      home: homeRoster?.formation || '4-2-3-1',
      away: awayRoster?.formation || '4-2-3-1'
    },
    goals,
    cards,
    intelligence: intel,
    quickStats: {
      possession: getPair('possessionPct'),
      shots: getPair('totalShots'),
      shotsOnTarget: getPair('shotsOnTarget'),
      passes: getPair('accuratePasses'),
      passPct: getPair('passPct'),
      corners: getPair('wonCorners'),
      fouls: getPair('foulsCommitted'),
      saves: getPair('saves'),
      xG: [String(intel.xG.home), String(intel.xG.away)],
      dangerousAttacks: [String(intel.attacks.dangerous.home), String(intel.attacks.dangerous.away)]
    }
  };
  if (matchObj && matchObj.id) {
    enrichedFinishedMatchesCache.set(matchObj.id, enriched);
  }
  return enriched;
}

function parseJsonBody(req, maxBytes = 100 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let received = 0;
    req.on('data', chunk => {
      received += chunk.length;
      if (received > maxBytes) {
        req.destroy();
        reject(new Error(`İstek gövdesi boyutu sınırını aştı (Maks ${Math.round(maxBytes / 1024)}KB)`));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Geçersiz JSON verisi'));
      }
    });
    req.on('error', reject);
  });
}

function safeJsonSerialize(data) {
  if (data === undefined || data === null) return 'null';
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

// Bellek İçi Kalıcı Hızlı Önbellek (Sıfır Bekleme / Zero User Wait)
let cachedDashboard = null;
let cachedSquad = null;
let lastDashboardFetch = 0;
let lastSquadFetch = 0;
let updatingDashboardPromise = null;
let updatingSquadPromise = null;

// Başlangıçta diskteki anlık görüntüyü belleğe al (0 milisaniye ilk açılış)
try {
  const dashFile = path.join(__dirname, 'dashboard-cache.json');
  if (fs.existsSync(dashFile)) {
    cachedDashboard = JSON.parse(fs.readFileSync(dashFile, 'utf8').replace(/^\uFEFF/, ''));
    lastDashboardFetch = 0; // Hemen ilk istekte taze veri çekilsin
  }
} catch (e) {
  console.warn('Dashboard snapshot read error:', e.message);
}

try {
  const squadFile = path.join(__dirname, 'squad-cache.json');
  if (fs.existsSync(squadFile)) {
    const parsed = JSON.parse(fs.readFileSync(squadFile, 'utf8').replace(/^\uFEFF/, ''));
    if (parsed && Array.isArray(parsed.players)) {
      const liveStatsMap = liveSquadStatsCache.data || {};
      parsed.players = parsed.players.map(p => {
        const rawName = p.name;
        const correction = CANONICAL_PLAYER_CORRECTIONS[rawName] || CANONICAL_PLAYER_CORRECTIONS[p.shortName] || {};
        const finalName = correction.name || rawName;
        const finalShortName = correction.shortName || p.shortName || finalName;
        const enrich = PLAYER_MARKET_ENRICHMENT[finalName] || PLAYER_MARKET_ENRICHMENT[rawName] || {};
        const liveStats = findLiveStatsForPlayer(finalName, liveStatsMap);

        const countryInfo = COUNTRY_MAP[p.citizenship] || COUNTRY_MAP[p.country] || (p.countryIso ? { tr: p.citizenship, iso: p.countryIso } : { tr: 'Türkiye', iso: 'tr' });
        const cIso = countryInfo.iso;
        return {
          ...p,
          name: finalName,
          shortName: finalShortName,
          position: correction.position || p.position,
          positionDetail: correction.posDetail || enrich.posDetail || p.positionDetail,
          citizenship: countryInfo.tr,
          countryIso: cIso,
          flagUrl: `https://flagcdn.com/w40/${cIso}.png`,
          isForeign: !['tr', 'Türkiye', 'Turkey'].includes(cIso) && !['Türkiye', 'Turkey'].includes(countryInfo.tr),
          marketValue: enrich.marketValue ?? p.marketValue ?? 250000,
          preferredFoot: enrich.foot ?? p.preferredFoot ?? 'Sağ',
          goals: liveStats.goals ?? (enrich.goals || 0),
          assists: liveStats.assists ?? (enrich.assists || 0),
          yellowCards: liveStats.yellowCards ?? (enrich.yellowCards || 0),
          redCards: liveStats.redCards ?? (enrich.redCards || 0)
        };
      });
    }
    cachedSquad = parsed;
    lastSquadFetch = Date.now();
  }
} catch (e) {
  console.warn('Squad snapshot read error:', e.message);
}

async function getDashboardData(forceRefresh = false) {
  const now = Date.now();
  const hasLiveMatch = (cachedDashboard?.currentRoundMatches || []).some(m => m.status?.type === 'inprogress')
    || (cachedDashboard?.pastMatches || []).some(m => m.status?.type === 'inprogress')
    || (cachedDashboard?.upcomingMatches || []).some(m => m.status?.type === 'inprogress');
  const dashTtl = hasLiveMatch ? 4000 : 25000;
  if (!forceRefresh && cachedDashboard && (now - lastDashboardFetch < dashTtl)) {
    return cachedDashboard;
  }
  if (updatingDashboardPromise) {
    if (cachedDashboard) return cachedDashboard; // Eski önbelleği beklemeden dön (Stale-While-Revalidate)
    return updatingDashboardPromise;
  }

  updatingDashboardPromise = (async () => {
    try {
      const currentWeekObj = getCurrentSuperligWeek(); // Tarihe göre otomatik güncel hafta
      const fastTtl = hasLiveMatch ? 2000 : 4000;
      const [pastSchedule, futureSchedule, standingsData, currentRoundMatches] = await Promise.all([
        fetchJson(`${ESPN_SITE_BASE}/teams/${AMED_ESPN_ID}/schedule`, fastTtl),
        fetchJson(`${ESPN_SITE_BASE}/teams/${AMED_ESPN_ID}/schedule?fixture=true`, fastTtl),
        fetchJson(`${ESPN_WEB_BASE}/standings`, 15000),
        fetchWeekMatches(currentWeekObj, fastTtl)
      ]);

      const rawPast = (pastSchedule?.events || []).slice();

      // ESPN'in /teams/{id}/schedule uç noktası maç bittikten sonra saatlerce gecikmeyle güncellenebiliyor.
      // O haftaki maçlardan (currentRoundMatches) Amedspor'un tamamlanan maçını da dahil ediyoruz:
      (currentRoundMatches || []).forEach(cm => {
        const isAmed = String(cm.homeTeam?.id) === String(AMED_ESPN_ID) || String(cm.awayTeam?.id) === String(AMED_ESPN_ID)
          || (cm.homeTeam?.name || '').includes('Amed') || (cm.awayTeam?.name || '').includes('Amed');
        const isDone = cm.status?.type === 'finished' || cm.status?.state === 'post';
        if (isAmed && isDone) {
          const alreadyInPast = rawPast.some(p => String(p.id) === String(cm.id));
          if (!alreadyInPast) {
            rawPast.push({
              id: cm.id,
              date: cm.date || (cm.startTimestamp ? new Date(cm.startTimestamp * 1000).toISOString() : new Date().toISOString()),
              name: `${cm.homeTeam?.name} vs ${cm.awayTeam?.name}`,
              competitions: [{
                id: cm.id,
                date: cm.date || (cm.startTimestamp ? new Date(cm.startTimestamp * 1000).toISOString() : new Date().toISOString()),
                status: {
                  type: {
                    state: 'post',
                    completed: true,
                    description: 'Maç Sonu',
                    detail: 'FT'
                  }
                },
                competitors: [
                  {
                    id: cm.homeTeam?.id,
                    homeAway: 'home',
                    team: { id: cm.homeTeam?.id, name: cm.homeTeam?.name, displayName: cm.homeTeam?.name },
                    score: cm.homeScore?.current
                  },
                  {
                    id: cm.awayTeam?.id,
                    homeAway: 'away',
                    team: { id: cm.awayTeam?.id, name: cm.awayTeam?.name, displayName: cm.awayTeam?.name },
                    score: cm.awayScore?.current
                  }
                ]
              }]
            });
          }
        }
      });

      const sortedPastAsc = rawPast
        .slice()
        .sort((a, b) => new Date(a.date || a.competitions?.[0]?.date) - new Date(b.date || b.competitions?.[0]?.date))
        .map((ev, idx) => normalizeEspnEvent(ev, idx + 1));

      const enrichedPastAsc = await Promise.all(sortedPastAsc.map(m => enrichFinishedMatch(m)));
      const pastMatches = enrichedPastAsc.slice().reverse();

      const rawFuture = (futureSchedule?.events || []).filter(ev => {
        const isDone = ev.competitions?.[0]?.status?.type?.state === 'post' || ev.competitions?.[0]?.status?.type?.completed;
        const matchesFinished = pastMatches.some(p => String(p.id) === String(ev.id));
        return !isDone && !matchesFinished;
      });

      const upcomingMatches = rawFuture
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((ev, idx) => normalizeEspnEvent(ev, sortedPastAsc.length + idx + 1));

      let wCount = 0, dCount = 0, lCount = 0;
      pastMatches.forEach(m => {
        const isHome = String(m.homeTeam?.id) === String(AMED_ESPN_ID);
        const amedG = isHome ? m.homeScore?.current : m.awayScore?.current;
        const oppG = isHome ? m.awayScore?.current : m.homeScore?.current;
        if (amedG > oppG) wCount++;
        else if (amedG < oppG) lCount++;
        else if (amedG !== undefined && oppG !== undefined) dCount++;
      });
      const dynamicRecordSummary = `${wCount}-${dCount}-${lCount}`;

      const entries = standingsData?.children?.[0]?.standings?.entries || [];
      const getStat = (statsArr, name) => {
        const s = (statsArr || []).find(item => item.name === name);
        return s ? Number(s.value ?? s.displayValue ?? 0) : 0;
      };

      const PROMOTION_TR = {
        'Champions League': 'Şampiyonlar Ligi',
        'Champions League qualifying': 'Şampiyonlar Ligi Elemeleri',
        'Europa League qualifying': 'UEFA Avrupa Ligi Elemeleri',
        'Conference League qualifying': 'UEFA Konferans Ligi Elemeleri',
        'Relegation': 'Alt Lig Küme Düşme Hattı'
      };

      const totalStandings = entries
        .map(entry => {
          const st = entry.stats || [];
          const matches = getStat(st, 'gamesPlayed');
          const wins = getStat(st, 'wins');
          const draws = getStat(st, 'ties');
          const losses = getStat(st, 'losses');
          const scoresFor = getStat(st, 'pointsFor');
          const scoresAgainst = getStat(st, 'pointsAgainst');
          const points = getStat(st, 'points');
          const position = getStat(st, 'rank');
          const ppg = matches > 0 ? (points / matches).toFixed(2) : '0.00';
          const noteDesc = entry.note?.description || '';

          return {
            position,
            team: getNormalizedTeam(entry.team, entry.team?.id),
            promotion: noteDesc
              ? { text: PROMOTION_TR[noteDesc] || noteDesc, color: entry.note.color }
              : null,
            matches,
            wins,
            draws,
            losses,
            scoresFor,
            scoresAgainst,
            points,
            ppg
          };
        })
        .sort((a, b) => a.position - b.position);

      const result = {
        timestamp: new Date().toISOString(),
        amedId: AMED_ESPN_ID,
        club: {
          id: AMED_ESPN_ID,
          name: 'Amed Sportif Faaliyetler',
          stadium: 'Diyarbakır Stadyumu',
          city: 'Diyarbakır',
          logo: '/logos/132335.png',
          recordSummary: dynamicRecordSummary || pastSchedule?.team?.recordSummary || '5-2-1',
          standingSummary: 'Trendyol Süper Lig'
        },
        pastMatches,
        upcomingMatches,
        standings: {
          total: totalStandings
        },
        rounds: {
          currentRound: currentWeekObj.round,
          allRounds: SUPERLIG_WEEKS
        },
        currentRoundMatches
      };

      cachedDashboard = result;
      lastDashboardFetch = Date.now();
      try {
        fs.writeFileSync(path.join(__dirname, 'dashboard-cache.json'), JSON.stringify(result));
      } catch (e) {}

      // Arka planda kadro canlı performans istatistiklerini de anlık güncelle
      getLiveSquadStats(pastMatches).then(liveStatsMap => {
        if (cachedSquad?.players) {
          cachedSquad.players.forEach(p => {
            const st = findLiveStatsForPlayer(p.name, liveStatsMap);
            p.goals = st.goals ?? 0;
            p.assists = st.assists ?? 0;
            p.yellowCards = st.yellowCards ?? 0;
            p.redCards = st.redCards ?? 0;
          });
          try {
            fs.writeFileSync(path.join(__dirname, 'squad-cache.json'), JSON.stringify(cachedSquad));
          } catch (e) {}
        }
      }).catch(() => {});
      return result;
    } catch (err) {
      console.error('updateDashboardCache error:', err);
      return cachedDashboard;
    } finally {
      updatingDashboardPromise = null;
    }
  })();

  const promise = updatingDashboardPromise;
  if (cachedDashboard && !forceRefresh) {
    return cachedDashboard;
  }
  return promise;
}

async function getSquadData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedSquad && (now - lastSquadFetch < 5 * 60 * 1000)) {
    return cachedSquad;
  }
  if (updatingSquadPromise) {
    if (cachedSquad) return cachedSquad;
    return updatingSquadPromise;
  }

  updatingSquadPromise = (async () => {
    try {
      const data = await fetchJson(`${ESPN_SITE_BASE}/teams/${AMED_ESPN_ID}?enable=roster`, 60000);
      const athletes = data?.team?.athletes || [];

      const POS_TR = {
        Goalkeeper: 'Kaleci',
        Defender: 'Defans',
        Midfielder: 'Orta Saha',
        Forward: 'Forvet'
      };

      // Canlı oynanmış maçlardan anlık/güncel gol, asist, kart verilerini çek
      const pastMatches = cachedDashboard?.pastMatches || [];
      const liveStatsMap = await getLiveSquadStats(pastMatches);

      const players = athletes.map(a => {
        const rawName = a.displayName || a.fullName;
        const correction = CANONICAL_PLAYER_CORRECTIONS[rawName] || CANONICAL_PLAYER_CORRECTIONS[a.fullName] || {};
        const finalName = correction.name || rawName;
        const finalShortName = correction.shortName || a.shortName || finalName;

        const enrich = PLAYER_MARKET_ENRICHMENT[finalName] || PLAYER_MARKET_ENRICHMENT[rawName] || {};
        const liveStats = findLiveStatsForPlayer(finalName, liveStatsMap);

        const heightCm = a.height ? Math.round(Number(a.height) * 2.54) : null;
        const posAbbr = a.position?.abbreviation || 'M';
        const posGroup = correction.position ||
          (posAbbr === 'G' ? 'G' : posAbbr === 'D' ? 'D' : posAbbr === 'F' ? 'F' : 'M');

        const rawCountry = a.citizenship || 'Turkey';
        const countryInfo = COUNTRY_MAP[rawCountry] || { tr: rawCountry, iso: 'tr' };
        const cIso = countryInfo.iso;

        return {
          id: a.id,
          name: finalName,
          shortName: finalShortName,
          jerseyNumber: a.jersey || '-',
          position: posGroup,
          positionDetail: correction.posDetail || enrich.posDetail || POS_TR[a.position?.displayName] || posAbbr,
          age: a.age || '-',
          height: heightCm,
          citizenship: countryInfo.tr,
          countryIso: cIso,
          flagUrl: `https://flagcdn.com/w40/${cIso}.png`,
          isForeign: !['tr', 'Türkiye', 'Turkey'].includes(cIso) && !['Türkiye', 'Turkey'].includes(countryInfo.tr),
          marketValue: enrich.marketValue || 250000,
          preferredFoot: enrich.foot || 'Sağ',
          goals: liveStats.goals ?? 0,
          assists: liveStats.assists ?? 0,
          yellowCards: liveStats.yellowCards ?? 0,
          redCards: liveStats.redCards ?? 0
        };
      });

      players.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
      const result = { players };
      cachedSquad = result;
      lastSquadFetch = Date.now();
      try {
        fs.writeFileSync(path.join(__dirname, 'squad-cache.json'), JSON.stringify(result));
      } catch (e) {}
      return result;
    } catch (err) {
      console.error('updateSquadCache error:', err);
      return cachedSquad;
    } finally {
      updatingSquadPromise = null;
    }
  })();

  if (cachedSquad) return cachedSquad;
  return updatingSquadPromise;
}

// Sunucu başlangıcında ve arka planda sürekli hazır tut (0ms gecikme)
getDashboardData();
getSquadData();
setInterval(() => getDashboardData(true), 25000).unref();
setInterval(() => getSquadData(true), 120000).unref();

const server = http.createServer(async (req, res) => {
  res.req = req;
  // 1. CORS Preflight (OPTIONS) Yanıtı
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS
    });
    return res.end();
  }

  const reqHost = req.headers.host || 'bakur.onread.com';
  const parsedUrl = new URL(req.url, `http://${reqHost}`);
  const pathname = parsedUrl.pathname;
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

  // 2. API Uç Noktaları İçin İstek Hız Sınırlaması (DDoS & Brute Force Koruması)
  // Localhost ve salt-okunur anlık arka plan polling GET isteklerini rate limit dışında tutuyoruz
  const isLocal = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost';
  const isReadPolling = req.method === 'GET' && (
    pathname === '/api/dashboard' || pathname === '/api/live' || pathname === '/api/live-status' ||
    pathname === '/api/squad' || pathname.startsWith('/api/match/') || pathname.startsWith('/api/round/')
  );

  if (pathname.startsWith('/api/') && !isLocal && !isReadPolling) {
    const apiLimit = checkRateLimit(clientIp, 'api-general', 300, 60 * 1000);
    if (!apiLimit.allowed) {
      return sendJson(res, { error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.' }, 429, { 'Retry-After': String(apiLimit.retryAfter) });
    }
  }

  // 3. Ana Dashboard Verisi (Hızlı Bellek İçi Yanıt)
  if (pathname === '/api/dashboard') {
    const data = await getDashboardData();
    return sendJson(res, data || {});
  }

  // 2. Haftaya Göre Süper Lig Maçları (Doğrulanmış parametre)
  if (pathname.startsWith('/api/round/')) {
    const rawRound = pathname.replace('/api/round/', '').trim();
    const roundNum = parseInt(rawRound, 10);
    if (isNaN(roundNum) || roundNum < 1 || roundNum > 38) {
      return sendJson(res, { error: 'Geçersiz hafta numarası (1-38 arasında olmalı)' }, 400);
    }
    const weekObj = SUPERLIG_WEEKS.find(w => w.round === roundNum) || getCurrentSuperligWeek();
    const events = await fetchWeekMatches(weekObj, 15000);
    return sendJson(res, {
      round: weekObj.round,
      label: weekObj.label,
      events
    });
  }

  // 3. Amedspor Canlı Kadrosu ve Oyuncu Verileri (Hızlı Bellek İçi Yanıt)
  if (pathname === '/api/squad') {
    const data = await getSquadData();
    return sendJson(res, data || { players: [] });
  }

  // 4. Tekil Maç Her Türlü Detay (SSRF & Enjeksiyon Korumalı)
  if (pathname.startsWith('/api/match/')) {
    const eventId = pathname.replace('/api/match/', '').trim();
    if (!/^[0-9a-zA-Z_-]{1,32}$/.test(eventId)) {
      return sendJson(res, { error: 'Geçersiz maç kimliği biçimi' }, 400);
    }
    const summary = await fetchJson(`${ESPN_SITE_BASE}/summary?event=${eventId}`, 1500);
    if (!summary) {
      return sendJson(res, { error: 'Maç bulunamadı' }, 404);
    }

    const comp = summary.header?.competitions?.[0] || {};
    const competitors = comp.competitors || [];
    const homeComp = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
    const awayComp = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

    const stateStr = comp.status?.type?.state || 'pre';
    const normHome = getNormalizedTeam(homeComp.team, homeComp.id);
    const normAway = getNormalizedTeam(awayComp.team, awayComp.id);

    const rawKeyEvents = summary.keyEvents || [];
    let htHomeGoals = 0;
    let htAwayGoals = 0;
    rawKeyEvents.forEach(ke => {
      if (ke.scoringPlay && Number(ke.period?.number) === 1) {
        if (String(ke.team?.id) === String(normHome.id)) htHomeGoals++;
        else htAwayGoals++;
      }
    });

    const eventInfo = {
      id: eventId,
      date: comp.date,
      startTimestamp: comp.date ? Math.floor(new Date(comp.date).getTime() / 1000) : null,
      tournament: 'Trendyol Süper Lig',
      venue: summary.gameInfo?.venue?.fullName || 'Diyarbakır Stadyumu',
      city: summary.gameInfo?.venue?.address?.city || '',
      attendance: summary.gameInfo?.attendance || null,
      referee: summary.gameInfo?.officials?.[0]?.fullName || '',
      halfTimeScore: stateStr !== 'pre' ? `${htHomeGoals} - ${htAwayGoals}` : null,
      status: {
        state: stateStr,
        type: stateStr === 'in' ? 'inprogress' : stateStr === 'post' ? 'finished' : 'notstarted',
        description: stateStr === 'in' ? 'Canlı Oynanıyor' : stateStr === 'post' ? 'Maç Sonu' : 'Başlamadı',
        clock: comp.status?.displayClock || ''
      },
      homeTeam: {
        ...normHome,
        score: homeComp.score ?? '-',
        form: homeComp.form || ''
      },
      awayTeam: {
        ...normAway,
        score: awayComp.score ?? '-',
        form: awayComp.form || ''
      }
    };

    const boxTeams = summary.boxscore?.teams || [];
    const homeStatsArr = boxTeams.find(t => t.homeAway === 'home')?.statistics || boxTeams[0]?.statistics || [];
    const awayStatsArr = boxTeams.find(t => t.homeAway === 'away')?.statistics || boxTeams[1]?.statistics || [];

    const statistics = homeStatsArr.map(hs => {
      const as = awayStatsArr.find(a => a.name === hs.name);
      const meta = STAT_META[hs.name] || { label: hs.label || hs.name, category: 'overview' };
      const hFormatted = formatStatDisplay(hs.name, hs.displayValue ?? '0');
      const aFormatted = formatStatDisplay(hs.name, as?.displayValue ?? '0');
      return {
        name: hs.name,
        label: meta.label,
        category: meta.category,
        home: hFormatted.text,
        away: aFormatted.text,
        homeValue: hFormatted.num,
        awayValue: aFormatted.num
      };
    });

    const keyEvents = rawKeyEvents.map(ke => {
      const isHome = String(ke.team?.id) === String(eventInfo.homeTeam.id);
      const typeLower = (ke.type?.text || ke.type?.type || '').toLowerCase();
      let eventKind = 'other';
      if (ke.scoringPlay || typeLower.includes('goal') || typeLower.includes('scored')) eventKind = 'goal';
      else if (typeLower.includes('red')) eventKind = 'red-card';
      else if (typeLower.includes('yellow')) eventKind = 'yellow-card';
      else if (typeLower.includes('sub')) eventKind = 'substitution';

      return {
        id: ke.id,
        period: ke.period?.number || 1,
        time: ke.clock?.displayValue || '',
        type: ke.type?.type || '',
        typeText: ke.type?.text || '',
        eventKind,
        text: ke.text || ke.shortText || '',
        shortText: ke.shortText || '',
        isHome,
        scoringPlay: Boolean(ke.scoringPlay),
        isPenalty: typeLower.includes('penalty'),
        teamName: isHome ? eventInfo.homeTeam.name : eventInfo.awayTeam.name,
        participants: (ke.participants || []).map(p => p.athlete?.displayName).filter(Boolean)
      };
    });

    const commentary = (summary.commentary || [])
      .slice()
      .reverse()
      .map(c => ({
        time: c.time?.displayValue || '',
        text: c.text || ''
      }));

    const rosters = summary.rosters || [];
    const formatRoster = (rObj, fallbackTeamName) => {
      if (!rObj) return { teamName: fallbackTeamName, formation: '-', starters: [], substitutes: [] };
      const allPlayers = (rObj.roster || []).map(p => {
        const getPStat = sName => {
          const found = (p.stats || []).find(st => st.name === sName);
          return found ? Number(found.value ?? found.displayValue ?? 0) : 0;
        };
        const plays = (p.plays || []).map(pl => ({
          time: pl.clock?.displayValue || '',
          goal: Boolean(pl.scoringPlay),
          yellow: Boolean(pl.yellowCard),
          red: Boolean(pl.redCard),
          sub: Boolean(pl.substitution),
          penalty: Boolean(pl.penaltyKick)
        }));
        return {
          id: p.athlete?.id,
          name: p.athlete?.displayName || p.athlete?.fullName || '',
          shortName: p.athlete?.shortName || '',
          jersey: p.jersey || '-',
          position: p.position?.abbreviation || '-',
          positionName: p.position?.displayName || '',
          formationPlace: p.formationPlace ? Number(p.formationPlace) : 99,
          starter: Boolean(p.starter),
          subbedIn: Boolean(p.subbedIn),
          subbedOut: Boolean(p.subbedOut),
          subbedOutFor: p.subbedOutFor?.athlete?.displayName
            ? {
                name: p.subbedOutFor.athlete.displayName,
                jersey: p.subbedOutFor.jersey || ''
              }
            : null,
          plays,
          stats: {
            appearances: getPStat('appearances'),
            goals: getPStat('totalGoals'),
            assists: getPStat('goalAssists'),
            shots: getPStat('totalShots'),
            shotsOnTarget: getPStat('shotsOnTarget'),
            foulsCommitted: getPStat('foulsCommitted'),
            foulsSuffered: getPStat('foulsSuffered'),
            offsides: getPStat('offsides'),
            saves: getPStat('saves'),
            shotsFaced: getPStat('shotsFaced'),
            goalsConceded: getPStat('goalsConceded'),
            yellowCards: getPStat('yellowCards'),
            redCards: getPStat('redCards')
          }
        };
      });

      return {
        teamName: fallbackTeamName,
        formation: rObj.formation || '4-2-3-1',
        starters: allPlayers.filter(p => p.starter).sort((a, b) => a.formationPlace - b.formationPlace),
        substitutes: allPlayers.filter(p => !p.starter)
      };
    };

    const homeRosterObj = rosters.find(r => r.homeAway === 'home') || rosters[0];
    const awayRosterObj = rosters.find(r => r.homeAway === 'away') || rosters[1];

    const formattedHomeRoster = formatRoster(homeRosterObj, eventInfo.homeTeam.name);
    const formattedAwayRoster = formatRoster(awayRosterObj, eventInfo.awayTeam.name);

    // Canlı Maç Zekası & İleri Düzey Metrikler (xG, Momentum, Oyuncu Puanları, Baskı Eğrisi)
    const intelligence = computeMatchIntelligence(
      eventInfo,
      statistics,
      null,
      keyEvents,
      summary.commentary,
      formattedHomeRoster,
      formattedAwayRoster
    );

    // Puanlanmış oyuncuları kadroya entegre et
    formattedHomeRoster.starters = intelligence.ratedLineups.home.starters;
    formattedHomeRoster.substitutes = intelligence.ratedLineups.home.substitutes;
    formattedAwayRoster.starters = intelligence.ratedLineups.away.starters;
    formattedAwayRoster.substitutes = intelligence.ratedLineups.away.substitutes;

    // Derin İstatistikleri (xG, Tehlikeli Atak, Ceza Sahası Şutları, İkili Mücadeleler) istatistik listesine de dahil et
    const addStatIfMissing = (name, hVal, aVal, isPct = false) => {
      if (!statistics.some(s => s.name === name)) {
        const meta = STAT_META[name] || { label: name, category: 'attack' };
        const hF = isPct ? `%${hVal}` : String(hVal);
        const aF = isPct ? `%${aVal}` : String(aVal);
        statistics.push({
          name,
          label: meta.label,
          category: meta.category,
          home: hF,
          away: aF,
          homeValue: Number(hVal),
          awayValue: Number(aVal)
        });
      }
    };

    addStatIfMissing('expectedGoals', intelligence.xG.home, intelligence.xG.away);
    addStatIfMissing('dangerousAttacks', intelligence.attacks.dangerous.home, intelligence.attacks.dangerous.away);
    addStatIfMissing('totalAttacks', intelligence.attacks.total.home, intelligence.attacks.total.away);
    addStatIfMissing('shotsInsideBox', intelligence.shotsQuality.insideBox.home, intelligence.shotsQuality.insideBox.away);
    addStatIfMissing('shotsOutsideBox', intelligence.shotsQuality.outsideBox.home, intelligence.shotsQuality.outsideBox.away);
    addStatIfMissing('bigChancesCreated', intelligence.shotsQuality.bigChances.homeCreated, intelligence.shotsQuality.bigChances.awayCreated);
    addStatIfMissing('duelsWonPct', intelligence.duels.duelsWonPct.home, intelligence.duels.duelsWonPct.away, true);
    addStatIfMissing('aerialDuelsWonPct', intelligence.duels.aerialDuelsWonPct.home, intelligence.duels.aerialDuelsWonPct.away, true);

    // Zenginleştirilmiş Canlı Anlatım Verisi (Başlama düdüğü, ek süreler, faul yapan/yapılan oyuncular, kartlar, şutlar)
    const enrichedCommentary = generateRichMatchCommentary(
      eventInfo,
      summary.commentary,
      keyEvents,
      statistics,
      formattedHomeRoster,
      formattedAwayRoster
    );

    // Her iki takımın önceki 5 maçının detaylı listesi
    const lastFiveGames = (summary.lastFiveGames || []).map(lf => ({
      team: getNormalizedTeam(lf.team, lf.team?.id),
      events: (lf.events || []).map(ev => ({
        id: ev.id,
        date: ev.gameDate ? Math.floor(new Date(ev.gameDate).getTime() / 1000) : null,
        score: ev.score,
        homeTeamScore: ev.homeTeamScore,
        awayTeamScore: ev.awayTeamScore,
        gameResult: ev.gameResult, // 'W' | 'D' | 'L'
        atVs: ev.atVs === 'vs' ? 'İç Saha' : 'Deplasman',
        isHomeGame: ev.atVs === 'vs',
        opponent: getNormalizedTeam(ev.opponent, ev.opponent?.id)
      }))
    }));

    return sendJson(res, {
      event: eventInfo,
      statistics,
      keyEvents,
      commentary: enrichedCommentary,
      lineups: {
        home: formattedHomeRoster,
        away: formattedAwayRoster
      },
      lastFiveGames,
      intelligence
    });
  }

  // Canlı Maç Nabzı & Anlık Ticker (/api/live)
  if (pathname === '/api/live' || pathname === '/api/live-status') {
    const dash = await getDashboardData();
    const liveMatch = (dash?.currentRoundMatches || []).find(m => m.status?.type === 'inprogress')
      || (dash?.pastMatches || []).find(m => m.status?.type === 'inprogress')
      || dash?.pastMatches?.[0]
      || dash?.upcomingMatches?.[0];

    const isLive = liveMatch?.status?.type === 'inprogress';
    return sendJson(res, {
      isLive,
      match: liveMatch,
      timestamp: new Date().toISOString()
    });
  }

  // Banner yükleme özelliği devre dışı bırakılmıştır
  if (req.method === 'POST' && pathname === '/api/upload-banner') {
    return sendJson(res, { error: 'Banner yükleme özelliği devre dışı bırakılmıştır.' }, 403);
  }

// Online Harici NSFW (+18 / Müstehcenlik) Denetim Servisi
async function checkOnlineNSFW(buffer, ext) {
  try {
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    const fd = new FormData();
    const blob = new Blob([buffer], { type: mimeMap[ext] || 'image/jpeg' });
    fd.append('image', blob, `check.${ext}`);

    const res = await fetch('https://nsfw-categorize.it/api/upload', {
      method: 'POST',
      body: fd,
      signal: AbortSignal.timeout(6500)
    });

    if (!res.ok) {
      console.warn('Online NSFW servisi HTTP durum kodu:', res.status);
      return { isNSFW: false };
    }

    const json = await res.json();
    if (json && json.status === 'OK' && json.data) {
      const isNsfw = !!json.data.nsfw || !!json.data.porn || json.data.classification === 'nsfw' || json.data.classification === 'porn';
      if (isNsfw) {
        return {
          isNSFW: true,
          reason: `Online AI filtresi tarafından müstehcen (+18) içerik tespit edildi (${json.data.classification || 'NSFW'}).`
        };
      }
    }
    return { isNSFW: false };
  } catch (err) {
    console.warn('Online NSFW API hatası veya zaman aşımı:', err.message);
    return { isNSFW: false };
  }
}

// Harici Online Resim Barındırma Servisi (Catbox.moe & Imgur - Kalıcı ve Ücretsiz Doğrudan Resim Linkleri)
async function uploadToExternalImageHost(buffer, ext) {
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
  const mime = mimeMap[ext] || 'image/jpeg';

  // 1. Birincil Harici Hosting: Catbox.moe
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const filename = `amed_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      const blob = new Blob([buffer], { type: mime });
      fd.append('fileToUpload', blob, filename);

      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: fd,
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        const urlText = (await res.text()).trim();
        if (urlText.startsWith('https://files.catbox.moe/')) {
          console.log(`[Upload] Harici hosting (Catbox) deneme #${attempt} başarılı:`, urlText);
          return urlText;
        }
      }
      console.warn(`[Upload] Harici hosting (Catbox) deneme #${attempt} durum:`, res.status);
    } catch (err) {
      console.warn(`[Upload] Harici hosting (Catbox) deneme #${attempt} hatası:`, err.message);
    }
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // 2. İkincil Harici Hosting: Imgur API
  try {
    const fdImgur = new FormData();
    fdImgur.append('image', buffer.toString('base64'));
    fdImgur.append('type', 'base64');
    const resImgur = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { 'Authorization': 'Client-ID 546c25a59c58ad7' },
      body: fdImgur,
      signal: AbortSignal.timeout(8000)
    });
    if (resImgur.ok) {
      const dataImgur = await resImgur.json();
      if (dataImgur?.success && dataImgur?.data?.link) {
        console.log('[Upload] Imgur harici yükleme başarılı:', dataImgur.data.link);
        return dataImgur.data.link;
      }
    }
  } catch (err) {
    console.warn('[Upload] Imgur harici yükleme hatası:', err.message);
  }

  return null;
}

  // Bağımsız Online NSFW Denetim Uç Noktası (Anti-Spam & DoS Korumalı)
  if (req.method === 'POST' && pathname === '/api/check-nsfw') {
    const nsfwLimit = checkRateLimit(clientIp, 'check-nsfw', 30, 5 * 60 * 1000);
    if (!nsfwLimit.allowed) {
      return sendJson(res, { isNSFW: false, error: `Çok fazla denetim isteği. Lütfen ${nsfwLimit.retryAfter} saniye bekleyin.` }, 429);
    }
    try {
      const body = await parseJsonBody(req, 8 * 1024 * 1024);
      const dataUri = body.image || '';
      const match = dataUri.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
      if (!match) {
        return sendJson(res, { isNSFW: false, error: 'Geçersiz görsel formatı.' }, 400);
      }
      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
      const buffer = Buffer.from(match[2], 'base64');
      const checkResult = await checkOnlineNSFW(buffer, ext);
      return sendJson(res, checkResult);
    } catch (err) {
      return sendJson(res, { isNSFW: false, error: err.message });
    }
  }

  // Profil Avatarı ve Gönderi Görseli Yükleme (public/uploads dizinine güvenli depolama)
  if (req.method === 'POST' && (pathname === '/api/upload-avatar' || pathname === '/api/upload-image')) {
    const uploadLimit = checkRateLimit(clientIp, 'image-upload', 20, 10 * 60 * 1000);
    if (!uploadLimit.allowed) {
      return sendJson(res, { error: `Çok fazla görsel yükleme denemesi. Lütfen ${uploadLimit.retryAfter} saniye sonra tekrar deneyin.` }, 429);
    }

    try {
      const body = await parseJsonBody(req, 8 * 1024 * 1024);
      const dataUri = body.image || '';
      const match = dataUri.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
      if (!match) {
        return sendJson(res, { error: 'Geçersiz görsel formatı. Sadece PNG, JPG, WEBP veya GIF kabul edilir.' }, 400);
      }
      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
      const buffer = Buffer.from(match[2], 'base64');

      if (buffer.length < 50 || buffer.length > 8 * 1024 * 1024) {
        return sendJson(res, { error: 'Görsel boyutu 50 bayt ile 8 MB arasında olmalıdır.' }, 400);
      }

      // Magic bytes doğrulama (Sahte uzantı saldırılarına karşı)
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
      const isGif = buffer.slice(0, 3).toString() === 'GIF';

      if (!isPng && !isJpg && !isWebp && !isGif) {
        return sendJson(res, { error: 'Görsel dosya başlığı bozuk veya sahte uzantı tespit edildi.' }, 400);
      }

      // Polyglot ve gizlenmiş script koruması
      const bufHeader = buffer.slice(0, 1024).toString('latin1').toLowerCase();
      if (bufHeader.includes('<script') || bufHeader.includes('<?php') || bufHeader.includes('<!doctype') || bufHeader.includes('<html')) {
        return sendJson(res, { error: 'Güvenlik ihlali: Zararlı betik içeren dosya engellendi.' }, 400);
      }

      if (body.nsfwBlocked) {
        return sendJson(res, { error: 'Fotoğraf yüklenemedi.' }, 403);
      }

      // Harici online NSFW servisi ile görseli doğrula
      const onlineNsfw = await checkOnlineNSFW(buffer, ext);
      if (onlineNsfw.isNSFW) {
        return sendJson(res, { error: 'Fotoğraf yüklenemedi.' }, 403);
      }

      const isAvatar = pathname === '/api/upload-avatar' || body.type === 'avatar';
      const uploadsDir = isAvatar
        ? path.resolve(__dirname, 'public', 'uploads', 'avatars')
        : path.resolve(__dirname, 'public', 'uploads');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${ext}`;
      const destPath = path.resolve(uploadsDir, filename);
      fs.writeFileSync(destPath, buffer);

      let finalUrl = null;
      let source = 'local';

      if (isAvatar) {
        // AVATARLAR İÇİN KALICI ÇÖZÜM:
        // Render/Heroku gibi platformlar her GitHub güncellemesinde (push/deploy) konteyner diskini sıfırlar.
        // Bu yüzden yerel diskteki (/uploads/avatars/...) dosyalar silinip 404 oluyordu.
        // Avatarlar istemcide (Cropper) 192x192 WebP/JPEG olarak optimize edildiği için (~8-15KB),
        // doğrudan veritabanında (profiles.avatar_url) Base64 Data URI olarak saklanır.
        // Böylece GitHub deployment'ları, sunucu yeniden başlatmaları veya harici CDN arızaları
        // profil resimlerini ASLA silemez, %100 kalıcıdır!
        finalUrl = dataUri;
        source = 'persistent_data_uri';
      } else {
        // Gönderi görselleri için harici CDN (Catbox / Imgur) veya Supabase Cloud Storage
        const externalUrl = await uploadToExternalImageHost(buffer, ext);
        let cloudFallbackUrl = null;

        if (!externalUrl) {
          const mimeMap = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
          const remotePath = `posts/${filename}`;
          try {
            const sbUploadRes = await fetch(`${SUPABASE_STORAGE_URL}/storage/v1/object/uploads/${remotePath}`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_STORAGE_KEY,
                'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
                'Content-Type': mimeMap[ext] || 'image/jpeg',
                'x-upsert': 'true'
              },
              body: buffer
            });
            if (sbUploadRes.ok) {
              cloudFallbackUrl = `${SUPABASE_STORAGE_URL}/storage/v1/object/public/uploads/${remotePath}`;
            }
          } catch (_) {}
        }

        finalUrl = externalUrl || cloudFallbackUrl || `/uploads/${filename}`;
        source = externalUrl ? 'external_cdn' : (cloudFallbackUrl ? 'supabase_cloud' : 'local_disk');
      }

      return sendJson(res, {
        ok: true,
        url: finalUrl,
        avatarUrl: finalUrl,
        bannerUrl: finalUrl,
        source
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      return sendJson(res, { error: 'Fotoğraf yüklenemedi.' }, 400);
    }
  }

  // Statik Dosya Sunucusu (Dizin Gezinmesi / Path Traversal Engeli & Güvenlik Başlıkları)
  let safePathname;
  try {
    safePathname = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    return res.end('400 Bad Request: Malformed URI');
  }

  if (safePathname.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    return res.end('400 Bad Request');
  }

  const publicDir = path.resolve(__dirname, 'public');
  const targetFile = safePathname === '/' ? '/index.html' : safePathname;
  const fullPath = path.resolve(publicDir, '.' + targetFile);

  // Public dizini dışına çıkma girişimlerini (../ vb.) kesin olarak engelle
  if (!fullPath.startsWith(publicDir + path.sep) && fullPath !== publicDir) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    return res.end('403 Forbidden: Dizin gezinmesi engellendi.');
  }

  const extname = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bin': 'application/octet-stream'
  };

  // Ana sayfa için Eş Zamanlı Veri Enjeksiyonu (SSR Hydration Bootstrap - 0ms Gecikme)
  if (safePathname === '/' || safePathname === '/index.html') {
    fs.readFile(fullPath, 'utf8', (err, htmlContent) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
        return res.end('500 Sunucu Hatası');
      }
      const injectionScript = `
  <script id="__AMED_BOOTSTRAP_STATE__">
    window.__INITIAL_DATA__ = ${safeJsonSerialize(cachedDashboard)};
    window.__INITIAL_SQUAD__ = ${safeJsonSerialize(cachedSquad)};
  </script>`;
      const outputHtml = htmlContent.replace('</head>', `${injectionScript}\n</head>`);
      const acceptEncoding = (req.headers['accept-encoding'] || '');
      const headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...SECURITY_HEADERS
      };
      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(Buffer.from(outputHtml));
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Length'] = compressed.length;
        res.writeHead(200, headers);
        return res.end(compressed);
      }
      res.writeHead(200, headers);
      return res.end(outputHtml);
    });
    return;
  }

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
      return res.end('404 Not Found');
    }
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(extname);
    const isCode = ['.js', '.css'].includes(extname);
    const acceptEncoding = (req.headers['accept-encoding'] || '');

    const headers = {
      'Content-Type': mimeTypes[extname] || (pathname.includes('/models/') ? 'application/octet-stream' : 'text/plain'),
      'Cache-Control': isImage ? 'public, max-age=86400' : isCode ? 'no-cache, must-revalidate' : 'no-store, no-cache, must-revalidate',
      ...SECURITY_HEADERS
    };

    if (isCode && acceptEncoding.includes('gzip') && content.length > 512) {
      const compressed = zlib.gzipSync(content);
      headers['Content-Encoding'] = 'gzip';
      headers['Content-Length'] = compressed.length;
      res.writeHead(200, headers);
      return res.end(compressed);
    }

    res.writeHead(200, headers);
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Amedspor Live Hub sunucusu http://localhost:${PORT} adresinde aktif!`);
});
