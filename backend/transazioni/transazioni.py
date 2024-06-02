from flask import request, Blueprint
import logging
from transazioni.mongo import TransazioniMongo
import json
from datetime import datetime
from authentication.authentication import require_auth
from authlib.integrations.flask_oauth2 import current_token

bp = Blueprint('transazioni', __name__, url_prefix='/api/transazioni')
logger = logging.getLogger(__name__)

@bp.route('/get-last-transactions', methods=["POST"])
@require_auth(None)
def get_last_transactions():
    try:
        user_id = current_token['sub'].replace(".", '')

        mongo = TransazioniMongo()

        status, transactions = mongo.get_last_transactions(user_id=user_id)

        if status != 200:
            raise Exception(transactions)
        
        return json.dumps(transactions, default=str)
    except Exception as e:
        logger.error(e)
        return {"message" : "Impossibile recuperare le ultime transazioni"}, 500
    finally:
        mongo.client.close()

@bp.route('/get-transactions', methods=["POST"])
@require_auth(None)
def get_transactions():
    try:
        user_id = current_token['sub'].replace(".", '')

        page = int(request.json.get('page'))
        pageSize = int(request.json.get('pageSize'))
        sort = request.json.get("sort", {})
        filter = request.json.get("filter", [])

        selectedDateOption = request.json.get("selectedDateOption")

        mongo = TransazioniMongo()
        status, transactions, transactions_count = mongo.get_transactions(user_id=user_id, page=page, pageSize=pageSize, sort=sort, filter=filter, selectedDateOption=selectedDateOption)

        if status != 200:
            raise Exception(transactions)
        
        return json.dumps([transactions, transactions_count], default=str)
    except Exception as e:
        logger.error(e)
        return json.dumps([[], 0], default=str)
    finally:
        mongo.client.close()

@bp.route('/delete-transaction', methods=["POST"])
@require_auth(None)
def delete_transaction():
    try:
        user_id = current_token['sub'].replace(".", '')

        _id = str(request.json.get("_id"))

        mongo = TransazioniMongo()

        status, result = mongo.delete_transaction(user_id=user_id, id=_id)

        if status != 200:
            raise Exception(result)
        
        return {"message" : "Transazione eliminata"}, 200
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non è andato a buon fine, riprova."}, 500
    finally:
        mongo.client.close()

@bp.route('/add-transaction', methods=["POST"])
@require_auth(None)
def add_transaction():
    try:
        user_id = current_token['sub'].replace(".", '')

        request_json = dict(request.json)

        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        transaction_doc = dict()
        transaction_doc["type"] = str(request_json.get("type"))
        transaction_doc["cardName"] = str(request_json.get("cardName"))
        transaction_doc["note"] = str(request_json.get("note"))
        transaction_doc["amount"] = float(request_json.get("amount"))

        if transaction_doc["amount"] <= 0:
            raise Exception("Non è possibile inserire importi negativi o uguali a 0")

        transaction_doc["date"] = datetime.strptime(request_json.get("date"), date_format)
        

        # Define the format of the input string
        if transaction_doc['type'] == 'transfer':
            transaction_doc["cardNameTo"] = str(request_json.get('cardNameTo'))
        else:
            transaction_doc["categoryId"] = request_json['category']['categoryId']
            transaction_doc["subCategoryId"] = request_json['category']['value']


        # Check cardName in list
        mongo = TransazioniMongo()
        status, bankExists = mongo.get_bank_by_name(user_id=user_id, card_name=transaction_doc['cardName'])

        if status == False:
            raise Exception(bankExists)

        if not bankExists and transaction_doc['cardName'] != 'Conto esterno':
            raise Exception("La banca di partenza selezionata non esiste")

        if transaction_doc['type'] == 'transfer':
            status, bankExists = mongo.get_bank_by_name(user_id=user_id, card_name=transaction_doc['cardNameTo'])

            if status == False:
                raise Exception(bankExists)

            if not bankExists and transaction_doc['cardNameTo'] != 'Conto esterno':
                raise Exception("La banca di destinazione selezionata non esiste")

            # If is a transfer do some controls
            if transaction_doc['cardName'] == transaction_doc['cardNameTo']:
                raise Exception("Impossibile transferire sullo stesso conto")
        else:
            # Else do other controlos

            # Check categoryID in list
            is_category_correct = mongo.is_category_in_list(user_id=user_id, categoryId=transaction_doc['categoryId'], operationType=transaction_doc['type'])

            if is_category_correct == False:
                raise Exception("Categoria non presente")

            # Check subCategoryID in list
            is_subcategory_correct = mongo.is_subcategory_in_list(user_id=user_id, categoryId=transaction_doc['categoryId'], subCategoryId=transaction_doc['subCategoryId'], operationType=transaction_doc['type'])

            if is_subcategory_correct == False:
                raise Exception("Sotto categoria non presente")

        status, msg = mongo.add_transaction(user_id=user_id, transaction_doc=transaction_doc)
        if status != 200:
            raise Exception(msg)
        
        logger.info(f"Nuova transazione aggiunta utente {user_id}")
        return {"message": msg}, status
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non è andato a buon fine"}, 500
    finally:
        mongo.client.close()

@bp.route('/edit-transaction', methods=["POST"])
@require_auth(None)
def edit_transaction():
    try:
        user_id = current_token['sub'].replace(".", '')

        data = request.json.get("data")
        id = request.json.get("id")

        transaction_doc = {
            "note" : data.get("note"),
            "amount" : data.get("amount"),
            "categoryId" : data['category']['categoryId'],
            "subCategoryId" : data['category']['value']
        }

        if transaction_doc["amount"] <= 0:
            raise Exception("Non è possibile inserire importi negativi o uguali a 0")

        mongo = TransazioniMongo()

        status, result = mongo.edit_transaction(user_id=user_id, transaction_doc=transaction_doc, id=id)

        if status != 200:
            raise Exception(result)

        return {"message" : "Transazione aggiunta"}, 200
    except Exception as e:
        logger.error(e)
        return {"message" : "Qualcosa non è andato a buon fine, riprova."}, 500
    finally:
        mongo.client.close()

    
    