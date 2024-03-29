const router = require('express').Router();
const orm = require('../../config/orm');

const collection = require('../../config/config').databases.mongo.development.recipes_collection;


// get all recipes
router.get('/recipes', (req, res) => {
    orm.getAll(collection, (err, items) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }
        res.json({
            success: true,
            data: items
        });
    })
});


// get recipe by ID
router.get('/recipes/id/:id', (req, res) => {
    orm.getOne(collection, req.params.id, (err, item) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            data: item
        });
    })
    // orm.getByIds(collection, [req.params.id], (err, item) => {
    //     if (err) {
    //         return res.json({
    //             status: 404,
    //             error: err.message
    //         });
    //     }

    //     res.json({
    //         status: 200,
    //         data: item
    //     });
    // })
});


// filter recipe names by a search term
router.get('/recipes/filter/:term', (req, res) => {
    const searchTerm = req.params.term;
    
    orm.filterByName(collection, searchTerm, (err, items) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            data: items
        });
    })
});

router.get('/recipes/makeable', (req, res) => {
    const ingredientsArray = req.body.ingredients;

    if (!ingredientsArray) {
        return res.json({
            status: 404,
            message: 'An array with at least one ingredient must be given'
        });
    }

    orm.getMakeableRecipes(ingredientsArray, (err, recipes) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        // console.log(`Recipes: ${recipes}`)

        res.json(recipes);
    })
})

// add a new recipe
router.post('/recipes', (req, res) => {
    const body = req.body;

    // make sure the recipe isn't already created
    // do stuff here


    // Create the recipe here
    const recipeObj = {
        name: body.name,
        image: body.image,
        extras: body.extras,
        standard_drink_size: body.std_drink_size,
        recipe: body.recipe
    }

    orm.insertOne(collection, recipeObj, (err, result) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true
        })
    })

    
});

router.delete('/recipes/:id', (req, res) => {
    orm.deleteById(collection, req.params.id, (err, result) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true
        });
    })
    
});

router.put('/recipes/:id', (req, res) => {
    const id = req.params.id;
    
    const updateObj = {
        $set: {
            name: req.body.name,
            cost: req.body.cost
        }
    };

    orm.updateById(collection, id, updateObj, (err, result) => {
        if (err) {
            return res.json({
                status: 404,
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true
        })
    })
});


module.exports = router;