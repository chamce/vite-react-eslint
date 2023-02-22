import "../App.css";
import { useRef } from "react";
import { Header } from "./Header";
import { Center } from "./Center";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { ColorPicker } from "./ColorPicker";

function App({ heading, dashboard, department }) {
  const footerRef = useRef();
  const searchBar = <SearchBar />;
  const footer = <Footer footerRef={footerRef} />;
  const colorPicker = <ColorPicker footerRef={footerRef} />;
  const center = <Center heading={heading} children={dashboard} />;
  const header = (
    <Header
      colorPicker={colorPicker}
      department={department}
      searchBar={searchBar}
    />
  );

  return (
    <>
      {header}
      <div className="container">
        <div className="row">
          <div className="col-12 col-xxl-10 offset-xxl-1 dash-shadow bg-light border">
            {center}
          </div>
        </div>
      </div>
      {footer}
    </>
  );
}

export default App;
