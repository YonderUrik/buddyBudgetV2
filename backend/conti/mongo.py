from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)
class ContiMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init ContiMongo -> Extend BaseMongo 
        """
        super(ContiMongo, self).__init__()

    def does_bank_exists(self, user_id=None, cardName=None):
        try:
            collection = self.client[user_id][VARS.BANKS_COLLECTION]
            result = collection.find_one({"cardName" : cardName})

            if result:
                return 200, True
            
            return 200, False
        except Exception as e:
            return 500, str(e)
        
    def add_bank(self, user_id=None, doc=None):
        try:
            collection = self.client[user_id][VARS.BANKS_COLLECTION]

            collection.insert_one(doc)
            return 200, "success"
        except Exception as e:
            return 500, str(e)
