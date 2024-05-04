from datetime import datetime, timedelta
from requests import Session
from requests_cache import CacheMixin, SQLiteCache
from requests_ratelimiter import LimiterMixin, MemoryQueueBucket
from pyrate_limiter import Duration, RequestRate, Limiter
import requests_cache
import pandas as pd
import utils as UTILS

class CachedLimiterSession(CacheMixin, LimiterMixin, Session):
    pass

session = CachedLimiterSession(
    limiter=Limiter(RequestRate(2, Duration.SECOND*5)),  # max 2 requests per 5 seconds
    bucket_class=MemoryQueueBucket,
    backend=SQLiteCache("yfinance.cache"),
)

def addStockInfo(stockInfo=None, user_id=None, mongo=None):
    if 'symbol' not in stockInfo:
        raise Exception("missing symbol")

    symbol = str(stockInfo['symbol'])

    status, doc = mongo.get_stock_info_by_symbol(symbol=symbol, user_id=user_id)

    if status != 200:
        raise Exception(doc)

    if not doc:
        status, msg = mongo.add_stock_info(doc=stockInfo, user_id=user_id)

        if status != 200:
            raise Exception(msg)

def parseTransaction(transactionData=None):
    new_doc = {
        "symbol" : str(transactionData['symbol']),
        "price" : float(transactionData['price']),
        "quantity" : float(transactionData['quantity']),
        "fee" : float(transactionData['fee']),
        "note" : str(transactionData['note']),
    }

    new_doc['total'] = float(new_doc['quantity'] * new_doc['price'])

    if transactionData['type'] in ['buy', 'sell', 'earn']:
        new_doc['type'] = str(transactionData['type'])
    else:
        raise Exception("Invalid type transaction")

    date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
    new_doc["date"] = datetime.strptime(transactionData["date"], date_format)

    if new_doc["date"].date() > datetime.utcnow().date():
        raise Exception("Date cannot be in the future")

    return new_doc

# TODO : inserire ancora le transazioni di tipo sell e earn
def get_positions_data(transactions=None, historical_data=None, stocks_info=None):
    prima_transazione = transactions[0]["date"].replace(hour=0, minute=0, second=0)
    dati_storici_dict = {record["date_symbol"]: record["Close"] for record in historical_data}
    stock_info_dict = {record["symbol"] : {'type':record["typeDisp"], 'longname' : record["longname"]} for record in stocks_info}

    contatore_quantita = {}
    contatore_invested = {}
    for transazione in transactions:
        if transazione["symbol"] not in contatore_quantita:
            contatore_quantita[transazione["symbol"]] = transazione["quantity"]
            contatore_invested[transazione["symbol"]] = transazione["total"]
        else:
            contatore_quantita[transazione["symbol"]] += transazione["quantity"]
            contatore_invested[transazione["symbol"]] += transazione["total"]

    oggi = datetime.utcnow().strftime("%Y-%m-%d")
    document_to_return = []
    for symbol in contatore_quantita.keys():
        day_symbol_key = f"{oggi}{symbol}"
        if day_symbol_key not in dati_storici_dict:
            temp_giorno_corrente = datetime.utcnow()
            while day_symbol_key not in dati_storici_dict and temp_giorno_corrente >= prima_transazione:
                temp_giorno_corrente -= timedelta(days=1)
                giorno_precedente = temp_giorno_corrente.strftime("%Y-%m-%d")
                day_symbol_key = f"{giorno_precedente}{symbol}"
        
        if day_symbol_key not in dati_storici_dict:
            continue

        document_to_return.append({
            'symbol' : symbol, 
            'type' : stock_info_dict[symbol]["type"], 
            'longname' : stock_info_dict[symbol]["longname"],
            'lastBalance' : contatore_quantita[symbol] * dati_storici_dict[day_symbol_key],
            'quantity' : contatore_quantita[symbol],
            'totalInvested' : contatore_invested[symbol]
        })
    
    return document_to_return

# TODO : inserire ancora le transazioni di tipo sell e earn
def get_allocazione(transactions=None, historical_data=None, stocks_info=None):
    prima_transazione = transactions[0]["date"].replace(hour=0, minute=0, second=0)
    dati_storici_dict = {record["date_symbol"]: record["Close"] for record in historical_data}
    stock_info_dict = {record["symbol"] : {'type':record["typeDisp"], 'shortname' : record["shortname"]} for record in stocks_info}

    contatore_quantita = {}

    for transazione in transactions:
        if transazione["symbol"] not in contatore_quantita:
            contatore_quantita[transazione["symbol"]] = transazione["quantity"]
        else:
            contatore_quantita[transazione["symbol"]] += transazione["quantity"]

    oggi = datetime.utcnow().strftime("%Y-%m-%d")
    document_to_return = []
    for symbol in contatore_quantita.keys():
        day_symbol_key = f"{oggi}{symbol}"
        if day_symbol_key not in dati_storici_dict:
            temp_giorno_corrente = datetime.utcnow()
            while day_symbol_key not in dati_storici_dict and temp_giorno_corrente >= prima_transazione:
                temp_giorno_corrente -= timedelta(days=1)
                giorno_precedente = temp_giorno_corrente.strftime("%Y-%m-%d")
                day_symbol_key = f"{giorno_precedente}{symbol}"
        
        if day_symbol_key not in dati_storici_dict:
            continue

        document_to_return.append({
            'symbol' : symbol, 
            'type' : stock_info_dict[symbol]["type"], 
            'shortname' : stock_info_dict[symbol]["shortname"],
            'lastBalance' : contatore_quantita[symbol] * dati_storici_dict[day_symbol_key]
        })

    return document_to_return

# TODO : inserire ancora le transazioni di tipo sell e earn
def get_last_investment_networth(transactions=None, historical_data=None):
    dati_storici_dict = {record["date_symbol"]: record["Close"] for record in historical_data}
    prima_transazione = transactions[0]["date"].replace(hour=0, minute=0, second=0)

    contatore_quantita = {}
    valore_totale_patrimonio = 0

    for transazione in transactions:
        if transazione["symbol"] not in contatore_quantita:
            contatore_quantita[transazione["symbol"]] = transazione["quantity"]
        else:
            contatore_quantita[transazione["symbol"]] += transazione["quantity"]

    oggi = datetime.utcnow().strftime("%Y-%m-%d")
    for symbol in contatore_quantita.keys():
        day_symbol_key = f"{oggi}{symbol}"
        if day_symbol_key not in dati_storici_dict:
            temp_giorno_corrente = datetime.utcnow()
            while day_symbol_key not in dati_storici_dict and temp_giorno_corrente >= prima_transazione:
                temp_giorno_corrente -= timedelta(days=1)
                giorno_precedente = temp_giorno_corrente.strftime("%Y-%m-%d")
                day_symbol_key = f"{giorno_precedente}{symbol}"
            
        if day_symbol_key not in dati_storici_dict:
            continue
        
        valore_totale_patrimonio += contatore_quantita[symbol] * dati_storici_dict[day_symbol_key]

    return valore_totale_patrimonio

# TODO : inserire ancora le transazioni di tipo sell e earn
def calculate_investment_networth(transactions=None, historical_data=None, selectedDateOption=None):
    prima_transazione = transactions[0]["date"].replace(hour=0, minute=0, second=0)
    oggi = datetime.utcnow()

    # Inizializza l'array per i valori del patrimonio
    patrimonio_per_giorno = []  

    # Creazione di un dizionario dei dati storici per un accesso più rapido
    dati_storici_dict = {record["date_symbol"]: record["Close"] for record in historical_data}

    # Itera attraverso ogni giorno dalla data della prima transazione fino ad oggi
    giorno_corrente = prima_transazione
    contatore_quantita = {}
    while giorno_corrente <= oggi:
        print(giorno_corrente)
        data_corrente = giorno_corrente.strftime("%Y-%m-%d")

        valore_totale_patrimonio = 0
        for transazione in transactions:
            if transazione["date"].replace(hour=0, minute=0, second=0, microsecond=0) == giorno_corrente:
                print("transazione presente")
                
                if transazione["symbol"] not in contatore_quantita:
                    contatore_quantita[transazione["symbol"]] = transazione["quantity"]
                else:
                    contatore_quantita[transazione["symbol"]] += transazione["quantity"]

        for symbol in contatore_quantita.keys():
            day_symbol_key = f"{data_corrente}{symbol}"
            if day_symbol_key not in dati_storici_dict:
                temp_giorno_corrente = giorno_corrente
                while day_symbol_key not in dati_storici_dict and temp_giorno_corrente >= prima_transazione:
                    temp_giorno_corrente -= timedelta(days=1)
                    giorno_precedente = temp_giorno_corrente.strftime("%Y-%m-%d")
                    day_symbol_key = f"{giorno_precedente}{symbol}"
            
            if day_symbol_key not in dati_storici_dict:
                continue
            
            valore_totale_patrimonio += contatore_quantita[symbol] * dati_storici_dict[day_symbol_key]

        # Aggiungi la coppia "data" e "valore del patrimonio" all'array
        patrimonio_per_giorno.append({"name": data_corrente, "Investimenti": valore_totale_patrimonio})

        # Passa al giorno successivo
        giorno_corrente += timedelta(days=1)

    if selectedDateOption:
        patrimonio_per_giorno = pd.DataFrame(patrimonio_per_giorno)
        # Convert 'date' column to datetime type if it's not already in datetime format
        patrimonio_per_giorno['name'] = pd.to_datetime(patrimonio_per_giorno['name'])
        # Apply match_query based on selectedDateOption
        filters = UTILS.get_date_option_filter(selectedDateOption)
        
        if selectedDateOption == 'mese corrente':
            # Filter for the current month
            match_query = patrimonio_per_giorno['name'].dt.month == pd.Timestamp.utcnow().month
        else:
            # Filter for the specified date range
            match_query = (patrimonio_per_giorno['name'] >= filters['start_date']) & (patrimonio_per_giorno['name'] <= filters['end_date'])

        # Apply the match_query to filter the DataFrame
        patrimonio_per_giorno = patrimonio_per_giorno[match_query]
        patrimonio_per_giorno['name'] = patrimonio_per_giorno['name'].dt.strftime('%Y-%m-%d')


        patrimonio_per_giorno = patrimonio_per_giorno.to_dict("records")

    return patrimonio_per_giorno