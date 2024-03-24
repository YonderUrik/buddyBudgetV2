from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy

def fill_missing_data(data, distinct_banks, end_date):
    nuovi_dati = []
    dati_ordinati = sorted(data, key=lambda x: datetime.strptime(x['name'], '%Y-%m-%d'))

    start_date = datetime.strptime(dati_ordinati[0]['name'], '%Y-%m-%d')

    if end_date > datetime.utcnow():
        today = datetime.combine(date.today(), datetime.min.time())
    else:
        today = datetime.combine(end_date.date(), datetime.min.time())

    current_date = start_date
    while current_date <= today:
        x = current_date.strftime('%Y-%m-%d')
        # Controllo che ci sia la data
        existing_entry = next((item for item in dati_ordinati if item['name'] == x), None)
        if existing_entry:
            banche_mancanti = set(distinct_banks) - set(existing_entry.keys())
            if banche_mancanti == 0:
                # Non manca nessun valore
                nuovi_dati.append(existing_entry)
            else:
                # Mancano alcune banche
                for banca in banche_mancanti:
                    previous_date = current_date - timedelta(days=1)
                    while previous_date >= start_date:
                        previous_x = previous_date.strftime('%Y-%m-%d')
                        previous_entry = next((item for item in dati_ordinati if item['name'] == previous_x), None)
                        if previous_entry:
                            existing_entry[banca] = round(previous_entry[banca], 2)
                            break
                        else:
                            previous_date -= timedelta(days=1)

                    if banca not in existing_entry:
                        existing_entry[banca] = 0

                nuovi_dati.append(existing_entry)
        else:
            previous_date = current_date - timedelta(days=1)
            previous_x = previous_date.strftime('%Y-%m-%d')
            previous_entry = next((item for item in dati_ordinati if item['name'] == previous_x), None)

            if not previous_entry:
                previous_entry = next((item for item in nuovi_dati if item['name'] == previous_x), None)
            current_entry = copy.deepcopy(previous_entry)
            current_entry['name'] = x
            nuovi_dati.append(current_entry)
        current_date += timedelta(days=1)
    return nuovi_dati

logger = logging.getLogger(__name__)
class HomeMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init HomeMongo -> Extend BaseMongo 
        """
        super(HomeMongo, self).__init__()

    def get_income_vs_expense(self, user_id=None, selectedDateOption=None):
        try:
            collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]

            # Seleziona i filtri in base a selectedDateOption
            filters = UTILS.DATE_OPTIONS_MAP[selectedDateOption]

            if selectedDateOption == 'mese corrente':
                match_query = {"$match": {"type": "in", "date": {"$gte": filters['start_date']}}}
            else:
                match_query = {"$match": {"type": "in", "date": {"$gte": filters['start_date'], "$lte": filters['end_date']}}}

            # Esegui l'aggregazione per ottenere la somma del campo "amount" per i documenti di tipo "in"
            in_pipeline = [
                match_query,
                {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}}}
            ]
            in_result = list(collection.aggregate(in_pipeline))
            total_in_amount = in_result[0]['total_amount'] if in_result else 0

            # Esegui l'aggregazione per ottenere la somma del campo "amount" per i documenti di tipo "out"
            if selectedDateOption == 'mese corrente':
                match_query = {"$match": {"type": "out", "date": {"$gte": filters['start_date']}}}
            else:
                match_query = {"$match": {"type": "out", "date": {"$gte": filters['start_date'], "$lte": filters['end_date']}}}
                
            out_pipeline = [
                match_query,
                {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}}}
            ]
            out_result = list(collection.aggregate(out_pipeline))
            total_out_amount = out_result[0]['total_amount'] if out_result else 0

            return True, [total_in_amount, total_out_amount]
        except Exception as e:
            return False, str(e)
        
    def get_expense_per_category(self, user_id=None, selectedDateOption=None):
        try:
            collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]

            # Seleziona i filtri in base a selectedDateOption
            filters = UTILS.DATE_OPTIONS_MAP[selectedDateOption]

            if selectedDateOption == 'mese corrente':
                match_query = {"$match": {"type": "out", "date": {"$gte": filters['start_date']}}}
            else:
                match_query = {"$match": {"type": "out", "date": {"$gte": filters['start_date'], "$lte": filters['end_date']}}}

            # Aggregazione per raggruppare per categoryId e calcolare il totale degli importi
            pipeline = [
                match_query,
                {"$group": {"_id": "$categoryId", "totalAmount": {"$sum": "$amount"}}},  # Raggruppa per categoryId e calcola il totale degli importi
                {"$project": {"categoryId": "$_id", "totalAmount": 1, "_id": 0}},  # Rinomina _id in categoryId e rimuovi _id dall'output
                {"$sort": {"totalAmount": -1}}  # Ordina per totalAmount in ordine discendente (-1)

            ]

            result = list(collection.aggregate(pipeline))

            status, categories = self.get_categories(user_id=user_id)
            if status == False:
                raise Exception(categories)
            categories = categories['out']

            categories = {doc['category_id'] : doc['category_name'] for doc in categories}

            for expense in result:
                expense['categoryId'] = categories[expense['categoryId']]

            return True, result
        except Exception as e:
            return False, str(e)
        
    def get_total_networth(self, user_id=None):
        try:
            collection = self.client[user_id][VARS.BANKS_COLLECTION]

            # Aggregazione per ottenere l'ultima occorrenza di ogni cardName
            pipeline = [
                {"$sort": {"cardName": 1, "lastUpdate": -1}},
                {"$group": {
                    "_id": "$cardName",
                    "last_update": {"$first": "$lastUpdate"},
                    "balance": {"$first": "$balance"}
                }},
                {"$group": {
                    "_id": None,
                    "total_balance": {"$sum": "$balance"}
                }}
            ]

            # Eseguire l'aggregazione
            result = list(collection.aggregate(pipeline))

            # Ottenere il totale dei balance
            total_balance = result[0]['total_balance'] if result else 0

            return True, total_balance

        except Exception as e:
            return False, str(e)
        
    def get_conti_summary(self, user_id=None):
        try:
            collection = self.client[user_id][VARS.BANKS_COLLECTION]

            # Aggregazione per ottenere l'ultima occorrenza di ogni cardName
            pipeline = [
                {"$sort": {"cardName": 1, "lastUpdate": -1}},
                {"$group": {
                    "_id": "$cardName",
                    "last_update": {"$first": "$lastUpdate"},
                    "balance": {"$first": "$balance"}
                }},
                {"$sort": {"balance": -1}},
            ]

            # Eseguire l'aggregazione
            result = list(collection.aggregate(pipeline))

            return True, result

        except Exception as e:
            return False, str(e)
        
    def get_networth_by_time(self, user_id=None, selectedDateOption=None):
        try:
            collection = self.client[user_id][VARS.BANKS_COLLECTION]
            
            # Seleziona i filtri in base a selectedDateOption
            filters = UTILS.DATE_OPTIONS_MAP[selectedDateOption]
            
            if selectedDateOption == 'mese corrente':
                match_query = {"$match": {"lastUpdate": {"$gte": filters['start_date']}}}
            else:
                match_query = {"$match": {"lastUpdate": {"$gte": filters['start_date'], "$lte": filters['end_date']}}}

            # Create an aggregation pipeline to group data by CardName and date
            pipeline = [
                match_query,
                {
                    "$sort": {
                        "cardName": 1,
                        "lastUpdate": 1
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "cardName": "$cardName",
                            "date": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": "$lastUpdate"
                                }
                            }
                        },
                        "balance": {"$last": "$balance"}
                    }
                },
                {
                    "$project": {
                        "_id" : 0,
                        "name": "$_id.cardName",
                        "date": "$_id.date",
                        "balance": 1,
                        "lastUpdate": 1
                    }
                },
                {
                    "$group": {
                        "_id": "$date",
                        "data": {
                            "$push": {
                                "name": "$name",
                                "balance": "$balance",
                            }
                        }
                    }
                }
            ]

            result = list(collection.aggregate(pipeline))
            
            distinct_banks = collection.distinct("cardName")

            formatted_results = []

            for result in result:
                formatted_result = {
                    "name": result['_id']
                }
                for entry in result['data']:
                    formatted_result[entry['name']] = entry['balance']
                formatted_results.append(formatted_result)

            filled_data = fill_missing_data(formatted_results, distinct_banks, end_date=filters['end_date'])
            return True, filled_data, distinct_banks

        except Exception as e:
            return False, str(e)
        
    def get_categories(self, user_id=None):
        try:
            return 200, self.client[user_id][VARS.SETTINGS_COLLECTION].find_one({"type": "budgetting-categories"})
        except Exception as e:
            return 500, str(e)
        
    