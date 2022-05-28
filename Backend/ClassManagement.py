from AzureTableStorage import AzureTableStorage


class ClassroomManagement:
    """Classroom Management class
    """
    def __init__(self) -> None:
        self.azureTableStorage=AzureTableStorage()
    
    def getRowKeyForClassAttendance(self,className:str,date:str):
        """convert class name and date into string to use as row key

        Args:
            className (str): name of the class
            date (str): date of the attendance

        Returns:
            str: RowKey For Class Attendance
        """
        return className+"---"+date+"---"+"class"
    
    def getOnlyAddedUsersOfClass(self,userName:str,className:str,personIds:list[str]):
        """filter and get only students registered in the class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
            personIds (list[str]): list of students

        Returns:
            list[str]: list of registered students in the class
        """
        students=set(self.getAllStudentsOfClass(userName,className))
        addedUsers=[]
        for id in personIds:
            if id in students:
                addedUsers.append(id)
        return addedUsers
    
    def addUserToClass(self,userName:str,className:str,PersonId:str):
        """Add person id to the class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
            PersonId (str): id of the person to add in class

        Returns:
            Dict: returns class row from the table
        """
        students=set(self.getAllStudentsOfClass(userName,className))
        print("students",students)
        students.add(PersonId)
        return self.AddClassRow(userName,className,self.personIdsToString(list(students)))
    
    def removeUserFromClass(self,userName:str,className:str,PersonId:str):
        """remove person with given Person Id from the class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
            PersonId (str): id of the person to remove from class

        Returns:
            Dict: returns class row from the table
        """
        students=set(self.getAllStudentsOfClass(userName,className))
        print("students",students)
        if PersonId in students:
            students.remove(PersonId)
            return self.AddClassRow(userName,className,self.personIdsToString(list(students)))
    
    def AddClassRow(self,userName:str,className:str,studentsString:str):
        """Add or update the class row

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
            studentsString (str): list of students converted into string

        Returns:
            Dict: returns class row from the table
        """
        return self.azureTableStorage.addRow({
             u'PartitionKey': userName,
            u'RowKey': className,
            u'IsClass':True,
            u'Students':studentsString
                }) 
    
    def getAllStudentsOfClass(self,userName:str,className:str):
        """list of students in the class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class

        Returns:
            list[str]: list of person ids of the students registred in the class
        """
        row=self.getClassRow(userName,className)
        if row!=False: 
            return self.stringToPersonIds(row["Students"])
    
    def getClassRow(self,userName:str,className:str):
        """get row of the class from the table

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class

        Returns:
            Dict|bool: returns Dict-row if class exists
            else returns False
        """
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and self.IsRowBelongsToClass(row) and (className==row["RowKey"]):
                return row 
        return False
    
    def createClass(self,userName:str,className:str):
        """create new class if doesnt exist

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class

        Returns:
            Dict: row of the class in table
        """
        row=self.getClassRow(userName,className)
        print(row)
        if row==False:
            return self.AddClassRow(userName,className,self.personIdsToString([]))
        else:
            return row
    
    def deleteClass(self,userName:str,className:str):
        """delete the class from table

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
        """
        row=self.getClassRow(userName,className)
        if row!=False:
            self.azureTableStorage.deleteRow(row["PartitionKey"],row["RowKey"]) 
            
    def IsRowBelongsToClass(self,row):
        """does this row represent a class?

        Args:
            row (Dict): row to check

        Returns:
            bool: True if it represents a class
            else False
        """
        return "IsClass" in row
    
    def getAllClasses(self,userName:str):
        """get list of all classes created by the user

        Args:
            userName (str): username of the user

        Returns:
            List[str]: list of names of the classes
        """
        classes=[]
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and self.IsRowBelongsToClass(row):
                classes.append(row["RowKey"])
        return classes
    
    def personIdsToString(self,personIds:list[str]):
        """converts list of person ids to single string

        Args:
            personIds (list[str]): list of person ids

        Returns:
            str: list of person ids converted to a string
        """
        return "---".join(map(str,personIds))
    def stringToPersonIds(self,string:str):
        """convert string into list of person ids 

        Args:
            string (str): string of list of person ids

        Returns:
            List[str]: list of person ids
        """
        students= string.split("---")
        if len(students)==1 and students[0]=="":
            return []
        return students
    def markUsersPresent(self,userName:str,personIds:list[str],className:str,date:str):
        """mark students present in the given class

        Args:
            userName (str): username of the owner of the class
            personIds (list[str]): list of person ids found in the image
            className (str): name of the class
            date (str): date of attendance

        Returns:
            Dict: attendance row added to the table
        """
        RowKey=self.getRowKeyForClassAttendance(className,date)
        students=""
        todaysLatestAttendance=set(self.getTodaysLatestAttendance(userName,className,date))
        personIds=self.getOnlyAddedUsersOfClass(userName,className,personIds)
        for personId in personIds:
            todaysLatestAttendance.add(personId)
        students=self.personIdsToString(list(todaysLatestAttendance))
        print(userName,RowKey,students)
        return self.azureTableStorage.addRow({
             u'PartitionKey': userName,
            u'RowKey':  RowKey,
            u'Attendance':students
                })
    def getTodaysLatestAttendance(self,userName:str,className:str,date:str):
        """Get latest attendance of the given date and class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class
            date (str): date of attendance

        Returns:
            list[str]: list of person ids of the students attended the class on the given date
        """
        for row in self.azureTableStorage.getAllRows():
            if row["PartitionKey"]==userName and (self.getRowKeyForClassAttendance(className,date) == row["RowKey"]):
                return self.stringToPersonIds(row["Attendance"])
        return []
    
    def getAttendanceReport(self,userName:str,className:str):
        """get the attendance report of the given class

        Args:
            userName (str): username of the owner of the class
            className (str): name of the class

        Returns:
            Dict: returns a map where keys are dates and values are list of names of the students attended the class
        """
        attendance={}
        for row in self.azureTableStorage.getAllRows():
            rowKey=row["RowKey"].split("---")
            if row["PartitionKey"]==userName and len(rowKey)==3 and rowKey[2]=="class" and rowKey[0]==className:
                attendance[rowKey[1]]= self.stringToPersonIds(row["Attendance"])
        return attendance
    
    
    