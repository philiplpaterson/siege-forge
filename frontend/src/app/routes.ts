import { createBrowserRouter } from "react-router";
import { JoinScreen } from "./pages/JoinScreen";
import { Meeting } from "./pages/Meeting";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: JoinScreen,
  },
  {
    path: "/meeting",
    Component: Meeting,
  },
]);
