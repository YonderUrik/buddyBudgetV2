import os
from dotenv import load_dotenv
load_dotenv()

try:
    JWT_SECRET_KEY = open(os.environ.get('JWT_SECRET_KEY')).read()
except Exception:
    JWT_SECRET_KEY = 'change-me'

try:
    HOST_NAME = os.getenv("HOST_NAME")
except:
    HOST_NAME = '0.0.0.0'

MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost:27017')

APP_PORT = int(os.getenv("APP_PORT", 5000))

mongodb_username = os.getenv("mongodb_username", "change-me")
mongodb_password = os.getenv("mongodb_password", "change-me")

mailtrap_token = os.getenv("mailtrap_token" , None)

DB_NAME = 'budget-tracker'
USERS_COLLECTION = 'users'

# DB of every user is identified by his _id
BANKS_COLLECTION = 'banks'
TRANSACTION_COLLECTION = 'transactions'
SETTINGS_COLLECTION = 'settings'
ASSETS_TRANSACTIONS_COLLECTION = 'assets_transactions'
ASSETS_INFO_COLLECTION = 'assets_info'
ASSETS_HISTORICAL_DATE = 'assets_historical_date'

REGISTRATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma Registrazione</title>
  <style>
    body {{
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }}
    h1, h2, h3, h4, h5, h6 {{
      margin-top: 0;
    }}
    p {{
      margin-bottom: 20px;
    }}
    .button {{
      display: inline-block;
      padding: 10px 20px;
      background-color: #1746A2;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      cursor: pointer;
    }}
    .button:hover {{
      background-color: #0f3260;
    }}
    .footer {{
      margin-top: 30px;
      text-align: center;
      color: #888;
    }}
    .header {{
      text-align: center;
      margin-bottom: 30px;
    }}
    .logo {{
      max-width: 100px;
      height: auto;
    }}
  </style>
</head>
<body>
  <div class="header">
    <img src="https://buddybudget.net/images/android-chrome-512x512.png" alt="BuddyBudgetLogo" class="logo">
  </div>
  <div class="container">
    <h2>Benvenuto su Buddy Budget</h2>
    <p>Grazie per aver registrato un account con noi.</p>
    <p>Per completare la registrazione, clicca sul pulsante qui sotto:</p>
    <form action="https://buddybudget.net/confirm-registration/{activation_code}">
      <button type="submit" class="button">Completa la Registrazione</button>
    </form>
    <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
  </div>
  <div class="footer">
    <p>Questa email ti è stata inviata automaticamente. Per favore, non rispondere a questa email.</p>
  </div>
</body>
</html>
"""

DEFAULT_CATEGORIE = {
  "out": [
    {
      "category_id": 1,
      "category_name": "Casa",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Mutuo/Affitto"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Assicurazione Casa"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Tasse Immobiliari"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Aggiornamenti/Riparazioni Casa"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Spese di Associazione Abitativa"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Servizi Pubblici",
          "subcategories": [
            {
              "subcategory_id": 1,
              "subcategory_name": "Elettricità"
            },
            {
              "subcategory_id": 2,
              "subcategory_name": "Acqua/Acqua Calda"
            },
            {
              "subcategory_id": 3,
              "subcategory_name": "Riscaldamento"
            },
            {
              "subcategory_id": 4,
              "subcategory_name": "Aria Condizionata"
            },
            {
              "subcategory_id": 5,
              "subcategory_name": "Raccolta Differenziata"
            },
            {
              "subcategory_id": 6,
              "subcategory_name": "TV via Cavo"
            },
            {
              "subcategory_id": 7,
              "subcategory_name": "Internet"
            },
            {
              "subcategory_id": 8,
              "subcategory_name": "Telefono Cellulare"
            },
            {
              "subcategory_id": 9,
              "subcategory_name": "Telefono Fisso"
            }
          ]
        }
      ]
    },
    {
      "category_id": 2,
      "category_name": "Trasporti",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Pagamento Auto"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Assicurazione Auto"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Benzina"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Parcheggio"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Registrazione"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Manutenzione"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Riparazioni"
        },
        {
          "subcategory_id": 8,
          "subcategory_name": "Ispezioni"
        },
        {
          "subcategory_id": 9,
          "subcategory_name": "Assistenza Stradale"
        },
        {
          "subcategory_id": 10,
          "subcategory_name": "Taxi/Condivisione Auto"
        },
        {
          "subcategory_id": 11,
          "subcategory_name": "Autobus o Treno"
        },
        {
          "subcategory_id": 12,
          "subcategory_name": "Pedaggio"
        }
      ]
    },
    {
      "category_id": 3,
      "category_name": "Cibo",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Spesa Alimentare"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Mangiare Fuori"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Spuntini"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Bevande"
        }
      ]
    },
    {
      "category_id": 4,
      "category_name": "Medico",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Farmaci"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Visite Dentali"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Cura della Vista"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Attrezzature Mediche"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Assicurazione Medica"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Assicurazione Dentale"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Assicurazione sulla Vita"
        },
        {
          "subcategory_id": 8,
          "subcategory_name": "Servizi Paramedici"
        }
      ]
    },
    {
      "category_id": 5,
      "category_name": "Personale",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Abbigliamento"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Scarpe"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Mobili"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Elettrodomestici"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Decorazioni per la Casa"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Prodotti per la Pulizia"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Forniture Personali"
        },
        {
          "subcategory_id": 8,
          "subcategory_name": "Servizi per Capelli"
        },
        {
          "subcategory_id": 9,
          "subcategory_name": "Servizi per Unghie"
        },
        {
          "subcategory_id": 10,
          "subcategory_name": "Cosmetici"
        },
        {
          "subcategory_id": 11,
          "subcategory_name": "Servizi Spa"
        },
        {
          "subcategory_id": 12,
          "subcategory_name": "Terapia di Massaggio"
        },
        {
          "subcategory_id": 13,
          "subcategory_name": "Sigarette"
        }
      ]
    },
    {
      "category_id": 6,
      "category_name": "Intrattenimento",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Servizi di Streaming"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Abbonamenti"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Iscrizioni"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Uscite"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Hobby"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Sport"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Vacanze"
        },
        {
          "subcategory_id": 8,
          "subcategory_name": "Software"
        }
      ]
    },
    {
      "category_id": 7,
      "category_name": "Educazione",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Retta Scolastica"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Libri di Testo"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Forniture Scolastiche"
        }
      ]
    },
    {
      "category_id": 8,
      "category_name": "Regali",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Compleanni"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Vacanze"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Anniversari"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Donazioni"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Matrimoni"
        },
        {
          "subcategory_id": 6,
          "subcategory_name": "Baby Shower"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Regali per Insegnanti"
        }
      ]
    },
    {
      "category_id": 9,
      "category_name": "Bambini",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Asilo Nido"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Baby Sitter"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Attività"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Forniture per Bambini"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Assegno di Mantenimento"
        }
      ]
    },
    {
      "category_id": 10,
      "category_name": "Animali Domestici",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Cibo per Animali Domestici"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Assicurazione per Animali Domestici"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Forniture per Animali Domestici"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Visite/Veterinarie"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Addestramento"
        }
      ]
    },
    {
      "category_id": 11,
      "category_name": "Debiti",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Carte di Credito"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Linee di Credito"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Prestiti Personali"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Prestiti Studenteschi"
        }
      ]
    },
    {
      "category_id": 13,
      "category_name": "Varie",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Commissioni Carta di Credito"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Commissioni Conto Corrente"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Commissioni Prestito Studentesco"
        }
      ]
    }
  ],
  "in": [
    {
      "category_id": 1,
      "category_name": "Entrate da Lavoro",
      "subcategories": [
        {
          "subcategory_id": 1,
          "subcategory_name": "Lavoro a Tempo Pieno"
        },
        {
          "subcategory_id": 2,
          "subcategory_name": "Bonus"
        },
        {
          "subcategory_id": 3,
          "subcategory_name": "Lavoro Part-Time"
        },
        {
          "subcategory_id": 4,
          "subcategory_name": "Lavoro Stagionale"
        },
        {
          "subcategory_id": 5,
          "subcategory_name": "Rimborso Fiscale"
        }
      ]
    },
        {
      "category_id": 2,
      "category_name": "Investimenti",
      "subcategories": [
        {
          "subcategory_id": 6,
          "subcategory_name": "Dividendi"
        },
        {
          "subcategory_id": 7,
          "subcategory_name": "Interessi Guadagnati"
        },
        {
          "subcategory_id": 8,
          "subcategory_name": "Plusvalenze"
        }
      ]
    },
    {
      "category_id": 3,
      "category_name": "Entrate da Affitti",
      "subcategories": [
        {
          "subcategory_id": 9,
          "subcategory_name": "Affitto Immobiliare"
        },
        {
          "subcategory_id": 10,
          "subcategory_name": "Affitto di Stanza"
        },
        {
          "subcategory_id": 11,
          "subcategory_name": "Affitto per le Vacanze"
        }
      ]
    },
    {
      "category_id": 4,
      "category_name": "Entrate da Attività Commerciale",
      "subcategories": [
        {
          "subcategory_id": 12,
          "subcategory_name": "Ricavi Dalle Vendite"
        },
        {
          "subcategory_id": 13,
          "subcategory_name": "Entrate da Servizi"
        },
        {
          "subcategory_id": 14,
          "subcategory_name": "Tariffe di Consulenza"
        }
      ]
    },
    {
      "category_id": 5,
      "category_name": "Altre Entrate",
      "subcategories": [
        {
          "subcategory_id": 15,
          "subcategory_name": "Regali"
        },
        {
          "subcategory_id": 16,
          "subcategory_name": "Premi"
        },
        {
          "subcategory_id": 17,
          "subcategory_name": "Assegno di Mantenimento"
        }
      ]
    }
  ],
  "type": "budgetting-categories"
}
