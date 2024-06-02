import os
from dotenv import load_dotenv
load_dotenv()

mongodb_username = os.getenv("mongodb_username", "change-me")
mongodb_password = os.getenv("mongodb_password", "change-me")
MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost:27017')

auth0_domain = os.getenv("auth0_domain")
client_id = os.getenv("client_id")
client_secret = os.getenv("client_secret")
audience = f'https://{auth0_domain}/api/v2/'

DB_NAME = 'budget-tracker'
USERS_COLLECTION = 'users'
STOCK_INFO_COLLECTION = 'stocksInfo'
STOCKS_DATA = 'stocksData'