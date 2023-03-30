import "../../style.css";
import { useRef } from "react";
import { Header } from "./Header";
import { Center } from "./Center";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { ColorPicker } from "./ColorPicker";

function App({ heading, dashboard, department }) {
  const footerRef = useRef();

  return (
    <>
      <Header
        colorPicker={<ColorPicker footerRef={footerRef} />}
        searchBar={<SearchBar />}
        department={department}
      />
      <div className="container">
        <div className="row">
          <div className="col-12 col-xxl-10 offset-xxl-1 dash-shadow bg-white border">
            <Center heading={heading} children={dashboard} />
          </div>
        </div>
      </div>
      <Footer footerRef={footerRef} />
    </>
  );
}

export default App;
