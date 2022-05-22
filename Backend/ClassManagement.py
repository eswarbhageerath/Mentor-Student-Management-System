from AzureTableStorage import AzureTableStorage


class ClassManagement:
    def __init__(self) -> None:
        self.azureTableStorage=AzureTableStorage()
    
    def getRowKeyForClassAttendance(self,className,date):
        return className+"---"+date+"---"+"class"
    
    def getOnlyAddedUsersOfClass(self,userName,className,personIds):
        students=set(self.getAllStudentsOfClass(userName,className))
        addedUsers=[]
        for id in personIds:
            if id in students:
                addedUsers.append(id)
        return addedUsers
    
    def addUserToClass(self,userName,className,PersonId):
        students=set(self.getAllStudentsOfClass(userName,className))
        print("students",students)
        students.add(PersonId)
        return self.AddClassRow(userName,className,self.personIdsToString(list(students)))
    
    def removeUserFromClass(self,userName,className,PersonId):
        students=set(self.getAllStudentsOfClass(userName,className))
        print("students",students)
        if PersonId in students:
            students.remove(PersonId)
            return self.AddClassRow(userName,className,self.personIdsToString(list(students)))
    
    def AddClassRow(self,userName,className,studentsString):
        return self.azureTableStorage.addRow({
             u'PartitionKey': userName,
            u'RowKey': className,
            u'IsClass':True,
            u'Students':studentsString
                }) 
    
    def getAllStudentsOfClass(self,userName,className):
        row=self.getClassRow(userName,className)
        if row!=False: 
            return self.stringToPersonIds(row["Students"])
    
    def getClassRow(self,userName,className):
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and self.IsRowBelongsToClass(row) and (className==row["RowKey"]):
                return row 
        return False
    
    def createClass(self,userName,className):
        row=self.getClassRow(userName,className)
        print(row)
        if row==False:
            return self.AddClassRow(userName,className,self.personIdsToString([]))
    
    def deleteClass(self,userName,className):
        row=self.getClassRow(userName,className)
        if row!=False:
            self.azureTableStorage.deleteRow(row["PartitionKey"],row["RowKey"]) 
            
    def IsRowBelongsToClass(self,row):
        return "IsClass" in row
    
    def getAllClasses(self,userName):
        classes=[]
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and self.IsRowBelongsToClass(row):
                classes.append(row["RowKey"])
        return classes
    
    def personIdsToString(self,personIds):
        return "---".join(map(str,personIds))
    def stringToPersonIds(self,string):
        students= string.split("---")
        if len(students)==1 and students[0]=="":
            return []
        return students
    def markUsersPresent(self,userName,personIds,className,date):
        RowKey=self.getRowKeyForClassAttendance(className,date)
        students=""
        todaysLatestAttendance=set(self.getTodaysLatestAttendance(userName,className,date))
        for personId in personIds:
            todaysLatestAttendance.add(personId)
        students=self.personIdsToString(list(todaysLatestAttendance))
        return self.azureTableStorage.addRow({
             u'PartitionKey': userName,
            u'RowKey':  RowKey,
            u'Attendance':students
                })
    def getTodaysLatestAttendance(self,userName,className,date):
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and (self.getRowKeyForClassAttendance(className,date) == row["RowKey"]):
                return self.stringToPersonIds(row["Attendance"])
        return []
    