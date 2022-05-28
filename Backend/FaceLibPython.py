
import face_recognition

from PIL import Image
from AzureTableStorage import AzureTableStorage
import numpy as np
class FaceLibPython:
    def __init__(self) :
        self.azureTableStorage=AzureTableStorage()
    def stringEncodingToNumpyArray(self,encoding:str):
        """convert tring encoding into numpy array

        Args:
            encoding (str): encoding in string format

        Returns:
            numpy array: string converted into numpy array
        """
        return np.matrix(encoding).reshape(1,-1).A

    def IsExistingPerson(self,image,userName:str):
        """Checks if person exists in our table or not

        Args:
            image: image
            userName (str): username of the current user

        Returns:
            list: returns [False,encoding in string format] if person does not exist
                    returns [True,Encoding in string format,Name of the person,Is person Criminal or not as boolean,Person Id] if person exists
        """
       
        encoding=face_recognition.face_encodings(image)[0]
        encodingStr=np.array_str(encoding)
        allRows=self.azureTableStorage.getAllRows()
        for i in allRows:
            if "Encoding" in i and "PartitionKey" in i and (i["PartitionKey"]==userName):
                if (i["Encoding"]==encodingStr) or (face_recognition.compare_faces(known_face_encodings=self.stringEncodingToNumpyArray(i["Encoding"]),face_encoding_to_check=encoding)[0]):
                    return [True,i["Encoding"],i["Name"],i["IsCriminal"],i["PersonId"]]
        return [False,encodingStr]
        
    def clearAllFaces(self,userName:str):
        """clear all faces stored by the current user

        Args:
            userName (str): username of the current user
        """
        self.azureTableStorage.clearAllRows(userName)
    def getPredsFaceDetectionPythonLibrary(self,image):
        """_summary_

        Args:
            image : image

        Returns:
            List[Dict]: list of dict where keys in each dict are name of the person and location of the face in input image
        """
        allRows=self.azureTableStorage.getAllRows()
        known_face_encodings=[]
        known_face_names=[]
        for row in allRows:
            if "Encoding" in row and "Name" in row:
                known_face_encodings.append(self.stringEncodingToNumpyArray(row["Encoding"]))
                known_face_names.append(row["Name"])
        
       
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(image)
        face_encodings = face_recognition.face_encodings(image, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            name = "Unknown"
            for i in range(len(known_face_encodings)):
                
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(known_face_encodings[i], face_encoding)
                if True in matches:
                    name=known_face_names[i]
                    break
            face_names.append(name)
        result=[]
        for j in (zip(face_locations, face_names)):
            currentResult={}
            currentResult["Name"]=j[1]
            currentResult["Location"]=j[0]
            result.append(currentResult)
        return result