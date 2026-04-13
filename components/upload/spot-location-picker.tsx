"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { NUFE_XIANLIN_CENTER, NUFE_XIANLIN_DEFAULT_ZOOM } from "@/lib/map-config";

type LocationPoint = {
  latitude: number;
  longitude: number;
};

function ClickMarker({
  value,
  markerIcon,
  onChange
}: {
  value: LocationPoint | null;
  markerIcon: L.Icon;
  onChange: (value: LocationPoint) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6))
      });
    }
  });

  if (!value) {
    return null;
  }

  return <Marker position={[value.latitude, value.longitude]} icon={markerIcon} />;
}

export function SpotLocationPicker({
  value,
  onChange
}: {
  value: LocationPoint | null;
  onChange: (value: LocationPoint) => void;
}) {
  const markerIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      }),
    []
  );

  return (
    <div className="h-[280px] overflow-hidden rounded-[24px] border border-ink/10 bg-white shadow-sm">
      <MapContainer center={NUFE_XIANLIN_CENTER} zoom={NUFE_XIANLIN_DEFAULT_ZOOM} scrollWheelZoom className="z-0 h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickMarker value={value} markerIcon={markerIcon} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
