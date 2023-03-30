import { useJson } from "../../hooks/useJson";
import { MemoizedBetterGrid } from "./BetterGrid";
import { useGridProps } from "../../hooks/useGridProps";

export const TestDash = ({ location }) => {
  const data = useJson(location);
  const gridProps = useGridProps(data);

  return <MemoizedBetterGrid {...gridProps} />;
};
