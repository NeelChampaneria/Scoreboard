import { getSession } from "next-auth/react";

export const adminAuth = (handler) => {
  return async (req, res) => {
    const session = await getSession({ req });
    if (!session || session?.user?.isAdmin === false) {
      res.status(401).json({ status: false, message: "unauthorized Request" });
    } else {
      return handler(req, res);
    }
  };
};
