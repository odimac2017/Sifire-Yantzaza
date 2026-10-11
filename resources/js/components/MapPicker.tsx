import { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
}

function RecenterMap({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();

    useEffect(() => {
        if (lat !== null && lng !== null) {
            map.flyTo([lat, lng], 16, {
                animate: true,
            });
        }
    }, [lat, lng, map]);

    return null;
}

function LocationMarker({ onChange }: { onChange: Props['onChange'] }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
    return (
        <MapContainer
            center={[-1.8312, -78.1834]} // Centro Ecuador (NO Quito)
            zoom={7}
            className="h-[350px] w-full rounded-lg"
        >
            <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap lat={lat} lng={lng} />
            <LocationMarker onChange={onChange} />

            {lat !== null && lng !== null && (
                <Marker position={[lat, lng]} />
            )}
        </MapContainer>
    );
}
