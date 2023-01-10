import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const studentData = await prisma.student.findMany({
    include: {
      stream: true,
      assessments: { include: { assessment: true } },
      studentTotalPoint: true,
    },
    orderBy: [
      {
        studentTotalPoint: {
          percentageScore: "desc",
        },
      },
      {
        studentName: "asc",
      },
    ],
  });

  const streamData = await prisma.stream.findMany();

  return res.status(200).json({ status: true, studentData, streamData });
}
