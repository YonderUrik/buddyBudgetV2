
from mongo import BaseMongo
import vars as VARS
import logging

logger = logging.getLogger(__name__)
class AuthMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init AuthMongo -> Extend BaseMongo 
        """
        super(AuthMongo, self).__init__()
        
    def get_user_by_email(self, email=None):
        if not email:
            return 400, None, "No email provided"
        
        try:
            user_info = self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].find_one({"email" : email})
            return user_info
        except Exception as e:
            logger.error(e)
            raise Exception(str(e))

    def set_user_code(self, email=None, code=None):

        if not email or not code:
            return False, "Missing code or email"

        try:
            self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].update_one({"email" : email}, {"$set" : {"confirm_code" : code}})
            return True, "Password resetted"
        except Exception as e:
            logger.error(e)
            return False, str(e)
        
    def set_user_new_password(self, email=None, hashed_password=None):

        if not email or not hashed_password:
            return False, "Missing email or password"
        
        try:
            self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].update_one({"email" : email},{"$set" : {"confirm_code" : None, "password" : hashed_password}})
            return True, "Password setted"
        except Exception as e:
            logger.error(e)
            return False, str(e)
        
    def register_user(self, doc=None):
        
        if not doc:
            return 400, "Missing data"
        
        try:
            _id = self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].insert_one(doc)

            self.client[str(_id.inserted_id)][VARS.SETTINGS_COLLECTION].insert_one(VARS.DEFAULT_CATEGORIE)
            return 200, "success"
        except Exception as e:
            logger.error(e)
            return 500, str(e)