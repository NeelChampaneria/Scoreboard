import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const assessmentData = await prisma.assessment.findMany();

  return res.status(200).json({ status: true, assessmentData });
}
