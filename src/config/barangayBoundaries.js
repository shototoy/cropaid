import * as turf from '@turf/turf';
import { noralaBoundaryCoordinates } from './noralaBoundary';

const barangayCenters = {
    'Benigno Aquino, Jr.': { lat: 6.5282, lng: 124.6848, color: '#FF5733' },
    'Dumaguil': { lat: 6.5583, lng: 124.6842, color: '#33FF57' },
    'Esperanza': { lat: 6.4984, lng: 124.6685, color: '#3357FF' },
    'Kibid': { lat: 6.5383, lng: 124.6769, color: '#FF33A1' },
    'Lapuz': { lat: 6.5213, lng: 124.6317, color: '#33FFF5' },
    'Liberty': { lat: 6.5364, lng: 124.6317, color: '#F5FF33' },
    'Lopez Jaena': { lat: 6.5092, lng: 124.6866, color: '#B833FF' },
    'Matapol': { lat: 6.5761, lng: 124.6411, color: '#FF8333' },
    'Poblacion': { lat: 6.5206, lng: 124.6623, color: '#33FF83' },
    'Puti': { lat: 6.5164, lng: 124.7095, color: '#8333FF' },
    'San Jose': { lat: 6.5507, lng: 124.6417, color: '#FF3333' },
    'San Miguel': { lat: 6.4944, lng: 124.7187, color: '#33A1FF' },
    'Simsiman': { lat: 6.5592, lng: 124.6527, color: '#A1FF33' },
    'Tinago': { lat: 6.5523, lng: 124.7054, color: '#FF33F5' }
};
const generateVoronoiBoundaries = () => {
    const noralaPoly = turf.polygon([
        noralaBoundaryCoordinates.map(c => [c[1], c[0]])
    ]);

    const points = turf.featureCollection(
        Object.entries(barangayCenters).map(([name, data]) =>
            turf.point([data.lng, data.lat], { name, color: data.color })
        )
    );
    const bbox = turf.bbox(noralaPoly);
    const options = { bbox };
    const voronoiPolygons = turf.voronoi(points, options);
    const boundaries = {};

    voronoiPolygons.features.forEach(vp => {
        if (!vp) return;

        let centerPoint = null;
        for (const p of points.features) {
            if (turf.booleanPointInPolygon(p, vp)) {
                centerPoint = p;
                break;
            }
        }

        if (centerPoint) {
            try {
                const intersection = turf.intersect(turf.featureCollection([vp, noralaPoly]));
                if (intersection) {
                    const name = centerPoint.properties.name;
                    const coords = intersection.geometry.type === 'MultiPolygon'
                        ? intersection.geometry.coordinates.flat(1)
                        : intersection.geometry.coordinates;
                    const leafletCoords = coords[0].map(c => [c[1], c[0]]);

                    boundaries[name] = {
                        color: centerPoint.properties.color,
                        coordinates: leafletCoords,
                        center: [centerPoint.geometry.coordinates[1], centerPoint.geometry.coordinates[0]]
                    };
                }
            } catch (e) {
                console.warn('Clipping error', e);
            }
        }
    });

    return boundaries;
};

export const barangayBoundaries = generateVoronoiBoundaries();
