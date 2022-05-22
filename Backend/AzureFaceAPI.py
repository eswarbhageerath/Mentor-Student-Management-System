import asyncio
import io
import glob
import os
import sys
import time
import uuid
import inspect
from venv import create
import requests
from urllib.parse import urlparse
from io import BytesIO
# To install this module, run:
# python -m pip install Pillow
from PIL import Image, ImageDraw
from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.face.models import TrainingStatusType, Person, QualityForRecognition
import cv2

from AzureTableStorage import AzureTableStorage
class FaceDetector:
    def __init__(self) :
        KEY = "b36d2c23a94742d6bc239d5c874eb707"
        ENDPOINT = "https://engage.cognitiveservices.azure.com/"

        # Create an authenticated FaceClient.
        self.face_client = FaceClient(ENDPOINT, CognitiveServicesCredentials(KEY))
        self.azureTableStorage=AzureTableStorage()
    def IsExistingPerson(self,PERSON_GROUP_ID,test_image_array,isFirstPerson=False):
        
        
        
        preds=self.identifyFaceAgainstDefinedPersonGroup(PERSON_GROUP_ID,test_image_array,isFirstPerson)        
        if len(preds)>0 and len(preds[0]["candidates"])>0:
            return [True,preds[0]["candidates"][0]["person_id"]]
        return [False]  
     
    def tryCreatePersonGroup(self,PERSON_GROUP_ID=None):
        if PERSON_GROUP_ID==None:
          PERSON_GROUP_ID = str(uuid.uuid4()) 
        try:
            self.face_client.person_group.get(PERSON_GROUP_ID)
        except:
            # Create empty Person Group. Person Group ID must be lower case, alphanumeric, and/or with '-', '_'.
            self.face_client.person_group.create(person_group_id=PERSON_GROUP_ID, name=PERSON_GROUP_ID)
            self.tryCreatePersonGroupPerson("Man",glob.glob('obama.jpg'),PERSON_GROUP_ID,True)
        return PERSON_GROUP_ID
    
    
    def trainPersonGroup(self,PERSON_GROUP_ID):
        # Train the person group
        self.face_client.person_group.train(PERSON_GROUP_ID)
        while (True):
            training_status = self.face_client.person_group.get_training_status(PERSON_GROUP_ID)
            print("Training status: {}.".format(training_status.status))
            
            if (training_status.status is TrainingStatusType.succeeded):
                break
            elif (training_status.status is TrainingStatusType.failed):
                self.face_client.person_group.delete(person_group_id=PERSON_GROUP_ID)
                sys.exit('Training the person group has failed.')
            time.sleep(5)
 
    
    def tryCreatePersonGroupPerson(self,person_group_person,test_image_array,PERSON_GROUP_ID,isFirstPerson=False):
        print("called trycreate")
        if not isFirstPerson:
            result=self.IsExistingPerson(PERSON_GROUP_ID,test_image_array,isFirstPerson)
            if result[0]:
                return result
        print("adding now in try create")
        return self.createPersonGroupPerson(person_group_person,test_image_array,PERSON_GROUP_ID)
   
    def createPersonGroupPerson(self,person_group_person,test_image_array,PERSON_GROUP_ID):
        person = self.face_client.person_group_person.create(PERSON_GROUP_ID, person_group_person)
        for image in test_image_array:
            w = open(image, 'r+b')
            self.face_client.person_group_person.add_face_from_stream(PERSON_GROUP_ID, person.person_id, w)
        
        self.trainPersonGroup(PERSON_GROUP_ID)
        preds=self.identifyFaceAgainstDefinedPersonGroup(PERSON_GROUP_ID,test_image_array)
        
        return [True,preds[0]["candidates"][0]["person_id"]]
    
    
            
    def identifyFaceAgainstDefinedPersonGroup(self,PERSON_GROUP_ID,test_image_array,isFirstPerson=False):    
        
        image = open(test_image_array[0], 'r+b')

        # Detect faces
        face_ids = []
        faces = self.face_client.face.detect_with_stream(image)
        for face in faces:
            face_ids.append(face.face_id)
            
        if face_ids==[]:
            return []       
        # Identify faces
        results = self.face_client.face.identify(face_ids,person_group_id= PERSON_GROUP_ID)
        
        if not results:
            results= []
        tempResult= results
        result=[]
        for j in tempResult:
            tempValue={}
            for i in inspect.getmembers(j):
                if not i[0].startswith('_'):
                    # To remove other methods that
                    # doesnot start with a underscore
                    if not inspect.ismethod(i[1]): 
                        if i[0]=='face_id':
                            tempValue[i[0]]=i[1]
                        else:
                            tempValue[i[0]]=[]
                            for k in i[1]:
                                tempDict={}
                                for l in inspect.getmembers(k):
                                    if not l[0].startswith('_'):
                                        if not inspect.ismethod(l[1]):
                                            tempDict[l[0]]=l[1]
                                tempValue[i[0]].append(tempDict.copy())
            result.append(tempValue)
        
        return result  
    def deleteAllPersonGroups(self,PERSON_GROUP_ID):
            for i in self.face_client.person_group.list():
                self.face_client.person_group.delete(person_group_id=i.person_group_id)
            self.tryCreatePersonGroup(PERSON_GROUP_ID=PERSON_GROUP_ID)
        