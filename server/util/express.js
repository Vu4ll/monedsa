const express = require("express");
const app = express();
const { env, appData } = require("../config");
const cors = require('cors');
const path = require("path");
const cookieParser = require("cookie-parser");
const i18nMiddleware = require("../middlewares/i18n.js");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(i18nMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use("/", require("../routes"));
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

const translatedAppData = res => {
    const featuresFromLocale = res.locals.t("featuresSection.list");
    const iconsFromConfig = appData.features.map(feature => feature.icon);
    const translatedFeatures = featuresFromLocale.map((feature, index) => ({
        icon: iconsFromConfig[index],
        title: feature.title,
        description: feature.description
    }));

    return {
        ...appData,
        tagline: res.locals.t("hero.tagline"),
        description: res.locals.t("hero.description"),
        features: translatedFeatures
    };
};

app.get("/", (req, res) => {
    res.render("index", { app: translatedAppData(res) });
});

app.get("/privacy-policy", (req, res) => {
    res.render("privacy", { app: appData });
});

app.listen(env.PORT, () =>
    console.log(`Server is running on port ${env.PORT}`)
);
