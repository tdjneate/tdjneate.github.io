document.addEventListener("DOMContentLoaded", function () {
    fetch("data/publications.csv", { cache: "no-cache" }) // always check for an updated list
        .then(response => response.text())
        .then(data => {
            let publications = parseCSV(data);
            console.log("Parsed Publications:", publications); // Log parsed publications
            publications = publications.filter(pub => pub.Show.toLowerCase() !== "no"); // Filter out publications with Show = No
            publications.sort((a, b) => parseInt(a.Year) - parseInt(b.Year)); // Sort by year in ascending order
            addPublicationIdentifiers(publications);
            publications.reverse(); // Reverse again to display newest first
            allPublications = publications;
            setUpFilters(publications);
            setUpCitations();
        })
        .catch(error => {
            console.error("Error loading CSV file:", error);
            const results = document.getElementById("publication-results");
            if (results) {
                results.removeAttribute("aria-busy");
                results.innerHTML = '<p class="lead">Sorry, the publication list could not be loaded.</p>';
            }
        });
});

// Every listed publication, newest first; cite buttons refer to them by position
let allPublications = [];

function parseCSV(data) {
    const lines = data.trim().split("\n");
    const headers = lines.shift().split(",");
    return lines.map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // Handle potential commas in quotes
        let entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index] ? values[index].replace(/"/g, '').trim() : ""; // Remove rogue quotes
        });
        return entry;
    });
}

// Creates prefixes for counts of conferences, journals, etc.
function addPublicationIdentifiers(publications) {
    let typeCounts = { conference: 0, journal: 0, demo: 0, poster: 0, bookchapter:0, magazine: 0, workshop: 0};
    
    publications.forEach(pub => {
        let typeShort = "";
        switch (pub.Type.toLowerCase()) {
            case "conference": typeShort = "C"; break;
            case "journal": typeShort = "J"; break;
            case "demo": typeShort = "D"; break;
            case "poster": typeShort = "P"; break;
            case "bookchapter": typeShort = "BC"; break;
            case "magazine": typeShort = "M"; break;
            case "workshop": typeShort = "W"; break;
        }
        if (typeShort) {
            typeCounts[pub.Type.toLowerCase()] += 1;
            pub.Identifier = `${typeShort}${typeCounts[pub.Type.toLowerCase()]}`;
        } else {
            pub.Identifier = ""; // leave it blank
        }
    });
}

// Readable names for the Type column, used in the filter menu
const TYPE_LABELS = {
    conference: "Conference paper",
    journal: "Journal article",
    poster: "Poster",
    demo: "Demo",
    bookchapter: "Book chapter",
    magazine: "Magazine article",
    workshop: "Workshop paper"
};

// Topics come from the Topics column, separated by semicolons
function getTopics(pub) {
    return (pub.Topics || "").split(";").map(topic => topic.trim()).filter(Boolean);
}

// Fills the topic, year and type menus, then redraws the list whenever they change
function setUpFilters(publications) {
    const form = document.getElementById("pub-filters");
    const topicSelect = document.getElementById("filter-topic");
    const yearSelect = document.getElementById("filter-year");
    const typeSelect = document.getElementById("filter-type");
    const count = document.getElementById("filter-count");

    // topics in alphabetical order, each with how many papers it has
    const topicCounts = {};
    publications.forEach(pub => getTopics(pub).forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }));
    Object.keys(topicCounts).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })).forEach(topic => {
        topicSelect.add(new Option(`${topic} (${topicCounts[topic]})`, topic));
    });

    [...new Set(publications.map(pub => pub.Year))].forEach(year => {
        yearSelect.add(new Option(year, year));
    });
    [...new Set(publications.map(pub => pub.Type.toLowerCase()))]
        .sort((a, b) => publications.filter(p => p.Type.toLowerCase() === b).length - publications.filter(p => p.Type.toLowerCase() === a).length)
        .forEach(type => typeSelect.add(new Option(TYPE_LABELS[type] || type, type)));

    function update() {
        const topic = topicSelect.value;
        const year = yearSelect.value;
        const type = typeSelect.value;
        const shown = publications.filter(pub =>
            (!topic || getTopics(pub).includes(topic)) &&
            (!year || pub.Year === year) && (!type || pub.Type.toLowerCase() === type));
        displayPublications(shown);
        count.textContent = (topic || year || type)
            ? `Showing ${shown.length} of ${publications.length} publications`
            : `${publications.length} publications`;
    }

    topicSelect.addEventListener("change", update);
    yearSelect.addEventListener("change", update);
    typeSelect.addEventListener("change", update);
    // the reset button clears the menus; redraw once the values have changed
    form.addEventListener("reset", () => setTimeout(update, 0));
    form.addEventListener("submit", event => event.preventDefault());

    // browsers can restore old menu choices on reload, so always start with everything shown
    form.reset();
    form.hidden = false;
    update();
}

function displayPublications(publications) {
    const container = document.getElementById("publication-results");
    if (!container) return;

    // One heading and list per year
    container.innerHTML = "";
    container.removeAttribute("aria-busy");
    if (publications.length === 0) {
        container.innerHTML = '<p class="lead">No publications match these filters.</p>';
        return;
    }
    let list = null;
    let currentYear = null;

    publications.forEach(pub => {
        if (pub.Year !== currentYear) {
            currentYear = pub.Year;
            let heading = document.createElement("h3");
            heading.className = "pub-year";
            heading.textContent = currentYear;
            list = document.createElement("ul");
            list.className = "pub-list";
            container.append(heading, list);
        }

        let authorsFormatted = authorNames(pub).map(name => {
            let formattedName = displayName(name);
            return formattedName.includes("Timothy Neate") ? `<u>${formattedName}</u>` : formattedName;
        }).join(", ");
        
        let awardIcon = getAwardIcon(pub.Award);
        let awardText = pub.Award.split(";")[1] || "";
        
        // Screen-reader-only text says which paper each link is for and that it opens a new tab
        let newTab = `<span class="sr-only"> for “${pub.Title}” (opens in a new tab)</span>`;

        let pdfIcon = pub.Link ? `<a href="${pub.Link}" target="_blank" rel="noopener" class="pdf-icon" style="color: royalBlue; text-decoration: none; display: inline;">${icon("file-pdf")} <span style="text-decoration: underline; color: royalBlue; display: inline;">PDF</span>${newTab}</a>` : "";
       
        let citeButton = `<button type="button" class="cite-button" data-pub="${allPublications.indexOf(pub)}">${icon("quote-left")} <span class="cite-label">Cite</span><span class="sr-only"> “${pub.Title}”</span></button>`;

        let videoIcon = pub.VideoLink ? `<a href="${pub.VideoLink}" target="_blank" rel="noopener" class="video-icon" style="color: #b83a26; text-decoration: none; display: inline;">${icon("film")} <span style="text-decoration: underline; color: #b83a26; display: inline;">Video</span>${newTab}</a>` : "";
        
        // Press column holds the id of the paper's section on the press page
        let pressIcon = pub.Press ? `<a href="press.html#${pub.Press}" class="press-icon" style="color: #7a3fa8; text-decoration: none; display: inline;">${icon("newspaper")} <span style="text-decoration: underline; color: #7a3fa8; display: inline;">Press</span><span class="sr-only"> coverage of “${pub.Title}”</span></a>` : "";

        // App column holds an App Store link for an app released from the paper
        let appIcon = pub.App ? `<a href="${pub.App}" target="_blank" rel="noopener" class="app-icon" style="color: #1f2328; text-decoration: none; display: inline;">${icon("app-store-ios")} <span style="text-decoration: underline; color: #1f2328; display: inline;">App</span>${newTab}</a>` : "";

        let listItem = document.createElement("li");
        listItem.classList.add("publication-item");
        listItem.innerHTML = `
            <div class="row align-items-left">   
 
                <div class="col-sm-1 text-left">
                    <span class="pub-id">${pub.Identifier}</span>
                </div>
                <div class="col-sm-11 lead pub-body">
                    <div class="paper-title">${pub.Title}</div>
                    <div class="paper-authors">${authorsFormatted}</div>
                    <div class="paper-venue">${pub.Publication}, ${pub.Year}</div>
                    <div class="paper-links">${awardText ? `<span class="award" style="color: green;"><u>${awardIcon} ${awardText}</u></span>` : ""}${pdfIcon}${videoIcon}${pressIcon}${appIcon}${citeButton}</div>
                </div>
            </div>
        `;
        
        list.appendChild(listItem);
    });
}

function getAwardIcon(award) {
    if (!award) return "";
    const [type, text] = award.split(";").map(item => item.trim()); // Adjusted parsing for new format
    let name = "";
    if (type === "1") name = "trophy";
    else if (type === "2") name = "medal";
    else if (type === "3") name = "star";
    else if (type === "4") name = "ribbon"; // social impact awards
    
    return name ? icon(name, "color: goldenRod; margin-right: 2px;") : "";
}
// Icons are symbols in img/icons.svg (Font Awesome Free); the viewBox keeps each icon's own width
const ICON_WIDTHS = { "file-pdf": 384, "quote-left": 448, film: 512, newspaper: 512, "app-store-ios": 448, trophy: 576, medal: 512, star: 576, ribbon: 448 };

function icon(name, style) {
    return `<svg class="icon" viewBox="0 0 ${ICON_WIDTHS[name]} 512" aria-hidden="true" focusable="false"${style ? ` style="${style}"` : ""}><use href="img/icons.svg#${name}"></use></svg>`;
}

// ---------- Citations ----------

// Authors as written in the CSV, each either "First Last" or "Last, First"
function authorNames(pub) {
    return pub.Authors.split(";").map(name => name.trim()).filter(Boolean);
}

function displayName(name) {
    let parts = name.split(", ");
    return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
}

function surname(name) {
    return name.includes(",") ? name.split(",")[0].trim() : name.split(/\s+/).pop();
}

// Letters and digits only, with accents removed (Peñuela -> Penuela)
function plainAscii(text) {
    return text.normalize("NFD").replace(/[^A-Za-z0-9]/g, "");
}

function isArticle(pub) {
    return ["journal", "magazine"].includes(pub.Type.toLowerCase());
}

function venueName(pub) {
    return pub.Publication.replace(/^In\s+/, "");
}

function escapeHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ACM Reference Format: "A, B, and C. 2024. Title. In Venue." with the venue in italics
function acmCitation(pub) {
    const names = authorNames(pub).map(displayName);
    const authors = names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    const title = /[.?!]$/.test(pub.Title) ? pub.Title : `${pub.Title}.`;
    const prefix = isArticle(pub) ? "" : "In ";
    const lead = `${authors}. ${pub.Year}. ${title} ${prefix}`;
    return {
        text: `${lead}${venueName(pub)}.`,
        html: `${escapeHTML(lead)}<i>${escapeHTML(venueName(pub))}</i>.`
    };
}

// Key is first author's surname, year and the title's first word, e.g. Wyatt2026beyond;
// a leading "A", "An" or "The" is skipped, so "A Survey on..." gives Zhao2026survey
function bibtexKey(pub) {
    const words = pub.Title.split(/\s+/).map(plainAscii).filter(Boolean);
    const firstWord = words.find(word => !["a", "an", "the"].includes(word.toLowerCase())) || words[0] || "";
    return plainAscii(surname(authorNames(pub)[0] || "")) + pub.Year + firstWord.toLowerCase();
}

function bibtexEscape(text) {
    return text.replace(/([&%#_$])/g, "\\$1");
}

function bibtexEntry(pub) {
    const type = pub.Type.toLowerCase();
    const [entryType, venueField] = isArticle(pub) ? ["article", "journal"]
        : type === "bookchapter" ? ["incollection", "booktitle"]
        : ["inproceedings", "booktitle"];
    const fields = [
        ["author", authorNames(pub).join(" and ")],
        ["title", bibtexEscape(pub.Title)],
        [venueField, bibtexEscape(venueName(pub))],
        ["year", pub.Year]
    ];
    if (pub.Link) fields.push(["url", new URL(pub.Link, location.href).href]);
    const lines = fields.map(([name, value]) => `  ${name.padEnd(9)} = {${value}}`);
    return `@${entryType}{${bibtexKey(pub)},\n${lines.join(",\n")}\n}`;
}

// Opens the cite dialog from any cite button, and copies either format on request
function setUpCitations() {
    const dialog = document.getElementById("cite-dialog");
    const acm = document.getElementById("cite-acm");
    const bibtex = document.getElementById("cite-bibtex");
    const status = document.getElementById("cite-status");
    let current = null;
    let opener = null;

    document.getElementById("publication-results").addEventListener("click", event => {
        const button = event.target.closest(".cite-button");
        if (!button) return;
        current = allPublications[button.dataset.pub];
        opener = button;
        document.getElementById("cite-paper").textContent = current.Title;
        acm.innerHTML = acmCitation(current).html;
        bibtex.textContent = bibtexEntry(current);
        status.textContent = "";
        dialog.showModal();
    });

    dialog.querySelector(".cite-close").addEventListener("click", () => dialog.close());
    // a click on the dimmed backdrop lands on the dialog element itself
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => opener && opener.focus());

    dialog.querySelectorAll(".cite-copy").forEach(button => button.addEventListener("click", async () => {
        const isAcm = button.dataset.copy === "acm";
        const citation = acmCitation(current);
        const text = isAcm ? citation.text : bibtexEntry(current);
        try {
            // the ACM citation also goes on the clipboard as HTML so the venue stays italic in documents
            if (isAcm && window.ClipboardItem) {
                await navigator.clipboard.write([new ClipboardItem({
                    "text/plain": new Blob([text], { type: "text/plain" }),
                    "text/html": new Blob([citation.html], { type: "text/html" })
                })]);
            } else {
                await navigator.clipboard.writeText(text);
            }
            status.textContent = isAcm ? "Citation copied." : "BibTeX copied.";
        } catch (error) {
            // clipboard blocked: select the text so it can be copied by hand
            getSelection().selectAllChildren(isAcm ? acm : bibtex);
            status.textContent = "Press Ctrl+C (or ⌘C) to copy the selected text.";
        }
    }));
}
