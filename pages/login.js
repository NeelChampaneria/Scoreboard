import { useState } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";

import styles from "../styles/Auth.module.css";
import Link from "next/link";

const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setpassword] = useState("");
  const [errorFromServer, setErrorFromServer] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <h1>Loadin</h1>;
  }

  // if (session) {
  //   router.replace("/");
  // }

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username: username,
      password: password,
    });

    if (result.error) {
      setErrorFromServer(result.error);
      setLoading(false);
    } else {
      setErrorFromServer("");
      router.replace("/");
      setLoading(false);
    }
  };

  /* const LoginForm = ({ screen }) => (
    <div className="flex flex-col bg-white p-6 rounded-3xl min-h-[412px] min-w-[370px]">
      <div className="py-6">
        <Link href="/">
          <img src="/Logo-Black.png" alt="logo" className="block mx-auto" />
        </Link>
      </div>
      <hr />
      <h2 className="text-xl font-bold py-5 text-gray-800">Log In</h2>
      <form>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="User Name"
          className="block bg-white text-th-color p-4 my-2 border border-th-color rounded min-w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          className="block bg-white text-th-color p-4 mb-5 border border-th-color rounded min-w-full"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
          autoComplete="off"
        />
        <div className="mb-5 text-red-600">
          <p className="">{errorFromServer && errorFromServer}</p>
        </div>
        <button
          className="bg-blue text-white py-3 m-0 rounded min-w-full"
          onClick={(e) => {
            handleLogin(e);
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className={`${styles["lds-ring"]}`}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </>
          ) : (
            <>Log In</>
          )}
        </button>
      </form>
    </div>
  );
 */
  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-300 sm:bg-gray-400 ">
        <div className="flex flex-col min-w-full bg-gray-300 p-6 sm:bg-white sm:min-h-[412px] sm:min-w-[370px] sm:rounded-3xl">
          <div className="py-6">
            <Link href="/">
              <img src="/Logo-Black.png" alt="logo" className="block mx-auto" />
            </Link>
          </div>
          <hr />
          <h2 className="text-xl font-bold py-5 text-gray-800">Log In</h2>
          <form>
            <input
              type="text"
              name="username"
              placeholder="User Name"
              className="block bg-white text-th-color p-4 my-2 border border-th-color rounded min-w-full"
              value={username}
              maxLength={50}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="block bg-white text-th-color p-4 mb-5 border border-th-color rounded min-w-full"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            <div className="mb-5 text-red-600">
              <p className="">{errorFromServer && errorFromServer}</p>
            </div>
            <button
              className="bg-blue text-white py-3 m-0 rounded min-w-full"
              onClick={(e) => {
                handleLogin(e);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={`${styles["lds-ring"]}`}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </>
              ) : (
                <>Log In</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  } else {
    return {
      props: {
        session,
      },
    };
  }
}
