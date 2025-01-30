document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([44.5569, 16.3678], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let d_price = 0;
    let g_price = 1000000;
    let d_rooms = 0;
    let g_rooms = 1000;
    let d_capacity = 0;
    let g_capacity = 1000;
    let d_beds = 0;
    let g_beds = 1000;
    let d_baths = 0;
    let g_baths = 1000;
    let d_arating = 0;
    let g_arating = 5;
    let d_hrating = 0;
    let g_hrating = 5;
    let selectedCounty = document.getElementById("selectedCounty").value || 'nijedno';
    let selectedSubregion = document.getElementById("selectedSubregion").value || 'nijedno';

    let menu = document.getElementById("menu");
    let mapContainer = document.getElementById("map-container");
    let lijevoTijelo = document.querySelector(".lijevo-tijelo");
    let naslovTijelo = document.querySelector(".naslov-tijelo");
    let filterContainer = document.getElementById("filter-container");
    let grafoviContainer = document.getElementById("grafovi-container");
    let arrow = document.getElementById("arrow");
    let screenWidth = window.innerWidth;
    let menuWidth = screenWidth > 768 ? "15%" : "20%";
    let grafMenuWidth = screenWidth > 768 ? "40%" : "50%";
    let filteriExpanded = false;
    let grafExpanded = false;

    mapContainer.style.width = screenWidth > 768 ? "calc(100% + 22%)" : "calc(100% + 40%)";
    mapContainer.style.marginLeft = screenWidth > 768 ? "-6%" : "-12%";
    lijevoTijelo.style.width = screenWidth > 768 ? "5%": "10%";

    filterContainer.style.height = "0";

    document.getElementById("gumb-clear").addEventListener("click", function() {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
            if (subGeojsonLayer) {
                map.removeLayer(subGeojsonLayer);
            }

            document.getElementById("d_price").value = "";
            document.getElementById("g_price").value = "";
            document.getElementById("rooms").value = "";
            document.getElementById("rooms").value = "";
            document.getElementById("capacity").value = "";
            document.getElementById("capacity").value = "";
            document.getElementById("beds").value = "";
            document.getElementById("beds").value = "";
            document.getElementById("baths").value = "";
            document.getElementById("baths").value = "";
            document.getElementById("d_arating").value = "";
            document.getElementById("g_arating").value = "";
            document.getElementById("d_hrating").value = "";
            document.getElementById("g_hrating").value = "";


            document.getElementById("selectedCounty").value = 'nijedno';
            document.getElementById("selectedSubregion").value = 'nijedno';
            document.getElementById("airbnb-highlight-dio").textContent = "Croatia";

            map.flyTo([44.5569, 16.3678], 8, {
                animate: true,
                duration: 0.25
            });
        });
    });

    document.getElementById("menu-toggle").addEventListener("click", function() {
        if ((menu.style.left === "-100%" || menu.style.left === "") && grafExpanded === false) {
            menu.style.left = "0";
            lijevoTijelo.style.width = menuWidth;
            mapContainer.style.width = "100%";
            mapContainer.style.marginLeft = "0";
        } else if ((menu.style.left === "-100%" || menu.style.left === "") && grafExpanded === true) {
            menu.style.left = "0";
            lijevoTijelo.style.width = "56.7%";
            mapContainer.style.width = "100%";
            mapContainer.style.marginLeft = "0";
        } else {
            menu.style.left = "-100%";
            lijevoTijelo.style.width = screenWidth > 768 ? "5%": "0%";
            mapContainer.style.width = screenWidth > 768 ? "calc(100% + 22%)" : "calc(100% + 40%)";
            mapContainer.style.marginLeft = screenWidth > 768 ? "-6%" : "-12";
        }
    });

    document.getElementById("naslov-filteri").addEventListener("click", function() {
        if ((filterContainer.style.height === "0px" || filterContainer.style.height === "") && grafExpanded === false) {
            filterContainer.style.height = filterContainer.scrollHeight + "px";
            arrow.style.transform = "rotate(180deg)";
            filteriExpanded = true;
            filterContainer.style.overflowY = "hidden";
            grafoviContainer.style.overflowY = "hidden";
        } else if ((filterContainer.style.height === "0px" || filterContainer.style.height === "") && grafExpanded === true) {
            filterContainer.style.height = filterContainer.scrollHeight + "px";
            arrow.style.transform = "rotate(180deg)";
            filteriExpanded = true;
            filterContainer.style.overflowY = "scroll";
            grafoviContainer.style.overflowY = "scroll";
        } else {
            filterContainer.style.height = "0";
            arrow.style.transform = "rotate(0deg)";
            filteriExpanded = false;
            filterContainer.style.overflowY = "hidden";
            grafoviContainer.style.overflowY = "hidden";
        }
    });

    document.getElementById('filterForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        d_price = document.getElementById("d_price").value || 0;
        g_price = document.getElementById("g_price").value || 1000000;
        d_rooms = document.getElementById("rooms").value || 0;
        g_rooms = document.getElementById("rooms").value || 1000;
        d_capacity = document.getElementById("capacity").value || 0;
        g_capacity = document.getElementById("capacity").value || 1000;
        d_beds = document.getElementById("beds").value || 0;
        g_beds = document.getElementById("beds").value || 1000;
        d_baths = document.getElementById("baths").value || 0;
        g_baths = document.getElementById("baths").value || 1000;
        d_arating = document.getElementById("d_arating").value || 0;
        g_arating = document.getElementById("g_arating").value || 5;
        d_hrating = document.getElementById("d_hrating").value || 0;
        g_hrating = document.getElementById("g_hrating").value || 5;
        selectedCounty = document.getElementById("selectedCounty").value || 'nijedno';
        selectedSubregion = document.getElementById("selectedSubregion").value || 'nijedno';

        const formattedCounty = selectedCounty === "Grad Zagreb" ? selectedCounty : `${selectedCounty} županija`;

        fetch('https://isohr.onrender.com/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selectedCounty: formattedCounty,
                selectedSubregion,
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

    document.getElementById("naslov-grafovi").addEventListener("click", function() {
        const arrow = document.getElementById("arrow-grafovi");
    
        if ((grafoviContainer.style.height === "0px" || grafoviContainer.style.height === "") && filteriExpanded === false) {
            arrow.style.transform = "rotate(180deg)";
            lijevoTijelo.style.width = "56.7%";
            grafoviContainer.style.height = grafoviContainer.scrollHeight + "px";
            menu.style.width = grafMenuWidth;
            grafExpanded = true;
            filterContainer.style.overflowY = "hidden";
            grafoviContainer.style.overflowY = "hidden";
        } else if ((grafoviContainer.style.height === "0px" || grafoviContainer.style.height === "") && filteriExpanded === true) {
            arrow.style.transform = "rotate(180deg)";
            lijevoTijelo.style.width = "56.7%";
            grafoviContainer.style.height = grafoviContainer.scrollHeight + "px";
            filterContainer.style.height = filterContainer.scrollHeight + "px";
            menu.style.width = grafMenuWidth;
            grafExpanded = true;
            filterContainer.style.overflowY = "scroll";
            grafoviContainer.style.overflowY = "scroll";
        } else {
            arrow.style.transform = "rotate(0deg)";
            grafoviContainer.style.height = "0";
            menu.style.width = menuWidth;
            lijevoTijelo.style.width = menuWidth;
            grafExpanded = false;
            filterContainer.style.overflowY = "hidden";
            grafoviContainer.style.overflowY = "hidden";
        }
    });

    let geojsonLayer, subGeojsonLayer;

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

    function highlightSubFeature(e) {
        let layer = e.target;
        layer.setStyle({
            fillOpacity: 0.6,
            weight: 3,
            color: "darkred"
        });
    }

    function resetSubHighlight(e) {
        subGeojsonLayer.resetStyle(e.target);
    }

    function loadSubRegions(countyName) {
        if (subGeojsonLayer) {
            map.removeLayer(subGeojsonLayer);
        }
        document.getElementById("selectedCounty").value = countyName;
    
        fetch('static/gadm41_HRV_2.json')
            .then(response => response.json())
            .then(data => {
                let filteredData = {
                    type: "FeatureCollection",
                    features: data.features.filter(f => f.properties.NAME_1 === countyName)
                };
    
                subGeojsonLayer = L.geoJSON(filteredData, {
                    style: {
                        color: "red",
                        weight: 2,
                        fillOpacity: 0.3
                    },
                    onEachFeature: function (feature, layer) {
                        let subcentar = layer.getBounds().getCenter();
                        let subregionName = feature.properties.NAME_2;
                        let avgPrice = subregionAveragesData[subregionName] ? `€${subregionAveragesData[subregionName].avg_price}` : "No data";
                        let avgRating = subregionAveragesData[subregionName] ? subregionAveragesData[subregionName].avg_rating : "No data";
    
                        layer.on({
                            mouseover: function (e) {
                                let tooltip = L.tooltip({
                                    permanent: false,
                                    direction: "top",
                                    className: "subregion-tooltip"
                                })
                                    .setContent(`<b>${subregionName}</b><br>Avg Price: ${avgPrice}<br>Avg Rating: ${avgRating}`)
                                    .setLatLng(subcentar)
                                    .addTo(map);
    
                                layer.on("mouseout", function () {
                                    map.removeLayer(tooltip);
                                });
    
                                highlightSubFeature(e);
                            },
                            mouseout: resetSubHighlight,
                            click: function () {
                                let subregionName = feature.properties.NAME_2;
                                document.getElementById("selectedSubregion").value = subregionName;
                                let bounds = layer.getBounds();
                                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                                updateHighlightLocation(subregionName)
                            }
                        });
                    }
                }).addTo(map);
    
                let bounds = L.geoJSON(filteredData).getBounds();
                map.fitBounds(bounds, { padding: [50, 50] });
            })
            .catch(error => console.error('Error loading subregions:', error));
    }
    
    function onEachFeature(feature, layer) {
        let centar = layer.getBounds().getCenter();
    
        layer.on({
            mouseover: function (e) {
                let countyName = feature.properties.NAME_1 === "Grad Zagreb" ? "Grad Zagreb" : feature.properties.NAME_1 + " županija";

                let avgPrice = countyAveragesData[countyName] ? `€${countyAveragesData[countyName].avg_price}` : "No data";
                let avgRating = countyAveragesData[countyName] ? countyAveragesData[countyName].avg_rating : "No data";

                let tooltip = L.tooltip({
                    permanent: false,
                    direction: "top",
                    className: "county-tooltip"
                })
                .setContent(`<b>${countyName}</b><br>Avg Price: ${avgPrice}<br>Avg Rating: ${avgRating}`)
                .setLatLng(centar)
                .addTo(map);
    
                layer.on("mouseout", function () {
                    map.removeLayer(tooltip);
                });
    
                highlightFeature(e);
            },
            mouseout: resetHighlight,
            click: function () {
                document.getElementById("selectedSubregion").value = 'nijedno';
                let countyName = feature.properties.NAME_1 === "Grad Zagreb" ? "Grad Zagreb" : feature.properties.NAME_1 + " županija";
                loadSubRegions(feature.properties.NAME_1);
                updateHighlightLocation(countyName)
            }
        });
    }

    function updateHighlightLocation(name) {
        let airbnbHighlightDio = document.getElementById("airbnb-highlight-dio")

        if (name !== "nijedno") {
            airbnbHighlightDio.textContent = name;
        } else if (name !== "nijedno") {
            airbnbHighlightDio.textContent = name;
        } else {
            airbnbHighlightDio.textContent = "Croatia";
        }
    }


    let countyAveragesData = {};
    fetch("https://isohr.onrender.com/api/countyAverages")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                countyAveragesData[item.županija] = {
                    avg_price: parseFloat(item.avg_price).toFixed(2),
                    avg_rating: parseFloat(item.avg_rating).toFixed(1)
                };
            });
        })
        .catch(error => console.error("Error fetching averages:", error));

    let subregionAveragesData = {};
    fetch("https://isohr.onrender.com/api/subregionAverages")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                subregionAveragesData[item.grad] = {
                    avg_price: parseFloat(item.avg_price).toFixed(2),
                    avg_rating: parseFloat(item.avg_rating).toFixed(1)
                };
            });
        })
        .catch(error => console.error("Error fetching averages:", error));

    fetch('static/gadm41_HRV_1.json')
        .then(response => response.json())
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                style: styleFeature,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    //GRAF
    fetch("https://isohr.onrender.com/api/countyAverages")
        .then(response => response.json())
        .then(countyAveragesData => {
            fetch('static/gadm41_HRV_1.json')
                .then(response => response.json())
                .then(countyData => {
                    const allCounties = countyData.features.map(feature => {
                        return feature.properties.NAME_1 === "Grad Zagreb" ? "Grad Zagreb" : feature.properties.NAME_1 + " županija";
                    });
    
                    const countyNames = allCounties.filter(county => {
                        let found = countyAveragesData.find(c => c.županija === county);
                        return found && found.avg_price != null && found.avg_rating != null;
                    });
    
                    let avgPrices = countyNames.map(county => {
                        let found = countyAveragesData.find(c => c.županija === county);
                        return parseFloat(parseFloat(found.avg_price).toFixed(2));
                    });
    
                    let avgRatings = countyNames.map(county => {
                        let found = countyAveragesData.find(c => c.županija === county);
                        return parseFloat(parseFloat(found.avg_rating).toFixed(3));
                    });
    
                    let maxCountyPrice = Math.max(...countyAveragesData.map(c => c.avg_price || 0));
                    let minCountyPrice = Math.min(...countyAveragesData.map(c => c.avg_price || Infinity));
                    if (maxCountyPrice === minCountyPrice) { minCountyPrice = maxCountyPrice - 1; }
    
                    let ratingPriceRatios = countyNames.map(county => {
                        let found = countyAveragesData.find(c => c.županija === county);
                        if (!found || found.avg_rating == null || found.avg_price == null) return 0;
                        if (maxCountyPrice === minCountyPrice) return 0;
    
                        let normalizedRating = (found.avg_rating - 1) / 4;
                        let normalizedPrice = (maxCountyPrice - found.avg_price) / (maxCountyPrice - minCountyPrice);
    
                        return parseFloat(((normalizedRating + normalizedPrice) * 2.5).toFixed(3));
                    }).filter(value => !isNaN(value));
    
                    console.log("Rating Price Ratios:", ratingPriceRatios);
    
                    const container = document.getElementById('chart-area');
                    if (!container) {
                        console.error("Chart container not found!");
                        return;
                    }
    
                    const data = {
                        categories: countyNames,
                        series: {
                            column: [
                                { name: "Average Price (€)", data: avgPrices }
                            ],
                            line: [
                                { name: "Average Rating", data: avgRatings },
                                { name: "Rating-Price Ratio", data: ratingPriceRatios }
                            ]
                        }
                    };
    
                    const options = {
                        chart: { width: visualViewport.width*0.4, height: visualViewport.height*0.6, title: "County-wise Price, Rating & Ratio" },
                        xAxis: {
                            title: "County",
                            label: {
                                interval: 1,
                                rotateDegree: -45
                            }
                        },
                        yAxis: [
                            {
                                title: "Average Price (€)",
                                chartType: "column",
                                scale: { min: 0 }
                            },
                            {
                                title: "Average Rating & Ratio",
                                chartType: "line",
                                scale: { min: 0, max: 5.5 },
                                align: "right"
                            }
                        ],
                        series: {
                            showDot: true,
                            spline: true
                        },
                        legend: { align: "bottom" }
                    }
                toastui.Chart.columnLineChart({ el: container, data, options })
                })
                .catch(error => console.error("Error loading county data:", error));
        })
        .catch(error => console.error("Error fetching county averages:", error));
});