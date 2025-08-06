import "@/styles/globals.css";
import "@/styles/scss/utilities.scss";
import { Provider } from "@/components/ui/provider"
import AlarmPanel from "@/components/customcomponents/AlarmPanel/AlarmPanel";
import 'rsuite/dist/rsuite-no-reset.min.css';
import { CustomProvider } from 'rsuite';
import { Portal } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef(null);
  const [customProps, setCustomProps] = useState(initialProps.customProps);

  useEffect(() => {
    setParcelPropsExternally = (newProps: any) => {
      setCustomProps(newProps);
    };
  }, []);
  return (
    <CustomProvider>
      <Provider>
        <div ref={containerRef}>
        <Portal container={containerRef}>
        <AlarmPanel {...customProps} />
        </Portal>
        {/* <section>{props.customProps ? props.customProps.name : props.name} is mounted!</section>   */}
        </div>
      </Provider>
    </CustomProvider>);
}
