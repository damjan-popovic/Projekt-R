document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([45.1, 15.2], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    document.getElementById('filterForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        let d_price = document.getElementById("d_price").value || 0;
        let g_price = document.getElementById("g_price").value || 1000000;
        let d_rooms = document.getElementById("d_rooms").value || 0;
        let g_rooms = document.getElementById("g_rooms").value || 1000;
        let d_capacity = document.getElementById("d_capacity").value || 0;
        let g_capacity = document.getElementById("g_capacity").value || 1000;
        let d_beds = document.getElementById("d_beds").value || 0;
        let g_beds = document.getElementById("g_beds").value || 1000;
        let d_baths = document.getElementById("d_baths").value || 0;
        let g_baths = document.getElementById("g_baths").value || 1000;
        let d_arating = document.getElementById("d_arating").value || 0;
        let g_arating = document.getElementById("g_arating").value || 5;
        let d_hrating = document.getElementById("d_hrating").value || 0;
        let g_hrating = document.getElementById("g_hrating").value || 5;

        fetch('http://localhost:3000/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                d_price, g_price, 
                d_rooms, g_rooms, 
                d_capacity, g_capacity, 
                d_beds, g_beds, 
                d_baths, g_baths, 
                d_arating, g_arating, 
                d_hrating, g_hrating 
            })
        })
        .then(response => response.json())
        .then(data => {
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            data.forEach(acc => {
                if (acc.latitude && acc.longitude) {
                    let lat = parseFloat(acc.latitude);
                    let lng = parseFloat(acc.longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
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
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
    });

fetch('static/gadm41_HRV_1.json')
    .then(response => response.json())
    .then(data => {
        function styleFeature(feature) {
            return {
                className: `${feature.properties.NAME_1.replace(/\s+/g, '-')}`,
                color: "blue",
                weight: 2,
                fillOpacity: 0.2
            };
        }
    
        function highlightFeature(e) {
            let layer = e.target;
            layer.setStyle({
                fillOpacity: 0.6,
                weight: 3,
                color: "darkblue"
            });
        }
    
        function resetHighlight(e) {
            geojsonLayer.resetStyle(e.target);
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
});
