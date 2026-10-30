// Opens and closes the navigation menu on narrow screens (replaces jQuery and Bootstrap's collapse plugin)
document.addEventListener("click", function (event) {
    var button = event.target.closest(".navbar-toggle");
    if (!button) return;
    var menu = document.getElementById(button.getAttribute("aria-controls"));
    var open = menu.classList.toggle("in");
    button.classList.toggle("collapsed", !open);
    button.setAttribute("aria-expanded", open);
});

// Escape closes an open menu and returns focus to its button
document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var button = document.querySelector('.navbar-toggle[aria-expanded="true"]');
    if (!button) return;
    document.getElementById(button.getAttribute("aria-controls")).classList.remove("in");
    button.classList.add("collapsed");
    button.setAttribute("aria-expanded", "false");
    button.focus();
});
