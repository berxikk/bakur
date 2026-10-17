/* =========================================================
   AMEDSPOR TOPLULUK: Supabase Giriş + Taraftar Forumu
   ========================================================= */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

/* ---------- ÇEVİRİLER ---------- */
const CI18N = {
  tr: {
    navForum: 'Forum',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    signup: 'Kayıt Ol',
    email: 'E-posta',
    emailOrUsername: 'E-posta veya Kullanıcı adı',
    usernameNotFound: 'Bu kullanıcı adına ait bir hesap bulunamadı.',
    password: 'Şifre',
    username: 'Kullanıcı adı',
    displayName: 'Görünen ad',
    forgot: 'Şifremi unuttum',
    google: 'Google ile devam et',
    or: 'veya',
    haveAccount: 'Hesabın var mı?',
    noAccount: 'Hesabın yok mu?',
    loginTitle: 'Tekrar hoş geldin',
    loginSub: 'Forumda yazmak ve beğenmek için giriş yap.',
    signupTitle: 'Amed ailesine katıl',
    signupSub: 'Ücretsiz hesap oluştur, tartışmalara katıl.',
    resetTitle: 'Şifre sıfırlama',
    resetSub: 'E-posta adresine sıfırlama bağlantısı gönderelim.',
    sendReset: 'Bağlantı gönder',
    backToLogin: 'Girişe dön',
    updateTitle: 'Yeni şifre belirle',
    newPassword: 'Yeni şifre',
    savePassword: 'Şifreyi kaydet',
    checkEmail: 'Kayıt tamam! Hesabını doğrulamak için e-postanı kontrol et.',
    resetSent: 'Sıfırlama bağlantısı e-postana gönderildi.',
    passwordUpdated: 'Şifren güncellendi.',
    welcome: 'Hoş geldin',
    loggedOut: 'Çıkış yapıldı.',
    navPosts: 'Gönderiler',
    timelineTitle: 'Gönderiler',
    streamAll: 'Tümü (Canlı)',
    streamOfficial: 'Kulüp Resmi',
    streamFans: 'Taraftar',
    streamTwitter: 'Canlı X (Twitter)',
    streamProfile: 'Profilim',
    myPosts: 'Gönderilerim',
    myPostsCount: 'Gönderi',
    totalLikesReceived: 'Beğeni',
    profileBioEmpty: 'Henüz biyografi eklenmedi.',
    profileEmptyPosts: 'Henüz hiçbir gönderi paylaşmadınız.',
    profileEmptyPostsCta: 'Amedspor hakkındaki duygu ve düşüncelerini hemen paylaş!',
    loginToViewProfile: 'Kendi profilinizi ve gönderilerinizi görmek için lütfen giriş yapın.',
    loginToViewProfileDesc: 'Profil detaylarınızı görüntülemek, avatarınızı düzenlemek ve paylaştığınız gönderileri yönetmek için giriş yapın.',
    editProfile: 'Profili Düzenle',
    viewInFeed: 'Akışta Gör',
    postsTab: 'Gönderilerim',
    officialReadMore: 'Resmi Sitede Oku',
    forYou: 'Sana Özel',
    popular: 'Popüler',
    composerPlaceholder: 'Neler oluyor? Bir etiket (#) ile düşüncelerini paylaş...',
    tweetBtn: 'Gönder',
    trendingTitle: 'Gündemdekiler',
    guestBannerTitle: 'Amedspor Taraftar Akışına Katıl',
    guestBannerSub: 'Düşüncelerini anında paylaş, taraftarlarla etkileşime geç.',
    share: 'Paylaş',
    copied: 'Gönderi bağlantısı panoya kopyalandı!',
    sharePrompt: 'Bu gönderinin bağlantısı:',
    noPosts: 'Henüz gönderi yok. İlk gönderiyi sen paylaş!',
    replies: 'yanıt',
    backToTimeline: 'Gönderilere dön',
    replyPlaceholder: 'Yanıtını gönder...',
    replyBtn: 'Yanıtla',
    loginToPost: 'Gönderi paylaşmak için giriş yap',
    loginRequired: 'Bu işlem için giriş yapmalısın.',
    title: 'Başlık',
    body: 'İçerik',
    category: 'Kategori',
    publish: 'Yayınla',
    cancel: 'Vazgeç',
    del: 'Sil',
    confirmDeleteThread: 'Bu konuyu silmek istediğine emin misin?',
    confirmDeletePost: 'Bu yanıtı silmek istediğine emin misin?',
    deleted: 'Silindi.',
    profile: 'Profil',
    profileSettings: 'Profil & Ayarlar',
    settings: 'Ayarlar',
    generalTab: 'Profil',
    fanTab: 'Taraftar Tercihleri',
    securityTab: 'Güvenlik & Şifre',
    adminTab: 'Admin Paneli',
    bio: 'Biyografi / Taraftar Mesajı',
    bioPlaceholder: 'Örn: Diren Amedspor! Yeşil Kırmızı Sevdamız...',
    favoritePlayer: 'Favori Futbolcun',
    selectPlayer: 'Amedspor kadrosundan seç...',
    avatarSelect: 'Profil Avatarı Seç',
    uploadCustomAvatar: 'Kendi Fotoğrafını Yükle',
    uploadHint: 'PNG, JPG, WEBP (Maks. 5MB)',
    orPresetAvatars: 'veya hazır kulüp avatarlarından seç:',
    nsfwScanning: 'Yapay Zeka +18 & NSFW filtresi taranıyor...',
    nsfwBlockedTitle: 'Uygunsuz Görsel Engellendi (+18 / NSFW)',
    nsfwBlockedDesc: 'Topluluk kurallarımız gereği müstehcen veya +18 içerikli profil fotoğraflarına izin verilmemektedir.',
    nsfwPassed: 'Görsel Onaylandı!',
    nsfwPassedDesc: 'NSFW ve +18 güvenlik filtrelerini başarıyla geçti.',
    fileTooLarge: 'Dosya boyutu 5 MB\'tan küçük olmalıdır.',
    notifications: 'Bildirim Ayarları',
    notifGoals: 'Canlı Maç & Gol Bildirimleri',
    notifForum: 'Forum Yanıt Bildirimleri',
    currentEmail: 'Kayıtlı E-posta',
    changePassword: 'Şifre Değiştir',
    newPasswordPlaceholder: 'En az 6 karakter yeni şifre',
    adminBadge: 'ADMIN',
    adminPanelTitle: 'Yönetim & Moderatör Paneli',
    adminRoleDesc: 'Amedspor Live Hub Sistem & Forum Yöneticisi',
    adminStats: 'Forum İstatistikleri',
    adminThreadsCount: 'Toplam Konu',
    adminPostsCount: 'Toplam Yorum',
    adminPowers: 'Yönetici Yetkileri',
    adminPower1: 'Herhangi bir konuyu sabitleme ve kaldırma',
    adminPower2: 'Herhangi bir konuyu yanıtlara kilitleme ve açma',
    adminPower3: 'Uygunsuz konu ve yanıtları anında silme',
    pin: 'Sabitle',
    unpin: 'Sabitlemeyi Kaldır',
    lock: 'Kilitle',
    unlock: 'Kilidi Aç',
    pinned: 'Sabitlendi',
    unpinned: 'Sabitleme kaldırıldı.',
    locked: 'Kilitlendi',
    unlocked: 'Kilit açıldı.',
    threadLocked: 'Bu konu kilitlenmiştir. Yeni yanıt gönderilemez.',
    profileTitle: 'Profil & Ayarlar',
    save: 'Kaydet',
    saved: 'Kaydedildi.',
    loadMore: 'Daha fazla göster',
    noReplies: 'Henüz yanıt yok. İlk yanıtı sen yaz.',
    threadCreated: 'Konu yayınlandı.',
    replySent: 'Yanıtınız paylaşıldı.',
    errorGeneric: 'Bir hata oluştu. Lütfen tekrar dene.',
    invalidUsername: 'Kullanıcı adı 3-24 karakter olmalı (harf, rakam, _ ve .).',
    usernameTaken: 'Bu kullanıcı adı alınmış.',
    minPassword: 'Şifre en az 6 karakter olmalı.',
    invalidCredentials: 'E-posta veya şifre hatalı.',
    emailNotConfirmed: 'E-posta adresin henüz doğrulanmamış.',
    justNow: 'az önce',
    loading: 'Yükleniyor...',
    titleTooShort: 'Başlık en az 4 karakter olmalı.',
    liveBadge: 'Canlı',
    newPostsAvailable: 'yeni gönderi',
    languageSelect: 'Uygulama Dili / Ziman',
    securityActive: 'Sistem ve Veritabanı Güvenliği Aktif',
    auditLogs: 'Yönetici İşlem Günlüğü (Audit Log)',
    noAuditLogs: 'Henüz denetim kaydı bulunmuyor.',
    roleSecurityNote: 'Veritabanı Rol Güvenliği: Yetkisiz rol değiştirme ve ayrıcalık yükseltme engellenmiştir.',
    rateLimitNote: 'Spam Koruması: Konu (15sn) ve yanıt (5sn) hız limiti aktif.'
  },
  ku: {
    navForum: 'Forum',
    login: 'Têkeve',
    logout: 'Derkeve',
    signup: 'Tomar bibe',
    email: 'E-name',
    emailOrUsername: 'E-name an Navê bikarhêner',
    usernameNotFound: 'Hesabek bi vî navê bikarhêner nehate dîtin.',
    password: 'Şîfre',
    username: 'Navê bikarhêner',
    displayName: 'Navê xuyabûnê',
    forgot: 'Min şîfre ji bîr kir',
    google: 'Bi Google bidomîne',
    or: 'an jî',
    haveAccount: 'Hesabê te heye?',
    noAccount: 'Hesabê te tune?',
    loginTitle: 'Dîsa bi xêr hatî',
    loginSub: 'Ji bo nivîsandin û ecibandinê têkeve.',
    signupTitle: 'Tevlî malbata Amedê bibe',
    signupSub: 'Hesabekî belaş çêke û tevlî nîqaşan bibe.',
    resetTitle: 'Nûkirina şîfreyê',
    resetSub: 'Em ê girêdanekê ji e-nameya te re bişînin.',
    sendReset: 'Girêdanê bişîne',
    backToLogin: 'Vegere têketinê',
    updateTitle: 'Şîfreya nû diyar bike',
    newPassword: 'Şîfreya nû',
    savePassword: 'Şîfreyê tomar bike',
    checkEmail: 'Tomarbûn temam! Ji bo piştrastkirinê e-nameya xwe kontrol bike.',
    resetSent: 'Girêdana nûkirinê ji e-nameya te re hat şandin.',
    passwordUpdated: 'Şîfreya te hat nûkirin.',
    welcome: 'Bi xêr hatî',
    loggedOut: 'Te derket.',
    navPosts: 'Parvekirin',
    timelineTitle: 'Parvekirin',
    streamAll: 'Hemû (Zindî)',
    streamOfficial: 'Klûb Fermî',
    streamFans: 'Alîgir',
    streamTwitter: 'Zindî X (Twitter)',
    streamProfile: 'Profîla Min',
    myPosts: 'Parvekirinên Min',
    myPostsCount: 'Parvekirin',
    totalLikesReceived: 'Ecibandin',
    profileBioEmpty: 'Hê bîyografî nehatiye zêdekirin.',
    profileEmptyPosts: 'Hê tu parvekirinek nekiriye.',
    profileEmptyPostsCta: 'Ramanên xwe li ser Amedsporê niha parve bike!',
    loginToViewProfile: 'Ji bo dîtina profîl û parvekirinên xwe keremke têkeve.',
    loginToViewProfileDesc: 'Ji bo dîtina hûrguliyên profîlê, sererastkirina avatarê û birêvebirina parvekirinan têkeve.',
    editProfile: 'Profîlê Biguherîne',
    viewInFeed: 'Di Herikînê de Bibîne',
    postsTab: 'Parvekirinên Min',
    officialReadMore: 'Li Malpera Fermî Bixwîne',
    forYou: 'Ji Bo Te',
    popular: 'Populer',
    composerPlaceholder: 'Çi diqewime? Bi etîketekê (#) ramanên xwe parve bike...',
    tweetBtn: 'Bişîne',
    trendingTitle: 'Rojev',
    guestBannerTitle: 'Tevlî Herikîna Alîgirên Amedsporê Bibe',
    guestBannerSub: 'Bîr û ramanên xwe di cih de parve bike, bi alîgiran re bikeve têkiliyê.',
    share: 'Parve bike',
    copied: 'Girêdana parvekirinê hat kopîkirin!',
    sharePrompt: 'Girêdana vê peyamê:',
    noPosts: 'Hîn parvekirinek tune ye. Ya yekem tu parve bike!',
    replies: 'bersiv',
    backToTimeline: 'Vegere parvekirinan',
    replyPlaceholder: 'Bersiva xwe bişîne...',
    replyBtn: 'Bersiv bide',
    loginToPost: 'Ji bo parvekirinê têkeve',
    loginRequired: 'Ji bo vê yekê divê tu têkevî.',
    title: 'Sernav',
    body: 'Naverok',
    category: 'Kategorî',
    publish: 'Biweşîne',
    cancel: 'Betal',
    del: 'Jê bibe',
    confirmDeleteThread: 'Tu bawer î ku dixwazî vê mijarê jê bibî?',
    confirmDeletePost: 'Tu bawer î ku dixwazî vê bersivê jê bibî?',
    deleted: 'Hat jêbirin.',
    profile: 'Profîl',
    profileSettings: 'Profîl & Mîheng',
    settings: 'Mîheng',
    generalTab: 'Profîl',
    fanTab: 'Vebijarkên Alîgir',
    securityTab: 'Ewlehî & Şîfre',
    adminTab: 'Panela Admin',
    bio: 'Biyografî / Peyama Alîgir',
    bioPlaceholder: 'Mînak: Berxwedan Amedspor! Evîna Kesk û Sor...',
    favoritePlayer: 'Futbolvanê te yê bijare',
    selectPlayer: 'Ji kadroya Amedsporê hilbijêre...',
    avatarSelect: 'Wêneya Profîlê Hilbijêre',
    uploadCustomAvatar: 'Wêneyê Xwe Bar Bike',
    uploadHint: 'PNG, JPG, WEBP (Herî zêde 5MB)',
    orPresetAvatars: 'an ji amadeyên klûbê hilbijêre:',
    nsfwScanning: 'Parzûna AI +18 & NSFW tê kontrolkirin...',
    nsfwBlockedTitle: 'Wêneyê Neguncaw Hat Astengkirin (+18 / NSFW)',
    nsfwBlockedDesc: 'Li gorî rêzikên civakê, wêneyên nebaş an +18 nayên qebûlkirin.',
    nsfwPassed: 'Wêne Hat Pejirandin!',
    nsfwPassedDesc: 'Parzûnên ewlehiyê yên NSFW û +18 bi serkeftî derbas bûn.',
    fileTooLarge: 'Mezinahiya pelê divê ji 5 MB kêmtir be.',
    notifications: 'Vebijarkên Agahdariyê',
    notifGoals: 'Agahdariyên Zindî yên Gol û Maçan',
    notifForum: 'Agahdariyên Bersivên Forumê',
    currentEmail: 'E-nameya Tomarkirî',
    changePassword: 'Şîfreyê Biguherîne',
    newPasswordPlaceholder: 'Kêmasî 6 tîp şîfreya nû',
    adminBadge: 'ADMIN',
    adminPanelTitle: 'Panela Rêvebir & Moderasyonê',
    adminRoleDesc: 'Rêvebirê Sîstem û Forumê ya Amedspor Live Hub',
    adminStats: 'Statîstîkên Forumê',
    adminThreadsCount: 'Mijarên Giştî',
    adminPostsCount: 'Bersivên Giştî',
    adminPowers: 'Desthilatdariyên Admin',
    adminPower1: 'Pêvekirin û rakirina mijaran (Pin / Unpin)',
    adminPower2: 'Qifilkirin û vekirina mijaran (Lock / Unlock)',
    adminPower3: 'Jêbirina rasterast a mijar û bersivan',
    pin: 'Pêve bike',
    unpin: 'Pêvekirinê Rake',
    lock: 'Qifil bike',
    unlock: 'Qifilê Veke',
    pinned: 'Hat pêvekirin',
    unpinned: 'Pêvekirin hat rakirin.',
    locked: 'Hat qifilkirin',
    unlocked: 'Qifil hat vekirin.',
    threadLocked: 'Ev mijar hatiye qifilkirin. Bersiva nû nayê şandin.',
    profileTitle: 'Profîl & Mîheng',
    save: 'Tomar bike',
    saved: 'Hat tomarkirin.',
    loadMore: 'Zêdetir nîşan bide',
    noReplies: 'Hîn bersiv tune. Bersiva yekem tu binivîse.',
    threadCreated: 'Mijar hat weşandin.',
    replySent: 'Bersiva te hat weşandin.',
    errorGeneric: 'Çewtiyek çêbû. Ji kerema xwe dîsa biceribîne.',
    invalidUsername: 'Navê bikarhêner divê 3-24 tîp be (tîp, hejmar, _ û .).',
    usernameTaken: 'Ev navê bikarhêner hatiye girtin.',
    minPassword: 'Şîfre divê herî kêm 6 tîp be.',
    invalidCredentials: 'E-name an şîfre şaş e.',
    emailNotConfirmed: 'E-nameya te hîn nehatiye piştrastkirin.',
    justNow: 'niha',
    loading: 'Tê barkirin...',
    titleTooShort: 'Sernav divê herî kêm 4 tîp be.',
    liveBadge: 'Zindî',
    newPostsAvailable: 'şandina nû',
    languageSelect: 'Zimanê Serlêdanê',
    securityActive: 'Ewlehiya Sîstem û Daneyan Çalak e',
    auditLogs: 'Qeydên Kiryarên Admin (Audit Log)',
    noAuditLogs: 'Hîn qeydek tune ye.',
    roleSecurityNote: 'Ewlehiya Rolan: Guhertina ne-destûrdar a rolan hatiye astengkirin.',
    rateLimitNote: 'Parastina Spamê: Sînorê lezê ya mijar (15s) û bersiv (5s) çalak e.'
  },
  en: {
    navForum: 'Forum',
    login: 'Sign In',
    logout: 'Sign Out',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    displayName: 'Display name',
    forgot: 'Forgot password?',
    google: 'Continue with Google',
    or: 'or',
    haveAccount: 'Already have an account?',
    noAccount: 'Don\'t have an account?',
    loginTitle: 'Welcome back',
    loginSub: 'Sign in to post and like in the forum.',
    signupTitle: 'Join the Amed family',
    signupSub: 'Create a free account and join the discussion.',
    resetTitle: 'Reset password',
    resetSub: 'We\'ll send a reset link to your email.',
    sendReset: 'Send link',
    backToLogin: 'Back to sign in',
    updateTitle: 'Set a new password',
    newPassword: 'New password',
    savePassword: 'Save password',
    checkEmail: 'You\'re signed up! Check your email to confirm your account.',
    resetSent: 'A reset link has been sent to your email.',
    passwordUpdated: 'Your password has been updated.',
    welcome: 'Welcome',
    loggedOut: 'Signed out.',
    navPosts: 'Posts',
    timelineTitle: 'Posts',
    streamAll: 'All (Live)',
    streamOfficial: 'Official Club',
    streamFans: 'Fans',
    streamTwitter: 'Live X (Twitter)',
    streamProfile: 'My Profile',
    myPosts: 'My Posts',
    myPostsCount: 'Posts',
    totalLikesReceived: 'Likes',
    profileBioEmpty: 'No bio added yet.',
    profileEmptyPosts: 'You haven\'t shared any posts yet.',
    profileEmptyPostsCta: 'Share your thoughts and passion for Amedspor now!',
    loginToViewProfile: 'Please log in to view your profile and posts.',
    loginToViewProfileDesc: 'Log in to view your profile details, customize your avatar, and manage your posts.',
    editProfile: 'Edit Profile',
    viewInFeed: 'View in Feed',
    postsTab: 'My Posts',
    officialReadMore: 'Read on Official Site',
    forYou: 'For You',
    popular: 'Popular',
    composerPlaceholder: "What is happening? Share your thoughts with a hashtag (#)...",
    tweetBtn: 'Post',
    trendingTitle: 'Trends for you',
    guestBannerTitle: 'Join the Amedspor Fan Timeline',
    guestBannerSub: 'Share your thoughts instantly, engage with fellow fans.',
    share: 'Share',
    copied: 'Post link copied to clipboard!',
    sharePrompt: 'Post link:',
    noPosts: 'No posts yet. Be the first to share!',
    replies: 'replies',
    backToTimeline: 'Back to posts',
    replyPlaceholder: 'Post your reply...',
    replyBtn: 'Reply',
    loginToPost: 'Sign in to post',
    loginRequired: 'You need to sign in for this.',
    title: 'Title',
    body: 'Content',
    category: 'Category',
    publish: 'Publish',
    cancel: 'Cancel',
    del: 'Delete',
    confirmDeleteThread: 'Are you sure you want to delete this topic?',
    confirmDeletePost: 'Are you sure you want to delete this reply?',
    deleted: 'Deleted.',
    profile: 'Profile',
    profileSettings: 'Profile & Settings',
    settings: 'Settings',
    generalTab: 'Profile',
    fanTab: 'Fan Preferences',
    securityTab: 'Security & Password',
    adminTab: 'Admin Panel',
    bio: 'Bio / Fan Message',
    bioPlaceholder: 'e.g. Diren Amedspor! Green & Red Passion...',
    favoritePlayer: 'Favorite Player',
    selectPlayer: 'Select from Amedspor squad...',
    avatarSelect: 'Select Profile Avatar',
    uploadCustomAvatar: 'Upload Custom Photo',
    uploadHint: 'PNG, JPG, WEBP (Max 5MB)',
    orPresetAvatars: 'or choose from club presets:',
    nsfwScanning: 'AI 18+ & NSFW filter scanning...',
    nsfwBlockedTitle: 'Inappropriate Image Blocked (18+ / NSFW)',
    nsfwBlockedDesc: 'According to community guidelines, explicit or 18+ profile pictures are not allowed.',
    nsfwPassed: 'Image Approved!',
    nsfwPassedDesc: 'Successfully passed NSFW and 18+ safety filters.',
    fileTooLarge: 'File size must be less than 5 MB.',
    notifications: 'Notifications',
    notifGoals: 'Live Match & Goal Alerts',
    notifForum: 'Forum Reply Notifications',
    currentEmail: 'Registered Email',
    changePassword: 'Change Password',
    newPasswordPlaceholder: 'New password (min 6 chars)',
    adminBadge: 'ADMIN',
    adminPanelTitle: 'Admin & Moderation Panel',
    adminRoleDesc: 'Amedspor Live Hub Administrator',
    adminStats: 'Forum Stats',
    adminThreadsCount: 'Total Topics',
    adminPostsCount: 'Total Replies',
    adminPowers: 'Administrator Permissions',
    adminPower1: 'Pin and unpin any topic (Pin / Unpin)',
    adminPower2: 'Lock and unlock topics for replies (Lock / Unlock)',
    adminPower3: 'Delete any inappropriate topics and replies immediately',
    pin: 'Pin',
    unpin: 'Unpin',
    lock: 'Lock',
    unlock: 'Unlock',
    pinned: 'Pinned',
    unpinned: 'Unpinned.',
    locked: 'Locked',
    unlocked: 'Unlocked.',
    threadLocked: 'This topic is locked. No new replies allowed.',
    profileTitle: 'Profile & Settings',
    save: 'Save',
    saved: 'Saved.',
    loadMore: 'Show more',
    noReplies: 'No replies yet. Be the first to reply.',
    threadCreated: 'Topic published.',
    replySent: 'Reply posted.',
    errorGeneric: 'Something went wrong. Please try again.',
    invalidUsername: 'Username must be 3-24 characters (letters, numbers, _ and .).',
    usernameTaken: 'This username is taken.',
    minPassword: 'Password must be at least 6 characters.',
    invalidCredentials: 'Incorrect email or password.',
    emailNotConfirmed: 'Your email has not been confirmed yet.',
    justNow: 'just now',
    loading: 'Loading...',
    titleTooShort: 'Title must be at least 4 characters.',
    liveBadge: 'Live',
    newPostsAvailable: 'new posts',
    languageSelect: 'Application Language',
    securityActive: 'System & Database Security Active',
    auditLogs: 'Admin Audit Log',
    noAuditLogs: 'No audit logs recorded yet.',
    roleSecurityNote: 'Database Role Security: Unauthorized privilege escalation is strictly blocked.',
    rateLimitNote: 'Spam Protection: 15s thread / 5s reply rate limiting active.'
  },
  de: {
    navForum: 'Forum',
    login: 'Anmelden',
    logout: 'Abmelden',
    signup: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    username: 'Benutzername',
    displayName: 'Anzeigename',
    forgot: 'Passwort vergessen?',
    google: 'Weiter mit Google',
    or: 'oder',
    haveAccount: 'Schon ein Konto?',
    noAccount: 'Noch kein Konto?',
    loginTitle: 'Willkommen zurück',
    loginSub: 'Melde dich an, um im Forum zu schreiben und zu liken.',
    signupTitle: 'Werde Teil der Amed-Familie',
    signupSub: 'Erstelle ein kostenloses Konto und diskutiere mit.',
    resetTitle: 'Passwort zurücksetzen',
    resetSub: 'Wir senden dir einen Link per E-Mail.',
    sendReset: 'Link senden',
    backToLogin: 'Zurück zur Anmeldung',
    updateTitle: 'Neues Passwort festlegen',
    newPassword: 'Neues Passwort',
    savePassword: 'Passwort speichern',
    checkEmail: 'Registriert! Bitte bestätige dein Konto über die E-Mail.',
    resetSent: 'Ein Link zum Zurücksetzen wurde gesendet.',
    passwordUpdated: 'Dein Passwort wurde aktualisiert.',
    welcome: 'Willkommen',
    loggedOut: 'Abgemeldet.',
    navPosts: 'Beiträge',
    timelineTitle: 'Beiträge',
    streamAll: 'Alle (Live)',
    streamOfficial: 'Offiziell',
    streamFans: 'Fans',
    streamTwitter: 'Live X (Twitter)',
    streamProfile: 'Mein Profil',
    myPosts: 'Meine Beiträge',
    myPostsCount: 'Beiträge',
    totalLikesReceived: 'Gefällt mir',
    profileBioEmpty: 'Noch keine Biografie hinzugefügt.',
    profileEmptyPosts: 'Du hast noch keine Beiträge geteilt.',
    profileEmptyPostsCta: 'Teile jetzt deine Gedanken und Leidenschaft für Amedspor!',
    loginToViewProfile: 'Bitte melde dich an, um dein Profil und deine Beiträge anzuzeigen.',
    loginToViewProfileDesc: 'Melde dich an, um dein Profil anzuzeigen, dein Avatar anzupassen und deine Beiträge zu verwalten.',
    editProfile: 'Profil bearbeiten',
    viewInFeed: 'Im Feed ansehen',
    postsTab: 'Meine Beiträge',
    officialReadMore: 'Auf offizieller Seite lesen',
    forYou: 'Für dich',
    popular: 'Beliebt',
    composerPlaceholder: 'Was gibt es Neues? Teile deine Gedanken mit einem Hashtag (#)...',
    tweetBtn: 'Posten',
    trendingTitle: 'Trends für dich',
    guestBannerTitle: 'Tritt dem Amedspor Fan-Feed bei',
    guestBannerSub: 'Teile deine Gedanken sofort, tausche dich mit Fans aus.',
    share: 'Teilen',
    copied: 'Beitragslink in Zwischenablage kopiert!',
    sharePrompt: 'Link dieses Beitrags:',
    noPosts: 'Noch keine Beiträge vorhanden. Teile den ersten!',
    replies: 'Antworten',
    backToTimeline: 'Zurück zu Beiträgen',
    replyPlaceholder: 'Antworte...',
    replyBtn: 'Antworten',
    loginToPost: 'Zum Posten anmelden',
    loginRequired: 'Dafür musst du angemeldet sein.',
    title: 'Titel',
    body: 'Inhalt',
    category: 'Kategorie',
    publish: 'Veröffentlichen',
    cancel: 'Abbrechen',
    del: 'Löschen',
    confirmDeleteThread: 'Möchtest du dieses Thema wirklich löschen?',
    confirmDeletePost: 'Möchtest du diese Antwort wirklich löschen?',
    deleted: 'Gelöscht.',
    profile: 'Profil',
    profileSettings: 'Profil & Einstellungen',
    settings: 'Einstellungen',
    generalTab: 'Profil',
    fanTab: 'Fan-Einstellungen',
    securityTab: 'Sicherheit & Passwort',
    adminTab: 'Admin-Bereich',
    bio: 'Biografie / Fan-Nachricht',
    bioPlaceholder: 'z.B. Diren Amedspor! Grün-Rote Leidenschaft...',
    favoritePlayer: 'Lieblingsspieler',
    selectPlayer: 'Aus dem Amedspor-Kader wählen...',
    avatarSelect: 'Profil-Avatar auswählen',
    uploadCustomAvatar: 'Eigenes Foto hochladen',
    uploadHint: 'PNG, JPG, WEBP (Max. 5MB)',
    orPresetAvatars: 'oder aus Club-Vorlagen wählen:',
    nsfwScanning: 'KI 18+ & NSFW-Filter wird gescannt...',
    nsfwBlockedTitle: 'Unangemessenes Bild blockiert (18+ / NSFW)',
    nsfwBlockedDesc: 'Gemäß den Community-Richtlinien sind anstößige oder 18+-Profilbilder nicht gestattet.',
    nsfwPassed: 'Bild genehmigt!',
    nsfwPassedDesc: 'NSFW- und 18+-Sicherheitsfilter erfolgreich bestanden.',
    fileTooLarge: 'Dateigröße muss kleiner als 5 MB sein.',
    notifications: 'Benachrichtigungen',
    notifGoals: 'Live-Tor- & Spielbenachrichtigungen',
    notifForum: 'Forum-Antwortbenachrichtigungen',
    currentEmail: 'Registrierte E-Mail',
    changePassword: 'Passwort ändern',
    newPasswordPlaceholder: 'Neues Passwort (mind. 6 Zeichen)',
    adminBadge: 'ADMIN',
    adminPanelTitle: 'Admin- & Moderationsbereich',
    adminRoleDesc: 'Amedspor Live Hub Administrator',
    adminStats: 'Forum-Statistiken',
    adminThreadsCount: 'Themen gesamt',
    adminPostsCount: 'Antworten gesamt',
    adminPowers: 'Administrator-Befugnisse',
    adminPower1: 'Jedes Thema anheften / lösen (Pin / Unpin)',
    adminPower2: 'Jedes Thema sperren / entsperren (Lock / Unlock)',
    adminPower3: 'Unangemessene Themen und Beiträge direkt löschen',
    pin: 'Anheften',
    unpin: 'Lösen',
    lock: 'Sperren',
    unlock: 'Entsperren',
    pinned: 'Angeheftet',
    unpinned: 'Nicht mehr angeheftet.',
    locked: 'Gesperrt',
    unlocked: 'Entsperrt.',
    threadLocked: 'Dieses Thema ist gesperrt. Keine weiteren Antworten erlaubt.',
    profileTitle: 'Profil & Einstellungen',
    save: 'Speichern',
    saved: 'Gespeichert.',
    loadMore: 'Mehr anzeigen',
    noReplies: 'Noch keine Antworten. Schreibe die erste.',
    threadCreated: 'Thema veröffentlicht.',
    replySent: 'Antwort gesendet.',
    errorGeneric: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    invalidUsername: 'Benutzername: 3-24 Zeichen (Buchstaben, Zahlen, _ und .).',
    usernameTaken: 'Dieser Benutzername ist vergeben.',
    minPassword: 'Das Passwort muss mindestens 6 Zeichen haben.',
    invalidCredentials: 'E-Mail oder Passwort falsch.',
    emailNotConfirmed: 'Deine E-Mail wurde noch nicht bestätigt.',
    justNow: 'gerade eben',
    loading: 'Wird geladen...',
    titleTooShort: 'Der Titel muss mindestens 4 Zeichen haben.',
    liveBadge: 'Live',
    newPostsAvailable: 'neue Beiträge',
    languageSelect: 'App-Sprache',
    securityActive: 'System- & Datenbanksicherheit Aktiv',
    auditLogs: 'Admin-Aktivitätsprotokoll',
    noAuditLogs: 'Noch keine Protokolle vorhanden.',
    roleSecurityNote: 'Datenbank-Rollensicherheit: Unbefugte Rechteausweitung ist strikt gesperrt.',
    rateLimitNote: 'Spamschutz: 15s Thema- / 5s Antwort-Ratenbegrenzung aktiv.'
  }
};

const lang = () => {
  const l = localStorage.getItem('amed_lang') || document.documentElement.lang || 'tr';
  return CI18N[l] ? l : 'tr';
};
const T = (key) => CI18N[lang()][key] ?? CI18N.tr[key] ?? key;

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
  const imgRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s]*)?)/gi;
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
    .replace(/(#[\p{L}\p{N}_]+)/gu, '<span class="soc-hashtag" style="color:var(--amed-green); font-weight:700; cursor:pointer;" data-action="insert-tag" data-tag="$1">$1</span>')
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
  // Harici Free Hosting (Catbox.moe vb.) ve standart güvenli HTTPS görsel URL'leri
  if (/^https:\/\/([a-zA-Z0-9.-]+\.)?(catbox\.moe|imgur\.com|freeimage\.host|supabase\.co|flagcdn\.com)\/[^\s<>"']+/i.test(str)) {
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
  if (cleanUrl) {
    return `<img class="c-avatar" style="width:${size}px;height:${size}px" src="${esc(cleanUrl)}" alt="${esc(name)}" referrerpolicy="no-referrer" />`;
  }
  const palette = ['#059669', '#e11d48', '#0f766e', '#b45309', '#4f46e5', '#0e7490'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `<span class="c-avatar" style="width:${size}px;height:${size}px;background:${palette[h % palette.length]};font-size:${Math.round(size * 0.42)}px">${esc(name.charAt(0).toUpperCase())}</span>`;
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

/* ---------- NSFW +18 GÖRSEL FİLTRESİ (YAPAY ZEKA + HEURİSTİK) ---------- */
let nsfwModelInstance = null;
let nsfwModelPromise = null;

async function ensureNSFWLibraries() {
  if (window.tf && window.nsfwjs) return true;
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

  try {
    if (!window.tf) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js');
    }
    if (!window.nsfwjs) {
      await loadScript('https://cdn.jsdelivr.net/npm/nsfwjs@2.4.2/dist/nsfwjs.min.js');
    }
    return true;
  } catch (err) {
    console.warn('NSFW AI kütüphaneleri dinamik yüklenemedi:', err);
    return false;
  }
}

async function getNSFWModel() {
  if (nsfwModelInstance) return nsfwModelInstance;
  if (nsfwModelPromise) return nsfwModelPromise;

  nsfwModelPromise = (async () => {
    try {
      const ok = await ensureNSFWLibraries();
      if (!ok || typeof window.nsfwjs === 'undefined') return null;
      try {
        // Önce yerel sunucumuzdaki MobileNetV2 modelini yükle
        nsfwModelInstance = await window.nsfwjs.load('/models/nsfw/');
        return nsfwModelInstance;
      } catch (e1) {
        console.warn('Yerel NSFW modeli yüklenemedi, varsayılan deneniyor:', e1);
        try {
          nsfwModelInstance = await window.nsfwjs.load();
          return nsfwModelInstance;
        } catch (e2) {
          console.error('NSFW modeli yüklenemedi:', e2);
          return null;
        }
      }
    } catch (err) {
      console.warn('getNSFWModel error:', err);
      return null;
    } finally {
      nsfwModelPromise = null;
    }
  })();
  return nsfwModelPromise;
}

function getSkinColorDensity(img) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 80;
    const h = 80;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let skinPixels = 0;
    const totalPixels = w * h;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      const isRgbSkin = r > 95 && g > 40 && b > 20 && (Math.max(r, g, b) - Math.min(r, g, b) > 15) && Math.abs(r - g) > 15 && r > g && r > b;
      const isYCbCrSkin = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

      if (isRgbSkin && isYCbCrSkin) {
        skinPixels++;
      }
    }
    return skinPixels / totalPixels;
  } catch (e) {
    return 0;
  }
}

async function verifyImageNSFW(imgElement) {
  const model = await getNSFWModel();
  if (model) {
    try {
      const predictions = await model.classify(imgElement, 3);
      for (const p of predictions) {
        if (p.className === 'Porn' && p.probability > 0.30) {
          return { isNSFW: true, reason: `Müstehcen / Pornografik içerik tespit edildi (%${Math.round(p.probability * 100)})`, predictions };
        }
        if (p.className === 'Hentai' && p.probability > 0.35) {
          return { isNSFW: true, reason: `+18 Çizim / Uygunsuz içerik tespit edildi (%${Math.round(p.probability * 100)})`, predictions };
        }
        if (p.className === 'Sexy' && p.probability > 0.65) {
          return { isNSFW: true, reason: `Aşırı açık / +18 çıplaklık tespit edildi (%${Math.round(p.probability * 100)})`, predictions };
        }
      }
    } catch (classifyErr) {
      console.warn('NSFW AI classification error:', classifyErr);
    }
  }

  // İkincil kontrol: Aşırı açık ten ve çıplaklık heuristiği
  const skinDensity = getSkinColorDensity(imgElement);
  if (skinDensity > 0.55) {
    return { isNSFW: true, reason: `Aşırı çıplaklık ve açık ten yoğunluğu tespit edildi (%${Math.round(skinDensity * 100)})` };
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
        <label class="c-field"><span>${T('emailOrUsername')}</span><input type="text" name="email" autocomplete="username" placeholder="${T('emailOrUsername')}" required /></label>
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
  const redirectTo = window.location.origin;

  if ((kind === 'signup' || kind === 'update') && password.length < 6) return formMsg(form, T('minPassword'));

  setBusy(form, true);
  try {
    if (kind === 'login') {
      let loginEmail = email;
      if (!loginEmail.includes('@')) {
        const { data: resolvedEmail, error: rpcErr } = await sb.rpc('get_email_by_username', { p_username: loginEmail });
        if (rpcErr || !resolvedEmail) {
          setBusy(form, false);
          return formMsg(form, T('usernameNotFound'));
        }
        loginEmail = resolvedEmail;
      }
      const { error } = await sb.auth.signInWithPassword({ email: loginEmail, password });
      if (error) throw error;
      closeDialog();
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
        options: { data: { username, display_name: username }, emailRedirectTo: redirectTo }
      });
      if (error) throw error;
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
        const { data: resolvedEmail } = await sb.rpc('get_email_by_username', { p_username: resetEmail });
        if (resolvedEmail) resetEmail = resolvedEmail;
      }
      const { error } = await sb.auth.resetPasswordForEmail(resetEmail, { redirectTo });
      if (error) throw error;
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
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
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
    toast('Takip edebilmek için lütfen giriş yapın.');
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
      toast('Takipten çıkarıldı.');
    } else {
      const { error } = await sb
        .from('user_follows')
        .insert({ follower_id: me(), following_id: targetUserId });
      if (error) throw error;
      toast('Takip edildi!');
    }
  } catch (err) {
    if (isFollowing) {
      S.followingSet.add(targetUserId);
    } else {
      S.followingSet.delete(targetUserId);
    }
    updateFollowButtons(targetUserId, isFollowing);
    console.error('toggleFollow error:', err);
    toast(err.message || 'İşlem gerçekleştirilemedi.');
  }

  const followersCountEl = $('pucFollowersCount');
  if (followersCountEl && (S.viewingUserId === targetUserId || (!S.viewingUserId && me() === targetUserId))) {
    const counts = await getFollowCounts(targetUserId);
    followersCountEl.textContent = counts.followersCount;
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
      if (text) text.textContent = isFollowing ? 'Takip Ediliyor' : 'Takip Et';
      btn.title = isFollowing ? 'Takibi Bırak' : 'Takip Et';
    } else if (btn.classList.contains('tw-sidebar-follow-btn')) {
      const text = btn.querySelector('span');
      if (text) text.textContent = isFollowing ? 'Takip Ediliyor' : 'Takip Et';
    } else {
      btn.classList.toggle('c-btn-ghost', isFollowing);
      btn.classList.toggle('c-btn-primary', !isFollowing);
      const icon = btn.querySelector('i');
      const text = btn.querySelector('span');
      if (icon) icon.className = isFollowing ? 'ri-user-unfollow-line' : 'ri-user-follow-line';
      if (text) text.textContent = isFollowing ? 'Takibi Bırak' : 'Takip Et';
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
          <div class="tw-follow-avatar-wrap" data-action="view-user-profile" data-user-id="${u.id}" style="cursor:pointer;" title="Profili Gör">
            ${avatarHTML(u, 40)}
          </div>
          <div class="tw-follow-info" data-action="view-user-profile" data-user-id="${u.id}" style="cursor:pointer;" title="Profili Gör">
            <div class="tw-follow-name">
              <span>${esc(u.display_name || u.username)}</span>
              ${u.role === 'admin' ? '<i class="ri-verified-badge-fill verified-badge" title="Yönetici"></i>' : ''}
            </div>
            <div class="tw-follow-handle">@${esc(u.username || 'taraftar')}</div>
          </div>
          <button type="button" class="tw-sidebar-follow-btn ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-user-id="${u.id}">
            <span>${isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
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
          <p style="margin-top:0.75rem;">Kullanıcı profili yükleniyor...</p>
        </div>
      `;
      try {
        const { data, error } = await sb.from('profiles').select('*').eq('id', targetId).single();
        if (error || !data) {
          container.innerHTML = `
            <div class="card" style="padding:2.5rem; text-align:center;">
              <i class="ri-user-unfollow-line" style="font-size:2.5rem; color:var(--amed-red);"></i>
              <h3 style="margin-top:0.5rem;">Kullanıcı bulunamadı</h3>
              <p style="color:var(--text-muted);">Bu profil silinmiş veya mevcut değil.</p>
              <button class="c-btn c-btn-primary" data-action="goto-forum" style="margin-top:1rem;">Akışa Dön</button>
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
            <i class="ri-arrow-left-line"></i> <span>Profilime Dön</span>
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
                  <span>${isFollowing ? 'Takibi Bırak' : 'Takip Et'}</span>
                </button>
              `}
            </div>
          </div>

          <!-- Kimlik Bilgileri -->
          <div class="puc-identity">
            <div class="puc-name-row">
              <h1 class="puc-name">${esc(p.display_name || p.username)}</h1>
              ${isAdmin ? `<span class="admin-badge"><i class="ri-shield-star-fill"></i> ADMIN</span>` : `<span class="fan-badge"><i class="ri-heart-3-fill"></i> TARAFTAR</span>`}
            </div>
            <div class="puc-handle">@${esc(p.username || '')}</div>

            ${p.favorite_player ? `
              <div class="puc-player-row">
                <span class="puc-player-pill" title="Desteklediği Futbolcu">
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
              <span class="puc-stat-lbl">Gönderi</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num" id="pucFollowersCount">${followersCount}</span>
              <span class="puc-stat-lbl">Takipçi</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num" id="pucFollowingCount">${followingCount}</span>
              <span class="puc-stat-lbl">Takip Edilen</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${totalLikes}</span>
              <span class="puc-stat-lbl">Beğeni</span>
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
              <span>${isSelf ? T('myPosts') : 'Gönderiler'} (${userPosts.length})</span>
            </div>
          </div>
          <div class="puc-posts-stream">
            ${userPosts.length ? userPosts.map((t) => renderUserTweet(t)).join('') : `
              <div class="puc-empty-box">
                <i class="ri-chat-new-line" style="font-size:2.5rem; color:var(--amed-green);"></i>
                <div style="font-weight:700; font-size:1.05rem; margin-top:0.4rem;">${isSelf ? T('profileEmptyPosts') : 'Henüz hiçbir gönderi paylaşılmadı.'}</div>
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
          <p class="settings-page-sub">Profil resmi, hesap bilgileri, dil ve güvenlik tercihlerinizi buradan yönetebilirsiniz.</p>
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
              <div class="section-card-title"><i class="ri-user-smile-line"></i> ${T('generalTab')} Bilgileri</div>
            </div>

            <form class="c-form" id="formProfileMain" novalidate>
              <input type="hidden" name="avatar_url" id="pageSelectedAvatarInput" value="${esc(p.avatar_url || '')}" />
              
              <!-- Özel Profil Resmi Yükleme Alanı (Bulut Hosting & NSFW Korumalı) -->
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
                        <i class="ri-delete-bin-line"></i> Fotoğrafı Kaldır
                      </button>
                    ` : ''}
                  </div>
                  <div class="upload-hint"><i class="ri-shield-check-line" style="color:var(--amed-green);"></i> PNG, JPG, WEBP (Maks. 5MB) - Bulut Barındırma & AI NSFW Korumalı</div>
                </div>
              </div>
              <div id="pageAvatarScanStatus" class="avatar-scan-status" style="display:none;"></div>

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
    const imgTarget = $('cropImageTarget');
    const titleEl = $('cropModalTitle');
    const btnConfirm = $('btnCropConfirm');
    const btnCancel = $('btnCancelCrop');
    const btnDismiss = $('btnCropDismiss');
    const btnZoomIn = $('cropBtnZoomIn');
    const btnZoomOut = $('cropBtnZoomOut');
    const btnRotate = $('cropBtnRotate');
    const btnReset = $('cropBtnReset');

    if (!modal || !imgTarget || typeof Cropper === 'undefined') {
      return resolve(dataUri);
    }

    if (titleEl) {
      titleEl.textContent = type === 'avatar' ? 'Profil Resmini Kırp ve Ayarla' : 'Kapak Fotoğrafını Kırp ve Ayarla';
    }

    if (currentCropper) {
      currentCropper.destroy();
      currentCropper = null;
    }

    imgTarget.src = dataUri;
    modal.style.display = 'flex';

    // Cropper instance
    currentCropper = new Cropper(imgTarget, {
      aspectRatio: type === 'avatar' ? 1 : (1200 / 400),
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.92,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false
    });

    const cleanup = () => {
      modal.style.display = 'none';
      if (currentCropper) {
        currentCropper.destroy();
        currentCropper = null;
      }
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      btnDismiss.onclick = null;
      if (btnZoomIn) btnZoomIn.onclick = null;
      if (btnZoomOut) btnZoomOut.onclick = null;
      if (btnRotate) btnRotate.onclick = null;
      if (btnReset) btnReset.onclick = null;
    };

    if (btnZoomIn) btnZoomIn.onclick = () => currentCropper?.zoom(0.1);
    if (btnZoomOut) btnZoomOut.onclick = () => currentCropper?.zoom(-0.1);
    if (btnRotate) btnRotate.onclick = () => currentCropper?.rotate(90);
    if (btnReset) btnReset.onclick = () => currentCropper?.reset();

    btnCancel.onclick = () => {
      cleanup();
      reject(new Error('Kırpma işlemi iptal edildi.'));
    };

    btnDismiss.onclick = () => {
      cleanup();
      reject(new Error('Kırpma işlemi iptal edildi.'));
    };

    btnConfirm.onclick = () => {
      if (!currentCropper) {
        cleanup();
        return resolve(dataUri);
      }
      const canvas = currentCropper.getCroppedCanvas({
        width: type === 'avatar' ? 400 : 1200,
        height: type === 'avatar' ? 400 : 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      const croppedData = canvas.toDataURL('image/jpeg', 0.92);
      cleanup();
      resolve(croppedData);
    };
  });
}

/**
 * Ücretsiz Harici Resim Hostingine (Catbox.moe) Kırpma, Güvenlik ve NSFW Taramalı Yükleme Fonksiyonu.
 * Sunucu diskinde veya veritabanında ASLA dosya saklanmaz.
 */
async function uploadImageToHosting(file, statusBox, type = 'avatar') {
  if (file.size > 8 * 1024 * 1024) {
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `
        <div class="nsfw-alert-error">
          <i class="ri-error-warning-fill"></i>
          <div><strong>Hata:</strong> ${T('fileTooLarge') || 'Görsel boyutu en fazla 8MB olabilir.'}</div>
        </div>
      `;
    }
    throw new Error('Dosya boyutu çok büyük (Maks. 8MB).');
  }

  // 1. Dosyayı oku
  const rawDataUri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 2. Kullanıcıya kırpma ve alanı belirleme arayüzü sun
  const dataUri = await showCropDialog(rawDataUri, type);
  if (!dataUri) return null;

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.innerHTML = `
      <div class="nsfw-scanning-box">
        <i class="ri-loader-4-line spin"></i>
        <span>${T('nsfwScanning') || 'Görsel taranıyor ve analiz ediliyor...'}</span>
      </div>
    `;
  }

  // 3. Kırpılmış görseli kontrol et
  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    tempImg.onload = resolve;
    tempImg.onerror = () => reject(new Error('Görsel okunamadı veya bozuk format.'));
    tempImg.src = dataUri;
  });

  const check = await verifyImageNSFW(tempImg);
  if (check.isNSFW) {
    if (statusBox) {
      statusBox.innerHTML = `
        <div class="nsfw-alert-error">
          <i class="ri-shield-cross-fill" style="color:var(--amed-red); font-size:1.6rem;"></i>
          <div>
            <strong>${T('nsfwBlockedTitle')}</strong><br>
            <span class="nsfw-reason-text">${esc(check.reason || 'Müstehcen / +18 içerik tespit edildi.')}</span>
            <div class="nsfw-desc-sub">${T('nsfwBlockedDesc')}</div>
          </div>
        </div>
      `;
    }
    throw new Error(check.reason || 'Müstehcen / +18 içerik tespit edildi.');
  }

  if (statusBox) {
    statusBox.innerHTML = `
      <div class="nsfw-scanning-box">
        <i class="ri-loader-4-line spin"></i>
        <span>Görsel onaylandı, bulut hostinge aktarılıyor...</span>
      </div>
    `;
  }

  // 4. Catbox.moe'ye aktar
  const uploadRes = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUri })
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.url) {
    throw new Error(uploadData.error || 'Görsel bulut servisine yüklenemedi.');
  }

  if (statusBox) {
    statusBox.innerHTML = `
      <div class="nsfw-alert-success">
        <i class="ri-checkbox-circle-fill" style="color:var(--amed-green); font-size:1.5rem;"></i>
        <div>
          <strong>${T('nsfwPassed')}</strong><br>
          <span>Görsel bulut servisine başarıyla yüklendi.</span>
        </div>
      </div>
    `;
  }

  return uploadData.url;
}



function initPageAvatarUploader() {
  const pickBtn = $('pickPageAvatarBtn');
  const fileInput = $('pageCustomAvatarFile');
  const removeBtn = $('removePageAvatarBtn');
  const statusBox = $('pageAvatarScanStatus');
  const inp = $('pageSelectedAvatarInput');
  const preview = $('pageAvatarPreview');

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (inp) inp.value = '';
      const dummyP = { ...(S.profile || {}), avatar_url: null };
      if (preview) preview.innerHTML = avatarHTML(dummyP, 64);
      removeBtn.style.display = 'none';
      if (statusBox) statusBox.style.display = 'none';
      toast('Fotoğraf kaldırıldı. Kaydet butonuna basarak onaylayın.');
    });
  }

  if (pickBtn && fileInput) {
    pickBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const url = await uploadImageToHosting(file, statusBox, 'avatar');
        if (url) {
          if (inp) inp.value = url;
          if (preview) {
            preview.innerHTML = `<img class="c-avatar" style="width:64px;height:64px;border:2px solid var(--amed-green)" src="${esc(url)}" alt="Avatar" />`;
          }
          if (removeBtn) removeBtn.style.display = 'inline-flex';
          toast('Profil fotoğrafı seçildi. Kaydet butonuna basarak onaylayın.');
        }
      } catch (err) {
        if (err.message !== 'Kırpma işlemi iptal edildi.') {
          console.error('Settings avatar upload error:', err);
          if (statusBox) {
            statusBox.innerHTML = `
              <div class="nsfw-alert-error">
                <i class="ri-error-warning-line"></i>
                <div>${esc(err.message || 'Yükleme sırasında hata oluştu.')}</div>
              </div>
            `;
          }
        }
      } finally {
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
    const text = `${t.title || ''} ${t.body || ''}`;
    const matches = text.match(/#[\p{L}\p{N}_]+/gu);
    if (matches) {
      matches.forEach((tag) => {
        const norm = tag.trim();
        if (norm.length > 1) {
          counts.set(norm, (counts.get(norm) || 0) + 1);
        }
      });
    }
  });

  // 2. Kullanıcıların gönderi yanıtlarındaki (posts) gerçek etiketleri de dahil et
  (S.posts || []).forEach((p) => {
    const text = p.body || '';
    const matches = text.match(/#[\p{L}\p{N}_]+/gu);
    if (matches) {
      matches.forEach((tag) => {
        const norm = tag.trim();
        if (norm.length > 1) {
          counts.set(norm, (counts.get(norm) || 0) + 1);
        }
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
          Henüz taraftar etiketi yok.<br/>İlk etiketi (#) gönderinizde siz oluşturun!
        </div>
      `;
    } else {
      sidebarList.innerHTML = userHashtags.slice(0, 8).map(({ tag, count }) => `
        <div class="tw-trend-item" data-action="insert-tag" data-tag="${esc(tag)}" title="Bu etiketi ekle">
          <div class="tw-trend-meta">Kullanıcı Gündemi · Trend</div>
          <div class="tw-trend-tag">${esc(tag)}</div>
          <div class="tw-trend-count" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${count} gönderi</div>
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
        <span class="tw-tags-label" title="Kullanıcı Etiketleri"><i class="ri-fire-line" style="color: var(--amed-red);"></i> Trend:</span>
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
            <textarea id="quickPostInput" rows="3" maxlength="280" placeholder="${T('composerPlaceholder')}" required></textarea>
            
            <!-- Görsel Önizleme Alanı -->
            <div id="composerMediaPreview" class="composer-media-preview" style="display:none;"></div>
            
            <!-- Açılır Emoji Çekmecesi -->
            <div id="composerEmojiBar" class="composer-pop-drawer" style="display:none;">
              <div class="composer-drawer-title"><i class="ri-emotion-line"></i> Emoji Seç</div>
              <div class="composer-emoji-grid">
                ${['💚', '❤️', '⚽', '🦅', '🦁', '🏆', '🔥', '👏', '👑', '🤍', '🟢', '🔴', '👊', '⚡', '🎉', '🏟️', '✊', '✌️', '🥇', '💯', '🎯', '🚀', '😍', '💪', '🙌', '🫡', '😎'].map(em => `<button type="button" class="composer-emoji-btn" data-action="insert-emoji" data-emoji="${em}">${em}</button>`).join('')}
              </div>
            </div>

            <!-- Açılır Hashtag Çekmecesi -->
            <div id="composerHashtagBar" class="composer-pop-drawer" style="display:none;">
              <div class="composer-drawer-title"><i class="ri-hashtag"></i> Popüler Amedspor Etiketleri</div>
              <div class="composer-tag-pills-row">
                ${['#Amedspor', '#DirenAmedspor', '#ŞampiyonAmed', '#Diyarbakır', '#HedefSüperLig', '#YeşilKırmızı', '#Barikat', '#MorAmed', '#BizAmediz', '#AmedsporSevdası'].map(tag => `<button type="button" class="composer-tag-chip" data-action="insert-tag" data-tag="${tag}">${tag}</button>`).join('')}
              </div>
            </div>

            ${tagsRowHTML}
            <div class="tw-composer-bar">
              <div class="tw-composer-tools">
                <button type="button" class="tw-tool-btn" data-action="trigger-composer-image" title="Görsel Yükle"><i class="ri-image-line"></i></button>
                <input type="file" id="twComposerImgFile" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;" />
                <button type="button" class="tw-tool-btn" data-action="toggle-composer-tags" title="Hashtag Ekle"><i class="ri-hashtag"></i></button>
                <button type="button" class="tw-tool-btn" data-action="toggle-composer-emoji" title="Emoji Ekle"><i class="ri-emotion-line"></i></button>
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
    <article class="tweet-card card official-club-card" id="official-${esc(p.id)}">
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
    <article class="tweet-card card ${t.is_pinned ? 'is-pinned' : ''}" id="thread-${t.id}">
      <div class="tweet-layout">
        <div class="tweet-avatar-col" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;" title="Profili Gör">
          ${avatarHTML(author, 44)}
        </div>
        <div class="tweet-body-col">
          <div class="tweet-header">
            <div class="tweet-user-meta">
              <span class="tweet-display-name" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;" title="Profili Gör">${esc(author.display_name || author.username || 'Amedsporlu')}</span>
              ${isAuthorAdmin ? `<i class="ri-verified-badge-fill tw-verified-badge" title="Yönetici"></i><span class="admin-badge">ADMIN</span>` : ''}
              ${author.favorite_player ? `<span class="fav-player-chip"><i class="ri-t-shirt-2-line"></i> ${esc(author.favorite_player)}</span>` : ''}
              <span class="tweet-handle" data-action="view-user-profile" data-user-id="${t.author_id || ''}" style="cursor:pointer;">@${esc(author.username || 'fan')}</span>
              <span class="tweet-separator">·</span>
              <span class="tweet-time">${ago(t.created_at)}</span>
              ${t.is_pinned ? `<span class="badge-pinned"><i class="ri-pushpin-2-fill"></i> ${T('pinned')}</span>` : ''}
              ${t.is_locked ? `<span class="badge-locked"><i class="ri-lock-2-fill"></i> ${T('locked')}</span>` : ''}
            </div>

            <div class="tweet-menu-actions">
              ${(!isSelf && t.author_id) ? `
                <button type="button" class="tw-follow-quick-btn ${isFollowing ? 'following' : ''}" data-action="toggle-follow" data-user-id="${t.author_id}" title="${isFollowing ? 'Takibi Bırak' : 'Takip Et'}">
                  <i class="${isFollowing ? 'ri-user-check-line' : 'ri-user-add-line'}"></i>
                  <span>${isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
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
            <button class="tw-btn reply" data-action="open-thread" data-id="${t.id}" title="Yanıtla">
              <i class="ri-chat-1-line"></i> <span>${t.reply_count || 0}</span>
            </button>
            <button class="tw-btn repost" data-action="share-thread" data-id="${t.id}" title="${T('share')}">
              <i class="ri-repeat-line"></i>
            </button>
            <button class="tw-btn like ${S.likedThreads.has(t.id) ? 'liked' : ''}" data-action="like-thread" data-id="${t.id}" title="Beğen">
              <i class="${S.likedThreads.has(t.id) ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i> <span>${t.like_count || 0}</span>
            </button>
            <button class="tw-btn share" data-action="share-thread" data-id="${t.id}" title="Paylaş">
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
              ${isAdmin ? `<span class="admin-badge"><i class="ri-shield-star-fill"></i> ADMIN</span>` : `<span class="fan-badge"><i class="ri-heart-3-fill"></i> TARAFTAR</span>`}
            </div>
            <div class="puc-handle">@${esc(p.username || '')}</div>
            ${p.favorite_player ? `
              <div class="puc-player-row">
                <span class="puc-player-pill" title="Desteklediği Futbolcu">
                  <i class="ri-t-shirt-2-fill"></i> ${esc(p.favorite_player)}
                </span>
              </div>
            ` : ''}
            ${p.bio ? `<div class="puc-bio">${esc(p.bio)}</div>` : ''}
          </div>
          <div class="puc-stats-grid">
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${myPosts.length}</span>
              <span class="puc-stat-lbl">Gönderi</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${followersCount}</span>
              <span class="puc-stat-lbl">Takipçi</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${followingCount}</span>
              <span class="puc-stat-lbl">Takip Edilen</span>
            </div>
            <div class="puc-stat-cell">
              <span class="puc-stat-num">${totalLikes}</span>
              <span class="puc-stat-lbl">Beğeni</span>
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
          <span><strong>${t.like_count || 0}</strong> Beğeni</span>
          <span><strong>${t.reply_count || 0}</strong> Yanıt</span>
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

async function handleThreadForm(form) {
  if (!requireLogin()) return;
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  const body = String(fd.get('body') || '').trim();
  const category_id = Number(fd.get('category_id'));
  if (title.length < 4) return formMsg(form, T('titleTooShort'));
  if (!body) return formMsg(form, T('errorGeneric'));
  if (body.length > 280) return formMsg(form, 'Gönderi en fazla 280 karakter olabilir.');
  setBusy(form, true);
  const { data, error } = await sb.from('forum_threads').insert({
    title,
    body,
    category_id,
    author_id: me()
  }).select('id').single();
  setBusy(form, false);
  if (error) return formMsg(form, errMsg(error));
  closeDialog();
  toast(T('threadCreated'));
  openThread(data.id);
}

async function handleReplyForm(form) {
  if (!requireLogin()) return;
  if (S.thread?.is_locked && S.profile?.role !== 'admin') {
    return toast(T('threadLocked'), 'err');
  }
  const input = form.querySelector('textarea');
  const body = input.value.trim();
  if (!body || !S.thread) return;
  if (body.length > 280) return toast('Yanıt en fazla 280 karakter olabilir.', 'err');
  setBusy(form, true);
  const { error } = await sb.from('forum_posts').insert({
    thread_id: S.thread.id,
    body,
    author_id: me()
  });
  setBusy(form, false);
  if (error) return toast(errMsg(error), 'err');
  input.value = '';
  toast(T('replySent'));
  await loadThread(S.thread.id);
  renderThreadHead();
  renderPosts();
  renderComposer();
  const last = S.posts[S.posts.length - 1];
  if (last) $(`post-${last.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  const emojiBar = $('composerEmojiBar');
  if (emojiBar) emojiBar.style.display = 'none';
  const input = $('quickPostInput');
  if (!input) {
    openNewThread();
    setTimeout(() => {
      const bodyInput = document.querySelector('form[data-form="thread"] textarea[name="body"]');
      if (bodyInput) {
        const cur = bodyInput.value ? bodyInput.value.trim() : '';
        const add = (cur ? ' ' : '') + tag + ' ';
        if ((cur + add).length <= 280) {
          bodyInput.value = cur + add;
          bodyInput.focus();
        }
      }
    }, 100);
    return;
  }
  const cur = input.value ? input.value.trim() : '';
  const add = (cur ? ' ' : '') + tag + ' ';
  if ((cur + add).length > 280) {
    toast('Hashtag eklendiğinde 280 karakter sınırı aşıldığı için eklenemedi.', 'warn');
    return;
  }
  input.value = cur + add;
  input.focus();
  updateQuickCharCount();
}

async function shareThread(id) {
  const url = `${window.location.origin}${window.location.pathname}#forum/${id}`;
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
  if (file.size > 5 * 1024 * 1024) {
    toast('Görsel boyutu en fazla 5MB olabilir.', 'err');
    return;
  }
  const preview = $('composerMediaPreview');
  if (preview) {
    preview.style.display = 'block';
    preview.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem; padding:0.6rem 0.85rem; border-radius:10px; background:var(--bg-subtle); font-size:0.85rem; color:var(--text-secondary); border:1px solid var(--border-light);">
        <i class="ri-loader-4-line spin" style="color:var(--amed-green); font-size:1.1rem;"></i> Görsel yükleniyor, lütfen bekleyin...
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
        throw new Error(json.error || 'Görsel yüklenemedi.');
      }
      S.composerUploadedImage = json.url;
      if (preview) {
        preview.innerHTML = `
          <div class="composer-preview-box">
            <img src="${esc(json.url)}" alt="Önizleme" />
            <button type="button" class="composer-preview-remove" data-action="remove-composer-img" title="Görseli Kaldır">
              <i class="ri-close-line"></i>
            </button>
          </div>
        `;
      }
      toast('Görsel başarıyla eklendi! 📸');
    } catch (err) {
      if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
      }
      S.composerUploadedImage = null;
      toast(err.message || 'Görsel yükleme hatası', 'err');
    }
  };
  reader.readAsDataURL(file);
}

async function handleQuickPost(form) {
  if (!requireLogin()) return;
  const input = $('quickPostInput');
  const titleInput = $('quickPostTitle');
  const catSelect = $('quickPostCat');
  let body = (input?.value || '').trim();
  let title = (titleInput?.value || '').trim();
  const category_id = Number(catSelect?.value || S.categories[0]?.id || 1);

  if (!body && !S.composerUploadedImage) return toast(T('errorGeneric'), 'err');
  if (body.length > 280) {
    return toast('Gönderi 280 karakterden uzun olamaz.', 'err');
  }

  if (S.composerUploadedImage) {
    body = body ? `${body}\n${S.composerUploadedImage}` : S.composerUploadedImage;
  }

  if (!title) {
    title = body ? body.slice(0, 60).replace(/[\r\n]+/g, ' ').trim() : 'Amedspor Taraftar Paylaşımı';
    if (title.length < 4) title = 'Amedspor Taraftar Paylaşımı';
  }

  setBusy(form, true);
  const { data, error } = await sb.from('forum_threads').insert({
    title,
    body,
    category_id,
    author_id: me()
  }).select('id').single();
  setBusy(form, false);

  if (error) return toast(errMsg(error), 'err');
  if (input) input.value = '';
  if (titleInput) titleInput.value = '';
  S.composerUploadedImage = null;
  const preview = $('composerMediaPreview');
  if (preview) {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
  const fileInp = $('twComposerImgFile');
  if (fileInp) fileInp.value = '';
  updateQuickCharCount();
  toast(T('threadCreated'));
  await loadThreads();
  renderThreadList();
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
  if (S.view !== 'list' || !S.threads || !S.threads.length) return;
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
        const emojiBar = $('composerEmojiBar');
        if (emojiBar) emojiBar.style.display = 'none';
        if (tagBar) tagBar.style.display = tagBar.style.display === 'none' ? 'block' : 'none';
        return;
      }
      case 'toggle-composer-emoji': {
        const emojiBar = $('composerEmojiBar');
        const tagBar = $('composerHashtagBar');
        if (tagBar) tagBar.style.display = 'none';
        if (emojiBar) emojiBar.style.display = emojiBar.style.display === 'none' ? 'block' : 'none';
        return;
      }
      case 'insert-emoji': {
        const em = el.dataset.emoji;
        const input = $('quickPostInput');
        if (input && em) {
          const cur = input.value || '';
          if (cur.length + em.length <= 280) {
            input.value = cur + em;
            input.focus();
            updateQuickCharCount();
          }
        }
        return;
      }
      case 'remove-composer-img': {
        S.composerUploadedImage = null;
        const preview = $('composerMediaPreview');
        if (preview) {
          preview.style.display = 'none';
          preview.innerHTML = '';
        }
        const fileInp = $('twComposerImgFile');
        if (fileInp) fileInp.value = '';
        toast('Görsel kaldırıldı.');
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
    renderHeaderAuth();
    renderForum();
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
    if (tabId === 'profile') renderProfilePage();
    if (tabId === 'settings') renderSettingsPage();
  };

  const navProfileTab = $('navProfileTab');
  if (navProfileTab) {
    navProfileTab.addEventListener('click', () => {
      openProfile();
    });
  }

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
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        if (S.view === 'thread') {
          renderComposer();
          refreshForum(true);
        } else refreshForum(true);
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
}

init();
