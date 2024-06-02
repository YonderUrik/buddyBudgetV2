
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
        self.client = MongoClient(VARS.MONGO_HOST, username=mongodb_username, password=mongodb_password)

    def get_categories(self, user_id=None):
        try:
            self.check_and_create_categories(user_id=user_id)
            return True, self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})
        except Exception as e:
            return False, str(e)
        
    def check_and_create_categories(self, user_id=None):
        category_exists = self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})

        if not category_exists:
            self.client[user_id][VARS.SETTINGS_COLLECTION].insert_one(VARS.DEFAULT_CATEGORIE)