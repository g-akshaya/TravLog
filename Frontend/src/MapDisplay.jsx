import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Fix for default Leaflet marker icon issue
import L from 'leaflet';
// Note: These imports resolve the marker icon issue in environments like Vite/Webpack.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Configure Leaflet marker icons globally
try {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
} catch (e) {
  // Catching error if L is not yet defined
}


/**
 * Displays a Leaflet map centered on the provided GeoJSON location point.
 * @param {object} location - The GeoJSON location object: { type: 'Point', coordinates: [lng, lat], name: '...' }
 */
export default function MapDisplay({ location }) {
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    return <p className="text-muted text-center mt-3">Location data unavailable for this entry.</p>;
  }

  // NOTE: Leaflet/React-Leaflet uses [latitude, longitude]. 
  // GeoJSON/MongoDB format is [longitude, latitude].
  const position = [location.coordinates[1], location.coordinates[0]]; 

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false} // Disable dragging for display only
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} title={location.name || 'Entry Location'} />
      </MapContainer>
    </div>
  );
}