import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import { useCallback, useRef, useState } from 'react';

export const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((onConnectCallback?: () => void) => {
    // Nếu đã có client đang chạy, deactivate nó trước khi tạo mới (reset)
    if (clientRef.current) {
      console.log('Resetting existing WebSocket client...');
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const SOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

    const client = new Client({
      webSocketFactory: () => new WebSocket(SOCKET_URL),
      debug: (str: string) => console.log(`[WS-DEBUG]: ${str}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // ✅ Gán trước khi activate để subscribe() dùng được ngay
    clientRef.current = client;

    client.onConnect = (frame: any) => {
      console.log('WebSocket Connected: ' + frame);
      setConnected(true);
      onConnectCallback?.();
    };

    client.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      clientRef.current = null;
      setConnected(false);
    };

    client.onStompError = (frame: any) => {
      console.error('Broker reported error: ' + (frame.headers?.['message'] ?? 'Unknown error'));
      console.error('Additional details: ' + frame.body);
    };

    console.log('Activating WebSocket client...');
    client.activate();
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('Deactivating WebSocket client...');
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }, []);

  const subscribe = useCallback(
    (topic: string, callback: (message: any) => void): StompSubscription | null => {
      if (clientRef.current?.connected) {
        return clientRef.current.subscribe(topic, (message: any) => {
          try {
            callback(JSON.parse(message.body));
          } catch (e) {
            console.error('Error parsing message body:', e);
          }
        });
      }
      return null;
    },
    []
  );

  return { connect, disconnect, sendMessage, subscribe, connected };
};