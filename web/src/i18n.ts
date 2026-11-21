export const langs = ["en", "tr", "nl"] as const;
export type Lang = (typeof langs)[number];

export const links = {
  play: "https://play.google.com/store/apps/details?id=com.vu4ll.monedsa",
  apk: "https://github.com/Vu4ll/monedsa/releases/latest",
  source: "https://github.com/Vu4ll/monedsa",
  issues: "https://github.com/Vu4ll/monedsa/issues/new",
  email: "contact@vu4ll.nl",
};

/** Path of a page in another language. `page` is "" for home or "privacy-policy". */
export const pathFor = (lang: Lang, page = "") => {
  const base = lang === "en" ? "/" : `/${lang}/`;
  return page ? `${base}${page}/` : base;
};

type DemoCategory = { id: string; name: string; color: string; type: "income" | "expense" };

const en = {
  langName: "English",
  meta: {
    title: "Monedsa, income and expense tracker for Android",
    description:
      "Track income and expenses on your Android phone. No account, no server: your data stays on your device, with optional backups to your own Google Drive.",
  },
  nav: { source: "Source code", languages: "Language" },
  hero: {
    title: "Your money stays on your phone.",
    lede: "Monedsa tracks income and expenses without an account or a server. Everything is stored on your device, and if you want backups, they go to your own Google Drive.",
    play: "Get it on Google Play",
    apk: "Download the APK",
    requires: "Free and open source. Android 7.0 or newer.",
  },
  demo: {
    label: "Try it here",
    balance: "Balance",
    income: "Income",
    expense: "Expense",
    amount: "Amount",
    category: "Category",
    add: "Add transaction",
    reset: "Start over",
    note: "This demo runs only in this tab and sends nothing anywhere.",
    empty: "No transactions yet.",
    error: "Enter a valid amount greater than 0",
    locale: "en-US",
    currency: "USD",
    categories: [
      { id: "salary", name: "Salary", color: "#2F7A4C", type: "income" },
      { id: "freelance", name: "Freelance", color: "#3A7CA5", type: "income" },
      { id: "groceries", name: "Groceries", color: "#C27C2C", type: "expense" },
      { id: "rent", name: "Rent", color: "#8B5A9E", type: "expense" },
      { id: "transport", name: "Transport", color: "#B8443A", type: "expense" },
    ] as DemoCategory[],
    seed: [
      { category: "salary", amount: 3000 },
      { category: "rent", amount: 950 },
      { category: "groceries", amount: 64.3 },
    ],
  },
  where: {
    title: "Where your data lives",
    lede: "Monedsa 2.0 has no server of its own. There is nothing to sign up for and nothing to sign in to.",
    phone: "Your phone",
    phoneBody: "Transactions, categories and settings are stored in the app. Uninstalling removes them.",
    drive: "Your Google Drive",
    driveBody: "Optional. Backups go to a private app folder in your Drive that only Monedsa can open, daily, weekly or when you tap Back up now.",
    server: "Monedsa servers",
    serverBody: "None. Monedsa doesn't collect, see or store your data.",
  },
  features: {
    title: "What it does",
    list: [
      { title: "Monthly overview", body: "See each month's income, expenses and balance, with spending broken down by category." },
      { title: "Categories with icons and colours", body: "Make your own income and expense categories and recognise them at a glance." },
      { title: "Sort, filter and search", body: "Find a transaction by amount, date, category or description." },
      { title: "Your currency", body: "Pick the currency you count in, including the Turkish lira, euro, dollar and pound." },
      { title: "Light and dark", body: "Follows your phone's theme, or pick one yourself. Available in English, Turkish and Dutch." },
      { title: "Import from file", body: "Restore a backup file, or bring over your data from Monedsa 1.6." },
    ],
  },
  shots: {
    title: "A look inside",
    placeholder: "Screenshot coming soon",
    items: ["Home", "New transaction", "Categories", "Settings"],
  },
  move: {
    title: "Coming from Monedsa 1.6?",
    lede: "The old server shuts down on 20 December 2026. Until then you can take your data with you:",
    steps: [
      "In Monedsa 1.6, open Settings and tap Export my data. Keep the .json file.",
      "Update to Monedsa 2.0.",
      "Open Settings, tap Import from file and choose the .json file.",
    ],
    after: "After 20 December, data on the old server can no longer be exported.",
  },
  download: {
    title: "Get Monedsa",
    lede: "Monedsa is free, has no ads and is open source under the GPL‑3.0 licence.",
  },
  footer: {
    privacy: "Privacy policy",
    source: "Source code",
    issue: "Report an issue",
    contact: "Contact",
  },
};

export type Strings = typeof en;

const tr: Strings = {
  langName: "Türkçe",
  meta: {
    title: "Monedsa, Android için gelir gider takibi",
    description:
      "Android telefonunuzda gelir ve giderlerinizi takip edin. Hesap yok, sunucu yok: verileriniz cihazınızda kalır, isterseniz kendi Google Drive'ınıza yedeklenir.",
  },
  nav: { source: "Kaynak kod", languages: "Dil" },
  hero: {
    title: "Paranız telefonunuzda kalır.",
    lede: "Monedsa gelir ve giderlerinizi hesap ya da sunucu olmadan takip eder. Her şey cihazınızda saklanır; yedek isterseniz kendi Google Drive'ınıza gider.",
    play: "Google Play'den indir",
    apk: "APK dosyasını indir",
    requires: "Ücretsiz ve açık kaynak. Android 7.0 veya üstü.",
  },
  demo: {
    label: "Burada deneyin",
    balance: "Bakiye",
    income: "Gelir",
    expense: "Gider",
    amount: "Tutar",
    category: "Kategori",
    add: "İşlem ekle",
    reset: "Baştan başla",
    note: "Bu demo yalnızca bu sekmede çalışır ve hiçbir yere veri göndermez.",
    empty: "Henüz işlem yok.",
    error: "0'dan büyük geçerli bir tutar girin",
    locale: "tr-TR",
    currency: "TRY",
    categories: [
      { id: "salary", name: "Maaş", color: "#2F7A4C", type: "income" },
      { id: "freelance", name: "Serbest iş", color: "#3A7CA5", type: "income" },
      { id: "groceries", name: "Market", color: "#C27C2C", type: "expense" },
      { id: "rent", name: "Kira", color: "#8B5A9E", type: "expense" },
      { id: "transport", name: "Ulaşım", color: "#B8443A", type: "expense" },
    ],
    seed: [
      { category: "salary", amount: 45000 },
      { category: "rent", amount: 18000 },
      { category: "groceries", amount: 1240.5 },
    ],
  },
  where: {
    title: "Verileriniz nerede duruyor",
    lede: "Monedsa 2.0'ın kendine ait bir sunucusu yok. Kaydolacağınız ya da giriş yapacağınız bir şey de yok.",
    phone: "Telefonunuz",
    phoneBody: "İşlemler, kategoriler ve ayarlar uygulamanın içinde saklanır. Uygulamayı kaldırınca silinir.",
    drive: "Google Drive'ınız",
    driveBody: "İsteğe bağlı. Yedekler Drive'ınızda yalnızca Monedsa'nın açabildiği gizli bir uygulama klasörüne gider; günlük, haftalık ya da Şimdi yedekle'ye dokunduğunuzda.",
    server: "Monedsa sunucuları",
    serverBody: "Yok. Monedsa verilerinizi toplamaz, görmez ve saklamaz.",
  },
  features: {
    title: "Neler yapabilir",
    list: [
      { title: "Aylık görünüm", body: "Her ayın gelirini, giderini ve bakiyesini, harcamaların kategorilere göre dağılımıyla görün." },
      { title: "Simgeli ve renkli kategoriler", body: "Kendi gelir ve gider kategorilerinizi oluşturun, bir bakışta tanıyın." },
      { title: "Sıralama, filtre ve arama", body: "Bir işlemi tutara, tarihe, kategoriye ya da açıklamaya göre bulun." },
      { title: "Kendi para biriminiz", body: "Hesap tuttuğunuz para birimini seçin: Türk lirası, euro, dolar, sterlin ve diğerleri." },
      { title: "Açık ve koyu tema", body: "Telefonunuzun temasını izler ya da kendiniz seçersiniz. Türkçe, İngilizce ve Felemenkçe." },
      { title: "Dosyadan içe aktarma", body: "Bir yedek dosyasını geri yükleyin ya da verilerinizi Monedsa 1.6'dan taşıyın." },
    ],
  },
  shots: {
    title: "İçeriden bir bakış",
    placeholder: "Ekran görüntüsü yakında",
    items: ["Ana sayfa", "Yeni işlem", "Kategoriler", "Ayarlar"],
  },
  move: {
    title: "Monedsa 1.6'dan mı geliyorsunuz?",
    lede: "Eski sunucu 20 Aralık 2026'da kapanıyor. O zamana kadar verilerinizi yanınızda götürebilirsiniz:",
    steps: [
      "Monedsa 1.6'da Ayarlar'ı açın ve Verilerimi dışa aktar'a dokunun. .json dosyasını saklayın.",
      "Monedsa 2.0'a güncelleyin.",
      "Ayarlar'ı açın, Dosyadan içe aktar'a dokunun ve .json dosyasını seçin.",
    ],
    after: "20 Aralık'tan sonra eski sunucudaki veriler dışa aktarılamaz.",
  },
  download: {
    title: "Monedsa'yı edinin",
    lede: "Monedsa ücretsizdir, reklam içermez ve GPL‑3.0 lisansıyla açık kaynaktır.",
  },
  footer: {
    privacy: "Gizlilik politikası",
    source: "Kaynak kod",
    issue: "Sorun bildir",
    contact: "İletişim",
  },
};

const nl: Strings = {
  langName: "Nederlands",
  meta: {
    title: "Monedsa, inkomsten en uitgaven bijhouden op Android",
    description:
      "Houd je inkomsten en uitgaven bij op je Android-telefoon. Geen account, geen server: je gegevens blijven op je apparaat, met optionele back-ups in je eigen Google Drive.",
  },
  nav: { source: "Broncode", languages: "Taal" },
  hero: {
    title: "Je geld blijft op je telefoon.",
    lede: "Monedsa houdt je inkomsten en uitgaven bij zonder account of server. Alles staat op je apparaat, en als je back-ups wilt, gaan die naar je eigen Google Drive.",
    play: "Download via Google Play",
    apk: "Download de APK",
    requires: "Gratis en open source. Android 7.0 of nieuwer.",
  },
  demo: {
    label: "Probeer het hier",
    balance: "Saldo",
    income: "Inkomsten",
    expense: "Uitgaven",
    amount: "Bedrag",
    category: "Categorie",
    add: "Transactie toevoegen",
    reset: "Opnieuw beginnen",
    note: "Deze demo werkt alleen in dit tabblad en stuurt nergens iets heen.",
    empty: "Nog geen transacties.",
    error: "Voer een geldig bedrag groter dan 0 in",
    locale: "nl-NL",
    currency: "EUR",
    categories: [
      { id: "salary", name: "Salaris", color: "#2F7A4C", type: "income" },
      { id: "freelance", name: "Freelance", color: "#3A7CA5", type: "income" },
      { id: "groceries", name: "Boodschappen", color: "#C27C2C", type: "expense" },
      { id: "rent", name: "Huur", color: "#8B5A9E", type: "expense" },
      { id: "transport", name: "Vervoer", color: "#B8443A", type: "expense" },
    ],
    seed: [
      { category: "salary", amount: 2800 },
      { category: "rent", amount: 1150 },
      { category: "groceries", amount: 58.75 },
    ],
  },
  where: {
    title: "Waar je gegevens staan",
    lede: "Monedsa 2.0 heeft geen eigen server. Je hoeft je nergens voor aan te melden en nergens in te loggen.",
    phone: "Je telefoon",
    phoneBody: "Transacties, categorieën en instellingen staan in de app. Verwijder je de app, dan zijn ze weg.",
    drive: "Je Google Drive",
    driveBody: "Optioneel. Back-ups gaan naar een privé-app-map in je Drive die alleen Monedsa kan openen: dagelijks, wekelijks of wanneer je op Nu back-up maken tikt.",
    server: "Monedsa-servers",
    serverBody: "Geen. Monedsa verzamelt, ziet en bewaart je gegevens niet.",
  },
  features: {
    title: "Wat het doet",
    list: [
      { title: "Overzicht per maand", body: "Zie per maand je inkomsten, uitgaven en saldo, met je uitgaven verdeeld per categorie." },
      { title: "Categorieën met iconen en kleuren", body: "Maak je eigen categorieën voor inkomsten en uitgaven en herken ze in één oogopslag." },
      { title: "Sorteren, filteren en zoeken", body: "Vind een transactie op bedrag, datum, categorie of omschrijving." },
      { title: "Je eigen valuta", body: "Kies de valuta waarin je rekent, waaronder de euro, Turkse lira, dollar en het pond." },
      { title: "Licht en donker", body: "Volgt het thema van je telefoon, of kies er zelf een. In het Nederlands, Engels en Turks." },
      { title: "Importeren uit bestand", body: "Zet een back-upbestand terug, of neem je gegevens mee uit Monedsa 1.6." },
    ],
  },
  shots: {
    title: "Een kijkje in de app",
    placeholder: "Schermafbeelding volgt",
    items: ["Start", "Nieuwe transactie", "Categorieën", "Instellingen"],
  },
  move: {
    title: "Kom je van Monedsa 1.6?",
    lede: "De oude server gaat op 20 december 2026 uit. Tot die tijd kun je je gegevens meenemen:",
    steps: [
      "Open in Monedsa 1.6 de Instellingen en tik op Mijn gegevens exporteren. Bewaar het .json-bestand.",
      "Update naar Monedsa 2.0.",
      "Open Instellingen, tik op Importeren uit bestand en kies het .json-bestand.",
    ],
    after: "Na 20 december kunnen gegevens op de oude server niet meer worden geëxporteerd.",
  },
  download: {
    title: "Monedsa downloaden",
    lede: "Monedsa is gratis, heeft geen advertenties en is open source onder de GPL‑3.0-licentie.",
  },
  footer: {
    privacy: "Privacybeleid",
    source: "Broncode",
    issue: "Probleem melden",
    contact: "Contact",
  },
};

export const ui: Record<Lang, Strings> = { en, tr, nl };
