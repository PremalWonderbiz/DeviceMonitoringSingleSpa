import "@/styles/globals.css";
import "@/styles/scss/utilities.scss";
import { Provider } from "@/components/ui/provider";
import AlarmPanel from "@/components/customcomponents/AlarmPanel/AlarmPanel";
import "rsuite/dist/rsuite-no-reset.min.css";
import { CustomProvider } from "rsuite";
import { Portal } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

let setParcelPropsExternally: ((props: any) => void) | null = null;

export function registerPropsUpdater(
  registerFn: (updater: (props: any) => void) => void
) {
  registerFn((newProps) => {
    if (setParcelPropsExternally) {
      setParcelPropsExternally(newProps);
    }
  });
}

export default function Root(initialProps: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [customProps, setCustomProps] = useState(initialProps.customProps);
  const [isReady, setIsReady] = useState(false);  

  useLayoutEffect(() => {
    setParcelPropsExternally = (newProps: any) => {
      setCustomProps(newProps);
    };

    if (containerRef.current) {
      setIsReady(true);
    }
  }, []);


  return (
    <CustomProvider>
      <Provider>
        <div ref={containerRef}>
          {isReady && (
            <Portal container={containerRef}>
              <AlarmPanel {...customProps} />
            </Portal>
          )}
        </div>
      </Provider>
    </CustomProvider>
  );
}
