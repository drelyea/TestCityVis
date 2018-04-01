import requests
import json


def construct_query(additions):
    return 'http://api.datausa.io/api/?show={}'.format(additions)

url = construct_query('geo&sumlevel=state&required=avg_wage')
response = requests.get(url).json()
print(json.dumps(response, indent=4, sort_keys=True))


