import { useMemo, useState, memo, useEffect, useRef, useCallback } from "react";

const Table = ({ containerRef, children }) => {
  return (
    <div
      ref={containerRef}
      style={{ height: 350 }}
      className="table-responsive subtle-shadow"
    >
      <table className="table table-hover m-0">{children}</table>
    </div>
  );
};
const HeaderRow = ({
  columns,
  clickedColumn,
  columnFormatter,
  setClickedCell,
}) => {
  const isHashtagClicked = clickedColumn === "#";

  return (
    <tr className="table-primary">
      <HeaderCellMemd
        {...{
          columnKey: "#",
          isClickedCell: isHashtagClicked,
          setClickedCell,
        }}
      >
        #
      </HeaderCellMemd>
      {columns.map((column) => {
        const key = column.key;
        const isClickedCell = clickedColumn === key;

        return (
          <HeaderCellMemd
            {...{
              key,
              columnKey: key,
              isClickedCell,
              setClickedCell,
            }}
          >
            {columnFormatter(key)}
          </HeaderCellMemd>
        );
      })}
    </tr>
  );
};
const Row = ({
  i,
  row,
  columns,
  groupBy,
  clickedColumn,
  isClickedRow,
  isCollapsed,
  numberFormatter,
  setClickedCell,
  setCollapsedIndexes,
}) => {
  const isHashtagClicked = clickedColumn === "#";

  return (
    <tr className={isClickedRow ? "table-info" : null}>
      <CellMemd
        {...{
          index: i,
          columnKey: "#",
          isClickedCell: isHashtagClicked,
          setClickedCell,
        }}
      >
        {i + 1}
      </CellMemd>
      {columns.map((column) => {
        const key = column.key;
        const { value, className, isGroupByValue, isClickedCell } =
          getCellVariables({
            row,
            key,
            groupBy,
            clickedColumn,
            numberFormatter,
          });

        return (
          <CellMemd
            {...{
              key,
              index: i,
              columnKey: key,
              className,
              isGroupByValue,
              isClickedCell,
              isCollapsed,
              setCollapsedIndexes,
              setClickedCell,
            }}
          >
            {value}
          </CellMemd>
        );
      })}
    </tr>
  );
};
const HeaderCell = ({ columnKey, isClickedCell, setClickedCell, children }) => {
  const onCellClicked = (rowIndex, column) => {
    setClickedCell(
      isClickedCell
        ? {
            rowIndex: null,
            column: null,
          }
        : { rowIndex, column }
    );
  };

  return (
    <th
      onClick={() => onCellClicked(-1, columnKey)}
      scope="col"
      className={isClickedCell ? "outline-primary outline-offset-1" : null}
    >
      {children}
    </th>
  );
};
const Cell = ({
  index,
  columnKey,
  className,
  isGroupByValue,
  isClickedCell,
  isCollapsed,
  setCollapsedIndexes,
  setClickedCell,
  children,
}) => {
  const onCellClicked = (rowIndex, column) => {
    setClickedCell(
      isClickedCell
        ? {
            rowIndex: null,
            column: null,
          }
        : { rowIndex, column }
    );
  };

  return columnKey === "#" ? (
    <th
      onClick={() => onCellClicked(index, columnKey)}
      scope="row"
      className={isClickedCell ? "outline-primary outline-offset-1" : null}
    >
      {children}
    </th>
  ) : (
    <td onClick={() => onCellClicked(index, columnKey)} className={className}>
      <span
        onClick={(e) =>
          onTableValueClicked(e, isGroupByValue, index, setCollapsedIndexes)
        }
        style={isGroupByValue ? { cursor: "pointer" } : null}
      >
        {isGroupByValue ? (
          isCollapsed ? (
            <i className="fa-solid fa-chevron-right fa-fw"></i>
          ) : (
            <i className="fa-solid fa-chevron-down fa-fw"></i>
          )
        ) : null}
        {children}
      </span>
    </td>
  );
};
const HeaderRowMemd = memo(HeaderRow);
const HeaderCellMemd = memo(HeaderCell);
const RowMemd = memo(Row);
const CellMemd = memo(Cell);

export const DataGrid = (props) => {
  const {
    ref,
    groupedRows,
    columns,
    groupBy,
    columnFormatter,
    numberFormatter,
    clickedCell,
    collapsedIndexes,
    hiddenIndexes,
    setClickedCell,
    setCollapsedIndexes,
  } = useDataGrid(props);
  const headerClickedColumn =
    clickedCell.rowIndex === -1 ? clickedCell.column : null;

  return (
    <Table containerRef={ref}>
      <thead className="sticky-top-container">
        <HeaderRowMemd
          {...{
            columns,
            clickedColumn: headerClickedColumn,
            setClickedCell,
            columnFormatter,
          }}
        />
      </thead>
      <tbody>
        {groupedRows.map((row, i) => {
          const isHidden = hiddenIndexes.has(i);
          const isCollapsed = collapsedIndexes.has(i);
          const isClickedRow = clickedCell.rowIndex === i;
          const clickedColumn = isClickedRow ? clickedCell.column : null;

          return isHidden ? null : (
            <RowMemd
              {...{
                key: i,
                i,
                row,
                columns,
                groupBy,
                clickedColumn,
                isClickedRow,
                isCollapsed,
                numberFormatter,
                setClickedCell,
                setCollapsedIndexes,
              }}
            />
          );
        })}
      </tbody>
    </Table>
  );
};

const useDataGrid = (props) => {
  const ref = useRef();
  const {
    validatedRows,
    validatedColumns,
    validatedGroupBy,
    validatedColumnFormatter,
    validatedNumberFormatter,
  } = useMemo(
    () => getValidatedProps(...Object.keys(props).map((key) => props[key])),
    [props]
  );
  const { groupedRows, childRowsLookup } = useMemo(
    () => getGroupedRows(validatedRows, validatedColumns, validatedGroupBy),
    [validatedRows, validatedColumns, validatedGroupBy]
  );
  const [collapsedIndexes, setCollapsedIndexes] = useState(new Set());
  const hiddenIndexes = useMemo(
    () => getHiddenIndexes(collapsedIndexes, childRowsLookup),
    [collapsedIndexes, childRowsLookup]
  );
  const [clickedCell, setClickedCell] = useState({
    rowIndex: null,
    column: null,
  });
  const onClickOutsideHandler = useCallback(() => {
    setClickedCell({
      rowIndex: null,
      column: null,
    });
  }, []);
  useOnClickOutside(ref, onClickOutsideHandler);

  return {
    ref,
    groupedRows,
    columns: validatedColumns,
    groupBy: validatedGroupBy,
    columnFormatter: validatedColumnFormatter,
    numberFormatter: validatedNumberFormatter,
    clickedCell,
    collapsedIndexes,
    hiddenIndexes,
    setClickedCell,
    setCollapsedIndexes,
  };
};
const useOnClickOutside = (ref, handler) => {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
};
const getValidatedProps = (
  rows,
  columns,
  groupBy,
  columnFormatter,
  numberFormatter
) => {
  const validatedRows = Array.isArray(rows) ? rows : [];
  let validatedColumns = [];
  let validatedGroupBy = [];
  let likeColumns = [];
  if (Array.isArray(columns)) {
    const allPossibleColumns = {};
    validatedRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!allPossibleColumns[key]) {
          allPossibleColumns[key] = {};
        }
        const type = typeof row[key];
        if (!allPossibleColumns[key][type]) {
          allPossibleColumns[key][type] = 0;
        }
        allPossibleColumns[key][type]++;
      });
    });
    likeColumns = columns.filter((column) =>
      Object.keys(allPossibleColumns).includes(column)
    );
    validatedColumns = likeColumns.map((key) => ({
      key,
      type: Object.keys(allPossibleColumns[key]).sort(
        (a, b) => allPossibleColumns[key][b] - allPossibleColumns[key][a]
      )[0],
    }));
  }
  if (Array.isArray(groupBy)) {
    validatedGroupBy = groupBy.filter((column) => likeColumns.includes(column));
    validatedColumns.sort((a, b) => {
      let indexA = validatedGroupBy.indexOf(a.key);
      let indexB = validatedGroupBy.indexOf(b.key);
      indexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      indexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      return indexA - indexB;
    });
  }
  const validatedColumnFormatter =
    typeof columnFormatter === "function"
      ? columnFormatter
      : (column) => column;
  const validatedNumberFormatter =
    typeof numberFormatter === "function"
      ? numberFormatter
      : (number) => number;
  return {
    validatedRows,
    validatedColumns,
    validatedGroupBy,
    validatedColumnFormatter,
    validatedNumberFormatter,
  };
};
const getGroupedRows = (rows, columns, groupBy) => {
  if (groupBy.length) {
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
      .filter((column) => column.type === "number")
      .map((column) => column.key);

    const groupStrings = Object.keys(groups).sort();
    const groupedRows = [];
    const groupLookup = {};

    groupStrings.forEach((groupString) => {
      const groupArray = groupString.split("→");
      const groupRows = groups[groupString];
      const gridRow = {};

      gridRow[groupBy[groupArray.length - 1]] =
        groupArray[groupArray.length - 1];

      numberColumns.forEach((column) => {
        gridRow[column] = 0;
      });

      groupRows.forEach((row) => {
        numberColumns.forEach((column) => {
          gridRow[column] += row[column];
        });
      });

      groupedRows.push(gridRow);

      const index = groupedRows.length - 1;
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
          groupedRows.push(newRow);

          const index = groupedRows.length - 1;
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

    return { groupedRows, childRowsLookup };
  } else {
    return { groupedRows: rows, childRowsLookup: {} };
  }
};
const getHiddenIndexes = (collapsedIndexes, childRowsLookup) => {
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
};
const onTableValueClicked = (e, condition, index, setIndexes) => {
  if (condition) {
    e.stopPropagation();
    setIndexes((indexes) => {
      const newIndexes = new Set(indexes);
      if (newIndexes.has(index)) {
        newIndexes.delete(index);
      } else {
        newIndexes.add(index);
      }
      return newIndexes;
    });
  }
};
const getTdClassName = (isLastGroupBy, isClickedCell) => {
  const outlineString = "outline-primary outline-offset-1";
  let tdClassName = isLastGroupBy ? "border-end" : null;
  if (isClickedCell) {
    if (tdClassName) {
      tdClassName += " " + outlineString;
    } else {
      tdClassName = outlineString;
    }
  }
  return tdClassName;
};
const getCellVariables = ({
  row,
  key,
  groupBy,
  clickedColumn,
  numberFormatter,
}) => {
  const isGroupByValue = groupBy.includes(key) && row.hasOwnProperty(key);
  const isClickedCell = clickedColumn === key;
  const isLastGroupBy = key === groupBy[groupBy.length - 1];
  const isNumberValue = typeof row[key] === "number";
  const className = getTdClassName(isLastGroupBy, isClickedCell);
  const value = isNumberValue ? numberFormatter(row[key]) : row[key];
  return { value, className, isGroupByValue, isClickedCell };
};

// column active outline doesn't show on bottom, outline may not show in other places on different devices
