define({ "api": [
  {
    "type": "get",
    "url": "/authenticate/:username/:password",
    "title": "Authenticate for new Account",
    "name": "Authenticate",
    "group": "Account_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>default username for the api service</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>default password for the api service</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters",
          "content": "/authenticate/ooooo/xxxxxx",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding authentication</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>where token is allocated, to be used for account creation</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\n  status :201,  \n  error: false,\n  message: 'authenticated',\n  data: {\n      token: \"XaTB939478P2\"\n  }   \n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "username_missing",
            "description": "<p>username to get access to account creation not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "password_missing",
            "description": "<p>password to get access to account creation not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "not_authenticated",
            "description": "<p>have no access to the account creation</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\n  status :400,  \n  error: true,\n  message: 'not authenticated',\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Account_APIs"
  },
  {
    "type": "get",
    "url": "/check_token_validity/:token",
    "title": "Check Token Validity",
    "name": "Check_Token_Validity",
    "group": "Account_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token to be checked</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters",
          "content": "/check_token_validity/gihwkDTE8vTV",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding validity of token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\nstatus :200,  \nerror: false,\nmessage: 'token valid'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_missing",
            "description": "<p>token used to access the resource is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token used to access the resoruce is expired</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\nstatus :400,  \nerror: true,\nmessage: 'token expired'   \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Account_APIs"
  },
  {
    "type": "post",
    "url": "/create_nlims_account",
    "title": "Create Account",
    "name": "Create_Account",
    "group": "Account_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "partner",
            "description": "<p>name of partner to be consuming api service</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "app_name",
            "description": "<p>name of application to be accessing the api service</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "location",
            "description": "<p>partner location</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password set for the account to be used for re-aunthentication when token expires</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username set for the account to be used for re-aunthentication when token expires</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token given when authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters",
          "content": "{\n  partner  : 'baobab health trust',\n  app_name : 'iblis',\n  location : 'lilongwe',  \n  username : 'aaaa',\n  password : 'xxxx',\n  token    : 'XQWTDPK29900'\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding account creation</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>where token is allocated, to be used for accessing the api resources when is valid</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\n  status :201,  \n  error: false,\n  message: 'account created',\n  data: {\n      token: \"XaTB939478P2\"\n  }   \n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "username_missing",
            "description": "<p>username is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "password_missing",
            "description": "<p>password is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "location",
            "description": "<p>is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "partner",
            "description": "<p>partner name is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "app_nam",
            "description": "<p>application name is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token",
            "description": "<p>token is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "account_already_exist",
            "description": "<p>account already exist</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token expired,re-authenticate for valid token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\n  status :400,  \n  error: true,\n  message: 'account already exist',\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Account_APIs"
  },
  {
    "type": "post",
    "url": "/create_hl7_order",
    "title": "Create Order",
    "name": "Create_hl7_Order",
    "group": "Order_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "first_name",
            "description": "<p>first name of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "last_name",
            "description": "<p>last name of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "middle_name",
            "description": "<p>middle name of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone_number",
            "description": "<p>phone number of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date_of_birth",
            "description": "<p>date of birth of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gender",
            "description": "<p>gender of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "national_patient_id",
            "description": "<p>national patient id of patient to whom order belongs</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_collector_last_name",
            "description": "<p>first name of person collecting the order's sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_collector_first_name",
            "description": "<p>last name of person collecting the order's sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_collector_phone_number",
            "description": "<p>phone number of person collecting the order's sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_collector_id",
            "description": "<p>id of person collecting the order's sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_order_location",
            "description": "<p>location at which the order is placed (like ward)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date_sample_drawn",
            "description": "<p>date at which sample was drawn</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "art_start_date",
            "description": "<p>art start date of patient if patient is enrolled in art program</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "date_received",
            "description": "<p>date at which the sample was received</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "health_facility_name",
            "description": "<p>facility name at which the order is ordered</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sample_priority",
            "description": "<p>priority level of the sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tests",
            "description": "<p>tests ordered from the sample</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "district",
            "description": "<p>district of the health facility at which the order is placed</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "target_lab",
            "description": "<p>the lab at which the sample is to be analysed</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "reason_for_test",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token in order to access this resource</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "return_json",
            "description": "<p>specifying if want response in json (true/false)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters ",
          "content": "{\n         \"district\": \"lilongwe\",\n         \"health_facility_name\": \"Kawale Health Centre\",\n         \"first_name\": \"f-name\",\n         \"last_name\": \"l-name\",\n         \"middle_name\": \"m-name\",\n         \"date_of_birth\": \"00000000\",\n         \"gender\": \"m\",\n         \"national_patient_id\": \"00007R\",\n         \"requesting_clinician\": \"John Doe\",\n         \"sample_type\": \"Blood\",\n         \"tests\": ['Renal Function Test', 'Viral Load', 'FBC'],\n         \"date_sample_drawn\": \"0000000\",\n         \"sample_priority\": \"routine\",\n         \"target_lab\": \"Kamuzu Central Hospital\",       \n         \"sample_collector_last_name\": \"f-name\",\n         \"sample_collector_first_name\": \"l-name\",\n         \"sample_collector_phone_number\": \"00000\",\n         \"sample_collector_id\": \"10015\",\n         \"sample_order_location\": \"OPD\",\n         \"reason_for_test\": \"\",\n         \"art_start_date\": \"00000\",\n         \"date_received\":  \"00000000\",             \n         \"return_json\": 'true'   \n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding the response</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>where tracking number of the order is located</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Responce Example",
          "content": "{\nstatus :200,  \nerror: false,\nmessage: 'order created successfuly',\ndata: {\n      tracking_number: XJDKE99090    \n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token used to access the resoruce is expired</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "district_missing",
            "description": "<p>district not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "health_facility_name",
            "description": "<p>health facility not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "first_name",
            "description": "<p>first patient first name not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "last_name",
            "description": "<p>last patient last name not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "phone_number",
            "description": "<p>patient phone number not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "gender",
            "description": "<p>patient patient gender not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "national_patient_id",
            "description": "<p>patient national id not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "sample_type",
            "description": "<p>order sample type not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "tests",
            "description": "<p>order order tests not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "date_drawn",
            "description": "<p>date sample drawn not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "sample_priority",
            "description": "<p>sample priority not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "target_lab",
            "description": "<p>target lab not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "sample_order_location",
            "description": "<p>location for sample ordering not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "sample_collector_first_name",
            "description": "<p>first name for sample collector not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "sample_collector_last_name",
            "description": "<p>last name for sample collector not</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token",
            "description": "<p>token for resource accessing not provided</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\nstatus :400,  \nerror: true,\nmessage: 'token missing'   \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Order_APIs"
  },
  {
    "type": "get",
    "url": "/query_results/:tracking_number/:token",
    "title": "Query Order Results",
    "name": "Query_Order_Results",
    "group": "Order_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tracking_number",
            "description": "<p>order tracking number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token in order to access the resource</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters ",
          "content": "/query_results/XQCH178E371/gihwkDTE8vTV",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding the response</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>order results</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\nstatus :200,  \nerror: false,\nmessage: 'results retrived successfuly',\ndata: \n  {\n    {\n     \"Test Name\": {\n      \"20170714090806\": {\n         \"test_status\": \"Drawn\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"20170714090806\",\n          \"datetime_completed\": \"\",\n          \"results\": {\n          }\n      },\n      \"20170814120201\": {\n          \"test_status\": \"started\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:00\",\n          \"datetime_completed\": null,\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": [\n          ]\n      },\n      \"20170814120211\": {\n          \"test_status\": \"completed\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:00\",\n          \"datetime_completed\": \"2017-08-14 12:02:08\",\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": {\n              \"GPT/ALT\": \"29.46 U/L\",\n              \"GOT/AST\": \"60.02 U/L\",\n              \"Alkaline Phosphate(ALP)\": \"151.80 U/L\",\n              \"GGT/r-GT\": \"414.79 U/L\",\n              \"Bilirubin Direct(DBIL-DSA)\": \"0.34 mg/dl\",\n              \"Bilirubin Total(TBIL-DSA))\": \"0.38 mg/dl\",\n              \"Albumin(ALB)\": \"2.52 mg/dl\",\n              \"Protein(TP)\": \"7.08 mg/dl\",\n              \"LDH\": \"538.65 U/L\"\n          }\n      },\n      \"20170814150632\": {\n          \"test_status\": \"verified\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:00\",\n          \"datetime_completed\": \"2017-08-14 12:02:08\",\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": {\n              \"GPT/ALT\": \"29.46 U/L\",\n              \"GOT/AST\": \"60.02 U/L\",\n              \"Alkaline Phosphate(ALP)\": \"151.80 U/L\",\n              \"GGT/r-GT\": \"414.79 U/L\",\n              \"Bilirubin Direct(DBIL-DSA)\": \"0.34 mg/dl\",\n              \"Bilirubin Total(TBIL-DSA))\": \"0.38 mg/dl\",\n              \"Albumin(ALB)\": \"2.52 mg/dl\",\n              \"Protein(TP)\": \"7.08 mg/dl\",\n              \"LDH\": \"538.65 U/L\"\n          }\n      }\n  },\n  \"Test Name\": {\n      \"20170714090806\": {\n          \"test_status\": \"Drawn\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"20170714090806\",\n          \"datetime_completed\": \"\",\n          \"results\": {\n          }\n      },\n      \"20170814120215\": {\n          \"test_status\": \"started\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:14\",\n          \"datetime_completed\": null,\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": [\n          ]\n      },\n      \"20170814150621\": {\n          \"test_status\": \"completed\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:14\",\n          \"datetime_completed\": \"2017-08-14 12:02:29\",\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": {\n              \"Urea\": \"297.93 mg/dl\",\n              \"Creatinine\": \"\",\n              \"CREA-J\": \"13.24 mg/dl\"\n          }\n      },\n      \"20170814150632\": {\n          \"test_status\": \"verified\",\n          \"remarks\": \"\",\n          \"datetime_started\": \"2017-08-14 12:02:14\",\n          \"datetime_completed\": \"2017-08-14 12:02:29\",\n          \"who_updated\": {\n              \"first_name\": \"f-name\",\n              \"last_name\": \"l-name\",\n              \"ID_number\": \"000\"\n          },\n          \"results\": {\n              \"Urea\": \"297.93 mg/dl\",\n              \"Creatinine\": \"\",\n              \"CREA-J\": \"13.24 mg/dl\"\n          }\n      }\n  }\n}\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_missing",
            "description": "<p>token used to access the resource is not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token used to access the resoruce is expired</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "tracking_number_missing",
            "description": "<p>tracking number for the order whose results are needed in not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "order_not_available",
            "description": "<p>order with such tracking number is unavailable</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\nstatus :400,  \nerror: true,\nmessage: 'token missing'   \n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Order_APIs"
  },
  {
    "type": "get",
    "url": "/query_order_by_tracking_number/:tracking_number/:token",
    "title": "Query Patient Orders 2",
    "name": "Query_Patient_Orders_By_Tracking_Number",
    "group": "Order_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tracking_number",
            "description": "<p>tacking number for order whose orders are needed</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token in order to access the resource</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters",
          "content": "/query_order_by_npid/XKCH9101010/XTo397ebdu",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding authentication</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>where the orders are allocated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\n  status :201,  \n  error: false,\n  message: 'authenticated',\n  data: {\n       \n                \"_id\": \"XKCH1288400\",\n                \"_rev\": \"9-ff6372b4f975c763b07b106cfc749e03\",\n                \"patient\": {\n                      \"national_patient_id\": \"00000\",\n                      \"first_name\": \"f-name\",\n                     \"middle_name\": \"m-name\",\n                      \"last_name\": \" l-name\",\n                      \"date_of_birth\": \"0000\",\n                      \"gender\": \"M\",\n                      \"phone_number\": \"000\"\n                  },\n                  \"sample_type\": \"Blood\",\n                  \"who_order_test\": {\n                      \"first_name\": \"f-name\",\n                      \"last_name\": \"l-name\",\n                      \"id_number\": \"0000\",\n                      \"phone_number\": \"0000\"\n                  },\n                  \"date_drawn\": \"20160614094212\",\n                  \"date_dispatched\": \"\",\n                  \"art_start_date\": \"\",\n                  \"date_received\": \"20160614094212\",\n                  \"sending_facility\": \"Kamuzu Central Hospital\",\n                  \"receiving_facility\": \"Kamuzu Central Hospital\",\n                  \"reason_for_test\": \"\",\n                  \"test_types\": [\n                      \"Test Name\",\n                      \"Test Name\"\n                  ],\n                  \"status\": \"specimen-accepted\",\n                  \"district\": \"Lilongwe\",\n                  \"priority\": \"Routine\",\n                  \"order_location\": \"4B\",\n                  \"results\": {\n                      \"Test Name\": {\n                          \"20160514094212\": {\n                              \"test_status\": \"Drawn\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"20160514094212\",\n                              \"datetime_completed\": \"\",\n                              \"results\": {\n                              }\n                          },\n                          \"20160514094213\": {\n                              \"test_status\": \"pending\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"\",\n                              \"datetime_completed\": \"\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                          },\n                          \"20160514101736\": {\n                              \"test_status\": \"started\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 10:17:36\",\n                              \"datetime_completed\": null,\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                              },\n                              \"results\": [\n                              ]\n                          },\n                          \"20160514101806\": {\n                              \"test_status\": \"completed\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 10:17:36\",\n                              \"datetime_completed\": \"2016-06-14 10:18:06\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                              },\n                              \"results\": {\n                                  \"K\": \"6.36 mmol/L\",\n                                  \"Na\": \"132.2 mmol/L\",\n                                  \"Cl\": \"98.1 mmol/L\"\n                              }\n                          }\n                      },\n                      \"Test Name\": {\n                          \"20160514094212\": {\n                              \"test_status\": \"Drawn\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"20160514094212\",\n                              \"datetime_completed\": \"\",\n                              \"results\": {\n                              }\n                          },\n                          \"20160514094220\": {\n                              \"test_status\": \"pending\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"\",\n                              \"datetime_completed\": \"\",\n                             \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"000\"\n                              }\n                          },\n                         \"20160514145459\": {\n                              \"test_status\": \"started\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 14:54:59\",\n                              \"datetime_completed\": null,\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"000\"\n                              },\n                              \"results\": [\n                              ]\n                          },\n                          \"20160514145520\": {\n                              \"test_status\": \"completed\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 14:54:59\",\n                              \"datetime_completed\": \"2016-06-14 14:55:20\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"0000\"\n                              },\n                              \"results\": {\n                                  \"Urea\": \"133.5 mg/dl\",\n                                  \"Creatinine\": \"0\"\n                              }\n                          }\n                      }\n                  },\n                  \"date_time\": \"20160614094212\"            \n  }   \n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "tracking_number_missing",
            "description": "<p>tracking number for order not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_missing",
            "description": "<p>token not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token not provided,re-authenticate for valid token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\n  status :400,  \n  error: true,\n  message: 'tracking number missing',\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Order_APIs"
  },
  {
    "type": "get",
    "url": "/query_order_by_npid/:npid/:token",
    "title": "Query Patient Orders 1",
    "name": "Query_Patient_Orders_by_NPID",
    "group": "Order_APIs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "national_patient_id",
            "description": "<p>patient national patient id whose orders are needed</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>token in order to access the resource</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of Request with Parameters",
          "content": "/query_order_by_npid/00007R/XTo397ebdu",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>status of the request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>indicating whether the response is an error or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>information regarding authentication</p>"
          },
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>where the orders are allocated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful Response Example",
          "content": "{\n  status :201,  \n  error: false,\n  message: 'authenticated',\n  data: {\n       [\n                  \"_id\": \"XKCH1288400\",\n                 \"_rev\": \"9-ff6372b4f975c763b07b106cfc749e03\",\n                \"patient\": {\n                      \"national_patient_id\": \"00000\",\n                      \"first_name\": \"f-name\",\n                     \"middle_name\": \"m-name\",\n                      \"last_name\": \" l-name\",\n                      \"date_of_birth\": \"0000\",\n                      \"gender\": \"M\",\n                      \"phone_number\": \"000\"\n                  },\n                  \"sample_type\": \"Blood\",\n                  \"who_order_test\": {\n                      \"first_name\": \"f-name\",\n                      \"last_name\": \"l-name\",\n                      \"id_number\": \"0000\",\n                      \"phone_number\": \"0000\"\n                  },\n                  \"date_drawn\": \"20160614094212\",\n                  \"date_dispatched\": \"\",\n                  \"art_start_date\": \"\",\n                  \"date_received\": \"20160614094212\",\n                  \"sending_facility\": \"Kamuzu Central Hospital\",\n                  \"receiving_facility\": \"Kamuzu Central Hospital\",\n                  \"reason_for_test\": \"\",\n                  \"test_types\": [\n                      \"Test Name\",\n                      \"Test Name\"\n                  ],\n                  \"status\": \"specimen-accepted\",\n                  \"district\": \"Lilongwe\",\n                  \"priority\": \"Routine\",\n                  \"order_location\": \"4B\",\n                  \"results\": {\n                      \"Test Name\": {\n                          \"20160514094212\": {\n                              \"test_status\": \"Drawn\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"20160514094212\",\n                              \"datetime_completed\": \"\",\n                              \"results\": {\n                              }\n                          },\n                          \"20160514094213\": {\n                              \"test_status\": \"pending\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"\",\n                              \"datetime_completed\": \"\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                          },\n                          \"20160514101736\": {\n                              \"test_status\": \"started\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 10:17:36\",\n                              \"datetime_completed\": null,\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                              },\n                              \"results\": [\n                              ]\n                          },\n                          \"20160514101806\": {\n                              \"test_status\": \"completed\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 10:17:36\",\n                              \"datetime_completed\": \"2016-06-14 10:18:06\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"00\"\n                              },\n                              \"results\": {\n                                  \"K\": \"6.36 mmol/L\",\n                                  \"Na\": \"132.2 mmol/L\",\n                                  \"Cl\": \"98.1 mmol/L\"\n                              }\n                          }\n                      },\n                      \"Test Name\": {\n                          \"20160514094212\": {\n                              \"test_status\": \"Drawn\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"20160514094212\",\n                              \"datetime_completed\": \"\",\n                              \"results\": {\n                              }\n                          },\n                          \"20160514094220\": {\n                              \"test_status\": \"pending\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"\",\n                              \"datetime_completed\": \"\",\n                             \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"000\"\n                              }\n                          },\n                         \"20160514145459\": {\n                              \"test_status\": \"started\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 14:54:59\",\n                              \"datetime_completed\": null,\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"000\"\n                              },\n                              \"results\": [\n                              ]\n                          },\n                          \"20160514145520\": {\n                              \"test_status\": \"completed\",\n                              \"remarks\": \"\",\n                              \"datetime_started\": \"2016-06-14 14:54:59\",\n                              \"datetime_completed\": \"2016-06-14 14:55:20\",\n                              \"who_updated\": {\n                                  \"first_name\": \"f-name\",\n                                  \"last_name\": \"l-name\",\n                                  \"ID_number\": \"0000\"\n                              },\n                              \"results\": {\n                                  \"Urea\": \"133.5 mg/dl\",\n                                  \"Creatinine\": \"0\"\n                              }\n                          }\n                      }\n                  },\n                  \"date_time\": \"20160614094212\"\n                  ],\n                  [\n                       {\n                          \"_id\": \"XKCH1718234\",\n                          \"_rev\": \"3-8017d4d27975ab1fb617a06ca23cd20d\",\n                          \"test_types\": [\n                              \"Test Name\"\n                          ],\n                          \"results\": {\n                             \"Hepatitis C Test\": {\n                                  \"20171106092004\": {\n                                      \"test_status\": \"Drawn\",\n                                      \"remarks\": \"\",\n                                      \"datetime_started\": \"20171106092004\",\n                                      \"datetime_completed\": \"\",\n                                      \"results\": {\n                                      }\n                                  }\n                              }\n                          },\n                          \"who_dispatched\": {\n                              \"id_number\": \"000\",\n                              \"first_name\": \"f-name\",\n                              \"last_name\": \"l-name\",\n                              \"phone_number\": \"0000\"\n                          },\n                          \"date_dispatched\": \"20171106102644\",\n                          \"patient\": {\n                              \"national_patient_id\": \"00000\",\n                              \"first_name\": \"f-name\",\n                              \"middle_name\": \" \",\n                              \"last_name\": \"l-name\",\n                             \"date_of_birth\": \"0000\",\n                              \"gender\": \"F\",\n                              \"phone_number\": \"0000\"\n                          },\n                          \"sample_type\": \"Blood\",\n                          \"who_order_test\": {\n                              \"first_name\": \"f-name\",\n                              \"last_name\": \"l-name\",\n                              \"id_number\": \"0000\",\n                              \"phone_number\": \"00000\"\n                          },\n                          \"date_drawn\": \"000\",\n                          \"art_start_date\": \"000\",\n                          \"date_received\": \"0000\",\n                          \"sending_facility\": \"Kamuzu Central Hospital\",\n                          \"receiving_facility\": \"KCH\",\n                          \"reason_for_test\": \"Routin\",\n                          \"status\": \"Drawn\",\n                          \"district\": \"Lilongwe\",\n                          \"priority\": \"Routin\",\n                          \"order_location\": \"1A\",\n                          \"date_time\": \"20171106092004\",\n                          \"rejection_reason\": \"\",\n                          \"who_updated\": {\n                              \"id_number\": \"000\",\n                              \"first_name\": \"f-name\",\n                              \"last_name\": \"l-name\",\n                              \"phone_number\": \"000\"\n                          }\n                       }\n                  ]\n               \n  }   \n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 400": [
          {
            "group": "Error 400",
            "optional": false,
            "field": "national_patient_id_missing",
            "description": "<p>patient national id not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_missing",
            "description": "<p>token not provided</p>"
          },
          {
            "group": "Error 400",
            "optional": false,
            "field": "token_expired",
            "description": "<p>token not provided,re-authenticate for valid token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Responce Example",
          "content": "{\n  status :400,  \n  error: true,\n  message: 'national patient id missing',\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "Order_APIs"
  }
] });
