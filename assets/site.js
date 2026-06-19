(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    function resetSlider() {
        if (timer) {
            window.clearInterval(timer);
        }
        startSlider();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            resetSlider();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            resetSlider();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            resetSlider();
        });
    });

    showSlide(0);
    startSlider();

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter(input, cards, empty) {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var match = !query || text.indexOf(query) !== -1;
            card.hidden = !match;
            if (match) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    var localInput = document.querySelector(".local-filter");
    var localGrid = document.querySelector("[data-filter-grid]");
    if (localInput && localGrid) {
        var localCards = Array.prototype.slice.call(localGrid.querySelectorAll(".movie-card"));
        var localEmpty = document.querySelector(".empty-state");
        localInput.addEventListener("input", function () {
            applyFilter(localInput, localCards, localEmpty);
        });
    }

    var searchInput = document.getElementById("siteSearch");
    var regionFilter = document.getElementById("regionFilter");
    var typeFilter = document.getElementById("typeFilter");
    var clearSearch = document.getElementById("clearSearch");
    var searchGrid = document.querySelector("[data-search-grid]");

    function runSearch() {
        if (!searchGrid) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : "");
        var region = normalize(regionFilter ? regionFilter.value : "");
        var type = normalize(typeFilter ? typeFilter.value : "");
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var cardType = normalize(card.getAttribute("data-type"));
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchRegion = !region || cardRegion === region;
            var matchType = !type || cardType === type;
            var match = matchQuery && matchRegion && matchType;
            card.hidden = !match;
            if (match) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q");
        if (keyword) {
            searchInput.value = keyword;
        }
        searchInput.addEventListener("input", runSearch);
    }

    if (regionFilter) {
        regionFilter.addEventListener("change", runSearch);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", runSearch);
    }

    if (clearSearch) {
        clearSearch.addEventListener("click", function () {
            if (searchInput) {
                searchInput.value = "";
            }
            if (regionFilter) {
                regionFilter.value = "";
            }
            if (typeFilter) {
                typeFilter.value = "";
            }
            runSearch();
        });
    }

    runSearch();
})();
