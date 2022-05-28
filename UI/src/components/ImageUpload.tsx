import React from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";

export function ImageUpload(props: { images: any; setImages: any }) {
  const maxNumber = 69;

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data uploaded
    props.setImages(imageList as never[]);
  };
  interface tempProps {
    imageList: ImageListType;
    onImageUpload: () => void;
    onImageRemoveAll: () => void;
    onImageUpdate: (index: number) => void;
    onImageRemove: (index: number) => void;
    isDragging: boolean;
    dragProps: {
      onDrop: (e: any) => void;
      onDragEnter: (e: any) => void;
      onDragLeave: (e: any) => void;
      onDragOver: (e: any) => void;
      onDragStart: (e: any) => void;
    };
  }
  return (
    <div className="App">
      <ImageUploading
        multiple
        value={props.images}
        onChange={onChange}
        maxNumber={maxNumber}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }: tempProps) => (
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            <button onClick={onImageRemoveAll}>Remove all images</button>
            {imageList.map((image: any, index: any) => (
              <div key={index} className="image-item">
                <img src={image.dataURL} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageUpdate(index)}>Update</button>
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
