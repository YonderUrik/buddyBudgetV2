
from pymongo import MongoClient
import vars as VARS
import logging
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class BaseMongo(object):
    """
    BaseMongo class. Extend it based on apps. 
    Useful only for connection.
    """

    def __init__(self):
        """
        Create client connection
        """
        super(BaseMongo, self).__init__()

         # Read MongoDB secrets from Docker secrets
        mongodb_username = str(VARS.mongodb_username).strip()
        mongodb_password = str(VARS.mongodb_password).strip()
        logger.debug(VARS.MONGO_HOST)
        self.client = MongoClient(VARS.MONGO_HOST, username=mongodb_username, password=mongodb_password)

    def get_users_list(self):
        return list(self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].find({}))
    
    def get_stocksInfo(self, user_id=None):
        return list(self.client[user_id][VARS.STOCK_INFO_COLLECTION].find({}))
    
    def add_stocks(self, records=None):
        for stock in records:
            date_symbol = stock['date_symbol']
            logger.info(f"Adding {date_symbol}")
            self.client[VARS.DB_NAME][VARS.STOCKS_DATA].update_one({"date_symbol" : date_symbol}, {"$set" : stock}, upsert=True)