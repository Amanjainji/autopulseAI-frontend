import { useEffect, useState } from "react";

export default function useTelemetry(vehicleId) {
  const [telemetry, setTelemetry] = useState(null);
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    if (!vehicleId) return;

    let ws;
    let reconnectTimeout;

    const connect = () => {
      ws = new WebSocket(
        `wss://autopulseai-backend.onrender.com/ws/telemetry/${vehicleId}`
      );

      ws.onopen = () => setStatus("online");

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setTelemetry(data);
          setStatus(data.status || "online");
        } catch {}
      };

      ws.onclose = () => {
        setStatus("offline");
        reconnectTimeout = setTimeout(connect, 5000); // retry after 5s
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [vehicleId]);

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    setStatus("error");
  };

  return { telemetry, status };
}
