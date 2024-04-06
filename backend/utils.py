import re
from datetime import datetime, timedelta, timezone   

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


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

def check_password_strength(password):
    # Regular expressions for checking password criteria
    length_regex = re.compile(r'.{8,}')
    uppercase_regex = re.compile(r'[A-Z]')
    lowercase_regex = re.compile(r'[a-z]')
    digit_regex = re.compile(r'\d')
    special_char_regex = re.compile(r'[!@#$%^&*()\-_=+\\|[\]{};:\'",<.>/?]')

    # Check if password meets all criteria
    has_length = bool(length_regex.search(password))
    has_uppercase = bool(uppercase_regex.search(password))
    has_lowercase = bool(lowercase_regex.search(password))
    has_digit = bool(digit_regex.search(password))
    has_special_char = bool(special_char_regex.search(password))

    # Return True if all criteria are met, False otherwise
    if has_length and has_uppercase and has_lowercase and has_digit and has_special_char:
        return password.strip()
    
    raise Exception("La password è troppo debole")

def validate_email(email=None):
    # Perform email validation using a simple regular expression
    if re.match(r"[^@]+@[^@]+\.[^@]+", email.strip()):
        return email.strip()
    else:
        raise Exception("Indirizzo email non valido")