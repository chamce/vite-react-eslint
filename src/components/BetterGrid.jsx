import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { groupBy as rowGrouper } from "lodash";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const Outer = ({ outerRef, children, emulateGridScroll }) => {
  return (
    <div
      ref={outerRef}
      onScroll={(e) => emulateGridScroll(e.target)}
      className="overflow-auto height-350 subtle-shadow"
    >
      {children}
    </div>
  );
};
const Inner = ({
  rows,
  groupBy,
  gridRef,
  outerRef,
  children,
  expandedGroupIds,
  emulateGridScroll,
}) => {
  const innerRef = useRef();
  const groupGrid = useCallback(() => {
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
    const end = groupBy.length - 1;
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
    const grid = Object.keys(outer).length ? outer : rows;
    const total = Object.keys(outer).length ? count.total : rows?.length;
    return { grid, total };
  }, [rows, groupBy, expandedGroupIds]);
  const gridWidth = gridRef.current?.element.offsetWidth;
  const numberOfRows = useMemo(() => (groupGrid().total + 1) * 35, [groupGrid]);

  useEffect(() => {
    if (gridWidth) {
      innerRef.current.classList.add("width-fit-content");
    }
  }, [gridWidth]);
  useEffect(() => {
    emulateGridScroll(outerRef.current);
  }, [numberOfRows, outerRef, emulateGridScroll]);

  return (
    <div ref={innerRef} style={{ height: numberOfRows }}>
      {children}
    </div>
  );
};
const Grid = ({
  rows,
  groupBy,
  gridRef,
  columnFilter,
  nameFormatter,
  expandedGroupIds,
  onExpandedGroupIdsChange,
}) => {
  const expandAll = useCallback(
    (endColumn) => {
      const sameEntries = (x, y) =>
        x.size === y.size && [...x].every((item) => y.has(item));
      const endColumnIndex = groupBy.indexOf(endColumn[0].columnKey);
      onExpandedGroupIdsChange((set) => {
        const groupsToBeAdded = new Set();
        rows.forEach((row) => {
          groupBy.slice(0, endColumnIndex + 1).forEach((key, i) => {
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
        const end = groupBy.length - 1;
        if (!sameEntries(set, groupsToBeAdded) && endColumnIndex !== end) {
          return groupsToBeAdded;
        } else {
          return new Set(
            [...groupsToBeAdded].filter(
              (group) => group.split("__").length - 1 !== endColumnIndex
            )
          );
        }
      });
    },
    [rows, groupBy, onExpandedGroupIdsChange]
  );
  const getColumns = useCallback(() => {
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
          sortable: groupBy.indexOf(key) !== -1,
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
  }, [rows, groupBy, nameFormatter]);
  const filterLastColumnGroups = useCallback(
    (set) => {
      onExpandedGroupIdsChange(
        new Set(
          [...set].filter(
            (group) => group.split("__").length - 1 !== groupBy.length - 1
          )
        )
      );
    },
    [groupBy, onExpandedGroupIdsChange]
  );
  const columns = useMemo(
    () => (columnFilter ? getColumns().filter(columnFilter) : getColumns()),
    [getColumns, columnFilter]
  );

  return (
    <DataGrid
      className="overflow-hidden sticky-top-container"
      {...{
        rows,
        columns,
        groupBy,
        rowGrouper,
        ref: gridRef,
        expandedGroupIds,
        onSortColumnsChange: expandAll,
        onExpandedGroupIdsChange: filterLastColumnGroups,
      }}
    />
  );
};

export const BetterGrid = ({ rows, columnFilter, nameFormatter }) => {
  const gridRef = useRef();
  const outerRef = useRef();
  const [expandedGroupIds, onExpandedGroupIdsChange] = useState(new Set());
  const emulateGridScroll = useCallback((outerElement) => {
    if (outerElement && gridRef.current) {
      const max = outerElement.scrollHeight - outerElement.offsetHeight;
      const current = outerElement.scrollTop;
      gridRef.current.element.scrollTop = current;
      const difference = current - max;
      let fromTop = (difference / 350) * 100;
      const headers =
        gridRef.current.element.getElementsByClassName("rdg-header-row")[0]
          .children;
      if (Math.sign(fromTop) === -1) {
        fromTop = 0;
      }
      for (const header of headers) {
        header.style.insetBlockStart = fromTop + "%";
      }
    }
  }, []);
  const groupBy = useMemo(() => {
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
  }, [rows]);

  return (
    <Outer {...{ outerRef, emulateGridScroll }}>
      <Inner
        {...{
          rows,
          gridRef,
          groupBy,
          outerRef,
          expandedGroupIds,
          emulateGridScroll,
        }}
      >
        <Grid
          {...{
            rows,
            gridRef,
            groupBy,
            columnFilter,
            nameFormatter,
            expandedGroupIds,
            onExpandedGroupIdsChange,
          }}
        />
      </Inner>
    </Outer>
  );
};

// if you scroll all the way down window containing grid, scrollbar consumes some height of this window
// with inset-block-start and position sticky, grid is positioned at top of this window
// however, when scrollbar begins to consume some of the window's height, the grid shifts upwards
// the shift is equivalent to the size of the scrollbar (or how much of the scrollbar you have scrolled into the window)
// emualte grid scroll function contains code to re-shift the header back into place
// this code is handled by finding the max scroll top and then finding how much distance you gone beyond the max scroll top
// this distance is how much of the scrollbar has entered the window (would work with any browser's scrollbar then)
// emulate grid scroll is called on scroll of window and after number of rows updates
// in case number of rows doesn't update when manually changing expanded groups (is this even possible?), I don't think useeffect would be run
// however, I don't think function would even need to run in this case
