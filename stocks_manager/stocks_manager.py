import logging
import time
from mongo import BaseMongo
import pandas as pd
from requests import Session
from requests_cache import CacheMixin, SQLiteCache
from requests_ratelimiter import LimiterMixin, MemoryQueueBucket
from pyrate_limiter import Duration, RequestRate, Limiter
import requests_cache
import yfinance as yf
from datetime import datetime, timedelta
import vars as VARS

# Set logging parameters like format, dateformat location etc..
logging.basicConfig(
    format='[%(name)s:%(funcName)20s():%(lineno)s] - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO,
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CachedLimiterSession(CacheMixin, LimiterMixin, Session):
    pass

def main():
    mongo = BaseMongo()
    session = CachedLimiterSession(
    limiter=Limiter(RequestRate(2, Duration.SECOND*5)),  # max 2 requests per 5 seconds
    bucket_class=MemoryQueueBucket,
    backend=SQLiteCache("yfinance.cache"),
    )
    while True:
        try:
            logger.info("START")
            # Get-lists of users
            users_list = mongo.get_users_list()
            logger.info(f"Number of users found : {len(users_list)}")

            df = pd.DataFrame()
            for user in users_list:
                id = str(user['_id'])
                stock_info = mongo.get_stocksInfo(user_id=id)
                
                if stock_info:
                    stock_info_df = pd.DataFrame(stock_info)
                    df = pd.concat([df, stock_info_df], ignore_index=True)


            df = df.drop_duplicates(subset=['symbol'])
            logger.info(f"Number of unique symbols : {df.shape[0]}")

            date_string = datetime.utcnow() - timedelta(days=3)
            date_string = date_string.strftime("%Y-%m-%d")

            if df.shape[0] > 0:
                for stock in df.to_dict("records"):
                    symbol = stock['symbol']
                    logger.debug(symbol)
                    session = requests_cache.CachedSession('yfinance.cache')
                    session.headers['User-agent'] = 'my-program/1.0'
                    data = yf.download(symbol, period="1d", start=date_string, session=session)
                    data = data.reset_index()
                    data["symbol"] = symbol
                    data["Date"] = pd.to_datetime(data["Date"])
                    data["date_symbol"] = data['Date'].astype(str) + data['symbol']

                    mongo.add_stocks(data.to_dict("records"))
                    time.sleep(1)
            
            logger.info("Sleeping for 1hour...")
            time.sleep(60.0 * 60)
        except Exception as e:
            logger.error(e)
            logger.info("Sleeping for 10minutes...")
            time.sleep(60.0 * 10)


if __name__ == '__main__':
    main()