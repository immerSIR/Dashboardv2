export const incidents = [
  {
    id: '#4922',
    title: 'Stagnant Water Leak',
    location: 'Industrial Zone Alpha',
    fullLocation: 'Industrial Zone Alpha, Block C',
    status: 'critical',
    statusLabel: 'CRITICAL',
    team: 'Sanitation Dept',
    extra: '+ 2',
    reportedAt: '2h ago',
    agenciesActive: 4,
    assets: [
      { id: 1, name: 'leak_photo_01.jpg', size: '2.4 MB', meta: 'Uploaded by Sanitation', type: 'image' },
      { id: 2, name: 'site_report_v2.pdf', size: '1.1 MB', meta: '2 min ago', type: 'doc' }
    ],
    messages: [
      {
        id: 1,
        author: 'Elena Rodriguez',
        role: 'Sanitation Dept',
        roleColor: 'info',
        time: '14:02',
        text: 'Primary valve leak identified at Sector C. Water is pooling near the drainage basin. Requesting Health Ministry for immediate chemical assessment.'
      },
      {
        id: 2,
        author: 'Dr. Marcus Chen',
        role: 'Health Ministry',
        roleColor: 'success',
        time: '14:15',
        text: 'Acknowledged. Team Beta is 10 mins away. Preparing water sampling kit and protective equipment.'
      },
      {
        id: 3,
        author: 'Sarah Jenkins',
        role: 'EPA Specialist',
        roleColor: 'warning',
        time: '14:22',
        text: 'I will coordinate with the lab for urgent analysis. Please share GPS coordinates.'
      }
    ]
  },
  {
    id: '#4811',
    title: 'Air Quality Spike',
    location: 'Residential Sector B',
    fullLocation: 'Residential Sector B, District 3',
    status: 'medium',
    statusLabel: 'MEDIUM',
    team: 'Health Ministry',
    reportedAt: '5h ago',
    agenciesActive: 2,
    assets: [
      { id: 1, name: 'air_reading.csv', size: '420 KB', meta: '1h ago', type: 'doc' }
    ],
    messages: [
      {
        id: 1,
        author: 'Dr. Marcus Chen',
        role: 'Health Ministry',
        roleColor: 'success',
        time: '09:45',
        text: 'PM2.5 levels exceed safe threshold. Recommending residents limit outdoor activity.'
      }
    ]
  },
  {
    id: '#4790',
    title: 'Erosion Monitoring',
    location: 'Coastal Reserve',
    fullLocation: 'Coastal Reserve, North Beach',
    status: 'stable',
    statusLabel: 'STABLE',
    team: 'Eco-Guardians NGO',
    reportedAt: '1d ago',
    agenciesActive: 1,
    assets: [],
    messages: [
      {
        id: 1,
        author: 'Liam O\'Neill',
        role: 'Eco-Guardians',
        roleColor: 'success',
        time: 'Yesterday',
        text: 'Weekly monitoring complete. Erosion rate stable this week.'
      }
    ]
  },
  {
    id: '#4756',
    title: 'Chemical Spill Report',
    location: 'Port Industrial Dock',
    fullLocation: 'Port Industrial Dock, Warehouse 12',
    status: 'critical',
    statusLabel: 'CRITICAL',
    team: 'DNACPN',
    extra: '+ 3',
    reportedAt: '30 min ago',
    agenciesActive: 5,
    assets: [
      { id: 1, name: 'spill_area.jpg', size: '3.2 MB', meta: '15 min ago', type: 'image' }
    ],
    messages: [
      {
        id: 1,
        author: 'Priya Sharma',
        role: 'DNACPN',
        roleColor: 'danger',
        time: 'Just now',
        text: 'Containment team deployed. Evacuation of non-essential personnel in progress.'
      }
    ]
  },
  {
    id: '#4721',
    title: 'Illegal Deforestation',
    location: 'Baoulé Forest Reserve',
    fullLocation: 'Baoulé Forest Reserve, Zone 4',
    status: 'critical',
    statusLabel: 'CRITICAL',
    team: 'GEDEFOR',
    extra: '+ 1',
    reportedAt: '3h ago',
    agenciesActive: 3,
    assets: [],
    messages: []
  },
  {
    id: '#4698',
    title: 'Noise Pollution Complaint',
    location: 'Commune IV, Bamako',
    fullLocation: 'Commune IV, Bamako',
    status: 'medium',
    statusLabel: 'MEDIUM',
    team: 'Urban Agency',
    reportedAt: '6h ago',
    agenciesActive: 1,
    assets: [],
    messages: []
  },
  {
    id: '#4654',
    title: 'Waste Dumping Activity',
    location: 'Kati Outskirts',
    fullLocation: 'Kati Outskirts, East Road',
    status: 'medium',
    statusLabel: 'MEDIUM',
    team: 'Sanitation Dept',
    extra: '+ 1',
    reportedAt: '8h ago',
    agenciesActive: 2,
    assets: [],
    messages: []
  },
  {
    id: '#4612',
    title: 'Wildlife Monitoring Alert',
    location: 'Boucle du Baoulé',
    fullLocation: 'Boucle du Baoulé National Park',
    status: 'stable',
    statusLabel: 'STABLE',
    team: 'WWF Mali',
    reportedAt: '12h ago',
    agenciesActive: 1,
    assets: [],
    messages: []
  },
  {
    id: '#4589',
    title: 'Drinking Water Quality',
    location: 'Ségou Rural Area',
    fullLocation: 'Ségou Rural Area, Village 7',
    status: 'medium',
    statusLabel: 'MEDIUM',
    team: 'Unicef',
    extra: '+ 2',
    reportedAt: '1d ago',
    agenciesActive: 3,
    assets: [],
    messages: []
  },
  {
    id: '#4541',
    title: 'Soil Contamination Test',
    location: 'Kayes Mining Zone',
    fullLocation: 'Kayes Mining Zone, Site B',
    status: 'critical',
    statusLabel: 'CRITICAL',
    team: 'Environment Ministry',
    reportedAt: '2d ago',
    agenciesActive: 4,
    assets: [],
    messages: []
  },
  {
    id: '#4502',
    title: 'Reforestation Project',
    location: 'Sikasso Region',
    fullLocation: 'Sikasso Region, Sector 2',
    status: 'stable',
    statusLabel: 'STABLE',
    team: 'Eco-Guardians NGO',
    extra: '+ 4',
    reportedAt: '3d ago',
    agenciesActive: 5,
    assets: [],
    messages: []
  },
  {
    id: '#4478',
    title: 'Flood Risk Assessment',
    location: 'Niger River Banks',
    fullLocation: 'Niger River Banks, Mopti',
    status: 'medium',
    statusLabel: 'MEDIUM',
    team: 'Civil Protection',
    reportedAt: '5d ago',
    agenciesActive: 2,
    assets: [],
    messages: []
  }
];
