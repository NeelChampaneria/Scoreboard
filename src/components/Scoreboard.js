import { useEffect, useState } from "react";
import axios from "axios";
import FileUpload from "./FileUpload";
import { useSession, getSession } from "next-auth/react";
import FileDownload from "./FileDownload";

const Scoreboard = ({ streamDataFromDB, studentDataFromDB }) => {
  const [streamsData, setStreamsData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState("all");

  const [streamTableHeaders, setStreamTableHeaders] = useState([]);
  const [streamDataToRender, setStreamDataToRender] = useState([]);

  const { data: session, status } = useSession();

  useEffect(() => {
    console.log(streamDataFromDB);
    // getData();
    setStreamsData(streamDataFromDB);
    setStudentData(studentDataFromDB);
    extractStreamsFromStreamData(streamDataFromDB);
  }, []);

  const getData = async () => {
    const response = await axios.get("/api/getData");
    const { data } = response;

    console.log("data: ", data);

    if (
      data.status &&
      data.streamData.length > 0 &&
      data.studentData.length > 0
    ) {
      setStreamsData(data.streamData);
      console.log(data.studentData);
      for (let i = 0; i < data.studentData.length; i++) {
        if (i === 0) {
          data.studentData[i].rank = 1;
        } else {
          if (
            data.studentData[i - 1]?.studentTotalPoint?.percentageScore >
            data.studentData[i]?.studentTotalPoint?.percentageScore
          ) {
            data.studentData[i].rank = data.studentData[i - 1].rank + 1;
          } else {
            data.studentData[i].rank = data.studentData[i - 1].rank;
          }
        }
      }
      setStudentData(data.studentData);
      extractStreamsFromStreamData(data.streamData);
    }
  };

  const extractStreamsFromStreamData = (data) => {
    const tempArr = [];

    for (let i = 0; i < data.length; i++) {
      tempArr.push(data[i].streamName);
    }

    const tempSet = new Set(tempArr);

    const streams = [...tempSet];

    streams.sort();

    setStreams(["all", ...streams]);

    console.log({ tempArr, tempSet, streams });
  };

  const onStreamSelectChange = (event) => {
    const selectedStream = event.target.value;
    setCurrentStream(selectedStream);
    if (selectedStream === "all") {
      setStreamTableHeaders([]);
      setStreamDataToRender([]);
    } else {
      const tempData = [];
      for (let i = 0; i < studentData.length; i++) {
        if (studentData[i].stream.streamName === selectedStream) {
          tempData.push(studentData[i]);
        }
      }

      console.log("tempData: ", tempData);

      const tempColName = [];

      if (tempData.length > 0) {
        tempColName.push("Student Name");
        // tempColName.push("Stream");

        for (let i = 0; i < tempData[0].assessments.length; i++) {
          tempColName.push(
            tempData[0].assessments[i].assessment.assessmentName
          );
        }

        tempColName.push(
          `Total Marks [${tempData[0].studentTotalPoint.totalPoints} points]`
        );
        tempColName.push(`%Score`);
      }

      console.log("tempColName: ", tempColName);
      const tempStudentData = [];
      for (let i = 0; i < tempData.length; i++) {
        const studentObject = {
          "Student Name": tempData[i].studentName,
          Stream: tempData[i].stream.streamName,
        };
        for (let j = 0; j < tempData[i].assessments.length; j++) {
          studentObject[tempData[i].assessments[j].assessment.assessmentName] =
            tempData[i].assessments[j].achievedPoint;
        }
        studentObject[
          `Total Marks [${tempData[i].studentTotalPoint.totalPoints} points]`
        ] = tempData[i].studentTotalPoint.totalAchievedPoints;
        studentObject["%Score"] = tempData[i].studentTotalPoint.percentageScore;

        tempStudentData.push(studentObject);
      }

      console.log("tempStudentData: ", tempStudentData);

      tempStudentData[0].rank = 1;
      for (let i = 1; i < tempStudentData.length; i++) {
        if (tempStudentData[i]["%Score"] < tempStudentData[i - 1]["%Score"]) {
          tempStudentData[i].rank = tempStudentData[i - 1].rank + 1;
        } else {
          tempStudentData[i].rank = tempStudentData[i - 1].rank;
        }
      }

      setStreamTableHeaders(tempColName);
      setStreamDataToRender(tempStudentData);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-xl bg-white py-6 rounded-2xl">
      <div className="container mx-auto flex flex-col justify-between items-center mb-8 md:flex-row md:px-10 md:mb-0">
        <h2 className="text-lg font-bold text-table-text-color mb-2 md:mb-0">
          Scoreboard
        </h2>
        <div className="flex flex-col items-center md:flex-row">
          {streams.length > 0 && (
            <select
              className="form-select  px-3 py-1.5 mb-4 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none md:mb-0"
              onChange={(event) => {
                onStreamSelectChange(event);
              }}
            >
              {streams.map((streamCategory, index) => (
                <option value={streamCategory} key={index}>
                  {streamCategory}
                </option>
              ))}
            </select>
          )}
          {session?.user?.isAdmin && (
            <div className="flex items-center pl-4">
              <div className="pr-4">
                <FileUpload />
              </div>
              <div>
                <FileDownload studentData={studentData} />
              </div>
            </div>
          )}
        </div>
      </div>

      {studentData.length > 0 && (
        <>
          {currentStream === "all" ? (
            <div className="container mx-auto overflow-x-auto">
              <table className="w-full px-10">
                <thead>
                  <tr>
                    <th className="font-normal py-2 text-left text-th-color px-10">
                      Rank
                    </th>
                    <th className="font-normal py-2 text-left text-th-color px-10 sticky left-0 z-10 bg-white">
                      Student Name
                    </th>
                    <th className="font-normal py-2 text-left text-th-color px-10">
                      Stream
                    </th>
                    <th className="font-normal py-2 text-left text-th-color px-10">
                      %Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((stuData, index) => (
                    <tr
                      key={index}
                      className={`${
                        stuData.rank === 1
                          ? "bg-first-rank-color"
                          : stuData.rank === 2
                          ? "bg-second-rand-color"
                          : stuData.rank === 3
                          ? "bg-third-rank-color"
                          : "bg-white"
                      }`}
                    >
                      <td className="font-normal py-3 text-table-text-color px-10">
                        {stuData.rank}
                      </td>
                      <td
                        className={`font-normal py-3 text-table-text-color px-10 sticky left-0 z-10 ${
                          stuData.rank === 1
                            ? "bg-first-rank-color"
                            : stuData.rank === 2
                            ? "bg-second-rand-color"
                            : stuData.rank === 3
                            ? "bg-third-rank-color"
                            : "bg-white"
                        }`}
                      >
                        {stuData.studentName}
                      </td>
                      <td className="font-normal py-3 text-table-text-color px-10">
                        {stuData.stream.streamName}
                      </td>
                      <td className="font-normal py-3 text-table-text-color px-10">
                        {stuData.studentTotalPoint?.percentageScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="min-w-150px font-normal py-2 px-10 text-left  text-th-color md:min-w-250px">
                      Rank
                    </th>
                    {streamTableHeaders.map((column, index) => (
                      <th
                        key={column}
                        scope="col"
                        className={`min-w-150px font-normal py-2 px-10 text-left text-th-color bg-white md:min-w-250px ${
                          index === 0 ? "sticky left-0 z-10" : ""
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {streamDataToRender.map((data, index) => (
                    <tr
                      key={index}
                      className={`${
                        data.rank === 1
                          ? "bg-first-rank-color"
                          : data.rank === 2
                          ? "bg-second-rand-color"
                          : data.rank === 3
                          ? "bg-third-rank-color"
                          : "bg-white"
                      }`}
                    >
                      <td className="min-w-150px font-normal py-3 px-10 text-table-text-color md:min-w-250px">
                        {data.rank}
                      </td>
                      {streamTableHeaders.map((header, headerIndex) => (
                        <td
                          key={index + header + headerIndex}
                          className={`min-w-150px font-normal py-3 px-10 text-table-text-color md:min-w-250px ${
                            headerIndex === 0 ? " sticky left-0 z-10 " : ""
                          } ${
                            data.rank === 1
                              ? "bg-first-rank-color"
                              : data.rank === 2
                              ? "bg-second-rand-color"
                              : data.rank === 3
                              ? "bg-third-rank-color"
                              : "bg-white"
                          }`}
                        >
                          {data[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Scoreboard;
