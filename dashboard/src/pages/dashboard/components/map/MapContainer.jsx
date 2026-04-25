import React, { useState } from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token Mapbox depuis les variables d'environnement
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapContainer = () => {
  return (
    <div className="card">
      <div className="map-container">
        <Map
          initialViewState={{
            longitude: -8.0,
            latitude: 12.65,
            zoom: 12
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          {/* Marker pour Bamako */}
          <div 
            style={{
              position: 'absolute',
              left: '20px',
              top: '20px'
            }}
          >
            <div className="map-marker">
              DIRECT: BAMAKO
            </div>
          </div>
        </Map>

        {/* Légende */}
        <div className="map-legend">
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Légende
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22C55E' }}></div>
              <span style={{ fontSize: '12px' }}>Faible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
              <span style={{ fontSize: '12px' }}>Élevé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
