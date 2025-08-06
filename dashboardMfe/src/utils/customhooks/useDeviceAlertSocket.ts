import { getSignalRConnection } from "@/sockets/signalRConnection";
import { useEffect } from "react";

export function useDeviceAlertSocket(deviceId : any,onUpdate: (data: any) => void, connMethodName : string, shouldConnectSignalR : boolean = true) {
  useEffect(() => {
    if (!shouldConnectSignalR) return;
    let conn: signalR.HubConnection | null = null;
    const handler = (data: any) => onUpdate(data);

    const setupConnection = async () => {
      conn = await getSignalRConnection("alerthub","https://localhost:7154/alerthub");
      if (!conn) {
        console.warn("SignalR connection not available");
        return;
      }

      console.log("SignalR connection obtained");
      console.log(`Subscribing to '${connMethodName}'`);
      try {
        if(connMethodName == "ReceiveAlarmPanelUpdates")
            await conn.invoke("JoinAlarmPanelGroup", "AlarmPanelGroup");
        else if(connMethodName == "ReceivePropertyPanelAlarmUpdates")
            await conn.invoke("JoinPropertyPanelGroup", deviceId);
      } catch (err) {
        console.log("JoinDeviceGroup failed:", err);
      }
      conn.on(connMethodName, handler);
    };

    setupConnection();

    return () => {
      if (conn) {
        console.log(`Cleaning up '${connMethodName}' listener`);
        conn.off("ReceiveMainPageUpdates", handler);
        conn.off("ReceiveAlarmPanelUpdates", handler);
        conn.off("ReceivePropertyPanelAlarmUpdates", handler);
        if(connMethodName == "ReceiveAlarmPanelUpdates")
            conn.invoke("LeaveAlarmPanelGroup", "AlarmPanelGroup").catch(console.error);
        else if(connMethodName == "ReceivePropertyPanelAlarmUpdates")
            conn.invoke("LeavePropertyPanelGroup", deviceId);
      }
    };
  }, [deviceId, shouldConnectSignalR]);
}


// -ReceiveMainPageUpdates
// -ReceiveAlarmPanelUpdates
// -ReceivePropertyPanelAlarmUpdates