from datetime import datetime
from xmlrpc.client import DateTime
from azure.data.tables import TableServiceClient




class AzureTableStorage:
    def __init__(self) :
        connection_string = "DefaultEndpointsProtocol=https;AccountName=engage;AccountKey=jnLRH6LbtRFHgp6EqONWfsR5ViCz3N6R814ZO23amlORiAegzAkEKQ84pOmqaXGVjOVf4Uq4EMYdHqQdZJ6QRw==;TableEndpoint=https://engage.table.cosmos.azure.com:443/;"
        self.service = TableServiceClient.from_connection_string(conn_str=connection_string)
        self.table_client = self.service.get_table_client(table_name="myTable")
        
    def addUser(self,name,encoding,person_id,isCriminal,userName):
        
        return self.addRow({
             u'PartitionKey': userName,
            u'RowKey':  person_id,
            u'Name':name,
             u'Encoding': encoding,
             u'PersonId': person_id,
             u'IsCriminal': isCriminal
                })
    def addRow(self,row):
        entity = self.table_client.upsert_entity(entity=row)
        return entity
    
    def getAllRows(self):
        return self.table_client.list_entities()
    def deleteRow(self,partitionKey,RowKey):
        self.table_client.delete_entity(partitionKey,RowKey)
    
    def clearAllRows(self,userName):
        for row in self.getAllRows():
            if row["PartitionKey"]==userName and ("class" not in row["RowKey"]):
                self.deleteRow(row["PartitionKey"],row["RowKey"])