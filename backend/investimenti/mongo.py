from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy
import pandas as pd
from bson.objectid import ObjectId

class InvestimentiMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init Investimenti -> Extend BaseMongo 
        """
        super(InvestimentiMongo, self).__init__()