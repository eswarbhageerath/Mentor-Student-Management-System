import { TextField } from "@fluentui/react";
import { DefaultButton } from "@fluentui/react/lib/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import Select from "react-dropdown-select";
import { createNewClass, getAllClasses } from "../Common/ClassFunctions";

export function CreateSelectClass(props: {
  currentClass: string;
  setCurrentClass: any;
  ShowToast: any;
}) {
  const [createClass, setCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [allClasses, setAllClasses] = useState<string[]>([]);
  useEffect(() => {
    getAllClasses().then((classes: any) => {
      setAllClasses(classes);
    });
  }, []);

  return (
    <div
      style={{
        margin: "10px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {/* Select class from list of existing classes*/}
      <Select
        values={[
          {
            value: props.currentClass,
            label:
              props.currentClass === "" ? "Select a class" : props.currentClass,
          },
        ]}
        options={allClasses.map((clas: string) => {
          console.log(allClasses, clas);

          return { label: clas, value: clas };
        })}
        style={{ width: "200px" }}
        placeholder="Select a class"
        onChange={(values: any[]) => {
          console.log(values);
          if (values.length > 0) {
            props.setCurrentClass(values[0].value);
          }
        }}
      />
      {/* create a new class*/}
      {createClass ? (
        <TextField
          placeholder="Enter new Class Name.."
          value={newClassName}
          onChange={(event: any, newValue?: string) => {
            if (newValue !== undefined) {
              setNewClassName(newValue);
            }
          }}
        />
      ) : null}
      <DefaultButton
        text={createClass ? "Add Class" : "Create Class"}
        onClick={() => {
          if (createClass) {
            createNewClass(newClassName).then(() => {
              getAllClasses().then((classes: any) => {
                setAllClasses(classes);
                props.ShowToast("Class Added");
              });
            });
          }

          setCreateClass(!createClass);
        }}
      />
    </div>
  );
}
