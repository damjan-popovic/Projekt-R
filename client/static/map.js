document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([45.1, 15.2], 7);

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

// Load Croatia counties GeoJSON
fetch('static/gadm41_HRV_1.json')  // Ensure the file is in the "static" folder
    .then(response => response.json())
    .then(data => {
        function styleFeature(feature) {
            return {
                className: `${feature.properties.NAME_1.replace(/\s+/g, '-')}`, // Make it CSS-friendly
                color: "blue",
                weight: 2,
                fillOpacity: 0.2
            };
        }

        function highlightFeature(e) {
            let layer = e.target;
            layer.setStyle({
                fillOpacity: 0.6, // Darker fill on hover
                weight: 3,
                color: "darkblue"
            });
        }

        function resetHighlight(e) {
            geojsonLayer.resetStyle(e.target); // Reset to default style
        }

        function onEachFeature(feature, layer) {
            layer.bindPopup(`<b>${feature.properties.NAME_1}</b>`);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }

        let geojsonLayer = L.geoJSON(data, {
            style: styleFeature,
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

    // Load Airbnb data and add markers
    fetch('http://localhost:3000/api/data')
        .then(response => response.json())
        .then(data => {
            data.forEach(acc => {
                if (acc.latitude && acc.longitude) {
                    let lat = parseFloat(acc.latitude);
                    let lng = parseFloat(acc.longitude);
                    if (isNaN(lat) || isNaN(lng)) {
                        console.warn("Skipping invalid lat/lng:", acc);
                        return;
                    }
                    L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`<b>${acc.acc_name}</b><br>
                                    Host: ${acc.hostname} ${acc.hostsurname}<br>
                                    Pricing: ${acc.price} night<br>
                                    Rating: ${acc.accrating}<br>
                                    Rooms: ${acc.numofrooms}<br>
                                    Capacity: ${acc.capacity}<br>
                                    Beds: ${acc.numofbeds}<br>
                                    Bathrooms: ${acc.numofbathrooms}<br>
                                    <a href="https://www.airbnb.com/rooms/${acc.accommodationid}" target="_blank">View Listing</a>`);
                } else {
                    console.warn("Skipping entry due to missing lat/lng:", acc);
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
