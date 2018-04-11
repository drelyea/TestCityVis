import requests
import json

cities = [('Albany','16000US3601000'),('Annapolis','16000US2401600'),('Atlanta','16000US1304000'),('Augusta','16000US1304204'),('Austin','16000US4805000'),('Baton Rouge','16000US2205000'),('Bismarck','16000US3807200'),('Boise','16000US1608830'),('Boston','16000US2507000'),('Carson City','16000US3209700'),
            ('Charleston','16000US5414600'),('Cheyenne','16000US5613900'),('Columbia','16000US4516000'),('Columbus','16000US3918000'),('Concord','16000US3314200'),('Denver','16000US0820000'),('Des Moines','16000US1921000'),('Dover','16000US1021200'),('Frankfort','16000US2128900'),
            ('Harrisburg','16000US4232800'),('Hartford','16000US0937000'),('Helena','16000US3035600'),('Honolulu','16000US1571550'),('Indianapolis','16000US1836003'),('Jackson','16000US2836000'),('Jefferson City','16000US2937000'),('Juneau','16000US0236400'),('Lansing','16000US2646000'),
            ('Lincoln','16000US3128000'),('Little Rock','16000US0541000'),('Madison','16000US5548000'),('Montgomery','16000US0151000'),('Montpelier','16000US5046000'),('Nashville','16000US4752006'),('Oklahoma City','16000US4055000'),('Olympia','16000US5351300'),('Phoenix','16000US0455000'),
            ('Pierre','16000US4649600'),('Providence','16000US4459000'),('Raleigh','16000US3755000'),('Richmond','16000US5167000'),('Sacramento','16000US0664000'),('Saint Paul','31000US45820'),('Salem','16000US4164900'),('Salt Lake City','16000US4967000'),('Santa Fe','16000US3570500'),
            ('Springfield','16000US1772000'),('Tallahassee','16000US1270600'),('Topeka','31000US45820'),('Trenton','16000US3474000')]


def construct_city_query(additions, geo_code):
    return 'http://api.datausa.io/api/?show=geo&year=latest&required={}&where=geo:{}'.format(additions, geo_code)


def construct_country_query(additions):
    return 'http://api.datausa.io/api/?show=geo&sumlevel=nation&year=latest&required={}'.format(additions)


def construct_geo_query(additions):
    return 'http://api.datausa.io/attrs/geo/{}'.format(additions)


def construct_additions(fields):
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

    table_response = requests.get(url).json()
    number_of_fields = len(fields)
    custom_json = {}

    if len(table_response['data']) > 0:
        # parse response
        for index in range(0, number_of_fields):
            custom_json[fields[index]] = table_response['data'][0][index+2]

    return custom_json


def get_data():

    filename = '../data/capital_data.json'
    master_json = {}
    master_json['capitals'] = []

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

    chr_fields = ['high_school_graduation', 'some_college', 'unemployment']

    # for each city
    for city in cities:

        city_json = {}

        # get acs_yg_fields
        city_json.update(get_table_data(acs_yg_fields, construct_city_query(construct_additions(acs_yg_fields), city[1])))

        # get acs_yg_tenure_fields
        city_json.update(get_table_data(acs_yg_tenure_fields, construct_city_query(construct_additions(acs_yg_tenure_fields), city[1])))

        # get acs_yg_nativity_fields
        city_json.update(get_table_data(acs_yg_nativity_fields, construct_city_query(construct_additions(acs_yg_nativity_fields), city[1])))

        # get acs_yg_poverty_fields
        city_json.update(get_table_data(acs_yg_poverty_fields, construct_city_query(construct_additions(acs_yg_poverty_fields), city[1])))

        # get acs_yg_race_fields
        city_json.update(get_table_data(acs_yg_race_fields, construct_city_query(construct_additions(acs_yg_race_fields), city[1])))

        # get acs_yg_num_emp_fields
        city_json.update(get_table_data(acs_yg_num_emp_fields, construct_city_query(construct_additions(acs_yg_num_emp_fields), city[1])))

        # get acs_yg_income_distribution_fields
        city_json.update(get_table_data(acs_yg_income_distribution_fields, construct_city_query(construct_additions(acs_yg_income_distribution_fields), city[1])))

        # get acs_yg_tenure_fields
        city_json.update(get_table_data(ipeds_grads_fields, construct_city_query(construct_additions(ipeds_grads_fields), city[1])))

        # get chr_fields
        city_json.update(get_table_data(chr_fields, construct_city_query(construct_additions(chr_fields), city[1])))

        city_json['name'] = city[0]
        master_json['capitals'].append(city_json)

    # post processing for data errors and added fields
    for city in master_json['capitals']:

        # fix Pierre grad error
        if city['name'] == 'Pierre':
            city['grads_total'] = 222

        # calculate people per household
        city['people_per_household'] = round(city['pop']/city['households'], 2)

    with open(filename, 'w') as outfile:
        json.dump(master_json, outfile, sort_keys=True, indent=4)

get_data()
