from flask import request, Blueprint, jsonify
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies
from flask_jwt_extended import create_refresh_token
from flask_jwt_extended import set_refresh_cookies
import logging
import utils as UTILS
from home.mongo import HomeMongo
from authentication.mongo import AuthMongo
import json

bp = Blueprint('home', __name__, url_prefix='/api/home')
logger = logging.getLogger(__name__)

@bp.route('/get-income-vs-expense', methods=["POST"])
@jwt_required()
def get_income_vs_expense():
    try:
        selectedDateOption = request.json.get("selectedDateOption")

        if selectedDateOption not in UTILS.DATE_OPTIONS_MAP:
            raise Exception(f"selectedOption : {selectedDateOption} not in mapping")
        
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])
        
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
@jwt_required()
def get_expense_per_category():
    try:
        selectedDateOption = request.json.get("selectedDateOption")

        if selectedDateOption not in UTILS.DATE_OPTIONS_MAP:
            raise Exception(f"selectedOption : {selectedDateOption} not in mapping")
        
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])
        
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
@jwt_required()
def get_total_networth():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

        mongo = HomeMongo()
        status, result = mongo.get_total_networth(user_id=user_id)

        if status == False:
            raise Exception(result)
        
        return json.dumps(result, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il valore del patrimonio"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-conti-summary', methods=["POST"])
@jwt_required()
def get_conti_summary():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

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
@jwt_required()
def get_networth_by_time():
    try:
        selectedDateOption = request.json.get("selectedDateOption")

        if selectedDateOption not in UTILS.DATE_OPTIONS_MAP:
            raise Exception(f"selectedOption : {selectedDateOption} not in mapping")
        
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

        mongo = HomeMongo()
        status, result, distinct_banks = mongo.get_networth_by_time(user_id=user_id, selectedDateOption=selectedDateOption)

        if status == False:
            raise Exception(result)
        
        return json.dumps([result, distinct_banks], default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare il valore del patrimonio nel tempo"}, 500
    finally:
        mongo.client.close()
    
@bp.route('/get-categories', methods=["GET"])
@jwt_required()
def get_categories():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

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