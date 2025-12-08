document.addEventListener("DOMContentLoaded", () => {
    const themeButton = document.querySelector(".theme");
    const themeImg = themeButton.querySelector("img");
    const trumpMeme = document.querySelector(".trumpMeme");
    const videoEl = trumpMeme.querySelector("video");

    const socialIcons = {
        telegram: document.querySelector('img[alt="telegram icon"]'),
        github: document.querySelector('img[src*="github"]'),
        youtube: document.querySelector('img[src*="youtube"]'),
        x: document.querySelector('img[src*="xDarkMode"]'),
        twitch: document.querySelector('img[src*="twitch"]'),
        whatsapp: document.querySelector('img[src*="whatsapp"]'),
        discord: document.querySelector('img[src*="discord"]'),
        reddit: document.querySelector('img[src*="reddit"]'),
        instagram: document.querySelector('img[src*="instagram"]')
    };

    // [INITIAL THEME SETUP]
    let savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
        savedTheme = "dark";
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    function updateButtonIcon(theme) {
        themeImg.src = theme === "light"
            ? "icons/darkmode.png"
            : "icons/lightmode.png";
    }
    updateButtonIcon(savedTheme);

    // [themebtn:hover]
    themeButton.addEventListener("mouseenter", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        themeImg.src = currentTheme === "light"
            ? "icons/darkmodeHover.png"
            : "icons/lightmodeHover.png";
    });

    themeButton.addEventListener("mouseleave", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        updateButtonIcon(currentTheme);
    });

    // [ICONS PATH]
    const iconPaths = {
        telegram: {
            dark: "icons/telegramDarkMode.png",
            light: "icons/telegramLightMode.png",
            hover: "icons/telegramHover.png"
        },
        github: {
            dark: "icons/githubDarkMode.png",
            light: "icons/githubLightMode.png",
            hover: "icons/githubHover.png"
        },
        youtube: {
            dark: "icons/youtubeDarkMode.png",
            light: "icons/youtubeLightMode.png",
            hover: "icons/youtubeHover.png"
        },
        x: {
            dark: "icons/xDarkMode.png",
            light: "icons/xLightMode.png",
            hover: "icons/xHover.png"
        },
        twitch: {
            dark: "icons/twitchDarkMode.png",
            light: "icons/twitchLightMode.png",
            hover: "icons/twitchHover.png"
        },
        whatsapp: {
            dark: "icons/whatsappDarkMode.png",
            light: "icons/whatsappLightMode.png",
            hover: "icons/whatsappHover.png"
        },
        discord: {
            dark: "icons/discordDarkMode.png",
            light: "icons/discordLightMode.png",
            hover: "icons/discordHover.png"
        },
        reddit: {
            dark: "icons/redditDarkMode.png",
            light: "icons/redditLightMode.png",
            hover: "icons/redditHover.png"
        },
        instagram: {
            dark: "icons/instagramDarkMode.png",
            light: "icons/instagramLightMode.png",
            hover: "icons/instagramHover.png"
        }
    };

    // [APPLY THEME: SOCIAL ICONS]
    function updateSocialIcons(theme) {
        for (const key in socialIcons) {
            if (socialIcons[key]) {
                socialIcons[key].src =
                    theme === "light" ? iconPaths[key].light : iconPaths[key].dark;
            }
        }
    }

    // [HEADER & LINK LOGIC]
    function updateHeaderAndLinkIcons(theme) {
        const headerLogos = document.querySelectorAll(".containerHeaderLogo img");
        const linkIcons = document.querySelectorAll(".linkIcon img");

        headerLogos.forEach(img => {
            const isLightMode = theme === "light";
            const baseName = "stack";
            img.src = isLightMode
                ? `icons/${baseName}LightMode.png`
                : `icons/${baseName}.png`;
        });

        linkIcons.forEach(img => {
            const isLightMode = theme === "light";
            const baseName = "link";
            img.src = isLightMode
                ? `icons/${baseName}LightMode.png`
                : `icons/${baseName}.png`;
        });
    }

    // [SOCIAL ICONS HOVER EFFECT]
    for (const key in socialIcons) {
        const icon = socialIcons[key];
        if (!icon) continue;

        icon.addEventListener("mouseenter", () => {
            icon.src = iconPaths[key].hover;
        });

        icon.addEventListener("mouseleave", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            icon.src = currentTheme === "light"
                ? iconPaths[key].light
                : iconPaths[key].dark;
        });
    }

    // [INTIAL ICONS]
    updateSocialIcons(savedTheme);
    updateHeaderAndLinkIcons(savedTheme);

    // [THEME TOGGLE]
    let switchCount = 0;
    themeButton.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);
        updateButtonIcon(nextTheme);
        updateSocialIcons(nextTheme);
        updateHeaderAndLinkIcons(nextTheme);

        switchCount++;

        if (switchCount === 1 && nextTheme === "light") {
            playVideo("media/videos/turnoff.mp4");
        } else if (switchCount === 2 && nextTheme === "dark") {
            playVideo("media/videos/muchbetter.mp4");
        }
    });

    // [MEME HANDLING]
    function playVideo(src) {
        trumpMeme.style.display = "flex";
        videoEl.src = src;
        videoEl.currentTime = 0;
        videoEl.play();
        videoEl.onended = () => {
            trumpMeme.style.display = "none";
        };
    }

    // [OPTIMIZATION: preload trump meme]
    function preloadVideo(src) {
        const v = document.createElement("video");
        v.src = src;
        v.preload = "auto";
        v.muted = true;
        v.style.display = "none";
        document.body.appendChild(v);
    }

    preloadVideo("media/videos/turnoff.mp4");
    preloadVideo("media/videos/muchbetter.mp4");

    trumpMeme.style.display = "none";

    // [NAVBAR THEME HANDLING]
    const navItems = document.querySelectorAll(".navCont");

    const navIcons = {
        home: {
            dark: "icons/home.png",
            light: "icons/homeLightMode.png",
            active: "icons/homeActive.png"
        },
        about: {
            dark: "icons/about.png",
            light: "icons/aboutLightMode.png",
            active: "icons/aboutActive.png"
        },
        projects: {
            dark: "icons/projects.png",
            light: "icons/projectsLightMode.png",
            active: "icons/projectsActive.png"
        },
        services: {
            dark: "icons/services.png",
            light: "icons/servicesLightMode.png",
            active: "icons/servicesActive.png"
        },
        contact: {
            dark: "icons/contact.png",
            light: "icons/contactLightMode.png",
            active: "icons/contactActive.png"
        }
    };

    function updateNavbarIcons(theme) {
        navItems.forEach(item => {
            const section = item.dataset.section;
            const img = item.querySelector("img");

            img.src = theme === "light"
                ? navIcons[section].light
                : navIcons[section].dark;
        });
    }

    updateNavbarIcons(savedTheme);

    themeButton.addEventListener("click", () => {
        const theme = document.documentElement.getAttribute("data-theme");
        updateNavbarIcons(theme);
    });

    navItems.forEach(item => {
        const section = item.dataset.section;
        const img = item.querySelector("img");

        item.addEventListener("mouseenter", () => {
            img.src = navIcons[section].active;
        });

        item.addEventListener("mouseleave", () => {
            const theme = document.documentElement.getAttribute("data-theme");
            img.src = theme === "light"
                ? navIcons[section].light
                : navIcons[section].dark;
        });
    });

});