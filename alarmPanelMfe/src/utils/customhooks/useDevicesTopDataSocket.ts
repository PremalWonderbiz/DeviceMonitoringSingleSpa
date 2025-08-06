import { getSignalRConnection } from "@/sockets/signalRConnection";
import { useEffect, useRef } from "react";

export function useDevicesTopDataSocket(onUpdate: (data: any) => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let conn: signalR.HubConnection | null = null;

    const handler = (data: any) => {
      onUpdateRef.current?.(data);
    };

    const setupConnection = async () => {
      conn = await getSignalRConnection("devicehub", "https://localhost:7127/devicehub");
      if (!conn) {
        console.warn("SignalR connection not available");
        return;
      }

      console.log("SignalR connected. Subscribing to 'ReceiveUpdate'");
      conn.on("ReceiveUpdate", handler);
    };

    setupConnection();

    return () => {
      if (conn) {
        console.log("Cleaning up SignalR 'ReceiveUpdate' listener");
        conn.off("ReceiveUpdate", handler);
      }
    };
  }, []);
}
