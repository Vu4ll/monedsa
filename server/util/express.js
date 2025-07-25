const express = require("express");
const app = express();
const { PORT } = require("../config").env;
const cors = require('cors');
const path = require("path");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("../routes"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

const appData = {
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
            description: "Verileriniz güvenli bir şekilde cihazınızda saklanır",
        },
    ],
    screenshots: ["/images/home-page.png", "/images/home-page-white.png", "/images/filter.png", "/images/add-transaction.png", "/images/categories.png", "/images/add-category.png", "/images/profile.png", "/images/settings.png"],
    downloadLinks: {
        playStore: "#",
        apk: "#",
    },
    githubUrl: "https://github.com/Vu4ll/monedsa",
    version: "1.0",
};

app.get("/", (req, res) => {
    res.render("index", { app: appData });
});

app.get("/privacy-policy", (req, res) => {
    res.render("privacy", { app: appData });
});

app.get("/privacy-policy/tr", (req, res) => {
    res.render("privacy-tr", { app: appData });
});

app.get("/privacy-policy/nl", (req, res) => {
    res.render("privacy-nl", { app: appData });
});

app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);
