import React, { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for default Leaflet marker icon issue with Webpack/Vite
import L from 'leaflet';
delete L.Icon.Default.prototype._get  
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Component to handle map clicks and capture coordinates
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      // Pass the GeoJSON structure to the parent component
      onLocationSelect({
        type: 'Point',
        coordinates: [lng, lat], // IMPORTANT: GeoJSON uses [longitude, latitude]
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` // Placeholder name
      });
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Main component exported for use in entries.jsx
export default function MapInput({ onLocationSelect }) {
  // Default map position (e.g., center of the world or a default travel hub)
  const defaultCenter = [0, 0]; 
  const defaultZoom = 2;

  return (
    <div style={{ height: '300px', width: '100%', margin: '15px 0' }}>
      <h4>Click on the map to tag your entry location:</h4>
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}