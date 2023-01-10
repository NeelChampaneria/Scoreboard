import Head from "next/head";
import { Inter } from "@next/font/google";
import { useState } from "react";
import axios from "axios";
import Scoreboard from "../src/components/Scoreboard";
import Navbar from "../src/components/Navbar";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const XLSX = require("xlsx");

const inter = Inter({ subsets: ["latin"] });

export default function Home({ session, streamDataFromDB, studentDataFromDB }) {
  const [refresh, setRefresh] = useState(0);

  const router = useRouter();

  return (
    <div className="bg-light-gray min-h-screen">
      <Head>
        <title>Scoreboard</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Navbar />
        <div className="pt-10">
          <Scoreboard
            session={session}
            streamDataFromDB={streamDataFromDB}
            studentDataFromDB={studentDataFromDB}
          />
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

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

  let streamDataFromDB = [];
  let studentDataFromDB = [];

  if (streamData.length > 0 && studentData.length > 0) {
    for (let i = 0; i < studentData.length; i++) {
      if (i === 0) {
        studentData[i].rank = 1;
      } else {
        if (
          studentData[i - 1]?.studentTotalPoint?.percentageScore >
          studentData[i]?.studentTotalPoint?.percentageScore
        ) {
          studentData[i].rank = studentData[i - 1].rank + 1;
        } else {
          studentData[i].rank = studentData[i - 1].rank;
        }
      }
    }
    streamDataFromDB = streamData;
    studentDataFromDB = studentData;
  }

  return {
    props: {
      session,
      streamDataFromDB,
      studentDataFromDB,
    },
  };
}
