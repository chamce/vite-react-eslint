import { Table } from "../inactive/Table";

export const Practice = () => {
  return (
    <div className="d-flex flex-column gap-5">
      <Table dataLocation={"./data/testing.json"} groupBy={["gender"]} />
    </div>
  );
};

// rows, columns, groupBy, toggle row number
