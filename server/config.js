require("dotenv").config();
const { version } = require("./package.json");

module.exports = {
    env: {
        PORT: process.env.PORT || 3000,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION || "15m",
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "14d",
    },

    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernameRegex: /^[a-z0-9_.]{2,16}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

    appData: {
        name: "Monedsa",
        tagline: "Gelir Gider Takip Uygulaması",
        description: "Android cihazlarınızda kolayca gelir ve giderlerinizi takip edin. Basit, hızlı ve güvenli.",
        features: [
            {
                icon: "💰",
                title: "Gelir Takibi",
                description: "Tüm gelirlerinizi kategorilere ayırarak takip edin",
            },
            {
                icon: "📊",
                title: "Gider Analizi",
                description: "Harcamalarınızı analiz edin ve bütçenizi kontrol altında tutun",
            },
            {
                icon: "📱",
                title: "Mobil Uyumlu",
                description: "Android cihazlarınızda sorunsuz çalışan modern arayüz",
            },
            {
                icon: "🔒",
                title: "Güvenli",
                description: "Verileriniz güvenli bir şekilde bulut veritabanında saklanır",
            },
        ],
        screenshots: ["/images/home-page.png", "/images/home-page-white.png", "/images/filter.png", "/images/add-transaction.png", "/images/categories.png", "/images/add-category.png", "/images/profile.png", "/images/settings.png"],
        downloadLinks: {
            playStore: "#",
            apk: "https://github.com/Vu4ll/monedsa/releases/download/1.3.1/monedsa-1.3.1.apk",
        },
        githubUrl: "https://github.com/Vu4ll/monedsa",
        version
    }
};