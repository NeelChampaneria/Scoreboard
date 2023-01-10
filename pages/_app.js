import "../styles/globals.css";
import "material-design-iconic-font/dist/css/material-design-iconic-font.min.css";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
