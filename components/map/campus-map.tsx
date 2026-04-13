"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MarkerPopupCard } from "@/components/map/marker-popup-card";
import { NUFE_XIANLIN_CENTER, NUFE_XIANLIN_DEFAULT_ZOOM } from "@/lib/map-config";
import { Spot } from "@/lib/types";

export function CampusMap({ spots }: { spots: Spot[] }) {
  const campusMarker = useMemo(
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
    <div className="h-[420px] overflow-hidden rounded-[30px] border border-ink/10 bg-white shadow-soft sm:h-[560px]">
      <MapContainer center={NUFE_XIANLIN_CENTER} zoom={NUFE_XIANLIN_DEFAULT_ZOOM} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={campusMarker}>
            <Popup minWidth={240}>
              <MarkerPopupCard spot={spot} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
