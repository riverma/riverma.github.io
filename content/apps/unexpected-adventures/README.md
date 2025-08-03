# Unexpected Adventures

Discover new places to explore by randomly selecting locations within your areas of interest on a world map.

## Overview

Unexpected Adventures is a mobile-first, HTML5-based web application that helps users find random adventure locations within selected areas on an interactive map. Perfect for travelers, explorers, and anyone looking to discover new places!

## Features

- **Interactive World Map**: Powered by Leaflet.js with OpenStreetMap tiles
- **Area Selection**: Draw custom areas on the map where you want to explore
- **Random Location Generation**: Generate adventure markers within your selected areas
- **"Surprise Me" Mode**: Instantly generate a random location in the current map view
- **Points of Interest Discovery**: Click any adventure marker to see nearby tourist attractions
- **Navigation Support**: Get directions to your chosen destination
- **Mobile-First Design**: Works seamlessly on both mobile devices and desktop browsers
- **No Authentication Required**: Runs entirely in your browser

## How to Use

1. **Select Areas**: Use the drawing tools to select one or more areas on the map where you'd like to explore
2. **Generate Adventures**: Click "Generate Adventures" to create random location markers within your selected areas
3. **Or Use "Surprise Me"**: For instant exploration, click "Surprise Me" to generate a random location in the current map view
4. **Discover Attractions**: Click on any adventure marker to see nearby points of interest
5. **Navigate**: Use the "Go Here" button to get directions to your chosen destination

## Technologies Used

- [Leaflet.js](https://leafletjs.com/) - Interactive map library
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles and data
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) - Points of interest data
- [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) - Drawing tools for area selection

## Creator

**Rishi Verma**

## License

This project uses open source technologies and OpenStreetMap data, which is © OpenStreetMap contributors.

## Development

This is a client-side only application with no server requirements. Simply open `index.html` in a web browser to run the app locally.

### File Structure

```
unexpected-adventures/
├── index.html          # Main HTML file
├── style.css          # Mobile-first responsive styles
├── script.js          # Core application logic
└── README.md          # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome for Android

## Future Enhancements

- Save and share adventure locations
- Filter POI types
- Adventure history and favorites
- Offline map caching
- Theme customization