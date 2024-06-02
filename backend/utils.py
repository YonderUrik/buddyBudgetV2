import re
from datetime import datetime, timedelta

def get_date_option_filter(key):
    options_map = {
        'mese corrente': {
            'start_date': datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            'end_date': datetime.utcnow().replace(day=datetime.utcnow().day, hour=23, minute=59, second=59, microsecond=999)
        },
        'scorso mese': {
            'start_date': (datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)).replace(day=1),
            'end_date': (datetime.utcnow().replace(day=1, hour=23, minute=59, second=59, microsecond=999) - timedelta(days=1))
        },
        'ultimi 3 mesi': {
            'start_date': (datetime.utcnow() - timedelta(days=90)).replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            'end_date': datetime.utcnow().replace(day=datetime.utcnow().day, hour=23, minute=59, second=59, microsecond=999)
        },
        'ultimi 6 mesi': {
            'start_date': (datetime.utcnow() - timedelta(days=180)).replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            'end_date': datetime.utcnow().replace(day=datetime.utcnow().day, hour=23, minute=59, second=59, microsecond=999)
        },
        'ultimi 12 mesi': {
            'start_date': (datetime.utcnow() - timedelta(days=365)).replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            'end_date': datetime.utcnow().replace(day=datetime.utcnow().day, hour=23, minute=59, second=59, microsecond=999)
        },
        'anno corrente': {
            'start_date': datetime(datetime.utcnow().year, 1, 1, 0, 0, 0),
            'end_date': datetime(datetime.utcnow().year, 12, 31, 23, 59, 59, 999999)
        },
        'scorso anno': {
            'start_date': datetime(datetime.utcnow().year - 1, 1, 1, 0, 0, 0),
            'end_date': datetime(datetime.utcnow().year - 1, 12, 31, 23, 59, 59, 999999)
        },
        'da sempre': {
            'start_date': datetime(1970, 1, 1, 0, 0, 0),
            'end_date': datetime(datetime.utcnow().year, 12, 31, 23, 59, 59, 999999)
        },
    }
    if key not in options_map:
        raise Exception("Invalid option filter")
    
    return options_map[key]
