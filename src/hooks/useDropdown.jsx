import { useDeferredValue, useState } from "react";

export const useDropdown = ({
  list,
  title,
  initial,
  formatter,
  orderMatters = true,
}) => {
  const [active, setActive] = useState([]);
  const deferredActive = useDeferredValue(active);

  return [
    {
      list,
      title,
      active,
      initial,
      formatter,
      setActive,
      orderMatters,
    },
    deferredActive,
  ];
};
