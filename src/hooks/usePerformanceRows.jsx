import { json } from "d3";
import { useEffect, useMemo, useState } from "react";
import { PerformanceModel } from "../js/performance-model";

const getModelClass = (setModelClass) => {
  const jsonPromisesArray = [
    "institutions",
    "allocation_dollars",
    "base_dollars",
    "weights",
    "data",
  ].map((fileName) => json("./data/" + fileName + ".json"));
  Promise.all(jsonPromisesArray).then((parameters) => {
    const performance = new PerformanceModel(...parameters, 0);
    performance.buildModel("2022-23");
    setModelClass(performance);
  });
};
const getGridRows = (modelClass) => {
  return modelClass
    ? Object.keys(modelClass.model)
        .map((metric) =>
          Object.keys(modelClass.model[metric]).map(
            (institution) => modelClass.model[metric][institution]
          )
        )
        .flat()
    : [];
};

export const usePerformanceRows = () => {
  const [modelClass, setModelClass] = useState(null);
  const gridRows = useMemo(() => getGridRows(modelClass), [modelClass]);

  useEffect(() => {
    getModelClass(setModelClass);
  }, []);

  return gridRows;
};
