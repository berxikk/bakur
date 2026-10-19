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
// Çok dilli sözlük public/i18n.js dosyasından dinamik olarak alınır
function getI18NDict() {
  const root = (typeof window !== 'undefined' && window.I18N) ? window.I18N : (typeof I18N !== 'undefined' ? I18N : {});
  return (root && root[appState?.lang]) || (root && root.tr) || {};
}

function t(key) {
  const dict = getI18NDict();
  if (dict && dict[key] !== undefined) return dict[key];
  const trDict = (typeof window !== 'undefined' && window.I18N && window.I18N.tr) ? window.I18N.tr : {};
  return trDict[key] !== undefined ? trDict[key] : key;
}

function getStatLabel(statName, fallbackLabel) {
  const dict = getI18NDict();
  const trDict = (typeof window !== 'undefined' && window.I18N && window.I18N.tr) ? window.I18N.tr : {};
  return dict?.statsMap?.[statName] || trDict?.statsMap?.[statName] || fallbackLabel || statName;
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
  const root = (typeof window !== 'undefined' && window.I18N) ? window.I18N : (typeof I18N !== 'undefined' ? I18N : {});
  if (!root[lang]) return;
  appState.lang = lang;
  localStorage.setItem('amed_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('#langSwitcher .lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // 1. i18n.js universal translation scanner
  if (typeof window !== 'undefined' && typeof window.translateDocument === 'function') {
    window.translateDocument(lang);
  }

  // 2. Tüm statik data-i18n ve data-ci18n etiketlerini güncelle
  document.querySelectorAll('[data-i18n], [data-ci18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n') || el.getAttribute('data-ci18n');
    const val = t(key);
    if (typeof val === 'string') {
      el.textContent = val;
    }
  });

  // 3. Placeholder ve title güncellemeleri
  document.querySelectorAll('[data-i18n-ph], [data-ci18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph') || el.getAttribute('data-ci18n-ph');
    const val = t(key);
    if (typeof val === 'string') el.placeholder = val;
  });

  // 4. Arama kutuları
  const searchInput = document.getElementById('playerSearchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  const forumSearch = document.getElementById('forumSearch');
  if (forumSearch) forumSearch.placeholder = t('searchPostsPlaceholder');

  // 5. Takvim gün başlıkları
  const weekdaysEl = document.getElementById('calendarWeekdays');
  if (weekdaysEl) {
    const days = t('weekdays');
    weekdaysEl.innerHTML = Array.isArray(days) ? days.map((d) => `<div>${d}</div>`).join('') : '';
  }

  // 6. Tema buton metni
  const labelSidebar = document.getElementById('sidebarThemeLabel');
  if (labelSidebar) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme');
    labelSidebar.textContent = isDark ? t('lightTheme') : t('darkTheme');
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
  if (labelSidebar) labelSidebar.textContent = isDark ? t('lightTheme') : t('darkTheme');
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

function getTeamLogo(teamId) {
  return `/logos/${teamId || AMED_ID}.png`;
}

function getDashboardFingerprint(d) {
  if (!d) return '';
  const currentMatchesStr = (d.currentRoundMatches || []).map(m =>
    `${m.id}:${m.status?.clock}:${m.status?.type}:${m.homeScore?.current}:${m.awayScore?.current}`
  ).join('|');
  const pastMatchesStr = (d.pastMatches || []).slice(0, 3).map(m =>
    `${m.id}:${m.homeScore?.current}:${m.awayScore?.current}`
  ).join('|');
  const upMatchesStr = (d.upcomingMatches || []).slice(0, 2).map(m => m.id).join('|');
  const standingsTopStr = (d.standings || []).slice(0, 5).map(s => `${s.team?.id}:${s.points}`).join('|');
  return `${d.timestamp || ''}_${currentMatchesStr}_${pastMatchesStr}_${upMatchesStr}_${standingsTopStr}`;
}

let dashboardPollTimeout = null;

function scheduleNextPoll(data) {
  if (dashboardPollTimeout) {
    clearTimeout(dashboardPollTimeout);
    dashboardPollTimeout = null;
  }

  // Sekme arka plandaysa CPU ve ağ tasarrufu için 60 saniyeye yavaşlat
  if (document.hidden) {
    dashboardPollTimeout = setTimeout(fetchDashboard, 60000);
    return;
  }

  const d = data || appState.data;
  const hasLiveMatch = (d?.currentRoundMatches || []).some(m => m.status?.type === 'inprogress')
    || (d?.pastMatches || []).some(m => m.status?.type === 'inprogress')
    || (d?.upcomingMatches || []).some(m => m.status?.type === 'inprogress');

  // Canlı maç varsa 5 saniyede bir, canlı maç yoksa 20 saniyede bir sorgula
  const nextDelay = hasLiveMatch ? 5000 : 20000;
  dashboardPollTimeout = setTimeout(fetchDashboard, nextDelay);
}

async function fetchSquad(force = false) {
  const now = Date.now();
  if (!force && appState.players && appState.players.length > 0 && (now - (appState.lastSquadFetchTime || 0) < 3 * 60 * 1000)) {
    return;
  }
  try {
    const squadRes = await fetch(`/api/squad?_t=${now}`, { cache: 'no-store' });
    if (squadRes.ok) {
      const sqData = await squadRes.json();
      if (Array.isArray(sqData.players) && sqData.players.length > 0) {
        appState.players = sqData.players;
        appState.lastSquadFetchTime = now;
        try {
          localStorage.setItem('amed_cached_squad', JSON.stringify(appState.players));
        } catch (e) {}
        renderSquad();
      }
    }
  } catch (err) {
    console.warn('Squad fetch warning:', err.message);
  }
}

async function fetchDashboard() {
  try {
    const ts = Date.now();
    const dashRes = await fetch(`/api/dashboard?_t=${ts}`, { cache: 'no-store' });
    if (!dashRes.ok) throw new Error(`HTTP ${dashRes.status}`);
    const data = await dashRes.json();

    const newHash = getDashboardFingerprint(data);
    const dataChanged = newHash !== appState.lastRenderedDataHash;

    appState.data = data;
    try {
      localStorage.setItem('amed_cached_dashboard', JSON.stringify(data));
    } catch (e) {}

    if (!appState.selectedRound) {
      appState.selectedRound = data.rounds?.currentRound || 8;
    }

    // Yalnızca veri gerçekten değiştiğinde renderAll() çağır! (DOM Thrashing & Stutter Kesin Çözümü)
    if (dataChanged) {
      appState.lastRenderedDataHash = newHash;
      renderAll();
    }

    const modalEl = document.getElementById('matchModal');
    if (modalEl?.classList.contains('open') && appState.activeModalEventId) {
      const isLive = appState.activeModalData?.event?.status?.type === 'inprogress';
      if (isLive || !appState.activeModalData) {
        const mRes = await fetch(`/api/match/${appState.activeModalEventId}?_t=${Date.now()}`, { cache: 'no-store' });
        if (mRes.ok) {
          appState.activeModalData = await mRes.json();
          renderModalHeader();
          renderModalBody();
        }
      }
    }

    scheduleNextPoll(data);
  } catch (err) {
    console.error('Arka plan senkronizasyon hatası:', err);
    scheduleNextPoll(appState.data);
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
        <i class="ri-broadcast-line"></i> ${match.status?.description || t('liveMatchInProgress') || 'Canlı Oynanıyor'}
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
        <span><i class="ri-map-pin-line"></i> ${match.venue || t('venueDefault') || 'Diyarbakır Stadyumu'}</span>
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
              <i class="ri-map-pin-line"></i> ${m.venue || t('venueDefault') || 'Diyarbakır Stadyumu'}
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
    mobileTitleEl.textContent = `${months[calMonth]} ${calYear} ${t('monthMatchesSuffix') || 'Karşılaşmaları'}`;
  }
  if (mobileListEl) {
    const monthMatches = allMatches.filter((m) => {
      const d = new Date(m.startTimestamp * 1000);
      return d.getFullYear() === calYear && d.getMonth() === calMonth;
    }).sort((a, b) => a.startTimestamp - b.startTimestamp);

    if (monthMatches.length === 0) {
      mobileListEl.innerHTML = `<div class="cal-mobile-no-matches"><i class="ri-calendar-line"></i> ${t('calMobileNoMatches') || 'Bu ayda planlanan karşılaşma bulunmuyor.'}</div>`;
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
          badgeText = `${t('liveBadge') || 'CANLI'} ${(m.homeScore?.current ?? 0)} - ${(m.awayScore?.current ?? 0)}`;
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
              <span class="cal-mobile-match-date"><i class="ri-calendar-line"></i> ${dateStr} · ${m.roundInfo?.round ? `${m.roundInfo.round}. ${t('matchweekWord') || 'Hafta'}` : 'Süper Lig'}</span>
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
            ${goals > 0 ? `<span class="pstat-pill goal" title="${goals} ${t('goalWord') || 'Gol'}"><i class="ri-football-line"></i> ${goals} ${t('goalWord') || 'Gol'}</span>` : ''}
            ${assists > 0 ? `<span class="pstat-pill assist" title="${assists} ${t('assistWord') || 'Asist'}"><i class="ri-magic-line"></i> ${assists} ${t('assistWord') || 'Asist'}</span>` : ''}
            ${yellowCards > 0 ? `<span class="pstat-pill yellow-card" title="${yellowCards} ${t('yellowCardTooltip') || 'Sarı Kart'}"><span class="mini-card-icon yellow"></span> ${yellowCards} ${t('yellowCard') || 'Sarı'}</span>` : ''}
            ${redCards > 0 ? `<span class="pstat-pill red-card" title="${redCards} ${t('redCardTooltip') || 'Kırmızı Kart'}"><span class="mini-card-icon red"></span> ${redCards} ${t('redCard') || 'Kırmızı'}</span>` : ''}
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
        <span class="beacon-dot"></span> ${t('liveBadge') || 'CANLI'} ${ev.status?.clock || ''} • ${ev.status?.description || t('playingStatus') || 'Oynanıyor'}
      </div>
    `;
  }

  let xgHTML = '';
  if (intel?.xG) {
    xgHTML = `
      <div class="modal-xg-pill" title="${t('xgTooltip') || 'Beklenen Gol Değeri (Expected Goals)'}">
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
      <div class="modal-possession-bar" title="${getStatLabel('possessionPct')}: %${pH} - %${pA}">
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
      <div class="modal-dual-stats-grid">
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
      label: t('commGoal') || 'GOL'
    };
  }

  // 2. Red Card / Kırmızı Kart
  if (cType.includes('red_card') || text.includes('kırmızı kart') || text.includes('red card') || text.includes('ihraç') || text.includes('oyundan atıldı') || text.includes('ikinci sarı')) {
    return {
      badgeClass: 'comm-type-red',
      icon: '<span class="comm-card-box red"></span>',
      badgeIcon: '<span class="comm-card-box red" style="width:8px;height:11px;"></span>',
      label: t('commRed') || 'KIRMIZI KART'
    };
  }

  // 3. Yellow Card / Sarı Kart
  if (cType.includes('yellow_card') || text.includes('sarı kart') || text.includes('yellow card') || text.includes('ihtar')) {
    return {
      badgeClass: 'comm-type-yellow',
      icon: '<span class="comm-card-box yellow"></span>',
      badgeIcon: '<span class="comm-card-box yellow" style="width:8px;height:11px;"></span>',
      label: t('commYellow') || 'SARI KART'
    };
  }

  // 4. Penalty / Penaltı
  if (cType.includes('penalty') || text.includes('penaltı') || text.includes('penalty')) {
    return {
      badgeClass: 'comm-type-penalty',
      icon: '<i class="ri-focus-2-line"></i>',
      badgeIcon: '<i class="ri-focus-2-line"></i>',
      label: t('commPenalty') || 'PENALTI'
    };
  }

  // 5. Foul / Faul
  if (cType.includes('foul') || text.includes('faul') || text.includes('foul') || text.includes('serbest vuruş') || text.includes('düşürüldü') || text.includes('sert müdahale')) {
    return {
      badgeClass: 'comm-type-foul',
      icon: '<i class="ri-alarm-warning-line"></i>',
      badgeIcon: '<i class="ri-alarm-warning-line"></i>',
      label: t('commFoul') || 'FAUL'
    };
  }

  // 6. Substitution / Değişiklik
  if (cType.includes('sub') || text.includes('oyuncu değişikliği') || text.includes('oyuna girdi') || text.includes('yerine dahil') || text.includes('kenara geldi') || text.includes('substitution') || text.includes('değişiklik')) {
    return {
      badgeClass: 'comm-type-sub',
      icon: '<i class="ri-repeat-line"></i>',
      badgeIcon: '<i class="ri-repeat-line"></i>',
      label: t('commSub') || 'DEĞİŞİKLİK'
    };
  }

  // 7. Corner / Köşe Vuruşu
  if (cType.includes('corner') || text.includes('korner') || text.includes('köşe vuruşu') || text.includes('corner')) {
    return {
      badgeClass: 'comm-type-corner',
      icon: '<i class="ri-flag-line"></i>',
      badgeIcon: '<i class="ri-flag-line"></i>',
      label: t('commCorner') || 'KORNER'
    };
  }

  // 8. Offside / Ofsayt
  if (cType.includes('offside') || text.includes('ofsayt') || text.includes('offside')) {
    return {
      badgeClass: 'comm-type-offside',
      icon: '<i class="ri-flag-2-line"></i>',
      badgeIcon: '<i class="ri-flag-2-line"></i>',
      label: t('commOffside') || 'OFSAYT'
    };
  }

  // 9. Save / Kurtarış
  if (text.includes('kurtardı') || text.includes('kurtarış') || text.includes('kaleci çıkardı') || text.includes('save') || text.includes('şutu çıkardı')) {
    return {
      badgeClass: 'comm-type-save',
      icon: '<i class="ri-shield-check-line"></i>',
      badgeIcon: '<i class="ri-shield-check-line"></i>',
      label: t('commSave') || 'KURTARIŞ'
    };
  }

  // 10. Whistle / Hakem Düdüğü
  if (text.includes('düdük') || text.includes('başladı') || text.includes('sona erdi') || text.includes('ilk yarı') || text.includes('ikinci yarı') || text.includes('maç bitti') || text.includes('uzatma')) {
    return {
      badgeClass: 'comm-type-whistle',
      icon: '<i class="ri-volume-vibrate-line"></i>',
      badgeIcon: '<i class="ri-volume-vibrate-line"></i>',
      label: t('whistleWord') || 'DÜDÜK'
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
          <div class="shot-quality-lbl"><i class="ri-focus-3-line"></i> ${getStatLabel('expectedGoals')}</div>
          <div class="shot-quality-val" style="color:var(--amed-green);">${intel.xG.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.xG.away}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-magic-line"></i> ${t('bigChance')}</div>
          <div class="shot-quality-val">${intel.shotsQuality.bigChances.homeCreated} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.shotsQuality.bigChances.awayCreated}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-crosshair-2-line"></i> ${t('shotsInsideBox')}</div>
          <div class="shot-quality-val">${intel.shotsQuality.insideBox.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.shotsQuality.insideBox.away}</div>
        </div>
        <div class="shot-quality-item">
          <div class="shot-quality-lbl"><i class="ri-flashlight-line"></i> ${t('dangerousAttacks')}</div>
          <div class="shot-quality-val">${intel.attacks.dangerous.home} <span style="color:var(--text-muted); font-size:0.75rem;">vs</span> ${intel.attacks.dangerous.away}</div>
        </div>
      </div>
    ` : '';

    // 2. Maç Momentum & Baskı Zaman Çizelgesi
    const momentumHTML = intel?.momentum ? `
      <div class="momentum-card">
        <div class="momentum-gauge-header">
          <span><i class="ri-pulse-line" style="color:var(--amed-green);"></i> ${t('momentumCurve')}</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-secondary);">
            ${t('pressure')}: <strong style="color:var(--amed-green);">%${intel.currentPressure.pressureHome} ${ev.homeTeam.shortName || ev.homeTeam.name}</strong> - <strong style="color:var(--amed-red);">%${intel.currentPressure.pressureAway} ${ev.awayTeam.shortName || ev.awayTeam.name}</strong>
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
          <div class="corridor-title">${t('leftFlankAttack')}</div>
          <div class="corridor-bar-track"><div class="corridor-bar-fill" style="width:${intel.attacks.zones.home.left}%"></div></div>
          <div class="corridor-pct">%${intel.attacks.zones.home.left}</div>
        </div>
        <div class="corridor-box">
          <div class="corridor-title">${t('centerAttack')}</div>
          <div class="corridor-bar-track"><div class="corridor-bar-fill" style="width:${intel.attacks.zones.home.center}%"></div></div>
          <div class="corridor-pct">%${intel.attacks.zones.home.center}</div>
        </div>
        <div class="corridor-box">
          <div class="corridor-title">${t('rightFlankAttack')}</div>
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
            <div class="motm-tag">${t('motmTitle')}</div>
            <div class="motm-name">#${intel.motm.jersey || ''} ${intel.motm.name}</div>
            <div class="motm-team">${intel.motm.team}</div>
          </div>
        </div>
        <div class="motm-rating-badge" title="${t('motmTooltip')}">
          ${intel.motm.rating}
        </div>
      </div>
    ` : '';

    // 5. Canlı Puan Tablosu Simülasyonu
    const standingsImpactHTML = intel?.standingsImpact ? `
      <div class="live-standings-impact-box">
        <div class="live-standings-impact-icon"><i class="ri-trophy-line"></i></div>
        <div>
          <div style="font-weight:700; color:var(--text-main); margin-bottom:0.15rem;">${t('liveStandingsImpact')}</div>
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
          <div class="modal-dual-stats-grid">
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
          <span>${t('matchNotStartedNotice')}</span>
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
          <i class="ri-focus-3-line"></i> ${t('tabAttackXg')}
        </button>
        <button class="comm-filter-chip ${catFilter === 'passing' ? 'active' : ''}" onclick="setStatsCategoryFilter('passing')">
          <i class="ri-share-forward-line"></i> ${t('tabPassing')}
        </button>
        <button class="comm-filter-chip ${catFilter === 'defense' ? 'active' : ''}" onclick="setStatsCategoryFilter('defense')">
          <i class="ri-shield-check-line"></i> ${t('tabDefense')}
        </button>
        <button class="comm-filter-chip ${catFilter === 'discipline' ? 'active' : ''}" onclick="setStatsCategoryFilter('discipline')">
          <i class="ri-file-warning-line"></i> ${t('statCategories')?.discipline || 'Disiplin'}
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
        <span><i class="ri-checkbox-multiple-line" style="color: var(--amed-green);"></i> <strong>${allStats.length}</strong> ${t('detailedLiveStats')}</span>
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
        ? `<span class="player-rating-pill ${ratingCls}" title="${t('playerRatingTooltip')}">${isMotm ? '⭐ ' : ''}${p.rating}</span>`
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
    const evStatus = ev.status?.type || activeModalData?.event?.status?.type || activeModalData?.status?.type || '';
    const rawComm = activeModalData?.commentary || [];
    const isStarted = evStatus === 'finished' || evStatus === 'inprogress' || ev.status?.state === 'in' || ev.status?.state === 'post' || rawComm.length > 0;
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
          <i class="ri-football-line" style="color:var(--amed-green);"></i> ${t('commFilterGoals')}
        </button>
        <button class="comm-filter-chip ${commFilter === 'cards' ? 'active' : ''}" onclick="setCommentaryFilter('cards')">
          <i class="ri-stop-fill" style="color:#eab308;"></i> ${t('commFilterCards')}
        </button>
        <button class="comm-filter-chip ${commFilter === 'foul' ? 'active' : ''}" onclick="setCommentaryFilter('foul')">
          <i class="ri-alarm-warning-line" style="color:#f97316;"></i> ${t('commFilterFouls')}
        </button>
        <button class="comm-filter-chip ${commFilter === 'shot' ? 'active' : ''}" onclick="setCommentaryFilter('shot')">
          <i class="ri-focus-3-line" style="color:#3b82f6;"></i> ${t('commFilterShots')}
        </button>
        <button class="comm-filter-chip ${commFilter === 'sub' ? 'active' : ''}" onclick="setCommentaryFilter('sub')">
          <i class="ri-arrow-left-right-line" style="color:#8b5cf6;"></i> ${t('commFilterSubs')}
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
    appState.lastRenderedDataHash = getDashboardFingerprint(appState.data);
    renderAll();
  }

  // Akıllı ve Adaptif Arka Plan Senkronizasyonu (DOM Thrashing & Donma Engeli)
  fetchDashboard();
  fetchSquad();
  setInterval(() => fetchSquad(), 3 * 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchDashboard();
      fetchSquad();
    } else {
      scheduleNextPoll(appState.data);
    }
  });
  window.addEventListener('focus', () => {
    if (document.visibilityState === 'visible') {
      fetchDashboard();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
