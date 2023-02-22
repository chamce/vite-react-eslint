import { useState } from "react";

export const Dashboard = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center">
      <button
        onClick={() => setCount((n) => n + 1)}
        className="btn btn-light three-d-btn border-secondary"
        type="button"
      >
        {count}
      </button>
    </div>
  );
};
