import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/Button';
import { SubstationData } from '../types';

// Fix default marker icon for Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SubstationMapsProps {
  substation: SubstationData;
  onUpdateCoordinates: (latitude: number, longitude: number) => void;
  isReadOnly?: boolean;
}

export const SubstationMaps: React.FC<SubstationMapsProps> = ({
  substation,
  onUpdateCoordinates,
  isReadOnly = false
}) => {
  // Default ke Jakarta jika belum ada koordinat
  const [position, setPosition] = useState<[number, number]>([
    substation.latitude ?? -6.2,
    substation.longitude ?? 106.8
  ]);
  const [inputLat, setInputLat] = useState<string>(String(substation.latitude ?? ''));
  const [inputLng, setInputLng] = useState<string>(String(substation.longitude ?? ''));

  useEffect(() => {
    setPosition([
      substation.latitude ?? -6.2,
      substation.longitude ?? 106.8
    ]);
    setInputLat(substation.latitude !== undefined ? String(substation.latitude) : '');
    setInputLng(substation.longitude !== undefined ? String(substation.longitude) : '');
  }, [substation.latitude, substation.longitude]);

  // Handler drag marker
  const handleMarkerDrag = (e: any) => {
    const latlng = e.target.getLatLng();
    setPosition([latlng.lat, latlng.lng]);
    setInputLat(String(latlng.lat));
    setInputLng(String(latlng.lng));
    if (!isReadOnly) {
      onUpdateCoordinates(latlng.lat, latlng.lng);
    }
  };

  // Handler input manual
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition([lat, lng]);
      if (!isReadOnly) {
        onUpdateCoordinates(lat, lng);
      }
    }
  };

  // Handler get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung browser ini');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setInputLat(String(latitude));
        setInputLng(String(longitude));
        if (!isReadOnly) {
          onUpdateCoordinates(latitude, longitude);
        }
      },
      () => alert('Gagal mendapatkan lokasi')
    );
  };

  return (
    <div>
      <div className="mb-2 flex flex-col md:flex-row md:items-center md:space-x-2">
        <form onSubmit={handleInputSubmit} className="flex space-x-2 mb-2 md:mb-0">
          <input
            type="number"
            step="any"
            value={inputLat}
            onChange={e => setInputLat(e.target.value)}
            placeholder="Latitude"
            className="border rounded px-2 py-1 w-32"
            disabled={isReadOnly}
          />
          <input
            type="number"
            step="any"
            value={inputLng}
            onChange={e => setInputLng(e.target.value)}
            placeholder="Longitude"
            className="border rounded px-2 py-1 w-32"
            disabled={isReadOnly}
          />
          <Button type="submit" variant="outline" size="sm" disabled={isReadOnly}>
            Simpan Koordinat
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isReadOnly}
          onClick={handleGetLocation}
        >
          Gunakan Lokasi Saya
        </Button>
      </div>
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: 300, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={!isReadOnly}
          eventHandlers={{ dragend: handleMarkerDrag }}
        >
          <Popup>
            Koordinat: {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}; 