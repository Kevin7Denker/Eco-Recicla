import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Clock, Phone } from "lucide-react";

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  active: boolean;
}

interface MapViewProps {
  collectionPoints: CollectionPoint[];
  userLocation: [number, number] | null;
  onPointSelect?: (point: CollectionPoint) => void;
}

// Component to recenter map when user location changes
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const MapView = ({ collectionPoints, userLocation, onPointSelect }: MapViewProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  // Custom icon for user location
  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzIyOTNhYiIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0iIzIyOTNhYiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Custom icon for collection points
  const pointIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMyIDE2IDMyQzE2IDMyIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiMyMjkzYWIiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
    >
      <MapController center={mapCenter} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-primary">Você está aqui</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Collection points markers */}
      {collectionPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={pointIcon}
          eventHandlers={{
            click: () => {
              if (onPointSelect) {
                onPointSelect(point);
              }
            },
          }}
        >
          <Popup>
            <div className="space-y-2 min-w-[200px]">
              <h3 className="font-semibold text-primary">{point.name}</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{point.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{point.opening_hours}</span>
              </div>
              <Button
                size="sm"
                className="w-full gradient-eco border-0 mt-2"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`,
                    "_blank"
                  );
                }}
              >
                <Navigation className="w-3 h-3 mr-2" />
                Ver rota
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
