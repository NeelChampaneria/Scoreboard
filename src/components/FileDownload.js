import axios from "axios";
import { useState } from "react";

import styles from "../../styles/FileUpload.module.css";

const XLSX = require("xlsx");

const FileDownload = ({ studentData }) => {
  console.log("studentData: ", studentData);
  const [loading, setLoading] = useState(false);

  const exportDataToXlsx = async () => {
    setLoading(true);
    const studentAndMarks = [];
    const modifiedData = [];

    const res = await axios.get("/api/getAssessmentsNames");

    console.log("assessmentData: ", res?.data?.assessmentData);

    const { assessmentData } = res.data;

    if (
      res.data.status &&
      assessmentData.length === 0 &&
      studentData.length === 0
    ) {
      alert("No Data Present To Download");
      setLoading(false);
      return;
    }

    if (res.data.status && assessmentData.length > 0) {
      for (let i = 0; i < studentData.length; i++) {
        const tempObj = {};

        tempObj["id"] = studentData[i].id;
        tempObj["Student Name"] = studentData[i].studentName;
        tempObj["Stream"] = studentData[i].stream.streamName;

        for (let j = 0; j < studentData[i].assessments.length; j++) {
          tempObj[studentData[i].assessments[j].assessment.assessmentName] =
            studentData[i].assessments[j].achievedPoint;
        }

        tempObj["Total Scored Points"] =
          studentData[i].studentTotalPoint.totalAchievedPoints;

        tempObj["Percentage"] =
          studentData[i].studentTotalPoint.percentageScore;

        studentAndMarks.push(tempObj);
      }

      for (let i = 0; i < studentData.length; i++) {
        const tempObj = {};

        tempObj["id"] = studentData[i].id;
        tempObj["Student Name"] = studentData[i].studentName;
        tempObj["Stream"] = studentData[i].stream.streamName;

        for (let j = 0; j < assessmentData.length; j++) {
          tempObj[assessmentData[j].assessmentName] = "";
        }

        tempObj["Total Scored Points"] = "";
        tempObj["Percentage"] = "";

        modifiedData.push(tempObj);
      }

      for (let i = 0; i < modifiedData.length; i++) {
        for (let j = 0; j < studentAndMarks.length; j++) {
          if (modifiedData[i].id === studentAndMarks[j].id) {
            Object.entries(studentAndMarks[j]).forEach(([key, value]) => {
              modifiedData[i][key] = value;
            });
          }
        }
      }

      modifiedData[0].rank = 1;
      delete modifiedData[0].id;

      for (let i = 1; i < modifiedData.length; i++) {
        if (modifiedData[i].Percentage < modifiedData[i - 1].Percentage) {
          modifiedData[i].rank = modifiedData[i - 1].rank + 1;
        } else {
          modifiedData[i].rank = modifiedData[i - 1].rank;
        }
        delete modifiedData[i].id;
      }

      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(modifiedData);

      XLSX.utils.book_append_sheet(wb, ws, "Mentor Feedback");

      XLSX.writeFile(wb, "MyExcel.xlsx");
      setLoading(false);
    } else {
      alert("Something Went Wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <button
          className="text-blue text-lg px-3 py-2 border rounded-md bg-white"
          onClick={exportDataToXlsx}
        >
          <i className="zmdi zmdi-download pr-2"></i>
          Download
        </button>
        {loading && (
          <div className={`pl-2 ${styles["lds-ring"]}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </div>
    </>
  );
};

export default FileDownload;
