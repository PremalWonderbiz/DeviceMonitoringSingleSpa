import DashboardPage from "./DashboardPage";
import Home from "./Home";
import { Provider } from "@/components/ui/provider"
import "@/styles/globals.css";
import "@/styles/scss/utilities.scss";

// export const noTheme = extendTheme({
//   styles: {
//     global: {
//       // Reset to minimal or your own
//       body: {
//         margin: 0,
//         padding: 0,
//         background: "#f0f0f0;",
//         fontFamily: "Arial, Helvetica, sans-serif",
//         maxwidth: "100vw",
//         overflowX: "hidden",
//       },
//     },
//   },
//   colors: {},
//   fonts: {},
//   components: {}, // no overrides for Button, Input, etc.
// });

export default function Root(props) {
  return (
   <Provider>
      <Home mountParcel={props.mountParcel} />
   </Provider>
  );
}
