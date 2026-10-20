/* =========================================================
   AMEDSPOR TOPLULUK: Supabase Giriş + Taraftar Forumu
   ========================================================= */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

/* ---------- ÇEVİRİLER ---------- */
// Çok dilli sözlük public/i18n.js dosyasından yüklenir
const CI18N = (typeof window !== 'undefined' && window.CI18N) ? window.CI18N : {};

const lang = () => {
  const l = (typeof localStorage !== 'undefined' ? localStorage.getItem('amed_lang') : null) || document.documentElement.lang || 'tr';
  return (CI18N && CI18N[l]) ? l : 'tr';
};
const T = (key) => (CI18N && CI18N[lang()] && CI18N[lang()][key]) ?? (CI18N && CI18N.tr && CI18N.tr[key]) ?? key;

/* ---------- DURUM ---------- */
const S = {
  session: null,
  profile: null,
  categories: [],
  activeCat: 'all',
  streamMode: 'all',
  officialPosts: [],
  sort: 'latest',
  search: '',
  threads: [],
  myThreads: [],
  limit: 20,
  hasMore: false,
  view: 'list',
  thread: null,
  posts: [],
  likedThreads: new Set(),
  likedPosts: new Set(),
  authMode: 'login',
  viewingUserId: null,
  followingSet: new Set(),
  pendingNewPosts: 0
};

/* ---------- YARDIMCILAR ---------- */
const $ = (id) => document.getElementById(id);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPostContent(str) {
  if (!str) return '';
  let imgHtml = '';
  const imgRegex = /(?:(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s]*)?)|(\/uploads\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif)))/gi;
  const matches = str.match(imgRegex);
  let cleanText = str;
  if (matches && matches.length > 0) {
    const firstImg = matches[0];
    cleanText = str.replace(firstImg, '').trim();
    imgHtml = `
      <div class="tweet-media-wrap" style="margin-top:0.65rem; border-radius:12px; overflow:hidden; border:1px solid var(--border-light); max-height:420px; background:var(--bg-subtle);">
        <img src="${esc(firstImg)}" alt="Gönderi Görseli" style="width:100%; max-height:420px; object-fit:contain; display:block;" loading="lazy" />
      </div>`;
  }
  const escaped = esc(cleanText);
  const formatted = escaped
    .replace(/(#[\p{L}\p{N}_]+)/gu, '<span class="soc-hashtag" style="color:var(--amed-green); font-weight:700; cursor:pointer;" data-action="filter-hashtag" data-tag="$1" title="Bu etikete sahip gönderileri listele">$1</span>')
    .replace(/(@[a-zA-Z0-9_.]+)/g, '<span class="soc-mention" style="color:var(--amed-green); font-weight:600;">$1</span>');
  return formatted + imgHtml;
}

function ago(ts) {
  const diffSec = (new Date(ts).getTime() - Date.now()) / 1000;
  if (Math.abs(diffSec) < 60) return T('justNow');
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  const [unit, sec] = units.find(([, s]) => Math.abs(diffSec) >= s);
  const value = Math.round(diffSec / sec);
  if (lang() === 'ku') {
    const ku = { year: 'sal', month: 'meh', week: 'hefte', day: 'roj', hour: 'saet', minute: 'deqîqe' };
    return `berî ${Math.abs(value)} ${ku[unit]}`;
  }
  return new Intl.RelativeTimeFormat(lang(), { numeric: 'auto' }).format(value, unit);
}

function sanitizeImageUrl(url) {
  if (!url) return null;
  const str = String(url).trim();
  if (str.startsWith('/logos/')) {
    if (str.includes('..') || str.includes('\\')) return null;
    if (!/^\/logos\/[0-9a-zA-Z._-]+\.png$/i.test(str)) return null;
    return str;
  }
  if (str.startsWith('/uploads/')) {
    if (str.includes('..') || str.includes('\\')) return null;
    if (!/^\/uploads\/[0-9a-zA-Z._\/-]+\.(png|jpg|jpeg|webp|gif)$/i.test(str)) return null;
    return str;
  }
  // Güvenli harici ve yerel domain görsel URL'leri
  if (/^https?:\/\/([a-zA-Z0-9.-]+\.)?(bakur\.onread\.com|localhost|127\.0\.0\.1|supabase\.co|imgur\.com|freeimage\.host|catbox\.moe|flagcdn\.com)(:\d+)?\/[^\s<>"']+/i.test(str)) {
    return str;
  }
  if (/^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s<>"']*\.(png|jpg|jpeg|webp|gif)(\?[^\s<>"']*)?$/i.test(str)) {
    return str;
  }
  return null;
}

const sanitizeAvatarUrl = sanitizeImageUrl;
const sanitizeBannerUrl = sanitizeImageUrl;

function avatarHTML(profile, size = 36) {
  const name = profile?.display_name || profile?.username || '?';
  const cleanUrl = sanitizeAvatarUrl(profile?.avatar_url);
  const palette = ['#059669', '#e11d48', '#0f766e', '#b45309', '#4f46e5', '#0e7490'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const initial = esc(name.charAt(0).toUpperCase() || '?');
  const bg = palette[h % palette.length];
  const fs = Math.round(size * 0.42);

  if (cleanUrl) {
    return `<img class="c-avatar" style="width:${size}px;height:${size}px;object-fit:cover;" src="${esc(cleanUrl)}" alt="${esc(name)}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.outerHTML='<span class=\\'c-avatar\\' style=\\'width:${size}px;height:${size}px;background:${bg};font-size:${fs}px\\'>${initial}</span>';" />`;
  }
  return `<span class="c-avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${fs}px">${initial}</span>`;
}

function catName(cat) {
  return cat ? cat[`name_${lang()}`] || cat.name_tr : '';
}

function catById(id) {
  return S.categories.find((c) => c.id === id);
}

let toastTimer;
function toast(msg, type = 'ok') {
  let el = $('cToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cToast';
    el.className = 'c-toast';
    document.body.appendChild(el);
  }
  el.innerHTML = `<i class="${type === 'err' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}"></i> ${esc(msg)}`;
  el.className = `c-toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function errMsg(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('captcha')) return 'Giriş yapılamadı: Supabase panelinde "Bot Protection / Captcha" açık kalmış. Lütfen Supabase ayarlarından Captcha korumasını kapatın.';
  if (m.includes('invalid login')) return T('invalidCredentials');
  if (m.includes('email not confirmed')) return T('emailNotConfirmed');
  if (m.includes('password') && m.includes('6')) return T('minPassword');
  if (error?.code === '23505') return T('usernameTaken');
  return error?.message || T('errorGeneric');
}

const me = () => S.session?.user?.id || null;

function requireLogin() {
  if (me()) return true;
  toast(T('loginRequired'), 'err');
  openAuth('login');
  return false;
}

/* ---------- ONLINE HARİCİ NSFW +18 GÖRSEL FİLTRESİ ---------- */
async function verifyImageNSFW(dataUri) {
  try {
    const res = await fetch('/api/check-nsfw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUri })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Online NSFW denetimi hatası:', err);
  }
  return { isNSFW: false, reason: null };
}

/* ---------- STATİK ETİKETLER ---------- */
function applyStaticLabels() {
  document.querySelectorAll('[data-ci18n]').forEach((el) => {
    el.textContent = T(el.dataset.ci18n);
  });
  document.querySelectorAll('[data-ci18n-ph]').forEach((el) => {
    el.placeholder = T(el.dataset.ci18nPh);
  });
  document.querySelectorAll('[data-ci18n-title]').forEach((el) => {
    el.title = T(el.dataset.ci18nTitle);
  });
}

/* ---------- ÜST BAR: GİRİŞ ALANI ---------- */
function renderHeaderAuth() {
  const area = $('authArea');
  if (!area) return;
  if (!me()) {
    area.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.45rem;">
        <button class="auth-btn" data-action="open-lang-dialog" title="${T('languageSelect')}">
          <i class="ri-translate-2"></i> <span>${lang().toUpperCase()}</span>
        </button>
        <button class="auth-btn" data-action="open-login">
          <i class="ri-user-3-line"></i> <span>${T('login')}</span>
        </button>
      </div>`;
    return;
  }
  let p = S.profile;
  if (!p) {
    try {
      const cached = localStorage.getItem('amed_cached_user_profile');
      if (cached) p = JSON.parse(cached);
    } catch (e) {}
  }
  const meta = S.session?.user?.user_metadata || {};
  const fallbackUsername = meta.username || meta.display_name || meta.full_name || (S.session?.user?.email ? S.session.user.email.split('@')[0] : 'Kullanıcı');
  const profileObj = p || {
    id: me(),
    username: fallbackUsername,
    display_name: meta.display_name || fallbackUsername,
    avatar_url: meta.avatar_url || ''
  };
  const isAdmin = profileObj.role === 'admin';
  area.innerHTML = `
    <div class="user-menu">
      <button class="user-chip" data-action="toggle-menu" aria-haspopup="true">
        ${avatarHTML(profileObj, 28)}
        <span class="user-chip-name">${esc(profileObj.display_name || profileObj.username)}</span>
        ${isAdmin ? `<span class="user-admin-badge" title="Yönetici"><i class="ri-shield-star-fill"></i></span>` : ''}
        <i class="ri-arrow-down-s-line"></i>
      </button>
      <div class="user-dropdown" id="userDropdown">
        <button data-action="goto-settings"><i class="ri-settings-3-line"></i> ${T('settings')}</button>
        <button data-action="logout" class="danger"><i class="ri-logout-box-r-line"></i> ${T('logout')}</button>
      </div>
    </div>`;
}

/* ---------- MODAL ALTYAPISI ---------- */
function openDialog(html, cls = '') {
  closeDialog();
  const wrap = document.createElement('div');
  wrap.className = 'c-backdrop';
  wrap.id = 'cDialog';
  wrap.innerHTML = `<div class="c-dialog ${cls}" role="dialog" aria-modal="true">
    <button class="c-dialog-close" data-action="close-dialog" aria-label="Kapat"><i class="ri-close-line"></i></button>
    <div class="c-dialog-body">
      ${html}
    </div>
  </div>`;
  wrap.addEventListener('mousedown', (e) => {
    if (e.target === wrap) closeDialog();
  });
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  wrap.querySelector('input, textarea, select')?.focus();
  return wrap;
}

function closeDialog() {
  $('cDialog')?.remove();
}

window.openAuth = openAuth;

function setBusy(form, busy) {
  form.querySelectorAll('button, input, textarea, select').forEach((el) => (el.disabled = busy));
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.classList.toggle('loading', busy);
}

function formMsg(form, msg, type = 'err') {
  const box = form.querySelector('.c-form-msg');
  if (!box) return;
  box.className = `c-form-msg ${type}`;
  box.textContent = msg;
}

/* ---------- GİRİŞ / KAYIT ---------- */
function openAuth(mode = 'login') {
  S.authMode = mode;
  const google = `
    <button type="button" class="c-btn c-btn-google" data-action="google">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      ${T('google')}
    </button>
    <div class="c-divider"><span>${T('or')}</span></div>`;

  const crest = `<img class="c-dialog-crest" src="/logos/132335.png" alt="Amedspor" />`;
  let html = '';

  if (mode === 'login') {
    html = `${crest}
      <h3 class="c-dialog-title">${T('loginTitle')}</h3>
      <p class="c-dialog-sub">${T('loginSub')}</p>
      ${google}
      <form class="c-form" data-form="login" novalidate>
        <label class="c-field"><span>${T('email')}</span><input type="email" name="email" autocomplete="email" placeholder="ornek@email.com" required /></label>
        <label class="c-field"><span>${T('password')}</span><input type="password" name="password" autocomplete="current-password" required /></label>
        <div class="c-row-end"><button type="button" class="c-link" data-action="auth-mode" data-mode="reset">${T('forgot')}</button></div>
        <div class="c-form-msg"></div>
        <button type="submit" class="c-btn c-btn-primary">${T('login')}</button>
      </form>
      <p class="c-switch">${T('noAccount')} <button class="c-link" data-action="auth-mode" data-mode="signup">${T('signup')}</button></p>`;
  } else if (mode === 'signup') {
    html = `${crest}
      <h3 class="c-dialog-title">${T('signupTitle')}</h3>
      <p class="c-dialog-sub">${T('signupSub')}</p>
      ${google}
      <form class="c-form" data-form="signup" novalidate>
        <label class="c-field"><span>${T('username')}</span><input type="text" name="username" autocomplete="username" maxlength="24" required /></label>
        <label class="c-field"><span>${T('email')}</span><input type="email" name="email" autocomplete="email" required /></label>
        <label class="c-field"><span>${T('password')}</span><input type="password" name="password" autocomplete="new-password" minlength="6" required /></label>
        <label class="c-field">
          <span style="display:flex; align-items:center; gap:0.4rem; color:var(--amed-green); font-weight:700;">
            <i class="ri-shield-star-fill"></i> Taraftar Doğrulama Parolası
          </span>
          <input type="text" name="amedPledge" placeholder="her bijî amedspor" required autocomplete="off" />
        </label>
        <div style="font-size:0.76rem; color:var(--text-secondary); margin-top:-0.4rem; margin-bottom:0.75rem; line-height:1.35;">
          Kayıt olabilmek için bu alana <strong>"her bijî amedspor"</strong> yazmalısınız.
        </div>
        <div class="c-form-msg"></div>
        <button type="submit" class="c-btn c-btn-primary">${T('signup')}</button>
      </form>
      <p class="c-switch">${T('haveAccount')} <button class="c-link" data-action="auth-mode" data-mode="login">${T('login')}</button></p>`;
  } else if (mode === 'reset') {
    html = `${crest}
      <h3 class="c-dialog-title">${T('resetTitle')}</h3>
      <p class="c-dialog-sub">${T('resetSub')}</p>
      <form class="c-form" data-form="reset" novalidate>
        <label class="c-field"><span>${T('email')}</span><input type="email" name="email" autocomplete="email" required /></label>
        <div class="c-form-msg"></div>
        <button type="submit" class="c-btn c-btn-primary">${T('sendReset')}</button>
      </form>
      <p class="c-switch"><button class="c-link" data-action="auth-mode" data-mode="login"><i class="ri-arrow-left-line"></i> ${T('backToLogin')}</button></p>`;
  } else if (mode === 'update') {
    html = `${crest}
      <h3 class="c-dialog-title">${T('updateTitle')}</h3>
      <form class="c-form" data-form="update" novalidate>
        <label class="c-field"><span>${T('newPassword')}</span><input type="password" name="password" autocomplete="new-password" minlength="6" required /></label>
        <div class="c-form-msg"></div>
        <button type="submit" class="c-btn c-btn-primary">${T('savePassword')}</button>
      </form>`;
  }
  openDialog(html, 'c-dialog-auth');
}

async function handleAuthForm(form) {
  const kind = form.dataset.form;
  const fd = new FormData(form);
  const email = String(fd.get('email') || '').trim();
  const password = String(fd.get('password') || '');
  const redirectTo = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? window.location.origin
    : 'https://bakur.onread.com';

  if ((kind === 'signup' || kind === 'update') && password.length < 6) return formMsg(form, T('minPassword'));

  setBusy(form, true);
  try {
    if (kind === 'login') {
      let loginEmail = email;
      if (!loginEmail.includes('@')) {
        setBusy(form, false);
        return formMsg(form, 'Hesap güvenliği ve gizlilik için lütfen kayıtlı e-posta adresinizi giriniz.');
      }
      const { data: authData, error } = await sb.auth.signInWithPassword({
        email: loginEmail,
        password
      });
      if (error) {
        throw error;
      }
      if (authData?.session) {
        S.session = authData.session;
      }
      closeDialog();
      await loadProfile();
      await loadMyFollows();
      loadSuggestedUsers();
      renderHeaderAuth();
      if (S.view === 'list') {
        renderForum();
      } else if (S.view === 'thread') {
        renderComposer();
      }
      refreshForum(true);
    } else if (kind === 'signup') {
      const pledge = String(fd.get('amedPledge') || '').trim().toLowerCase();
      const validPledges = [
        'her bijî amedspor',
        'her biji amedspor',
        'her biji amed spor',
        'her bijî amed spor',
        'herbijiamedspor',
        'herbijîamedspor'
      ];
      if (!validPledges.includes(pledge)) {
        setBusy(form, false);
        return formMsg(form, 'Kayıt olabilmek için lütfen doğrulama kutusuna "her bijî amedspor" yazınız! 💚❤️');
      }

      const username = String(fd.get('username') || '').trim();
      if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) {
        setBusy(form, false);
        return formMsg(form, T('invalidUsername'));
      }
      const { data: taken } = await sb.from('profiles').select('id').ilike('username', username).maybeSingle();
      if (taken) {
        setBusy(form, false);
        return formMsg(form, T('usernameTaken'));
      }
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username },
          emailRedirectTo: redirectTo
        }
      });
      if (error) {
        throw error;
      }
      if (!data.session) {
        formMsg(form, T('checkEmail'), 'ok');
        setBusy(form, false);
        form.querySelector('[type="submit"]').disabled = true;
        return;
      }
      closeDialog();
    } else if (kind === 'reset') {
      let resetEmail = email;
      if (!resetEmail.includes('@')) {
        setBusy(form, false);
        return formMsg(form, 'Lütfen şifre sıfırlama bağlantısının gönderileceği e-posta adresinizi giriniz.');
      }
      const { error } = await sb.auth.resetPasswordForEmail(resetEmail, {
        redirectTo
      });
      if (error) {
        throw error;
      }
      formMsg(form, T('resetSent'), 'ok');
    } else if (kind === 'update') {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      closeDialog();
      toast(T('passwordUpdated'));
    }
  } catch (error) {
    formMsg(form, errMsg(error));
  }
  setBusy(form, false);
}

async function signInWithGoogle() {
  const origin = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? window.location.origin
    : 'https://bakur.onread.com';
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: origin }
  });
  if (error) toast(errMsg(error), 'err');
}

async function loadProfile() {
  if (!me()) {
    S.profile = null;
    try { localStorage.removeItem('amed_cached_user_profile'); } catch (e) {}
    return;
  }
  const { data } = await sb.from('profiles').select('*').eq('id', me()).maybeSingle();
  if (data) {
    S.profile = data;
    try {
      localStorage.setItem('amed_cached_user_profile', JSON.stringify(data));
    } catch (e) {}
    renderHeaderAuth();
  }
}

const SQUAD_PLAYERS = [
  'Gift Orban',
  'Dia Saba',
  'Samuel Ballet',
  'Furkan Soyalp',
  'Mehmet Yeşil',
  'Umut Meraş',
  'Alban Lafont',
  'Gökhan Gül',
  'Mbaye Diagne',
  'Ermal Krasniqi',
  'David Bates',
  'Lumbardh Dellova',
  'Rayan Raveloson',
  'Yira Sor',
  'Kahraman Demirtaş',
  'Mustafa Burak Bozan',
  'Yakup Girişen',
  'Miraç Acer',
  'Ali Bülbül',
  'Muhammed Damar',
  'Amadou Cissé',
  'Cem Üstündağ',
  'Berk Kızıldemir',
  'Mohamed Khalil',
  'İsmail Duyu'
];

function openLangDialog() {
  openDialog(
    `<h3 class="c-dialog-title"><i class="ri-translate-2"></i> ${T('languageSelect')}</h3>
     <div class="profile-lang-card" style="margin-top:1rem;">
       <div class="profile-lang-options">
         <button type="button" class="profile-lang-btn ${lang() === 'tr' ? 'active' : ''}" data-action="switch-lang" data-lang="tr">
           <span class="plang-flag">🇹🇷</span> <span>Türkçe</span>
         </button>
         <button type="button" class="profile-lang-btn ${lang() === 'ku' ? 'active' : ''}" data-action="switch-lang" data-lang="ku">
           <span class="plang-flag">☀️</span> <span>Kurdî</span>
         </button>
         <button type="button" class="profile-lang-btn ${lang() === 'en' ? 'active' : ''}" data-action="switch-lang" data-lang="en">
           <span class="plang-flag">🇬🇧</span> <span>English</span>
         </button>
         <button type="button" class="profile-lang-btn ${lang() === 'de' ? 'active' : ''}" data-action="switch-lang" data-lang="de">
           <span class="plang-flag">🇩🇪</span> <span>Deutsch</span>
         </button>
       </div>
     </div>
     <div class="c-form-actions" style="margin-top:1rem;">
       <button type="button" class="c-btn c-btn-primary" data-action="close-dialog">${T('save')}</button>
     </div>`
  );
}

async function logAdminAction(action, target_type, target_id, details = {}) {
  if (S.profile?.role !== 'admin') return;
  try {
    await sb.from('admin_audit_logs').insert({
      admin_id: me(),
      action,
      target_type,
      target_id: String(target_id),
      details
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}

/* ---------- TAKİP SİSTEMİ (FOLLOW / UNFOLLOW) ---------- */
async function loadMyFollows() {
  if (!me()) {
    S.followingSet.clear();
    return;
  }
  try {
    const { data, error } = await sb
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', me());
    if (error) throw error;
    S.followingSet = new Set((data || []).map((r) => r.following_id));
  } catch (err) {
    console.error('loadMyFollows error:', err);
  }
}

async function getFollowCounts(userId) {
  if (!userId) return { followersCount: 0, followingCount: 0 };
  try {
    const [followersRes, followingRes] = await Promise.all([
      sb.from('user_follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
      sb.from('user_follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);
    return {
      followersCount: followersRes.count || 0,
      followingCount: followingRes.count || 0
    };
  } catch (err) {
    console.error('getFollowCounts error:', err);
    return { followersCount: 0, followingCount: 0 };
  }
}

async function toggleFollow(targetUserId) {
  if (!me()) {
    openAuth('login');
    toast(T('loginToFollow'));
    return;
  }
  if (!targetUserId || targetUserId === me()) return;

  const isFollowing = S.followingSet.has(targetUserId);

  if (isFollowing) {
    S.followingSet.delete(targetUserId);
  } else {
    S.followingSet.add(targetUserId);
  }
  updateFollowButtons(targetUserId, !isFollowing);

  try {
    if (isFollowing) {
      const { error } = await sb
        .from('user_follows')
        .delete()
        .eq('follower_id', me())
        .eq('following_id', targetUserId);
      if (error) throw error;
      toast(T('unfollowedToast'));
    } else {
      const { error } = await sb
        .from('user_follows')
        .insert({ follower_id: me(), following_id: targetUserId });
      if (error) throw error;
      toast(T('followedToast'));
    }
  } catch (err) {
    if (isFollowing) {
      S.followingSet.add(targetUserId);
    } else {
      S.followingSet.delete(targetUserId);
    }
    updateFollowButtons(targetUserId, isFollowing);
    console.error('toggleFollow error:', err);
    toast(err.message || T('errorGeneric'));
  }

  const followersCountEl = $('pucFollowersCount');
  if (followersCountEl && (S.viewingUserId === targetUserId || (!S.viewingUserId && me() === targetUserId))) {
    const counts = await getFollowCounts(targetUserId);
    followersCountEl.textContent = counts.followersCount;
  }

  if (followsModalUserId) {
    const modalCounts = await getFollowCounts(followsModalUserId);
    const fCountEl = $('followsTabFollowersCount');
    const fgCountEl = $('followsTabFollowingCount');
    if (fCountEl) fCountEl.textContent = `(${modalCounts.followersCount})`;
    if (fgCountEl) fgCountEl.textContent = `(${modalCounts.followingCount})`;
  }
}

let followsModalUserId = null;
let followsModalActiveTab = 'followers';

async function openFollowsModal(userId, initialTab = 'followers') {
  const targetId = userId || S.viewingUserId || me();
  if (!targetId) {
    toast(T('loginToViewFollows'), 'info');
    openAuth('login');
    return;
  }

  followsModalUserId = targetId;
  followsModalActiveTab = initialTab;

  const modal = $('followsModal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('open');

  getFollowCounts(targetId).then((counts) => {
    const fCountEl = $('followsTabFollowersCount');
    const fgCountEl = $('followsTabFollowingCount');
    if (fCountEl) fCountEl.textContent = `(${counts.followersCount})`;
    if (fgCountEl) fgCountEl.textContent = `(${counts.followingCount})`;
  });

  await switchFollowsTab(initialTab);
}

function closeFollowsModal() {
  const modal = $('followsModal');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
  followsModalUserId = null;
}

async function switchFollowsTab(tab) {
  followsModalActiveTab = tab;
  $('followsTabFollowers')?.classList.toggle('active', tab === 'followers');
  $('followsTabFollowing')?.classList.toggle('active', tab === 'following');

  const listEl = $('followsModalList');
  if (!listEl) return;
  listEl.innerHTML = `
    <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-secondary);">
      <i class="ri-loader-4-line spin" style="font-size:2rem; color:var(--amed-green);"></i>
      <div style="margin-top:0.6rem; font-size:0.88rem; font-weight:600;">${T('loadingUsers')}</div>
    </div>
  `;

  try {
    const isFollowers = tab === 'followers';
    const selectQuery = isFollowers
      ? 'created_at, profile:profiles!user_follows_follower_id_fkey(id, username, display_name, avatar_url, role, favorite_player, bio)'
      : 'created_at, profile:profiles!user_follows_following_id_fkey(id, username, display_name, avatar_url, role, favorite_player, bio)';
    const filterCol = isFollowers ? 'following_id' : 'follower_id';

    const { data, error } = await sb
      .from('user_follows')
      .select(selectQuery)
      .eq(filterCol, followsModalUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = (data || []).map((row) => row.profile).filter(Boolean);

    if (users.length === 0) {
      listEl.innerHTML = `
        <div class="follows-empty">
          <i class="${isFollowers ? 'ri-group-line' : 'ri-user-follow-line'}" style="font-size:2.6rem; color:var(--text-muted); opacity:0.6;"></i>
          <div style="font-weight:700; margin-top:0.65rem; color:var(--text-main); font-size:0.95rem;">
            ${isFollowers ? T('noFollowersYet') : T('noFollowingYet')}
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem;">
            ${isFollowers ? T('noFollowersSub') : T('noFollowingSub')}
          </div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = users.map((u) => {
      const isFollowing = S.followingSet.has(u.id);
      const isMe = me() === u.id;
      const isAdmin = u.role === 'admin';
      return `
        <div class="follows-item">
          <div class="follows-item-left" data-action="click-follow-user" data-user-id="${u.id}" style="cursor:pointer;" title="${T('viewProfileTooltip')}">
            <div class="follows-avatar">
              ${avatarHTML(u, 44)}
            </div>
            <div class="follows-info">
              <div class="follows-name-row">
                <span class="follows-display-name">${esc(u.display_name || u.username || 'Amedspor')}</span>
                ${isAdmin ? '<span class="admin-badge"><i class="ri-shield-star-fill"></i> ADMIN</span>' : ''}
              </div>
              <div class="follows-username">@${esc(u.username || 'taraftar')}</div>
              ${u.favorite_player ? `<div class="follows-player"><i class="ri-t-shirt-2-fill"></i> ${esc(u.favorite_player)}</div>` : ''}
            </div>
          </div>
          <div class="follows-item-right">
            ${!isMe && me() ? `
              <button type="button" class="tw-sidebar-follow-btn ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-user-id="${u.id}">
                <span>${isFollowing ? T('followingBtn') : T('followBtn')}</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('switchFollowsTab error:', err);
    listEl.innerHTML = `
      <div class="follows-empty" style="color:var(--amed-red);">
        <i class="ri-error-warning-line" style="font-size:2rem;"></i>
        <div style="margin-top:0.5rem; font-weight:600;">${T('loadListError')}</div>
      </div>
    `;
  }
}

function updateFollowButtons(targetUserId, isFollowing) {
  const buttons = document.querySelectorAll(`[data-action="toggle-follow"][data-user-id="${targetUserId}"]`);
  buttons.forEach((btn) => {
    btn.classList.toggle('following', isFollowing);
    if (btn.classList.contains('tw-follow-quick-btn')) {
      const icon = btn.querySelector('i');
      const text = btn.querySelector('span');
      if (icon) icon.className = isFollowing ? 'ri-user-check-line' : 'ri-user-add-line';
      if (text) text.textContent = isFollowing ? T('followingBtn') : T('followBtn');
      btn.title = isFollowing ? T('unfollowBtn') : T('followBtn');
    } else if (btn.classList.contains('tw-sidebar-follow-btn')) {
      const text = btn.querySelector('span');
      if (text) text.textContent = isFollowing ? T('followingBtn') : T('followBtn');
    } else {
      btn.classList.toggle('c-btn-ghost', isFollowing);
      btn.classList.toggle('c-btn-primary', !isFollowing);
      const icon = btn.querySelector('i');
      const text = btn.querySelector('span');
      if (icon) icon.className = isFollowing ? 'ri-user-unfollow-line' : 'ri-user-follow-line';
      if (text) text.textContent = isFollowing ? T('unfollowBtn') : T('followBtn');
    }
  });
}

async function loadSuggestedUsers() {
  const followListEl = $('twSidebarFollowList') || document.querySelector('.tw-follow-list');
  if (!followListEl) return;

  try {
    const myId = me();
    let query = sb.from('profiles').select('id, username, display_name, avatar_url, favorite_player, role').limit(6);
    if (myId) {
      query = query.neq('id', myId);
    }
    const { data: users, error } = await query;
    if (error || !users || users.length === 0) return;

    followListEl.innerHTML = users.map((u) => {
      const isFollowing = S.followingSet.has(u.id);
      return `
        <div class="tw-follow-item">
          <div class="tw-follow-avatar-wrap" data-action="view-user-profile" data-user-id="${u.id}" style="cursor:pointer;" title="${T('viewProfileTooltip')}">
            ${avatarHTML(u, 40)}
          </div>
          <div class="tw-follow-info" data-action="view-user-profile" data-user-id="${u.id}" style="cursor:pointer;" title="${T('viewProfileTooltip')}">
            <div class="tw-follow-name">
              <span>${esc(u.display_name || u.username)}</span>
              ${u.role === 'admin' ? `<i class="ri-verified-badge-fill verified-badge" title="${T('adminBadgeTitle')}"></i>` : ''}
            </div>
            <div class="tw-follow-handle">@${esc(u.username || 'taraftar')}</div>
          </div>
          <button type="button" class="tw-sidebar-follow-btn ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-user-id="${u.id}">
            <span>${isFollowing ? T('followingBtn') : T('followBtn')}</span>
          </button>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('loadSuggestedUsers error:', err);
  }
}

function openProfile(targetUserId) {
  S.viewingUserId = (targetUserId && targetUserId !== me()) ? targetUserId : null;
  if (typeof window.switchTab === 'function') {
    window.switchTab('profile');
  } else {
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-profile'));
    document.querySelectorAll('#mainNav .nav-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'profile'));
  }
  renderProfilePage(targetUserId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSettings() {
  if (typeof window.switchTab === 'function') {
    window.switchTab('settings');
  } else {
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-settings'));
    document.querySelectorAll('#mainNav .nav-tab').forEach((b) => b.classList.remove('active'));
  }
  renderSettingsPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderProfilePage(targetUserId) {
  const container = $('profilePageContent');
  if (!container) return;

  const targetId = (targetUserId && targetUserId !== me()) ? targetUserId : (S.viewingUserId || me());

  if (!targetId) {
    container.innerHTML = `
      <div class="profile-page-guest card">
        <div class="ppg-icon"><i class="ri-user-3-line"></i></div>
        <h2 class="ppg-title">${T('profile')}</h2>
        <p class="ppg-desc">${T('loginToViewProfileDesc')}</p>
        <button type="button" class="c-btn c-btn-primary" data-action="open-login" style="margin-top:0.5rem;">
          <i class="ri-login-box-line"></i> ${T('login')} / ${T('signup')}
        </button>
      </div>
    `;
    return;
  }

  const isSelf = targetId === me();
  let p = isSelf ? (S.profile || { username: S.session?.user?.email }) : null;

  if (!p) {
    const foundThread = (S.threads || []).find((t) => t.author_id === targetId);
    if (foundThread && foundThread.author) {
      p = foundThread.author;
    } else {
      container.innerHTML = `
        <div class="profile-loading card" style="padding:3rem; text-align:center; color:var(--text-muted);">
          <i class="ri-loader-4-line spin" style="font-size:2rem; color:var(--amed-green);"></i>
          <p style="margin-top:0.75rem;">${T('loadingProfile')}</p>
        </div>
      `;
      try {
        const { data, error } = await sb.from('profiles').select('*').eq('id', targetId).single();
        if (error || !data) {
          container.innerHTML = `
            <div class="card" style="padding:2.5rem; text-align:center;">
              <i class="ri-user-unfollow-line" style="font-size:2.5rem; color:var(--amed-red);"></i>
              <h3 style="margin-top:0.5rem;">${T('userNotFound')}</h3>
              <p style="color:var(--text-muted);">${T('userNotFoundDesc')}</p>
              <button class="c-btn c-btn-primary" data-action="goto-forum" style="margin-top:1rem;">${T('backToFeed')}</button>
            </div>
          `;
          return;
        }
        p = data;
      } catch (e) {
        return;
      }
    }
  }

  let userPosts = (S.threads || []).filter((t) => t.author_id === targetId);
  if (isSelf && S.myThreads && S.myThreads.length) {
    userPosts = S.myThreads;
  }

  const isAdmin = p.role === 'admin';
  const totalLikes = userPosts.reduce((acc, cur) => acc + (cur.like_count || 0), 0);
  const isFollowing = S.followingSet.has(targetId);

  const { followersCount, followingCount } = await getFollowCounts(targetId);

  container.innerHTML = `
    <div class="profile-unified-wrap">
      ${!isSelf ? `
        <div class="profile-back-bar">
          <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="goto-my-profile">
            <i class="ri-arrow-left-line"></i> <span>${T('backToProfile')}</span>
          </button>
        </div>
      ` : ''}

      <!-- TEK BİR BÜTÜNLEŞİK KART: Profil Bilgileri + Gönderiler -->
      <div class="profile-unified-card card">
        <!-- 1. ÜST KISIM: Profil Bilgileri & Başlık (Banner YOK!) -->
        <div class="puc-header">
          <div class="puc-top-row">
            <div class="puc-avatar-box">
              <div class="puc-avatar-img">
                ${avatarHTML(p, 88)}
              </div>
            </div>
            <div class="puc-actions">
              ${isSelf ? `
                <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="goto-settings" title="${T('settings')}">
                  <i class="ri-settings-3-line"></i> <span>${T('settings')}</span>
                </button>
              ` : `
                <button type="button" class="c-btn ${isFollowing ? 'c-btn-ghost' : 'c-btn-primary'} c-btn-sm btn-follow" data-action="toggle-follow" data-user-id="${targetId}">
                  <i class="${isFollowing ? 'ri-user-unfollow-line' : 'ri-user-follow-line'}"></i>
                  <span>${isFollowing ? T('unfollowBtn') : T('followBtn')}</span>
                </button>
              `}
            </div>
          </div>

          <!-- Kimlik Bilgileri -->
          <div class="puc-identity">
            <div class="puc-name-row">
              <h1 class="puc-name">${esc(p.display_name || p.username)}</h1>
              ${isAdmin ? `<span class="admin-badge"><i class="ri-shield-star-fill"></i> ADMIN</span>` : `<span class="fan-badge"><i class="ri-heart-3-fill"></i> ${T('fanBadge')}</span>`}
            </div>
            <div class="puc-handle">@${esc(p.username || '')}</div>

            ${p.favorite_player ? `
              <div class="puc-player-row">
                <span class="puc-player-pill" title="${T('favoritePlayer')}">
                  <i class="ri-t-shirt-2-fill"></i> ${esc(p.favorite_player)}
                </span>
              </div>
            ` : ''}

            ${p.bio ? `<div class="puc-bio">${esc(p.bio)}</div>` : ''}
          </div>

          <!-- İstatistik Şeridi: Gönderi, Takipçi, Takip Edilen, Beğeni -->
          <div class="puc-stats-grid">
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${userPosts.length}</span>
              <span class="puc-stat-lbl">${T('postsWord')}</span>
            </div>
            <div class="puc-stat-cell puc-stat-clickable" data-action="open-follows-modal" data-user-id="${targetId}" data-initial-tab="followers" title="${T('followersTab')}">
              <span class="puc-stat-num" id="pucFollowersCount">${followersCount}</span>
              <span class="puc-stat-lbl">${T('followers')}</span>
            </div>
            <div class="puc-stat-cell puc-stat-clickable" data-action="open-follows-modal" data-user-id="${targetId}" data-initial-tab="following" title="${T('followingTab')}">
              <span class="puc-stat-num" id="pucFollowingCount">${followingCount}</span>
              <span class="puc-stat-lbl">${T('following')}</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${totalLikes}</span>
              <span class="puc-stat-lbl">${T('likes')}</span>
            </div>
          </div>
        </div>

        <!-- 2. AYIRICI ÇİZGİ -->
        <div class="puc-divider"></div>

        <!-- 3. ALT KISIM (AYNI KART İÇİNDE): Kullanıcının Gönderileri -->
        <div class="puc-posts-section">
          <div class="puc-posts-header">
            <div class="puc-tab-item active">
              <i class="ri-chat-1-line"></i>
              <span>${isSelf ? T('myPosts') : T('navPosts')} (${userPosts.length})</span>
            </div>
          </div>
          <div class="puc-posts-stream">
            ${userPosts.length ? userPosts.map((t) => renderUserTweet(t)).join('') : `
              <div class="puc-empty-box">
                <i class="ri-chat-new-line" style="font-size:2.5rem; color:var(--amed-green);"></i>
                <div style="font-weight:700; font-size:1.05rem; margin-top:0.4rem;">${isSelf ? T('profileEmptyPosts') : T('noPostsYetUser')}</div>
                <div style="color:var(--text-secondary); font-size:0.88rem; margin-top:0.2rem;">${isSelf ? T('profileEmptyPostsCta') : ''}</div>
                ${isSelf ? `
                  <button class="c-btn c-btn-primary" style="margin-top:0.8rem;" data-action="goto-forum">
                    <i class="ri-quill-pen-line"></i> ${T('tweetBtn')}
                  </button>
                ` : ''}
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSettingsPage() {
  const container = $('settingsPageContent');
  if (!container) return;

  if (!me()) {
    container.innerHTML = `
      <div class="profile-page-guest card">
        <div class="ppg-icon"><i class="ri-settings-3-line"></i></div>
        <h2 class="ppg-title">${T('settings')}</h2>
        <p class="ppg-desc">${T('loginToViewProfileDesc')}</p>
        <button type="button" class="c-btn c-btn-primary" data-action="open-login" style="margin-top:0.5rem;">
          <i class="ri-login-box-line"></i> ${T('login')} / ${T('signup')}
        </button>
      </div>
    `;
    return;
  }

  const p = S.profile || { username: S.session?.user?.email };
  const isAdmin = p.role === 'admin';
  const notifGoals = localStorage.getItem('amed_notif_goals') !== 'false';
  const notifForum = localStorage.getItem('amed_notif_forum') !== 'false';

  const playerOptions = SQUAD_PLAYERS.map((pl) => `
    <option value="${esc(pl)}" ${p.favorite_player === pl ? 'selected' : ''}>${esc(pl)}</option>
  `).join('');

  container.innerHTML = `
    <div class="settings-page-wrap">
      <!-- Ayarlar Üst Başlık & Profile Dön Butonu -->
      <div class="settings-page-header card">
        <div class="sph-left">
          <h1 class="settings-page-title"><i class="ri-settings-3-line"></i> ${T('settings')}</h1>
          <p class="settings-page-sub">${T('settingsPageSub')}</p>
        </div>
        <div class="sph-right">
          <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="goto-profile">
            <i class="ri-user-3-line"></i> <span>${T('profile')}</span>
          </button>
        </div>
      </div>

      <!-- Düzenli İki Kolonlu Ayarlar Izgarası -->
      <div class="profile-page-grid">
        <!-- SOL KOLON: Profil Fotoğrafı & Kimlik Bilgileri -->
        <div class="profile-page-col main-col">
          <!-- KART 1: Profil Fotoğrafı ve Bilgiler -->
          <div class="settings-section-card">
            <div class="section-card-header">
              <div class="section-card-title"><i class="ri-user-smile-line"></i> ${T('generalTab')}</div>
            </div>

            <form class="c-form" id="formProfileMain" novalidate>
              <input type="hidden" name="avatar_url" id="pageSelectedAvatarInput" value="${esc(p.avatar_url || '')}" />
              
              <!-- Profil Resmi Seçme Alanı -->
              <div class="avatar-upload-area">
                <div class="avatar-preview-wrap" id="pageAvatarPreview">
                  ${avatarHTML(p, 64)}
                </div>
                <div class="avatar-upload-controls">
                  <input type="file" id="pageCustomAvatarFile" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;" />
                  <div class="upload-btn-row">
                    <button type="button" class="c-btn c-btn-ghost" id="pickPageAvatarBtn">
                      <i class="ri-upload-cloud-2-line"></i> <span>${T('uploadCustomAvatar')}</span>
                    </button>
                    ${p.avatar_url ? `
                      <button type="button" class="c-btn c-btn-ghost danger-btn" id="removePageAvatarBtn">
                        <i class="ri-delete-bin-line"></i> ${T('removePhoto')}
                      </button>
                    ` : ''}
                  </div>
                  <div class="upload-hint"><i class="ri-image-line" style="color:var(--amed-green);"></i> PNG, JPG, WEBP (Maks. 8MB)</div>
                </div>
              </div>

              <label class="c-field" style="margin-top:0.4rem;">
                <span>${T('displayName')}</span>
                <input type="text" name="display_name" maxlength="40" value="${esc(p.display_name || '')}" required />
              </label>

              <label class="c-field">
                <span>${T('username')}</span>
                <input type="text" name="username" maxlength="24" value="${esc(p.username || '')}" required />
              </label>

              <label class="c-field">
                <span>${T('bio')}</span>
                <textarea name="bio" rows="3" maxlength="240" placeholder="${T('bioPlaceholder')}">${esc(p.bio || '')}</textarea>
              </label>

              <div class="c-form-msg"></div>
              <button type="submit" class="c-btn c-btn-primary"><i class="ri-save-line"></i> ${T('save')}</button>
            </form>
          </div>
        </div>

        <!-- SAĞ KOLON: Dil, Tercihler, Güvenlik ve Admin -->
        <div class="profile-page-col side-col">
          <!-- KART 2: Dil ve Arayüz -->
          <div class="settings-section-card">
            <div class="section-card-header">
              <div class="section-card-title"><i class="ri-translate-2"></i> ${T('languageSelect')}</div>
            </div>
            <div class="profile-lang-options">
              <button type="button" class="profile-lang-btn ${lang() === 'tr' ? 'active' : ''}" data-action="switch-lang" data-lang="tr">
                <span class="plang-flag">🇹🇷</span> <span>Türkçe</span>
              </button>
              <button type="button" class="profile-lang-btn ${lang() === 'ku' ? 'active' : ''}" data-action="switch-lang" data-lang="ku">
                <span class="plang-flag">☀️</span> <span>Kurdî</span>
              </button>
              <button type="button" class="profile-lang-btn ${lang() === 'en' ? 'active' : ''}" data-action="switch-lang" data-lang="en">
                <span class="plang-flag">🇬🇧</span> <span>English</span>
              </button>
              <button type="button" class="profile-lang-btn ${lang() === 'de' ? 'active' : ''}" data-action="switch-lang" data-lang="de">
                <span class="plang-flag">🇩🇪</span> <span>Deutsch</span>
              </button>
            </div>
          </div>

          <!-- KART 3: Taraftar Tercihleri -->
          <div class="settings-section-card">
            <div class="section-card-header">
              <div class="section-card-title"><i class="ri-football-line"></i> ${T('fanTab')}</div>
            </div>
            <form class="c-form" id="formProfileFan" novalidate>
              <label class="c-field">
                <span>${T('favoritePlayer')}</span>
                <select name="favorite_player">
                  <option value="">${T('selectPlayer')}</option>
                  ${playerOptions}
                </select>
              </label>

              <div class="fan-notif-box">
                <div class="fan-notif-title"><i class="ri-notification-3-line"></i> ${T('notifications')}</div>
                <label class="c-toggle-row">
                  <span>${T('notifGoals')}</span>
                  <input type="checkbox" name="notif_goals" id="pageNotifGoalsInp" ${notifGoals ? 'checked' : ''} />
                </label>
                <label class="c-toggle-row">
                  <span>${T('notifForum')}</span>
                  <input type="checkbox" name="notif_forum" id="pageNotifForumInp" ${notifForum ? 'checked' : ''} />
                </label>
              </div>

              <div class="c-form-msg"></div>
              <button type="submit" class="c-btn c-btn-primary"><i class="ri-check-line"></i> ${T('save')}</button>
            </form>
          </div>

          <!-- KART 4: Güvenlik & Şifre -->
          <div class="settings-section-card">
            <div class="section-card-header">
              <div class="section-card-title"><i class="ri-shield-keyhole-line"></i> ${T('securityTab')}</div>
            </div>
            <form class="c-form" id="formProfileSecurity" novalidate>
              <label class="c-field">
                <span>${T('currentEmail')}</span>
                <input type="text" value="${esc(S.session?.user?.email || '')}" disabled style="opacity:0.75;" />
              </label>
              <label class="c-field">
                <span>${T('changePassword')}</span>
                <input type="password" name="password" minlength="6" autocomplete="new-password" placeholder="${T('newPasswordPlaceholder')}" required />
              </label>
              <div class="c-form-msg"></div>
              <button type="submit" class="c-btn c-btn-primary"><i class="ri-lock-password-line"></i> ${T('changePassword')}</button>
            </form>
          </div>

          <!-- KART 5: Admin Paneli (Sadece Admin) -->
          ${isAdmin ? `
          <div class="settings-section-card admin-card">
            <div class="section-card-header">
              <div class="section-card-title"><i class="ri-shield-star-line" style="color:var(--amed-red);"></i> ${T('adminTab')}</div>
            </div>
            <div class="admin-security-box">
              <div class="admin-security-header"><i class="ri-shield-check-fill"></i> ${T('securityActive')}</div>
              <div class="admin-sec-item"><i class="ri-checkbox-circle-fill"></i> <span>${T('roleSecurityNote')}</span></div>
              <div class="admin-sec-item"><i class="ri-checkbox-circle-fill"></i> <span>${T('rateLimitNote')}</span></div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  initPageAvatarUploader();
  initPageForms();
}

/**
 * Kullanıcının Yüklediği Resmi Kırpmasını ve Ayarlamasını Sağlayan Modal
 */
let currentCropper = null;

function showCropDialog(dataUri, type = 'avatar') {
  return new Promise((resolve, reject) => {
    const modal = $('cropModal');
    const titleEl = $('cropModalTitle');
    const btnConfirm = $('btnCropConfirm');
    const btnCancel = $('btnCancelCrop');
    const btnDismiss = $('btnCropDismiss');
    const btnZoomIn = $('cropBtnZoomIn');
    const btnZoomOut = $('cropBtnZoomOut');
    const btnRotate = $('cropBtnRotate');
    const btnReset = $('cropBtnReset');

    if (!modal) {
      return resolve(dataUri);
    }

    if (titleEl) {
      titleEl.textContent = T('cropTitle');
    }

    if (currentCropper) {
      try { currentCropper.destroy(); } catch (e) {}
      currentCropper = null;
    }

    // Modal içindeki görsel alanını temizle ve sıfırdan oluştur
    const cropContainer = modal.querySelector('.crop-container');
    if (cropContainer) {
      cropContainer.innerHTML = `<img id="cropImageTarget" src="" alt="${T('cropTitle')}" style="display:block; max-width:100%; max-height:100%;" />`;
    }
    const freshImg = $('cropImageTarget');

    // Modalı görünür kıl (opacity ve display)
    modal.style.display = 'flex';
    modal.classList.add('open');

    const onOutsideClick = (e) => {
      if (e.target === modal) {
        cleanup();
        reject(new Error('Kırpma işlemi iptal edildi.'));
      }
    };
    modal.addEventListener('click', onOutsideClick);

    const onEscKey = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        cleanup();
        reject(new Error('Kırpma işlemi iptal edildi.'));
      }
    };
    document.addEventListener('keydown', onEscKey);

    const cleanup = () => {
      modal.removeEventListener('click', onOutsideClick);
      document.removeEventListener('keydown', onEscKey);
      modal.classList.remove('open');
      modal.style.display = 'none';
      if (currentCropper) {
        try { currentCropper.destroy(); } catch (e) {}
        currentCropper = null;
      }
      if (btnConfirm) btnConfirm.onclick = null;
      if (btnCancel) btnCancel.onclick = null;
      if (btnDismiss) btnDismiss.onclick = null;
      if (btnZoomIn) btnZoomIn.onclick = null;
      if (btnZoomOut) btnZoomOut.onclick = null;
      if (btnRotate) btnRotate.onclick = null;
      if (btnReset) btnReset.onclick = null;
    };

    if (btnCancel) {
      btnCancel.onclick = () => {
        cleanup();
        reject(new Error('Kırpma işlemi iptal edildi.'));
      };
    }

    if (btnDismiss) {
      btnDismiss.onclick = () => {
        cleanup();
        reject(new Error('Kırpma işlemi iptal edildi.'));
      };
    }

    if (btnZoomIn) btnZoomIn.onclick = () => currentCropper?.zoom(0.1);
    if (btnZoomOut) btnZoomOut.onclick = () => currentCropper?.zoom(-0.1);
    if (btnRotate) btnRotate.onclick = () => currentCropper?.rotate(90);
    if (btnReset) btnReset.onclick = () => currentCropper?.reset();

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (!currentCropper) {
          cleanup();
          return resolve(dataUri);
        }
        try {
          const canvas = currentCropper.getCroppedCanvas({
            width: type === 'avatar' ? 400 : 1200,
            height: type === 'avatar' ? 400 : 400,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
          });
          const croppedData = canvas ? canvas.toDataURL('image/jpeg', 0.92) : dataUri;
          cleanup();
          resolve(croppedData);
        } catch (e) {
          cleanup();
          resolve(dataUri);
        }
      };
    }

    if (!freshImg) {
      cleanup();
      return resolve(dataUri);
    }

    // Görsel yüklendikten sonra Cropper başlat
    freshImg.onload = () => {
      if (typeof Cropper === 'undefined') {
        cleanup();
        return resolve(dataUri);
      }
      setTimeout(() => {
        try {
          currentCropper = new Cropper(freshImg, {
            aspectRatio: type === 'avatar' ? 1 : (1200 / 400),
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.95,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false
          });
        } catch (cropErr) {
          console.warn('Cropper başlatılamadı, orijinal görsel kullanılıyor:', cropErr);
          cleanup();
          resolve(dataUri);
        }
      }, 50);
    };

    freshImg.onerror = () => {
      cleanup();
      resolve(dataUri);
    };

    freshImg.src = dataUri;
  });
}

/**
 * Resim Yükleme ve Kırpma Fonksiyonu (Online NSFW denetimi arkaplanda sessizce çalışır)
 */
async function uploadImageToHosting(file, type = 'avatar') {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Dosya boyutu çok büyük (Maks. 8MB).');
  }

  // 1. Dosyayı oku
  const rawDataUri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });

  // 2. Kullanıcıya kırpma ve alanı belirleme arayüzü sun
  const dataUri = await showCropDialog(rawDataUri, type);
  if (!dataUri) return null;

  // 3. Online Harici NSFW Kontrolü (Arka planda sessiz denetim)
  try {
    const check = await verifyImageNSFW(dataUri);
    if (check?.isNSFW) {
      throw new Error('NSFW_BLOCKED');
    }
  } catch (nsfwErr) {
    if (nsfwErr.message === 'NSFW_BLOCKED') throw nsfwErr;
    console.warn('NSFW kontrolü atlandı:', nsfwErr);
  }

  // 4. Sunucuya yükle (Profil resmi avatars dizinine gider)
  const uploadRes = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUri, type: type || 'avatar' })
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.url) {
    throw new Error(uploadData.error || 'UPLOAD_FAILED');
  }

  return uploadData.url;
}

function initPageAvatarUploader() {
  const pickBtn = $('pickPageAvatarBtn');
  const fileInput = $('pageCustomAvatarFile');
  const removeBtn = $('removePageAvatarBtn');
  const inp = $('pageSelectedAvatarInput');
  const preview = $('pageAvatarPreview');

  if (removeBtn) {
    removeBtn.addEventListener('click', async () => {
      if (inp) inp.value = '';
      const dummyP = { ...(S.profile || {}), avatar_url: null };
      if (preview) preview.innerHTML = avatarHTML(dummyP, 64);
      removeBtn.style.display = 'none';
      if (me()) {
        try {
          const { data } = await sb.from('profiles').update({ avatar_url: null }).eq('id', me()).select().single();
          if (data) {
            S.profile = data;
            try { localStorage.setItem('amed_cached_user_profile', JSON.stringify(data)); } catch (_) {}
            renderHeaderAuth();
          }
        } catch (_) {}
      }
      toast(T('photoRemovedToast'));
    });
  }

  if (pickBtn && fileInput) {
    pickBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const origHtml = pickBtn.innerHTML;
      try {
        pickBtn.disabled = true;
        pickBtn.innerHTML = `<i class="ri-loader-4-line spin"></i> <span>${T('loading')}</span>`;

        const url = await uploadImageToHosting(file, 'avatar');
        if (url) {
          if (inp) inp.value = url;
          if (preview) {
            preview.innerHTML = `<img class="c-avatar" style="width:64px;height:64px;border:2px solid var(--amed-green);object-fit:cover;" src="${esc(url)}?t=${Date.now()}" alt="Avatar" />`;
          }
          if (removeBtn) removeBtn.style.display = 'inline-flex';

          // Profil fotoğrafını beklemeden otomatik olarak Supabase'e kalıcı olarak kaydet
          if (me()) {
            try {
              const { data, error } = await sb.from('profiles').update({ avatar_url: url }).eq('id', me()).select().single();
              if (!error && data) {
                S.profile = data;
                try { localStorage.setItem('amed_cached_user_profile', JSON.stringify(data)); } catch (_) {}
                renderHeaderAuth();
                toast(T('saved'));
              } else {
                toast(T('photoSelectedToast'));
              }
            } catch (_) {
              toast(T('photoSelectedToast'));
            }
          } else {
            toast(T('photoSelectedToast'));
          }
        }
      } catch (err) {
        if (err.message !== 'Kırpma işlemi iptal edildi.') {
          toast(T('imageUploadFailed'), 'err');
        }
      } finally {
        pickBtn.disabled = false;
        pickBtn.innerHTML = origHtml;
        fileInput.value = '';
      }
    });
  }
}



function initPageForms() {
  const formMain = $('formProfileMain');
  if (formMain) {
    formMain.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleProfileMainForm(formMain);
    });
  }

  const formFan = $('formProfileFan');
  if (formFan) {
    formFan.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(formFan);
      const favorite_player = String(fd.get('favorite_player') || '').trim();
      const notifGoals = $('pageNotifGoalsInp')?.checked ?? true;
      const notifForum = $('pageNotifForumInp')?.checked ?? true;

      localStorage.setItem('amed_notif_goals', String(notifGoals));
      localStorage.setItem('amed_notif_forum', String(notifForum));

      setBusy(formFan, true);
      const { data, error } = await sb.from('profiles').update({ favorite_player: favorite_player || null }).eq('id', me()).select().single();
      setBusy(formFan, false);
      if (error) return formMsg(formFan, errMsg(error));
      S.profile = data;
      renderHeaderAuth();
      toast(T('saved'));
      if (document.getElementById('tab-profile')?.classList.contains('active')) {
        renderProfilePage();
      }
    });
  }

  const formSec = $('formProfileSecurity');
  if (formSec) {
    formSec.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(formSec);
      const password = String(fd.get('password') || '');
      if (password.length < 6) return formMsg(formSec, T('minPassword'));

      setBusy(formSec, true);
      const { error } = await sb.auth.updateUser({ password });
      setBusy(formSec, false);
      if (error) return formMsg(formSec, errMsg(error));
      toast(T('passwordUpdated'));
      formSec.reset();
    });
  }
}

async function handleProfileMainForm(form) {
  const fd = new FormData(form);
  const username = String(fd.get('username') || '').trim();
  const display_name = String(fd.get('display_name') || '').trim() || username;
  const bio = String(fd.get('bio') || '').trim();
  const rawAvatar = String(fd.get('avatar_url') || '').trim();
  const avatar_url = sanitizeAvatarUrl(rawAvatar);
  if (rawAvatar && !avatar_url) {
    return formMsg(form, 'Geçersiz veya güvenlik kurallarına uymayan profil resmi.');
  }

  if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) return formMsg(form, T('invalidUsername'));
  setBusy(form, true);
  const payload = {
    username,
    display_name,
    bio,
    avatar_url: avatar_url || null
  };
  const { data, error } = await sb.from('profiles').update(payload).eq('id', me()).select().single();
  setBusy(form, false);
  if (error) return formMsg(form, errMsg(error));
  S.profile = data;
  renderHeaderAuth();
  toast(T('saved'));
  renderSettingsPage();
  if (document.getElementById('tab-profile')?.classList.contains('active')) {
    renderProfilePage();
  }
}

async function handleProfileFanForm(form) {
  const fd = new FormData(form);
  const favorite_player = String(fd.get('favorite_player') || '').trim();
  const notifGoals = $('notifGoalsInp')?.checked ?? true;
  const notifForum = $('notifForumInp')?.checked ?? true;

  localStorage.setItem('amed_notif_goals', String(notifGoals));
  localStorage.setItem('amed_notif_forum', String(notifForum));

  setBusy(form, true);
  const { data, error } = await sb.from('profiles').update({ favorite_player: favorite_player || null }).eq('id', me()).select().single();
  setBusy(form, false);
  if (error) return formMsg(form, errMsg(error));
  S.profile = data;
  renderHeaderAuth();
  closeDialog();
  toast(T('saved'));
  refreshForum(true);
}

async function handleProfileSecurityForm(form) {
  const fd = new FormData(form);
  const password = String(fd.get('password') || '');
  if (password.length < 6) return formMsg(form, T('minPassword'));

  setBusy(form, true);
  const { error } = await sb.auth.updateUser({ password });
  setBusy(form, false);
  if (error) return formMsg(form, errMsg(error));
  closeDialog();
  toast(T('passwordUpdated'));
}

/* ---------- FORUM: VERİ ---------- */
const THREAD_COLS =
  'id,title,body,reply_count,like_count,created_at,last_activity_at,category_id,author_id,is_pinned,is_locked,author:profiles!forum_threads_author_id_fkey(username,display_name,avatar_url,role,favorite_player)';

async function loadCategories() {
  const { data, error } = await sb.from('forum_categories').select('*').order('sort_order');
  if (!error && data) {
    S.categories = data;
    try {
      localStorage.setItem('amed_cached_cats', JSON.stringify(data));
    } catch (e) {}
    renderCategories();
  }
}

async function loadOfficialClubPosts() {
  if (window.__INITIAL_CLUB_FEED__?.posts && S.officialPosts.length === 0) {
    S.officialPosts = window.__INITIAL_CLUB_FEED__.posts;
  }
  try {
    const res = await fetch('/api/live-club-posts');
    if (res.ok) {
      const data = await res.json();
      S.officialPosts = data.posts || [];
    }
  } catch (err) {
    console.error('Live club posts fetch error:', err);
  }
}

async function loadThreads() {
  const fetchSupabase = async () => {
    let q = sb
      .from('forum_threads')
      .select(THREAD_COLS)
      .order('is_pinned', { ascending: false })
      .order(S.sort === 'popular' ? 'like_count' : 'last_activity_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(S.limit + 1);
    if (S.activeCat !== 'all') q = q.eq('category_id', S.activeCat);
    const term = S.search.replace(/[%_,()]/g, ' ').trim();
    if (term) q = q.ilike('title', `%${term}%`);
    const { data, error } = await q;
    if (error) {
      console.error('Forum threads query error:', error);
      return;
    }
    S.hasMore = data.length > S.limit;
    S.threads = data.slice(0, S.limit);
    try {
      localStorage.setItem('amed_cached_threads', JSON.stringify(S.threads));
    } catch (e) {}
    await loadMyThreadLikes(S.threads.map((t) => t.id));
  };

  const fetchMyPosts = async () => {
    if (!me()) {
      S.myThreads = [];
      return;
    }
    const { data, error } = await sb
      .from('forum_threads')
      .select(THREAD_COLS)
      .eq('author_id', me())
      .order('created_at', { ascending: false });
    if (!error && data) {
      S.myThreads = data;
      await loadMyThreadLikes(data.map((t) => t.id));
    }
  };

  await Promise.all([fetchSupabase(), loadOfficialClubPosts(), fetchMyPosts()]);
}

async function loadMyThreadLikes(ids) {
  if (!me() || !ids.length) return;
  const { data } = await sb.from('forum_thread_likes').select('thread_id').eq('user_id', me()).in('thread_id', ids);
  (data || []).forEach((r) => S.likedThreads.add(r.thread_id));
}

async function loadThread(id) {
  const [{ data: thread, error: tErr }, { data: posts, error: pErr }] = await Promise.all([
    sb.from('forum_threads').select(THREAD_COLS).eq('id', id).maybeSingle(),
    sb
      .from('forum_posts')
      .select('id,body,like_count,created_at,author_id,author:profiles!forum_posts_author_id_fkey(username,display_name,avatar_url,role,favorite_player)')
      .eq('thread_id', id)
      .order('created_at', { ascending: true })
  ]);
  if (tErr) console.error('Forum thread load error:', tErr);
  if (pErr) console.error('Forum posts load error:', pErr);
  if (tErr || !thread) return false;
  S.thread = thread;
  S.posts = posts || [];
  if (me()) {
    const postIds = S.posts.map((p) => p.id);
    const [tl, pl] = await Promise.all([
      sb.from('forum_thread_likes').select('thread_id').eq('user_id', me()).eq('thread_id', id),
      postIds.length
        ? sb.from('forum_post_likes').select('post_id').eq('user_id', me()).in('post_id', postIds)
        : Promise.resolve({ data: [] })
    ]);
    S.likedThreads[tl.data?.length ? 'add' : 'delete'](id);
    (pl.data || []).forEach((r) => S.likedPosts.add(r.post_id));
  }
  return true;
}

/* ---------- FORUM: GÖRÜNÜM ---------- */
function renderCategories() {
  const box = $('forumCategories');
  if (!box) return;
  const items = [{ id: 'all', icon: 'ri-apps-2-line', label: T('allCategories') }].concat(
    S.categories.map((c) => ({ id: c.id, icon: c.icon, label: catName(c) }))
  );
  box.innerHTML = items
    .map(
      (c) => `
      <button class="forum-cat ${String(S.activeCat) === String(c.id) ? 'active' : ''}" data-action="select-cat" data-cat="${c.id}">
        <i class="${esc(c.icon)}"></i><span>${esc(c.label)}</span>
      </button>`
    )
    .join('');
}

function getUserCreatedHashtags() {
  const counts = new Map();
  // 1. Kullanıcıların paylaştığı tüm gönderilerden (threads) gerçek etiketleri tara
  (S.threads || []).forEach((t) => {
    // Hem title hem body içinde aynı etiket geçebilir veya kullanıcı birden fazla kez yazmış olabilir;
    // ancak tek bir gönderideki hashtag sadece 1 gönderi olarak sayılmalıdır.
    const text = `${t.title || ''} ${t.body || ''}`;
    const matches = text.match(/#[\p{L}\p{N}_]+/gu);
    if (matches) {
      const uniqueTagsInThread = new Set();
      matches.forEach((tag) => {
        const norm = tag.trim();
        if (norm.length > 1) {
          uniqueTagsInThread.add(norm);
        }
      });
      uniqueTagsInThread.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });

  // 2. Kullanıcıların gönderi yanıtlarındaki (posts) gerçek etiketleri de dahil et
  (S.posts || []).forEach((p) => {
    const text = p.body || '';
    const matches = text.match(/#[\p{L}\p{N}_]+/gu);
    if (matches) {
      const uniqueTagsInPost = new Set();
      matches.forEach((tag) => {
        const norm = tag.trim();
        if (norm.length > 1) {
          uniqueTagsInPost.add(norm);
        }
      });
      uniqueTagsInPost.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    }
  });

  // Kullanıcıların en çok kullandığı etiketleri kullanım sıklığına göre sırala
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  // Kesinlikle hiçbir local/sabit etiket eklenmez. Yalnızca kullanıcıların kendi oluşturduğu etiketler yer alır!
  return sorted;
}

function updateDynamicTags() {
  const userHashtags = getUserCreatedHashtags();
  
  // 1. Tweet Gönderim Alanı altındaki etiketler
  const quickRow = $('twQuickTagsRow');
  if (quickRow) {
    if (userHashtags.length === 0) {
      quickRow.style.display = 'none';
      quickRow.innerHTML = '';
    } else {
      quickRow.style.display = 'flex';
      quickRow.innerHTML = `
        <span class="tw-tags-label" title="Kullanıcı Etiketleri"><i class="ri-fire-line" style="color: var(--amed-red);"></i> Trend:</span>
        ${userHashtags.slice(0, 6).map(({ tag }) => `
          <button type="button" class="tw-tag-pill" data-action="insert-tag" data-tag="${esc(tag)}">${esc(tag)}</button>
        `).join('')}
      `;
    }
  }

  // 2. Sağ Yan Panel "Gündemdekiler" Alanı (#twSidebarTrendsList)
  const sidebarList = $('twSidebarTrendsList');
  if (sidebarList) {
    if (userHashtags.length === 0) {
      sidebarList.innerHTML = `
        <div class="tw-trend-empty" style="padding:1.25rem 1rem; color:var(--text-muted); font-size:0.85rem; text-align:center;">
          <i class="ri-hashtag" style="font-size:1.4rem; display:block; margin-bottom:0.35rem; color:var(--amed-green);"></i>
          ${T('noTrendsYet')}
        </div>
      `;
    } else {
      sidebarList.innerHTML = userHashtags.slice(0, 8).map(({ tag, count }) => `
        <div class="tw-trend-item" data-action="insert-tag" data-tag="${esc(tag)}" title="${esc(tag)}">
          <div class="tw-trend-meta">${T('userTrending')}</div>
          <div class="tw-trend-tag">${esc(tag)}</div>
          <div class="tw-trend-count" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${count} ${T('postsWord').toLowerCase()}</div>
        </div>
      `).join('');
    }
  }
}

function renderListShell() {
  const main = $('forumMain');
  if (!main) return;
  const p = S.profile || {};
  const isLogged = !!me();

  const userHashtags = getUserCreatedHashtags();
  const tagsRowHTML = `
    <div class="tw-quick-tags-row" id="twQuickTagsRow" style="${userHashtags.length === 0 ? 'display:none;' : ''}">
      ${userHashtags.length ? `
        <span class="tw-tags-label" title="${T('userTrending')}"><i class="ri-fire-line" style="color: var(--amed-red);"></i> Trend:</span>
        ${userHashtags.slice(0, 6).map(({ tag }) => `
          <button type="button" class="tw-tag-pill" data-action="insert-tag" data-tag="${esc(tag)}">${esc(tag)}</button>
        `).join('')}
      ` : ''}
    </div>
  `;

  const composerHTML = isLogged
    ? `
    <div class="tw-composer card">
      <form class="tw-composer-form" data-form="quick-thread">
        <div class="tw-composer-row">
          ${avatarHTML(p, 46)}
          <div class="tw-composer-main">
            <textarea id="quickPostInput" rows="3" maxlength="280" placeholder="${T('composerPlaceholder')}"></textarea>
            
            <!-- Açılır Hashtag Çekmecesi -->
            <div id="composerHashtagBar" class="composer-pop-drawer" style="display:none;">
              <div class="composer-drawer-title"><i class="ri-hashtag"></i> ${T('popularTags')}</div>
              <div class="composer-tag-pills-row">
                ${['#Amedspor', '#DirenAmedspor', '#ŞampiyonAmed', '#Diyarbakır', '#HedefSüperLig', '#YeşilKırmızı', '#Barikat', '#MorAmed', '#BizAmediz', '#AmedsporSevdası'].map(tag => `<button type="button" class="composer-tag-chip" data-action="insert-tag" data-tag="${tag}">${tag}</button>`).join('')}
              </div>
            </div>

            <!-- Görsel Önizleme Alanı -->
            <div id="composerMediaPreview" class="composer-media-preview" style="display:none;"></div>

            ${tagsRowHTML}
            <div class="tw-composer-bar">
              <div class="tw-composer-tools">
                <label for="twComposerImgFile" class="tw-tool-btn" id="composerImgBtn" title="${T('addImage')}" role="button" tabindex="0">
                  <i class="ri-image-line"></i>
                  <input type="file" id="twComposerImgFile" accept="image/png,image/jpeg,image/webp,image/gif" style="position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; z-index:-1;" />
                </label>
                <button type="button" class="tw-tool-btn" id="composerHashtagBtn" data-action="toggle-composer-tags" title="Hashtag"><i class="ri-hashtag"></i></button>
                <span class="tw-char-counter" id="quickPostCount">0 / 280</span>
              </div>
              <button type="submit" class="tw-tweet-btn" id="quickPostSubmitBtn">
                <span>${T('tweetBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>`
    : `
    <div class="tw-guest-card card">
      <div class="tw-guest-left">
        <i class="ri-chat-3-line"></i>
        <div>
          <div class="tw-guest-title">${T('guestBannerTitle')}</div>
          <div class="tw-guest-sub">${T('guestBannerSub')}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <button class="tw-tweet-btn" data-action="open-login"><i class="ri-login-circle-line"></i> ${T('login')}</button>
      </div>
    </div>`;

  main.innerHTML = `
    ${composerHTML}
    <div class="tw-new-posts-bubble-wrap" id="twNewPostsWrap" style="${S.pendingNewPosts > 0 ? 'display:flex;' : 'display:none;'}">
      <button type="button" class="tw-new-posts-btn" data-action="load-new-posts" id="btnLoadNewPosts">
        <span class="tw-new-posts-circle-pulse">
          <i class="ri-arrow-up-line"></i>
        </span>
        <span class="tw-new-posts-txt" id="twNewPostsCountText">
          ${S.pendingNewPosts > 0 ? `<span class="tw-new-posts-pill-count">${S.pendingNewPosts}</span> ${T('newPostsAvailable')}` : T('newPostsAvailable')}
        </span>
      </button>
    </div>
    <div class="tw-tweets-stream" id="threadList">
      <div class="card forum-empty"><i class="ri-loader-4-line spin"></i> ${T('loading')}</div>
    </div>`;
}

function renderOfficialPost(p) {
  return `
    <article class="tweet-card official-club-card" id="official-${esc(p.id)}">
      <div class="tweet-layout">
        <div class="tweet-avatar-col">
          <img class="c-avatar" style="width:44px;height:44px" src="${esc(p.author.avatar)}" alt="${esc(p.author.name)}" />
        </div>
        <div class="tweet-body-col">
          <div class="tweet-header">
            <div class="tweet-user-meta">
              <span class="tweet-display-name">${esc(p.author.name)}</span>
              <i class="ri-verified-badge-fill tw-verified-badge official" title="Resmi Amedspor Hesabı"></i>
              <span class="official-club-badge"><i class="${p.platform === 'announcement' ? 'ri-megaphone-line' : 'ri-newspaper-line'}"></i> ${esc(p.badge || 'Resmi')}</span>
              <span class="tweet-handle">${esc(p.author.handle)}</span>
              <span class="tweet-separator">·</span>
              <span class="tweet-time">${esc(p.createdAt)}</span>
            </div>
          </div>

          <div class="tweet-text official-text">
            ${formatPostContent(p.content)}
          </div>

          ${p.media?.url ? `
            <div class="tweet-media-wrap">
              <img src="${esc(p.media.url)}" alt="Amedspor Medya" loading="lazy" />
            </div>
          ` : ''}

          <div class="tweet-actions-bar official-actions-bar">
            <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="tw-btn official-link-btn">
              <i class="ri-external-link-line"></i> <span>${T('officialReadMore')}</span>
            </a>
            <button class="tw-btn share" data-action="copy-link" data-url="${esc(p.url)}" title="${T('share')}">
              <i class="ri-share-line"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderUserTweet(t) {
  const author = t.author || {};
  const isAuthorAdmin = author.role === 'admin';
  const isAdminUser = S.profile?.role === 'admin';
  const canDelete = t.author_id === me() || isAdminUser;
  const isSelf = t.author_id && t.author_id === me();
  const isFollowing = t.author_id ? S.followingSet.has(t.author_id) : false;
  const excerpt = t.body;

  return `
    <article class="tweet-card ${t.is_pinned ? 'is-pinned' : ''}" id="thread-${t.id}">
      <div class="tweet-layout">
        <div class="tweet-avatar-col" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;" title="${T('viewProfileTooltip')}">
          ${avatarHTML(author, 44)}
        </div>
        <div class="tweet-body-col">
          <div class="tweet-header">
            <div class="tweet-user-meta">
              <span class="tweet-display-name" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;" title="${T('viewProfileTooltip')}">${esc(author.display_name || author.username || 'Amedspor')}</span>
              ${isAuthorAdmin ? `<i class="ri-verified-badge-fill tw-verified-badge" title="${T('adminBadgeTitle')}"></i><span class="admin-badge">ADMIN</span>` : ''}
              ${author.favorite_player ? `<span class="fav-player-chip"><i class="ri-t-shirt-2-line"></i> ${esc(author.favorite_player)}</span>` : ''}
              <span class="tweet-handle" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;">@${esc(author.username || 'fan')}</span>
              <span class="tweet-separator">·</span>
              <span class="tweet-time">${ago(t.created_at)}</span>
              ${t.is_pinned ? `<span class="badge-pinned"><i class="ri-pushpin-2-fill"></i> ${T('pinned')}</span>` : ''}
              ${t.is_locked ? `<span class="badge-locked"><i class="ri-lock-2-fill"></i> ${T('locked')}</span>` : ''}
            </div>

            <div class="tweet-menu-actions">
              ${(!isSelf && t.author_id) ? `
                <button type="button" class="tw-follow-quick-btn ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-user-id="${t.author_id}" title="${isFollowing ? T('unfollowBtn') : T('followBtn')}">
                  <i class="${isFollowing ? 'ri-user-check-line' : 'ri-user-add-line'}"></i>
                  <span>${isFollowing ? T('followingBtn') : T('followBtn')}</span>
                </button>
              ` : ''}
              ${isAdminUser ? `
                <button class="tw-action-icon ${t.is_pinned ? 'active' : ''}" data-action="toggle-pin" data-id="${t.id}" title="${t.is_pinned ? T('unpin') : T('pin')}">
                  <i class="${t.is_pinned ? 'ri-pushpin-2-fill' : 'ri-pushpin-2-line'}"></i>
                </button>
                <button class="tw-action-icon ${t.is_locked ? 'active' : ''}" data-action="toggle-lock" data-id="${t.id}" title="${t.is_locked ? T('unlock') : T('lock')}">
                  <i class="${t.is_locked ? 'ri-lock-2-fill' : 'ri-lock-2-line'}"></i>
                </button>
              ` : ''}
              ${canDelete ? `<button class="tw-action-icon danger" data-action="delete-thread" data-id="${t.id}" title="${T('del')}"><i class="ri-delete-bin-6-line"></i></button>` : ''}
            </div>
          </div>

          <div class="tweet-text" data-action="open-thread" data-id="${t.id}">
            ${formatPostContent(excerpt)}
          </div>

          <div class="tweet-actions-bar">
            <button class="tw-btn reply" data-action="open-thread" data-id="${t.id}" title="${T('replyBtn')}">
              <i class="ri-chat-1-line"></i> <span>${t.reply_count || 0}</span>
            </button>
            <button class="tw-btn repost" data-action="share-thread" data-id="${t.id}" title="${T('share')}">
              <i class="ri-repeat-line"></i>
            </button>
            <button class="tw-btn like ${S.likedThreads.has(t.id) ? 'liked' : ''}" data-action="like-thread" data-id="${t.id}" title="${T('like')}">
              <i class="${S.likedThreads.has(t.id) ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i> <span>${t.like_count || 0}</span>
            </button>
            <button class="tw-btn share" data-action="share-thread" data-id="${t.id}" title="${T('share')}">
              <i class="ri-share-line"></i>
            </button>
          </div>
        </div>
      </div>
    </article>`;
}

async function renderThreadList() {
  const list = $('threadList');
  if (!list) return;

  // 1. Profil Akışı (Kullanıcının Gönderileri & Profil Özeti - TEK BİR KUTU İÇİNDE)
  if (S.streamMode === 'profile') {
    if (!me()) {
      list.innerHTML = `
        <div class="card profile-guest-card">
          <div class="pg-icon"><i class="ri-user-follow-line"></i></div>
          <div class="pg-title">${T('loginToViewProfile')}</div>
          <div class="pg-desc">${T('loginToViewProfileDesc')}</div>
          <button class="c-btn c-btn-primary" data-action="open-login" style="margin-top:0.4rem;">
            <i class="ri-login-box-line"></i> ${T('login')}
          </button>
        </div>
      `;
      return;
    }

    const p = S.profile || { username: S.session?.user?.email };
    const isAdmin = p.role === 'admin';
    const myPosts = (S.myThreads && S.myThreads.length)
      ? S.myThreads
      : (S.threads || []).filter((t) => t.author_id === me());
    const totalLikes = myPosts.reduce((acc, cur) => acc + (cur.like_count || 0), 0);
    const { followersCount, followingCount } = await getFollowCounts(me());

    list.innerHTML = `
      <div class="profile-unified-card card">
        <div class="puc-header">
          <div class="puc-top-row">
            <div class="puc-avatar-box">
              <div class="puc-avatar-img">
                ${avatarHTML(p, 80)}
              </div>
            </div>
            <div class="puc-actions">
              <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="goto-settings" title="${T('settings')}">
                <i class="ri-settings-3-line"></i> <span>${T('settings')}</span>
              </button>
            </div>
          </div>
          <div class="puc-identity">
            <div class="puc-name-row">
              <h1 class="puc-name">${esc(p.display_name || p.username)}</h1>
              ${isAdmin ? `<span class="admin-badge"><i class="ri-shield-star-fill"></i> ADMIN</span>` : `<span class="fan-badge"><i class="ri-heart-3-fill"></i> ${T('fanBadge')}</span>`}
            </div>
            <div class="puc-handle">@${esc(p.username || '')}</div>
            ${p.favorite_player ? `
              <div class="puc-player-row">
                <span class="puc-player-pill" title="${T('favoritePlayer')}">
                  <i class="ri-t-shirt-2-fill"></i> ${esc(p.favorite_player)}
                </span>
              </div>
            ` : ''}
            ${p.bio ? `<div class="puc-bio">${esc(p.bio)}</div>` : ''}
          </div>
          <div class="puc-stats-grid">
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${myPosts.length}</span>
              <span class="puc-stat-lbl">${T('postsWord')}</span>
            </div>
            <div class="puc-stat-cell puc-stat-clickable" data-action="open-follows-modal" data-user-id="${me()}" data-initial-tab="followers" title="${T('followersTab')}">
              <span class="puc-stat-num" id="pucFollowersCount">${followersCount}</span>
              <span class="puc-stat-lbl">${T('followers')}</span>
            </div>
            <div class="puc-stat-cell puc-stat-clickable" data-action="open-follows-modal" data-user-id="${me()}" data-initial-tab="following" title="${T('followingTab')}">
              <span class="puc-stat-num" id="pucFollowingCount">${followingCount}</span>
              <span class="puc-stat-lbl">${T('following')}</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${totalLikes}</span>
              <span class="puc-stat-lbl">${T('likes')}</span>
            </div>
          </div>
        </div>
        <div class="puc-divider"></div>
        <div class="puc-posts-section">
          <div class="puc-posts-header">
            <div class="puc-tab-item active">
              <i class="ri-chat-1-line"></i> <span>${T('myPosts')} (${myPosts.length})</span>
            </div>
          </div>
          <div class="puc-posts-stream">
            ${myPosts.length ? myPosts.map((t) => renderUserTweet(t)).join('') : `
              <div class="puc-empty-box">
                <i class="ri-chat-new-line" style="font-size:2.5rem; color:var(--amed-green);"></i>
                <div style="font-weight:700; font-size:1.05rem; margin-top:0.4rem;">${T('profileEmptyPosts')}</div>
                <div style="color:var(--text-secondary); font-size:0.88rem; margin-top:0.2rem;">${T('profileEmptyPostsCta')}</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 2. Tümü: Canlı Taraftar Gönderileri (Takım anonsları ve uydurulmuş veriler kaldırıldı)
  const userSlice = S.threads || [];

  if (!userSlice.length) {
    list.innerHTML = `<div class="card forum-empty"><i class="ri-chat-smile-2-line"></i><div>${T('noPosts')}</div></div>`;
    return;
  }

  const userHTML = userSlice.map((t) => renderUserTweet(t)).join('');
  list.innerHTML =
    userHTML +
    (S.hasMore
      ? `<div class="thread-more"><button class="c-btn c-btn-ghost c-btn-sm" data-action="load-more"><i class="ri-arrow-down-line"></i> ${T('loadMore')}</button></div>`
      : '');
  updateDynamicTags();
}

function renderThreadShell() {
  const main = $('forumMain');
  main.innerHTML = `
    <div class="tw-thread-topbar card">
      <button class="tw-back-btn" data-action="back"><i class="ri-arrow-left-line"></i> <span>${T('backToTimeline')}</span></button>
    </div>
    <article class="tweet-detail card" id="threadHead"></article>
    <div class="tw-reply-composer card" id="threadComposer"></div>
    <div class="tw-replies-list" id="threadPosts"></div>`;
  renderThreadHead();
  renderPosts();
  renderComposer();
}

function likeBtn(kind, id, count, liked) {
  return `<button class="tw-btn like ${liked ? 'liked' : ''}" data-action="like-${kind}" data-id="${id}">
    <i class="${liked ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i> <span>${count}</span></button>`;
}

function renderThreadHead() {
  const box = $('threadHead');
  const t = S.thread;
  if (!box || !t) return;
  const author = t.author || {};
  const isAdminUser = S.profile?.role === 'admin';
  const isAuthorAdmin = author.role === 'admin';
  const canDelete = t.author_id === me() || isAdminUser;

  box.innerHTML = `
    <div class="tweet-layout">
      <div class="tweet-avatar-col">
        ${avatarHTML(author, 48)}
      </div>
      <div class="tweet-body-col">
        <div class="tweet-header">
          <div class="tweet-user-meta">
            <span class="tweet-display-name">${esc(author.display_name || author.username || 'Amedsporlu')}</span>
            ${isAuthorAdmin ? `<i class="ri-verified-badge-fill tw-verified-badge" title="Yönetici"></i><span class="admin-badge">ADMIN</span>` : ''}
            ${author.favorite_player ? `<span class="fav-player-chip"><i class="ri-t-shirt-2-line"></i> ${esc(author.favorite_player)}</span>` : ''}
            <div class="tweet-handle">@${esc(author.username || 'fan')}</div>
          </div>
          <div class="tweet-menu-actions">
            ${isAdminUser ? `
              <button class="tw-action-icon ${t.is_pinned ? 'active' : ''}" data-action="toggle-pin" data-id="${t.id}" title="${t.is_pinned ? T('unpin') : T('pin')}">
                <i class="${t.is_pinned ? 'ri-pushpin-2-fill' : 'ri-pushpin-2-line'}"></i>
              </button>
              <button class="tw-action-icon ${t.is_locked ? 'active' : ''}" data-action="toggle-lock" data-id="${t.id}" title="${t.is_locked ? T('unlock') : T('lock')}">
                <i class="${t.is_locked ? 'ri-lock-2-fill' : 'ri-lock-2-line'}"></i>
              </button>
            ` : ''}
            ${canDelete ? `<button class="tw-action-icon danger" data-action="delete-thread" data-id="${t.id}" title="${T('del')}"><i class="ri-delete-bin-6-line"></i></button>` : ''}
          </div>
        </div>

        <div class="tweet-detail-text">
          ${formatPostContent(t.body)}
        </div>

        <div class="tweet-detail-timestamp">
          ${new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${new Date(t.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        <div class="tweet-detail-metrics">
          <span><strong>${t.like_count || 0}</strong> ${T('likes')}</span>
          <span><strong>${t.reply_count || 0}</strong> ${T('replies')}</span>
        </div>

        <div class="tweet-actions-bar detail">
          <button class="tw-btn reply" data-action="focus-reply"><i class="ri-chat-1-line"></i></button>
          <button class="tw-btn repost" data-action="share-thread" data-id="${t.id}"><i class="ri-repeat-line"></i></button>
          <button class="tw-btn like ${S.likedThreads.has(t.id) ? 'liked' : ''}" data-action="like-thread" data-id="${t.id}">
            <i class="${S.likedThreads.has(t.id) ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i>
          </button>
          <button class="tw-btn share" data-action="share-thread" data-id="${t.id}">
            <i class="ri-share-line"></i>
          </button>
        </div>
      </div>
    </div>`;
}

function renderPosts() {
  const box = $('threadPosts');
  if (!box) return;
  if (!S.posts.length) {
    box.innerHTML = `<div class="card forum-empty small"><i class="ri-chat-1-line"></i><div>${T('noReplies')}</div></div>`;
    return;
  }
  const isAdminUser = S.profile?.role === 'admin';
  box.innerHTML = S.posts
    .map((p) => {
      const a = p.author || {};
      const isPostAdmin = a.role === 'admin';
      const canDeletePost = p.author_id === me() || isAdminUser;
      return `
      <div class="tweet-reply-item card" id="post-${p.id}">
        <div class="tweet-layout">
          <div class="tweet-avatar-col">
            ${avatarHTML(a, 38)}
          </div>
          <div class="tweet-body-col">
            <div class="tweet-header">
              <div class="tweet-user-meta">
                <span class="tweet-display-name">${esc(a.display_name || a.username || 'Amedsporlu')}</span>
                ${isPostAdmin ? `<i class="ri-verified-badge-fill tw-verified-badge"></i><span class="admin-badge">ADMIN</span>` : ''}
                ${a.favorite_player ? `<span class="fav-player-chip"><i class="ri-t-shirt-2-line"></i> ${esc(a.favorite_player)}</span>` : ''}
                <span class="tweet-handle">@${esc(a.username || 'fan')}</span>
                <span class="tweet-separator">·</span>
                <span class="tweet-time">${ago(p.created_at)}</span>
              </div>
              ${canDeletePost ? `<button class="tw-action-icon danger" data-action="delete-post" data-id="${p.id}" title="${T('del')}"><i class="ri-delete-bin-6-line"></i></button>` : ''}
            </div>
            <div class="tweet-text">${formatPostContent(p.body)}</div>
            <div class="tweet-actions-bar reply-row">
              <button class="tw-btn like ${S.likedPosts.has(p.id) ? 'liked' : ''}" data-action="like-post" data-id="${p.id}">
                <i class="${S.likedPosts.has(p.id) ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i> <span>${p.like_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join('');
}

function renderComposer() {
  const box = $('threadComposer');
  if (!box) return;
  const prev = $('replyInput')?.value || '';
  if (!me()) {
    box.innerHTML = `<button class="tw-tweet-btn" data-action="open-login" style="margin:0 auto; display:block;"><i class="ri-login-circle-line"></i> ${T('loginToPost')}</button>`;
    return;
  }
  if (S.thread?.is_locked && S.profile?.role !== 'admin') {
    box.innerHTML = `<div class="thread-locked-banner"><i class="ri-lock-2-line"></i> ${T('threadLocked')}</div>`;
    return;
  }
  box.innerHTML = `
    <form class="tw-reply-form" data-form="reply">
      <div class="tweet-layout">
        <div class="tweet-avatar-col">
          ${avatarHTML(S.profile || {}, 38)}
        </div>
        <div class="tweet-body-col">
          <textarea id="replyInput" name="body" rows="2" maxlength="1000" placeholder="${T('replyPlaceholder')}" required>${esc(prev)}</textarea>
          <div class="tw-reply-footer">
            <span class="tw-hint">Ctrl + Enter</span>
            <button type="submit" class="tw-tweet-btn"><i class="ri-send-plane-2-line"></i> ${T('replyBtn')}</button>
          </div>
        </div>
      </div>
    </form>`;
}

function renderForum() {
  applyStaticLabels();
  renderCategories();
  if (S.view === 'thread' && S.thread) {
    renderThreadShell();
  } else {
    const keepFocus = document.activeElement?.id === 'forumSearch';
    renderListShell();
    renderThreadList();
    if (keepFocus) {
      const inp = $('forumSearch');
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }
}

/* ---------- FORUM: AKSİYONLAR ---------- */
async function showList() {
  hideNewPostsNotice();
  S.view = 'list';
  S.thread = null;
  if (location.hash.startsWith('#forum/')) history.replaceState(null, '', location.pathname);
  renderForum();
  await loadThreads();
  renderThreadList();
}

async function openThread(id) {
  S.view = 'thread';
  $('forumMain').innerHTML = `<div class="card forum-empty"><i class="ri-loader-4-line spin"></i> ${T('loading')}</div>`;
  const ok = await loadThread(id);
  if (!ok) return showList();
  history.replaceState(null, '', `#forum/${id}`);
  renderForum();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNewThread() {
  if (!requireLogin()) return;
  const defaultCat = S.activeCat !== 'all' ? S.activeCat : S.categories[0]?.id;
  openDialog(
    `<h3 class="c-dialog-title"><i class="ri-quill-pen-line"></i> ${T('newThread')}</h3>
     <form class="c-form" data-form="thread" novalidate>
       <label class="c-field"><span>${T('category')}</span>
         <select name="category_id">${S.categories
           .map((c) => `<option value="${c.id}" ${c.id === defaultCat ? 'selected' : ''}>${esc(catName(c))}</option>`)
           .join('')}</select>
       </label>
       <label class="c-field"><span>${T('title')}</span><input type="text" name="title" maxlength="140" required /></label>
       <label class="c-field"><span>${T('body')}</span><textarea name="body" rows="7" maxlength="8000" required></textarea></label>
       <div class="c-form-msg"></div>
       <div class="c-form-actions">
         <button type="button" class="c-btn c-btn-ghost" data-action="close-dialog">${T('cancel')}</button>
         <button type="submit" class="c-btn c-btn-primary"><i class="ri-send-plane-2-line"></i> ${T('publish')}</button>
       </div>
     </form>`,
    'c-dialog-wide'
  );
}

function checkSpamRules(body) {
  const clean = String(body || '').trim();
  // 1. Karakter tekrarı (Örn: aaaaaaaaaaaaaaaa...)
  if (/([a-zA-Z0-9ğüşıöçĞÜŞİÖÇ.!?])\1{14,}/.test(clean)) {
    return T('repeatedCharError');
  }
  // 2. Çoklu link (URL Flood)
  const links = clean.match(/https?:\/\//gi);
  if (links && links.length > 3) {
    return T('linkLimitError');
  }
  return null;
}

let isSubmittingThread = false;
let isSubmittingReply = false;

async function handleThreadForm(form) {
  if (!requireLogin()) return;
  if (isSubmittingThread) return;
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  const body = String(fd.get('body') || '').trim();
  const category_id = Number(fd.get('category_id'));
  if (title.length < 4) return formMsg(form, T('titleTooShort'));
  if (!body) return formMsg(form, T('errorGeneric'));
  if (body.length > 280) return formMsg(form, T('postMax280'));

  const spamErr = checkSpamRules(body);
  if (spamErr) return formMsg(form, spamErr);
  if (S.lastThreadBody && S.lastThreadBody === body.toLowerCase().trim() && (Date.now() - S.lastThreadTime < 10 * 60 * 1000)) {
    return formMsg(form, T('duplicatePostError'));
  }

  isSubmittingThread = true;
  setBusy(form, true);
  try {
    const { data, error } = await sb.from('forum_threads').insert({
      title,
      body,
      category_id,
      author_id: me()
    }).select('id').single();
    if (error) throw error;

    S.lastThreadBody = body.toLowerCase().trim();
    S.lastThreadTime = Date.now();
    closeDialog();
    toast(T('threadCreated'));
    openThread(data.id);
  } catch (err) {
    formMsg(form, errMsg(err));
  } finally {
    isSubmittingThread = false;
    setBusy(form, false);
  }
}

async function handleReplyForm(form) {
  if (!requireLogin()) return;
  if (isSubmittingReply) return;
  if (S.thread?.is_locked && S.profile?.role !== 'admin') {
    return toast(T('threadLocked'), 'err');
  }
  const input = form.querySelector('textarea');
  const body = input.value.trim();
  if (!body || !S.thread) return;
  if (body.length > 280) return toast(T('replyMax280'), 'err');

  const spamErr = checkSpamRules(body);
  if (spamErr) return toast(spamErr, 'err');
  if (S.lastReplyBody && S.lastReplyBody === body.toLowerCase().trim() && (Date.now() - S.lastReplyTime < 10 * 60 * 1000)) {
    return toast(T('duplicatePostError'), 'err');
  }

  isSubmittingReply = true;
  setBusy(form, true);
  try {
    const { error } = await sb.from('forum_posts').insert({
      thread_id: S.thread.id,
      body,
      author_id: me()
    });
    if (error) throw error;

    S.lastReplyBody = body.toLowerCase().trim();
    S.lastReplyTime = Date.now();
    input.value = '';
    toast(T('replySent'));
    await loadThread(S.thread.id);
    renderThreadHead();
    renderPosts();
    renderComposer();
    const last = S.posts[S.posts.length - 1];
    if (last) $(`post-${last.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    toast(errMsg(err), 'err');
  } finally {
    isSubmittingReply = false;
    setBusy(form, false);
  }
}

async function togglePinThread(id) {
  if (S.profile?.role !== 'admin') return;
  const t = S.thread?.id === id ? S.thread : S.threads.find((x) => x.id === id);
  if (!t) return;
  const nextPinned = !t.is_pinned;
  const { error } = await sb.from('forum_threads').update({ is_pinned: nextPinned }).eq('id', id);
  if (error) return toast(errMsg(error), 'err');
  t.is_pinned = nextPinned;
  await logAdminAction(nextPinned ? 'pin' : 'unpin', 'forum_thread', id);
  toast(nextPinned ? T('pinned') : T('unpinned'));
  if (S.view === 'thread' && S.thread?.id === id) {
    renderThreadHead();
  } else {
    await loadThreads();
    renderThreadList();
  }
}

async function toggleLockThread(id) {
  if (S.profile?.role !== 'admin') return;
  const t = S.thread?.id === id ? S.thread : S.threads.find((x) => x.id === id);
  if (!t) return;
  const nextLocked = !t.is_locked;
  const { error } = await sb.from('forum_threads').update({ is_locked: nextLocked }).eq('id', id);
  if (error) return toast(errMsg(error), 'err');
  t.is_locked = nextLocked;
  await logAdminAction(nextLocked ? 'lock' : 'unlock', 'forum_thread', id);
  toast(nextLocked ? T('locked') : T('unlocked'));
  if (S.view === 'thread' && S.thread?.id === id) {
    renderThreadHead();
    renderComposer();
  } else {
    await loadThreads();
    renderThreadList();
  }
}

async function toggleLike(kind, id) {
  if (!requireLogin()) return;
  const isThread = kind === 'thread';
  const set = isThread ? S.likedThreads : S.likedPosts;
  const table = isThread ? 'forum_thread_likes' : 'forum_post_likes';
  const col = isThread ? 'thread_id' : 'post_id';
  const target = isThread ? (S.thread?.id === id ? S.thread : S.threads.find((t) => t.id === id)) : S.posts.find((p) => p.id === id);
  const liked = set.has(id);

  // İyimser güncelleme
  liked ? set.delete(id) : set.add(id);
  if (target) target.like_count += liked ? -1 : 1;
  const reRender = () => {
    if (isThread) {
      if (S.view === 'thread' && S.thread?.id === id) renderThreadHead();
      else renderThreadList();
    } else {
      renderPosts();
    }
  };
  reRender();

  const { error } = liked
    ? await sb.from(table).delete().eq(col, id).eq('user_id', me())
    : await sb.from(table).insert({ [col]: id });
  if (error && error.code !== '23505') {
    liked ? set.add(id) : set.delete(id);
    if (target) target.like_count += liked ? 1 : -1;
    reRender();
    toast(errMsg(error), 'err');
  }
}

async function deleteThread(id) {
  if (!confirm(T('confirmDeleteThread'))) return;
  const { error } = await sb.from('forum_threads').delete().eq('id', id);
  if (error) return toast(errMsg(error), 'err');
  await logAdminAction('delete', 'forum_thread', id);
  toast(T('deleted'));
  showList();
}

async function deletePost(id) {
  if (!confirm(T('confirmDeletePost'))) return;
  const { error } = await sb.from('forum_posts').delete().eq('id', id);
  if (error) return toast(errMsg(error), 'err');
  await logAdminAction('delete', 'forum_post', id);
  await loadThread(S.thread.id);
  renderThreadHead();
  renderPosts();
}

/* ---------- MİKROBLOG YARDIMCILARI (280 KARAKTER SINIRI) ---------- */
function updateQuickCharCount() {
  const inp = $('quickPostInput');
  const cnt = $('quickPostCount');
  const btn = $('quickPostSubmitBtn');
  if (inp && cnt) {
    if (inp.value.length > 280) {
      inp.value = inp.value.slice(0, 280);
    }
    const len = inp.value.length;
    cnt.textContent = `${len} / 280`;
    if (len >= 280) {
      cnt.style.color = 'var(--amed-red, #ef4444)';
      cnt.style.fontWeight = '800';
    } else if (len >= 250) {
      cnt.style.color = '#f59e0b';
      cnt.style.fontWeight = '700';
    } else {
      cnt.style.color = '';
      cnt.style.fontWeight = '';
    }
    if (btn) btn.disabled = len === 0 || len > 280;
  }
}

function insertTag(tag) {
  const tagBar = $('composerHashtagBar');
  if (tagBar) tagBar.style.display = 'none';
  $('composerHashtagBtn')?.classList.remove('active');
  const input = $('quickPostInput');
  if (!input) {
    return;
  }
  let cur = input.value || '';
  cur = cur.replace(/#\s*$/, '').trim();
  const add = (cur.length > 0 ? ' ' : '') + tag + ' ';
  if ((cur + add).length > 280) {
    toast(T('tagCharLimitErr'), 'warn');
    return;
  }
  input.value = (cur.length > 0 ? cur + ' ' : '') + tag + ' ';
  input.focus();
  updateQuickCharCount();
}

async function shareThread(id) {
  const base = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://bakur.onread.com/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const url = `${cleanBase}#forum/${id}`;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast(T('copied'));
  } catch (err) {
    prompt(T('sharePrompt'), url);
  }
}

async function uploadComposerImage(file) {
  if (file.size > 8 * 1024 * 1024) {
    toast(T('imageMax8MB'), 'err');
    return;
  }
  const preview = $('composerMediaPreview');
  if (preview) {
    preview.style.display = 'block';
    preview.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem; padding:0.6rem 0.85rem; border-radius:10px; background:var(--bg-subtle); font-size:0.85rem; color:var(--text-secondary); border:1px solid var(--border-light);">
        <i class="ri-loader-4-line spin" style="color:var(--amed-green); font-size:1.1rem;"></i> ${T('uploadingImage')}
      </div>
    `;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUri = e.target.result;
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUri })
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.url) {
        throw new Error(json.error || T('imageUploadFailed'));
      }
      S.composerUploadedImage = json.url;
      if (preview) {
        preview.innerHTML = `
          <div class="composer-preview-box">
            <img src="${esc(json.url)}" alt="Preview" />
            <button type="button" class="composer-preview-remove" data-action="remove-composer-img" title="${T('removeImage')}">
              <i class="ri-close-line"></i>
            </button>
          </div>
        `;
      }
      $('composerImgBtn')?.classList.add('has-image');
      toast(T('imageUploadSuccess'));
    } catch (err) {
      if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
      }
      $('composerImgBtn')?.classList.remove('has-image');
      S.composerUploadedImage = null;
      toast(err.message || T('imageUploadFailed'), 'err');
    }
  };
  reader.readAsDataURL(file);
}

async function handleQuickPost(form) {
  if (!requireLogin()) return;
  if (isSubmittingThread) return;
  const input = $('quickPostInput');
  const titleInput = $('quickPostTitle');
  const catSelect = $('quickPostCat');
  let body = (input?.value || '').trim();
  let title = (titleInput?.value || '').trim();
  const category_id = Number(catSelect?.value || S.categories[0]?.id || 1);

  if (!body && !S.composerUploadedImage) return toast(T('errorGeneric'), 'err');
  if (body.length > 280) {
    return toast(T('postMax280'), 'err');
  }

  const spamErr = checkSpamRules(body);
  if (spamErr) return toast(spamErr, 'err');

  if (S.lastQuickPostBody && S.lastQuickPostBody === body.toLowerCase().trim() && (Date.now() - S.lastQuickPostTime < 10 * 60 * 1000)) {
    return toast(T('duplicatePostError'), 'err');
  }

  if (S.composerUploadedImage) {
    body = body ? `${body}\n${S.composerUploadedImage}` : S.composerUploadedImage;
  }

  if (!title) {
    title = body ? body.slice(0, 60).replace(/[\r\n]+/g, ' ').trim() : (T('defaultPostTitle') || 'Amedspor');
    if (title.length < 4) title = T('defaultPostTitle') || 'Amedspor';
  }

  isSubmittingThread = true;
  setBusy(form, true);
  try {
    const { data, error } = await sb.from('forum_threads').insert({
      title,
      body,
      category_id,
      author_id: me()
    }).select('id').single();

    if (error) throw error;

    S.lastQuickPostBody = body.toLowerCase().trim();
    S.lastQuickPostTime = Date.now();
    if (input) input.value = '';
    if (titleInput) titleInput.value = '';
    S.composerUploadedImage = null;
    const preview = $('composerMediaPreview');
    if (preview) {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
    $('composerImgBtn')?.classList.remove('has-image');
    const fileInp = $('twComposerImgFile');
    if (fileInp) fileInp.value = '';
    updateQuickCharCount();
    toast(T('threadCreated'));
    await loadThreads();
    renderThreadList();
  } catch (err) {
    toast(errMsg(err), 'err');
  } finally {
    isSubmittingThread = false;
    setBusy(form, false);
  }
}

/* ---------- CANLI SENKRONİZASYON ---------- */
let refreshTimer;
function refreshForum(immediate = false) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(
    async () => {
      if (S.view === 'thread' && S.thread) {
        const ok = await loadThread(S.thread.id);
        if (!ok) return showList();
        renderThreadHead();
        renderPosts();
      } else {
        await loadThreads();
        renderThreadList();
      }
    },
    immediate ? 0 : 500
  );
}

function showNewPostsNotice(count = 1) {
  S.pendingNewPosts += count;
  const wrap = $('twNewPostsWrap');
  const countTxt = $('twNewPostsCountText');
  if (wrap && S.view === 'list') {
    if (countTxt) {
      countTxt.innerHTML = `<span class="tw-new-posts-pill-count">${S.pendingNewPosts}</span> ${T('newPostsAvailable')}`;
    }
    wrap.style.display = 'flex';
  }
}

function hideNewPostsNotice() {
  S.pendingNewPosts = 0;
  const wrap = $('twNewPostsWrap');
  if (wrap) wrap.style.display = 'none';
}

async function loadNewPendingPosts() {
  hideNewPostsNotice();
  await loadThreads();
  renderThreadList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function checkNewIncomingThreads() {
  if (document.hidden || S.view !== 'list' || !S.threads || !S.threads.length) return;
  try {
    const { data, error } = await sb
      .from('forum_threads')
      .select('id, created_at, author_id')
      .order('created_at', { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0) {
      const top = data[0];
      const currentTopId = S.threads[0]?.id;
      if (top.id && top.id !== currentTopId) {
        if (top.author_id === me()) {
          refreshForum(true);
        } else {
          showNewPostsNotice(1);
        }
      }
    }
  } catch (e) {}
}

function subscribeRealtime() {
  sb.channel('amed-forum')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_threads' }, (payload) => {
      const isMine = payload?.new?.author_id && payload.new.author_id === me();
      if (isMine) {
        refreshForum(true);
      } else if (S.view === 'list') {
        showNewPostsNotice(1);
      } else {
        refreshForum();
      }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'forum_threads' }, () => refreshForum())
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'forum_threads' }, () => refreshForum())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => refreshForum())
    .subscribe();

  // Canlı & Anlık Veri: Her 7 saniyede bir yeni gönderileri kontrol et
  setInterval(checkNewIncomingThreads, 7000);
}

/* ---------- OLAYLAR ---------- */
function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    const dropdown = $('userDropdown');
    if (dropdown && !e.target.closest('.user-menu')) dropdown.classList.remove('open');
    if (!el) return;
    const { action, id, mode, ptab, url } = el.dataset;
    const numId = Number(id);
    switch (action) {
      case 'load-new-posts':
        return loadNewPendingPosts();
      case 'open-login':
        return openAuth('login');
      case 'open-lang-dialog':
        return openLangDialog();
      case 'switch-lang': {
        const newLang = el.dataset.lang;
        if (window.setLanguage) window.setLanguage(newLang);
        const curPane = document.querySelector('.profile-pane.active')?.id.replace('ptabPane-', '');
        if (curPane) {
          openProfile(curPane);
        } else if ($('cDialogBox')?.querySelector('.profile-lang-card')) {
          openLangDialog();
        }
        return;
      }
      case 'auth-mode':
        return openAuth(mode);
      case 'google':
        return signInWithGoogle();
      case 'close-dialog':
        return closeDialog();
      case 'toggle-menu':
        return dropdown?.classList.toggle('open');
      case 'goto-settings':
        dropdown?.classList.remove('open');
        return openSettings();
      case 'goto-profile':
      case 'open-profile':
      case 'goto-profile-page':
        dropdown?.classList.remove('open');
        return openProfile();
      case 'goto-forum':
        dropdown?.classList.remove('open');
        return window.switchTab?.('forum');
      case 'goto-my-profile': {
        closeDialog();
        dropdown?.classList.remove('open');
        return openProfile();
      }
      case 'logout':
        dropdown?.classList.remove('open');
        return sb.auth.signOut().then(() => toast(T('loggedOut')));
      case 'stream-tab': {
        S.streamMode = el.dataset.stream;
        document.querySelectorAll('#twStreamTabs .tw-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.stream === S.streamMode));
        renderThreadList();
        return;
      }
      case 'copy-link': {
        const urlToCopy = el.dataset.url;
        if (navigator.clipboard && urlToCopy) {
          navigator.clipboard.writeText(urlToCopy).then(() => toast(T('copied')));
        }
        return;
      }
      case 'select-cat':
        S.activeCat = el.dataset.cat === 'all' ? 'all' : Number(el.dataset.cat);
        S.limit = 20;
        return showList();
      case 'sort':
        S.sort = el.dataset.sort;
        S.limit = 20;
        return showList();
      case 'load-more':
        S.limit += 20;
        return refreshForum(true);
      case 'new-thread':
        return openNewThread();
      case 'open-thread':
        return openThread(numId);
      case 'back':
        return showList();
      case 'like-thread':
        return toggleLike('thread', numId);
      case 'like-post':
        return toggleLike('post', numId);
      case 'share-thread':
        return shareThread(numId);
      case 'insert-tag':
        return insertTag(el.dataset.tag);
      case 'toggle-follow': {
        const targetUserId = el.dataset.userId;
        if (targetUserId) toggleFollow(targetUserId);
        return;
      }
      case 'open-follows-modal':
        return openFollowsModal(el.dataset.userId, el.dataset.initialTab || 'followers');
      case 'switch-follows-tab':
        return switchFollowsTab(el.dataset.tab);
      case 'close-follows-modal':
        return closeFollowsModal();
      case 'click-follow-user': {
        const uid = el.dataset.userId;
        if (uid) {
          closeFollowsModal();
          openProfile(uid);
        }
        return;
      }
      case 'view-user-profile': {
        const targetUserId = el.dataset.userId;
        if (targetUserId) openProfile(targetUserId);
        return;
      }
      case 'delete-thread':
        return deleteThread(numId);
      case 'delete-post':
        return deletePost(numId);
      case 'trigger-composer-image': {
        $('twComposerImgFile')?.click();
        return;
      }
      case 'toggle-composer-tags': {
        const tagBar = $('composerHashtagBar');
        const btn = $('composerHashtagBtn') || el;
        const input = $('quickPostInput');
        if (tagBar) {
          const isHidden = tagBar.style.display === 'none';
          tagBar.style.display = isHidden ? 'block' : 'none';
          btn?.classList.toggle('active', isHidden);
          if (isHidden && input) {
            let cur = input.value || '';
            if (!cur.endsWith('#') && !cur.endsWith('# ')) {
              const sep = (cur.length > 0 && !cur.endsWith(' ')) ? ' ' : '';
              input.value = cur + sep + '#';
            }
            input.focus();
            updateQuickCharCount();
          }
        }
        return;
      }
      case 'filter-hashtag': {
        const tag = el.dataset.tag;
        if (!tag) return;
        const searchInp = $('forumSearch');
        if (searchInp) searchInp.value = tag;
        S.search = tag;
        S.limit = 20;
        if (S.view === 'thread') {
          showList();
        } else {
          loadThreads().then(() => renderThreadList());
        }
        toast(`"${tag}" ${T('filteredByTag')}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      case 'remove-composer-img': {
        S.composerUploadedImage = null;
        $('composerImgBtn')?.classList.remove('has-image');
        const preview = $('composerMediaPreview');
        if (preview) {
          preview.style.display = 'none';
          preview.innerHTML = '';
        }
        const fileInp = $('twComposerImgFile');
        if (fileInp) fileInp.value = '';
        toast(T('removeImage') || 'Görsel kaldırıldı.');
        return;
      }
      case 'toggle-pin':
        return togglePinThread(numId);
      case 'toggle-lock':
        return toggleLockThread(numId);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDialog();
    if (e.key === 'Enter' && e.target.closest?.('.thread-item')) {
      openThread(Number(e.target.closest('.thread-item').dataset.id));
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'replyInput') {
      e.preventDefault();
      e.target.form.requestSubmit();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'quickPostInput') {
      e.preventDefault();
      e.target.form?.requestSubmit();
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form;
    if (['login', 'signup', 'reset', 'update'].includes(kind)) handleAuthForm(form);
    else if (kind === 'profile-main') handleProfileMainForm(form);
    else if (kind === 'profile-fan') handleProfileFanForm(form);
    else if (kind === 'profile-security') handleProfileSecurityForm(form);
    else if (kind === 'thread') handleThreadForm(form);
    else if (kind === 'reply') handleReplyForm(form);
    else if (kind === 'quick-thread') handleQuickPost(form);
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'twComposerImgFile') {
      const file = e.target.files?.[0];
      if (file) uploadComposerImage(file);
      e.target.value = '';
    }
  });

  let searchTimer;
  document.addEventListener('input', (e) => {
    if (e.target.id === 'quickPostInput') {
      updateQuickCharCount();
      return;
    }
    if (e.target.id !== 'forumSearch') return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      S.search = e.target.value;
      S.limit = 20;
      await loadThreads();
      renderThreadList();
    }, 300);
  });

  // Dil değişince toplulukla ilgili tüm metinleri yenile
  document.addEventListener('amed:lang', () => {
    applyStaticLabels();
    renderHeaderAuth();
    renderForum();
    if (document.getElementById('profileTabContent')?.classList.contains('active')) {
      renderProfilePage();
    }
    if (document.getElementById('settingsTabContent')?.classList.contains('active')) {
      renderSettingsPage();
    }
    if (followsModalUserId && document.getElementById('followsModal')?.classList.contains('open')) {
      switchFollowsTab(followsModalActiveTab);
    }
  });
}

/* ---------- BAŞLAT ---------- */
async function init() {
  bindEvents();
  applyStaticLabels();
  renderHeaderAuth();

  // Profil ve Ayarlar sayfalarına geçiş kancası
  window.renderProfilePage = renderProfilePage;
  window.renderSettingsPage = renderSettingsPage;
  window.openProfile = openProfile;
  window.openSettings = openSettings;

  const prevSwitchTab = window.switchTab;
  window.switchTab = function (tabId) {
    if (typeof prevSwitchTab === 'function') prevSwitchTab(tabId);
    if (tabId === 'community' || tabId === 'forum') {
      if (S.view === 'list') {
        const hasGuestCard = document.querySelector('.tw-guest-card');
        const hasComposer = document.querySelector('.tw-composer');
        if ((me() && hasGuestCard) || (!me() && hasComposer)) {
          renderForum();
        }
      }
    }
    if (tabId === 'profile') renderProfilePage();
    if (tabId === 'settings') renderSettingsPage();
  };

  const navProfileTab = $('navProfileTab');
  if (navProfileTab) {
    navProfileTab.addEventListener('click', () => {
      openProfile();
    });
  }

  // Supabase oturumunu ilk anda bellekten/depolamadan anında al
  try {
    const { data: sessionData } = await sb.auth.getSession();
    if (sessionData?.session) {
      S.session = sessionData.session;
      await loadProfile();
      await loadMyFollows();
      renderHeaderAuth();
    }
  } catch (e) {}

  sb.auth.onAuthStateChange((event, session) => {
    S.session = session;
    // Supabase önerisi: callback içinde doğrudan await kullanma
    setTimeout(async () => {
      if (event === 'PASSWORD_RECOVERY') openAuth('update');
      await loadProfile();
      if (!session) {
        S.likedThreads.clear();
        S.likedPosts.clear();
        S.followingSet.clear();
      } else {
        await loadMyFollows();
      }
      loadSuggestedUsers();
      renderHeaderAuth();
      if (document.getElementById('tab-profile')?.classList.contains('active')) {
        renderProfilePage();
      }
      if (document.getElementById('tab-settings')?.classList.contains('active')) {
        renderSettingsPage();
      }
      if (event === 'SIGNED_IN' && S.profile && !sessionStorage.getItem('amed_welcomed')) {
        sessionStorage.setItem('amed_welcomed', '1');
        toast(`${T('welcome')}, ${S.profile.display_name || S.profile.username}!`);
      }
      if (event === 'SIGNED_OUT') sessionStorage.removeItem('amed_welcomed');
      if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
        if (S.view === 'thread') {
          renderComposer();
          refreshForum(true);
        } else {
          renderForum();
          refreshForum(true);
        }
      }
    }, 0);
  });

  // 1. Önbellekten anında yükle (0ms Gecikme / Sıfır Bekleme)
  try {
    if (window.__INITIAL_CLUB_FEED__?.posts) {
      S.officialPosts = window.__INITIAL_CLUB_FEED__.posts;
    }
    const cachedThreads = localStorage.getItem('amed_cached_threads');
    if (cachedThreads) {
      S.threads = JSON.parse(cachedThreads);
    }
    const cachedCats = localStorage.getItem('amed_cached_cats');
    if (cachedCats) {
      S.categories = JSON.parse(cachedCats);
    }
    const cachedProfile = localStorage.getItem('amed_cached_user_profile');
    if (cachedProfile) {
      S.profile = JSON.parse(cachedProfile);
    }
  } catch (e) {}

  if (S.categories.length > 0) renderCategories();
  renderForum();
  if (S.threads.length > 0) renderThreadList();

  loadCategories().then(() => renderCategories());
  loadMyFollows().then(() => loadSuggestedUsers());
  const m = location.hash.match(/^#forum\/(\d+)$/);
  if (m) {
    window.switchTab?.('forum');
    await openThread(Number(m[1]));
  } else if (location.hash === '#profile') {
    openProfile();
  } else if (location.hash === '#settings') {
    openSettings();
  } else {
    loadThreads().then(() => renderThreadList());
  }
  subscribeRealtime();

  $('followsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'followsModal') closeFollowsModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('followsModal')?.style.display === 'flex') {
      closeFollowsModal();
    }
  });
}

init();
