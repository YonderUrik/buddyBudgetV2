import logging
from flask import Flask, jsonify
from flask_cors import CORS
import vars as VARS

# Set logging parameters like format, dateformat location etc..
logging.basicConfig(
    format='[%(name)s:%(funcName)20s():%(lineno)s] - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.DEBUG,
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Set-up Flask app
app = Flask(__name__)

CORS(app, origins=['http://localhost:3000'])

# Custom error handler for 404 Not Found
@app.errorhandler(404)
def not_found(error):
    logger.error(error)
    return jsonify({'error': 'Richiesta non trovata'}), 404

# Custom error handler for 400 Bad Request
@app.errorhandler(400)
def bad_request(error):
    logger.error(error)
    return jsonify({'error': 'Bad Request'}), 400

# Custom error handler for 401 Unauthorized
@app.errorhandler(401)
def unauthorized(error):
    logger.error(error)
    return jsonify({'error': 'Non autorizzato'}), 401

# Custom error handler for 403 Forbidden
@app.errorhandler(403)
def forbidden(error):
    logger.error(error)
    return jsonify({'error': 'Accesso negato'}), 403

# Custom error handler for 500 Internal Server Error
@app.errorhandler(500)
def internal_server_error(error):
    logger.error(error)
    return jsonify({'error': 'Qualcosa non ha funzionato'}), 500

import home.home as home
app.register_blueprint(home.bp)
import conti.conti as conti
app.register_blueprint(conti.bp)
import transazioni.transazioni as transazioni
app.register_blueprint(transazioni.bp)
import categorie.categorie as categorie
app.register_blueprint(categorie.bp)
import investimenti.investimenti as investimenti
app.register_blueprint(investimenti.bp)

if __name__ == "__main__":
    app.run(host=VARS.HOST_NAME,debug=True, port=VARS.APP_PORT)