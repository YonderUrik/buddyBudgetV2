from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy
import pandas as pd
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

operator_mapping = {
    # STRINGS
    "contains": lambda field, value: {field: {"$regex": f".*{value}.*"}},
    "equals": lambda field, value: {field: value},
    "startsWith": lambda field, value: {field: {"$regex": f"^{value}.*"}},
    "endsWith": lambda field, value: {field: {"$regex": f".*{value}$"}},
    # INTEGER AND FLOAT
    "=": lambda field, value: {field: float(value)},
    "<": lambda field, value: {field: {"$lt": float(value)}},
    "<=": lambda field, value: {field: {"$lte": float(value)}},
    ">": lambda field, value: {field: {"$gt": float(value)}},
    ">=": lambda field, value: {field: {"$gte": float(value)}},
    # DATES
    "is": lambda field, value: {field: datetime.strptime(value, "%Y-%m-%dT%H:%M")},
    "not": lambda field, value: {field: {"$ne": datetime.strptime(value, "%Y-%m-%dT%H:%M")}},
    "after": lambda field, value: {field: {"$gt": datetime.strptime(value, "%Y-%m-%dT%H:%M")}},
    "before": lambda field, value: {field: {"$lt": datetime.strptime(value, "%Y-%m-%dT%H:%M")}},
    "onOrBefore": lambda field, value: {field: {"$lte": datetime.strptime(value, "%Y-%m-%dT%H:%M")}},
    "onOrAfter": lambda field, value: {field: {"$gte": datetime.strptime(value, "%Y-%m-%dT%H:%M")}},
}

class TransazioniMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init TransazioniMongo -> Extend BaseMongo 
        """
        super(TransazioniMongo, self).__init__()

    def get_bank_by_name(self, user_id=None, card_name=None):

        try:
            if not card_name or not user_id:
                raise Exception("missing card_name or user_id")

            return True, self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": card_name}, sort=[("lastUpdate", -1)])
        except Exception as e:
            return False, str(e)
        
    def is_category_in_list(self, user_id=None, categoryId=None, operationType=None):
        try:
            result = self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})

            if result and operationType in result:
                return categoryId in (cat["category_id"] for cat in result[operationType])
        except Exception as e:
            logger.error(e)

        return False
    
    def is_subcategory_in_list(self, user_id=None, categoryId=None, subCategoryId=None, operationType=None):
        try:
            result = self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})

            if result and operationType in result:
                for category in result[operationType]:
                    if category['category_id'] == categoryId:
                        subcategories = category.get('subcategories', [])
                        subcategory_ids = [subcat['subcategory_id']for subcat in subcategories]
                        return subCategoryId in subcategory_ids

        except Exception as e:
            logger.error(e)
        return False
    
    def add_transaction(self, user_id=None, transaction_doc=None):
        try:
            if not user_id or not transaction_doc:
                raise Exception("missing values")

            if transaction_doc['type'] == 'transfer':
                is_transfer = True
            else:
                is_transfer = False

            # Insert transaction
            result = self.client[user_id][VARS.TRANSACTION_COLLECTION].insert_one(transaction_doc)

            # Now get the last bankBalance before the transaction date
            if not is_transfer:
                if transaction_doc['cardName'] != 'Conto esterno':   
                    new_bank_doc = {
                        "cardName": transaction_doc['cardName'],
                        "lastUpdate": transaction_doc['date'],
                        'transactionID': str(result.inserted_id)
                    }

                    # Get all bank documents where the lastUpdate is greater to the transaction date,
                    # then update all their balance with the new transaction amount
                    # If there are historical data after the transaction date of this transaction
                    bank_documents_to_edit = list(self.client[user_id][VARS.BANKS_COLLECTION].find({"cardName": new_bank_doc['cardName'], "lastUpdate": {"$gt": new_bank_doc['lastUpdate']}}))
                    if bank_documents_to_edit:
                        for elem in bank_documents_to_edit:
                            if transaction_doc['type'] == 'in':
                                new_amount = elem['balance'] + transaction_doc['amount']
                            else:
                                new_amount = elem['balance'] - transaction_doc['amount']

                            self.client[user_id][VARS.BANKS_COLLECTION].update_one({"_id": ObjectId(elem['_id'])}, {"$set": {"balance": new_amount}})

                    last_bank_update = self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": transaction_doc['cardName'], "lastUpdate": {"$lt": transaction_doc['date']}}, sort=[("lastUpdate", -1)])
                    # If there are historical data before the transaction date
                    if last_bank_update:
                        last_balance = last_bank_update['balance']
                    else:
                        last_balance = 0
                        
                    if transaction_doc['type'] == 'in':
                        new_balance = last_balance + transaction_doc['amount']
                    else:
                        new_balance = last_balance - transaction_doc['amount']

                    new_bank_doc['balance'] = new_balance

                    self.client[user_id][VARS.BANKS_COLLECTION].insert_one(new_bank_doc)
            else:
                if transaction_doc['cardName'] == 'Conto esterno':
                    new_bank_doc = {
                        "cardName": transaction_doc['cardNameTo'],
                        "lastUpdate": transaction_doc['date'],
                        'transactionID': str(result.inserted_id)
                    }

                    # If there are historical data after the transaction date
                    bank_documents_to_edit = list(self.client[user_id][VARS.BANKS_COLLECTION].find({"cardName": new_bank_doc['cardName'], "lastUpdate": {"$gt": new_bank_doc['lastUpdate']}}))
                    if bank_documents_to_edit:
                        for elem in bank_documents_to_edit:
                            new_amount = elem['balance'] + transaction_doc['amount']
                            self.client[user_id][VARS.BANKS_COLLECTION].update_one({"_id": ObjectId(elem['_id'])}, {"$set": {"balance": new_amount}})

                    # In this case the transaction is like an income
                    last_bank_update = self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": transaction_doc['cardNameTo'], "lastUpdate": {"$lt": transaction_doc['date']}}, sort=[("lastUpdate", -1)])
                    last_balance = last_bank_update['balance']

                    new_balance = last_balance + transaction_doc['amount']
                    new_bank_doc['balance'] = new_balance
                    self.client[user_id][VARS.BANKS_COLLECTION].insert_one(new_bank_doc)
                elif transaction_doc['cardNameTo'] == 'Conto esterno':
                    new_bank_doc = {
                        "cardName": transaction_doc['cardName'],
                        "lastUpdate": transaction_doc['date'],
                        'transactionID': str(result.inserted_id)
                    }

                    # If there are historical data after the transaction date
                    bank_documents_to_edit = list(self.client[user_id][VARS.BANKS_COLLECTION].find({"cardName": new_bank_doc['cardName'], "lastUpdate": {"$gt": new_bank_doc['lastUpdate']}}))
                    if bank_documents_to_edit:
                        for elem in bank_documents_to_edit:
                            new_amount = elem['balance'] - transaction_doc['amount']
                            self.client[user_id][VARS.BANKS_COLLECTION].update_one({"_id": ObjectId(elem['_id'])}, {"$set": {"balance": new_amount}})
                    
                    last_bank_update = self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": transaction_doc['cardName'], "lastUpdate": {"$lt": transaction_doc['date']}}, sort=[("lastUpdate", -1)])
                    if last_bank_update:
                        last_balance = last_bank_update['balance']
                    else:
                        last_balance = 0

                    new_balance = last_balance - transaction_doc['amount']
                    new_bank_doc['balance'] = new_balance

                    self.client[user_id][VARS.BANKS_COLLECTION].insert_one(new_bank_doc)
                else:
                    new_bank_doc_from = {
                        "cardName": transaction_doc['cardName'],
                        "lastUpdate": transaction_doc['date'],
                        'transactionID' : str(result.inserted_id)
                    }

                    # If there are historical data after the transaction date
                    bank_documents_to_edit = list(self.client[user_id][VARS.BANKS_COLLECTION].find({"cardName": new_bank_doc_from['cardName'], "lastUpdate": {"$gt": new_bank_doc_from['lastUpdate']}}))
                    if bank_documents_to_edit:
                        for elem in bank_documents_to_edit:
                            new_amount = elem['balance'] - transaction_doc['amount']
                            self.client[user_id][VARS.BANKS_COLLECTION].update_one({"_id": ObjectId(elem['_id'])}, {"$set": {"balance": new_amount}})

                    # In this case the transaction is like an transfer from a bank accoun to another
                    last_bank_update_from = self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": transaction_doc['cardName'], "lastUpdate": {"$lt": transaction_doc['date']}}, sort=[("lastUpdate", -1)])
                    if last_bank_update_from:
                        last_balance_from = last_bank_update_from['balance']
                    else:
                        last_balance_from = 0

                    new_balance = last_balance_from - transaction_doc['amount']
                    new_bank_doc_from['balance'] = new_balance

                    self.client[user_id][VARS.BANKS_COLLECTION].insert_one(new_bank_doc_from)

                    last_bank_update_to = self.client[user_id][VARS.BANKS_COLLECTION].find_one({"cardName": transaction_doc['cardNameTo'], "lastUpdate": {"$lt": transaction_doc['date']}}, sort=[("lastUpdate", -1)])
                    if last_bank_update_to:
                        last_balance_to = last_bank_update_to['balance']
                    else:
                        last_balance_to = 0

                    new_bank_doc_to = {
                        "cardName": transaction_doc['cardNameTo'],
                        "lastUpdate": transaction_doc['date'],
                        'transactionID': str(result.inserted_id)
                    }

                    # If there are historical data after the transaction date
                    bank_documents_to_edit = list(self.client[user_id][VARS.BANKS_COLLECTION].find({"cardName": new_bank_doc_to['cardName'], "lastUpdate": {"$gt": new_bank_doc_to['lastUpdate']}}))
                    if bank_documents_to_edit:
                        for elem in bank_documents_to_edit:
                            new_amount = elem['balance'] + transaction_doc['amount']

                            self.client[user_id][VARS.BANKS_COLLECTION].update_one({"_id": ObjectId(elem['_id'])}, {"$set": {"balance": new_amount}})


                    new_balance = last_balance_to + transaction_doc['amount']

                    new_bank_doc_to['balance'] = new_balance

                    self.client[user_id][VARS.BANKS_COLLECTION].insert_one(new_bank_doc_to)

            return 200, "Transazione aggiunta"
        except Exception as e:
            return 500, str(e)

    def get_last_transactions(self, user_id=None):
        try:
            collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]
            result = collection.find({}).sort("date" , -1).limit(10)

            return 200, list(result)
        except Exception as e:
            return 500, str(e)
        
    def delete_transaction(self, user_id=None, id=None):
        try:
            transaction_collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]
            banks_collection = self.client[user_id][VARS.BANKS_COLLECTION]

            transaction_doc = transaction_collection.find_one({"_id" : ObjectId(id)})

            if not transaction_doc:
                raise Exception("Nessuna transazione trovata")
            
            type = transaction_doc['type']
            amount = transaction_doc['amount']

            # Rimuovo documento della banca che si riferisce alla transazione
            logger.info("Rimuovo documento della banca che si riferisce alla transazione")
            banks_collection.delete_one({"transactionID" : id})
            
            if type == 'transfer':
                if transaction_doc['cardName'] != 'Conto esterno':
                    logger.info(f"Transazione di tipo {type}")
                    # Estraggo i documenti di banks successivi a quella transazione
                    banks_after_transactions = list(banks_collection.find({"cardName" : transaction_doc['cardName'], "lastUpdate" : {"$gt" : transaction_doc['date']}}))
                    logger.info(f"Numero di elementi successivi alla transazione da modificare {len(banks_after_transactions)}")
                    for bank in banks_after_transactions:
                        bank_balance = bank['balance']
                        logger.info(f"Valore del conto : {bank_balance}")
                        logger.info(f"Valore della transazione : {amount}")

                        # CardName è da dove sono usciti i soldi, quindi adesso rientrano
                        new_bank_balance =  bank_balance + amount
                        logger.info(f"Nuovo bilancio del conto {new_bank_balance}")
                        banks_collection.update_one({"_id" : ObjectId(bank['_id'])}, {"$set" : {"balance" : new_bank_balance}})
                        logger.info("Valore del bilancio modificato")

                if transaction_doc['cardNameTo'] != 'Conto esterno':
                    logger.info(f"Transazione di tipo {type}")
                    # Estraggo i documenti di banks successivi a quella transazione
                    banks_after_transactions = list(banks_collection.find({"cardNameTo" : transaction_doc['cardNameTo'], "lastUpdate" : {"$gt" : transaction_doc['date']}}))
                    logger.info(f"Numero di elementi successivi alla transazione da modificare {len(banks_after_transactions)}")
                    for bank in banks_after_transactions:
                        bank_balance = bank['balance']
                        logger.info(f"Valore del conto : {bank_balance}")
                        logger.info(f"Valore della transazione : {amount}")

                        # cardNameTo è dove sono arrivati i soldi, adesso li rimuovo
                        new_bank_balance =  bank_balance - amount
                        logger.info(f"Nuovo bilancio del conto {new_bank_balance}")
                        banks_collection.update_one({"_id" : ObjectId(bank['_id'])}, {"$set" : {"balance" : new_bank_balance}})
                        logger.info("Valore del bilancio modificato")
            else:
                # Se il conto è Conto Esterno non devo fare nulla
                if transaction_doc['cardName'] != 'Conto esterno':
                    logger.info(f"Transazione di tipo {type}")
                    # Estraggo i documenti di banks successivi a quella transazione
                    banks_after_transactions = list(banks_collection.find({"cardName" : transaction_doc['cardName'], "lastUpdate" : {"$gt" : transaction_doc['date']}}))
                    logger.info(f"Numero di elementi successivi alla transazione da modificare {len(banks_after_transactions)}")
                    for bank in banks_after_transactions:
                        bank_balance = bank['balance']
                        logger.info(f"Valore del conto : {bank_balance}")
                        logger.info(f"Valore della transazione : {amount}")
                        
                        if type == 'out':
                            # Ho rimosso, adesso riaggungo
                            new_bank_balance =  bank_balance + amount
                        elif type == 'in':
                            # Ho aggiunto, adesso rimuovo
                            new_bank_balance = bank_balance - amount
                        logger.info(f"Nuovo bilancio del conto {new_bank_balance}")
                        banks_collection.update_one({"_id" : ObjectId(bank['_id'])}, {"$set" : {"balance" : new_bank_balance}})
                        logger.info("Valore del bilancio modificato")
            
            logger.info("Rimuovo la transazione")
            transaction_collection.delete_one({"_id" : ObjectId(id)})
            return 200, "Transazione eliminata"
        except Exception as e:
            return 500, str(e)
    
    def get_transactions(self,user_id=None, sort=None, page=None, pageSize=None, filter=None, selectedDateOption=None):
        try:
            mongo = self.client[user_id][VARS.TRANSACTION_COLLECTION]

            filters_query = {}

            for ft in filter:
                logicOperator = ft['logicOperator']
                field = ft['field']
                value = ft['value']
                operator = ft['operator']

                if operator in operator_mapping:
                    query = operator_mapping[operator](field, value)
                    if logicOperator in filters_query:
                        filters_query[logicOperator].append(query)
                    else:
                        filters_query[logicOperator] = [query]
                else:
                    logger.warning(f"Unsupported operator: {operator}")


            # Convert logicOperator keys to MongoDB syntax
            logic_operators = {"and": "$and", "or": "$or"}
            converted_logic_operators = {}
            for key in filters_query:
                if key in logic_operators:
                    converted_logic_operators[logic_operators[key]
                                            ] = filters_query[key]
            
            if selectedDateOption:
                filtersDate = UTILS.DATE_OPTIONS_MAP[selectedDateOption]
                converted_logic_operators["date"] = {"$gte": filtersDate['start_date'], "$lte": filtersDate['end_date']}

            print(converted_logic_operators)
            print(selectedDateOption)
            nr_of_docs = mongo.count_documents(converted_logic_operators)

            if nr_of_docs == 0:
                return 200, pd.DataFrame(), 0

            pipeline = []


            if converted_logic_operators:
                pipeline.append({"$match": converted_logic_operators})

            if sort:
                pipeline.append({"$sort": sort})

            if page:
                pipeline.append({"$skip": (page - 1) * pageSize})

            if pageSize:
                pipeline.append({"$limit": pageSize})

            docs = list(mongo.aggregate(pipeline))
            docs = pd.DataFrame(docs)
            docs.fillna("", inplace=True)

            return 200, docs.to_dict("records"), nr_of_docs
        except Exception as e:
            return 500, str(e), 0

    def edit_transaction(self, user_id=None, transaction_doc=None, id=None):
        try:
            transacion_collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]
            banks_collection = self.client[user_id][VARS.BANKS_COLLECTION]

            transaction_db = transacion_collection.find_one({"_id" : ObjectId(id)})

            if not transaction_db:
                raise Exception("Nessuna transazione trovata")
            
            type = transaction_db['type']
            logger.info(f"TIPO DI TRANSAZIONE : {type}")

            amount = transaction_db['amount']

            new_amount = transaction_doc['amount']
            new_note = transaction_doc['note']
            new_categoryId = transaction_doc['categoryId']
            new_subCategoryId = transaction_doc['subCategoryId']

            
            if type == 'transfer' :
                # Aggiorno il documento della transazione con i nuovi valori
                transacion_collection.update_one(
                    {"_id" : ObjectId(id)}, 
                    {"$set" : 
                        {
                        "amount" : new_amount, 
                        "note" : new_note, 
                        }
                    })
                
                if amount != new_amount:
                    logger.info("Amount differenti")
                    amount_difference = amount-new_amount
                    logger.info(f"Differenza da aggiungere/rimuovere al conto di partenza : {amount_difference}")
                    logger.info(f"Differenza da aggiungere/rimuovere al conto di destinazione : {-amount_difference}")

                    if transaction_db['cardName'] != 'Conto esterno':
                        # Estraggo i valori della banca che devono essere aggiornati con il nuovo balance
                        bank_documents_to_edit = list(banks_collection.find({"cardName": transaction_db['cardName'], "lastUpdate": {"$gte": transaction_db['date']}}))
                        logger.info(f"Documenti trovati : {len(bank_documents_to_edit)}")
                        if bank_documents_to_edit:
                            for elem in bank_documents_to_edit:
                                logger.info(f"Vecchio balance {elem['balance']}")
                                new_balance = elem['balance'] + amount_difference
                                logger.info(f"Nuovo balance {new_balance}")

                                banks_collection.update_one({"_id" : ObjectId(elem['_id'])}, {"$set" : {"balance" : new_balance}})

                    if transaction_db['cardNameTo'] != 'Conto esterno':
                        # Estraggo i valori della banca che devono essere aggiornati con il nuovo balance
                        bank_documents_to_edit = list(banks_collection.find({"cardName": transaction_db['cardNameTo'], "lastUpdate": {"$gte": transaction_db['date']}}))
                        logger.info(f"Documenti trovati : {len(bank_documents_to_edit)}")
                        if bank_documents_to_edit:
                            for elem in bank_documents_to_edit:
                                logger.info(f"Vecchio balance {elem['balance']}")
                                new_balance = elem['balance'] + amount_difference
                                logger.info(f"Nuovo balance {new_balance}")

                                banks_collection.update_one({"_id" : ObjectId(elem['_id'])}, {"$set" : {"balance" : new_balance}})
            else:
                # È una transazione di tipo entrata o uscita
                # Aggiorno il documento della transazione con i nuovi valori
                logger.info("Aggiorno la transazione")
                transacion_collection.update_one(
                    {"_id" : ObjectId(id)}, 
                    {"$set" : 
                        {
                        "amount" : new_amount, 
                        "note" : new_note, 
                        "categoryId" : new_categoryId, 
                        "subCategoryId" : new_subCategoryId
                        }
                    })
                
                if amount != new_amount:
                    if transaction_db['cardName'] != 'Conto esterno':
                        logger.info("Amount differenti")
                        amount_difference = amount-new_amount

                        logger.info(f"Differenza da aggiungere/rimuovere : {amount_difference}")

                        # Estraggo i valori della banca che devono essere aggiornati con il nuovo balance
                        bank_documents_to_edit = list(banks_collection.find({"cardName": transaction_db['cardName'], "lastUpdate": {"$gte": transaction_db['date']}}))
                        print(bank_documents_to_edit)
                        logger.info(f"Documenti trovati : {len(bank_documents_to_edit)}")
                        if bank_documents_to_edit:
                            for elem in bank_documents_to_edit:
                                logger.info(f"Vecchio balance {elem['balance']}")
                                new_balance = elem['balance'] + amount_difference
                                logger.info(f"Nuovo balance {new_balance}")

                                banks_collection.update_one({"_id" : ObjectId(elem['_id'])}, {"$set" : {"balance" : new_balance}})

            return 200, "Transazione modificata"
        except Exception as e:
            return 500, str(e)