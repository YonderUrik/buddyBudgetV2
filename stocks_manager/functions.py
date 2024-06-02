import requests

# Get an access token
def get_access_token(domain, client_id, client_secret, audience):
    url = f'https://{domain}/oauth/token'
    headers = {'content-type': 'application/json'}
    body = {
        'client_id': client_id,
        'client_secret': client_secret,
        'audience': audience,
        'grant_type': 'client_credentials'
    }
    response = requests.post(url, json=body, headers=headers)
    response.raise_for_status()
    return response.json()['access_token']

# Fetch all users
def fetch_users(domain, access_token):
    url = f'https://{domain}/api/v2/users'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    users = []
    page = 0
    per_page = 50
    while True:
        response = requests.get(url, headers=headers, params={'page': page, 'per_page': per_page})
        response.raise_for_status()
        data = response.json()
        if not data:
            break
        users.extend(data)
        page += 1
    return users