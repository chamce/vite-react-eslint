import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { getTextColor } from "../../js/color-functions";
import { useClickOutsideCondensed } from "../hooks/useClickOutside";

const useBodyBgColor = (footerRef) => {
  const [color, setColor] = useState(
    window.localStorage.getItem("color")
      ? window.localStorage.getItem("color")
      : "#cfe2ff"
  );
  const contrast = getTextColor(color).name;

  useEffect(() => {
    window.localStorage.setItem("color", color);
    document.body.style.backgroundColor = color;
  }, [color]);
  useEffect(() => {
    if (footerRef.current) {
      footerRef.current.className = "container footer-container-" + contrast;
    }
  }, [contrast, footerRef]);

  return [color, setColor];
};

export const ColorPicker = ({ footerRef }) => {
  const [color, onChange] = useBodyBgColor(footerRef);
  const [isOpen, open, popover] = useClickOutsideCondensed();

  return (
    <div className="picker">
      <div
        className="swatch"
        style={{ backgroundColor: color }}
        onClick={open}
      />

      {isOpen && (
        <div className="popover" ref={popover}>
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
