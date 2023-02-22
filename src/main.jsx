import React from "react";
import ReactDOM from "react-dom/client";
// import { Example } from "./components/Example";
// Colonel's Compass
// Semester & Refund Deadlines
import { Dashboard } from "./components/Dashboard";
import App from "./wrapper/components/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App
      dashboard={<Dashboard />}
      heading={"Dashboard Heading"}
      department={"Institutional Effectiveness & Research"}
    />
  </React.StrictMode>
);
