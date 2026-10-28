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
            setUpFilters(publications);
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

        let authorsFormatted = pub.Authors.split(";").map(name => {
            let parts = name.trim().split(", ");
            let formattedName = parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
            return formattedName.includes("Timothy Neate") ? `<u>${formattedName}</u>` : formattedName;
        }).join(", "); 
        
        let awardIcon = getAwardIcon(pub.Award);
        let awardText = pub.Award.split(";")[1] || "";
        
        // Screen-reader-only text says which paper each link is for and that it opens a new tab
        let newTab = `<span class="sr-only"> for “${pub.Title}” (opens in a new tab)</span>`;

        let pdfIcon = pub.Link ? `<a href="${pub.Link}" target="_blank" rel="noopener" class="pdf-icon" style="margin-left: 5px; color: royalBlue; text-decoration: none; display: inline;"><i class="fa fa-file-pdf fa-lg" aria-hidden="true"></i> <span style="text-decoration: underline; color: royalBlue; display: inline;">PDF</span>${newTab}</a>` : "";
       
        let videoIcon = pub.VideoLink ? `<a href="${pub.VideoLink}" target="_blank" rel="noopener" class="video-icon" style="margin-left: 5px; color: #b83a26; text-decoration: none; display: inline;"><i class="fa-solid fa-film fa-lg" aria-hidden="true"></i> <span style="text-decoration: underline; color: #b83a26; display: inline;">Video</span>${newTab}</a>` : "";
        
        let listItem = document.createElement("li");
        listItem.classList.add("publication-item");
        listItem.innerHTML = `
            <div class="row align-items-left">   
 
                <div class="col-sm-1 text-left" style="font-size: 1.6em; color: #6b6b6b; font-weight: 600; margin-left:0px;">
                    ${pub.Identifier}
                </div>
                <div class="col-sm-11">
                    <p class="lead" style="display: inline;">
                        ${authorsFormatted}. <i class="paper-title">${pub.Title}</i>, ${pub.Publication}, ${pub.Year}.
                        &nbsp; ${awardText ? `<span class="award" style="color: green;"><u>${awardIcon} ${awardText}</u></span>` : ""} ${pdfIcon} ${videoIcon} <br><br>
                    </p>
                </div>
            </div>
        `;
        
        list.appendChild(listItem);
    });
}

function getAwardIcon(award) {
    if (!award) return "";
    const [type, text] = award.split(";").map(item => item.trim()); // Adjusted parsing for new format
    let icon = "";
    if (type === "1") icon = "fa fa-trophy fa-lg";
    else if (type === "2") icon = "fa fa-medal fa-lg";
    else if (type === "3") icon = "fa fa-star fa-lg" ;
    
    return icon ? `<i class="${icon}" style="color: goldenRod; margin-right: 2px;" aria-hidden="true"></i>` : "";
}