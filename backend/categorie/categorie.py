from flask import request, Blueprint
import logging
import json
from categorie.mongo import CategorieMongo
from authentication.authentication import require_auth
from authlib.integrations.flask_oauth2 import current_token

bp = Blueprint('categorie', __name__, url_prefix='/api/categorie')
logger = logging.getLogger(__name__)

@bp.route('/get-categories-statistics', methods=["POST"])
@require_auth(None)
def get_categories_statistics():
    try:
        user_id = current_token['sub'].replace(".", '')

        selectedDateOption = request.json.get("selectedDateOption")

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
@require_auth(None)
def edit_sub_category_name():
    try:
        user_id = current_token['sub'].replace(".", '')

        category_id = int(request.json.get("category_id"))
        sub_category_id = int(request.json.get("sub_category_id"))
        new_sub_category_name = str(request.json.get("new_sub_category_name"))

        if new_sub_category_name.strip() == '':
            raise Exception("Non è possibile inserire un nome vuoto")

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
@require_auth(None)
def edit_category_name():
    try:
        user_id = current_token['sub'].replace(".", '')
        
        category_id = int(request.json.get("category_id"))
        new_category_name = str(request.json.get("new_category_name"))
        transaction_type = str(request.json.get("transaction_type"))

        if new_category_name.strip() == '':
            raise Exception("Non è possibile inserire un nome vuoto")

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