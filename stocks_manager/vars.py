import os
from dotenv import load_dotenv
load_dotenv()

mongodb_username = os.getenv("mongodb_username", "change-me")
mongodb_password = os.getenv("mongodb_password", "change-me")
MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost:27017')

DB_NAME = 'budget-tracker'
USERS_COLLECTION = 'users'
STOCK_INFO_COLLECTION = 'stocksInfo'
STOCKS_DATA = 'stocksData'