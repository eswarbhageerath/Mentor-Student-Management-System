import { Stack } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import {
  clearFaces,
  confirmFaces,
  DisplayFace,
  identifyFaces,
} from "../Common/FaceFunctions";
import {
  Face,
  GetCriminals,
  GetDrowsy,
  horizontalAlignItems,
  InputImage,
  stackTokens,
} from "../Common/GeneralFunctions";

export function AddFaces(props: { ShowToast: any }) {
  const [images, setImages] = React.useState<File[]>([]);

  const [croppedFaces, setCroppedFaces] = useState<Face[]>([]);
  return (
    <div>
      {" "}
      {horizontalAlignItems(
        <div style={{ width: "50%" }}>
          {/*Input component- by uploading image or via camera*/}
          <InputImage setImages={setImages} />
        </div>,
        <div>
          <div style={{ alignItems: "center" }}>
            <Stack tokens={stackTokens}>
              <PrimaryButton
                text="Identify"
                onClick={() =>
                  identifyFaces(images).then((faces: any) => {
                    setCroppedFaces(faces);
                    props.ShowToast("Faces Identified");
                  })
                }
              />
              {/*Display number of criminals*/}
              {GetCriminals(croppedFaces).length > 0 ? (
                <div>
                  Number of Criminals: {GetCriminals(croppedFaces).length}
                </div>
              ) : null}
              {/*Display number of droswy people*/}
              {GetDrowsy(croppedFaces).length > 0 ? (
                <div>
                  Number of drowsy people: {GetDrowsy(croppedFaces).length}
                </div>
              ) : null}

              {/*Display all faces*/}
              {croppedFaces.map((face, index) => {
                return (
                  <DisplayFace
                    face={face}
                    index={index}
                    croppedFaces={croppedFaces}
                    setCroppedFaces={setCroppedFaces}
                    setSelectedIds={() => {}}
                    selectedIds={[]}
                    isClass={false}
                    showSelect={false}
                  />
                );
              })}

              {croppedFaces.length > 0 ? (
                <PrimaryButton
                  text="Confirm Faces"
                  onClick={() =>
                    confirmFaces(images, croppedFaces).then(() => {
                      props.ShowToast("Faces Confirmed");
                      setCroppedFaces([]);
                    })
                  }
                />
              ) : null}
              <DefaultButton
                text="Clear Faces"
                onClick={() => {
                  clearFaces().then(() => {
                    props.ShowToast("Faces Cleared");
                    setCroppedFaces([]);
                  });
                }}
              />
            </Stack>
          </div>
        </div>
      )}
    </div>
  );
}
