var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
    app.get('/card/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectID(id) };
        db.collection('cards').findOne(details, (err, item) => {
            if (err) res.send({'error':'An error has occurred'});
            else res.send(item);
        });
    });

    app.get('/random', (req, res) => { 
        const details = { '_id': new ObjectID(id) };
        db.collection('cards').find(details, (err, item) => {
            if (err) res.send({'error':'An error has occurred'});
            else res.send(item);
        });
    });

    app.post("/card", (req, res) => {
        const body = req.body;
        const card = { 
            place: body.place, 
            object: body.object,
            action: body.action,
            difficulty: body.difficulty,
            allPlay: body.allPlay
        };
        db.collection('cards').insert(card, (err, result) => {
            if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                res.send(result.ops[0]);
            }
        });
    });
};