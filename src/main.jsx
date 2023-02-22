import React from "react";
import ReactDOM from "react-dom/client";
// import { ExampleDashboard } from "./ExampleDashboard";
// Colonel's Compass
// Semester & Refund Deadlines
import { Dashboard } from "./Dashboard";
import App from "./Wrapper/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App
      dashboard={<Dashboard />}
      heading={"Performance Model"}
      department={"Institutional Effectiveness & Research"}
    />
  </React.StrictMode>
);
