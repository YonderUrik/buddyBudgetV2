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
import vars as VARS
import requests

bp = Blueprint('investimenti', __name__, url_prefix='/api/investimenti')
logger = logging.getLogger(__name__)

@bp.route('/search', methods=["POST"])
@jwt_required()
def search():
    try:
        symbol = str(request.json.get('symbol'))
        print(symbol)
        url = "https://yahoo-finance127.p.rapidapi.com/search/{symbol}".format(symbol=symbol)

        headers = {
            "X-RapidAPI-Key": VARS.XRapidAPIKey,
            "X-RapidAPI-Host": "yahoo-finance127.p.rapidapi.com"
        }

        response = requests.get(url, headers=headers)

        return json.dumps(response.json(), default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non ha funzionato"}, 500