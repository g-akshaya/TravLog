import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Imports for the default marker image path fix (required by React Leaflet)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issue
try {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
} catch (e) {}

// 🗺️ CUSTOM MAP ICON DEFINITION (Smaller emoji pin)
const customIcon = new L.DivIcon({
  className: 'custom-map-icon',
  html: '<div style="font-size: 18px;">📍</div>', 
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -20]
});


// Helper component to center and zoom the map based on coordinate props
function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  
  // 🎯 FIX: Add animation options to the setView call
  useEffect(() => {
    if (coords && coords.length === 2) {
        map.setView(coords, zoom, { 
            animate: true, // Enable animation
            duration: 0.8  // Set duration to 0.8 seconds for a smooth transition
        }); 
    }
  }, [coords, zoom, map]);
  return null;
}

// Component to handle map clicks and capture coordinates
function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(null);

  // Sync internal position state with external prop (for programmatic changes from search)
  useEffect(() => {
      if (initialPosition) {
          // Leaflet uses [lat, lng]. GeoJSON stores [lng, lat].
          setPosition([initialPosition.coordinates[1], initialPosition.coordinates[0]]);
      }
  }, [initialPosition]);


  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPos = [lat, lng];
      setPosition(newPos);
      
      // Update form data
      onLocationSelect({
        type: 'Point',
        coordinates: [lng, lat], 
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

// Main component exported for use in home.jsx
export default function MapInput({ onLocationSelect, locationData }) {
  const defaultCenter = [0, 0]; 
  const defaultZoom = 2;

  // Set the map center/marker based on prop or default
  const mapPosition = useMemo(() => 
      (locationData && locationData.coordinates)
      ? [locationData.coordinates[1], locationData.coordinates[0]] // [lat, lng]
      : defaultCenter, 
      [locationData]
  );
  
  const mapZoom = locationData ? 10 : defaultZoom;


  return (
    <div style={{ height: '300px', width: '100%', margin: '15px 0' }}>
      <MapContainer 
        center={mapPosition} 
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeMapView coords={mapPosition} zoom={mapZoom} />
        
        <LocationMarker 
            onLocationSelect={onLocationSelect} 
            initialPosition={locationData}
        />
      </MapContainer>
    </div>
  );
}