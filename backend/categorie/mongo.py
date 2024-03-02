from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy
import pandas as pd
from bson.objectid import ObjectId

def edit_category_name(data, category_id, new_category_name):
    for category in data:
        if category['category_id'] == category_id:
            category['category_name'] = new_category_name
            return data

def edit_sub_category_name(data, category_id, sub_category_id, new_sub_category_name):
    for category in data:
        if category['category_id'] == category_id:
            for subCategory in category['subcategories']:
                if subCategory['subcategory_id'] == sub_category_id:
                    subCategory['subcategory_name'] = new_sub_category_name
                    return data

class CategorieMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init CategorieMongo -> Extend BaseMongo 
        """
        super(CategorieMongo, self).__init__()

    def edit_sub_category(self, user_id=None, category_id=None, sub_category_id=None, new_sub_category_name=None, transaction_type=None):
        try:
            collection = self.client[user_id][VARS.SETTINGS_COLLECTION]

            categories = collection.find_one({"type": "budgetting-categories"})
            categories = categories[transaction_type]

            edited_category = edit_sub_category_name(categories, category_id, sub_category_id, new_sub_category_name)

            collection.update_one(
                {"type": "budgetting-categories"},
                {"$set" : {transaction_type : edited_category}}
            )

            return 200, "Sotto categoria modificata"
        except Exception as e:
            return 500 , str(e)

    def edit_category_name(self, user_id=None, category_id=None, new_category_name=None, transaction_type=None):
        try:
            collection = self.client[user_id][VARS.SETTINGS_COLLECTION]
            categories = collection.find_one({"type": "budgetting-categories"})

            categories = categories[transaction_type]

            edited_category = edit_category_name(categories, category_id, new_category_name)

            collection.update_one(
                {"type": "budgetting-categories"},
                {"$set" : {transaction_type : edited_category}}
            )
            return 200, "Categoria modificata"
        except Exception as e:
            return 500, str(e)

    def get_categories_statistics(self, user_id=None, selectedDateOption=None):
        try:
            # Seleziona i filtri in base a selectedDateOption
            filters = UTILS.DATE_OPTIONS_MAP[selectedDateOption]

            collection = self.client[user_id][VARS.TRANSACTION_COLLECTION]
            pipeline = [
                {"$match": {"type": {"$ne" : "transfer"}, "date": {"$gte": filters['start_date'], "$lte": filters['end_date']}}},
                {
                    "$group": {
                        "_id": {
                            "categoryId": "$categoryId",
                            "type": "$type",
                            "subCategoryId": "$subCategoryId"  # Aggiungi il campo subCategoryId
                        },
                        "totalAmount": {"$sum": "$amount"}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "type": "$_id.type",
                            "categoryId": "$_id.categoryId"
                        },
                        "totalAmount": {"$sum": "$totalAmount"},
                        "subcategories": {  # Aggiungi il campo subcategories
                            "$push": {
                                "subCategoryId": "$_id.subCategoryId",
                                "totalAmount": {"$sum": "$totalAmount"}
                            }
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.type",
                        "totalAmount": {"$sum": "$totalAmount"},
                        "categories": {
                            "$push": {
                                "categoryId": "$_id.categoryId",
                                "totalAmount": "$totalAmount",
                                "subcategories": "$subcategories"  # Aggiungi subcategories dentro categories
                            }
                        }
                    }
                }
            ]

            result = list(collection.aggregate(pipeline))
            return 200, result
        except Exception as e:
            return 500, str(e)
        