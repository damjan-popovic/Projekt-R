document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([45.1, 15.2], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

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
                                    Rating: ${acc.accrating}<br>
                                    Rooms: ${acc.numofrooms}<br>
                                    Capacity: ${acc.capacity}<br>
                                    Beds: ${acc.numofbeds}<br>
                                    Bathrooms: ${acc.numofbathrooms}`);
                } else {
                    console.warn("Skipping entry due to missing lat/lng:", acc);
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
