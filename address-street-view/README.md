# Address Street View Finder

A simple web application that allows users to enter an address, view it on Google Street View, and download the front view of the building as a JPEG image.

## Features

- Address geocoding with Google Maps API
- Google Street View integration
- Automatic orientation to face the building front
- Downloading Street View images as JPEG files

## Setup

1. Get a Google Maps API Key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to APIs & Services > Credentials
   - Create an API Key
   - Enable the following APIs:
     - Maps JavaScript API
     - Street View Static API
     - Geocoding API

2. Update the API Key:
   - Open `index.html`
   - Replace `YOUR_API_KEY` in the Google Maps script tag with your actual API key

3. Run the application:
   - Simply open `index.html` in a web browser
   - Or serve the files using a local web server

## TypeScript Support

This project includes TypeScript support. To use TypeScript:

1. Install dependencies:
   ```
   npm install
   ```

2. Compile TypeScript to JavaScript:
   ```
   npm run build
   ```

3. For development with auto-recompilation:
   ```
   npm run watch
   ```

4. Update the script tag in `index.html` to point to the compiled JavaScript:
   ```html
   <script src="js/dist/app.js"></script>
   ```

## Usage

1. Enter an address in the search box
2. Click "Search" or press Enter
3. Adjust the Street View if needed using mouse controls:
   - Drag to look around
   - Use mouse wheel to zoom
   - Double-click to move to a new position
4. Click "Download Street View Image" to save the current view as a JPEG

## Technical Details

This application uses:
- Google Maps JavaScript API for the map and Street View panorama
- Google Geocoding API to convert addresses to coordinates
- Google Street View Static API to generate downloadable images
- HTML5 download attribute for saving images locally

## Notes

- The download functionality uses the Street View Static API, which may have usage limitations based on your Google API plan.
- For best results, enter complete addresses including city, state, and country. 