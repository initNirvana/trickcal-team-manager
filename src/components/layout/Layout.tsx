import React from "react";
import Footer from "./Footer";

const Layout = (props: { children: React.ReactNode }) => {
  return (
    <div>
      {props.children}
      <Footer />
    </div>
  );
};

export default Layout;
