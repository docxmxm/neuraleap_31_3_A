// Google Maps types
// To use this properly, you should install @types/google.maps:
// npm install --save-dev @types/google.maps

// Create module scope
export {};

// Declare global variables
declare global {
    interface Window {
        initialize: () => void;
    }
}

// Variables to store map and panorama objects
let map: google.maps.Map;
let panorama: google.maps.StreetViewPanorama;
let geocoder: google.maps.Geocoder;
let currentLocation: { lat: number; lng: number } = { lat: 42.345573, lng: -71.098326 }; // Default location (Boston)

// Initialize the map and street view
function initialize(): void {
    // Initialize the geocoder
    geocoder = new google.maps.Geocoder();
    
    // Initialize the map
    map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
            center: currentLocation,
            zoom: 14,
        }
    );
    
    // Initialize the street view panorama
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano") as HTMLElement,
        {
            position: currentLocation,
            pov: {
                heading: 34,
                pitch: 10,
            },
        }
    );
    
    // Connect the map and street view
    map.setStreetView(panorama);
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners for the UI elements
function setupEventListeners(): void {
    // Search button click event
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchAddress);
    }
    
    // Enter key press in address input
    const addressInput = document.getElementById('address-input') as HTMLInputElement;
    if (addressInput) {
        addressInput.addEventListener('keypress', function(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                searchAddress();
            }
        });
    }
    
    // Download button click event
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadStreetViewImage);
    }
    
    // Listen for panorama position changes
    panorama.addListener('position_changed', function() {
        // Enable download button when Street View is available
        const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
    });
}

// Search for an address and update the map and street view
function searchAddress(): void {
    const addressInput = document.getElementById('address-input') as HTMLInputElement;
    const address = addressInput ? addressInput.value : '';
    
    if (!address) {
        alert('Please enter an address');
        return;
    }
    
    // Use geocoder to convert address to coordinates
    geocoder.geocode({ 'address': address }, function(
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
    ) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results && results[0]) {
                // Get the coordinates of the address
                const location = results[0].geometry.location;
                currentLocation = { lat: location.lat(), lng: location.lng() };
                
                // Update map center
                map.setCenter(currentLocation);
                
                // Find the street view for this location
                const streetViewService = new google.maps.StreetViewService();
                streetViewService.getPanorama(
                    { location: currentLocation, radius: 50 },
                    processSVData
                );
            } else {
                alert('No results found for that address');
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Process Street View data
function processSVData(
    data: google.maps.StreetViewPanoramaData | null,
    status: google.maps.StreetViewStatus
): void {
    if (status === google.maps.StreetViewStatus.OK && data) {
        // Position the panorama to the nearest Street View location
        const location = data.location!.latLng;
        panorama.setPosition(location);
        
        // Try to find the heading that points to the building
        const computeHeading = google.maps.geometry.spherical.computeHeading;
        const heading = computeHeading(
            location,
            new google.maps.LatLng(currentLocation.lat, currentLocation.lng)
        );
        
        // Update the POV to face the building
        panorama.setPov({
            heading: heading,
            pitch: 0
        });
        
        // Enable the download button
        const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
    } else {
        alert('Street View data not found for this location');
        const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
        if (downloadBtn) {
            downloadBtn.disabled = true;
        }
    }
}

// Download the current Street View as a JPEG image
function downloadStreetViewImage(): void {
    // Get the Street View URL with current parameters
    const width = 640;  // Image width
    const height = 480; // Image height
    
    // Build the Street View Static API URL
    const position = panorama.getPosition();
    const pov = panorama.getPov();
    
    if (position && pov) {
        const lat = position.lat();
        const lng = position.lng();
        const heading = pov.heading;
        const pitch = pov.pitch;
        
        // Create the URL for the Street View Static API
        const apiKey = getApiKey();
        const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${apiKey}`;
        
        // Create a hidden link and trigger a download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'street-view.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Extract the API key from the script URL
function getApiKey(): string {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src.includes('maps.googleapis.com/maps/api/js?key=')) {
            // Extract the key parameter
            const match = src.match(/key=([^&]*)/);
            if (match && match[1]) {
                return match[1];
            }
        }
    }
    return 'YOUR_API_KEY'; // Fallback
}

// Make initialize function available globally
window.initialize = initialize; 