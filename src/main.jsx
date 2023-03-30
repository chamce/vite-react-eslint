import React from "react";
import ReactDOM from "react-dom/client";
import App from "./wrapper/components/App";
// import { Dashboard } from "./components/active/Dashboard";
import { Random } from "./components/active/Random";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App
      heading={"Example"}
      department={"Institutional Effectiveness & Research"}
      dashboard={<Random />}
    />
  </React.StrictMode>
);

/*
- when the parent re-renders, it will re-render all of the parent's jsx
- however, it will not re-render the children prop
- sometimes you cannot get away with using the children prop, because it depends on values from a parent component in the form of props
- when looking at the flame graph, there cannot be a gap in the flame graph, right?
- component composition is still good for ledgibility and reducing prop drilling
*/
