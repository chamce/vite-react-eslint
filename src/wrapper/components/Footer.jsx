export const Footer = ({ footerRef }) => {
  return (
    <>
      <div ref={footerRef} className="container">
        <div className="row">
          <div className="col-12 col-xxl-10 offset-xxl-1">
            <footer className="py-3 my-3 my-xl-4">
              <ul
                className={
                  "nav justify-content-center border-bottom border-opacity-50 pb-3 mb-3 eastern-links"
                }
              >
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="https://equity.eku.edu/equal-opportunityaffirmative-action-statement"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      EO/AA Statement
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="https://adaccess.eku.edu/accessibility-and-disability-compliance"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Accessibility
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="https://www.eku.edu/eku-privacy-statement/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Statement
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="https://form.asana.com/?k=I67xQySiqf7J19FAstuZ_A&d=28839040002083"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website Feedback
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="https://www.google.com/maps/dir//Eastern+Kentucky+University,+Lancaster+Ave,+Richmond,+KY/@37.7353841,-84.3336913,13z"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      521 Lancaster Ave. Richmond, KY 40475
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="nav-link px-2">
                    <a
                      className={"footer-link"}
                      href="tel:8596221000"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      859-622-1000
                    </a>
                  </div>
                </li>
              </ul>
              <p className={"text-center text-opacity-75 eastern-copyright"}>
                © 2023 Eastern Kentucky University. All Rights Reserved.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};
