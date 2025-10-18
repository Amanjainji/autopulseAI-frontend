import { useEffect, useState } from "react";

export default function useTelemetry(vehicleId){
  const [telemetry, setTelemetry] = useState(null);
  const [status, setStatus] = useState("offline");

  useEffect(()=>{
    if(!vehicleId) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/telemetry/${vehicleId}`);
    ws.onopen = ()=> setStatus("online");
    ws.onmessage = (e)=>{
      try{
        const data = JSON.parse(e.data);
        setTelemetry(data);
        setStatus(data.status || "online");
      }catch{}
    };
    ws.onclose = ()=> setStatus("offline");
    return ()=> ws.close();
  }, [vehicleId]);

  return { telemetry, status };
}
