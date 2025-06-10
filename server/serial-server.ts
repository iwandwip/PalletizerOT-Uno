import WebSocket from 'ws';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

interface SerialMessage {
  type: 'list-ports' | 'connect' | 'send-data' | 'disconnect';
  port?: string;
  baudRate?: string;
  data?: string;
}

interface PortInfo {
  path: string;
  manufacturer?: string;
  productId?: string;
  vendorId?: string;
}

const wss = new WebSocket.Server({ port: 8080 });

console.log('Serial WebSocket Server running on port 8080');

wss.on('connection', (ws: WebSocket) => {
  let currentPort: SerialPort | null = null;
  let parser: ReadlineParser | null = null;

  ws.on('message', async (message: string) => {
    try {
      const data: SerialMessage = JSON.parse(message);
      
      switch (data.type) {
        case 'list-ports':
          const ports = await SerialPort.list();
          ws.send(JSON.stringify({
            type: 'ports-list',
            ports: ports.map((port): PortInfo => ({
              path: port.path,
              manufacturer: port.manufacturer,
              productId: port.productId,
              vendorId: port.vendorId
            }))
          }));
          break;

        case 'connect':
          try {
            if (currentPort && currentPort.isOpen) {
              currentPort.close();
            }

            currentPort = new SerialPort({
              path: data.port!,
              baudRate: parseInt(data.baudRate!)
            });

            parser = currentPort.pipe(new ReadlineParser({ delimiter: '\n' }));
            
            parser.on('data', (receivedData: string) => {
              ws.send(JSON.stringify({
                type: 'data-received',
                data: receivedData.trim()
              }));
            });

            currentPort.on('open', () => {
              ws.send(JSON.stringify({
                type: 'connected',
                port: data.port,
                baudRate: data.baudRate
              }));
            });

            currentPort.on('error', (err: Error) => {
              ws.send(JSON.stringify({
                type: 'error',
                message: err.message
              }));
            });

          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: (error as Error).message
            }));
          }
          break;

        case 'send-data':
          if (currentPort && currentPort.isOpen) {
            currentPort.write(data.data! + '\n');
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Port not connected'
            }));
          }
          break;

        case 'disconnect':
          if (currentPort && currentPort.isOpen) {
            currentPort.close();
            ws.send(JSON.stringify({
              type: 'disconnected'
            }));
          }
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: (error as Error).message
      }));
    }
  });

  ws.on('close', () => {
    if (currentPort && currentPort.isOpen) {
      currentPort.close();
    }
  });
});