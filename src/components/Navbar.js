import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <div className="bg-white">
        <div className="container mx-auto max-w-screen-xl flex flex-col justify-between items-center py-3 px-3 md:flex-row md:justify-between md:items-center xl:px-0">
          <img src="/Logo-Black.png" alt="logo" className="mb-4 md:mb-0" />
          <div>
            {!session && status !== "loading" && status !== "authenticated" && (
              <>
                <Link
                  href="/login"
                  className="inline-block text-md py-2 px-10 border border-th-color text-th-color rounded-md"
                >
                  Login
                </Link>
              </>
            )}
            {session && (
              <>
                <button
                  className="text-md py-2 px-10 border border-th-color text-th-color rounded-md"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
