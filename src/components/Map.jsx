import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

const Map = ({ reports = [] }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [6.5019, 124.8019],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        const pestIcon = L.divIcon({
            className: 'custom-marker pest-marker',
            html: '<div class="marker-inner">🐛</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        const floodIcon = L.divIcon({
            className: 'custom-marker flood-marker',
            html: '<div class="marker-inner">🌊</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        const droughtIcon = L.divIcon({
            className: 'custom-marker drought-marker',
            html: '<div class="marker-inner">☀️</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        const getIcon = (type) => {
            switch (type) {
                case 'pest': return pestIcon;
                case 'flood': return floodIcon;
                case 'drought': return droughtIcon;
                default: return pestIcon;
            }
        };

        const getStatusColor = (status) => {
            switch (status) {
                case 'pending': return '#f59e0b';
                case 'verified': return '#3b82f6';
                case 'resolved': return '#10b981';
                case 'rejected': return '#ef4444';
                default: return '#6b7280';
            }
        };

        reports.forEach((report) => {
            const lat = report.latitude || 6.5019 + (Math.random() - 0.5) * 0.05;
            const lng = report.longitude || 124.8019 + (Math.random() - 0.5) * 0.05;

            const marker = L.marker([lat, lng], {
                icon: getIcon(report.type)
            }).addTo(map);

            const statusColor = getStatusColor(report.status);
            const details = typeof report.details === 'string'
                ? JSON.parse(report.details)
                : report.details || {};

            marker.bindPopup(`
        <div class="map-popup">
          <div class="popup-header" style="border-left: 4px solid ${statusColor}">
            <h3>${report.type.toUpperCase()}</h3>
            <span class="status-badge" style="background: ${statusColor}">${report.status}</span>
          </div>
          <div class="popup-body">
            <p><strong>Location:</strong> ${report.location || 'Norala'}</p>
            ${details.description ? `<p><strong>Details:</strong> ${details.description}</p>` : ''}
            ${details.severity ? `<p><strong>Severity:</strong> ${details.severity}</p>` : ''}
            <p class="popup-date">${new Date(report.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      `);

            L.circle([lat, lng], {
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.2,
                radius: 200,
            }).addTo(map);
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [reports]);

    return (
        <div className="map-container">
            <div ref={mapRef} className="map"></div>
            <div className="map-legend">
                <h4>Legend</h4>
                <div className="legend-item">
                    <span className="legend-icon">🐛</span>
                    <span>Pest Infestation</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🌊</span>
                    <span>Flood</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">☀️</span>
                    <span>Drought</span>
                </div>
                <div className="legend-divider"></div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#f59e0b' }}></span>
                    <span>Pending</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#3b82f6' }}></span>
                    <span>Verified</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#10b981' }}></span>
                    <span>Resolved</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#ef4444' }}></span>
                    <span>Rejected</span>
                </div>
            </div>
        </div>
    );
};

export default Map;
