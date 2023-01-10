import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../../middleware/adminAuth";

const prisma = new PrismaClient();

async function handler(req, res) {
  const {
    createStreams,
    createStudents,
    createCourses,
    createAssessment,
    studentPoints,
  } = req.body;

  let fetchedStreams, fetchedCourses, fetchedAssessments, fetchedStudents;

  try {
    const databaseRes = await prisma.$transaction(async (tx) => {
      let writtenSuccessfully;

      const streamDelete = await tx.stream.deleteMany();
      const courseDelete = await tx.course.deleteMany();
      const assessmentDelete = await tx.assessment.deleteMany();
      const studentDelete = await tx.student.deleteMany();
      const studentAssesmentDelete = await tx.studentAssesment.deleteMany();
      const streamCourseDelete = await tx.streamCourses.deleteMany();
      const studentPointDelete = await tx.studentTotalPoint.deleteMany();

      if (
        streamDelete &&
        courseDelete &&
        assessmentDelete &&
        studentDelete &&
        studentAssesmentDelete &&
        streamCourseDelete &&
        studentPointDelete
      ) {
        const createStreamsDBCall = await tx.stream.createMany({
          data: createStreams,
        });

        if (createStreamsDBCall) {
          const streams = await tx.stream.findMany();
          fetchedStreams = streams;

          for (let j = 0; j < createStudents.length; j++) {
            for (let i = 0; i < streams.length; i++) {
              if (streams[i].streamName === createStudents[j].streamName) {
                createStudents[j].streamId = streams[i].id;
                delete createStudents[j].streamName;
                break;
              }
            }
          }

          const createStudentsDBCall = await tx.student.createMany({
            data: createStudents,
          });

          const courseDataToPassInPrisma = createCourses.map((course) => {
            return { courseName: course.courseName };
          });

          const createCourseDBCall = await tx.course.createMany({
            data: courseDataToPassInPrisma,
          });

          if (createCourseDBCall) {
            const courses = await tx.course.findMany();
            fetchedCourses = courses;
            const streamCourseDataToInsert = [];
            for (let i = 0; i < fetchedCourses.length; i++) {
              for (let j = 0; j < createCourses.length; j++) {
                if (
                  fetchedCourses[i].courseName === createCourses[j].courseName
                ) {
                  for (let k = 0; k < createCourses[j].streams.length; k++) {
                    for (let l = 0; l < fetchedStreams.length; l++) {
                      if (
                        createCourses[j].streams[k] ===
                        fetchedStreams[l].streamName
                      ) {
                        streamCourseDataToInsert.push({
                          streamId: fetchedStreams[l].id,
                          courseId: fetchedCourses[i].id,
                        });
                      }
                    }
                  }
                }
              }
            }

            const createStreamCoursesDBCall = await tx.streamCourses.createMany(
              {
                data: streamCourseDataToInsert,
              }
            );

            const assessmentDataToInsert = [];

            for (let i = 0; i < createAssessment.length; i++) {
              for (let j = 0; j < fetchedCourses.length; j++) {
                if (
                  createAssessment[i].courseName ===
                  fetchedCourses[j].courseName
                ) {
                  assessmentDataToInsert.push({
                    assessmentName: createAssessment[i].assessmentName,
                    assessmentPoint: createAssessment[i].assessmentPoint,
                    courseId: fetchedCourses[j].id,
                  });
                }
              }
            }

            const createAssessmentDBCall = await tx.assessment.createMany({
              data: assessmentDataToInsert,
            });

            if (createAssessmentDBCall) {
              const fetchedAssessments = await tx.assessment.findMany();
              const fetchedStudents = await tx.student.findMany();

              if (fetchedAssessments && fetchedStudents) {
                const studentAssessmentDataToInsert = [];

                for (let i = 0; i < studentPoints.length; i++) {
                  for (let j = 0; j < fetchedStudents.length; j++) {
                    if (
                      studentPoints[i]["student name"] ===
                      fetchedStudents[j].studentName
                    ) {
                      studentPoints[i].studentId = fetchedStudents[j].id;
                      break;
                    }
                  }
                }

                for (let i = 0; i < studentPoints.length; i++) {
                  Object.entries(studentPoints[i]).forEach(([key, value]) => {
                    for (let j = 0; j < fetchedAssessments.length; j++) {
                      if (key === fetchedAssessments[j].assessmentName) {
                        studentAssessmentDataToInsert.push({
                          studentId: studentPoints[i].studentId,
                          assessmentId: fetchedAssessments[j].id,
                          achievedPoint: value,
                        });
                        break;
                      }
                    }
                  });
                }

                const createStudentAssessmentDBCall =
                  await tx.studentAssesment.createMany({
                    data: studentAssessmentDataToInsert,
                  });

                const studentPointDataToInsert = [];

                for (let i = 0; i < studentPoints.length; i++) {
                  studentPointDataToInsert.push({
                    studentId: studentPoints[i].studentId,
                    totalAchievedPoints: studentPoints[i].achievedScore,
                    totalPoints: studentPoints[i].outOf,
                    percentageScore: studentPoints[i].percentageScore,
                  });
                }

                const createStudentPointDBCall =
                  await tx.studentTotalPoint.createMany({
                    data: studentPointDataToInsert,
                  });

                if (createAssessmentDBCall) {
                  res.status(200).json({ status: true });
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false });
  }
}

export default adminAuth(handler);

/* 

prisma.stream
      .deleteMany()
      .then((dcount) => {
        console.log("dcount: ", dcount);
        return prisma.course.deleteMany();
      })
      .then(() => {
        return prisma.assessment.deleteMany();
      })
      .then(() => {
        return prisma.student.deleteMany();
      })
      .then(() => {
        return prisma.studentAssesment.deleteMany();
      })
      .then(() => {
        return prisma.streamCourses.deleteMany();
      })
      .then(() => {
        return prisma.studentTotalPoint.deleteMany();
      })
      .then(() => {
        return prisma.stream.createMany({
          data: createStreams,
        });
      })
      .then((count) => {
        return prisma.stream.findMany();
      })
      .then((streams) => {
        fetchedStreams = streams;
        for (let j = 0; j < createStudents.length; j++) {
          for (let i = 0; i < streams.length; i++) {
            if (streams[i].streamName === createStudents[j].streamName) {
              createStudents[j].streamId = streams[i].id;
              delete createStudents[j].streamName;
              break;
            }
          }
        }
        return createStudents;
      })
      .then(() => {
        return prisma.student.createMany({
          data: createStudents,
        });
      })
      .then(() => {
        const dataToPassInPrisma = createCourses.map((course) => {
          return { courseName: course.courseName };
        });

        return prisma.course.createMany({ data: dataToPassInPrisma });
      })
      .then(() => {
        return prisma.course.findMany();
      })
      .then((courses) => {
        fetchedCourses = courses;
        const streamCourseDataToInsert = [];
        for (let i = 0; i < fetchedCourses.length; i++) {
          for (let j = 0; j < createCourses.length; j++) {
            if (fetchedCourses[i].courseName === createCourses[j].courseName) {
              for (let k = 0; k < createCourses[j].streams.length; k++) {
                for (let l = 0; l < fetchedStreams.length; l++) {
                  if (
                    createCourses[j].streams[k] === fetchedStreams[l].streamName
                  ) {
                    streamCourseDataToInsert.push({
                      streamId: fetchedStreams[l].id,
                      courseId: fetchedCourses[i].id,
                    });
                  }
                }
              }
            }
          }
        }
        return prisma.streamCourses.createMany({
          data: streamCourseDataToInsert,
        });
      })
      .then(() => {
        const assessmentDataToInsert = [];

        for (let i = 0; i < createAssessment.length; i++) {
          for (let j = 0; j < fetchedCourses.length; j++) {
            if (
              createAssessment[i].courseName === fetchedCourses[j].courseName
            ) {
              assessmentDataToInsert.push({
                assessmentName: createAssessment[i].assessmentName,
                assessmentPoint: createAssessment[i].assessmentPoint,
                courseId: fetchedCourses[j].id,
              });
            }
          }
        }

        return prisma.assessment.createMany({ data: assessmentDataToInsert });
      })
      .then(() => {
        return prisma.assessment.findMany();
      })
      .then((assessments) => {
        fetchedAssessments = assessments;
        return prisma.student.findMany();
      })
      .then((students) => {
        fetchedStudents = students;
        const studentAssessmentDataToInsert = [];

        for (let i = 0; i < studentPoints.length; i++) {
          for (let j = 0; j < fetchedStudents.length; j++) {
            if (
              studentPoints[i]["student name"] ===
              fetchedStudents[j].studentName
            ) {
              studentPoints[i].studentId = fetchedStudents[j].id;
              break;
            }
          }
        }

        for (let i = 0; i < studentPoints.length; i++) {
          Object.entries(studentPoints[i]).forEach(([key, value]) => {
            for (let j = 0; j < fetchedAssessments.length; j++) {
              if (key === fetchedAssessments[j].assessmentName) {
                studentAssessmentDataToInsert.push({
                  studentId: studentPoints[i].studentId,
                  assessmentId: fetchedAssessments[j].id,
                  achievedPoint: value,
                });
                break;
              }
            }
          });
        }

        // console.log(
        //   "studentAssessmentDataToInsert: ",
        //   studentAssessmentDataToInsert
        // );

        return prisma.studentAssesment.createMany({
          data: studentAssessmentDataToInsert,
        });
      })
      .then(() => {
        const studentPointDataToInsert = [];

        for (let i = 0; i < studentPoints.length; i++) {
          studentPointDataToInsert.push({
            studentId: studentPoints[i].studentId,
            totalAchievedPoints: studentPoints[i].achievedScore,
            totalPoints: studentPoints[i].outOf,
            percentageScore: studentPoints[i].percentageScore,
          });
        }

        return prisma.studentTotalPoint.createMany({
          data: studentPointDataToInsert,
        });
      })
      .then(() => {
        res.status(200).json({ status: true });
        // console.log("written successfully");
        // writtenSuccessfully = true;
        return true;
      })
      .catch(() => {
        res.status(500).json({ status: false });
        // writtenSuccessfully = false;
        return false;
      });


*/
