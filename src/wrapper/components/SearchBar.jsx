import { useClickOutsideCondensed } from "../hooks/useClickOutside";

const submitSearch = (e) => {
  e.preventDefault();
  const query = e.target[0];
  const web = e.target[1];
  const domain = web.checked
    ? "https://www.eku.edu/search.html?q="
    : "https://tools.eku.edu/people-search?search_by=f&advanced=1&search=Search&area=&search_name=";
  const location = domain + query.value;
  window.open(location, "_blank");
};

export const SearchBar = () => {
  const [isOpen, open, insideRef] = useClickOutsideCondensed();

  return (
    <>
      <form
        ref={insideRef}
        onSubmit={submitSearch}
        className="ms-lg-3 d-flex position-relative"
        role="search"
      >
        <input
          autoComplete="off"
          onClick={open}
          className="form-control header-search fs-5"
          type="search"
          placeholder="Search Eastern"
          aria-label="Search"
        />
        <div className={"radio-popover w-100" + (isOpen ? "" : " d-none")}>
          <ul className="list-group">
            <li className="list-group-item">
              <input
                className="form-check-input me-1"
                type="radio"
                name="listGroupRadio"
                value="web"
                id="firstRadio"
                defaultChecked
              />
              <label
                className="form-check-label stretched-link"
                htmlFor="firstRadio"
              >
                Web
              </label>
            </li>
            <li className="list-group-item">
              <input
                className="form-check-input me-1"
                type="radio"
                name="listGroupRadio"
                value="radio"
                id="secondRadio"
              />
              <label
                className="form-check-label stretched-link"
                htmlFor="secondRadio"
              >
                People
              </label>
            </li>
          </ul>
        </div>
      </form>
    </>
  );
};
