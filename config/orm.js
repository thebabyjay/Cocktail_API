const config = require('./config')
const sqlConn = require('./sql_connection');
const mongo = require('./mongo');
var ObjectID = require('mongodb').ObjectID;
const db = mongo.db;

sqlConn.query('select * from user_accounts', (err, result) => {
    if (err) {
        return console.log(err);
    }

    console.log(result);
})


/**
 * FUNCTIONS
 * 
 * functions for recipes and ingredients
 * @function getAll
 * @function getByIds
 * @function getOne
 * @function filterByName
 * @function insertOne
 * @function deleteById
 * @function updateById
 * 
 * 
 * other functions
 * @function getMakeableRecipes
 * @function filterMakeableRecipes
 * 
 */
const orm = {

    getAll: (collection, cb) => {
        db.collection(collection).find({}).toArray((err, items) => {
            if (err) {
                return cb(new Error(err));
            }

            cb(null, items);
        });
    },

    getByIds: (collection, idArr, cb) => {
        if (!idArr.length) {
            return cb(new Error('Must pass in at least one ID'));
        }

        // map the array and return new ObjectId
        const fullObjArr = idArr.map(id => {
            return {
                _id: ObjectID(id)
            }
        })

        const findDetails = {
            $or: fullObjArr
        };


        db.collection(collection).find(findDetails).toArray((err, result) => {
            if (err) {
                return cb(new Error(err));
            }

            cb(null, result);
        });
    },

    getOne: (collection, id, cb) => {
        try {
            const details = {
                '_id': new ObjectID(id)
            };

            db.collection(collection).findOne(details, (err, item) => {
                if (err) {
                    return cb(new Error(err));
                }

                cb(null, item);
            })

        } catch (error) {
            return cb(new Error(error)); 
        }
    },

    filterByName: (collection, searchTerm, cb) => {
        db.collection(collection).find({
            name: {
                $regex: new RegExp(searchTerm),
                $options: 'i'
            }
        }).toArray((err, items) => {
            if (err) {
                return cb(new Error(err));
            }

            // return an array of only the names 
            // const itemsArr = items.map(obj => {
            //     return obj.name;
            // })

            cb(null, items);
            // cb(null, itemsArr);
        })
    },

    insertOne: (collection, obj, cb) => {
        db.collection(collection).insertOne(obj, (err, result) => {
            if (err) {
                return cb(new Error(err));
            }

            cb(null, result);
        });
    },

    deleteById: (collection, id, cb) => {
        const details = {
            _id: new ObjectID(id)
        }
        db.collection(collection).deleteOne(details, (err, result) => {
            if (err) {
                return cb(new Error(err));
            }

            cb(null, result);
        });
    },

    updateById: (collection, id, updateObj, cb) => {

        const filter = {
            _id: new ObjectID(id)
        };

        db.collection(collection).updateOne(filter, updateObj, (err, result) => {
            if (err) {
                return cb(new Error(err));
            }

            cb(null, result);
        });
    },


    getMakeableRecipes: (currIngredientsArr, cb) => {
        currIngredientsArr = ["5b92ba92e7179a26041b2f83", "5b92bac4e7179a26041b2f87"];

        // console.log(currIngredientsArr);
        // return cb(null, 'allo');

        // get all recipes
        const collection = 'test_recipes';

        orm.getAll(collection, (err, recipes) => {
            if (err) {
                return cb(new Error(err));
            }

            orm.getByIds('test_ingredients', currIngredientsArr, (err, ingredients) => {
                if (err) {
                    return cb(new Error(err));
                }

                cb(null, orm.filterMakeableRecipes(ingredients, recipes));
            })

        })
    },

    filterMakeableRecipes: (current, all) => {
        return all.filter(a => {
            let keep = false;

            for (let i = 0; i < a.recipe.length; i++) {
                const aIngredient = a.recipe[i];
                keep = false;

                // convert to a .find() function
                const found = current.find(currIng => {
                    return ((currIng.generic_type === aIngredient.generic_ingredient) ||
                        (currIng.generic_type === aIngredient.specific_ingredient) ||
                        (currIng.name === aIngredient.generic_ingredient) ||
                        (currIng.name === aIngredient.specific_ingredient));
                })
                // console.log(`Found: ${JSON.stringify(found)}`);
                keep = found ? true : false;

                if (!keep) {
                    break;  // break out of 'for' loop to return false
                }
            }

            return keep;
        });
    },
}


module.exports = orm;