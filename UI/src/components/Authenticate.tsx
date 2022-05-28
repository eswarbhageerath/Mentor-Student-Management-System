import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useState } from "react";
const loginRequest = {
  scopes: ["User.Read"],
};

export const SignIn = (props: { setUserInfo: any }) => {
  const [loadPopUp, setLoadPopUp] = useState(true);

  async function HandleLogin() {
    const { instance } = useMsal();

    if (instance.getAllAccounts().length === 0) {
      await instance.loginPopup(loginRequest).catch((e: any) => {
        console.log(e);
      });
      await instance.handleRedirectPromise();
    }
  }
  if (loadPopUp) {
    setLoadPopUp(false);
    HandleLogin();
  }
  return <div></div>;
};
export const Authenticate = (props: { setUserInfo: any; children: any }) => {
  const [updateUserInfo, setUpdateUserInfo] = useState(true);
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  if (instance.getAllAccounts().length !== 0 && updateUserInfo) {
    var account = instance.getAllAccounts()[0];
    console.log(account);

    props.setUserInfo({ name: account.name, userId: account.username });
    setUpdateUserInfo(false);
  }
  return (
    <>
      {isAuthenticated ? (
        props.children
      ) : (
        <SignIn setUserInfo={props.setUserInfo} />
      )}
    </>
  );
};
