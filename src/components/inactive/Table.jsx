import { useEffect, useState, useMemo, memo, useCallback } from "react";
import { json } from "d3";
// import { VariableSizeGrid as Grid } from "react-window";

// const Cell = memo(({ columnIndex, rowIndex, style, data }) => {
//   const row = data.rows[rowIndex];
//   const column = data.columns[columnIndex].key;
//   const item = row[column];

//   return (
//     <div
//       style={style}
//       className={"d-flex align-items-center p-2 border-bottom border-end"}
//     >
//       <span
//         style={{
//           overflow: "hidden",
//           whiteSpace: "nowrap",
//           textOverflow: "ellipsis",
//         }}
//       >
//         {item}
//       </span>
//     </div>
//   );
// });
// const VirtualizedTable = ({ rows, columns }) => {
//   return (
//     <Grid
//       {...{
//         itemData: { rows, columns },
//         columnCount: columns.length,
//         width: columns.length * 100,
//         className: "border w-100",
//         columnWidth: () => 100,
//         rowCount: rows.length,
//         rowHeight: () => 40,
//         height: 350,
//       }}
//     >
//       {Cell}
//     </Grid>
//   );
// };

const getSortIndex = (array, key) => {
  return array.indexOf(key) === -1
    ? Number.MAX_SAFE_INTEGER
    : array.indexOf(key);
};
const getColumns = (data, groupBy) => {
  return data.length > 0
    ? Object.keys(data[0])
        .map((key) => ({ key, type: typeof data[0][key] }))
        .sort((a, b) => (a.type === "number") - (b.type === "number"))
        .sort(
          (a, b) => getSortIndex(groupBy, a.key) - getSortIndex(groupBy, b.key)
        )
    : [];
};
const getData = (setData, dataLocation) => {
  json(dataLocation).then(setData);
};
const formatColumn = (key) => {
  return key
    .split("_")
    .map((string) => string.charAt(0).toUpperCase() + string.substring(1))
    .join(" ");
};
const getGroupedRows = (rows, columns, groupBy) => {
  const groups = {};

  rows.forEach((row) => {
    for (let i = 0; i < groupBy.length; i++) {
      const values = groupBy
        .slice(0, i + 1)
        .map((column) => row[column])
        .join("→");

      if (!groups[values]) {
        groups[values] = [];
      }

      groups[values].push(row);
    }
  });

  const numberColumns = columns
    .filter((column) => column.type !== "string")
    .map((column) => column.key);

  const groupStrings = Object.keys(groups).sort();
  const table = [];
  const groupLookup = {};

  groupStrings.forEach((groupString) => {
    const groupArray = groupString.split("→");
    const groupRows = groups[groupString];
    const gridRow = {};

    gridRow[groupBy[groupArray.length - 1]] = groupArray[groupArray.length - 1];

    numberColumns.forEach((column) => {
      gridRow[column] = 0;
    });

    groupRows.forEach((row) => {
      numberColumns.forEach((column) => {
        gridRow[column] += row[column];
      });
    });

    table.push(gridRow);

    const index = table.length - 1;
    const childIndexes = [];
    groupLookup[groupString] = { index, childIndexes };
    const parentString = groupArray.slice(0, -1).join("→");
    if (parentString) {
      groupLookup[parentString].childIndexes.push(index);
    }

    if (groupArray.length === groupBy.length) {
      groups[groupString].forEach((row) => {
        const newRow = { ...row };
        groupBy.forEach((key) => {
          delete newRow[key];
        });
        table.push(newRow);

        const index = table.length - 1;
        groupLookup[groupString].childIndexes.push(index);
      });
    }
  });

  const childRowsLookup = {};
  Object.keys(groupLookup)
    .sort()
    .forEach((key) => {
      const object = groupLookup[key];
      childRowsLookup[object.index] = object.childIndexes;
    });

  // console.log("Lookup", childRowsLookup);

  return { groupedRows: table, childRowsLookup };
};
const addCommasToNumber = (number) => {
  return number.toLocaleString("en-US");
};
const isGroupedRow = (row, columns, columnLookup) => {
  let matching = 0;
  const keys = Object.keys(row);
  for (let i = 0; i < keys.length; i++) {
    if (columnLookup.has(keys[i])) {
      matching++;
    }
  }
  return matching !== columns.length;
};
const isGroupValue = (row, key, columns, columnLookup, groupByLookup) => {
  return (
    isGroupedRow(row, columns, columnLookup) &&
    row[key] &&
    groupByLookup.has(key)
  );
};
const isLastGroupBy = (key, groupBy) => {
  return key === groupBy[groupBy.length - 1];
};
const isNonGroupValue = (row, key, groupByLookup) => {
  return !groupByLookup.has(key) && (row[key] || row[key] === 0);
};

const Columns = ({ columns }) => {
  return (
    <tr className="table-primary">
      <th scope="col">#</th>
      {columns.map((column) => (
        <th key={column.key} scope="col">
          {formatColumn(column.key)}
        </th>
      ))}
    </tr>
  );
};
const Row = ({
  i,
  row,
  columns,
  groupBy,
  collapsed,
  renderValue,
  columnLookup,
  renderChevron,
  pointerCondition,
  groupClickHandler,
}) => {
  return (
    <tr>
      <th scope="row">{i + 1}</th>
      {columns.map((column) => (
        <td
          className={
            isLastGroupBy(column.key, groupBy) &&
            isGroupedRow(row, columns, columnLookup)
              ? "border-end"
              : null
          }
          key={column.key}
        >
          <span
            style={
              pointerCondition(row, column.key) ? { cursor: "pointer" } : null
            }
            onClick={() => groupClickHandler(i, row, column.key)}
          >
            {renderValue(row, column.key)}{" "}
            {renderChevron(row, column.key, collapsed)}
          </span>
        </td>
      ))}
    </tr>
  );
};
const BootstrapTable = ({ rows, columns }) => {
  return (
    <div style={{ height: 350 }} className="table-responsive subtle-shadow">
      <table className="table table-sm table-hover m-0">
        <thead className="sticky-top-container">{columns}</thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};
const MemoizedColumns = memo(Columns);
const MemoizedRow = memo(Row);

export const Table = ({ dataLocation, groupBy }) => {
  const validatedGroupBy = useMemo(
    () => (Array.isArray(groupBy) ? groupBy : []),
    [groupBy]
  );
  const {
    rows,
    columns,
    renderValue,
    columnLookup,
    renderChevron,
    hiddenIndexes,
    collapsedIndexes,
    pointerCondition,
    groupClickHandler,
  } = useBoostrapTable(dataLocation, validatedGroupBy);

  return (
    <BootstrapTable
      rows={rows.map((row, i) => {
        const collapsed = collapsedIndexes.has(i);
        const shouldShowRow = !hiddenIndexes.has(i);
        return shouldShowRow ? (
          <MemoizedRow
            key={i}
            {...{
              i,
              row,
              columns,
              groupBy,
              collapsed,
              renderValue,
              columnLookup,
              renderChevron,
              pointerCondition,
              groupClickHandler,
            }}
          />
        ) : null;
      })}
      columns={<MemoizedColumns columns={columns} />}
    />
  );
};

const useBoostrapTable = (dataLocation, groupBy) => {
  const [data, setData] = useState([]);
  const [collapsedIndexes, setCollapsedIndexes] = useState(new Set());

  const groupByCondition = useMemo(
    () =>
      groupBy.filter(
        (key) => Object.keys(data?.[0] ? data[0] : {}).indexOf(key) !== -1
      ).length,
    [groupBy, data]
  );
  const columns = useMemo(() => getColumns(data, groupBy), [data, groupBy]);
  const groupByLookup = useMemo(() => new Set(groupBy), [groupBy]);
  const columnLookup = useMemo(
    () => new Set(columns.map((column) => column.key)),
    [columns]
  );
  const { groupedRows, childRowsLookup } = useMemo(
    () => getGroupedRows(data, columns, groupBy),
    [data, columns, groupBy]
  );
  const hiddenIndexes = useMemo(() => {
    const array = [];
    let iterator = [...collapsedIndexes]
      .flatMap((index) => childRowsLookup[index])
      .filter((element) => element !== undefined);
    while (iterator.length) {
      array.push(...iterator);
      iterator = iterator
        .flatMap((index) => childRowsLookup[index])
        .filter((element) => element !== undefined);
    }
    return new Set(array);
  }, [childRowsLookup, collapsedIndexes]);

  const pointerCondition = useCallback(
    (row, key) => {
      return isGroupValue(row, key, columns, columnLookup, groupByLookup);
    },
    [columns, columnLookup, groupByLookup]
  );
  const groupClickHandler = useCallback(
    (clickedIndex, row, key) => {
      if (isGroupValue(row, key, columns, columnLookup, groupByLookup)) {
        setCollapsedIndexes((set) => {
          const setCopy = new Set(set);
          if (setCopy.has(clickedIndex)) {
            setCopy.delete(clickedIndex);
          } else {
            setCopy.add(clickedIndex);
          }
          return setCopy;
        });
      }
    },
    [columns, columnLookup, groupByLookup]
  );
  const renderValue = useCallback(
    (row, key) => {
      return isNonGroupValue(row, key, groupByLookup)
        ? addCommasToNumber(row[key])
        : row[key];
    },
    [groupByLookup]
  );
  const renderChevron = useCallback(
    (row, key, collapsed) => {
      return isGroupValue(row, key, columns, columnLookup, groupByLookup) ? (
        collapsed ? (
          <i className="bi bi-chevron-up"></i>
        ) : (
          <i className="bi bi-chevron-down"></i>
        )
      ) : null;
    },
    [columns, columnLookup, groupByLookup]
  );

  useEffect(() => {
    getData(setData, dataLocation);
  }, [dataLocation]);

  const rows = groupByCondition ? groupedRows : data;

  return {
    rows,
    columns,
    renderValue,
    columnLookup,
    renderChevron,
    hiddenIndexes,
    collapsedIndexes,
    pointerCondition,
    groupClickHandler,
  };
};

// could you just send the row's lookup information to itself, instead of the entire lookup? Or would you just send the callback that depends on the lookup?

// could use table-active + on pointer enter and on pointer leave to manually choose which row indexes are allowed to be hovered
// you would just need to maintain a hovered index state in the table component to dictate which one becomes active. since the rows are memoized, it would be performant
// would actually be better to just place this state in the row, just give it a prop telling it if it is hoverable

// it would actually be a set of expandeds in state that could then be used to calculate not shown indexes using the groups object and grouped rows array

// for manual expansion on click handlers, toggle rows based on stateful not shown set of row indexes. If not shown set has row index, do not render row. This is assuming row indexes never change. It is okay to keep this state in table because rows are memoized. Should be able to easily point to which rows are expandable based on condition functions already set up. Will need to maintain groups object in a use memo hook as well to support the function for updating not shown state.

// and don't forget the option to click column headers to quickly expand previous column

/*
- the lower nested you go, the lighter the row (shader)
- right align numeric columns
- caret on left
- table hover
- style similar to ag grid
- small font
- add total column for all rows
- pass group by columns or summarized columns
- could be props for table
*/
