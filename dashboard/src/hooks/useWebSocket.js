import { useEffect, useRef } from 'react';
import { API_URL_BASE } from '../config/api_url_base';
import authService from '../pages/auth/services/authService';

// Base WebSocket dérivée de l'API HTTP : http→ws, https→wss.
const WS_BASE = API_URL_BASE.replace(/^http/, 'ws');

/**
 * Abonnement WebSocket temps réel (Channels). Le handshake WS ne peut pas porter
 * d'en-tête Authorization → on passe le JWT en ?token=<access> (le backend le
 * valide via JWTCookieAuthMiddleware). Reconnexion automatique en cas de coupure.
 *
 * @param {string|null} path  ex. '/ws/notifications/' ou null pour désactiver
 * @param {(data:any)=>void} onMessage  appelé à chaque message (JSON parsé)
 * @param {boolean} [enabled=true]
 */
export function useWebSocket(path, onMessage, enabled = true) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || !path) return undefined;

    let ws;
    let reconnectTimer;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      try {
        const token = authService.getAccessToken();
        const url = token
          ? `${WS_BASE}${path}?token=${encodeURIComponent(token)}`
          : `${WS_BASE}${path}`;
        ws = new WebSocket(url);
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
        return;
      }
      ws.onmessage = (event) => {
        let data = event.data;
        try { data = JSON.parse(event.data); } catch { /* texte brut */ }
        onMessageRef.current?.(data);
      };
      ws.onclose = () => {
        if (!stopped) reconnectTimer = setTimeout(connect, 3000); // auto-reconnect
      };
      ws.onerror = () => { try { ws.close(); } catch { /* noop */ } };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      try { if (ws) ws.close(); } catch { /* noop */ }
    };
  }, [path, enabled]);
}

export default useWebSocket;
