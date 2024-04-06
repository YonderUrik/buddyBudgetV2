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
import vars as VARS
from datetime import datetime, timezone
import uuid
from email_driver import EmailDriver

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
        
        if user_details['confirm_code'] != None:
            return {"message" : "Utente non attivo"}, 400

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
    
@bp.route('/confirm-registration', methods=["POST"])
def confirm_registration():
    try:
        mongo = AuthMongo()

        request_json = dict(request.json)
        activation_code = request_json['activation_code']

        if activation_code:
            status, msg = mongo.confirm_registration(activation_code=activation_code)
            return {"message" : msg}, status 

    except Exception as e:
        logger.error(e)
        return {"message" : str(e)}, 500
    
@bp.route('/register', methods=["POST"])
def register():
    try:
        mongo = AuthMongo()

        request_json = dict(request.json)

        _name = str(request_json.get("name")).strip()
        _email = UTILS.validate_email(str(request_json.get("email")))
        _password = UTILS.check_password_strength(str(request_json.get("password")))
        _agreement = bool(request_json.get("agreement"))

        if not _agreement:
            raise Exception("Devi accettare le policy")

        _hashed_password = generate_password_hash(_password)

        email_exists = mongo.get_user_by_email(email=_email)

        if email_exists:
            return {"message" : "Questa mail è già associata ad un account"}, 500
        
        activation_code = str(uuid.uuid4())

        user_doc = {
            "firstName" : _name,
            "email" : _email,
            "password" : _hashed_password,
            "confirm_code" : activation_code,
            "agreement" : _agreement,
            "creation_timestamp" : datetime.utcnow(),
            "last_login" : None,
        }

        status, msg = mongo.register_user(user_doc)

        if status != 200:
            raise Exception(msg)
        
        # INVIO LA MAIL
        email_driver = EmailDriver()

        html_page = VARS.REGISTRATION_EMAIL_TEMPLATE.format(activation_code=activation_code)
        response = email_driver.send_email(recipient=_email, category="Registrazione" , subject="Conferma Registrazione", html_page=html_page)

        if response['success'] == False:
            raise Exception("Errore interno")
        
        return {"message" : "registrazione completate"}, 200
    except Exception as e:
        logger.error(e)
        return {"message": str(e)}, 500

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

@bp.route('/refresh')
@jwt_required(refresh=True)
def refresh_jwts():
    logger.info("Token refreshing")
    try:
        resp = jsonify({"success" : True})
        access_token = create_access_token(identity=get_jwt_identity())
        set_access_cookies(resp, access_token)

        return resp, 200
    except Exception as e:
        logger.error(e)
        return jsonify({"success" : False}), 500