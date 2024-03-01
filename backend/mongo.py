
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
        mongodb_username = open(VARS.mongodb_username, 'r').read().strip()
        mongodb_password = open(VARS.mongodb_password, 'r').read().strip()
        self.client = MongoClient(VARS.MONGO_HOST, username=mongodb_username, password=mongodb_password)

    def get_categories(self, user_id=None):
        try:
            return True, self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})
        except Exception as e:
            return False, str(e)