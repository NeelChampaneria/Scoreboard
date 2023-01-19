import { useRef, useState } from "react";
import { read } from "xlsx";
import axios from "axios";
import { useRouter } from "next/router";

import styles from "../../styles/FileUpload.module.css";

const XLSX = require("xlsx");

const FileUpload = () => {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef();

  const [sheetNames, setSheetNames] = useState([]);
  const [sheetData, setSheetData] = useState({});

  const acceptableFileName = ["xlsx", "xls"];

  const [loading, setLoading] = useState(false);

  const checkFileName = (name) => {
    return acceptableFileName.includes(name.split(".").pop().toLowerCase());
  };

  const readDataFromExcel = (data) => {
    const wb = read(data);
    setSheetNames(wb.SheetNames);

    let mySheetData = {};

    // Loop through the sheets
    for (let i = 0; i < wb.SheetNames.length; i++) {
      let sheetName = wb.SheetNames[i];
      const workSheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(workSheet);
      mySheetData[sheetName] = jsonData;
    }

    setSheetData(mySheetData);

    const mentorFeedBackColumns = XLSX.utils.sheet_to_json(
      wb.Sheets["Mentor Feedback"],
      { header: 1 }
    )[0];

    processData(mySheetData, mentorFeedBackColumns);
  };

  const handleFile = async (e) => {
    try {
      setLoading(true);
      const myFile = e.target.files[0];
      if (!myFile) return;

      if (!checkFileName(myFile.name)) {
        alert("Invalid File Type");
        setLoading(false);
        return;
      }

      // Read the xlsx meta data
      const data = await myFile.arrayBuffer();
      readDataFromExcel(data);

      setFile(myFile);
      setFileName(myFile.name);
    } catch (error) {
      alert("Please Upload Valid File");
      setLoading(false);
    }
  };

  const getStreamAndCourses = (sheet) => {
    const streamAndCourses = {};
    for (let i = 0; i < sheet.length; i++) {
      const coursesString = sheet[i].Courses;
      const courses = coursesString
        .toLowerCase()
        .trim()
        .split(",")
        .map((str) => str.trim());
      // streamAndCourses[sheetData.StreamAndCourses[i].Stream]
      console.log(courses);

      streamAndCourses[sheet[i].Stream.toLowerCase()] = courses;
    }

    return streamAndCourses;
  };

  const getCourseAndStreams = (streamAndCourses) => {
    const courseAndStreams = {};
    Object.entries(streamAndCourses).forEach(([stream, courses]) => {
      for (let i = 0; i < courses.length; i++) {
        if (!courseAndStreams[courses[i]]) {
          courseAndStreams[courses[i]] = [];
        }
        courseAndStreams[courses[i]].push(stream);
      }
    });
    return courseAndStreams;
  };

  const getStreamAndStudents = (sheet) => {
    const streamAndStudents = {};
    for (let i = 0; i < sheet.length; i++) {
      const currentStudent = sheet[i];
      const currentStudentStream = currentStudent.stream;
      const modifiedKey = currentStudentStream.toLowerCase().trim();
      if (!streamAndStudents[modifiedKey]) {
        streamAndStudents[modifiedKey] = [];
      }
      streamAndStudents[modifiedKey].push(currentStudent);
    }
    return streamAndStudents;
  };

  const getCoursesAndAssesments = (mentorFeedbackColumns, streamAndCourses) => {
    const modifiedColumns = mentorFeedbackColumns.map((column) => {
      return column.toLowerCase().trim().replace(/\r\n/g, " ");
    });
    // console.log("modifiedColumns: ", modifiedColumns);
    const tempCoursesArr = [];
    Object.entries(streamAndCourses).forEach(([stream, courseArr]) => {
      tempCoursesArr.push(...courseArr);
    });

    const courseSet = new Set(tempCoursesArr);
    const courses = [...courseSet];

    // console.log("courses: ", courses);
    const courseAndAssessments = {};

    for (let i = 0; i < courses.length; i++) {
      courseAndAssessments[courses[i]] = [];
    }

    for (let i = 0; i < modifiedColumns.length; i++) {
      const course = modifiedColumns[i].split(":")[0]?.trim();
      if (courses.includes(course)) {
        courseAndAssessments[course].push(modifiedColumns[i]);
      }
    }
    // console.log("courseAndAssessments: ", courseAndAssessments);
    return courseAndAssessments;
  };

  const getStreamAndAssesments = (streamAndCourses, courseAndAssessments) => {
    const streamAndAssesments = {};

    Object.entries(streamAndCourses).forEach(([stream, coursesArr]) => {
      const tempArr = [];
      for (let i = 0; i < coursesArr.length; i++) {
        tempArr.push(...courseAndAssessments[coursesArr[i]]);
      }
      streamAndAssesments[stream] = tempArr;
    });

    return streamAndAssesments;
  };

  const processData = (mySheetData, mentorFeedBackColumns) => {
    // Change key to lower cases
    for (let i = 0; i < mySheetData["Mentor Feedback"].length; i++) {
      Object.entries(mySheetData["Mentor Feedback"][i]).forEach(
        ([key, value]) => {
          mySheetData["Mentor Feedback"][i][
            key.toLowerCase().trim().replace(/\r\n/g, " ")
          ] = value;
          delete mySheetData["Mentor Feedback"][i][key];
        }
      );
    }

    const streamAndCourses = getStreamAndCourses(mySheetData.StreamAndCourses);
    const courseAndStreams = getCourseAndStreams(streamAndCourses);
    const streamAndStudents = getStreamAndStudents(
      mySheetData["Mentor Feedback"]
    );

    const streamsName = Object.keys(streamAndStudents);

    const courseAndAssessments = getCoursesAndAssesments(
      mentorFeedBackColumns,
      streamAndCourses
    );
    const streamAndAssesmentsList = getStreamAndAssesments(
      streamAndCourses,
      courseAndAssessments
    );

    const streamAndAssesment = {};
    Object.entries(streamAndStudents).forEach(([key, value]) => {
      const streamStudentAndMarks = {};
      const assesmentToShowArr = [];

      for (let i = 0; i < value.length; i++) {
        const currentStudentObj = value[i];
        Object.entries(value[i]).forEach(([stuKey, stuValue]) => {
          if (
            streamAndAssesmentsList[
              value[i].stream.toLowerCase().trim()
            ].includes(stuKey)
          ) {
            if (!streamStudentAndMarks[stuKey]) {
              streamStudentAndMarks[stuKey] = 1;
            } else {
              streamStudentAndMarks[stuKey] = streamStudentAndMarks[stuKey] + 1;
            }
          }
        });
      }

      Object.entries(streamStudentAndMarks).forEach(
        ([assesmentKey, assesmentValue]) => {
          if (assesmentValue === value.length) {
            assesmentToShowArr.push(assesmentKey);
          }
        }
      );

      streamAndAssesment[key] = [
        "student name",
        "stream",
        ...assesmentToShowArr,
      ];
    });

    const streamAndAssesmentWithMoreData = {};
    Object.entries(streamAndAssesment).forEach(([key, value]) => {
      const temp = {};
      let totalMarks = 0;
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].toLowerCase().trim() !== "student name" &&
          value[i].toLowerCase().trim() !== "stream"
        ) {
          // const parenthesisString = value[i].match(/\(([^)]+)\)/)[1];
          const parenthesisString = value[i].match(/\[(.*?)\]/)[1];
          const marks = parenthesisString.match(/(\d+)/)[1];
          temp[value[i]] = +marks;
          totalMarks += +marks;
        }
      }
      temp["totalScore"] = totalMarks;
      streamAndAssesmentWithMoreData[key] = temp;
    });

    const tempStuArr = [];
    Object.entries(streamAndStudents).forEach(([stream, studentArray]) => {
      for (let i = 0; i < studentArray.length; i++) {
        const temp = {};
        temp["student name"] = studentArray[i]["student name"];
        temp["stream"] = studentArray[i]["stream"];
        let studentTotalScore = 0;
        Object.entries(studentArray[i]).forEach(([key, value]) => {
          if (
            key.toLowerCase().trim() !== "student name" &&
            key.toLowerCase().trim() !== "stream"
          ) {
            if (streamAndAssesment[stream].includes(key)) {
              temp[key] = value;
              studentTotalScore += +value;
            }
          }
        });
        temp["achievedScore"] = studentTotalScore;
        temp["outOf"] = streamAndAssesmentWithMoreData[stream].totalScore;
        const percentage =
          (studentTotalScore /
            streamAndAssesmentWithMoreData[stream].totalScore) *
            100 || 0;

        temp["percentageScore"] =
          Math.round(percentage * 100 + Number.EPSILON) / 100;

        tempStuArr.push(temp);
      }
    });
    tempStuArr.sort((a, b) => b["percentageScore"] - a["percentageScore"]);

    console.log("tempStuArr: ", tempStuArr);
    console.log(
      "streamAndAssesmentWithMoreData: ",
      streamAndAssesmentWithMoreData
    );
    writeToDB(
      streamAndStudents,
      courseAndStreams,
      courseAndAssessments,
      tempStuArr
    );
  };

  const writeToDB = async (
    streamAndStudents,
    courseAndStreams,
    courseAndAssessments,
    studentPoints
  ) => {
    try {
      const createStreams = [];
      const createStudents = [];
      const createCourses = [];
      const createAssessment = [];

      Object.entries(streamAndStudents).forEach(([stream, stuArr]) => {
        createStreams.push({ streamName: stream });
        for (let i = 0; i < stuArr.length; i++) {
          createStudents.push({
            studentName: stuArr[i]["student name"],
            streamName: stream,
          });
        }
      });

      console.log("createStreams: ", createStreams);
      console.log("createStudents: ", createStudents);

      Object.entries(courseAndStreams).forEach(([course, stream]) => {
        createCourses.push({
          courseName: course,
          streams: stream,
        });
      });

      console.log("courseAndStreams: ", courseAndStreams);
      console.log("createCourses: ", createCourses);

      Object.entries(courseAndAssessments).forEach(
        ([course, assessmentArr]) => {
          for (let i = 0; i < assessmentArr.length; i++) {
            const parenthesisString = assessmentArr[i].match(/\[(.*?)\]/);
            if (parenthesisString) {
              const marks = parenthesisString[1].match(/(\d+)/)[1];
              createAssessment.push({
                courseName: course,
                assessmentName: assessmentArr[i],
                assessmentPoint: +marks,
              });
            }
          }
        }
      );

      console.log("createAssessment: ", createAssessment);

      const res = await axios.post("/api/insertData", {
        createStreams,
        createStudents,
        createCourses,
        createAssessment,
        studentPoints,
      });

      if (res.data.status) {
        fileRef.current.value = "";
        setLoading(false);
        router.reload();
      } else {
        alert("Something Went Wrong");
        setLoading(false);
      }
      console.log("res: ", res);
    } catch (error) {
      if (error?.response?.status === 401) {
        alert("Unathorized Request");
        setLoading(false);
      } else {
        alert("Something Went Wrong");
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="flex items-center">
        <div className="relative">
          <input
            id="file-upload"
            type="file"
            accept="xlsx, xls"
            multiple={false}
            className="absolute opacity-0 -z-10"
            onChange={(e) => handleFile(e)}
            ref={fileRef}
          />
          <label
            htmlFor="file-upload"
            className="text-white text-lg px-3 py-2 border rounded-md bg-blue"
          >
            <i className="zmdi zmdi-upload pr-2"></i>
            Candidate Details
          </label>
        </div>

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

export default FileUpload;
