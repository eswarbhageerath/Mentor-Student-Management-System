import { Checkbox, TextField, Toggle } from "@fluentui/react";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { UserNameProvider } from "./../App/App";
import { APIURL, Face } from "./GeneralFunctions";

let userName = "";
export function UserName2() {
  const userNameProvider = useContext(UserNameProvider);
  userName = userNameProvider;
  return <div></div>;
}

// Function to call backend API to delete all face data created by current user
export async function clearFaces() {
  const form = new FormData();
  form.append("UserName", userName);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/clearazurefaces`, requestOptions);
  var json = await response.json();
  console.log(json);
}

// Function to call backend API to add or update face data like name,iscriminal
export async function confirmFaces(images: any, croppedFaces: Face[]) {
  var file = new File(images, "File");
  const form = new FormData();
  form.append("File", file);
  var tempCroppedImages = JSON.parse(JSON.stringify(croppedFaces));
  var i = 0;
  for (i = 0; ; i++) {
    try {
      delete tempCroppedImages[i]["Image"];
    } catch (error) {
      console.log(error);
      break;
    }
  }
  console.log(tempCroppedImages);
  form.append("UserName", userName);
  form.append("Body", JSON.stringify(tempCroppedImages));

  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/confirmfaces`, requestOptions);
  var json = await response.json();
  console.log(json);
}

// Function to call backend API to identify all the people in selected image
export async function identifyFaces(images: any) {
  var file = new File(images, "File");
  const form = new FormData();
  form.append("File", file);
  form.append("UserName", userName);
  const requestOptions: RequestInit = {
    method: "POST",
    body: form,
  };
  var response = await fetch(`${APIURL}/identifyfaces`, requestOptions);
  var json = await response.json();
  console.log(json);
  var tempCroppedFaces = [];
  for (var i = 0; i < Object.keys(json).length; i++) {
    try {
      tempCroppedFaces.push({ ...json[i] });
      delete json[i]["Image"];
    } catch (error) {
      console.log(error);

      break;
    }
  }

  console.log(json);
  return tempCroppedFaces;
}

// Function to display all the cropped images in boxes
export function DisplayFace(props: {
  face: Face;
  index: number;
  croppedFaces: Face[];
  setCroppedFaces: React.Dispatch<React.SetStateAction<Face[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIds: string[];
  isClass: boolean;
  showSelect: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div>
      <Card style={{ width: "18rem" }}>
        {props.showSelect ? (
          <Checkbox
            label="Select"
            checked={isSelected}
            onChange={(ev: any, checked?: boolean) => {
              if (checked !== undefined) {
                setIsSelected(checked);
                var tempSelected = [...props.selectedIds];
                let isExists = false;
                for (var i = 0; i < tempSelected.length; i++) {
                  if (tempSelected[i] === props.face.PersonId) {
                    isExists = true;
                  }
                }

                if (checked) {
                  if (!isExists) {
                    tempSelected.push(props.face.PersonId);
                  }
                } else {
                  tempSelected = tempSelected.filter(
                    (id) => id !== props.face.PersonId
                  );
                }
                props.setSelectedIds(tempSelected);
              }
            }}
          />
        ) : null}

        <Card.Img
          variant="top"
          src={`data:image/png;base64,${props.face.Image}`}
        />
        <Card.Body>
          {edit ? (
            <div>
              <TextField
                label="Name"
                value={props.face.Name}
                onChange={(event: any, newValue?: string) => {
                  if (newValue !== undefined) {
                    var tempCroppedFaces = [...props.croppedFaces];
                    tempCroppedFaces[props.index].Name = newValue;
                    props.setCroppedFaces(tempCroppedFaces);
                  }
                }}
              />
              <Toggle
                label="Is Criminal"
                checked={props.face.IsCriminal}
                onText="Yes"
                offText="No"
                onChange={(e: any, checked?: boolean) => {
                  if (checked !== undefined) {
                    var tempCroppedFaces = [...props.croppedFaces];
                    tempCroppedFaces[props.index].IsCriminal = checked;
                    props.setCroppedFaces(tempCroppedFaces);
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <Card.Title>{props.face.Name}</Card.Title>
              <Card.Text>Drowsy:{props.face.IsDrowsy ? "Yes" : "No"}</Card.Text>
              <Card.Text>
                Criminal:{props.face.IsCriminal ? "Yes" : "No"}
              </Card.Text>
            </div>
          )}
        </Card.Body>
        {props.isClass ? null : (
          <Button
            variant="primary"
            onClick={() => {
              setEdit(!edit);
            }}
          >
            {edit ? "Confirm" : "Edit"}
          </Button>
        )}
      </Card>
    </div>
  );
}
