import React from "react";
import ReactDOM from "react-dom/client";
import App from "./wrapper/components/App";
import { ModelDash } from "./components/ModelDash";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App
      heading={"Performance Model"}
      department={"Institutional Effectiveness & Research"}
      dashboard={<ModelDash dataLocation={"./data/testing.json"} />}
    />
  </React.StrictMode>
);
