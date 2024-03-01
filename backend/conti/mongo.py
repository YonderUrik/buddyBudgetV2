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
