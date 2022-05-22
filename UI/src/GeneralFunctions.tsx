import { Pivot, PivotItem } from "@fluentui/react";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from "react";
import "./App.css";
import { UserName1 } from "./ClassFunctions";
import { CameraFeed } from "./components/camera-feed";
import { UserName2 } from "./FaceFunctions";
import { ImageUpload } from "./ImageUpload";
export function UserName() {
    return <div>
        <UserName1/>
        <UserName2/>
    </div>;
}
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
export const APIURL = "http://127.0.0.1:5000/";

export function InputImage(props:{setImages:React.Dispatch<React.SetStateAction<File[]>>}){
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

  return <div>
  <Pivot>
                    <PivotItem headerText="Camera">
                      <h1>Image capture test</h1>
                      <p>Capture image from USB webcamera and upload to form</p>
                      <CameraFeed sendFile={uploadImage} />
                    </PivotItem>
                    <PivotItem headerText="Upload Image">
                      <div style={{ margin: "100px" }}>
                        <ImageUpload
                          images={imagesUpload}
                          setImages={setImagesUpload}
                        />
                      </div>
                    </PivotItem>
                    
                  </Pivot>
  </div>
}
export interface Face{
    IsDrowsy: boolean;
      Name: string;
      Image?: string;
      Location: number[];
      IsCriminal: boolean;
      PersonId:string
}