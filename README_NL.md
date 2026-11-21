# Monedsa - Inkomsten & Uitgaven Tracker

> [!WARNING]
> **De Monedsa-server wordt op 20 december 2026 uitgeschakeld.** Monedsa 2.0 is een nieuwe, volledig offline versie: je gegevens blijven op je apparaat en je kunt ze optioneel in je eigen Google Drive back-uppen. Geen account of inloggen nodig.
>
> **Exporteer je gegevens vóór de uitschakeling:** ga in Monedsa 1.6 naar *Instellingen → Mijn gegevens exporteren* en bewaar het `.json`-bestand. Na de update naar 2.0 zet je het terug via *Instellingen → Importeren uit bestand*. Na 20 december kunnen gegevens op de server niet meer worden geëxporteerd.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Kotlin](https://img.shields.io/badge/Kotlin-Jetpack%20Compose-7f52ff.svg)
![Android](https://img.shields.io/badge/Android-7.0+-3ddc84.svg)
![License](https://img.shields.io/badge/license-GPL3-yellow.svg)

[Turks](README_TR.md) | [Engels](README.md) | Nederlands

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" 
alt="Download from Google Play" height="80">](https://play.google.com/store/apps/details?id=com.vu4ll.monedsa)

**Monedsa** is een app voor Android om je inkomsten en uitgaven bij te houden. Hij werkt zonder account of server: alles wat je invoert blijft op je telefoon, en als je back-ups wilt, gaan die naar je eigen Google Drive.

Website: [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl/nl/)

## 📱 Functies

- **Inkomsten en uitgaven:** transacties toevoegen, bewerken en verwijderen, met bedrag, categorie, datum en optionele omschrijving
- **Overzicht per maand:** inkomsten, uitgaven en saldo per maand, met je uitgaven verdeeld per categorie
- **Categorieën:** je eigen categorieën voor inkomsten en uitgaven, elk met een icoon en kleur
- **Sorteren, filteren en zoeken:** op bedrag, datum, categorie of omschrijving
- **Valuta:** kies de valuta waarin je rekent (euro, Turkse lira, dollar, pond en meer)
- **Licht en donker thema:** volgt je telefoon, of kies er zelf een
- **Talen:** Nederlands, Engels en Turks
- **Back-up naar Google Drive (optioneel):** nu, of automatisch elke dag of week, naar een privé-app-map die alleen Monedsa kan openen
- **Importeren uit bestand:** zet een back-upbestand terug, of neem je gegevens mee uit Monedsa 1.6

## 🔒 Privacy

Monedsa heeft geen server, geen account, geen advertenties en geen analytics. Je gegevens staan in de app op je apparaat. Back-up naar Google Drive gebruikt de toestemming `drive.appdata`, die alleen toegang geeft tot een verborgen app-map in je Drive, niet tot je andere bestanden. Zie het [privacybeleid](https://monedsa.vu4ll.nl/nl/privacy-policy/).

## 🚀 Bouwen vanaf de broncode

### Vereisten

- **Android Studio** (recente stabiele versie) met JDK 17
- **Android SDK 36**
- Een apparaat of emulator met Android 7.0 (API 24) of nieuwer

### Bouwen en uitvoeren

```bash
git clone https://github.com/Vu4ll/monedsa.git
cd monedsa
./gradlew installDebug
```

Of open het project in Android Studio en start de configuratie `app`. Debug-builds worden geïnstalleerd als `com.vu4ll.monedsa.debug`, naast de Play Store-versie.

Release-ondertekening leest de waarden uit een `signing.properties`-bestand in de hoofdmap van het project (niet in de repo). Zonder dat bestand maakt `assembleRelease` een niet-ondertekende APK.

Back-up naar Google Drive werkt alleen als de pakketnaam en de SHA-1 van de ondertekeningssleutel als Android OAuth-client zijn geregistreerd in een Google Cloud-project waarin de Drive API aanstaat.

## 🏗️ Projectstructuur

```
monedsa/
├── app/                       # Android-app (Kotlin, Jetpack Compose)
│   └── src/main/java/com/vu4ll/monedsa/
│       ├── data/              # Room-database, DAO's, voorkeuren
│       ├── backup/            # Back-upbestandsformaat, Google Drive, WorkManager
│       └── ui/                # Schermen, componenten en thema
└── web/                       # Website (Astro, statisch)
```

`web/` bevat de landingspagina en het privacybeleid voor [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl/nl/). Zie [web/README.md](web/README.md).

## 🔧 Technologieën

- **Kotlin** en **Jetpack Compose** (Material 3)
- **Room** - lokale database
- **DataStore** - instellingen
- **WorkManager** - automatische back-ups
- **Google Play services auth** en de **Google Drive REST API** - back-ups
- **kotlinx.serialization** - back-up- en importbestanden
- **Astro** - website

## 🐛 Problemen

Een bug gevonden of een idee? [Open een issue](https://github.com/Vu4ll/monedsa/issues/new). Je komt er ook via *Instellingen → Meld een probleem* in de app.

## 🤝 Bijdragen

1. Fork dit project
2. Maak een nieuwe feature branch (`git checkout -b feature/nieuwe-functie`)
3. Commit je wijzigingen (`git commit -am 'Nieuwe functie toegevoegd'`)
4. Push je branch (`git push origin feature/nieuwe-functie`)
5. Maak een Pull Request

## 📝 Licentie

- Dit project is gelicentieerd onder de GPL3-licentie. Zie het [LICENSE](LICENSE)-bestand voor details.
- **Privacybeleid**: [monedsa.vu4ll.nl/nl/privacy-policy](https://monedsa.vu4ll.nl/nl/privacy-policy/)

## 📞 Contact

- **Website:** [vu4ll.nl](https://vu4ll.nl)
- **E-mail:** [contact@vu4ll.nl](mailto:contact@vu4ll.nl)

---

**Monedsa** - Houd je financiële situatie eenvoudig bij en houd je budget onder controle! 💰📊
