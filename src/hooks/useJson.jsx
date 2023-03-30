import { useState, useEffect } from "react";
import { json } from "d3";

export const useJson = (location) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    json(location).then(setData);
  }, [location]);

  return data;
};
