import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { memo, useMemo, useState, useRef, useEffect } from "react";
import { groupBy as rowGrouper } from "lodash";

const getGroupBy = (columns) => {
  return columns
    .filter((column) => column.typeOf === "string")
    .map((column) => column.key);
};
const getOverflowHeight = (rows, groupBy, expandedGroupIds) => {
  const expansionConditions = (
    end,
    expandedValues,
    inner,
    value,
    expandedGroupIds,
    i,
    row,
    count
  ) => {
    if (end > 0) {
      if (expandedValues === "" && !inner[value]) {
        inner[value] = {};
        count.total++;
      }
      if (
        inner &&
        expandedGroupIds.has(expandedValues) &&
        !inner[value] &&
        i !== end
      ) {
        inner[value] = {};
        count.total++;
      }
      if (
        inner &&
        expandedGroupIds.has(expandedValues) &&
        !inner[value] &&
        i === end
      ) {
        inner[value] = [];
        count.total++;
      }
      if (
        inner &&
        inner[value] &&
        i === end &&
        expandedGroupIds.has(expandedValues + "__" + value)
      ) {
        inner[value].push(row);
        count.total++;
      }
    } else {
      if (!inner[value]) {
        inner[value] = [];
        count.total++;
      }
      if (expandedGroupIds.has(value)) {
        inner[value].push(row);
        count.total++;
      }
    }
  };
  const count = { total: 0 };
  const end = groupBy?.length - 1;
  const outer = {};
  rows?.forEach((row) => {
    groupBy.forEach((key, i) => {
      const value = row[key];
      let inner = outer;
      let expandedValues = "";
      for (let x = 0; x < i; x++) {
        const prevKey = groupBy[x];
        const prevValue = row[prevKey];
        inner = inner?.[prevValue];
        if (x === 0) {
          expandedValues = prevValue;
        } else {
          expandedValues += "__" + prevValue;
        }
      }
      expansionConditions(
        end,
        expandedValues,
        inner,
        value,
        expandedGroupIds,
        i,
        row,
        count
      );
    });
  });
  //   const grid = Object.keys(outer).length ? outer : rows;
  const total = Object.keys(outer).length ? count.total : rows?.length;
  return (total + 1) * 35;
};
const filterLastColumnGroups = (set, groupBy, onExpandedGroupIdsChange) => {
  onExpandedGroupIdsChange(
    new Set(
      [...set].filter(
        (group) => group.split("__").length - 1 !== groupBy.length - 1
      )
    )
  );
};
const expandAll = (endColumn, rows, groupBy, onExpandedGroupIdsChange) => {
  const endColumnIndex = groupBy.indexOf(endColumn[0].columnKey);
  onExpandedGroupIdsChange(() => {
    const groupsToBeAdded = new Set();
    rows.forEach((row) => {
      groupBy.slice(0, endColumnIndex).forEach((key, i) => {
        const value = row[key];
        let expandedValues = "";
        for (let x = 0; x < i; x++) {
          const prevKey = groupBy[x];
          const prevValue = row[prevKey];
          if (x === 0) {
            expandedValues = prevValue;
          } else {
            expandedValues += "__" + prevValue;
          }
        }
        if (i === 0) {
          expandedValues = value;
        } else {
          expandedValues += "__" + value;
        }
        groupsToBeAdded.add(expandedValues);
      });
    });
    return groupsToBeAdded;
  });
};
const emulateGridScroll = (outerElement, gridElement) => {
  if (outerElement && gridElement) {
    const max = outerElement.scrollHeight - outerElement.offsetHeight;
    const current = outerElement.scrollTop;
    gridElement.scrollTop = current;
    const difference = current - max;
    let fromTop = (difference / 350) * 100;
    const headers =
      gridElement.getElementsByClassName("rdg-header-row")[0].children;
    if (Math.sign(fromTop) === -1) {
      fromTop = 0;
    }
    for (const header of headers) {
      header.style.insetBlockStart = fromTop + "%";
    }
  }
};

const ScrollBox = ({ outerRef, gridRef, children }) => {
  return (
    <div
      ref={outerRef}
      className="overflow-auto height-350 subtle-shadow"
      onScroll={(e) => emulateGridScroll(e.target, gridRef.current.element)}
    >
      {children}
    </div>
  );
};
const Overflow = ({
  rows,
  columns,
  groupBy,
  gridRef,
  outerRef,
  children,
  expandedGroupIds,
}) => {
  const width = "fit-content";
  const height = useMemo(
    () => getOverflowHeight(rows, groupBy, expandedGroupIds),
    [rows, groupBy, expandedGroupIds]
  );

  useEffect(() => {
    emulateGridScroll(outerRef.current, gridRef.current.element);
  }, [height, columns, outerRef, gridRef]);

  return <div style={{ width, height }}>{children}</div>;
};

const Grid = ({ rows, columns }) => {
  const gridRef = useRef();
  const outerRef = useRef();
  const groupBy = useMemo(() => getGroupBy(columns), [columns]);
  const [expandedGroupIds, onExpandedGroupIdsChange] = useState(new Set());

  useEffect(() => {
    if (groupBy.length < 2) {
      onExpandedGroupIdsChange(new Set());
    }
  }, [groupBy]);

  return (
    <ScrollBox {...{ gridRef, outerRef }}>
      {rows.length > 0 && columns.length > 0 && (
        <Overflow
          {...{
            rows,
            columns,
            groupBy,
            gridRef,
            outerRef,
            expandedGroupIds,
          }}
        >
          <DataGrid
            {...{
              rows,
              columns,
              groupBy,
              rowGrouper,
              ref: gridRef,
              expandedGroupIds,
              key: Math.random(),
              className: "overflow-hidden sticky-top-container",
              onSortColumnsChange: (column) =>
                expandAll(column, rows, groupBy, onExpandedGroupIdsChange),
              onExpandedGroupIdsChange: (set) =>
                filterLastColumnGroups(set, groupBy, onExpandedGroupIdsChange),
            }}
          />
        </Overflow>
      )}
    </ScrollBox>
  );
};
export const MemoizedGrid = memo(Grid);

// componentize grid file
// autosizer with width fit content
// institutions dropdown
