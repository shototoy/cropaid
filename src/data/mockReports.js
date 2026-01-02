export const mockReports = [
    {
        id: 'report-1',
        type: 'pest',
        status: 'pending',
        location: 'San Jose',
        details: {
            crop: 'Rice',
            pestType: 'Black Bug',
            severity: 'High',
            description: 'Black bug infestation observed in 2 hectares of rice fields. Immediate intervention needed.'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5520,
        longitude: 124.6430,
        farmer_name: 'Juan dela Cruz',
        rsbsa_id: '012-345-6789'
    },
    {
        id: 'report-2',
        type: 'flood',
        status: 'verified',
        location: 'Liberty',
        details: {
            crop: 'Corn',
            severity: 'Critical',
            description: 'River overflow caused flooding in 5 hectares. Water level at 1.5 meters.'
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5380,
        longitude: 124.6300,
        farmer_name: 'Maria Santos',
        rsbsa_id: '012-987-6543'
    },
    {
        id: 'report-3',
        type: 'drought',
        status: 'resolved',
        location: 'Poblacion',
        details: {
            crop: 'Rice',
            severity: 'Medium',
            description: 'Water shortage in irrigation system affecting 3 hectares. Resolved with emergency water supply.'
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5220,
        longitude: 124.6640,
        farmer_name: 'Pedro Reyes',
        rsbsa_id: '012-456-7890'
    },
    {
        id: 'report-4',
        type: 'pest',
        status: 'verified',
        location: 'Esperanza',
        details: {
            crop: 'Corn',
            pestType: 'Armyworm',
            severity: 'High',
            description: 'Armyworm outbreak affecting 4 hectares of corn. Spraying scheduled.'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5000,
        longitude: 124.6700,
        farmer_name: 'Rosa Garcia',
        rsbsa_id: '012-234-5678'
    },
    {
        id: 'report-5',
        type: 'flood',
        status: 'pending',
        location: 'Matapol',
        details: {
            crop: 'Rice',
            severity: 'Medium',
            description: 'Heavy rainfall causing waterlogging in 2 hectares. Drainage needed.'
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5490,
        longitude: 124.6200,
        farmer_name: 'Carlos Mendoza',
        rsbsa_id: '012-567-8901'
    },
    {
        id: 'report-6',
        type: 'pest',
        status: 'pending',
        location: 'San Jose',
        details: {
            crop: 'Rice',
            pestType: 'Rice Bug',
            severity: 'Medium',
            description: 'Rice bug spotted in 1.5 hectares. Early stage infestation.'
        },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5550,
        longitude: 124.6380,
        farmer_name: 'Ana Lopez',
        rsbsa_id: '012-678-9012'
    },
    {
        id: 'report-7',
        type: 'drought',
        status: 'verified',
        location: 'Liberty',
        details: {
            crop: 'Vegetables',
            severity: 'High',
            description: 'Prolonged dry spell affecting vegetable crops. Irrigation pump malfunction.'
        },
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5340,
        longitude: 124.6350,
        farmer_name: 'Miguel Torres',
        rsbsa_id: '012-789-0123'
    },
    {
        id: 'report-8',
        type: 'flood',
        status: 'resolved',
        location: 'Poblacion',
        details: {
            crop: 'Corn',
            severity: 'Low',
            description: 'Minor flooding from blocked drainage. Cleared and resolved.'
        },
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 6.5180,
        longitude: 124.6600,
        farmer_name: 'Elena Ramos',
        rsbsa_id: '012-890-1234'
    }
];
