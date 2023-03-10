import { json } from "d3";
import { BetterGrid } from "./BetterGrid";
import { PerformanceModel } from "../js/performance-model";
import { useState, useEffect, useMemo, useCallback } from "react";

const usePerformance = () => {
  const [state, setState] = useState(null);
  const nameFormatter = useCallback(
    (column) =>
      column.typeOf === "string"
        ? column.key
            .split("_")
            .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
            .join(" ")
        : column.key
            .substring(2)
            .split(" ")
            .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
            .filter(
              (key) => key !== "Model" && key !== "New" && key !== "Money"
            )
            .join(" "),
    []
  );
  const columnFilter = useCallback(
    (column) =>
      !(
        column.typeOf !== "string" &&
        [
          "+ Model Base",
          "+ Model Addition to Base",
          "+ Model Total Base",
          "+ Model New Money Contribution",
          "+ Model New Money Share",
          "+ Adjusted Model Base",
          "+ Adjusted Model Addition to Base",
          "+ Adjusted Model Total Base",
          "+ Adjusted Model New Money Contribution",
          "+ Adjusted Model New Money Share",
        ].indexOf(column.key) === -1
      ),
    []
  );

  const rows = useMemo(
    () =>
      state
        ? Object.keys(state.model)
            .map((measure) =>
              Object.keys(state.model[measure]).map(
                (school) => state.model[measure][school]
              )
            )
            .flat()
        : [],
    [state]
  );

  useEffect(() => {
    Promise.all(
      [
        "institutions",
        "allocation_dollars",
        "base_dollars",
        "weights",
        "data",
      ].map((name) => json("./data/" + name + ".json"))
    ).then((data) => {
      const performance = new PerformanceModel(...data, 0);
      performance.buildModel("2022-23");
      setState(performance);
    });
  }, []);

  return [rows, columnFilter, nameFormatter];
};

export const ModelDash = () => {
  const [rows, columnFilter, nameFormatter] = usePerformance();

  return <BetterGrid {...{ rows, columnFilter, nameFormatter }} />;
};
