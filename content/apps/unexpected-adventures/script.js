// Unexpected Adventures - Main JavaScript File
// Created by: Rishi Verma

// Global variables
let map;
let drawnItems;
let userLocationMarker;
let adventureMarkers = [];
let selectedAreas = [];
let userLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeDrawingTools();
    initializeEventListeners();
    requestUserLocation();
});

// Initialize Leaflet map
function initializeMap() {
    // Create map centered on world view
    map = L.map('map', {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create layer group for drawn areas
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
}

// Initialize drawing tools
function initializeDrawingTools() {
    // Create drawing control
    const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Error:</strong> Shape edges cannot cross!'
                },
                shapeOptions: {
                    color: '#17a2b8',
                    fillColor: '#17a2b8',
                    fillOpacity: 0.3,
                    weight: 2
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#17a2b8',
                    fillColor: '#17a2b8',
                    fillOpacity: 0.3,
                    weight: 2
                }
            },
            circle: {
                shapeOptions: {
                    color: '#17a2b8',
                    fillColor: '#17a2b8',
                    fillOpacity: 0.3,
                    weight: 2
                }
            },
            polyline: false,
            marker: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    map.addControl(drawControl);

    // Handle created shapes
    map.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        selectedAreas.push(layer);
        
        // Add click handler to remove area
        layer.on('click', () => {
            if (confirm('Remove this area?')) {
                drawnItems.removeLayer(layer);
                selectedAreas = selectedAreas.filter(area => area !== layer);
            }
        });
    });

    // Handle deleted shapes
    map.on(L.Draw.Event.DELETED, (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            selectedAreas = selectedAreas.filter(area => area !== layer);
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Generate Adventures button
    document.getElementById('generate-adventures').addEventListener('click', generateAdventures);
    
    // Surprise Me button
    document.getElementById('surprise-me').addEventListener('click', surpriseMe);
    
    // Clear Areas button
    document.getElementById('clear-areas').addEventListener('click', clearAreas);
    
    // Clear Markers button
    document.getElementById('clear-markers').addEventListener('click', clearMarkers);
    
    // My Location button
    document.getElementById('my-location').addEventListener('click', centerOnUserLocation);
    
    // About button
    document.getElementById('about').addEventListener('click', showAboutModal);
    
    // Modal close buttons
    document.querySelector('.modal-close').addEventListener('click', hideAboutModal);
    document.querySelector('.poi-panel-close').addEventListener('click', hidePOIPanel);
    
    // Close modal on background click
    document.getElementById('about-modal').addEventListener('click', (e) => {
        if (e.target.id === 'about-modal') {
            hideAboutModal();
        }
    });
}

// Request user location
function requestUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showUserLocation();
            },
            (error) => {
                console.log('Geolocation error:', error);
            }
        );
    }
}

// Show user location on map
function showUserLocation() {
    if (!userLocation) return;
    
    // Remove existing user location marker
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    
    // Create custom user location icon
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    // Add user location marker
    userLocationMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location');
}

// Center map on user location
function centerOnUserLocation() {
    if (!userLocation) {
        alert('Location access is required. Please enable location services.');
        requestUserLocation();
        return;
    }
    
    map.setView([userLocation.lat, userLocation.lng], 13);
    showUserLocation();
}

// Generate adventures in selected areas
function generateAdventures() {
    if (selectedAreas.length === 0) {
        alert('Please select at least one area on the map first!');
        return;
    }
    
    // Clear existing adventure markers
    clearMarkers();
    
    // Generate one random marker per selected area
    selectedAreas.forEach(area => {
        const randomPoint = getRandomPointInArea(area);
        if (randomPoint) {
            createAdventureMarker(randomPoint);
        }
    });
    
    // Fit map to show all markers
    if (adventureMarkers.length > 0) {
        const group = new L.featureGroup(adventureMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Surprise Me - generate random location in current view
function surpriseMe() {
    const bounds = map.getBounds();
    const randomLat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth();
    const randomLng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest();
    
    const randomPoint = L.latLng(randomLat, randomLng);
    createAdventureMarker(randomPoint);
    
    // Center map on new marker
    map.setView(randomPoint, Math.max(map.getZoom(), 13));
}

// Get random point within an area
function getRandomPointInArea(layer) {
    const bounds = layer.getBounds();
    let point;
    let attempts = 0;
    const maxAttempts = 100;
    
    // For circles, use a different approach
    if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        const radiusInDeg = radius / 111000; // Approximate conversion to degrees
        
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * radiusInDeg;
        
        const lat = center.lat + r * Math.cos(angle);
        const lng = center.lng + r * Math.sin(angle);
        
        return L.latLng(lat, lng);
    }
    
    // For polygons and rectangles
    while (attempts < maxAttempts) {
        const randomLat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth();
        const randomLng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest();
        point = L.latLng(randomLat, randomLng);
        
        // Check if point is within the polygon
        if (layer instanceof L.Rectangle || isPointInPolygon(point, layer)) {
            return point;
        }
        
        attempts++;
    }
    
    // Fallback to center of bounds
    return bounds.getCenter();
}

// Check if point is within polygon (simple point-in-polygon algorithm)
function isPointInPolygon(point, polygon) {
    const latlngs = polygon.getLatLngs()[0];
    let inside = false;
    
    for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
        const xi = latlngs[i].lat, yi = latlngs[i].lng;
        const xj = latlngs[j].lat, yj = latlngs[j].lng;
        
        const intersect = ((yi > point.lng) !== (yj > point.lng))
            && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

// Create adventure marker
function createAdventureMarker(latlng) {
    // Create custom adventure icon
    const adventureIcon = L.divIcon({
        className: 'adventure-marker',
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    
    // Create marker
    const marker = L.marker(latlng, { icon: adventureIcon })
        .addTo(map)
        .bindPopup('Click to explore nearby attractions!');
    
    // Add click handler for POI discovery
    marker.on('click', () => {
        discoverPOIs(latlng);
    });
    
    adventureMarkers.push(marker);
}

// Discover POIs near a location
async function discoverPOIs(latlng) {
    showPOIPanel();
    showPOILoading();
    
    try {
        // Build Overpass API query
        const radius = 1000; // 1km radius
        const query = `
            [out:json][timeout:25];
            (
                node["tourism"](around:${radius},${latlng.lat},${latlng.lng});
                node["historic"](around:${radius},${latlng.lat},${latlng.lng});
                node["leisure"="museum"](around:${radius},${latlng.lat},${latlng.lng});
                node["amenity"="theatre"](around:${radius},${latlng.lat},${latlng.lng});
                node["leisure"="park"](around:${radius},${latlng.lat},${latlng.lng});
                node["tourism"="viewpoint"](around:${radius},${latlng.lat},${latlng.lng});
                node["tourism"="attraction"](around:${radius},${latlng.lat},${latlng.lng});
                node["tourism"="gallery"](around:${radius},${latlng.lat},${latlng.lng});
                way["tourism"](around:${radius},${latlng.lat},${latlng.lng});
                way["historic"](around:${radius},${latlng.lat},${latlng.lng});
                way["leisure"="museum"](around:${radius},${latlng.lat},${latlng.lng});
                way["amenity"="theatre"](around:${radius},${latlng.lat},${latlng.lng});
                way["leisure"="park"](around:${radius},${latlng.lat},${latlng.lng});
            );
            out body;
            >;
            out skel qt;
        `;
        
        // Make API request
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch POIs');
        }
        
        const data = await response.json();
        displayPOIs(data.elements, latlng);
        
    } catch (error) {
        console.error('Error fetching POIs:', error);
        displayPOIError();
    }
}

// Display POIs in panel
function displayPOIs(pois, centerPoint) {
    const poiList = document.querySelector('.poi-list');
    poiList.innerHTML = '';
    hidePOILoading();
    
    // Filter and process POIs
    const processedPOIs = pois
        .filter(poi => poi.tags && poi.tags.name)
        .map(poi => {
            const poiLat = poi.lat || (poi.center && poi.center.lat);
            const poiLng = poi.lon || (poi.center && poi.center.lon);
            
            if (!poiLat || !poiLng) return null;
            
            const distance = calculateDistance(centerPoint.lat, centerPoint.lng, poiLat, poiLng);
            
            return {
                name: poi.tags.name,
                type: getPoiType(poi.tags),
                distance: distance,
                lat: poiLat,
                lng: poiLng,
                tags: poi.tags
            };
        })
        .filter(poi => poi !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20); // Limit to 20 results
    
    if (processedPOIs.length === 0) {
        poiList.innerHTML = '<p>No attractions found nearby. Try a different location!</p>';
        return;
    }
    
    // Create POI items
    processedPOIs.forEach(poi => {
        const poiItem = createPOIElement(poi);
        poiList.appendChild(poiItem);
    });
}

// Create POI element
function createPOIElement(poi) {
    const item = document.createElement('div');
    item.className = 'poi-item';
    
    const name = document.createElement('div');
    name.className = 'poi-name';
    name.textContent = poi.name;
    
    const type = document.createElement('div');
    type.className = 'poi-type';
    type.textContent = poi.type;
    
    const distance = document.createElement('div');
    distance.className = 'poi-distance';
    distance.textContent = `${formatDistance(poi.distance)} away`;
    
    const goHere = document.createElement('a');
    goHere.className = 'poi-go-here';
    goHere.textContent = 'Go Here';
    goHere.href = '#';
    goHere.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPOI(poi);
    });
    
    item.appendChild(name);
    item.appendChild(type);
    item.appendChild(distance);
    item.appendChild(goHere);
    
    return item;
}

// Get POI type from tags
function getPoiType(tags) {
    if (tags.tourism) return tags.tourism.replace('_', ' ');
    if (tags.historic) return 'historic site';
    if (tags.leisure) return tags.leisure.replace('_', ' ');
    if (tags.amenity) return tags.amenity.replace('_', ' ');
    return 'point of interest';
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

// Format distance for display
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(1)}km`;
    }
}

// Navigate to POI
function navigateToPOI(poi) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (userLocation && isMobile) {
        // Use native maps app on mobile
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (isIOS) {
            // Apple Maps
            window.location.href = `maps://maps.apple.com/?daddr=${poi.lat},${poi.lng}`;
        } else {
            // Google Maps on Android
            window.location.href = `geo:0,0?q=${poi.lat},${poi.lng}(${encodeURIComponent(poi.name)})`;
        }
    } else {
        // Open OpenStreetMap directions in new tab
        const url = userLocation
            ? `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${poi.lat},${poi.lng}`
            : `https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lng}#map=16/${poi.lat}/${poi.lng}`;
        
        window.open(url, '_blank');
    }
}

// Clear all selected areas
function clearAreas() {
    drawnItems.clearLayers();
    selectedAreas = [];
}

// Clear all adventure markers
function clearMarkers() {
    adventureMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    adventureMarkers = [];
}

// Show/hide POI panel
function showPOIPanel() {
    document.getElementById('poi-panel').classList.remove('hidden');
}

function hidePOIPanel() {
    document.getElementById('poi-panel').classList.add('hidden');
}

// Show/hide POI loading
function showPOILoading() {
    document.querySelector('.poi-loading').classList.remove('hidden');
    document.querySelector('.poi-list').innerHTML = '';
}

function hidePOILoading() {
    document.querySelector('.poi-loading').classList.add('hidden');
}

// Display POI error
function displayPOIError() {
    hidePOILoading();
    document.querySelector('.poi-list').innerHTML = '<p>Sorry, we couldn\'t fetch nearby attractions. Please try again later.</p>';
}

// Show/hide about modal
function showAboutModal() {
    document.getElementById('about-modal').classList.remove('hidden');
}

function hideAboutModal() {
    document.getElementById('about-modal').classList.add('hidden');
}

// Handle button text on mobile
function updateButtonText() {
    const isMobile = window.innerWidth <= 480;
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        const icon = button.querySelector('.btn-icon');
        const text = button.textContent.trim();
        
        if (isMobile) {
            // Remove text on mobile, keep only icon
            button.innerHTML = '';
            if (icon) button.appendChild(icon);
        } else {
            // Restore text on desktop
            if (!button.textContent.trim() && icon) {
                const span = document.createElement('span');
                span.textContent = button.title.replace('Generate random locations in selected areas', 'Generate Adventures')
                    .replace('Generate a random location in current view', 'Surprise Me')
                    .replace('Remove all selected areas', 'Clear Areas')
                    .replace('Remove all adventure markers', 'Clear Markers')
                    .replace('Center map on your location', 'My Location')
                    .replace('About this app', 'About');
                button.appendChild(span);
            }
        }
    });
}

// Update button text on resize
window.addEventListener('resize', updateButtonText);

// Initial button text update
updateButtonText();