// scripts.js

// Function to copy text to clipboard with tooltip feedback
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Initialize tooltip
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })

        // Find the button that was clicked
        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(button) {
            if(button.onclick.toString().includes(text)) {
                button.setAttribute('data-bs-toggle', 'tooltip');
                button.setAttribute('data-bs-placement', 'top');
                button.setAttribute('title', 'Copied!');
                var tooltip = new bootstrap.Tooltip(button);
                button.focus();
                tooltip.show();

                // Hide tooltip after 1.5 seconds
                setTimeout(function() {
                    tooltip.hide();
                    button.removeAttribute('data-bs-toggle');
                    button.removeAttribute('data-bs-placement');
                    button.removeAttribute('title');
                }, 1500);
            }
        });
    }, function(err) {
        alert('Failed to copy text: ', err);
    });
}

// Update current year in footer
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// Google Sheets Configuration
const SPREADSHEET_ID = '1Kp5687UkEhR29aA62zbGjlxMc0XST65mA9XsUxnzYME'; // Replace with your spreadsheet ID

// Sheet URLs for different sections
const SHEETS = {
    personalInfo: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=PersonalInfo`,
    about: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=About`,
    skills: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Skills`,
    experience: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Experience`,
    projects: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Projects`
};

// Function to parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.map(line => {
        // Handle quoted values with commas inside them
        const values = [];
        let inQuote = false;
        let currentValue = '';
        
        for(let char of line) {
            if(char === '"') {
                inQuote = !inQuote;
            } else if(char === ',' && !inQuote) {
                values.push(currentValue.replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.replace(/^"|"$/g, ''));
        return values;
    }).slice(1); // Remove header row
}

// Function to fetch data from a specific sheet
async function fetchSheetData(sheetUrl) {
    try {
        const response = await fetch(sheetUrl);
        const csvData = await response.text();
        return parseCSV(csvData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Function to update personal information
async function updatePersonalInfo() {
    const data = await fetchSheetData(SHEETS.personalInfo);
    if (data.length === 0) return;

    const info = Object.fromEntries(data); // Convert array to key-value pairs
    
    // Update hero section
    document.querySelector('#hero h1').innerHTML = `Hi, I'm ${info.name || 'Kashish'} <span class="wave">👋</span>`;
    if (info.headline) document.querySelector('#hero .lead').textContent = info.headline;
    if (info.location) document.querySelector('#hero p:nth-of-type(1)').textContent = info.location;
    if (info.availability) document.querySelector('#hero .text-success').textContent = info.availability;
    if (info.cv_link) document.querySelector('#hero a[target="_blank"]').href = info.cv_link;
    if (info.linkedin) document.querySelector('a[href*="linkedin.com"]').href = info.linkedin;
    if (info.github) document.querySelector('a[href*="github.com"]').href = info.github;
    if (info.email) {
        document.querySelector('#contact span').textContent = info.email;
        document.querySelector('#contact button').setAttribute('onclick', `copyToClipboard('${info.email}')`);
    }
}

// Function to update about section
async function updateAbout() {
    const data = await fetchSheetData(SHEETS.about);
    if (data.length === 0) return;

    const aboutContent = document.querySelector('#about .col-md-6:last-child');
    aboutContent.innerHTML = data.map(row => `<p>${row[0]}</p>`).join('');
}

// Function to update skills section
async function updateSkills() {
    const data = await fetchSheetData(SHEETS.skills);
    if (data.length === 0) return;

    const skillsContainer = document.querySelector('#skills .row');
    skillsContainer.innerHTML = data.map(([name, icon, link]) => `
        <div class="col-6 col-md-4 col-lg-3 text-center">
            <a href="${link}" target="_blank" class="text-decoration-none text-dark">
                <img src="images/logos/${icon}" alt="${name}" class="mb-2" width="60">
                <p>${name}</p>
            </a>
        </div>
    `).join('');
}

// Function to update experience section
async function updateExperience() {
    const data = await fetchSheetData(SHEETS.experience);
    if (data.length === 0) return;

    const experienceContainer = document.querySelector('#experience .container');
    const header = experienceContainer.querySelector('.badge').parentElement.nextElementSibling;
    
    let experienceHTML = data.map(row => {
        const [company, role, period, logo, ...responsibilities] = row;
        return `
        <div class="card mb-4 shadow-sm">
            <div class="row g-0">
                <div class="col-md-3 text-center p-3">
                    <img src="images/logos/${logo}" alt="${company} logo" class="img-fluid" width="100">
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h5 class="card-title">${role}</h5>
                        <p class="card-text"><strong>${period}</strong></p>
                        <ul>
                            ${responsibilities.map(resp => `<li>${resp.trim()}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    // Keep the header and add new experience items
    experienceContainer.innerHTML = '';
    experienceContainer.appendChild(header);
    const newDiv = document.createElement('div');
    newDiv.innerHTML = experienceHTML;
    experienceContainer.appendChild(newDiv);
}

// Function to update projects section
async function updateProjects() {
    const data = await fetchSheetData(SHEETS.projects);
    if (data.length === 0) return;

    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = data.map(([title, description, image, githubLink, liveLink]) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="images/${image}" class="card-img-top" alt="${title}">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${description}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <div class="d-flex justify-content-between">
                        ${githubLink ? `<a href="${githubLink}" class="btn btn-outline-dark" target="_blank">
                            <img src="images/logos/icon-github.svg" alt="GitHub" width="20" class="me-2">
                            GitHub
                        </a>` : ''}
                        ${liveLink ? `<a href="${liveLink}" class="btn btn-primary" target="_blank">
                            <i class="fas fa-external-link-alt me-2"></i>Live Demo
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Add loading indicator
function showLoading() {
    const sections = ['about', 'skills', 'experience', 'projects'];
    sections.forEach(section => {
        const container = document.getElementById(section);
        if (container) {
            container.style.opacity = '0.5';
        }
    });
}

function hideLoading() {
    const sections = ['about', 'skills', 'experience', 'projects'];
    sections.forEach(section => {
        const container = document.getElementById(section);
        if (container) {
            container.style.opacity = '1';
        }
    });
}

// Load all content when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Update current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Show loading state
    showLoading();
    
    try {
        // Fetch and update all content in parallel
        await Promise.all([
            updatePersonalInfo(),
            updateAbout(),
            updateSkills(),
            updateExperience(),
            updateProjects()
        ]);
    } catch (error) {
        console.error('Error updating content:', error);
    } finally {
        // Hide loading state
        hideLoading();
    }
});
