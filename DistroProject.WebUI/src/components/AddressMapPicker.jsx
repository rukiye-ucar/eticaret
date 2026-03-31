import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './AddressMapPicker.css';

// Fix Leaflet default icon path issue with bundlers
const fixLeafletIcon = () => {
    const L = window.L;
    if (!L) return;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
};

const AddressMapPicker = ({ onAddressSelect, initialLat, initialLng, initialAddress }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState(initialAddress || '');
    const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
    const [isLocating, setIsLocating] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const defaultLat = initialLat || 41.0082;
    const defaultLng = initialLng || 28.9784;

    useEffect(() => {
        if (mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            window.L = L.default || L;
            fixLeafletIcon();

            const map = window.L.map(mapRef.current, {
                center: [defaultLat, defaultLng],
                zoom: initialLat ? 15 : 10,
                zoomControl: true,
            });

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            if (initialLat && initialLng) {
                markerRef.current = window.L.marker([initialLat, initialLng]).addTo(map);
            }

            map.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                placeMarker(lat, lng);

                // Reverse geocode
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    const data = await res.json();
                    const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSelectedAddress(addr);
                    setSearchQuery(addr);
                    onAddressSelect?.({ lat, lng, address: addr });
                } catch {
                    const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSelectedAddress(fallback);
                    setSearchQuery(fallback);
                    onAddressSelect?.({ lat, lng, address: fallback });
                }
            });

            mapInstanceRef.current = map;
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            // Clear Leaflet's DOM marker so the container can be reused on remount
            if (mapRef.current) {
                delete mapRef.current._leaflet_id;
            }
        };
    }, []);

    const placeMarker = (lat, lng) => {
        const L = window.L;
        if (!L) return;
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        }
        mapInstanceRef.current.setView([lat, lng], 16);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`
            );
            const data = await res.json();
            setSearchResults(data);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const addr = result.display_name;
        placeMarker(lat, lng);
        setSelectedAddress(addr);
        setSearchQuery(addr);
        setSearchResults([]);
        onAddressSelect?.({ lat, lng, address: addr });
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Tarayıcınız konum özelliğini desteklemiyor.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                placeMarker(lat, lng);
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    const data = await res.json();
                    const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSelectedAddress(addr);
                    setSearchQuery(addr);
                    onAddressSelect?.({ lat, lng, address: addr });
                } catch {
                    const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSelectedAddress(fallback);
                    onAddressSelect?.({ lat, lng, address: fallback });
                }
                setIsLocating(false);
            },
            () => {
                alert('Konum alınamadı. Lütfen izin verdiğinizden emin olun.');
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="amp-container">
            {/* Search Bar */}
            <div className="amp-search-row">
                <input
                    className="amp-search-input"
                    type="text"
                    placeholder="🔍 Adres ara (ör: Kadıköy, İstanbul)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    className="amp-search-btn"
                    onClick={handleSearch}
                    disabled={isSearching}
                >
                    {isSearching ? '...' : 'Ara'}
                </button>
                <button
                    className={`amp-location-btn ${isLocating ? 'locating' : ''}`}
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    title="Konumumu Kullan"
                >
                    {isLocating ? '📡' : '📍'} {isLocating ? 'Alınıyor...' : 'Konumumu Kullan'}
                </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <div className="amp-results">
                    {searchResults.map((r) => (
                        <div
                            key={r.place_id}
                            className="amp-result-item"
                            onClick={() => handleResultClick(r)}
                        >
                            <span className="amp-result-icon">📍</span>
                            <span className="amp-result-text">{r.display_name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Map */}
            <div ref={mapRef} className="amp-map" />

            {/* Selected Address Tag */}
            {selectedAddress && (
                <div className="amp-selected-address">
                    <span className="amp-selected-icon">✅</span>
                    <span className="amp-selected-text">{selectedAddress}</span>
                </div>
            )}

            <p className="amp-hint">💡 Haritaya tıklayarak da konum seçebilirsiniz.</p>
        </div>
    );
};

export default AddressMapPicker;
