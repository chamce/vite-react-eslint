import {
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useDeferredValue,
} from "react";
import { PerformanceModel } from "../js/performance-model";
import { json } from "d3";
import { Grid } from "./Grid";

const addCommasToNum = (n) => {
  return n.toLocaleString("en-US");
};
const arraysEqual = (arrayA, arrayB, orderMatters) => {
  const a = [...arrayA];
  const b = [...arrayB];
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  if (!orderMatters) {
    a.sort();
    b.sort();
  }

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
const numDropFormat = (key) => {
  return toTitleCase(key)
    .split(" ")
    .filter((key) => key !== "Model" && key !== "New" && key !== "Money")
    .join(" ");
};
const toTitleCase = (string) => {
  return string
    .replace("+", "")
    .replaceAll("_", " ")
    .trim()
    .split(" ")
    .map((s) => s[0]?.toUpperCase() + s.substring(1)?.toLowerCase())
    .join(" ");
};
const getColumns = (model) => {
  const numCols = [
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
  ];
  const defNumCols = [
    "+ Model Addition to Base",
    "+ Model New Money Contribution",
    "+ Adjusted Model Base",
    "+ Adjusted Model Total Base",
    "+ Adjusted Model New Money Share",
  ];
  const defStrCols = ["Institution"];
  let allCols = {};
  Object.keys(model).forEach((measure) => {
    Object.keys(model[measure]).forEach((school) => {
      const object = model[measure][school];
      allCols = { ...allCols, ...object };
    });
  });
  const strCols = Object.keys(allCols).filter(
    (key) => typeof allCols[key] === "string"
  );
  const foundNumCols = Object.keys(allCols).filter(
    (key) => typeof allCols[key] !== "string"
  );
  const intersectArrays = (a, b) => [
    ...new Set(a.filter((element) => b.includes(element))),
  ];
  const titleCaseSort = (arr, formatter) =>
    arr.sort((a, b) => formatter(a).localeCompare(formatter(b)));
  const str = {
    all: titleCaseSort(strCols, toTitleCase),
    def: titleCaseSort(defStrCols, toTitleCase),
  };
  const num = {
    all: titleCaseSort(intersectArrays(numCols, foundNumCols), numDropFormat),
    def: titleCaseSort(
      intersectArrays(defNumCols, foundNumCols),
      numDropFormat
    ),
  };
  return { str, num };
};
const useColumnDropdowns = () => {
  const [state, setState] = useState(null);
  const cols = useMemo(() => state && getColumns(state.model), [state]);
  const [strings, setStrings] = useState(null);
  const [numbers, setNumbers] = useState(null);

  useEffect(() => {
    Promise.all(
      [
        "institutions",
        "allocation_dollars",
        "base_dollars",
        "weights",
        "data",
      ].map((name) => json("./data/" + name + ".json"))
    ).then((data) => {
      const performanceModel = new PerformanceModel(...data, 0);
      performanceModel.buildModel("2022-23");
      setState(performanceModel);
    });
  }, []);
  useEffect(() => {
    cols && setStrings([...cols.str.def]);
    cols && setNumbers([...cols.num.def]);
  }, [cols]);

  return [
    {
      strDropName: "Non-Numeric Columns",
      strDrop: strings,
      setStrDrop: setStrings,
      strCols: cols && cols.str.all,
      defStrCols: cols && cols.str.def,
    },
    {
      numDropName: "Numeric Columns",
      numDrop: numbers,
      setNumDrop: setNumbers,
      numCols: cols && cols.num.all,
      defNumCols: cols && cols.num.def,
    },
  ];
};
const useInstitutions = (location) => {
  const [institutions, setInst] = useState(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    json(location).then((data) => setInst(Object.keys(data)));
  }, [location]);
  useEffect(() => {
    institutions && setState([...institutions]);
  }, [institutions]);

  return [institutions, state, setState];
};
const deleteInst = (object, lookup) => {
  Object.keys(object).forEach((item) => {
    if (!lookup[item]) {
      delete object[item];
    }
  });
};
const removeInst = (data, institutions, a, b, c) => {
  const lookup = {};
  institutions?.forEach((item) => {
    lookup[item] = true;
  });
  deleteInst(data[a], lookup);
  Object.keys(data[b]).forEach((key) => {
    deleteInst(data[b][key], lookup);
  });
  Object.keys(data[c]).forEach((key) => {
    deleteInst(data[c][key], lookup);
  });
};
const usePerformanceModel = (institutions) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    institutions &&
      Promise.all(
        [
          "institutions",
          "allocation_dollars",
          "base_dollars",
          "weights",
          "data",
        ].map((name) => json("./data/" + name + ".json"))
      ).then((data) => {
        if (institutions.length) {
          removeInst(data, institutions, 0, 1, 4);
          const perfModel = new PerformanceModel(...data, 0);
          perfModel.buildModel("2022-23");
          setState(perfModel);
        } else {
          setState(null);
        }
      });
  }, [institutions]);

  return state && state.model;
};
const updateDropdown = (setSelections, item) => {
  setSelections((array) => {
    array = [...array];
    if (Array.isArray(item)) {
      if (array.length === item.length) {
        array = [];
      } else {
        const lookup = {};
        array.forEach((e) => {
          lookup[e] = true;
        });
        item.forEach((e) => {
          if (!lookup[e]) {
            array.push(e);
          }
        });
      }
    } else {
      let index = array.indexOf(item);
      if (index === -1) {
        array.push(item);
      } else {
        const end = array.length - 1;
        while (index < end) {
          array[index] = array[++index];
        }
        array.pop();
      }
    }
    return array;
  });
};
const getGridRows = (model) => {
  const rows = [];
  if (model) {
    Object.keys(model).forEach((measure) => {
      Object.keys(model[measure]).forEach((school) => {
        const object = model[measure][school];
        rows.push(object);
      });
    });
  }
  return rows;
};
const getGridColumns = (strDrop, numDrop) => {
  const columns =
    strDrop && numDrop
      ? [
          ...strDrop.map((key) => ({
            key,
            name: toTitleCase(key),
            resizable: true,
            expectedType: "string",
            sortable: true,
          })),
          ...numDrop.map((key) => ({
            key,
            name: numDropFormat(key),
            resizable: true,
            formatter: ({ row, column, isCellSelected, onRowChange }) =>
              addCommasToNum(row[column.key]),
            expectedType: "number",
            groupFormatter: ({
              childRows,
              column,
              groupKey,
              isCellSelected,
              isExpanded,
              row,
              toggleGroup,
            }) =>
              addCommasToNum(
                childRows.reduce((prev, row) => prev + row[column.key], 0)
              ),
          })),
        ]
      : [];
  return columns;
};
const DropdownItem = memo(
  ({ setSelections, item, condition, formatter, showIndexes, superscript }) => {
    const checkbox = condition ? (
      <i className="bi bi-square"></i>
    ) : (
      <i className="bi bi-check-square-fill text-primary"></i>
    );
    const sup = showIndexes ? (
      <sup className={condition ? "opacity-0" : "opacity-75"}>
        {superscript}
      </sup>
    ) : null;
    const name = Array.isArray(item)
      ? "All"
      : formatter
      ? formatter(item)
      : item;

    return (
      <>
        <li onClick={() => updateDropdown(setSelections, item)}>
          <button
            className="dropdown-item d-flex align-items-center"
            type="button"
          >
            {checkbox}
            <span className="px-2 me-auto">{name}</span>
            {sup}
          </button>
        </li>
      </>
    );
  }
);
const Dropdown = memo(
  ({
    name,
    options,
    selections,
    setSelections,
    defaultSelections,
    formatter,
    showIndexes,
  }) => {
    const buttonRef = useRef();
    const updateCondition =
      selections &&
      defaultSelections &&
      !arraysEqual(selections, defaultSelections, showIndexes);

    return (
      <div className="btn-group col">
        <button
          ref={buttonRef}
          onClick={(e) =>
            e.target.id === "update-icon" && buttonRef.current.click()
          }
          className="btn btn-lg btn-light border-dark three-d-btn dropdown-toggle position-relative"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span>{name}</span>
          <span
            id="update-icon"
            style={
              updateCondition
                ? { opacity: 1 }
                : { opacity: 0, pointerEvents: "none" }
            }
            onClick={() => setSelections([...defaultSelections])}
            className="update-icon z-3 position-absolute top-0 start-100 translate-middle p-2 bg-danger rounded-circle"
          >
            <span className="visually-hidden">New alerts</span>
          </span>
        </button>
        {options && selections && (
          <ul onClick={(e) => e.stopPropagation()} className="dropdown-menu">
            <DropdownItem
              item={options}
              setSelections={setSelections}
              condition={options.length !== selections.length}
            />
            {options.map((item) => {
              const index = selections.indexOf(item);
              const condition = index === -1;
              const superscript = showIndexes ? index + 1 : null;

              return (
                <DropdownItem
                  key={item}
                  item={item}
                  formatter={formatter}
                  condition={condition}
                  superscript={superscript}
                  showIndexes={showIndexes}
                  setSelections={setSelections}
                />
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);

export const Dashboard = () => {
  const [allInst, inst, setInst] = useInstitutions("./data/institutions.json");
  const [
    { strCols, strDrop, setStrDrop, strDropName, defStrCols },
    { numCols, numDrop, setNumDrop, numDropName, defNumCols },
  ] = useColumnDropdowns();
  const deferredInst = useDeferredValue(inst);
  const deferredStrDrop = useDeferredValue(strDrop);
  const deferredNumDrop = useDeferredValue(numDrop);
  const model = usePerformanceModel(deferredInst);
  const rows = useMemo(() => getGridRows(model), [model]);
  const columns = useMemo(
    () => getGridColumns(deferredStrDrop, deferredNumDrop),
    [deferredStrDrop, deferredNumDrop]
  );
  const grid = useMemo(() => <Grid {...{ rows, columns }} />, [rows, columns]);

  return (
    <>
      <div className="d-flex flex-column gap-4">
        <div className="d-flex flex-wrap gap-3">
          <Dropdown
            name={"Institutions"}
            options={allInst}
            selections={inst}
            setSelections={setInst}
            defaultSelections={allInst}
          ></Dropdown>
          <Dropdown
            name={strDropName}
            options={strCols}
            selections={strDrop}
            setSelections={setStrDrop}
            defaultSelections={defStrCols}
            formatter={toTitleCase}
            showIndexes
          ></Dropdown>
          <Dropdown
            name={numDropName}
            options={numCols}
            selections={numDrop}
            setSelections={setNumDrop}
            defaultSelections={defNumCols}
            formatter={numDropFormat}
            showIndexes
          ></Dropdown>
        </div>
        {grid}
      </div>
    </>
  );
};
