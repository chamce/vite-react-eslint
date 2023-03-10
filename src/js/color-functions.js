const pSBC = (p, c0, c1, l) => {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    m = Math.round,
    a = typeof c1 == "string";
  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 !== "string" ||
    (c0[0] !== "r" && c0[0] !== "#") ||
    (c1 && !a)
  )
    return null;
  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 === "c" ? !h : false) : h;
  f = pSBC.pSBCr(c0);
  P = p < 0;
  t =
    c1 && c1 !== "c"
      ? pSBC.pSBCr(c1)
      : P
      ? { r: 0, g: 0, b: 0, a: -1 }
      : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;
  if (l) {
    r = m(P * f.r + p * t.r);
    g = m(P * f.g + p * t.g);
    b = m(P * f.b + p * t.b);
  } else {
    r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5);
    g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5);
    b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
  }
  a = f.a;
  t = t.a;
  f = a >= 0 || t >= 0;
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
  if (h)
    return (
      "rgb" +
      (f ? "a(" : "(") +
      r +
      "," +
      g +
      "," +
      b +
      (f ? "," + m(a * 1000) / 1000 : "") +
      ")"
    );
  else
    return (
      "#" +
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
        .toString(16)
        .slice(1, f ? undefined : -2)
    );
};
pSBC.pSBCr = (d) => {
  const i = parseInt;
  let n = d.length,
    x = {};
  if (n > 9) {
    const [r, g, b, a] = (d = d.split(","));
    n = d.length;
    if (n < 3 || n > 4) return null;
    x.r = i(r[3] === "a" ? r.slice(5) : r.slice(4));
    x.g = i(g);
    x.b = i(b);
    x.a = a ? parseFloat(a) : -1;
  } else {
    if (n === 8 || n === 6 || n < 4) return null;
    if (n < 6)
      d =
        "#" +
        d[1] +
        d[1] +
        d[2] +
        d[2] +
        d[3] +
        d[3] +
        (n > 4 ? d[4] + d[4] : "");
    d = i(d.slice(1), 16);
    if (n === 9 || n === 5) {
      x.r = (d >> 24) & 255;
      x.g = (d >> 16) & 255;
      x.b = (d >> 8) & 255;
      x.a = Math.round((d & 255) / 0.255) / 1000;
    } else {
      x.r = d >> 16;
      x.g = (d >> 8) & 255;
      x.b = d & 255;
      x.a = -1;
    }
  }
  return x;
};
const darken = (p, c) => {
  return pSBC(-p, c, false, true);
};
const lighten = (p, c) => {
  return pSBC(p, c, false, true);
};
const hexToRgb = (h) => {
  return h
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join();
};
const getBgCategory = (bg, cap, l, d) => {
  const lightContrast = Math.round(getContrast(bg, l) * 100) / 100;
  const darkContrast = Math.round(getContrast(bg, d) * 100) / 100;
  return lightContrast > darkContrast
    ? lightContrast > cap
      ? "very dark"
      : "dark"
    : darkContrast > cap
    ? "very light"
    : "light";
};
const setTextBlack = (p) => {
  p.bsBtnColor = "#000000";
  p.bsBtnHoverColor = "#000000";
  p.bsBtnActiveColor = "#000000";
  p.bsBtnDisabledColor = "#000000";
};
const setTextWhite = (p) => {
  p.bsBtnColor = "#ffffff";
  p.bsBtnHoverColor = "#ffffff";
  p.bsBtnActiveColor = "#ffffff";
  p.bsBtnDisabledColor = "#ffffff";
};
const setPalatteLightBg = (p, bg) => {
  // console.log(pSBC(0.2, bg, false, true), "#ffcd39")

  // ffc107
  p.bsBtnBg = bg;
  p.bsBtnDisabledBg = bg;
  p.bsBtnBorderColor = bg;
  p.bsBtnDisabledBorderColor = bg;
  // d9a406
  p.bsBtnFocusShadowRgb = hexToRgb(darken(0.15, bg));
  // ffc720
  p.bsBtnHoverBorderColor = lighten(0.1, bg);
  // ffc720
  p.bsBtnActiveBorderColor = lighten(0.1, bg);
  // ffca2c
  p.bsBtnHoverBg = lighten(0.15, bg);
  // ffcd39
  p.bsBtnActiveBg = lighten(0.2, bg);
};
const setPaletteDarkBg = (p, bg) => {
  // console.log(pSBC(-0.25, bg, false, true), "#0a53be")

  // 0d6efd
  p.bsBtnBg = bg;
  p.bsBtnDisabledBg = bg;
  p.bsBtnBorderColor = bg;
  p.bsBtnDisabledBorderColor = bg;
  // 3184fd
  p.bsBtnFocusShadowRgb = hexToRgb(lighten(0.15, bg));
  // 0b5ed7
  p.bsBtnHoverBg = darken(0.15, bg);
  // 0a58ca
  p.bsBtnActiveBg = darken(0.2, bg);
  // 0a58ca
  p.bsBtnHoverBorderColor = darken(0.2, bg);
  // 0a53be
  p.bsBtnActiveBorderColor = darken(0.25, bg);
};
const setPaletteVeryLightBg = (p, bg, i) => {
  // console.log(pSBC(-0.25, bg, false, true), "#babbbc")

  const x = i / 100;

  // f8f9fa
  p.bsBtnBg = bg;
  p.bsBtnDisabledBg = bg;
  p.bsBtnBorderColor = bg;
  p.bsBtnDisabledBorderColor = bg;
  // d3d4d5
  p.bsBtnFocusShadowRgb = hexToRgb(darken(Math.abs(0.15 - x), bg));
  // d3d4d5
  p.bsBtnHoverBg = darken(Math.abs(0.15 - x), bg);
  // c6c7c8
  p.bsBtnActiveBg = darken(Math.abs(0.2 - x), bg);
  // c6c7c8
  p.bsBtnHoverBorderColor = darken(Math.abs(0.2 - x), bg);
  // babbbc
  p.bsBtnActiveBorderColor = darken(Math.abs(0.25 - x), bg);
};
const setPaletteVeryDarkBg = (p, bg, i) => {
  // console.log(lighten(0.2, bg), "#4d5154")

  const x = i / 100;

  // 212529
  p.bsBtnBg = bg;
  p.bsBtnDisabledBg = bg;
  p.bsBtnBorderColor = bg;
  p.bsBtnDisabledBorderColor = bg;
  // 373b3e
  p.bsBtnHoverBorderColor = lighten(Math.abs(0.1 - x), bg);
  // 373b3e
  p.bsBtnActiveBorderColor = lighten(Math.abs(0.1 - x), bg);
  // 424649
  p.bsBtnFocusShadowRgb = hexToRgb(lighten(Math.abs(0.15 - x), bg));
  // 424649
  p.bsBtnHoverBg = lighten(Math.abs(0.15 - x), bg);
  // 4d5154
  p.bsBtnActiveBg = lighten(Math.abs(0.2 - x), bg);
};
const isPaletteUniform = (palette, category, cap, light, dark) => {
  const arr = category.split(" ");
  const origType = arr[arr.length - 1];
  const props = Object.keys(palette);
  if (props.length === 0) {
    return false;
  }
  let condition = true;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const propCategory = getBgCategory(palette[prop], cap, light, dark).split(
      " "
    );
    const propType = propCategory[propCategory.length - 1];
    if (propType !== origType) {
      condition = false;
      break;
    }
  }
  return condition;
};
export const getButtonPalette = (bg) => {
  const color = nameToHex(bg);
  const light = "#f8f9fa";
  const dark = "#212529";
  const cap = 10;
  const bgProps = {};
  const textProps = {};
  const category = getBgCategory(color, cap, light, dark);
  if (category.split(" ")[0] !== "very") {
    if (category === "light") {
      setTextBlack(textProps);
      setPalatteLightBg(bgProps, color);
    } else {
      setTextWhite(textProps);
      setPaletteDarkBg(bgProps, color);
    }
  } else {
    if (category === "very light") {
      let i = 0;
      setTextBlack(textProps);
      while (!isPaletteUniform(bgProps, category, cap, light, dark)) {
        setPaletteVeryLightBg(bgProps, color, i);
        i = i + 1;
      }
    } else {
      let i = 0;
      setTextWhite(textProps);
      while (!isPaletteUniform(bgProps, category, cap, light, dark)) {
        setPaletteVeryDarkBg(bgProps, color, i);
        i = i + 1;
      }
    }
  }
  const bsBtnBgRgb = hexToRgb(color);
  return { ...textProps, ...bgProps, bsBtnBgRgb };
};
const getRGB = (c) => {
  return parseInt(c, 16) || c;
};
const getsRGB = (c) => {
  return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
};
const getLuminance = (hexColor) => {
  return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
  );
};
const getContrast = (f, b) => {
  const L1 = getLuminance(f);
  const L2 = getLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};
export const getTextColor = (bgColor) => {
  const lightContrast = getContrast(bgColor, "#f8f9fa");
  const darkContrast = getContrast(bgColor, "#212529");

  return lightContrast > darkContrast
    ? { hex: "#f8f9fa", name: "light" }
    : { hex: "#212529", name: "dark" };
};
const nameToHex = (n) => {
  const bsMap = {
    primary: "#0d6efd",
    secondary: "#6c757d",
    success: "#198754",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#0dcaf0",
    light: "#f8f9fa",
    dark: "#212529",
  };
  if (bsMap[n]) {
    n = bsMap[n];
  }
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = n;
  return ctx.fillStyle;
};
