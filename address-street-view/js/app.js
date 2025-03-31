// Variables to store map and panorama objects
let map;
let panorama;
let geocoder;
let autocomplete;
let currentLocation = { lat: 42.345573, lng: -71.098326 }; // Default location (Boston)
let isAutoDownload = false; // Default to manual download
let filePrefix = ""; // File organization prefix
let currentAddress = ""; // Store the current address

// Initialize the map and street view
function initialize() {
    console.log("Initializing app...");
    
    try {
        // Check if Google Maps API loaded properly
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            throw new Error("Google Maps API did not load correctly");
        }
        
        // Initialize the geocoder
        geocoder = new google.maps.Geocoder();
        
        // Initialize the map
        map = new google.maps.Map(
            document.getElementById("map"),
            {
                center: currentLocation,
                zoom: 14,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                },
                fullscreenControl: true,
                streetViewControl: false
            }
        );
        
        // Initialize the street view panorama
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById("pano"),
            {
                position: currentLocation,
                pov: {
                    heading: 34,
                    pitch: 10,
                },
                addressControl: true,
                fullscreenControl: true,
                motionTracking: false
            }
        );
        
        // Connect the map and street view
        map.setStreetView(panorama);
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup address autocomplete
        setupAutocomplete();
        
        console.log("Initialization complete.");
        
        // Automatically search for the specified address
        const addressInput = document.getElementById('address-input');
        if (addressInput) {
            addressInput.value = "16 Houston Rd, Kensington NSW 2033";
            // Delay search to ensure map is fully loaded
            setTimeout(() => {
                searchAddress();
            }, 1000);
        }
    } catch (error) {
        console.error("Error initializing Google Maps:", error);
        document.getElementById('error-message').textContent = 
            "Error loading Google Maps. Please check your internet connection and try again.";
    }
}

// Setup event listeners for the UI elements
function setupEventListeners() {
    // Search button click event
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchAddress);
    }
    
    // Enter key press in address input
    const addressInput = document.getElementById('address-input');
    if (addressInput) {
        addressInput.addEventListener('keypress', function(e) {
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
    
    // Auto download toggle
    const autoDownloadToggle = document.getElementById('auto-download');
    if (autoDownloadToggle) {
        // Set initial state
        autoDownloadToggle.checked = isAutoDownload;
        
        autoDownloadToggle.addEventListener('change', function() {
            isAutoDownload = this.checked;
            console.log(`Auto download mode: ${isAutoDownload ? 'Automatic' : 'Manual'}`);
            
            // Show notification based on toggle state
            if (isAutoDownload) {
                showNotification('Automatic download enabled. Images will be saved automatically after address search.');
            } else {
                showNotification('Manual download mode. Click the download button to save images.');
            }
        });
    }
    
    // File prefix input event
    const filePrefixInput = document.getElementById('file-prefix');
    if (filePrefixInput) {
        filePrefixInput.addEventListener('input', function() {
            filePrefix = this.value.trim();
            console.log(`File prefix updated: "${filePrefix}"`);
        });
        
        // Load saved prefix if available
        const savedPrefix = localStorage.getItem('streetViewFilePrefix');
        if (savedPrefix) {
            filePrefixInput.value = savedPrefix;
            filePrefix = savedPrefix;
        }
    }
    
    // Clear prefix button
    const clearPrefixBtn = document.getElementById('clear-prefix');
    if (clearPrefixBtn) {
        clearPrefixBtn.addEventListener('click', function() {
            const filePrefixInput = document.getElementById('file-prefix');
            if (filePrefixInput) {
                filePrefixInput.value = '';
                filePrefix = '';
                localStorage.removeItem('streetViewFilePrefix');
                showNotification('File organization prefix cleared.');
            }
        });
    }
    
    // Listen for panorama position changes
    panorama.addListener('position_changed', function() {
        // Enable download button when Street View is available
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
    });
}

// Show notification message
function showNotification(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        // Save original color
        const originalColor = errorElement.style.color;
        
        // Change to info color
        errorElement.style.color = 'var(--info-color)';
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        
        // Clear after 5 seconds
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.style.color = originalColor;
        }, 5000);
    }
}

// Setup Google Places Autocomplete
function setupAutocomplete() {
    try {
        const addressInput = document.getElementById('address-input');
        if (addressInput && google.maps.places) {
            const options = {
                types: ['address']
            };
            
            autocomplete = new google.maps.places.Autocomplete(addressInput, options);
            
            // When a place is selected, search for it
            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();
                if (place && place.geometry) {
                    // Get the selected place's location
                    const location = place.geometry.location;
                    currentLocation = { lat: location.lat(), lng: location.lng() };
                    
                    // Update map center
                    map.setCenter(currentLocation);
                    
                    // Find the street view for this location
                    const streetViewService = new google.maps.StreetViewService();
                    streetViewService.getPanorama(
                        { location: currentLocation, radius: 50 },
                        processSVData
                    );
                }
            });
        } else {
            console.warn("Google Places API not available, autocomplete disabled");
        }
    } catch (error) {
        console.error("Error setting up autocomplete:", error);
    }
}

// Show loading overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

// Hide loading overlay
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Format file prefix for use in filename
function formatFilePrefix() {
    if (!filePrefix) return '';
    
    // Save the prefix for future use
    localStorage.setItem('streetViewFilePrefix', filePrefix);
    
    // Replace slashes and spaces with underscores
    const formattedPrefix = filePrefix
        .replace(/\//g, '_')
        .replace(/\\/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .trim();
    
    // Ensure there's an underscore at the end if there's a prefix
    return formattedPrefix ? `${formattedPrefix}_` : '';
}

// Generate a filename for the downloaded image
function generateFilename() {
    const prefix = formatFilePrefix();
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
    
    // Format the address for the filename by removing special characters and spaces
    const formattedAddress = currentAddress
        .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .toLowerCase();
    
    // Include address in filename if available
    const addressPart = formattedAddress ? `_${formattedAddress}` : '';
    
    return `${prefix}streetview${addressPart}_${timestamp}.jpg`;
}

// Search for an address and update the map and street view
function searchAddress() {
    console.log("searchAddress function called");
    try {
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            throw new Error("Google Maps API did not load correctly");
        }
        
        const address = document.getElementById('address-input').value;
        currentAddress = address; // Store the current address
        console.log("Address input value:", address);
        
        if (!address) {
            showError('Please enter an address');
            return;
        }
        
        // Show loading overlay
        showLoading();
        
        console.log("Geocoding address:", address);
        
        // Clear any previous error messages
        clearError();
        
        // Use geocoder to convert address to coordinates
        geocoder.geocode({ 'address': address }, function(results, status) {
            console.log("Geocoder response - Status:", status);
            
            // Hide loading overlay
            hideLoading();
            
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    // Get the coordinates of the address
                    const location = results[0].geometry.location;
                    currentLocation = { lat: location.lat(), lng: location.lng() };
                    console.log("New location:", currentLocation);
                    
                    // Update map center
                    map.setCenter(currentLocation);
                    
                    // Add a marker at the location
                    new google.maps.Marker({
                        position: currentLocation,
                        map: map,
                        animation: google.maps.Animation.DROP
                    });
                    
                    // Find the street view for this location
                    const streetViewService = new google.maps.StreetViewService();
                    console.log("Getting Street View data...");
                    
                    // Show loading again for Street View
                    showLoading();
                    
                    streetViewService.getPanorama(
                        { location: currentLocation, radius: 50 },
                        function(data, status) {
                            // Hide loading overlay
                            hideLoading();
                            
                            console.log("Street View data response - Status:", status);
                            
                            if (status === google.maps.StreetViewStatus.OK) {
                                // Position the panorama to the nearest Street View location
                                const location = data.location.latLng;
                                panorama.setPosition(location);
                                
                                // Try to find the heading that points to the building
                                const computeHeading = google.maps.geometry.spherical.computeHeading;
                                const heading = computeHeading(
                                    location, 
                                    new google.maps.LatLng(currentLocation.lat, currentLocation.lng)
                                );
                                console.log("Computed heading:", heading);
                                
                                // Update the POV to face the building
                                panorama.setPov({
                                    heading: heading,
                                    pitch: 0
                                });
                                
                                // Enable the download button
                                document.getElementById('download-btn').disabled = false;
                                
                                // If auto download is enabled, automatically download the image
                                if (isAutoDownload) {
                                    // Slight delay to ensure the panorama is fully loaded
                                    setTimeout(downloadStreetViewImage, 1000);
                                } else {
                                    // Show notification to click download button
                                    showNotification('Street View found! Click the download button to save the image.');
                                }
                            } else {
                                showError('Street View data not found for this location. Please try a different address.');
                                document.getElementById('download-btn').disabled = true;
                            }
                        }
                    );
                } else {
                    showError('No results found for that address');
                }
            } else {
                showError('Geocode was not successful: ' + status);
            }
        });
    } catch (error) {
        console.error("Error during search:", error);
        hideLoading();
        showError("Error searching for address. Please try another search term.");
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.color = 'var(--error-color)';
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
    } else {
        alert(message);
    }
}

// Clear error message
function clearError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Process Street View data
function processSVData(data, status) {
    // Hide loading overlay
    hideLoading();
    
    if (status === google.maps.StreetViewStatus.OK) {
        // Position the panorama to the nearest Street View location
        const location = data.location.latLng;
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
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
        
        // If auto download is enabled, automatically download the image
        if (isAutoDownload) {
            // Slight delay to ensure the panorama is fully loaded
            setTimeout(downloadStreetViewImage, 1000);
        } else {
            // Show notification to click download button
            showNotification('Street View found! Click the download button to save the image.');
        }
    } else {
        showError('Street View data not found for this location');
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.disabled = true;
        }
    }
}

// Download the current Street View as a JPEG image
function downloadStreetViewImage() {
    console.log("Download button clicked");
    try {
        // Show loading overlay
        showLoading();
        
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
            const apiKey = 'AIzaSyAT9WDCZ3WobE2lYq1JmpH8fWbopQgNUcU'; // Use the same API key
            const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${apiKey}`;
            console.log("Street View image URL:", imageUrl);
            
            // Use fetch instead of Image to avoid opening in a new tab
            fetch(imageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch Street View image');
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Hide loading overlay
                    hideLoading();
                    
                    // Create a blob URL and trigger a download
                    const blobUrl = URL.createObjectURL(blob);
                    const filename = generateFilename();
                    
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    
                    // Clean up
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(link);
                    }, 100);
                    
                    // Show success notification
                    showNotification(`Street View image successfully downloaded as "${filename}"`);
                })
                .catch(error => {
                    console.error("Error fetching image:", error);
                    hideLoading();
                    showError('Failed to load Street View image. Please try a different location.');
                });
        } else {
            hideLoading();
            showError('No Street View position available');
        }
    } catch (error) {
        console.error("Error downloading image:", error);
        hideLoading();
        showError("Error downloading image. Please try again.");
    }
}

// Make functions available globally
window.initialize = initialize;
window.searchAddress = searchAddress;
window.downloadStreetViewImage = downloadStreetViewImage; 