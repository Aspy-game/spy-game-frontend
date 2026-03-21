import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useCallback, useRef, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-game';

export const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((onConnectCallback?: () => void) => {
    if (clientRef.current) {
      console.log('WebSocket client already exists.');
      return;
    }

    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str: string) => console.log(`[WS-DEBUG]: ${str}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame: any) => {
      console.log('WebSocket Connected: ' + frame);
      clientRef.current = client;
      setConnected(true);
      onConnectCallback?.();
    };

    client.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      clientRef.current = null;
      setConnected(false);
    };

    client.onStompError = (frame: any) => {
      console.error('Broker reported error: ' + (frame.headers ? frame.headers['message'] : 'Unknown error'));
      console.error('Additional details: ' + frame.body);
    };

    console.log('Activating WebSocket client...');
    client.activate();
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('Deactivating WebSocket client...');
      clientRef.current.deactivate();
    }
  }, []);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }, []);

  const subscribe = useCallback((topic: string, callback: (message: any) => void): StompSubscription | null => {
    if (clientRef.current && clientRef.current.connected) {
      return clientRef.current.subscribe(topic, (message: any) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('Error parsing message body:', e);
        }
      });
    }
    return null;
  }, []);

  return { connect, disconnect, sendMessage, subscribe, connected };
};
