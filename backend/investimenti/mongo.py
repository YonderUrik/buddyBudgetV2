from mongo import BaseMongo
import vars as VARS

class InvestimentiMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init Investimenti -> Extend BaseMongo 
        """
        super(InvestimentiMongo, self).__init__()

    def get_stock_info_by_symbol(self, symbol=None, user_id=None):
        try:
            return 200, self.client[user_id][VARS.STOCKS_INFO_COLLECTION].find_one({"symbol" : symbol})
        except Exception as e:
            return 500, str(e)
        
    def add_stock_info(self, doc=None, user_id=None):
        try:
            self.client[user_id][VARS.STOCKS_INFO_COLLECTION].insert_one(doc)

            return 200, "success"
        except Exception as e:
            return 500, str(e)
        
    def add_transaction(self, doc=None, user_id=None):
        try:
            self.client[user_id][VARS.STOCKS_TRANSACTION_COLLECTION].insert_one(doc)
            return 200, "success"
        except Exception as e:
            return 500, str(e)
        
    def add_historical_data(self, data=None):
        try:
            collection = self.client[VARS.DB_NAME][VARS.STOCKS_DATA]

            records = data.to_dict("records")

            # Estrai tutte le combinazioni uniche di data e simbolo già presenti nel database
            combinazioni_presenti = collection.distinct("date_symbol")

            # Filtra i dati da inserire per rimuovere quelli che corrispondono a combinazioni già presenti
            dati_da_inserire_filtrati = [dato for dato in records if dato["date_symbol"] not in combinazioni_presenti]

            if len(dati_da_inserire_filtrati) > 0:
                collection.insert_many(dati_da_inserire_filtrati)

            return 200, "success"
        except Exception as e:
            return 500, str(e)
        
    def get_my_stocks(self, user_id=None):
        try:
            return 200, list(self.client[user_id][VARS.STOCKS_INFO_COLLECTION].find({}))
        except Exception as e:
            return 500, str(e)
        
    def get_transaction_by_type(self, user_id=None):
        return list(self.client[user_id][VARS.STOCKS_TRANSACTION_COLLECTION].find({}).sort("date" , 1))
    
    def get_historical_data_by_symbol(self, symbols=None):
        return list(self.client[VARS.DB_NAME][VARS.STOCKS_DATA].find({"symbol" : {"$in" : list(symbols)}}))
    
    def get_stocks_info(self, user_id=None):
        return list(self.client[user_id][VARS.STOCKS_INFO_COLLECTION].find({}))
    