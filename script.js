// ========================================
// PAGE LOAD ANIMATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const profile = document.querySelector(".profile");
    const links = document.querySelectorAll(".link-card");
    const footer = document.querySelector(".footer");

    profile.style.opacity = "0";
    profile.style.transform = "translateY(15px)";

    links.forEach(link => {
        link.style.opacity = "0";
        link.style.transform = "translateY(15px)";
    });

    footer.style.opacity = "0";


    setTimeout(() => {
        profile.style.transition = "all 0.6s ease";
        profile.style.opacity = "1";
        profile.style.transform = "translateY(0)";
    }, 100);


    links.forEach((link, index) => {

        setTimeout(() => {

            link.style.transition =
                "opacity 0.5s ease, transform 0.5s ease";

            link.style.opacity = "1";
            link.style.transform = "translateY(0)";

        }, 180 + (index * 90));

    });


    setTimeout(() => {

        footer.style.transition = "opacity 0.5s ease";
        footer.style.opacity = "1";

    }, 700);

});