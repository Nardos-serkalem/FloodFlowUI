// Map initialization
const map = L.map('map-container', {
    zoomSnap: 0.25,
    fadeAnimation: true,
    markerZoomAnimation: true
}).setView([9.1450, 40.4897], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    detectRetina: true,
    crossOrigin: true
}).addTo(map);

// Flood-prone areas data
const vulnerableAreas = {
    "Adama": { coordinates: [8.5400, 39.2669], risk: "High", population: "324,000" },
    "Dire Dawa": { coordinates: [9.5892, 41.8607], risk: "Critical", population: "493,000" },
    "Hareri": { coordinates: [9.3117, 42.1272], risk: "Medium", population: "246,000" },
    "Omo": { coordinates: [6.2592, 36.4872], risk: "High", population: "950,000" },
    "Afar": { coordinates: [11.7559, 41.0082], risk: "Critical", population: "1.8M" }
};

let selectedArea = null;
let currentMarker = null;

// Alert system
const alertMessages = {
    Critical: "🚨 EMERGENCY ALERT: Immediate evacuation recommended!",
    High: "⚠️ DANGER: High flood probability detected",
    Medium: "⚠️ CAUTION: Potential flood risk in area"
};

function showAlert(riskLevel) {
    const alertBanner = document.getElementById('alert-banner');
    const alertContent = document.getElementById('alert-content');
    
    alertContent.innerHTML = `
        <strong>${alertMessages[riskLevel]}</strong>
        <p>${selectedArea.name} (Population: ${selectedArea.population}) requires immediate attention</p>
    `;
    
    alertBanner.style.backgroundColor = 
        riskLevel === 'Critical' ? '#dc3545' :
        riskLevel === 'High' ? '#ffc107' : '#17a2b8';
    
    alertBanner.style.display = 'block';
}

// Area selection handler
document.getElementById('area-select').addEventListener('change', function() {
    const areaName = this.value;
    selectedArea = vulnerableAreas[areaName];
    
    if (selectedArea) {
        map.flyTo(selectedArea.coordinates, 12, {
            animate: true,
            duration: 1.5
        });
        
        if (currentMarker) map.removeLayer(currentMarker);
        currentMarker = L.marker(selectedArea.coordinates, {
            icon: L.icon.pulse({
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                }),
                color: '#4CAF50',
                heartbeat: 1.5
            })
        }).addTo(map)
        .bindPopup(`
            <b>${areaName}</b><br>
            Risk Level: ${selectedArea.risk}<br>
            Population: ${selectedArea.population}
        `).openPopup();
    }
});

// Prediction handler
document.getElementById('predict-button').addEventListener('click', async function() {
    if (!selectedArea) {
        document.getElementById('results-area').classList.add('shake');
        setTimeout(() => resultsArea.classList.remove('shake'), 500);
        return;
    }

    const resultsArea = document.getElementById('results-area');
    resultsArea.innerHTML = `
        <div class="loading-wave">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
        </div>
        <p>Analyzing ${selectedArea.name}...</p>
    `;

    try {
        // Simulated API response
        const fakeResponse = await new Promise(resolve => setTimeout(() => resolve({
            flood_probability: Math.random(),
            predicted_impact: Math.floor(Math.random() * 5000) + " people affected"
        }), 1500));

        // Show alert
        showAlert(selectedArea.risk);

        // Display results
        resultsArea.innerHTML = `
            <h2 class="results-entrance">${selectedArea.name} Flood Forecast</h2>
            <div class="risk-meter risk-${selectedArea.risk.toLowerCase()}">
                <div class="risk-fill" style="width: ${fakeResponse.flood_probability * 100}%"></div>
                <span class="risk-text">${(fakeResponse.flood_probability * 100).toFixed(1)}% Flood Probability</span>
            </div>
            <p class="detail-fade">Potential Impact: ${fakeResponse.predicted_impact}</p>
            <p class="detail-fade">Risk Category: ${selectedArea.risk} Alert</p>
        `;

    } catch (error) {
        console.error('Error:', error);
        resultsArea.innerHTML = `<p class="error-pulse">⚠️ Error retrieving data: ${error.message}</p>`;
    }
});