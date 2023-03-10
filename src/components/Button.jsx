import styled from "styled-components";
import { getButtonPalette } from "../js/color-functions";
import { useMemo } from "react";

const Btn = styled.button(
  ({
    bsBtnColor,
    bsBtnHoverColor,
    bsBtnActiveColor,
    bsBtnDisabledColor,
    bsBtnBg,
    bsBtnDisabledBg,
    bsBtnBorderColor,
    bsBtnDisabledBorderColor,
    bsBtnFocusShadowRgb,
    bsBtnHoverBg,
    bsBtnActiveBg,
    bsBtnHoverBorderColor,
    bsBtnActiveBorderColor,
    bsBtnBgRgb,
    outline,
  }) => `
    --bs-btn-color: ${outline ? bsBtnBg : bsBtnColor};
    ${!outline ? "--bs-btn-bg: " + bsBtnBg + ";" : ""}
    --bs-btn-border-color: ${outline ? bsBtnBg : bsBtnBorderColor};
    --bs-btn-hover-color: ${outline ? bsBtnColor : bsBtnHoverColor};
    --bs-btn-hover-bg: ${outline ? bsBtnBg : bsBtnHoverBg};
    --bs-btn-hover-border-color: ${outline ? bsBtnBg : bsBtnHoverBorderColor};
    --bs-btn-focus-shadow-rgb: ${outline ? bsBtnBgRgb : bsBtnFocusShadowRgb};
    --bs-btn-active-color: ${outline ? bsBtnColor : bsBtnActiveColor};
    --bs-btn-active-bg: ${outline ? bsBtnBg : bsBtnActiveBg};
    --bs-btn-active-border-color: ${outline ? bsBtnBg : bsBtnActiveBorderColor};
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: ${outline ? bsBtnBg : bsBtnDisabledColor};
    --bs-btn-disabled-bg: ${outline ? "transparent" : bsBtnDisabledBg};
    --bs-btn-disabled-border-color: ${
      outline ? bsBtnBg : bsBtnDisabledBorderColor
    };
    ${outline ? "--bs-gradient: none;" : ""}
`
);

/*
.btn-outline-primary {
    --bs-btn-color: {bsBtnBg};
    !outline && --bs-btn-bg: ...
    --bs-btn-border-color: {bsBtnBg};
    --bs-btn-hover-color: {bsBtnColor};
    --bs-btn-hover-bg: {bsBtnBg};
    --bs-btn-hover-border-color: {bsBtnBg};
    --bs-btn-focus-shadow-rgb: {hexToRgb(bsBtnBg)};
    --bs-btn-active-color: {bsBtnColor};
    --bs-btn-active-bg: {bsBtnBg};
    --bs-btn-active-border-color: {bsBtnBg};
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: {bsBtnBg};
    --bs-btn-disabled-bg: (outline ? transparent : ...);
    --bs-btn-disabled-border-color: {bsBtnBg};
    outline && --bs-gradient: none;
}
*/

export const Button = (props) => {
  const palette = useMemo(
    () => getButtonPalette(props.backgroundColor),
    [props.backgroundColor]
  );

  return (
    <>
      <Btn {...props} {...palette} />
    </>
  );
};
