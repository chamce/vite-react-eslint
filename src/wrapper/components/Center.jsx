import * as portals from "react-reverse-portal";
import { useEventListener } from "../hooks/useEventListener";
import {
  useState,
  useMemo,
  cloneElement,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";

const resetScrollersByClassName = (
  containerRef,
  classNames,
  beforeModalOpen
) => {
  classNames.forEach((className) => {
    const scrollerCollection =
      containerRef.current.getElementsByClassName(className);
    for (let i = 0; i < scrollerCollection.length; i++) {
      const scroller = scrollerCollection[i];
      if (beforeModalOpen) {
        scroller.style.pointerEvents = "none";
        scroller.scrollTop = 0;
      } else {
        scroller.style.pointerEvents = "auto";
      }
    }
  });
};
const useFullscreenPortal = (children, heading) => {
  const scrollersRef = useRef({
    classNames: {},
  });
  const recordScroll = useCallback(
    (e) => {
      scrollersRef.current.classNames[e.target.className] = true;
    },
    [scrollersRef]
  );
  const dashboardRef = useRef();
  const fullscreenModalName = "fullscreenDashboard";
  const target = "#" + fullscreenModalName;
  const [modalEventStack, setModalEventStack] = useState([]);
  const portalNode = useMemo(() => portals.createHtmlPortalNode(), []);
  const handleModalChange = useCallback((e) => {
    resetScrollersByClassName(
      dashboardRef,
      Object.keys(scrollersRef.current.classNames),
      true
    );
    const nextObject = { type: e.type.split(".")[0], target: e.target.id };
    setModalEventStack((array) => {
      const mostRecent = array[array.length - 1];
      if (mostRecent?.type === "hide" && nextObject.type === "hidden") {
        return [];
      } else {
        return [...array, nextObject];
      }
    });
  }, []);
  const fullscreenModalShown = useMemo(() => {
    const mostRecentEvent = modalEventStack[modalEventStack.length - 1];
    return (
      mostRecentEvent?.type === "shown" &&
      mostRecentEvent?.target === fullscreenModalName
    );
  }, [modalEventStack]);
  const anyModalShown = useMemo(
    () => modalEventStack[modalEventStack.length - 1]?.type === "shown",
    [modalEventStack]
  );
  const fullscreenBackButtonCondition = useMemo(() => {
    // hide, show, hidden, shown
    const last = modalEventStack[modalEventStack.length - 1];
    const secondLast = modalEventStack[modalEventStack.length - 2];
    const thirdLast = modalEventStack[modalEventStack.length - 3];
    const fourthLast = modalEventStack[modalEventStack.length - 4];
    const firstHideIndex = modalEventStack.findIndex(
      (obj) => obj?.type === "hide"
    );
    if (
      fourthLast?.type === "hide" &&
      thirdLast?.type === "show" &&
      secondLast?.type === "hidden" &&
      last?.type === "shown" &&
      firstHideIndex !== -1
    ) {
      if (modalEventStack[firstHideIndex]?.target === fullscreenModalName) {
        return true;
      }
    }
    return false;
  }, [modalEventStack]);
  const modalCloseButton = useMemo(
    () =>
      anyModalShown ? (
        fullscreenBackButtonCondition ? (
          <button
            className="btn-close go-back-btn"
            data-bs-target={"#" + fullscreenModalName}
            data-bs-toggle="modal"
          />
        ) : (
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        )
      ) : null,
    [anyModalShown, fullscreenBackButtonCondition]
  );
  const dashboard = useMemo(
    () => cloneElement(children, { modalCloseButton }),
    [children, modalCloseButton]
  );
  const portal = useMemo(
    () => (
      <portals.InPortal node={portalNode}>
        <div ref={dashboardRef} onScrollCapture={recordScroll}>
          {dashboard}
        </div>
      </portals.InPortal>
    ),
    [portalNode, dashboardRef, recordScroll, dashboard]
  );
  const body = useMemo(
    () => !fullscreenModalShown && <portals.OutPortal node={portalNode} />,
    [fullscreenModalShown, portalNode]
  );
  const fullscreenBody = useMemo(
    () => fullscreenModalShown && <portals.OutPortal node={portalNode} />,
    [fullscreenModalShown, portalNode]
  );
  const fullscreen = useMemo(
    () => (
      <FullscreenModal
        heading={heading}
        body={fullscreenBody}
        modalName={fullscreenModalName}
      />
    ),
    [heading, fullscreenBody, fullscreenModalName]
  );

  useLayoutEffect(() => {
    resetScrollersByClassName(
      dashboardRef,
      Object.keys(scrollersRef.current.classNames),
      false
    );
  }, [modalEventStack]);

  useEventListener("show.bs.modal", handleModalChange);
  useEventListener("hide.bs.modal", handleModalChange);
  useEventListener("shown.bs.modal", handleModalChange);
  useEventListener("hidden.bs.modal", handleModalChange);

  return [portal, target, body, fullscreen];
};
const FullscreenModal = ({ heading, modalName, body }) => {
  const label = modalName + "Label";

  return (
    <>
      <div
        className="modal fade"
        id={modalName}
        tabIndex="-1"
        aria-labelledby={label}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={label}>
                {heading}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">{body}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light border-secondary three-d-btn"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
function Page({ portal, heading, target, body, fullscreen }) {
  return (
    <>
      {portal}
      <div className="row">
        <div className="col p-0"></div>
        <div className="col-7 d-flex align-items-center justify-content-center text-center text-break p-0">
          <h1 className="mt-5 mb-4 display-5">{heading}</h1>
        </div>
        <div className="col d-flex align-items-start justify-content-end p-0">
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target={target}
            className="btn btn-light square-button rounded-0"
          >
            <i className="fa-solid fa-expand fa-lg fa-fw"></i>
          </button>
        </div>
      </div>
      <div
        style={{
          paddingBottom: 12,
        }}
        className="mx-1 mx-sm-2 mx-md-3 mx-lg-4 mb-1 mb-sm-2 mb-md-3 mb-lg-4"
      >
        {body}
      </div>
      {fullscreen}
    </>
  );
}

export const Center = ({ heading, children }) => {
  const [portal, target, body, fullscreen] = useFullscreenPortal(
    children,
    heading
  );

  return (
    <Page
      body={body}
      portal={portal}
      target={target}
      heading={heading}
      fullscreen={fullscreen}
    />
  );
};
