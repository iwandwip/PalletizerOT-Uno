import { useState, useEffect, useCallback, useRef } from 'react';

interface Port {
  path: string;
  manufacturer?: string;
  productId?: string;
  vendorId?: string;
}

interface ReceivedData {
  timestamp: string;
  data: string;
}

type ConnectionStatus = 'disconnected' | 'websocket-connected' | 'arduino-connected' | 'websocket-error' | 'error';

interface UseArduinoReturn {
  isConnected: boolean;
  availablePorts: Port[];
  selectedPort: string;
  setSelectedPort: (port: string) => void;
  baudRate: number;
  setBaudRate: (rate: number) => void;
  receivedData: ReceivedData[];
  connectionStatus: ConnectionStatus;
  error: string | null;
  listPorts: () => void;
  connect: () => void;
  disconnect: () => void;
  sendData: (data: string) => void;
  clearReceivedData: () => void;
}

export const useArduino = (): UseArduinoReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [availablePorts, setAvailablePorts] = useState<Port[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [receivedData, setReceivedData] = useState<ReceivedData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    
    ws.current.onopen = () => {
      setConnectionStatus('websocket-connected');
      listPorts();
    };

    ws.current.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'ports-list':
          setAvailablePorts(message.ports);
          break;
        case 'connected':
          setIsConnected(true);
          setConnectionStatus('arduino-connected');
          setError(null);
          break;
        case 'disconnected':
          setIsConnected(false);
          setConnectionStatus('websocket-connected');
          break;
        case 'data-received':
          setReceivedData(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            data: message.data
          }]);
          break;
        case 'error':
          setError(message.message);
          setConnectionStatus('error');
          break;
      }
    };

    ws.current.onclose = () => {
      setConnectionStatus('disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = () => {
      setConnectionStatus('websocket-error');
      setError('WebSocket connection failed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const listPorts = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'list-ports' }));
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current && selectedPort) {
      ws.current.send(JSON.stringify({
        type: 'connect',
        port: selectedPort,
        baudRate: baudRate.toString()
      }));
    }
  }, [selectedPort, baudRate]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'disconnect' }));
    }
  }, []);

  const sendData = useCallback((data: string) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'send-data',
        data: data
      }));
    }
  }, [isConnected]);

  const clearReceivedData = useCallback(() => {
    setReceivedData([]);
  }, []);

  return {
    isConnected,
    availablePorts,
    selectedPort,
    setSelectedPort,
    baudRate,
    setBaudRate,
    receivedData,
    connectionStatus,
    error,
    listPorts,
    connect,
    disconnect,
    sendData,
    clearReceivedData
  };
};