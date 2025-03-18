document.addEventListener("DOMContentLoaded", function () {
    fetch("data/publications.csv") // Adjust the file path if necessary
        .then(response => response.text())
        .then(data => {
            const publications = parseCSV(data);
            console.log("Parsed Publications:", publications); // Log parsed publications
            publications.sort((a, b) => parseInt(a.Year) - parseInt(b.Year)); // Sort by year in ascending order
            addPublicationIdentifiers(publications);
            publications.reverse(); // Reverse again to display newest first
            displayPublications(publications);
        })
        .catch(error => console.error("Error loading the CSV file:", error));
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

function addPublicationIdentifiers(publications) {
    let typeCounts = { conference: 0, journal: 0, demo: 0, poster: 0 };
    
    publications.forEach(pub => {
        let typeShort = "";
        switch (pub.Type.toLowerCase()) {
            case "conference": typeShort = "C"; break;
            case "journal": typeShort = "J"; break;
            case "demo": typeShort = "D"; break;
            case "poster": typeShort = "P"; break;
        }
        if (typeShort) {
            typeCounts[pub.Type.toLowerCase()] += 1;
            pub.Identifier = `${typeShort}${typeCounts[pub.Type.toLowerCase()]}`;
        } else {
            pub.Identifier = "";
        }
    });
}

function displayPublications(publications) {
    const container = document.getElementById("publication-container");
    if (!container) return;
    
    const list = document.getElementById("publication-list");
    list.innerHTML = "";
    
    publications.forEach(pub => {
        let authorsFormatted = pub.Authors.split(";").map(name => {
            let parts = name.trim().split(", ");
            let formattedName = parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
            return formattedName.includes("Timothy Neate") ? `<b>${formattedName}</b>` : formattedName;
        }).join(", "); // Change separator to comma + space
        
        let awardIcon = getAwardIcon(pub.Award);
        let awardText = pub.Award.split(";")[1] || "";
        
        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="row">
                <div class="col-sm-2 text-right font-weight-bold" style="font-size: 1.5em;">
                    ${pub.Identifier}
                </div>
                <div class="col-sm-10">
                    <p class="lead">
                        ${authorsFormatted}, <i>${pub.Title}</i>, ${pub.Publication}, ${pub.Year}.
                        <span style="color: red;">${awardIcon} ${awardText}</span>
                        &nbsp;<a href="${pub.Link}" target="_blank" class="pdf-icon">
                            <i class="fa-solid fa-file-pdf"></i>
                        </a>
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
    if (type === "1") icon = "fa-solid fa-trophy";
    else if (type === "2") icon = "fa-solid fa-medal";
    else if (type === "3") icon = "fa-solid fa-star";
    
    return icon ? `<i class="${icon}" style="color: red;" title="${text}"></i>` : "";
}
