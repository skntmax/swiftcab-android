/**
 * Socket.IO Provider for React Native
 * Handles WebSocket connection with authentication
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { all_env } from '../utils/env';
import { SOCKET_EVENTS, USER_ROLES } from '../utils/socketConstants';
import { getAuthToken } from '../utils/storage';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  reconnecting: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  reconnecting: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let newSocket: Socket | null = null;

    const initializeSocket = async () => {
      try {
        // Get auth token from storage
        const token = await getAuthToken();
        
        if (!token) {
          console.warn('⚠️ No auth token found, socket connection skipped');
          return;
        }

        console.log('🔌 Initializing socket connection to:', all_env.SOCKET_URL);

        newSocket = io(all_env.SOCKET_URL, {
          transports: ['websocket'], // avoid long polling for React Native
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 5000, // wait 5s before trying to reconnect
          reconnectionDelayMax: 10000,
          auth: {
            token: `Bearer ${token}`,
            portal: USER_ROLES['driver-partner'],
          },
        });

        // Connection events
        newSocket.on(SOCKET_EVENTS.CONNECT, () => {
          console.log('✅ Socket connected:', newSocket?.id);
          setIsConnected(true);
          setReconnecting(false);
        });

        newSocket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
        });

        newSocket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
          console.error('⚠️ Socket connection error:', error.message);
          setIsConnected(false);
        });

        newSocket.on('reconnecting', (attemptNumber) => {
          console.log(`🔄 Reconnecting... Attempt ${attemptNumber}`);
          setReconnecting(true);
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log(`✅ Reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
          setReconnecting(false);
        });

        // Ride update listener (global)
        newSocket.on(SOCKET_EVENTS.RIDE_UPDATE, (data) => {
          console.log('🚗 Ride Update:', data);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('❌ Error initializing socket:', error);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        console.log('🔌 Disconnecting socket...');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnecting }}>
      {children}
    </SocketContext.Provider>
  );
}

export { SocketContext };

