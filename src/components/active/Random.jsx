import { json } from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid } from "./DataGrid";

const useJson = (path) => {
  const [state, setState] = useState([]);

  useEffect(() => {
    json(path).then(setState);
  }, [path]);

  return state;
};

export const Random = () => {
  const rows = useJson("./data/testing.json");
  const columns = useMemo(
    () => (rows.length ? Object.keys(rows[0]) : []),
    [rows]
  );
  const groupBy = useMemo(() => ["gender", "favorite_movie_genre"], []);
  const columnFormatter = useCallback((column) => {
    return column
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
      )
      .join(" ");
  }, []);
  const numberFormatter = useCallback((number) => {
    return number.toLocaleString("en-US");
  }, []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      groupBy={groupBy}
      columnFormatter={columnFormatter}
      numberFormatter={numberFormatter}
    />
  );
};
