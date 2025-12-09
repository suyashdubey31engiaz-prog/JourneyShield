import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// --- FIX for broken marker icon ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;
// --- End of FIX ---

const SimpleMap = ({ location, places }) => {
  return (
    <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      {places.map(place => (
        <Marker key={place.fsq_id} position={[place.geocodes.main.latitude, place.geocodes.main.longitude]}>
          <Tooltip permanent direction="top" className="permanent-tooltip">
            {place.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default SimpleMap;