import * as signalR from "@microsoft/signalr";

const connections: Record<string, signalR.HubConnection> = {};

async function startConnection(connection: signalR.HubConnection, hubName: string) {
  try {
    await connection.start();
    console.log(`SignalR connected to ${hubName}.`);
  } catch (err) {
    console.warn(`SignalR connection to ${hubName} failed:`, err);
  }
}

export async function getSignalRConnection(hubName: string, url: string): Promise<signalR.HubConnection> {
  if (!connections[hubName]) {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();

    connections[hubName] = connection;
    await startConnection(connection, hubName);
  }

  return connections[hubName];
}