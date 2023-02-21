import "./App.css";
import { useRef } from "react";
import { Header } from "./Wrapper/Header";
import { Center } from "./Wrapper/Center";
import { Footer } from "./Wrapper/Footer";
import { SearchBar } from "./Wrapper/SearchBar";
import { ColorPicker } from "./Wrapper/ColorPicker";

function App({ heading, dashboard }) {
  const footerRef = useRef();
  const searchBar = <SearchBar />;
  const footer = <Footer footerRef={footerRef} />;
  const colorPicker = <ColorPicker footerRef={footerRef} />;
  const center = <Center heading={heading} children={dashboard} />;
  const header = <Header colorPicker={colorPicker} searchBar={searchBar} />;

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
