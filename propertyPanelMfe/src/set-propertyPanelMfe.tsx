import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root, { registerPropsUpdater } from "./root.component";

// Create a ref to your Root component to store the updater
let latestPropsUpdater: ((props: any) => void) | null = null;

// Register the updater from the Root component
registerPropsUpdater((fn) => {
  latestPropsUpdater = fn;
});

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

export async function update(props: any) {
  console.log("Parcel updated with new props:", props);
  if (latestPropsUpdater) {
    latestPropsUpdater(props.customProps);
  }
}
