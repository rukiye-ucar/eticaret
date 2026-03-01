import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './RouteMap.css';

const OSRM_ROUTER = 'https://router.project-osrm.org/route/v1';

const RouteMap = ({ optimizedRoute, driverLat, driverLng }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!optimizedRoute || optimizedRoute.length === 0) return;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        import('leaflet').then(async (L) => {
            const Leaflet = L.default || L;

            // Fix default icons
            delete Leaflet.Icon.Default.prototype._getIconUrl;
            Leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = Leaflet.map(mapRef.current, {
                center: [driverLat, driverLng],
                zoom: 12,
                zoomControl: true,
            });

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;

            // 1. Driver start marker (special icon)
            const driverIcon = Leaflet.divIcon({
                html: `<div class="route-marker driver-marker">🚚</div>`,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
            });
            Leaflet.marker([driverLat, driverLng], { icon: driverIcon })
                .addTo(map)
                .bindPopup('<b>🚚 Başlangıç Noktanız</b>');

            // 2. Delivery markers with sequence numbers
            optimizedRoute.forEach((stop) => {
                const stopIcon = Leaflet.divIcon({
                    html: `<div class="route-marker stop-marker">${stop.sequence}</div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });
                Leaflet.marker([stop.lat, stop.lng], { icon: stopIcon })
                    .addTo(map)
                    .bindPopup(`
                        <div class="route-popup">
                            <div class="route-popup-seq">#${stop.sequence}. Teslimat</div>
                            <div class="route-popup-customer">👤 ${stop.customerName}</div>
                            <div class="route-popup-product">📦 ${stop.productName}</div>
                            <div class="route-popup-address">📍 ${stop.address}</div>
                        </div>
                    `);
            });

            // 3. Draw route using OSRM
            try {
                const waypoints = [
                    `${driverLng},${driverLat}`,
                    ...optimizedRoute.map(s => `${s.lng},${s.lat}`)
                ].join(';');

                const res = await fetch(
                    `${OSRM_ROUTER}/driving/${waypoints}?overview=full&geometries=geojson`
                );
                const data = await res.json();

                if (data.routes && data.routes[0]) {
                    const geojson = data.routes[0].geometry;
                    const polyline = Leaflet.geoJSON(geojson, {
                        style: {
                            color: '#4a9eff',
                            weight: 5,
                            opacity: 0.85,
                            dashArray: null,
                        }
                    }).addTo(map);

                    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
                }
            } catch {
                // Fallback: straight lines between points
                const coords = [
                    [driverLat, driverLng],
                    ...optimizedRoute.map(s => [s.lat, s.lng])
                ];
                const fallbackLine = Leaflet.polyline(coords, {
                    color: '#4a9eff',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '8, 6',
                }).addTo(map);
                map.fitBounds(fallbackLine.getBounds(), { padding: [40, 40] });
            }
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [optimizedRoute, driverLat, driverLng]);

    if (!optimizedRoute || optimizedRoute.length === 0) {
        return (
            <div className="routemap-empty">
                <div className="routemap-empty-icon">🗺️</div>
                <p>Haritada gösterilecek teslimat noktası yok.</p>
                <p className="routemap-empty-hint">Teslimat adresi olan siparişler burada görünecek.</p>
            </div>
        );
    }

    return (
        <div className="routemap-wrapper">
            <div ref={mapRef} className="routemap-canvas" />
        </div>
    );
};

export default RouteMap;
