'use client';

import { useState } from 'react';
import { useArduino } from '@/lib/arduino-hook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Send, 
  Trash2, 
  Zap,
  Settings,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Cable,
  Activity
} from 'lucide-react';

export const ArduinoController: React.FC = () => {
  const {
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
  } = useArduino();

  const [sendMessage, setSendMessage] = useState<string>('');

  const baudRates: number[] = [9600, 19200, 38400, 57600, 115200];

  const getStatusBadge = (): JSX.Element => {
    switch (connectionStatus) {
      case 'arduino-connected':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'websocket-connected':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <Wifi className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <WifiOff className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Unknown
          </Badge>
        );
    }
  };

  const handleSendData = (): void => {
    if (sendMessage.trim()) {
      sendData(sendMessage);
      setSendMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Arduino Serial Controller
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect and communicate with Arduino devices via serial port with real-time monitoring
          </p>
          <div className="flex justify-center">
            {getStatusBadge()}
          </div>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <Cable className="w-4 h-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Cable className="w-5 h-5" />
                  Serial Port Configuration
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configure your Arduino connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="port-select" className="text-sm font-semibold text-gray-700">
                      Serial Port
                    </Label>
                    <div className="flex gap-2">
                      <Select value={selectedPort} onValueChange={setSelectedPort}>
                        <SelectTrigger className="flex-1 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a port..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePorts.length === 0 ? (
                            <SelectItem value="no-ports" disabled>
                              No ports available
                            </SelectItem>
                          ) : (
                            availablePorts.map((port) => (
                              <SelectItem key={port.path} value={port.path}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{port.path}</span>
                                  {port.manufacturer && (
                                    <span className="text-xs text-gray-500">{port.manufacturer}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={listPorts}
                        className="border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Found {availablePorts.length} available port(s)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="baudrate-select" className="text-sm font-semibold text-gray-700">
                      Baud Rate
                    </Label>
                    <Select value={baudRate.toString()} onValueChange={(value) => setBaudRate(parseInt(value))}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {baudRates.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{rate}</span>
                              <span className="text-xs text-gray-500 ml-2">bps</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Communication speed setting
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Connection Control</Label>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={connect} 
                        disabled={!selectedPort || isConnected}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50"
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          <>
                            <Wifi className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={disconnect} 
                        disabled={!isConnected}
                        className="border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                      >
                        <WifiOff className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert className="mt-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            {!isConnected ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Cable className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Device Connected</h3>
                  <p className="text-gray-500 mb-4">Connect to an Arduino device to start communication</p>
                  <Button 
                    onClick={() => document.querySelector('[value="connection"]')?.click()}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Go to Connection Settings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Data
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      Send commands to your Arduino device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          value={sendMessage}
                          onChange={(e) => setSendMessage(e.target.value)}
                          placeholder="Enter message to send..."
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        <Button 
                          onClick={handleSendData} 
                          disabled={!sendMessage.trim()}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['LED_ON', 'LED_OFF', 'STATUS', 'RESET'].map((cmd) => (
                          <Button
                            key={cmd}
                            variant="outline"
                            size="sm"
                            onClick={() => sendData(cmd)}
                            className="border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-sm"
                          >
                            {cmd}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Received Data
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearReceivedData}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Real-time data from Arduino ({receivedData.length} messages)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-80 w-full">
                      {receivedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                          <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <Monitor className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">No data received yet...</p>
                          <p className="text-gray-400 text-xs mt-1">Send a command to see responses</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {receivedData.map((item, index) => (
                            <div key={index} className="group">
                              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <code className="text-sm font-mono text-gray-800 break-all">
                                    {item.data}
                                  </code>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap bg-white px-2 py-1 rounded-md">
                                  {item.timestamp}
                                </span>
                              </div>
                              {index < receivedData.length - 1 && (
                                <Separator className="my-2 opacity-50" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Connection Status</p>
                      <p className="text-lg font-semibold capitalize">
                        {connectionStatus.replace('-', ' ')}
                      </p>
                    </div>
                    <Wifi className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Selected Port</p>
                      <p className="text-lg font-semibold">
                        {selectedPort || 'None'}
                      </p>
                    </div>
                    <Cable className="w-8 h-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Baud Rate</p>
                      <p className="text-lg font-semibold">{baudRate} bps</p>
                    </div>
                    <Settings className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Messages</p>
                      <p className="text-lg font-semibold">{receivedData.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Real-time monitoring and diagnostics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Available Ports</Label>
                    <div className="space-y-2">
                      {availablePorts.length === 0 ? (
                        <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                          No serial ports detected
                        </p>
                      ) : (
                        availablePorts.map((port, index) => (
                          <div key={port.path} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{port.path}</span>
                              {port.path === selectedPort && (
                                <Badge variant="outline" className="text-xs">Selected</Badge>
                              )}
                            </div>
                            {port.manufacturer && (
                              <p className="text-xs text-gray-500 mt-1">{port.manufacturer}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Connection Health</Label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>WebSocket</span>
                          <span className={connectionStatus === 'websocket-connected' || connectionStatus === 'arduino-connected' ? 'text-green-600' : 'text-red-600'}>
                            {connectionStatus === 'websocket-connected' || connectionStatus === 'arduino-connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <Progress 
                          value={connectionStatus === 'websocket-connected' || connectionStatus === 'arduino-connected' ? 100 : 0} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Arduino</span>
                          <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
                            {isConnected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <Progress 
                          value={isConnected ? 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};