import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useCallback, useEffect, useRef } from 'react';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-game';

export const useWebSocket = (onMessageReceived: (message: any) => void) => {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str: string) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame: any) => {
      console.log('Connected: ' + frame);
      clientRef.current = client;
      
      // Subscribe to general topics or room-specific topics
      // Example: client.subscribe('/topic/room', (message: any) => onMessageReceived(JSON.parse(message.body)));
    };

    client.onStompError = (frame: any) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
  }, [onMessageReceived]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      console.log('Disconnected');
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

  const subscribe = useCallback((topic: string, callback: (message: any) => void) => {
    if (clientRef.current && clientRef.current.connected) {
      return clientRef.current.subscribe(topic, (message: any) => {
        callback(JSON.parse(message.body));
      });
    }
    return null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { sendMessage, subscribe };
};
