import { useRef, useState, useLayoutEffect } from "react";

export const useDimensions = () => {
  const ref = useRef();
  const element = ref.current;
  const [dimensions, setDimensions] = useState({});
  useLayoutEffect(() => {
    setDimensions(ref.current.getBoundingClientRect().toJSON());
  }, [element]);
  return [ref, dimensions];
};
