import { usePerformanceRows } from "../../hooks/usePerformanceRows";
import { usePerformanceColumns } from "../../hooks/usePerformanceColumns";
import { MemoizedDropdown } from "./Dropdown";
import { MemoizedGrid } from "./Grid";
import { useEffect, useState } from "react";
import { json } from "d3";
import { useDropdown } from "../../hooks/useDropdown";

const Wrapper = ({ gap = 4, children }) => {
  return <div className={"d-flex flex-column gap-" + gap}>{children}</div>;
};
const Dropdowns = ({ gap = 3, children }) => {
  return <div className={"d-flex flex-wrap gap-" + gap}>{children}</div>;
};

const useInstitutions = () => {
  const [state, setState] = useState([]);
  const [institutionsDropdownProps, activeInstitutions] = useDropdown({
    title: "Institutions",
    orderMatters: false,
    list: state,
  });

  useEffect(() => {
    json("./data/institutions.json").then((data) => {
      setState(Object.keys(data));
    });
  }, []);

  return [institutionsDropdownProps, activeInstitutions];
};

export const Dashboard = () => {
  const [institutionsDropdownProps, activeInstitutions] = useInstitutions();
  const rows = usePerformanceRows();
  const { updatedColumns, nonNumDropdownProps, numDropdownProps } =
    usePerformanceColumns(rows);

  return (
    <Wrapper>
      <Dropdowns>
        <MemoizedDropdown {...institutionsDropdownProps} />
        <MemoizedDropdown {...nonNumDropdownProps} />
        <MemoizedDropdown {...numDropdownProps} />
      </Dropdowns>
      {<MemoizedGrid {...{ rows, columns: updatedColumns }} />}
    </Wrapper>
  );
};
