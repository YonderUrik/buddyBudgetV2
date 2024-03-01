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
from authentication.mongo import AuthMongo
import utils as UTILS

bp = Blueprint('authentication', __name__, url_prefix='/api/auth')
logger = logging.getLogger(__name__)

@bp.route('/login', methods=["POST"])
def login():
    try:
        mongo = AuthMongo()
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Sanitize email
        if not email:
            return jsonify({'error': 'Email richiesta'}), 400
        if not UTILS.EMAIL_REGEX.match(email):
            return jsonify({'error': 'Formato email non valido'}), 400

        # Sanitize password
        if not password:
            return jsonify({'error': 'Password richiesta'}), 400

        user_details = mongo.get_user_by_email(email)

        if not user_details:
            return {"message": "Credenziali errate"}, 401

        if user_details['password'] is None:
            return {"message": "Reset richiesto", "status": 300 }, 300

        if not check_password_hash(user_details['password'], password):
            return {"message": "Credenziali errate"}, 401

        identity = {
            "email" : user_details['email'],
            "role" : 'client',
            "firstName" : user_details['firstName']
        }
        
        # Create the tokens we will be sending back to the user
        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)

        resp = jsonify({'login': True, 'user' : identity})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        
        return resp, 200
    except Exception as e:
        logger.error(e)
        return {"message": "Errore interno"}, 500

@bp.route('/logout', methods=["POST"])
@jwt_required()
def logout():
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)
    return resp, 200

@bp.route('/me', methods=["GET"])
@jwt_required()
def myaccount():
    current_user = get_jwt_identity()
    
    _email = current_user['email']
    mongo = AuthMongo()

    user_details = mongo.get_user_by_email(_email)

    identity = {
        "email" : user_details['email'],
        "role" : 'client',
        "firstName" : user_details['firstName']
    }
    access_token = create_access_token(identity=identity)
    resp = jsonify({'refresh': True, "user": identity})
    set_access_cookies(resp, access_token)

    return resp, 200