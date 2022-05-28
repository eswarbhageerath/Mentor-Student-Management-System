import { DetailsHeader, DetailsList, IColumn, IDetailsHeaderProps, IRenderFunction, Panel, PanelType, SelectionMode } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import {
  attendanceReport,
  getRegisteredIds,
  markPresent,
  registerStudentsToclass,
  unregisterStudentsToclass,
} from "../Common/ClassFunctions";
import {
  Face,
  GetCriminals,
  GetKnownFaces,
  GetRegisteredAndUnregistedFaces,
  GetSafePeople,
  GetUnknownFaces,
  InputImage,
} from "../Common/GeneralFunctions";
import { DisplayFace, identifyFaces } from "./../Common/FaceFunctions";
import { CreateSelectClass } from "./CreateSelectClass";

export function ManageClassesAndStudents(props: { ShowToast: any }) {
  const [images, setImages] = React.useState<File[]>([]);

  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [currentClass, setCurrentClass] = useState("");
  const [croppedFaces, setCroppedFaces] = useState<Face[]>([]);

  console.log("cropped", croppedFaces);

  //Display list of faces
  function DisplayFaces(props: {
    faces: Face[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    selectedIds: string[];
    showSelect: boolean;
  }) {
    return (
      <div>
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
              showSelect={props.showSelect}
            />
          );
        })}
      </div>
    );
  }

  //Shows a button and panel to display Unregistred Students
  function UnRegisteredStudents() {
    var knownSafeFaces = GetSafePeople(GetKnownFaces(croppedFaces));
    var unRegistred: Face[] = GetRegisteredAndUnregistedFaces(
      knownSafeFaces,
      registeredIds
    ).unRegistred;
    var [selectedIds, setSelectedIds] = useState<string[]>([]);
    var [isOpen, setIsOpen] = useState(false);
    console.log(selectedIds);

    return (
      <div>
        {unRegistred.length > 0 ? (
          <div>
            <DefaultButton
              text="Click here to view Unregistered Students"
              onClick={() => {
                setIsOpen(true);
              }}
            />
            <Panel
              headerText="Select users to Register"
              isOpen={isOpen}
              type={PanelType.medium}
              onDismiss={() => {
                setIsOpen(false);
              }}
              // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
              closeButtonAriaLabel="Close"
            >
              {selectedIds.length > 0 ? (
                <div style={{ margin: "20px" }}>
                  <DefaultButton
                    text="Register Selected"
                    onClick={() => {
                      registerStudentsToclass(currentClass, selectedIds).then(
                        () => {
                          Identify().then(() => {
                            setIsOpen(false);
                            props.ShowToast("Selected Registred");
                          });
                        }
                      );
                    }}
                  />
                </div>
              ) : null}
              <DisplayFaces
                faces={unRegistred}
                setSelectedIds={setSelectedIds}
                selectedIds={selectedIds}
                showSelect={true}
              />
            </Panel>
          </div>
        ) : null}
      </div>
    );
  }

  //Shows a button and panel to display Registred Students
  function RegisteredStudents() {
    var knownSafeFaces = GetSafePeople(GetKnownFaces(croppedFaces));
    var registred: Face[] = GetRegisteredAndUnregistedFaces(
      knownSafeFaces,
      registeredIds
    ).registred;
    var [selectedIds, setSelectedIds] = useState<string[]>([]);
    var [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        {registred.length > 0 ? (
          <div>
            <DefaultButton
              text="Click here to view Registered Students"
              onClick={() => {
                setIsOpen(true);
              }}
            />
            <Panel
              headerText="Select users to Unregister"
              isOpen={isOpen}
              type={PanelType.medium}
              onDismiss={() => {
                setIsOpen(false);
              }}
              // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
              closeButtonAriaLabel="Close"
            >
              <div>
                {selectedIds.length > 0 ? (
                  <div style={{ margin: "20px" }}>
                    <DefaultButton
                      text="Unregister Selected"
                      onClick={() => {
                        unregisterStudentsToclass(
                          currentClass,
                          selectedIds
                        ).then(() => {
                          Identify().then(() => {
                            setIsOpen(false);

                            props.ShowToast("Selected Unregistred");
                          });
                        });
                      }}
                    />
                  </div>
                ) : null}
                <DisplayFaces
                  faces={registred}
                  setSelectedIds={setSelectedIds}
                  selectedIds={selectedIds}
                  showSelect={true}
                />
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    );
  }
  //Shows a button and panel to display Unknown People
  function UnKnownPeople() {
    var unknownFaces: Face[] = GetUnknownFaces(croppedFaces);
    var [selectedIds, setSelectedIds] = useState<string[]>([]);
    var [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        {unknownFaces.length > 0 ? (
          <div>
            <DefaultButton
              text="Click here to view Unknown People"
              onClick={() => {
                setIsOpen(true);
              }}
            />
            <Panel
              headerText="Unknown People"
              isOpen={isOpen}
              type={PanelType.medium}
              onDismiss={() => {
                setIsOpen(false);
              }}
              closeButtonAriaLabel="Close"
            >
              <DisplayFaces
                faces={unknownFaces}
                setSelectedIds={setSelectedIds}
                selectedIds={selectedIds}
                showSelect={false}
              />
            </Panel>
          </div>
        ) : null}
      </div>
    );
  }

  //Shows a button and panel to display Criminals
  function Criminals() {
    var criminals: Face[] = GetCriminals(croppedFaces);
    var [selectedIds, setSelectedIds] = useState<string[]>([]);
    var [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        {criminals.length > 0 ? (
          <div>
            <DefaultButton
              text="Click here to view Criminals"
              onClick={() => {
                setIsOpen(true);
              }}
            />
            <Panel
              headerText="Criminals Found"
              isOpen={isOpen}
              type={PanelType.medium}
              onDismiss={() => {
                setIsOpen(false);
              }}
              // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
              closeButtonAriaLabel="Close"
            >
              <DisplayFaces
                faces={criminals}
                setSelectedIds={setSelectedIds}
                selectedIds={selectedIds}
                showSelect={false}
              />
            </Panel>
          </div>
        ) : null}
      </div>
    );
  }

  //Shows a button and panel to display Attendance Report
  function AttendanceReport() {
    const [isOpen, setIsOpen] = useState(false);
    const [attendance, setAttendance] = useState<{ [id: string] : string }>({});
    
  const [displayAttendance,setDisplayAttendance]=useState<string[]>([]);
    const [groups, setGroups] = useState<
    {
      key: string;
      name: string;
      startIndex: number;
      count: number;
      level: number;
    }[]
  >([]);
  function MakeGroups() {
    var types: string[] = Object.keys(attendance)
    interface IGroupsNotification {
      key: string;
      name: string;
      startIndex: number;
      count: number;
      level: number;
    }
    var tempGroups: IGroupsNotification[] = [];
    
    setDisplayAttendance([])
    var tempDisplayAttendance:string[]=[]
    types.forEach((type:string) => {
      tempGroups.push({
        key: type,
        name: type,
        level: 0,
        count: attendance[type].length,
        startIndex: displayAttendance.length,
      });
      tempDisplayAttendance=tempDisplayAttendance.concat(
        attendance[type]
      )
    });
    setDisplayAttendance(tempDisplayAttendance)
    setGroups(tempGroups);
  }
  useEffect(() => {
    MakeGroups();
  }, [attendance]);
  console.log(groups,attendance,displayAttendance);
  function _onRenderColumn(item: string, index?: number, column?: IColumn) {
   console.log(item);
   console.log(column);
   
   
    return <div data-is-focusable={true}>{item}</div>;
  }
  function _onRenderDetailsHeader(props: IDetailsHeaderProps, _defaultRender?: IRenderFunction<IDetailsHeaderProps>) {
    return <DetailsHeader {...props} ariaLabelForToggleAllGroupsButton={'Expand collapse groups'} />;
  }
    return (
      <div>
        <PrimaryButton
          text="Get Attendance Report"
          onClick={() =>
            attendanceReport(currentClass).then((value: any) => {
              setAttendance(JSON.parse(JSON.stringify(value)));
              setIsOpen(true);
            })
          }
        />
        <Panel
          headerText="Attendance Report"
          isOpen={isOpen}
          type={PanelType.medium}
          onDismiss={() => {
            setIsOpen(false);
          }}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
        >
          {displayAttendance.length===0?"No Classes Taken":<DetailsList
          items={displayAttendance}
          groups={groups}
          columns={[
            { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
            ]}
         onRenderItemColumn={_onRenderColumn}
         groupProps={{
          showEmptyGroups: true,
        }}
        selectionMode={SelectionMode.none}
         compact={true}
        />}
          
        </Panel>
      </div>
    );
  }

  async function Identify() {
    await identifyFaces(images).then((faces: any) => {
      setCroppedFaces(faces);
      getRegisteredIds(currentClass).then((ids: any) => {
        setRegisteredIds(ids);
      });
    });
  }

  return (
    <div>
      <CreateSelectClass
        currentClass={currentClass}
        setCurrentClass={setCurrentClass}
        ShowToast={props.ShowToast}
      />
      {/*Shows Other Components only if a class is selected */}
      {currentClass !== "" ? (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            {images.length > 0 ? (
              <PrimaryButton
                text="Mark Present"
                onClick={() => {
                  Identify().then(() => {
                    markPresent(images, currentClass).then(() => {
                      props.ShowToast("Marked Present");
                    });
                  });
                }}
              />
            ) : null}

            <AttendanceReport />

            {images.length > 0 ? (
              <PrimaryButton
                text="Identify"
                onClick={() =>
                  Identify().then(() => {
                    props.ShowToast("Faces Identified");
                  })
                }
              />
            ) : null}
          </div>
          {images.length > 0 ? (
            <div
              style={{
                margin: "10px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <RegisteredStudents />
              <UnRegisteredStudents />
              <UnKnownPeople />
              <Criminals />
            </div>
          ) : null}

          <InputImage setImages={setImages} />
        </div>
      ) : null}
    </div>
  );
}
