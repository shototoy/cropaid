import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { noralaBarangays, noralaBoundary } from '../data/noralaBarangays';

const Map = ({ reports = [], onReportClick }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [6.5200, 124.6610],
            zoom: 13,
            minZoom: 12,
            maxZoom: 18,
            zoomControl: true,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        L.polygon(noralaBoundary, {
            color: '#10b981',
            weight: 3,
            fillOpacity: 0,
            dashArray: '10, 5'
        }).addTo(map).bindTooltip('Norala Municipal Boundary', {
            permanent: false,
            direction: 'center'
        });

        noralaBarangays.forEach(barangay => {
            const polygon = L.polygon(barangay.coordinates, {
                color: barangay.color,
                weight: 2,
                fillColor: barangay.color,
                fillOpacity: 0.1,
                className: 'barangay-polygon'
            }).addTo(map);

            polygon.bindTooltip(`<strong>${barangay.name}</strong>`, {
                permanent: false,
                direction: 'center',
                className: 'barangay-tooltip'
            });

            polygon.on('mouseover', function () {
                this.setStyle({ fillOpacity: 0.3 });
            });

            polygon.on('mouseout', function () {
                this.setStyle({ fillOpacity: 0.1 });
            });
        });

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
            const marker = L.marker([report.latitude, report.longitude], {
                icon: getIcon(report.type)
            }).addTo(map);

            const statusColor = getStatusColor(report.status);
            const details = typeof report.details === 'string'
                ? JSON.parse(report.details)
                : report.details || {};

            const popupContent = `
        <div class="map-popup">
          <div class="popup-header" style="border-left: 4px solid ${statusColor}">
            <h3>${report.type.toUpperCase()}</h3>
            <span class="status-badge" style="background: ${statusColor}">${report.status}</span>
          </div>
          <div class="popup-body">
            <p><strong>Farmer:</strong> ${report.farmer_name || 'Unknown'}</p>
            <p><strong>RSBSA:</strong> ${report.rsbsa_id || 'N/A'}</p>
            <p><strong>Location:</strong> ${report.location || 'Norala'}</p>
            ${details.crop ? `<p><strong>Crop:</strong> ${details.crop}</p>` : ''}
            ${details.severity ? `<p><strong>Severity:</strong> ${details.severity}</p>` : ''}
            ${details.description ? `<p><strong>Details:</strong> ${details.description}</p>` : ''}
            <p class="popup-date">${new Date(report.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}</p>
            <button class="view-details-btn" data-report-id="${report.id}">
              View Full Report →
            </button>
          </div>
        </div>
      `;

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            marker.on('click', () => {
                map.setView([report.latitude, report.longitude], 16, {
                    animate: true,
                    duration: 0.5
                });
            });

            marker.on('popupopen', (e) => {
                const btn = e.popup.getElement().querySelector('.view-details-btn');
                if (btn && onReportClick) {
                    btn.onclick = () => onReportClick(report.id);
                }
            });

            L.circle([report.latitude, report.longitude], {
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.2,
                radius: 150,
            }).addTo(map);
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [reports, onReportClick]);

    return (
        <div className="map-container">
            <div ref={mapRef} className="map"></div>
            <div className="map-legend">
                <h4>Legend</h4>
                <div className="legend-section">
                    <div className="legend-subtitle">Report Types</div>
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
                </div>
                <div className="legend-divider"></div>
                <div className="legend-section">
                    <div className="legend-subtitle">Status</div>
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
                <div className="legend-divider"></div>
                <div className="legend-note">
                    Click markers to zoom in
                </div>
            </div>
        </div>
    );
};

export default Map;
