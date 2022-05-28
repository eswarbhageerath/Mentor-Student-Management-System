import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Pivot, PivotItem } from "@fluentui/react";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { Container, Navbar, Toast, ToastContainer } from "react-bootstrap";
import { UserName } from "../Common/GeneralFunctions";
import { AddFaces } from "../components/AddFaces";
import { Authenticate } from "../components/Authenticate";
import { ManageClassesAndStudents } from "../components/ManageClassesAndStudents";
import "./App.css";
import { initializeIcons } from '@fluentui/react/lib/Icons';


initializeIcons();
export const UserNameProvider = React.createContext("");
function App() {
  //state to store name of the user and user id(mail id or username)
  const [userInfo, setUserInfo] = useState({ name: "", userId: "" });

  //display toast or not
  const [displayToast, setDisplayToast] = useState(false);

  // message to show in toast
  const [toastMessage, setToastMessage] = useState("");

  // function to update toast message and to display toast
  function ShowToast(message: string) {
    setToastMessage(message);
    setDisplayToast(true);
  }
  return (
    <div className="App">
      <UserNameProvider.Provider value={userInfo.userId}>
        {/* Will render when user is authenticated*/}
        <Authenticate setUserInfo={setUserInfo}>
          <AuthenticatedTemplate>
            {/* Updating headers with username of the user*/}
            <UserName />

            {/* Toast to show notifications*/}
            <ToastContainer className="p-3" position="bottom-start">
              <Toast
                onClose={() => setDisplayToast(false)}
                show={displayToast}
                delay={3000}
                autohide
              >
                <Toast.Header closeButton={false}>
                  <strong className="me-auto">Notification</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
              </Toast>
            </ToastContainer>

            <div>
              {/*Nav Bar*/}
              <Navbar bg="dark" variant="dark">
                <Container>
                  <Navbar.Brand href="#home">
                    {" "}
                    Mentor-Student Management System
                  </Navbar.Brand>

                  <Navbar.Text>
                    {" "}
                    Hello {userInfo.name} {userInfo.userId}
                  </Navbar.Text>
                </Container>
              </Navbar>

              <Pivot>
                <PivotItem headerText="Add Faces">
                  {/*Component to add and identify faces,criminals,drowsy or not*/}
                  <AddFaces ShowToast={ShowToast} />
                </PivotItem>
                <PivotItem headerText="Manage Classes and Students">
                  {/*Component for attendance tracking - creating classes, identifying people
                  like registered students,unregistred students,unknown people,criminals*/}
                  <ManageClassesAndStudents ShowToast={ShowToast} />
                </PivotItem>
              </Pivot>
              <div></div>
            </div>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <p>Please sign in</p>
          </UnauthenticatedTemplate>
        </Authenticate>
      </UserNameProvider.Provider>
    </div>
  );
}

export default App;
