import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🗺️ CUSTOM MAP ICON DEFINITION
const customIcon = new L.DivIcon({
  className: 'custom-map-icon',
  html: '<div style="font-size: 18px;">📍</div>', // Smaller emoji icon
  iconSize: [25, 25],
  iconAnchor: [12, 25], // Center the icon point
  popupAnchor: [0, -20]
});


// Component to handle map clicks and capture coordinates
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      // Pass the GeoJSON structure to the parent component
      onLocationSelect({
        type: 'Point',
        coordinates: [lng, lat], 
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} /> // Use custom icon
  );
}

export default function MapInput({ onLocationSelect }) {
  const defaultCenter = [0, 0]; 
  const defaultZoom = 2;

  return (
    <div style={{ height: '300px', width: '100%', margin: '15px 0' }}>
      {/* Font size reduction is handled in home.jsx */}
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
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