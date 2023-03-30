import { useGridColumns } from "./useGridColumns";
import { useDeferredValue, useMemo } from "react";
import { useDropdown } from "./useDropdown";

const initialNonNumColumns = ["Institution"];
const initialNumColumns = [
  "+ Model Addition to Base",
  "+ Model New Money Contribution",
  "+ Adjusted Model Base",
  "+ Adjusted Model Total Base",
  "+ Adjusted Model New Money Share",
];

const formatNonNumHeader = (header) => {
  return header
    .split("_")
    .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
    .join(" ");
};
const formatNumHeader = (header) => {
  return header
    .substring(2)
    .split(" ")
    .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
    .filter((key) => key !== "Model" && key !== "New" && key !== "Money")
    .join(" ");
};
const nameFormatter = (column) => {
  return column.typeOf === "string"
    ? formatNonNumHeader(column.key)
    : formatNumHeader(column.key);
};
const columnFilter = (column) => {
  return !(
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
  );
};

export const usePerformanceColumns = (rows) => {
  const columns = useGridColumns(rows, columnFilter, nameFormatter);
  const nonNumColumns = useMemo(
    () =>
      columns.filter((col) => col.typeOf === "string").map((col) => col.key),
    [columns]
  );
  const numColumns = useMemo(
    () =>
      columns.filter((col) => col.typeOf !== "string").map((col) => col.key),
    [columns]
  );
  const [nonNumDropdownProps, nonNumDeferredActive] = useDropdown({
    list: nonNumColumns,
    title: "Non-Numeric Columns",
    initial: initialNonNumColumns,
    formatter: formatNonNumHeader,
  });
  const [numDropdownProps, numDeferredActive] = useDropdown({
    list: numColumns,
    title: "Numeric Columns",
    initial: initialNumColumns,
    formatter: formatNumHeader,
  });
  const updatedColumns = useMemo(() => {
    const object = {};
    columns.forEach((column) => {
      object[column.key] = column;
    });
    return [
      ...nonNumDeferredActive.map((item) => object[item]),
      ...numDeferredActive.map((item) => object[item]),
    ];
  }, [nonNumDeferredActive, numDeferredActive, columns]);
  const deferredUpdatedColumns = useDeferredValue(updatedColumns);

  return {
    updatedColumns: deferredUpdatedColumns,
    nonNumDropdownProps,
    numDropdownProps,
  };
};
