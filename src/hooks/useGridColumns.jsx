import { useMemo } from "react";

const getSortableColumns = (rows) => {
  if (rows) {
    let columns = {};
    rows.forEach((object) => {
      columns = { ...columns, ...object };
    });
    return Object.keys(columns).filter(
      (key) => typeof columns[key] === "string"
    );
  }
  return [];
};
const getColumns = (rows, sortableColumns, nameFormatter) => {
  if (rows) {
    const formatHeader = (key) => {
      return key
        .split("_")
        .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
        .join(" ");
    };
    const formatNumber = (num) => {
      return num?.toLocaleString("en-US");
    };
    let columns = {};
    rows.forEach((object) => {
      columns = { ...columns, ...object };
    });
    const cols = Object.keys(columns).map((key) => {
      const typeOf = typeof columns[key];
      return {
        key,
        name: formatHeader(key),
        resizable: true,
        sortable: sortableColumns.indexOf(key) !== -1,
        formatter:
          typeOf === "number"
            ? ({ row, column, isCellSelected, onRowChange }) =>
                formatNumber(row[column.key])
            : null,
        groupFormatter:
          typeOf === "number"
            ? ({
                childRows,
                column,
                groupKey,
                isCellSelected,
                isExpanded,
                row,
                toggleGroup,
              }) =>
                formatNumber(
                  childRows.reduce((prev, row) => prev + row[column.key], 0)
                )
            : null,
        typeOf,
      };
    });
    cols.forEach((column) => {
      if (nameFormatter) {
        column.name = nameFormatter(column);
      }
    });
    return cols;
  }
  return [];
};
const getFilteredColumns = (rows, columnFilter, nameFormatter) => {
  const sortableCols = getSortableColumns(rows);
  const cols = getColumns(rows, sortableCols, nameFormatter);
  const filteredCols = columnFilter ? cols.filter(columnFilter) : cols;
  return filteredCols;
};

export const useGridColumns = (rows, columnFilter, nameFormatter) => {
  const gridColumns = useMemo(
    () => getFilteredColumns(rows, columnFilter, nameFormatter),
    [rows, columnFilter, nameFormatter]
  );

  return gridColumns;
};
