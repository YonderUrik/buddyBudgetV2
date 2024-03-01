from mongo import BaseMongo
import vars as VARS
import utils as UTILS
import logging
from datetime import timedelta, datetime, date
import copy
import pandas as pd
from bson.objectid import ObjectId


class CategorieMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init CategorieMongo -> Extend BaseMongo 
        """
        super(CategorieMongo, self).__init__()

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

            print(result)
            return 200, result
        except Exception as e:
            return 500, str(e)
        