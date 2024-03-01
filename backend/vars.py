import os
from dotenv import load_dotenv
load_dotenv()

try:
    JWT_SECRET_KEY = open(os.environ.get('JWT_SECRET_KEY')).read()
except Exception:
    JWT_SECRET_KEY = 'change-me'

try:
    HOST_NAME = os.getenv("HOST_NAME")
except:
    HOST_NAME = '0.0.0.0'

MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost:27017')

APP_PORT = int(os.getenv("APP_PORT", 5000))

mongodb_username = os.getenv("mongodb_username", "change-me")
mongodb_password = os.getenv("mongodb_password", "change-me")

DB_NAME = 'budget-tracker'
USERS_COLLECTION = 'users'

# DB of every user is identified by his _id
BANKS_COLLECTION = 'banks'
TRANSACTION_COLLECTION = 'transactions'
SETTINGS_COLLECTION = 'settings'
ASSETS_TRANSACTIONS_COLLECTION = 'assets_transactions'
ASSETS_INFO_COLLECTION = 'assets_info'
ASSETS_HISTORICAL_DATE = 'assets_historical_date'