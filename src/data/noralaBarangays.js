export const fetchNoralaOuterBoundary = async () => {
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

        if (!response.ok) {
            throw new Error('Overpass API request failed');
        }

        const data = await response.json();

        if (data.elements && data.elements.length > 0) {
            const relation = data.elements[0];
            const coordinates = extractCoordinates(relation);
            return coordinates;
        }

        return null;
    } catch (error) {
        console.warn('Could not fetch Norala boundary:', error.message);
        return null;
    }
};

const extractCoordinates = (relation) => {
    if (!relation.members) return null;

    const ways = relation.members
        .filter(member => member.type === 'way' && member.role === 'outer')
        .map(member => member.geometry || []);

    if (ways.length === 0) return null;

    const coords = ways.flatMap(way =>
        way.map(node => [node.lat, node.lon])
    );

    if (coords.length > 0 &&
        (coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push(coords[0]);
    }

    return coords;
};

export const noralaFallbackBoundary = [
    [6.5700, 124.6000],
    [6.5700, 124.6900],
    [6.4800, 124.6900],
    [6.4800, 124.6000],
    [6.5700, 124.6000]
];
