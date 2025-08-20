import React, { useState, useEffect } from "react";
import "@/styles/globals.css";
import "@/styles/scss/utilities.scss";
import { Provider } from "@/components/ui/provider";
import PropertyPanel from "@/components/customcomponents/Propertypanel/PropertyPannel";

// External bridge for props
let setParcelPropsExternally: ((props: any) => void) | null = null;

export function registerPropsUpdater(registerFn: (updater: (props: any) => void) => void) {
  registerFn((newProps) => {
    if (setParcelPropsExternally) {
      setParcelPropsExternally(newProps);
    }
  });
}

export default function Root(initialProps: any) {
  console.log(initialProps);
  
  const [customProps, setCustomProps] = useState(initialProps.customProps);

  useEffect(() => {
    setParcelPropsExternally = (newProps: any) => {
      setCustomProps(newProps);
    };
  }, []);

  return (
    <Provider>
      <PropertyPanel {...customProps} />
    </Provider>
  );
}
