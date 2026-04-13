"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { NUFE_XIANLIN_CENTER, NUFE_XIANLIN_DEFAULT_ZOOM } from "@/lib/map-config";
import { Spot } from "@/lib/types";

type MapViewProps = {
  spots: Spot[];
};

export function MapView({ spots }: MapViewProps) {
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
    <div className="h-[520px] overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-soft">
      <MapContainer center={NUFE_XIANLIN_CENTER} zoom={NUFE_XIANLIN_DEFAULT_ZOOM} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={markerIcon}>
            <Popup>
              <div className="space-y-2 p-1">
                <p className="text-base font-semibold">{spot.name}</p>
                <p className="text-sm text-slate-600">{spot.campusArea}</p>
                <p className="text-sm leading-5 text-slate-700">{spot.description}</p>
                <Link href={`/spots/${spot.slug}`} className="inline-flex text-sm font-semibold text-moss">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
