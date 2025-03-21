document.addEventListener("DOMContentLoaded", function () {
    fetch("data/publications.csv") 
        .then(response => response.text())
        .then(data => {
            let publications = parseCSV(data);
            console.log("Parsed Publications:", publications); // Log parsed publications
            publications = publications.filter(pub => pub.Show.toLowerCase() !== "no"); // Filter out publications with Show = No
            publications.sort((a, b) => parseInt(a.Year) - parseInt(b.Year)); // Sort by year in ascending order
            addPublicationIdentifiers(publications);
            publications.reverse(); // Reverse again to display newest first
            displayPublications(publications);
        })
        .catch(error => console.error("Error loading CSV file:", error));
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
    let typeCounts = { conference: 0, journal: 0, demo: 0, poster: 0, bookchapter:0};
    
    publications.forEach(pub => {
        let typeShort = "";
        switch (pub.Type.toLowerCase()) {
            case "conference": typeShort = "C"; break;
            case "journal": typeShort = "J"; break;
            case "demo": typeShort = "D"; break;
            case "poster": typeShort = "P"; break;
            case "bookchapter": typeShort = "BC"; break;
        }
        if (typeShort) {
            typeCounts[pub.Type.toLowerCase()] += 1;
            pub.Identifier = `${typeShort}${typeCounts[pub.Type.toLowerCase()]}`;
        } else {
            pub.Identifier = ""; // leave it blank
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
            return formattedName.includes("Timothy Neate") ? `<u>${formattedName}</u>` : formattedName;
        }).join(", "); 
        
        let awardIcon = getAwardIcon(pub.Award);
        let awardText = pub.Award.split(";")[1] || "";
        
        let pdfIcon = pub.Link ? `<a href="${pub.Link}" target="_blank" class="pdf-icon" style="margin-left: 15px;"><i class="fa fa-file-pdf fa-xl"  style="color:royalBlue;"></i></a>` : "";
       
        let videoIcon = pub.VideoLink ? `<a href="${pub.VideoLink}" target="_blank" class="video-icon" style="margin-left: 15px;"><i class="fa-solid fa-film fa-xl" style="color:red;"></i></a>` : "";
        
        let listItem = document.createElement("div");
        listItem.classList.add("publication-item");
        listItem.innerHTML = `
            <div class="row align-items-left">   
 
                <div class="col-sm-1 text-left;" style="font-size: 2em; -webkit-text-fill-color: lightgray; -webkit-text-stroke:.5px; font-weight: 800; margin-left:0px; color:black;">
                    ${pub.Identifier}
                </div>
                <div class="col-sm-11">
                    <p class="lead" style="display: inline;">
                        ${authorsFormatted} <i class="paper-title">${pub.Title}</i>, ${pub.Publication}, ${pub.Year}.
                        &nbsp; <p class="lead" style="display: inline; color: green;"><u>${awardIcon} ${awardText}</u></p>${pdfIcon}
                        ${videoIcon}
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
    
    return icon ? `<i class="${icon}" style="color: goldenRod; margin-right: 2px;" title="${text}"></i>` : "";
}