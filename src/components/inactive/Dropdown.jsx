import { useEffect, useMemo, useRef, memo } from "react";

const filterInitial = (initial, sorted) => {
  return Array.isArray(initial)
    ? initial.filter((item) => sorted.indexOf(item) > -1)
    : sorted;
};
const checkIfInitial = (active, filteredInitial, orderMatters) => {
  const a = active;
  const b = filteredInitial;
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const sortedA = orderMatters ? a : [...a].sort();
  const sortedB = orderMatters ? b : [...b].sort();

  for (let i = 0; i < sortedA.length; ++i) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
};
const doubleClickIfIcon = (e, buttonRef, iconId) => {
  if (e.target.id === iconId) {
    buttonRef.current.click();
  }
};
const clickDropdownItem = (isAll, setActive, included, sorted, index, item) => {
  return isAll
    ? setActive((active) => {
        let array = [];
        if (!included) {
          array = [...active];
          for (const item of sorted) {
            if (!(array.indexOf(item) > -1)) {
              array.push(item);
            }
          }
        }
        return array;
      })
    : setActive((active) => {
        const array = [...active];
        if (included) {
          array.splice(index, 1);
        } else {
          array.push(item);
        }
        return array;
      });
};
const checkFormatter = (formatter) => {
  return typeof formatter === "function" ? formatter : (item) => item;
};
const getSorted = (list, formatName) => {
  return [...list].sort((a, b) => formatName(a).localeCompare(formatName(b)));
};

const Wrapper = ({ children }) => {
  return <div className="btn-group col">{children}</div>;
};
const DropdownButton = ({
  active,
  sorted,
  initial,
  children,
  setActive,
  orderMatters,
}) => {
  const buttonRef = useRef();
  const iconId = "update-icon";
  const filteredInitial = useMemo(
    () => filterInitial(initial, sorted),
    [initial, sorted]
  );
  const isInitial = useMemo(
    () => checkIfInitial(active, filteredInitial, orderMatters),
    [active, filteredInitial, orderMatters]
  );

  useEffect(() => {
    setActive(filteredInitial);
  }, [setActive, filteredInitial]);

  return (
    <button
      ref={buttonRef}
      onClick={(e) => doubleClickIfIcon(e, buttonRef, iconId)}
      className="btn btn-lg btn-light three-d-btn dropdown-toggle position-relative"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      {children}
      <span
        id="update-icon"
        style={
          isInitial ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 }
        }
        onClick={() => setActive([...filteredInitial])}
        className="position-absolute top-0 start-100 translate-middle p-2 bg-danger rounded-circle opacity-transition subtle-shadow"
      >
        <span className="visually-hidden">Updated</span>
      </span>
    </button>
  );
};
const DropdownMenu = ({ children }) => {
  return (
    <ul
      onClick={(e) => e.stopPropagation()}
      className="dropdown-menu subtle-shadow border-light"
    >
      {children}
    </ul>
  );
};
const DropdownItem = ({
  item,
  index,
  sorted,
  included,
  children,
  setActive,
  orderMatters,
}) => {
  const isAll = sorted !== undefined;
  const showSuperscript = orderMatters && included && !isAll;

  return (
    <li
      onClick={() =>
        clickDropdownItem(isAll, setActive, included, sorted, index, item)
      }
    >
      <button className="dropdown-item d-flex align-items-center" type="button">
        {included ? (
          <i className="bi bi-check-square-fill d-flex text-primary" />
        ) : (
          <i className="bi bi-square d-flex" />
        )}
        <span className="px-2">{children}</span>
        {showSuperscript ? <sup className="ms-auto">{index + 1}</sup> : null}
      </button>
    </li>
  );
};
const MemoizedDropdownItem = memo(DropdownItem);

const Dropdown = ({
  list,
  title,
  active,
  initial,
  formatter,
  setActive,
  orderMatters,
}) => {
  const formatName = useMemo(() => checkFormatter(formatter), [formatter]);
  const sorted = useMemo(() => getSorted(list, formatName), [list, formatName]);
  const isAllSelected = sorted.length === active.length;

  return (
    <>
      <Wrapper>
        <DropdownButton
          {...{ initial, sorted, active, setActive, orderMatters }}
        >
          {title}
        </DropdownButton>
        <DropdownMenu>
          <MemoizedDropdownItem
            {...{ sorted, included: isAllSelected, setActive, orderMatters }}
          >
            All
          </MemoizedDropdownItem>
          {sorted.map((item) => {
            const index = active.indexOf(item);
            const included = index > -1;

            return (
              <MemoizedDropdownItem
                {...{
                  key: item,
                  item,
                  index,
                  included,
                  setActive,
                  orderMatters,
                }}
              >
                {formatName(item)}
              </MemoizedDropdownItem>
            );
          })}
        </DropdownMenu>
      </Wrapper>
    </>
  );
};
export const MemoizedDropdown = memo(Dropdown);
