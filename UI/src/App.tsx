import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate
} from "@azure/msal-react";
import {
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  ILabelStyles,
  IStackTokens,
  IStyleSet,
  Label,
  Pivot,
  PivotItem,
  Stack,
  TextField
} from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Container, Navbar } from "react-bootstrap";
import "./App.css";
import { Authenticate } from "./Authenticate";
import { registerStudentsToclass, createNewClass, getAllClasses, getRegisteredIds, unregisterStudentsToclass } from "./ClassFunctions";

import { CameraFeed } from "./components/camera-feed";
import { clearFaces, confirmFaces, DisplayFace, identifyFaces } from "./FaceFunctions";
import { Face, horizontalAlignItems, InputImage, UserName } from "./GeneralFunctions";
import { ImageUpload } from "./ImageUpload";
import { DropdownBasicExample } from "./text";
export const UserNameProvider = React.createContext("");
function App() {
  const [userInfo, setUserInfo] = useState({ name: "", userId: "" });
  const [images, setImages] = React.useState<File[]>([]);
  
  const [createClass, setCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [allClasses,setAllClasses]=useState<string[]>([])
  const [registeredIds,setRegisteredIds]=useState<string[]>([])
  const [currentClass,setCurrentClass]=useState("new class");
  const [croppedFaces, setCroppedFaces] = useState<
    Face[]
  >([]);
  const stackTokens: IStackTokens = { childrenGap: 40 };
  useEffect(()=>{
    getAllClasses().then((classes:any)=>{
      setAllClasses(classes)
    })
  },[])

  


  

  console.log("cropped", croppedFaces);
  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
  };
  function DisplayFaces(props:{faces:
    Face[],setSelectedIds:React.Dispatch<React.SetStateAction<string[]>>,selectedIds:string[]}){
    return <div>
      {props.faces.map((face, index) => {
                          return (
                            <DisplayFace
                              face={face}
                              index={index}
                              croppedFaces={croppedFaces}
                              setCroppedFaces={setCroppedFaces}
                              setSelectedIds={props.setSelectedIds}
                              selectedIds={props.selectedIds}
                              isClass={true}
                            />
                          );
                        })}
    </div>
  }

  function UnRegisteredStudents(){

    var knownFaces=croppedFaces.filter(face=>face.Name!=="Unknown")
    var unRegistred:Face[]=[]
    var [selectedIds,setSelectedIds]=useState<string[]>([]) 
    console.log(selectedIds);
    
    knownFaces.forEach(face=>{
      var flag=false;
      registeredIds.forEach(id=>{
        if(face.PersonId===id){
          flag=true
        }
      })
      if(!flag){
        unRegistred.push(face)
      }
    })
    return <div>UnRegistered Students  
       <DisplayFaces faces={unRegistred} setSelectedIds={setSelectedIds} selectedIds={selectedIds}/>
      
    {selectedIds.length>0?<div>
      <DefaultButton
                          text="Register Selected"
                          onClick={() => {
                            registerStudentsToclass(currentClass,selectedIds);
                          }}
                        />
    </div>:null}
    </div>
  }
  function RegisteredStudents(){
    var registred:Face[]=[]
    var [selectedIds,setSelectedIds]=useState<string[]>([]) 
    croppedFaces.filter(face=>face.Name!=="Unknown").forEach(face=>{
      var flag=false;
     registeredIds.forEach(id=>{
        if(face.PersonId===id){
          flag=true
        }
      })
      if(flag){
        registred.push(face)
      }
    })
    return <div>Registered Students 
       <DisplayFaces faces={registred} setSelectedIds={setSelectedIds} selectedIds={selectedIds}/>
       {selectedIds.length>0?<div>
      <DefaultButton
                          text="Unregister Selected"
                          onClick={() => {
                            unregisterStudentsToclass(currentClass,selectedIds);
                          }}
                        />
    </div>:null}
       </div>
  }
  
  
  function UnKnownStudents(){
  
    var unknownFaces:Face[]=croppedFaces.filter(face=>face.Name==="Unknown")
    var [selectedIds,setSelectedIds]=useState<string[]>([]) 
    return <div>Unknown Students 
      <DisplayFaces faces={unknownFaces} setSelectedIds={setSelectedIds} selectedIds={selectedIds}/>
      </div>
  }
  
  return (
    <div className="App">
      <UserNameProvider.Provider
      value={userInfo.userId}
    >
       <Authenticate setUserInfo={setUserInfo}>
        <AuthenticatedTemplate>
          <UserName/>
          <div>
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
                    {horizontalAlignItems(
                <div style={{ width: "50%" }}>
                  <InputImage setImages={setImages}/>
                </div>,
                <div>
                  

                  <div style={{ alignItems: "center" }}>
                    <Stack tokens={stackTokens}>
                      <PrimaryButton
                        text="Identify"
                        onClick={() =>
                          identifyFaces( images).then((faces:any)=>{
                            setCroppedFaces(faces)
                          })
                        }
                      />
                      {croppedFaces.filter((face) => face.IsCriminal).length >
                      0 ? (
                        <div>
                          Number of Criminals:{" "}
                          {
                            croppedFaces.filter((face) => face.IsCriminal)
                              .length
                          }
                        </div>
                      ) : null}
                      {croppedFaces.filter((face) => face.IsDrowsy).length >
                      0 ? (
                        <div>
                          Number of drowsy people:{" "}
                          {croppedFaces.filter((face) => face.IsDrowsy).length}
                        </div>
                      ) : null}

                      {croppedFaces.map((face, index) => {
                        return (
                          <DisplayFace
                            face={face}
                            index={index}
                            croppedFaces={croppedFaces}
                            setCroppedFaces={setCroppedFaces}
                            setSelectedIds={()=>{}}
                            selectedIds={[]}
                            isClass={false}
                          />
                        );
                      })}
                      {croppedFaces.length > 0 ? (
                        <PrimaryButton
                          text="Confirm Faces"
                          onClick={() =>
                            confirmFaces(images, croppedFaces)
                          }
                        />
                      ) : null}
                      <DefaultButton
                        text="Clear Faces"
                        onClick={() => {
                          clearFaces();
                        }}
                      />
                     
                    </Stack>
                  </div>
                </div>
              )}
                    </PivotItem>
                    <PivotItem headerText="Manage Classes and Students">
                      <div style={{ margin: "100px",width:300 }}>
                       
<Dropdown
        label="Class"
        options={allClasses.map((clas:string)=>{
          return {key:clas,text:clas}
        })
      }
      selectedKey={currentClass}
      styles={dropdownStyles}
      onChange={(event: any, option?: IDropdownOption<any>, index?: number)=>{
        if(option){
          setCurrentClass(option.text.toString())
        }
        
      }}
      />
                
                  {createClass?
        <TextField
            label="ClassName"
            value={newClassName}
            onChange={(event: any, newValue?: string) => {
              if (newValue !== undefined) {
                setNewClassName(newValue)
              }
            }}
          />:null}
      <DefaultButton
                        text={createClass?"Add Class":"Create Class"}
                        onClick={() => {
                          
                        if(createClass){
                          createNewClass(newClassName).then(()=>{
                            getAllClasses().then((classes:any)=>{
                              setAllClasses(classes)
                            })
                          })
                        }                          

                          setCreateClass(!createClass)
                        }}
                      />
      
        <DefaultButton
                        text="Get All Classes"
                        onClick={() => {
                          getAllClasses().then((classes:any)=>{
                            setAllClasses(classes)
                          })
                        }}
                      />
        
                    

                      </div>
                      
{horizontalAlignItems(
                <div style={{ width: "50%" }}>
                  <InputImage setImages={setImages}/>
                </div>,
                <div>
                  

                  <div style={{ alignItems: "center" }}>
                    <Stack tokens={stackTokens}>
                      <PrimaryButton
                        text="Identify"
                        onClick={() =>
                          identifyFaces( images).then((faces:any)=>{
                            setCroppedFaces(faces)
                            getRegisteredIds(currentClass).then((ids:any)=>{
                              setRegisteredIds(ids)
                            })
                          })
                        }
                      />
                       <RegisteredStudents/>
                       <UnRegisteredStudents/>
                          <UnKnownStudents/>
                      
                      {croppedFaces.length > 0 ? (
                        <PrimaryButton
                          text="Confirm Faces"
                          onClick={() =>
                            confirmFaces( images, croppedFaces)
                          }
                        />
                      ) : null}
                      <DefaultButton
                        text="Clear Faces"
                        onClick={() => {
                          clearFaces();
                        }}
                      />
                     
                    </Stack>
                  </div>
                </div>
              )}
                    </PivotItem>
                    <PivotItem headerText="Take Attendance">
                    <InputImage setImages={setImages}/>
                    </PivotItem>
                  </Pivot>
            <div>
             
            </div>
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
