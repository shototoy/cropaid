import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

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

        const loadNoralaHighlight = async () => {
            const overpassQuery = `
                [out:json][timeout:10];
                relation["name"="Norala"]["admin_level"="6"]["boundary"="administrative"];
                out geom;
            `;

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    body: overpassQuery,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data.elements && data.elements.length > 0) {
                        const relation = data.elements[0];
                        const outerWays = relation.members?.filter(m => m.type === 'way' && m.role === 'outer') || [];

                        if (outerWays.length > 0) {
                            const allCoords = [];
                            const ways = outerWays.map(w => w.geometry?.map(n => [n.lat, n.lon]) || []).filter(w => w.length > 0);

                            if (ways.length > 0) {
                                let currentWay = ways[0];
                                allCoords.push(...currentWay);
                                const remaining = ways.slice(1);

                                while (remaining.length > 0) {
                                    const lastPoint = allCoords[allCoords.length - 1];
                                    const nextIndex = remaining.findIndex(way =>
                                        (Math.abs(way[0][0] - lastPoint[0]) < 0.0001 && Math.abs(way[0][1] - lastPoint[1]) < 0.0001) ||
                                        (Math.abs(way[way.length - 1][0] - lastPoint[0]) < 0.0001 && Math.abs(way[way.length - 1][1] - lastPoint[1]) < 0.0001)
                                    );

                                    if (nextIndex === -1) break;

                                    const nextWay = remaining.splice(nextIndex, 1)[0];
                                    if (Math.abs(nextWay[nextWay.length - 1][0] - lastPoint[0]) < 0.0001 &&
                                        Math.abs(nextWay[nextWay.length - 1][1] - lastPoint[1]) < 0.0001) {
                                        nextWay.reverse();
                                    }
                                    allCoords.push(...nextWay.slice(1));
                                }

                                if (allCoords.length > 0) {
                                    if (Math.abs(allCoords[0][0] - allCoords[allCoords.length - 1][0]) > 0.0001 ||
                                        Math.abs(allCoords[0][1] - allCoords[allCoords.length - 1][1]) > 0.0001) {
                                        allCoords.push(allCoords[0]);
                                    }

                                    L.polygon(allCoords, {
                                        color: '#10b981',
                                        weight: 4,
                                        fillColor: '#10b981',
                                        fillOpacity: 0.12,
                                        dashArray: '8, 4',
                                        className: 'norala-boundary-highlight'
                                    }).addTo(map).bindTooltip('<strong>Municipality of Norala</strong>', {
                                        permanent: false,
                                        direction: 'center',
                                        className: 'municipality-tooltip'
                                    });
                                    console.log('✅ Norala outer boundary highlighted (' + allCoords.length + ' points)');
                                    return;
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log('⚠️ Using fallback boundary');
            }

            const fallbackBoundary = [
                [6.5700, 124.6000],
                [6.5700, 124.6900],
                [6.4800, 124.6900],
                [6.4800, 124.6000],
                [6.5700, 124.6000]
            ];

            L.polygon(fallbackBoundary, {
                color: '#10b981',
                weight: 4,
                fillColor: '#10b981',
                fillOpacity: 0.08,
                dashArray: '8, 4',
                className: 'norala-boundary-highlight'
            }).addTo(map).bindTooltip('<strong>Municipality of Norala</strong>', {
                permanent: false,
                direction: 'center',
                className: 'municipality-tooltip'
            });
        };

        loadNoralaHighlight();

        const pestIcon = L.divIcon({
            className: 'custom-marker pest-marker',
            html: '<div class="marker-inner"><div class="marker-pulse"></div>🐛</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        const floodIcon = L.divIcon({
            className: 'custom-marker flood-marker',
            html: '<div class="marker-inner"><div class="marker-pulse"></div>🌊</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        const droughtIcon = L.divIcon({
            className: 'custom-marker drought-marker',
            html: '<div class="marker-inner"><div class="marker-pulse"></div>☀️</div>',
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

        const getTypeColor = (type) => {
            switch (type) {
                case 'pest': return '#ef4444';
                case 'flood': return '#3b82f6';
                case 'drought': return '#f59e0b';
                default: return '#6b7280';
            }
        };

        const getSeverityRadius = (severity) => {
            switch (severity?.toLowerCase()) {
                case 'critical': return 400;
                case 'high': return 300;
                case 'medium': return 200;
                case 'low': return 150;
                default: return 200;
            }
        };

        reports.forEach((report) => {
            const marker = L.marker([report.latitude, report.longitude], {
                icon: getIcon(report.type)
            }).addTo(map);

            const statusColor = getStatusColor(report.status);
            const typeColor = getTypeColor(report.type);
            const details = typeof report.details === 'string'
                ? JSON.parse(report.details)
                : report.details || {};

            const severity = details.severity || 'Medium';
            const radius = getSeverityRadius(severity);

            const heatCircle = L.circle([report.latitude, report.longitude], {
                color: 'transparent',
                fillColor: typeColor,
                fillOpacity: 0.25,
                radius: radius,
                className: 'heat-circle'
            }).addTo(map);

            heatCircle.on('mouseover', function () {
                this.setStyle({ fillOpacity: 0.4 });
            });

            heatCircle.on('mouseout', function () {
                this.setStyle({ fillOpacity: 0.25 });
            });

            L.circle([report.latitude, report.longitude], {
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.15,
                weight: 3,
                radius: radius * 0.4,
                className: 'status-ring'
            }).addTo(map);

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
            ${details.severity ? `<p><strong>Severity:</strong> <span class="severity-badge ${details.severity.toLowerCase()}">${details.severity}</span></p>` : ''}
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
                maxWidth: 320,
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
                <div className="legend-section">
                    <div className="legend-subtitle">Intensity</div>
                    <div className="legend-item">
                        <div className="intensity-indicator large"></div>
                        <span>High/Critical</span>
                    </div>
                    <div className="legend-item">
                        <div className="intensity-indicator medium"></div>
                        <span>Medium</span>
                    </div>
                    <div className="legend-item">
                        <div className="intensity-indicator small"></div>
                        <span>Low</span>
                    </div>
                </div>
                <div className="legend-divider"></div>
                <div className="legend-note">
                    💡 Larger clouds = Higher severity
                </div>
            </div>
        </div>
    );
};

export default Map;
