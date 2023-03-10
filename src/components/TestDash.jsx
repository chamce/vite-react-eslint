import { json } from "d3";
import { BetterGrid } from "./BetterGrid";
import { useState, useEffect } from "react";

export const TestDash = ({ dataLocation }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    json(dataLocation).then(setData);
  }, [dataLocation]);

  return <BetterGrid rows={data} />;
};
