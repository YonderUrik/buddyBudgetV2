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