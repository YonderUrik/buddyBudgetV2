from flask import request, Blueprint
import logging
from home.mongo import HomeMongo
from investimenti.mongo import InvestimentiMongo
from investimenti.functions import get_last_investment_networth
import json
from authentication.authentication import require_auth
from authlib.integrations.flask_oauth2 import current_token


bp = Blueprint('home', __name__, url_prefix='/api/home')
logger = logging.getLogger(__name__)

@bp.route('/get-income-vs-expense', methods=["POST"])
@require_auth(None)
def get_income_vs_expense():
    try:
        selectedDateOption = request.json.get("selectedDateOption")
        
        user_id = current_token['sub'].replace(".", '')
        
        mongo = HomeMongo()
        status, result = mongo.get_income_vs_expense(user_id=user_id, selectedDateOption=selectedDateOption)

        if status == False:
            raise Exception(result)
        
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il flusso di cassa"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-expense-per-category', methods=["POST"])
@require_auth(None)
def get_expense_per_category():
    try:
        selectedDateOption = request.json.get("selectedDateOption")
        user_id = current_token['sub'].replace(".", '')
        
        mongo = HomeMongo()
        status, result = mongo.get_expense_per_category(user_id=user_id, selectedDateOption=selectedDateOption)

        if status == False:
            raise Exception(result)
                
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare le spese per categoria"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-total-networth', methods=["POST"])
@require_auth(None)
def get_total_networth():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = HomeMongo()
        status, result = mongo.get_total_networth(user_id=user_id)

        if status == False:
            raise Exception(result)
        
        mongo = InvestimentiMongo()
        transactions = mongo.get_transaction_by_type(user_id=user_id)
        distinct_symbols = list(set(doc['symbol'] for doc in transactions))
        historical_data = mongo.get_historical_data_by_symbol(symbols=distinct_symbols)

        investment_result = get_last_investment_networth(transactions=transactions, historical_data=historical_data)

        return json.dumps(result+investment_result, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il valore del patrimonio"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-conti-summary', methods=["POST"])
@require_auth(None)
def get_conti_summary():
    try:
        user_id = current_token['sub'].replace(".", '')
        mongo = HomeMongo()
        status, result = mongo.get_conti_summary(user_id=user_id)

        if status == False:
            raise Exception(result)
        
        return json.dumps(result, default=str)

    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il valore dei conti"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-networth-by-time', methods=["POST"])
@require_auth(None)
def get_networth_by_time():
    try:
        selectedDateOption = request.json.get("selectedDateOption")
        bankName = request.json.get("bankName", None)
        
        user_id = current_token['sub'].replace(".", '')

        mongo = HomeMongo()
        status, result, distinct_banks = mongo.get_networth_by_time(user_id=user_id, selectedDateOption=selectedDateOption, bankName=bankName)

        if status == False:
            raise Exception(result)
        
        return json.dumps([result, distinct_banks], default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il valore del patrimonio nel tempo"}, 500
    finally:
        mongo.client.close()
    
@bp.route('/get-categories', methods=["GET"])
@require_auth(None)
def get_categories():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = HomeMongo()
        status, res = mongo.get_categories(user_id=user_id)

        if status != 200:
            raise Exception(res)

        return json.dumps(res, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare le categorie"}, 500
    finally:
        mongo.client.close()