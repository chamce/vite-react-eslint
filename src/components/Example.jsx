import { useState, useEffect, useMemo } from "react";
import { csv } from "d3";

const getGroupedData = (data) => {
  const firstKey = "semester";
  const secondKey = "term";
  const groupedBySemester = groupBy(data, firstKey);
  Object.keys(groupedBySemester).forEach((key) => {
    groupedBySemester[key] = groupBy(groupedBySemester[key], secondKey);
  });
  return groupedBySemester;
};
const groupBy = (array, key) => {
  // Return the end result
  return array.reduce((result, currentValue) => {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {}); // empty object is the initial value for result object
};
const useCsv = (location) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(location).then(setData);
  }, [location]);

  return data;
};
// const formatData = (data) => {
//   const newData = data.map((row) => ({
//     semester: row.Title.split(" ").slice(0, 2).join(" "),
//     term: row.Title,
//     field: row.One,
//     value: row.Two,
//   }));
//   exportToCsv(newData);
// };
// const downloadFile = ({ data, fileName, fileType }) => {
//   const blob = new Blob([data], { type: fileType });

//   const a = document.createElement("a");
//   a.download = fileName;
//   a.href = window.URL.createObjectURL(blob);
//   const clickEvt = new MouseEvent("click", {
//     view: window,
//     bubbles: true,
//     cancelable: true,
//   });
//   a.dispatchEvent(clickEvt);
//   a.remove();
// };
// const exportToCsv = (rows) => {
//   // Headers for each column
//   let headers = [Object.keys(rows[0]).join()];

//   // Convert data to a csv
//   let dataCsv = rows.reduce((acc, row) => {
//     acc.push(
//       Object.keys(row)
//         .map((key) => row[key])
//         .join()
//     );
//     return acc;
//   }, []);

//   downloadFile({
//     data: [...headers, ...dataCsv].join("\n"),
//     fileName: "data.csv",
//     fileType: "text/csv",
//   });
// };

export const Example = () => {
  const data = useCsv("/data/example.csv");
  const groupedData = useMemo(() => data && getGroupedData(data), [data]);

  useEffect(() => {
    groupedData && console.log(groupedData);
  }, [groupedData]);

  return (
    <>
      {groupedData &&
        Object.keys(groupedData).map((semester) => (
          <div key={semester} className="p-2" id="featured-3">
            <h1 className="pb-2 border-bottom">{semester}</h1>
            <div className="row g-4 py-4 row-cols-1">
              {Object.keys(groupedData[semester]).map((term) => (
                <div key={term} className="feature col">
                  {/* <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3">
                    <svg className="bi" width="1em" height="1em">
                      <use href="#collection"></use>
                    </svg>
                  </div> */}
                  <h3 className="fs-3">{term}</h3>
                  <p>
                    {JSON.stringify(groupedData[semester][term])}
                    {/* Paragraph of text beneath the heading to explain the
                    heading. We'll add onto it with another sentence and
                    probably just keep going until we run out of words. */}
                  </p>
                  {/* <a
                    href="/#"
                    className="icon-link d-inline-flex align-items-center"
                  >
                    Call to action
                    <svg className="bi" width="1em" height="1em">
                      <use href="#chevron-right"></use>
                    </svg>
                  </a> */}
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

// finish up index.html
// could add image under dashboard heading
// this could become new template because you have removed unnecessary files--can I just replace the current template's files with these?
