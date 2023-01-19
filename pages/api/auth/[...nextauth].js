import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default NextAuth({
  session: {
    jwt: true,
    maxAge: 60 * 60 * 24,
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const doesUserExist = await prisma.auth.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!doesUserExist) {
          throw new Error("Username does not exist.");
        } else {
          if (doesUserExist.password === credentials.password) {
            return {
              user: doesUserExist.username,
              isAdmin: doesUserExist.isAdmin,
            };
          } else {
            throw new Error("Username or Password invalid.");
          }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
});
