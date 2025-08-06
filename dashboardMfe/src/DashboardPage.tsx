import React, { useEffect, useRef } from "react";
import Parcel from 'single-spa-react/parcel';

export default function DashboardPage({ mountParcel }) {
  const propertyPanelRef = useRef(null);


  useEffect(() => {
    if (propertyPanelRef.current && mountParcel) {
      mountParcel(() => import("http://localhost:8081/set-propertyPanelMfe.js"), {
        domElement: propertyPanelRef.current,
        name: "Property Panel",
        customProps: {
          name: "Property Panel",
          deviceId: "ABC123",
          onUpdate: (data: any) => console.log("Property Updated", data)
        }
      });
    }

    // if (alarmPanelRef.current && mountParcel) {
    //   mountParcel(() => import("http://localhost:8082/set-alarmPanelMfe.js"), {
    //     domElement: alarmPanelRef.current,
    //     name: "Alarm Panel"
    //   });
    // }
  }, []);

  return (
    <div>
      <h1>Dashboard App</h1>
      <div ref={propertyPanelRef} />
      {/* <Parcel
        config={() => import("http://localhost:8082/set-alarmPanelMfe.js").then((mod: any) => ({
          bootstrap: mod.bootstrap,
          mount: mod.mount,
          unmount: mod.unmount
        }))}
        mountParcel={mountParcel}
        customProps={{
          name: "Alarm Panel"
        }}
      /> */}
    </div>
  );
}
