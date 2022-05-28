import { IStackTokens, Pivot, PivotItem } from "@fluentui/react";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from "react";
import { ImageUpload } from "../components/ImageUpload";
import { CameraFeed } from "../Misc/camera-feed";
import { UserName1 } from "./ClassFunctions";
import { UserName2 } from "./FaceFunctions";


export function UserName() {
  return (
    <div>
      <UserName1 />
      <UserName2 />
    </div>
  );
}

export const stackTokens: IStackTokens = { childrenGap: 40 };
/*Function to align to components horizontally*/
export const horizontalAlignItems = (item1: any, item2: any) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {item1}
      {item2}
    </div>
  );
};
/*Url of Backend API*/
export const APIURL ="http://127.0.0.1:5000/"
// "https://backendhostengage.azurewebsites.net/"
//"http://127.0.0.1:5000/";

/*Input component- by uploading image or via camera*/
export function InputImage(props: {
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [imagesUpload, setImagesUpload] = React.useState<any[]>([]);
  useEffect(() => {
    var tempImages: File[] = [];
    imagesUpload.forEach((uploadedImage) => {
      tempImages.push(uploadedImage.file);
    });

    props.setImages(tempImages);
    return;
  }, [imagesUpload]);
  const uploadImage = async (file: any) => {
    console.log(file);

    file = new File([file], "file");
    props.setImages([file]);
  };

  return (
    <div>
      <Pivot>
        <PivotItem headerText="Camera">
          <h1>Image capture</h1>
          <p>Capture image from USB webcamera and upload to form</p>
          <CameraFeed sendFile={uploadImage} />
        </PivotItem>
        <PivotItem headerText="Upload Image">
          <div style={{ margin: "100px" }}>
            <ImageUpload images={imagesUpload} setImages={setImagesUpload} />
          </div>
        </PivotItem>
      </Pivot>
    </div>
  );
}

// interface of a fae
export interface Face {
  IsDrowsy: boolean;
  Name: string;
  Image?: string;
  Location: number[];
  IsCriminal: boolean;
  PersonId: string;
}

//function to get known faces in the given array of face data
export function GetKnownFaces(faces: Face[]) {
  return faces.filter((face) => face.Name !== "Unknown");
}

//function to get unknown faces in the given array of face data
export function GetUnknownFaces(faces: Face[]) {
  return faces.filter((face) => face.Name === "Unknown");
}

//function to identify criminals in the given array of face data
export function GetCriminals(faces: Face[]) {
  return faces.filter((face) => face.IsCriminal);
}

//function to get drowsy faces in the given array of face data
export function GetDrowsy(faces: Face[]) {
  return faces.filter((face) => face.IsDrowsy);
}

//function to getsafe people  in the given array of face data
export function GetSafePeople(faces: Face[]) {
  return faces.filter((face) => !face.IsCriminal);
}

//function to classify Registered And Unregisted Faces in the given array of face data
export function GetRegisteredAndUnregistedFaces(
  faces: Face[],
  registeredIds: string[]
) {
  var unRegistred: Face[] = [];

  var registred: Face[] = [];
  faces.forEach((face) => {
    var flag = false;
    registeredIds.forEach((id: string) => {
      if (face.PersonId === id) {
        flag = true;
      }
    });
    if (flag) {
      registred.push(face);
    } else {
      unRegistred.push(face);
    }
  });
  return { registred: registred, unRegistred: unRegistred };
}
