from flask import request, Blueprint
import logging
from investimenti.mongo import InvestimentiMongo
import json
import vars as VARS
import requests
import investimenti.functions as FUNC
from requests import Session
from requests_cache import CacheMixin
from requests_ratelimiter import LimiterMixin
import requests_cache
import yfinance as yf
import pandas as pd
from authentication.authentication import require_auth
from authlib.integrations.flask_oauth2 import current_token


bp = Blueprint('investimenti', __name__, url_prefix='/api/investimenti')
logger = logging.getLogger(__name__)

class CachedLimiterSession(CacheMixin, LimiterMixin, Session):
    pass

@bp.route('/search', methods=["POST"])
@require_auth(None)
def search():
    try:
        symbol = str(request.json.get('symbol'))

        url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete"

        querystring = {"q":symbol}

        headers = {
            "X-RapidAPI-Key": VARS.XRapidAPIKey,
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }

        response = requests.get(url, headers=headers, params=querystring)

        return json.dumps(response.json(), default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    
@bp.route('/add-transaction', methods=["POST"])
@require_auth(None)
def add_transaction():
    try:
        stockInfo = dict(request.json.get("stockInfo"))
        transactionData = dict(request.json.get("transactionData"))

        user_id = current_token['sub'].replace(".", '')

        transactionData['symbol'] = stockInfo['symbol']

        mongo = InvestimentiMongo()

        # Se la stock non esiste viene aggiunta alla collection delle stocks
        FUNC.addStockInfo(stockInfo=stockInfo, user_id=user_id, mongo=mongo)

        parsed_transaction = FUNC.parseTransaction(transactionData=transactionData)

        status, msg = mongo.add_transaction(doc=parsed_transaction, user_id=user_id)

        if status != 200:
            raise Exception(msg)
        
        symbol = parsed_transaction['symbol']
        date_string = parsed_transaction['date'].date().strftime("%Y-%m-%d")

        session = requests_cache.CachedSession('yfinance.cache')
        session.headers['User-agent'] = 'my-program/1.0'
        data = yf.download(symbol, period="1d", start=date_string, session=session)
        data = data.reset_index()
        data["symbol"] = symbol
        data["Date"] = pd.to_datetime(data["Date"])
        data["date_symbol"] = data['Date'].astype(str) + data['symbol']

        status, msg = mongo.add_historical_data(data=data)

        if status != 200:
            raise Exception(msg)
        
        return {"message" : "transaction added"}, 200

    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    finally:
        mongo.client.close()
    
@bp.route('/get-my-stock', methods=["POST"])
@require_auth(None)
def get_my_stock():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = InvestimentiMongo()
        status, result = mongo.get_my_stocks(user_id=user_id)

        if status != 200:
            raise Exception(result)
        
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-chart', methods=["POST"])
@require_auth(None)
def get_chart():
    try:
        selectedDateOption = request.json.get("selectedDateOption", None)
        user_id = current_token['sub'].replace(".", '')

        mongo = InvestimentiMongo()

        transactions = mongo.get_transaction_by_type(user_id=user_id)
        distinct_symbols = list(set(doc['symbol'] for doc in transactions))
        historical_data = mongo.get_historical_data_by_symbol(symbols=distinct_symbols)

        chart_data = FUNC.calculate_investment_networth(transactions=transactions, historical_data=historical_data, selectedDateOption=selectedDateOption)

        return json.dumps(chart_data, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-last-infos', methods=["POST"])
@require_auth(None)
def get_last_infos():
    try:
        selectedDateOption = request.json.get("selectedDateOption", None)
        user_id = current_token['sub'].replace(".", '')

        mongo = InvestimentiMongo()
        transactions = mongo.get_transaction_by_type(user_id=user_id)
        distinct_symbols = list(set(doc['symbol'] for doc in transactions))
        historical_data = mongo.get_historical_data_by_symbol(symbols=distinct_symbols)

        last_investment_networth = FUNC.get_last_investment_networth(transactions=transactions, historical_data=historical_data, selectedDateOption=selectedDateOption)
        total_invested = 0

        # Itera attraverso la lista di dizionari e somma i valori della chiave 'total'
        for doc in transactions:
            total_invested += doc.get('total', 0) 

        return json.dumps([last_investment_networth, total_invested], default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-allocation-infos', methods=["POST"])
@require_auth(None)
def get_allocation_infos():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = InvestimentiMongo()
        transactions = mongo.get_transaction_by_type(user_id=user_id)
        distinct_symbols = list(set(doc['symbol'] for doc in transactions))
        historical_data = mongo.get_historical_data_by_symbol(symbols=distinct_symbols)
        stocks_info = mongo.get_stocks_info(user_id=user_id)

        allocazione_info = FUNC.get_allocazione(transactions=transactions, historical_data=historical_data, stocks_info=stocks_info)

        return json.dumps(allocazione_info, default=str)

    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-positions-data', methods=["POST"])
@require_auth(None)
def get_positions_data():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = InvestimentiMongo()
        transactions = mongo.get_transaction_by_type(user_id=user_id)
        distinct_symbols = list(set(doc['symbol'] for doc in transactions))
        historical_data = mongo.get_historical_data_by_symbol(symbols=distinct_symbols)
        stocks_info = mongo.get_stocks_info(user_id=user_id)

        allocazione_info = FUNC.get_positions_data(transactions=transactions, historical_data=historical_data, stocks_info=stocks_info)

        return json.dumps(allocazione_info, default=str)
    except Exception as e:
        logger.error(e)
    finally:
        mongo.client.close()