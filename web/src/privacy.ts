import type { Lang } from "./i18n";

/*
 * Privacy policy for Monedsa 2.0. Strings may contain simple inline HTML
 * (links, <code>); they are our own content and rendered with set:html.
 */

export type Section = { title: string; body: string[]; list?: string[] };
export type Policy = {
  title: string;
  updated: string;
  summary: string[];
  sections: Section[];
};

const mail = `<a href="mailto:contact@vu4ll.nl">contact@vu4ll.nl</a>`;
const website = `<a href="https://vu4ll.nl" target="_blank">vu4ll.nl</a>`;
const googlePolicy = "https://policies.google.com/privacy";
const userDataPolicy = "https://developers.google.com/terms/api-services-user-data-policy";

const en: Policy = {
  title: "Privacy policy",
  updated: "Last updated 21 November 2026. Applies to Monedsa 2.0 and later. For version 1.6 and earlier, see the section about those versions below.",
  summary: [
    "Monedsa stores your data on your phone. It has no account, no server, no ads and no analytics.",
    "If you turn on Google Drive backup, your backups are stored in your own Google account. We can't see them.",
  ],
  sections: [
    {
      title: "Who we are",
      body: [
        `Monedsa is an open source app made by Vu4ll. For anything about this policy, email ${mail} or visit ${website}.`,
      ],
    },
    {
      title: "Data stored on your device",
      body: [
        "Everything you enter in Monedsa is stored only in the app's private storage on your phone:",
      ],
      list: [
        "transactions: amount, type, category, date and the optional description",
        "categories: name, icon and colour",
        "settings: theme, language, currency and backup preferences",
      ],
    },
    {
      title: "Data we collect",
      body: [
        "None. Monedsa has no server of its own and doesn't send your data, usage statistics, crash reports or device identifiers to us or to anyone else. The app contains no advertising or analytics code.",
      ],
    },
    {
      title: "Google Drive backup",
      body: [
        "Backup is optional and off until you connect Google Drive in Settings. When you do, Google asks you to allow Monedsa to use the <code>drive.appdata</code> permission.",
        "This permission gives Monedsa access to a hidden app folder in your Drive and nothing else. Monedsa can't see, read or change any of your other Drive files, and other apps can't see this folder.",
        "Monedsa uses this access only to save a backup file of your transactions, categories and settings to that folder, and to read it back when you restore. Backups are made when you tap Back up now, or daily or weekly if you turn on automatic backup.",
        `Your backups are stored by Google under the <a href="${googlePolicy}">Google privacy policy</a>. Monedsa's use and transfer of information received from Google APIs adheres to the <a href="${userDataPolicy}">Google API Services User Data Policy</a>, including the Limited Use requirements. Data from Google is never sold, used for advertising or shared with anyone.`,
        "You can disconnect Google Drive in Settings at any time. To delete the backup itself, open Google Drive on the web, go to Settings, then Manage apps, and choose Delete hidden app data next to Monedsa.",
      ],
    },
    {
      title: "Importing and exporting files",
      body: [
        "When you import a file, Monedsa reads only the file you choose, and only to restore its data on your phone.",
      ],
    },
    {
      title: "Permissions",
      list: [
        "Internet and network state: used only to reach Google Drive for backups. Without Drive backup, Monedsa makes no network connections.",
      ],
      body: [],
    },
    {
      title: "Google Play",
      body: [
        `If you install Monedsa from Google Play, Google may collect information about the installation under its own <a href="${googlePolicy}">privacy policy</a>. We don't receive personal data from Google Play.`,
      ],
    },
    {
      title: "Deleting your data",
      body: [
        "Uninstalling Monedsa, or clearing its storage in your phone's settings, deletes all data on your device. Drive backups stay in your Google account until you delete them as described above.",
      ],
    },
    {
      title: "Monedsa 1.6 and earlier (until 20 December 2026)",
      body: [
        "Monedsa 1.6 and earlier work differently: they need an account and store your data on our server. Until that server shuts down on 20 December 2026, the following applies to those versions.",
        "When you sign in with Google, Google confirms your identity through Firebase Authentication and we receive your name and email address. If you send a message from the in-app support form, it reaches us by email so we can reply.",
        "We use this data only to run your account and show your data in the app. We don't sell it, use it for advertising or share it with anyone.",
        `You can export your data from the 1.6 app at any time before the shutdown and import it into Monedsa 2.0. To delete your account and data before then, email ${mail}. On 20 December 2026 the server is shut down and all account data on it is permanently deleted.`,
      ],
      list: [
        "account: name, username, email address and, if you didn't sign in with Google, a hash of your password (never the password itself)",
        "transactions: amount, type, category, date and the optional description",
        "categories: name, colour and type",
      ],
    },
    {
      title: "Children",
      body: [
        "Monedsa doesn't collect personal data from anyone, including children.",
      ],
    },
    {
      title: "Changes to this policy",
      body: [
        "If this policy changes, the new version is published on this page with a new date. Because the app is open source, you can also follow every change on GitHub.",
      ],
    },
  ],
};

const tr: Policy = {
  title: "Gizlilik politikası",
  updated: "Son güncelleme 21 Kasım 2026. Monedsa 2.0 ve sonraki sürümler için geçerlidir. 1.6 ve önceki sürümler için aşağıdaki ilgili bölüme bakın.",
  summary: [
    "Monedsa verilerinizi telefonunuzda saklar. Hesap, sunucu, reklam ya da analiz yoktur.",
    "Google Drive yedeklemesini açarsanız yedekleriniz kendi Google hesabınızda saklanır. Biz onları göremeyiz.",
  ],
  sections: [
    {
      title: "Biz kimiz",
      body: [
        `Monedsa, Vu4ll tarafından geliştirilen açık kaynaklı bir uygulamadır. Bu politikayla ilgili her konuda ${mail} adresine yazabilirsiniz. Ayrıca ${website} adresini ziyaret edebilirsiniz.`,
      ],
    },
    {
      title: "Cihazınızda saklanan veriler",
      body: [
        "Monedsa'ya girdiğiniz her şey yalnızca telefonunuzda, uygulamanın özel depolama alanında saklanır:",
      ],
      list: [
        "işlemler: tutar, tür, kategori, tarih ve isteğe bağlı açıklama",
        "kategoriler: ad, simge ve renk",
        "ayarlar: tema, dil, para birimi ve yedekleme tercihleri",
      ],
    },
    {
      title: "Topladığımız veriler",
      body: [
        "Hiçbiri. Monedsa'nın kendine ait bir sunucusu yoktur; verilerinizi, kullanım istatistiklerini, çökme raporlarını ya da cihaz kimliklerini ne bize ne de başka birine gönderir. Uygulamada reklam veya analiz kodu bulunmaz.",
      ],
    },
    {
      title: "Google Drive yedeklemesi",
      body: [
        "Yedekleme isteğe bağlıdır ve Ayarlar'dan Google Drive'ı bağlayana kadar kapalıdır. Bağladığınızda Google, Monedsa'nın <code>drive.appdata</code> iznini kullanmasına izin vermenizi ister.",
        "Bu izin Monedsa'ya yalnızca Drive'ınızdaki gizli bir uygulama klasörüne erişim verir. Monedsa diğer Drive dosyalarınızı göremez, okuyamaz veya değiştiremez; diğer uygulamalar da bu klasörü göremez.",
        "Monedsa bu erişimi yalnızca işlemlerinizi, kategorilerinizi ve ayarlarınızı içeren bir yedek dosyasını bu klasöre kaydetmek ve geri yüklerken okumak için kullanır. Yedekler Şimdi yedekle'ye dokunduğunuzda ya da otomatik yedeklemeyi açtıysanız günlük veya haftalık olarak alınır.",
        `Yedekleriniz Google tarafından <a href="${googlePolicy}">Google gizlilik politikası</a> kapsamında saklanır. Monedsa'nın Google API'lerinden aldığı bilgileri kullanması ve aktarması, Sınırlı Kullanım şartları dahil <a href="${userDataPolicy}">Google API Hizmetleri Kullanıcı Verileri Politikası</a>'na uygundur. Google'dan gelen veriler asla satılmaz, reklam için kullanılmaz ve kimseyle paylaşılmaz.`,
        "Google Drive bağlantısını Ayarlar'dan istediğiniz zaman kesebilirsiniz. Yedeğin kendisini silmek için Google Drive'ı web'de açın, Ayarlar'a ve ardından Uygulamaları yönet'e gidin, Monedsa'nın yanındaki Gizli uygulama verilerini sil'i seçin.",
      ],
    },
    {
      title: "Dosya içe ve dışa aktarma",
      body: [
        "Bir dosyayı içe aktardığınızda Monedsa yalnızca seçtiğiniz dosyayı ve yalnızca verilerini telefonunuza geri yüklemek için okur.",
      ],
    },
    {
      title: "İzinler",
      list: [
        "İnternet ve ağ durumu: yalnızca yedekleme için Google Drive'a ulaşmakta kullanılır. Drive yedeklemesi olmadan Monedsa hiçbir ağ bağlantısı kurmaz.",
      ],
      body: [],
    },
    {
      title: "Google Play",
      body: [
        `Monedsa'yı Google Play'den yüklerseniz Google, kurulumla ilgili bilgileri kendi <a href="${googlePolicy}">gizlilik politikası</a> kapsamında toplayabilir. Google Play'den kişisel veri almayız.`,
      ],
    },
    {
      title: "Verilerinizi silme",
      body: [
        "Monedsa'yı kaldırmak ya da telefonunuzun ayarlarından depolama alanını temizlemek cihazınızdaki tüm verileri siler. Drive yedekleri, yukarıda anlatıldığı gibi siz silene kadar Google hesabınızda kalır.",
      ],
    },
    {
      title: "Monedsa 1.6 ve öncesi (20 Aralık 2026'ya kadar)",
      body: [
        "Monedsa 1.6 ve önceki sürümler farklı çalışır: bir hesap gerektirir ve verilerinizi sunucumuzda saklar. Bu sunucu 20 Aralık 2026'da kapanana kadar bu sürümler için aşağıdakiler geçerlidir.",
        "Google ile giriş yaptığınızda Google kimliğinizi Firebase Authentication aracılığıyla doğrular ve biz adınızı ve e-posta adresinizi alırız. Uygulamadaki destek formundan bir mesaj gönderirseniz, size yanıt verebilmemiz için bize e-postayla ulaşır.",
        "Bu verileri yalnızca hesabınızı çalıştırmak ve verilerinizi uygulamada göstermek için kullanırız. Satmayız, reklam için kullanmayız ve kimseyle paylaşmayız.",
        `Kapanıştan önce istediğiniz zaman verilerinizi 1.6 uygulamasından dışa aktarıp Monedsa 2.0'a içe aktarabilirsiniz. Hesabınızın ve verilerinizin daha önce silinmesini istiyorsanız ${mail} adresine yazın. 20 Aralık 2026'da sunucu kapatılır ve üzerindeki tüm hesap verileri kalıcı olarak silinir.`,
      ],
      list: [
        "hesap: ad, kullanıcı adı, e-posta adresi ve Google ile giriş yapmadıysanız parolanızın özeti (parolanın kendisi asla saklanmaz)",
        "işlemler: tutar, tür, kategori, tarih ve isteğe bağlı açıklama",
        "kategoriler: ad, renk ve tür",
      ],
    },
    {
      title: "Çocuklar",
      body: ["Monedsa çocuklar dahil hiç kimseden kişisel veri toplamaz."],
    },
    {
      title: "Bu politikadaki değişiklikler",
      body: [
        "Politika değişirse yeni sürüm bu sayfada yeni tarihiyle yayımlanır. Uygulama açık kaynak olduğu için her değişikliği GitHub'da da takip edebilirsiniz.",
      ],
    },
  ],
};

const nl: Policy = {
  title: "Privacybeleid",
  updated: "Laatst bijgewerkt op 21 november 2026. Geldt voor Monedsa 2.0 en later. Voor versie 1.6 en eerder, zie het gedeelte over die versies hieronder.",
  summary: [
    "Monedsa bewaart je gegevens op je telefoon. Er is geen account, geen server, geen advertenties en geen analytics.",
    "Als je back-up naar Google Drive aanzet, worden je back-ups in je eigen Google-account bewaard. Wij kunnen ze niet zien.",
  ],
  sections: [
    {
      title: "Wie wij zijn",
      body: [
        `Monedsa is een open source app gemaakt door Vu4ll. Voor alles over dit beleid kun je mailen naar ${mail} of de website bezoeken: ${website}.`,
      ],
    },
    {
      title: "Gegevens op je apparaat",
      body: [
        "Alles wat je in Monedsa invoert, staat alleen in de privéopslag van de app op je telefoon:",
      ],
      list: [
        "transacties: bedrag, type, categorie, datum en de optionele omschrijving",
        "categorieën: naam, icoon en kleur",
        "instellingen: thema, taal, valuta en back-upvoorkeuren",
      ],
    },
    {
      title: "Gegevens die wij verzamelen",
      body: [
        "Geen. Monedsa heeft geen eigen server en stuurt je gegevens, gebruiksstatistieken, crashrapporten of apparaat-ID's niet naar ons of naar iemand anders. De app bevat geen advertentie- of analyticscode.",
      ],
    },
    {
      title: "Back-up naar Google Drive",
      body: [
        "Back-ups zijn optioneel en staan uit totdat je Google Drive koppelt in Instellingen. Dan vraagt Google je om Monedsa toestemming te geven voor <code>drive.appdata</code>.",
        "Die toestemming geeft Monedsa alleen toegang tot een verborgen app-map in je Drive. Monedsa kan je andere Drive-bestanden niet zien, lezen of wijzigen, en andere apps kunnen deze map niet zien.",
        "Monedsa gebruikt deze toegang alleen om een back-upbestand met je transacties, categorieën en instellingen in die map op te slaan en het terug te lezen als je herstelt. Back-ups worden gemaakt als je op Nu back-up maken tikt, of dagelijks of wekelijks als je automatische back-up aanzet.",
        `Je back-ups worden door Google bewaard volgens het <a href="${googlePolicy}">privacybeleid van Google</a>. Het gebruik en de overdracht van informatie die Monedsa via Google API's ontvangt, voldoen aan het <a href="${userDataPolicy}">Google API Services User Data Policy</a>, inclusief de Limited Use-vereisten. Gegevens van Google worden nooit verkocht, voor advertenties gebruikt of met iemand gedeeld.`,
        "Je kunt Google Drive op elk moment ontkoppelen in Instellingen. Om de back-up zelf te verwijderen open je Google Drive op het web, ga je naar Instellingen en dan Apps beheren, en kies je Verborgen app-gegevens verwijderen bij Monedsa.",
      ],
    },
    {
      title: "Bestanden importeren en exporteren",
      body: [
        "Als je een bestand importeert, leest Monedsa alleen het bestand dat je kiest, en alleen om de gegevens op je telefoon terug te zetten.",
      ],
    },
    {
      title: "Toestemmingen",
      list: [
        "Internet en netwerkstatus: alleen gebruikt om Google Drive te bereiken voor back-ups. Zonder Drive-back-up maakt Monedsa geen netwerkverbindingen.",
      ],
      body: [],
    },
    {
      title: "Google Play",
      body: [
        `Als je Monedsa via Google Play installeert, kan Google informatie over de installatie verzamelen volgens zijn eigen <a href="${googlePolicy}">privacybeleid</a>. Wij ontvangen geen persoonsgegevens van Google Play.`,
      ],
    },
    {
      title: "Je gegevens verwijderen",
      body: [
        "Als je Monedsa verwijdert of de opslag van de app wist in de instellingen van je telefoon, worden alle gegevens op je apparaat verwijderd. Back-ups in Drive blijven in je Google-account staan totdat je ze verwijdert zoals hierboven beschreven.",
      ],
    },
    {
      title: "Monedsa 1.6 en eerder (tot 20 december 2026)",
      body: [
        "Monedsa 1.6 en eerder werken anders: ze hebben een account nodig en bewaren je gegevens op onze server. Totdat die server op 20 december 2026 uitgaat, geldt voor die versies het volgende.",
        "Als je inlogt met Google, bevestigt Google je identiteit via Firebase Authentication en ontvangen wij je naam en e-mailadres. Als je een bericht stuurt via het supportformulier in de app, komt het per e-mail bij ons binnen zodat we kunnen antwoorden.",
        "We gebruiken deze gegevens alleen om je account te laten werken en je gegevens in de app te tonen. We verkopen ze niet, gebruiken ze niet voor advertenties en delen ze met niemand.",
        `Je kunt je gegevens vóór de uitschakeling op elk moment exporteren vanuit de 1.6-app en importeren in Monedsa 2.0. Wil je je account en gegevens eerder laten verwijderen, mail dan naar ${mail}. Op 20 december 2026 gaat de server uit en worden alle accountgegevens erop definitief verwijderd.`,
      ],
      list: [
        "account: naam, gebruikersnaam, e-mailadres en, als je niet met Google inlogde, een hash van je wachtwoord (nooit het wachtwoord zelf)",
        "transacties: bedrag, type, categorie, datum en de optionele omschrijving",
        "categorieën: naam, kleur en type",
      ],
    },
    {
      title: "Kinderen",
      body: ["Monedsa verzamelt van niemand persoonsgegevens, ook niet van kinderen."],
    },
    {
      title: "Wijzigingen in dit beleid",
      body: [
        "Als dit beleid verandert, wordt de nieuwe versie met een nieuwe datum op deze pagina gepubliceerd. Omdat de app open source is, kun je elke wijziging ook volgen op GitHub.",
      ],
    },
  ],
};

export const policies: Record<Lang, Policy> = { en, tr, nl };
