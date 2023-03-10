import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import { groupBy as rowGrouper } from "lodash";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useEventListener } from "../hooks/useEventListener";

const countKeys = (object, result) => {
  const keys = Object.keys(object);
  result.sum += keys.length;
  result.keys = [...result.keys, ...keys];
  keys.forEach((key) => {
    if (typeof object[key] === "object")
      result = countKeys(object[key], result);
  });
  return result;
};
const getNumberOfGridRows = (rows, groupBy, expandedGroupIds) => {
  if (groupBy.length === 0) {
    return rows.length + 1;
  } else {
    const combos = {};
    rows.forEach((row) => {
      groupBy.forEach((column, i) => {
        let string = "";
        let counter = 0;
        for (let x = 0; x <= i; x++) {
          const col = groupBy[x];
          string += "__" + row[col];
          counter++;
        }
        combos[string.substring(2)] = counter;
      });
    });
    const expandedCombos = {};
    expandedGroupIds.forEach((string) => {
      expandedCombos[string] = true;
    });
    const collapsedCombos = {};
    Object.keys(combos).forEach((key) => {
      if (!expandedCombos[key] && combos[key] !== groupBy.length) {
        collapsedCombos[key] = combos[key];
      }
    });
    const collapseThese = Object.keys(collapsedCombos).sort(
      (a, b) => collapsedCombos[b] - collapsedCombos[a]
    );
    const expandedTable = {};
    rows.forEach((row) => {
      let obj = expandedTable;
      groupBy.forEach((column) => {
        const value = row[column];
        if (!obj[value]) {
          obj[value] = {};
        }
        obj = obj[value];
      });
    });
    collapseThese.forEach((string) => {
      const split = string.split("__");
      const last = split.pop();
      let obj = expandedTable;
      split.forEach((str) => {
        obj = obj[str];
      });
      obj[last] = {};
    });
    const totalKeys = countKeys(expandedTable, { sum: 0, keys: [] });
    return totalKeys.sum + 1;
  }
};
const getExpansion = (rows, index, activeStringCols) => {
  const object = {};
  const upToClickedCol = activeStringCols.slice(0, index + 1);
  rows.forEach((row) => {
    upToClickedCol.forEach((element, elementIndex) => {
      let iterator = 0;
      let string = "";
      while (elementIndex >= iterator) {
        const col = upToClickedCol[iterator];
        string += "__" + row[col];
        iterator++;
      }
      object[string.substring(2)] = { column: element, index: elementIndex };
    });
  });
  return object;
};
const expandOrCollapseAll = (
  rows,
  clickedCol,
  activeStringCols,
  setExpandedGroupIds,
  inEffect
) => {
  const clickedColIndex = activeStringCols.indexOf(clickedCol);
  const expandedObject = getExpansion(rows, clickedColIndex, activeStringCols);
  let totalValues = 0;
  const set = new Set();
  Object.keys(expandedObject).forEach((key) => {
    if (expandedObject[key].column === clickedCol) {
      totalValues++;
    }
    set.add(key);
  });
  setExpandedGroupIds((previous) => {
    let valuesSelected = 0;
    for (const key of previous) {
      if (expandedObject[key] && expandedObject[key].column === clickedCol) {
        valuesSelected++;
      }
    }
    if (valuesSelected === totalValues && !inEffect) {
      for (const key of set) {
        if (expandedObject[key].index >= clickedColIndex) {
          set.delete(key);
        }
      }
    }
    return set;
  });
};
const onColumnHeaderClicked = (
  e,
  rows,
  activeStringCols,
  setExpandedGroupIds
) => {
  const clickedCol = e[0].columnKey;
  const lastCol = activeStringCols[activeStringCols.length - 1];
  if (clickedCol !== lastCol) {
    expandOrCollapseAll(
      rows,
      clickedCol,
      activeStringCols,
      setExpandedGroupIds
    );
  }
};
const difference = (setA, setB) => {
  const difference = new Set(setA);
  for (const element of setB) {
    difference.delete(element);
  }
  return difference;
};
const onExpandedGroupIdsChange = (
  setExpandedGroupIds,
  activeStringCols,
  curr
) => {
  setExpandedGroupIds((prev) => {
    let clickedVal = "";
    const currDifference = difference(curr, prev);
    const prevDifference = difference(prev, curr);
    const numOfCols = activeStringCols.length;
    const clickedSet =
      currDifference.size !== 0 ? currDifference : prevDifference;
    const maxDoubleUnder = numOfCols > 0 ? numOfCols - 1 : 0;
    for (const key of clickedSet) {
      clickedVal = key;
    }
    const countDoubleUnder = clickedVal.split("__").length - 1;
    return countDoubleUnder === maxDoubleUnder ? prev : curr;
  });
};

export const Grid = ({ rows, columns }) => {
  const groupBy = useMemo(
    () =>
      columns
        .filter((col) => col?.expectedType === "string")
        .map((col) => col?.key),
    [columns]
  );
  const gridRef = useRef();
  const scrollableNodeRef = useRef();
  const [expandedGroupIds, setExpandedGroupIds] = useState(new Set());
  const onScroll = useCallback(
    (e) => {
      if (gridRef.current) {
        gridRef.current.element.scrollTop = e.target.scrollTop;
        gridRef.current.element.style.marginTop = e.target.scrollTop + "px";
      }
    },
    [gridRef]
  );
  useEventListener("scroll", onScroll, scrollableNodeRef.current);
  const overflowHeight = useMemo(
    () =>
      rows && groupBy && expandedGroupIds
        ? getNumberOfGridRows(rows, groupBy, expandedGroupIds) * 35
        : 0,
    [rows, groupBy, expandedGroupIds]
  );
  useEffect(() => {
    const inEffect = true;
    const secondToLastCol = groupBy[groupBy.length - 2];
    expandOrCollapseAll(
      rows,
      secondToLastCol,
      groupBy,
      setExpandedGroupIds,
      inEffect
    );
  }, [rows, groupBy, setExpandedGroupIds]);

  return (
    <SimpleBar
      style={{
        height: 350,
      }}
      scrollableNodeProps={{
        ref: scrollableNodeRef,
      }}
      className={"border border-dark grid-shadow bg-dark-subtle bg-gradient"}
    >
      <div
        className={"overflow-hidden"}
        style={{
          width: "fit-content",
          height: overflowHeight,
        }}
      >
        <DataGrid
          {...{ rows, columns, groupBy }}
          ref={gridRef}
          rowGrouper={rowGrouper}
          style={{ fontSize: "small" }}
          expandedGroupIds={expandedGroupIds}
          className={"overflow-hidden border-0"}
          onExpandedGroupIdsChange={(e) => {
            onExpandedGroupIdsChange(setExpandedGroupIds, groupBy, e);
          }}
          onSortColumnsChange={(e) =>
            onColumnHeaderClicked(e, rows, groupBy, setExpandedGroupIds)
          }
        />
      </div>
    </SimpleBar>
  );
};

// inspect behavior, refactoring, modals, colored columns, grid width < box width sometimes
// make the grid more aesthetically pleasing by making the grid design span the entire box
// can get an unscrollable grid if you stretch columns when there is no overflow
