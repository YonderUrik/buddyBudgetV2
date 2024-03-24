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
from conti.mongo import ContiMongo
from authentication.mongo import AuthMongo
import json
from datetime import datetime

bp = Blueprint('conti', __name__, url_prefix='/api/conti')
logger = logging.getLogger(__name__)

@bp.route('/add-conto', methods=["POST"])
@jwt_required()
def add_conto():
    try:
        mongo = AuthMongo()
        _user_email = get_jwt_identity()['email']
        user_details = mongo.get_user_by_email(_user_email)
        user_id = str(user_details['_id'])

        request_data = dict(request.json)

        cardName = request_data['cardName'].strip()
        balance = float(request_data['balance'])
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        lastUpdate = datetime.strptime(request_data['lastUpdate'], date_format)

        if cardName.lower() == 'total' or cardName.lower() == 'conto esterno':
            raise Exception("cardName cannot be total")
        
        mongo = ContiMongo()
        status, result = mongo.does_bank_exists(user_id=user_id, cardName=cardName)

        if status != 200:
            raise Exception(result)
        
        if result == True:
            logger.warning("Il nome del conto esiste già")
            return {"message" : "Il nome del conto esiste già"}, 400
        
        conto_sanitized = {
            "cardName" : cardName,
            "balance" : balance,
            "lastUpdate" : lastUpdate
        }
        
        status, result = mongo.add_bank(user_id=user_id, doc=conto_sanitized)

        if status != 200:
            raise Exception(result)
        
        logger.info(f"Conto aggiunto utente {user_id}")
        return {"message" : "Conto aggiunto con success"}, 200
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato, riprova"}, 500
    finally:
        mongo.client.close()


