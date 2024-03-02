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
from authentication.mongo import AuthMongo
import json
from datetime import datetime
from categorie.mongo import CategorieMongo

bp = Blueprint('categorie', __name__, url_prefix='/api/categorie')
logger = logging.getLogger(__name__)

@bp.route('/get-categories-statistics', methods=["POST"])
@jwt_required()
def get_categories_statistics():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

        selectedDateOption = request.json.get("selectedDateOption")

        if selectedDateOption not in UTILS.DATE_OPTIONS_MAP:
            raise Exception(f"selectedOption : {selectedDateOption} not in mapping")

        mongo = CategorieMongo()

        status, transactions = mongo.get_categories_statistics(user_id=user_id, selectedDateOption=selectedDateOption)

        if status != 200:
            raise Exception(transactions)
        
        return json.dumps(transactions, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare le ultime transazioni"}, 500
    finally:
        mongo.client.close()

@bp.route('/edit-subcategory-name', methods=["POST"])
@jwt_required()
def edit_sub_category_name():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

        category_id = int(request.json.get("category_id"))
        sub_category_id = int(request.json.get("sub_category_id"))
        new_sub_category_name = str(request.json.get("new_sub_category_name"))
        transaction_type = str(request.json.get("transaction_type"))

        mongo = CategorieMongo()

        status, result = mongo.edit_sub_category(user_id=user_id, category_id=category_id, sub_category_id=sub_category_id, new_sub_category_name=new_sub_category_name, transaction_type=transaction_type)

        if status != 200:
            raise Exception(result)
        
        return {"message": result}, status
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato, riprova"}, 500
    finally:
        mongo.client.close()

@bp.route('/edit-category-name', methods=["POST"])
@jwt_required()
def edit_category_name():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])
        
        category_id = int(request.json.get("category_id"))
        new_category_name = str(request.json.get("new_category_name"))
        transaction_type = str(request.json.get("transaction_type"))

        mongo = CategorieMongo()

        status, result = mongo.edit_category_name(user_id=user_id, category_id=category_id, new_category_name=new_category_name, transaction_type=transaction_type)

        if status != 200:
            raise Exception(result)
        
        return {"message" : result}, status
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato, riprova"}, 500
    finally:
        mongo.client.close()