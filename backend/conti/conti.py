from flask import request, Blueprint
import logging
from conti.mongo import ContiMongo
from datetime import datetime
from authentication.authentication import require_auth
from authlib.integrations.flask_oauth2 import current_token

bp = Blueprint('conti', __name__, url_prefix='/api/conti')
logger = logging.getLogger(__name__)

@bp.route('/add-conto', methods=["POST"])
@require_auth(None)
def add_conto():
    try:
        user_id = current_token['sub'].replace(".", '')

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


