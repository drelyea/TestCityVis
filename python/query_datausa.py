import requests
import csv


def construct_api_query(additions):
    return 'http://api.datausa.io/api/?show={}'.format(additions)


def construct_geo_query(additions):
    return 'http://api.datausa.io/attrs/geo/{}'.format(additions)


def write_header(filename, fields):
    with open(filename, 'w') as outfile:
        writer = csv.DictWriter(outfile, fields, lineterminator='\n')
        writer.writeheader()


def write_row_to_csv(filename, fields, data):
    with open(filename, 'a') as outfile:
        writer = csv.DictWriter(outfile, fields, lineterminator='\n')
        writer.writerow(data)


def get_income_age_msa():

    filename = '../data/income_age_msa.csv'
    fields = ['name', 'code', 'average income', 'median age']
    write_header(filename, fields)

    # get income and age by msa
    url = construct_api_query('geo&sumlevel=msa&year=latest&required=income,age')
    response = requests.get(url).json()

    # parse response
    for data_point in response['data']:

        income = data_point[2]
        age = data_point[3]

        # get geo_code and make geo call to get msa name
        geo_code = data_point[1]
        geo_request = construct_geo_query(geo_code)
        geo_response = requests.get(geo_request).json()
        name = geo_response['data'][0][2]

        write_row_to_csv(filename, fields, {'name': name, 'code': geo_code, 'average income': income, 'median age': age})

get_income_age_msa()
