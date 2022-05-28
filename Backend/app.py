import base64
import glob
import json
from urllib.parse import urlparse
import cv2
from AzureFaceAPI import AzureFaceClientLibraryClass
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename 
import cv2
from PIL import Image
from flask_cors import CORS, cross_origin
import pickle
import io
from PIL import Image
import face_recognition
from PIL import Image
from AzureTableStorage import AzureTableStorage
from ClassManagement import ClassroomManagement
from DrowsinessDetection import DrowsinessDetection
from FaceLibPython import FaceLibPython
from datetime import date
import numpy as np
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


azureFaceDetector=AzureFaceClientLibraryClass()
PERSON_GROUP_ID=azureFaceDetector.tryCreatePersonGroup(PERSON_GROUP_ID="persongroup")
        
azureTableStorage=AzureTableStorage()

faceLibPython =FaceLibPython()

drowsinessDetectior=DrowsinessDetection()
classManagement=ClassroomManagement()
    
    
#Identify faces in the input image and returns their (name,person id,criminal status,drowsy or not,face location, cropped image) for each face
@app.route('/identifyfaces', methods = ['GET', 'POST'])
@cross_origin()
def identifyfaces():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        saveImage(request)
        image=face_recognition.load_image_file("temp.jpg")
        locations=face_recognition.face_locations(image)
        print(locations)
        response={}
        
        for i in range(len(locations)):
            response[i]={}
            response[i]["Location"]=locations[i]
            top, right, bottom, left=locations[i]
            print(top, right, bottom, left)
            currentFace=image[top:bottom, left:right]
            im = Image.fromarray(currentFace)
            im.save("currentFace.jpg")
            with open("currentFace.jpg", "rb") as f:
                im_bytes = f.read()        
            response[i]["Image"]=base64.encodebytes(im_bytes).decode('utf-8')
            f.close()
            faceRecognitionLibraryResult=faceLibPython.IsExistingPerson(face_recognition.load_image_file('currentFace.jpg'),userName)
            response[i]["Name"]="Unknown"
            response[i]["IsCriminal"]=False
            response[i]["IsDrowsy"]=drowsinessDetectior.Predict(currentFace)
            if faceRecognitionLibraryResult[0]:
                response[i]["Name"]=faceRecognitionLibraryResult[2]
                response[i]["IsCriminal"]=faceRecognitionLibraryResult[3]
                response[i]["PersonId"]=faceRecognitionLibraryResult[4]
        if len(locations)==0:
            response["Message"]="No Faces Found"
        return response


   
#Adds or Updates face data like their (name,person id,criminal status) for each face, in database  
@app.route('/confirmfaces', methods = ['GET', 'POST'])
@cross_origin()
def confirmfaces():
    if request.method == 'POST':
        saveImage(request)
        image=face_recognition.load_image_file("temp.jpg")
        body=json.loads(request.form['Body'])
        print(body)
        userName=request.form['UserName']
        
        response={}
        needToTrain=False
        for i in range(len(body)):
            top, right, bottom, left=body[i]["Location"]
            name=body[i]["Name"]
            response[i]={}
            print(top, right, bottom, left)
            currentFace=image[top:bottom, left:right]
            im = Image.fromarray(currentFace)
            im.save("currentFace.jpg")
            print("confirmation")
            try:
                faceLibPythonResult=faceLibPython.IsExistingPerson(face_recognition.load_image_file('currentFace.jpg'),userName)
                encoding=faceLibPythonResult[1]
                if faceLibPythonResult[0]:
                    Person_Id=faceLibPythonResult[4]
                else:
                    isExisting,Person_Id=azureFaceDetector.tryCreatePersonGroupPerson("Man",glob.glob('currentFace.jpg'),PERSON_GROUP_ID)
                    print(isExisting)
                    needToTrain=True
                azureTableStorage.addUser(name,encoding,Person_Id,body[i]["IsCriminal"],userName)
                response[i]["Name"]=name
                response[i]["PersonId"]=Person_Id
            except Exception as e:
                print(e)  
        if needToTrain:    
            azureFaceDetector.trainPersonGroup(PERSON_GROUP_ID)
        return response
    
    
#creates new class if doesnt exist
@app.route('/createclass', methods = ['GET', 'POST'])
@cross_origin()
def createclass():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        row=classManagement.getClassRow(userName,className)
        if row==False:
            print(classManagement.createClass(userName,className))
            print("class created")
            return {"response":"Class Created"}
        else:
            return {"response":"Class Already Exists"}

#returns list of all classes created by current user     
@app.route('/getallclasses', methods = ['GET', 'POST'])
@cross_origin()
def getallclasses():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        classes=classManagement.getAllClasses(userName)
        return {"classes": classes}
        

#returns list of person ids of students registred in the given class       
@app.route('/getregisteredids', methods = ['GET', 'POST'])
@cross_origin()
def getRegisteredIds():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        students=classManagement.getAllStudentsOfClass(userName,className)
        return {"students": students}      
        

#Adds or registers student to the given class      
@app.route('/adduserstoclass', methods = ['GET', 'POST'])
@cross_origin()
def adduserstoclass():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        personIds=request.form['PersonIds'].split("---")
        print(personIds)
        for personId in personIds:
            classManagement.addUserToClass(userName,className,personId)
        return {}

#Reemoves or unregisters student from the given class      
@app.route('/removeusersfromclass', methods = ['GET', 'POST'])
@cross_origin()
def removeusersfromclass():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        personIds=request.form['PersonIds'].split("---")
        print(personIds)
        for personId in personIds:
            classManagement.removeUserFromClass(userName,className,personId)
        return {}
    
#Takes attendance from the image provided to the given class     
@app.route('/takeattendance', methods = ['GET', 'POST'])
@cross_origin()
def takeattendance():
    if request.method == 'POST':
        saveImage(request)
        image=face_recognition.load_image_file("temp.jpg")
        locations=face_recognition.face_locations(image)
        print(locations)
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        personIds=[]
        for i in range(len(locations)):
            top, right, bottom, left=locations[i]
            currentFace=image[top:bottom, left:right]
            im = Image.fromarray(currentFace)
            im.save("currentFace.jpg")
            print("attendance")
            try:
                faceLibPythonResult=faceLibPython.IsExistingPerson(face_recognition.load_image_file('currentFace.jpg'),userName)
                if faceLibPythonResult[0]:
                    personIds.append(faceLibPythonResult[4])
            except Exception as e:
                print(e)     
        classManagement.markUsersPresent(userName,personIds,className,str(date.today())) 
        
        return {}

#returns attendance report of the given class in the form of map where keys are dates and values of names of the students attended to that class on that day
@app.route('/attendancereport', methods = ['GET', 'POST'])
@cross_origin()
def attendancereport():
    if request.method == 'POST':
        
        userName=request.form['UserName']
        
        className=request.form['ClassName']
        print(className)
        attendanceReportWithPersonId=classManagement.getAttendanceReport(userName,className)
        
        personIdNameMapping=azureTableStorage.getPersonIdNameMapping(userName)
        attendanceReportWithName={}
        for date in attendanceReportWithPersonId:
            currentNames=[]
            for personId in attendanceReportWithPersonId[date]:
                currentNames.append(personIdNameMapping[personId])
            attendanceReportWithName[date]=currentNames
        return attendanceReportWithName

#clears all face data stored by current user
@app.route('/clearazurefaces', methods = ['GET', 'POST'])
@cross_origin()
def clearAzureFaces():
    if request.method == 'POST':
        userName=request.form['UserName']
        
        faceLibPython.clearAllFaces(userName)
        return {"clearedFaces":"Done"}
    

   
# Find all the faces in the image  
@app.route('/getFaces', methods = ['GET', 'POST'])
@cross_origin()
def getFaces():
    
    if request.method == 'POST':
        image = saveImage(request)
      
        image = face_recognition.load_image_file("temp.jpg")
        face_locations = face_recognition.face_locations(image)
        predictions={"locations":face_locations}
        return predictions
    
#saves the image sent in Request 
def saveImage(request):
    f = request.files['File']
    f.save(secure_filename('temp.jpg'))
    image=cv2.imread('temp.jpg')
    image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    return image
  

if __name__ == '__main__':
   app.run(debug=True)
   
