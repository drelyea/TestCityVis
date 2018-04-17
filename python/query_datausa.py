import requests
import json

# hardcoded list of cities of interest with geo-codes
# some are 'Census Designated Places' while others are 'Metropolitan Areas'
cities = [('Albany', '16000US3601000', 'NY'), ('Annapolis', '16000US2401600', 'MD'),
          ('Atlanta', '16000US1304000', 'GA'), ('Augusta', '16000US1304204', 'ME'), ('Austin', '16000US4805000', 'TX'),
          ('Baton Rouge', '16000US2205000', 'LA'), ('Bismarck', '16000US3807200', 'ND'),
          ('Boise', '16000US1608830', 'ID'), ('Boston', '16000US2507000', 'MA'),
          ('Carson City', '16000US3209700', 'NV'), ('Charleston', '16000US5414600', 'WV'),
          ('Cheyenne', '16000US5613900', 'WY'), ('Columbia', '16000US4516000', 'SC'),
          ('Columbus', '16000US3918000', 'OH'), ('Concord', '16000US3314200', 'NH'), ('Denver', '16000US0820000', 'CO'),
          ('Des Moines', '16000US1921000', 'IA'), ('Dover', '16000US1021200', 'DE'),
          ('Frankfort', '16000US2128900', 'KY'), ('Harrisburg', '16000US4232800', 'PA'),
          ('Hartford', '16000US0937000', 'CT'), ('Helena', '16000US3035600', 'MT'),
          ('Honolulu', '16000US1571550', 'HI'), ('Indianapolis', '16000US1836003', 'IN'),
          ('Jackson', '16000US2836000', 'MS'), ('Jefferson City', '16000US2937000', 'MO'),
          ('Juneau', '16000US0236400', 'AK'), ('Lansing', '16000US2646000', 'MI'), ('Lincoln', '16000US3128000', 'NE'),
          ('Little Rock', '16000US0541000', 'AR'), ('Madison', '16000US5548000', 'WI'),
          ('Montgomery', '16000US0151000', 'AL'), ('Montpelier', '16000US5046000', 'VT'),
          ('Nashville', '16000US4752006', 'TN'), ('Oklahoma City', '16000US4055000', 'OK'),
          ('Olympia', '16000US5351300', 'WA'), ('Phoenix', '16000US0455000', 'AZ'), ('Pierre', '16000US4649600', 'SD'),
          ('Providence', '16000US4459000', 'RI'), ('Raleigh', '16000US3755000', 'NC'),
          ('Richmond', '16000US5167000', 'VA'), ('Sacramento', '16000US0664000', 'CA'),
          ('Saint Paul', '31000US45820', 'MN'), ('Salem', '16000US4164900', 'OR'),
          ('Salt Lake City', '16000US4967000', 'UT'), ('Santa Fe', '16000US3570500', 'NM'),
          ('Springfield', '16000US1772000', 'IL'), ('Tallahassee', '16000US1270600', 'FL'),
          ('Topeka', '31000US45820', 'KS'), ('Trenton', '16000US3474000', 'NJ')]

# requested fields per table
acs_yg_fields = ['age', 'income', 'pop']
acs_yg_tenure_fields = ['households']
acs_yg_nativity_fields = ['nativity_foreign', 'nativity_foreign_under5', 'nativity_foreign_5to17',
                          'nativity_foreign_18to24', 'nativity_foreign_25to34', 'nativity_foreign_35to44',
                          'nativity_foreign_45to54', 'nativity_foreign_55to59', 'nativity_foreign_60to61',
                          'nativity_foreign_62to64', 'nativity_foreign_65to74', 'nativity_foreign_75over',
                          'nativity_us', 'nativity_us_under5', 'nativity_us_5to17', 'nativity_us_18to24',
                          'nativity_us_25to34', 'nativity_us_35to44', 'nativity_us_45to54', 'nativity_us_55to59',
                          'nativity_us_60to61', 'nativity_us_62to64', 'nativity_us_65to74', 'nativity_us_75over']
acs_yg_poverty_fields = ['income_below_poverty']
acs_yg_race_fields = ['pop_native', 'pop_black', 'pop_white', 'pop_asian', 'pop_hawaiian', 'pop_other',
                      'pop_2ormore', 'pop_latino']
acs_yg_num_emp_fields = ['num_emp']
acs_yg_income_distribution_fields = ['income_under10', 'income_10to15', 'income_15to20', 'income_20to25',
                                     'income_25to30', 'income_30to35', 'income_35to40', 'income_40to45',
                                     'income_45to50', 'income_50to60', 'income_60to75', 'income_75to100',
                                     'income_100to125', 'income_125to150', 'income_150to200', 'income_200over']
ipeds_grads_fields = ['grads_total']

# region lists
pacific = ['AK', 'HI']
west = ['WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM']
midwest = ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'IN', 'MI', 'OH']
south = ['TX', 'OK', 'AR', 'LA', 'MS', 'KY', 'TN', 'AL', 'FL', 'GA', 'SC', 'NC', 'VA', 'WV', 'MD', 'DE']
northeast = ['PA', 'NJ', 'NY', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME']


def construct_city_query(additions, geo_code):
    """Helper to perform a city-level query"""
    return 'http://api.datausa.io/api/?show=geo&year=latest&required={}&where=geo:{}'.format(additions, geo_code)


def construct_nation_query(additions):
    """Helper to perform a nation-level query"""
    return 'http://api.datausa.io/api/?show=geo&sumlevel=nation&year=latest&required={}'.format(additions)


def construct_geo_query(additions):
    """Helper to perform a geo query"""
    return 'http://api.datausa.io/attrs/geo/{}'.format(additions)


def construct_additions(fields):
    """Helper to add fields on to query"""
    additions = ''
    first = True
    for field in fields:
        if first:
            additions += '{}'.format(field)
            first = False
        else:
            additions += ',{}'.format(field)
    return additions


def get_table_data(fields, url):
    """Parse return JSON based on requested fields"""

    table_response = requests.get(url).json()
    number_of_fields = len(fields)
    custom_json = {}

    if len(table_response['data']) > 0:
        # parse response
        for index in range(0, number_of_fields):
            custom_json[fields[index]] = table_response['data'][0][index + 2]

    return custom_json


def query_cities(master_json):
    """Updates city list in master_json with stats per capital"""

    for city in cities:
        city_json = {}

        city_json.update(
            get_table_data(acs_yg_fields, construct_city_query(construct_additions(acs_yg_fields), city[1])))
        city_json.update(get_table_data(acs_yg_tenure_fields,
                                        construct_city_query(construct_additions(acs_yg_tenure_fields), city[1])))
        city_json.update(get_table_data(acs_yg_nativity_fields,
                                        construct_city_query(construct_additions(acs_yg_nativity_fields), city[1])))
        city_json.update(get_table_data(acs_yg_poverty_fields,
                                        construct_city_query(construct_additions(acs_yg_poverty_fields), city[1])))
        city_json.update(
            get_table_data(acs_yg_race_fields, construct_city_query(construct_additions(acs_yg_race_fields), city[1])))
        city_json.update(get_table_data(acs_yg_num_emp_fields,
                                        construct_city_query(construct_additions(acs_yg_num_emp_fields), city[1])))
        city_json.update(get_table_data(acs_yg_income_distribution_fields,
                                        construct_city_query(construct_additions(acs_yg_income_distribution_fields),
                                                             city[1])))
        city_json.update(
            get_table_data(ipeds_grads_fields, construct_city_query(construct_additions(ipeds_grads_fields), city[1])))

        city_json['name'] = city[0]
        city_json['state'] = city[2]
        master_json['capitals'].append(city_json)

        print('Queried {}'.format(city[0]))


def query_nation(master_json):
    """Updates nation dict in master_json with national stats"""

    nation_json = {}

    nation_json.update(get_table_data(acs_yg_fields, construct_nation_query(construct_additions(acs_yg_fields))))
    nation_json.update(
        get_table_data(acs_yg_tenure_fields, construct_nation_query(construct_additions(acs_yg_tenure_fields))))
    nation_json.update(
        get_table_data(acs_yg_nativity_fields, construct_nation_query(construct_additions(acs_yg_nativity_fields))))
    nation_json.update(
        get_table_data(acs_yg_poverty_fields, construct_nation_query(construct_additions(acs_yg_poverty_fields))))
    nation_json.update(
        get_table_data(acs_yg_race_fields, construct_nation_query(construct_additions(acs_yg_race_fields))))
    nation_json.update(
        get_table_data(acs_yg_num_emp_fields, construct_nation_query(construct_additions(acs_yg_num_emp_fields))))
    nation_json.update(get_table_data(acs_yg_income_distribution_fields,
                                      construct_nation_query(construct_additions(acs_yg_income_distribution_fields))))
    nation_json.update(
        get_table_data(ipeds_grads_fields, construct_nation_query(construct_additions(ipeds_grads_fields))))

    nation_json['name'] = 'USA'
    master_json['nation'].update(nation_json)

    print('Queried {}'.format('USA'))


def post_process(master_json):
    """Post-processing for data errors and added custom fields"""

    for city in master_json['capitals']:

        # fix Pierre grad error
        if city['name'] == 'Pierre':
            city['grads_total'] = 222

        # calculate people per household
        city['people_per_household'] = round(city['pop'] / city['households'], 2)

        # add region
        state_abbreviation = city['state']
        if state_abbreviation in pacific:
            city['region'] = 'Pacific'
        if state_abbreviation in west:
            city['region'] = 'West'
        if state_abbreviation in midwest:
            city['region'] = 'Midwest'
        if state_abbreviation in south:
            city['region'] = 'South'
        if state_abbreviation in northeast:
            city['region'] = 'Northeast'

    master_json['nation']['people_per_household'] = round(
        master_json['nation']['pop'] / master_json['nation']['households'], 2)

    print('Finished Post-Processing')


def main():
    """Starts off data querying from the DataUSA API"""

    # initialize
    filename = '../data/capital_and_nation_data.json'
    master_json = {'capitals': [], 'nation': {}}

    # log
    print('Starting queries...')

    # query
    query_cities(master_json)
    query_nation(master_json)

    # clean up
    post_process(master_json)

    # save file
    with open(filename, 'w') as outfile:
        json.dump(master_json, outfile, sort_keys=True, indent=4)

    # log
    print('Queries completed. File saved at {}'.format(filename))


if __name__ == '__main__':
    main()
