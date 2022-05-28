from azure.data.tables import TableServiceClient



class AzureTableStorage:
    """Class to manage azure table storage
    """
    def __init__(self)->None :
        connection_string = "DefaultEndpointsProtocol=https;AccountName=engage;AccountKey=jnLRH6LbtRFHgp6EqONWfsR5ViCz3N6R814ZO23amlORiAegzAkEKQ84pOmqaXGVjOVf4Uq4EMYdHqQdZJ6QRw==;TableEndpoint=https://engage.table.cosmos.azure.com:443/;"
        self.service = TableServiceClient.from_connection_string(conn_str=connection_string)
        self.table_client = self.service.get_table_client(table_name="myTable")
        
    def addUser(self,name:str,encoding:str,person_id:str,isCriminal:bool,userName:str):
        """Add person to the table

        Args:
            name (str): name of the person
            encoding (str): face encoding of the person
            person_id (str): person id of the person
            isCriminal (bool): is person criminal?
            userName (str): username os the User adding the person to database

        Returns:
            Dict[str, str]: row added to the table
        """
        return self.addRow({
             u'PartitionKey': userName,
            u'RowKey':  person_id,
            u'Name':name,
             u'Encoding': encoding,
             u'PersonId': person_id,
             u'IsCriminal': isCriminal
                })
    def addRow(self,row:any):
        """Add row to the table

        Args:
            row (Dict): Row to add to the table

        Returns:
            Dict[str, str]: row added to the table
        """
        entity = self.table_client.upsert_entity(entity=row)
        return entity
    
    def getAllRows(self):
        """Return all rows from the table

        Returns:
            List[any]: List of the rows in the table
        """
        return self.table_client.list_entities()
    def deleteRow(self,partitionKey:str,RowKey:str):
        """delete row with given partition key and row key

        Args:
            partitionKey (str): partition Key of the row
            RowKey (str): Row Key of the row
        """
        self.table_client.delete_entity(partitionKey,RowKey)
    
    def clearAllRows(self,userName:str):
        """Clear all rows of the user with given username i.e 
        delete all data of current user from the table

        Args:
            userName (str): username of the current user
        """
        for row in self.getAllRows():
            if row["PartitionKey"]==userName and ("class" not in row["RowKey"]):
                self.deleteRow(row["PartitionKey"],row["RowKey"])
    def getPersonIdNameMapping(self,userName:str):
        """get person id and Name mapping of all the people created by current user

        Args:
            userName (str): username of the current user

        Returns:
            Dict: returns map where key is person id and value is name
        """
        mapping={}
        for row in self.getAllRows():
            rowKey=row["RowKey"].split("---")
            if row["PartitionKey"]==userName and len(rowKey)==1 and ("IsClass" not in row):
                
                mapping[row["RowKey"]]=row["Name"]
        return mapping
    