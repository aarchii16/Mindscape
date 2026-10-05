import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Activity, Battery, Bluetooth, PlugZap, Unplug, Gauge } from "lucide-react";

// GATT UUIDs (standardized)
const HEART_RATE_SERVICE = 0x180d; // "heart_rate"
const HEART_RATE_MEASUREMENT = 0x2a37; // notifications
const BODY_SENSOR_LOCATION = 0x2a38; // optional
const BATTERY_SERVICE = 0x180f; // "battery_service"
const BATTERY_LEVEL = 0x2a19;

// Simple helper for parsing Heart Rate Measurement characteristic per spec
function parseHeartRatePacket(view: DataView) {
  // Spec: https://www.bluetooth.com/specifications/specs/heart-rate-profile-1-0/
  // Byte0 flags
  const flags = view.getUint8(0);
  const is16Bit = (flags & 0x01) === 0x01;
  const rrPresent = (flags & 0x10) === 0x10;

  let index = 1;
  let heartRate = 0;
  if (is16Bit) {
    heartRate = view.getUint16(index, /*littleEndian*/ true);
    index += 2;
  } else {
    heartRate = view.getUint8(index);
    index += 1;
  }

  // Skip Energy Expended if present (bit 3)
  const eePresent = (flags & 0x08) === 0x08;
  if (eePresent) {
    index += 2; // 2 bytes
  }

  const rrIntervalsMs: number[] = [];
  if (rrPresent) {
    while (index + 1 < view.byteLength) {
      const rr = view.getUint16(index, true); // unit: 1/1024 second
      index += 2;
      const rrMs = (rr * 1000) / 1024; // convert to ms
      rrIntervalsMs.push(rrMs);
    }
  }

  return { heartRate, rrIntervalsMs };
}

// Compute RMSSD from RR intervals (ms)
function computeRmssd(rrMs: number[]): number | null {
  if (!rrMs || rrMs.length < 3) return null; // need at least a few
  const diffs: number[] = [];
  for (let i = 1; i < rrMs.length; i++) {
    const d = rrMs[i] - rrMs[i - 1];
    diffs.push(d);
  }
  if (!diffs.length) return null;
  const meanSq = diffs.reduce((acc, v) => acc + v * v, 0) / diffs.length;
  return Math.sqrt(meanSq);
}

// Simple classification helpers
function classifyHeartRate(hr: number | null) {
  if (hr == null) return { label: "No data", color: "bg-muted" };
  if (hr < 50) return { label: "Bradycardia risk (low HR)", color: "bg-yellow-500" };
  if (hr > 100) return { label: "Tachycardia risk (high HR)", color: "bg-red-500" };
  return { label: "Normal range", color: "bg-green-500" };
}

function classifyStressByRmssd(rmssd: number | null) {
  if (rmssd == null) return { label: "Unknown", color: "bg-muted" };
  if (rmssd < 20) return { label: "High stress", color: "bg-red-500" };
  if (rmssd < 40) return { label: "Moderate stress", color: "bg-yellow-500" };
  return { label: "Low stress (good recovery)", color: "bg-green-500" };
}

export default function BiometricsPage() {
  const { toast } = useToast();

  const [supported, setSupported] = useState<boolean>(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [bodyLocation, setBodyLocation] = useState<string | null>(null);

  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [hrSamples, setHrSamples] = useState<{ t: number; hr: number }[]>([]);
  const [rrBuffer, setRrBuffer] = useState<number[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Demo mode state
  const [isDemo, setIsDemo] = useState(false);
  const demoTimerRef = useRef<number | null>(null);

  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const deviceRef = useRef<BluetoothDevice | null>(null);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.bluetooth);
  }, []);

  const stopDemo = useCallback(() => {
    if (demoTimerRef.current) {
      window.clearInterval(demoTimerRef.current);
      demoTimerRef.current = null;
    }
    setIsDemo(false);
  }, []);

  const disconnect = useCallback(async () => {
    stopDemo();
    try {
      const ch = characteristicRef.current;
      if (ch) {
        try { await ch.stopNotifications(); } catch {}
        ch.removeEventListener("characteristicvaluechanged", onHrChanged as any);
      }
    } catch {}
    try {
      const device = deviceRef.current;
      if (device && device.gatt?.connected) device.gatt.disconnect();
    } catch {}
    setConnected(false);
  }, [stopDemo]);

  useEffect(() => {
    return () => { void disconnect(); };
  }, [disconnect]);

  const onHrChanged = useCallback((event: Event) => {
    // Some browsers type value as DataView on target
    const target = event.target as any;
    const value: DataView = target?.value as DataView;
    if (!value) return;
    const { heartRate, rrIntervalsMs } = parseHeartRatePacket(value);
    const now = Date.now();
    setHeartRate(heartRate || null);
    setLastUpdated(now);
    setHrSamples((prev) => {
      const next = [...prev, { t: now, hr: heartRate }].filter((p) => now - p.t <= 60_000); // keep 60s
      return next;
    });
    if (rrIntervalsMs?.length) {
      setRrBuffer((prev) => {
        const merged = [...prev, ...rrIntervalsMs];
        // keep last ~120 RR values
        return merged.slice(Math.max(0, merged.length - 120));
      });
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    stopDemo();
    if (!supported) return;
    try {
      setConnecting(true);
      // Request a Heart Rate device (acceptAllDevices helps for watches that don't expose filters)
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["battery_service", HEART_RATE_SERVICE, BATTERY_SERVICE],
      } as RequestDeviceOptions);

      deviceRef.current = device;
      setDeviceName(device.name || "Unknown device");

      device.addEventListener("gattserverdisconnected", () => {
        setConnected(false);
        toast({ title: "Disconnected", description: "Device disconnected" });
      });

      const server = await device.gatt!.connect();
      serverRef.current = server;

      // Heart Rate service + notifications
      const hrService = await server.getPrimaryService(HEART_RATE_SERVICE as BluetoothServiceUUID);
      const hrChar = await hrService.getCharacteristic(HEART_RATE_MEASUREMENT as BluetoothCharacteristicUUID);
      characteristicRef.current = hrChar;
      await hrChar.startNotifications();
      hrChar.addEventListener("characteristicvaluechanged", onHrChanged as any);

      // Optional: Body Sensor Location
      try {
        const bslChar = await hrService.getCharacteristic(BODY_SENSOR_LOCATION as BluetoothCharacteristicUUID);
        const bslValue = await bslChar.readValue();
        const locCode = bslValue.getUint8(0);
        const map: Record<number, string> = {
          0: "Other", 1: "Chest", 2: "Wrist", 3: "Finger", 4: "Hand", 5: "Ear Lobe", 6: "Foot",
        };
        setBodyLocation(map[locCode] ?? "Unknown");
      } catch {}

      // Optional: Battery level
      try {
        const battService = await server.getPrimaryService(BATTERY_SERVICE as BluetoothServiceUUID);
        const battChar = await battService.getCharacteristic(BATTERY_LEVEL as BluetoothCharacteristicUUID);
        const v = await battChar.readValue();
        setBatteryLevel(v.getUint8(0));
      } catch {}

      setConnected(true);
      toast({ title: "Connected", description: device.name || "Bluetooth device" });
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to connect");
      toast({ title: "Connection failed", description: e?.message || "Unable to connect", variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  }, [onHrChanged, supported, stopDemo, toast]);

  // Analytics over last 60s
  const stats = useMemo(() => {
    if (!hrSamples.length) return null;
    const lastMinute = hrSamples.map((s) => s.hr);
    const avg = Math.round(lastMinute.reduce((a, b) => a + b, 0) / lastMinute.length);
    const min = Math.min(...lastMinute);
    const max = Math.max(...lastMinute);
    const rmssd = computeRmssd(rrBuffer);
    return { avg, min, max, rmssd };
  }, [hrSamples, rrBuffer]);

  const hrClass = classifyHeartRate(heartRate);
  const stressClass = classifyStressByRmssd(stats?.rmssd ?? null);

  const possibleIssues = useMemo(() => {
    const issues: string[] = [];
    if (heartRate != null) {
      if (heartRate < 50) issues.push("Low heart rate detected which may indicate bradycardia. Consider medical evaluation if symptomatic.");
      if (heartRate > 100) issues.push("Elevated heart rate detected which may indicate tachycardia or acute stress.");
    }
    if (stats?.rmssd != null && stats.rmssd < 25) {
      issues.push("Low HRV (RMSSD) suggesting elevated stress or poor recovery.");
    }
    if (!issues.length) issues.push("No obvious issues detected in current session.");
    return issues;
  }, [heartRate, stats?.rmssd]);

  const suggestions = useMemo(() => {
    const tips: string[] = [];
    if (heartRate != null && heartRate > 90) tips.push("Try 5 minutes of slow breathing (4s inhale, 6s exhale) to reduce acute stress.");
    if (stats?.rmssd != null && stats.rmssd < 30) tips.push("Plan a recovery routine: adequate sleep, hydration, light activity, and mindfulness.");
    tips.push("If you experience dizziness, chest pain, or shortness of breath, seek professional care immediately.");
    return tips;
  }, [heartRate, stats?.rmssd]);

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Biometric Monitor</h1>
            <p className="text-muted-foreground">Connect a Bluetooth wearable (watch, strap) to view heart metrics and get a wellness report.</p>
          </div>
          <div className="flex items-center gap-2">
            {!supported && (
              <Badge variant="secondary" className="text-red-600">Browser doesn't support Web Bluetooth</Badge>
            )}
            {connected ? (
              <Button variant="secondary" onClick={disconnect} className="rounded-xl">
                <Unplug className="h-4 w-4 mr-2" /> Disconnect
              </Button>
            ) : (
              <Button onClick={connect} disabled={!supported || connecting} className="rounded-xl">
                {connecting ? <PlugZap className="h-4 w-4 mr-2 animate-pulse" /> : <Bluetooth className="h-4 w-4 mr-2" />}
                {connecting ? "Connecting..." : "Connect"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Demo controls */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            {!isDemo && (
              <Button
                className="rounded-xl"
                onClick={() => {
                  // Start demo: simulate HR 62–98 bpm with mild variability and RR intervals
                  setDeviceName("Noise Pulse");
                  setBatteryLevel(76);
                  setBodyLocation("Wrist");
                  setConnected(true);
                  setIsDemo(true);
                  const start = Date.now();
                  let base = 72 + Math.round(Math.random() * 6 - 3); // starting HR ~72
                  demoTimerRef.current = window.setInterval(() => {
                    const now = Date.now();
                    // wander the HR slowly
                    const drift = Math.sin((now - start) / 5000) * 5 + (Math.random() * 2 - 1);
                    const hr = Math.max(55, Math.min(110, Math.round(base + drift)));
                    setHeartRate(hr);
                    setLastUpdated(now);
                    setHrSamples((prev) => {
                      const next = [...prev, { t: now, hr }].filter((p) => now - p.t <= 60_000);
                      return next;
                    });
                    // RR intervals around 60,000/hr ms with variability
                    const rr = 60000 / hr; // ms
                    const rrVals = Array.from({ length: 2 }, () => rr + (Math.random() * 40 - 20));
                    setRrBuffer((prev) => {
                      const merged = [...prev, ...rrVals];
                      return merged.slice(Math.max(0, merged.length - 120));
                    });
                  }, 1000);
                }}
              >
                Start
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Live Heart Rate</CardTitle>
              <CardDescription>{deviceName ? `Device: ${deviceName}` : "No device connected"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold">{heartRate ?? "--"}</span>
                <span className="text-muted-foreground">bpm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full ${hrClass.color}`} />
                <span className="text-sm">{hrClass.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">{lastUpdated ? `Last update: ${new Date(lastUpdated).toLocaleTimeString()}` : "Waiting for data..."}</div>
              {(batteryLevel != null || isDemo) && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2"><Battery className="h-4 w-4" /><span>Battery</span></div>
                    <span>{(batteryLevel ?? 76)}%</span>
                  </div>
                  <Progress value={(batteryLevel ?? 76)} />
                </div>
              )}
              {(bodyLocation || isDemo) && (
                <div className="text-sm text-muted-foreground">Sensor position: {bodyLocation ?? "Wrist"}</div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4" /> 60s Summary</CardTitle>
              <CardDescription>Aggregates of the last minute</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Average HR</TableCell>
                    <TableCell>{stats ? `${stats.avg} bpm` : "--"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Min HR</TableCell>
                    <TableCell>{stats ? `${stats.min} bpm` : "--"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Max HR</TableCell>
                    <TableCell>{stats ? `${stats.max} bpm` : "--"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HRV (RMSSD)</TableCell>
                    <TableCell>{stats?.rmssd != null ? `${stats.rmssd.toFixed(0)} ms` : "--"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Stress level</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${stressClass.color}`} />
                        <span>{stressClass.label}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Session Report</CardTitle>
              <CardDescription>Possible issues and suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Possible issues</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {possibleIssues.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Possible solutions</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Web Bluetooth works only over HTTPS or localhost and with supported browsers. Not all devices expose heart rate via standard services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Grant Bluetooth permissions when prompted.</li>
              <li>Wear the device properly to ensure stable readings.</li>
              <li>If your watch doesn’t appear, check if it supports the standard Heart Rate service (0x180D) and is not already paired in system settings.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}