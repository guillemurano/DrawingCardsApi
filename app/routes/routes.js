var ObjectID = require('mongodb').ObjectID;
const cheerio = require('cheerio');
const request = require('request');

module.exports = function(app, db) {

    app.get('/scrape', (res, req) => {
        const url = "http://www.acanomas.com/tableromania/6,008,003.htm";
        
        request(url, (error, response, html) => {
            if (!error) {
                var $ = cheerio.load(html);        
                let words = new Array();
                let cards = new Array();
        
                words = $('#AutoNumber3').find('b').text().split('\n');

                for (let i = 0; i < words.length; i += 5) {
                    if (words[i] === '*') {
                        words[i + 1] = words[i] + words[i + 1]
                        i++;
                    }

                    let card = {
                        place:  words[i],
                        object:  words[i + 1],
                        action:  words[i + 2],
                        difficulty:  words[i + 3],
                        allPlay:  words[i + 4]
                    }
                    cards.push(card);
                }
                res.send(cards);
            }
        });
    });

    app.get('/card/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectID(id) };
        db.collection('cards').findOne(details, (err, item) => {
            if (err) res.send({'error':'An error has occurred'});
            else res.send(item);
        });
    });

    app.get('/cards', (req, res) => {
        db.collection('cards').find({}).toArray((err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });
    
    app.get('/getRandomCard', (req, res) => {
        db.collection('cards').aggregate([
            { $sample: { size: 1 }}
        ]).toArray((err, doc) => {
            if (err) throw err;
            res.send(doc);
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

    app.delete('/card/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectID(id) };
        db.collection('cards').remove(details, (err, item) => {
            if (err) {
            res.send({'error':'An error has occurred'});
            } else {
            res.send('Card ' + id + ' deleted!');
            } 
        });
    });

    app.put('/card/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectID(id) };
        const note = { text: req.body.body, title: req.body.title };
        db.collection('cards').update(details, note, (err, result) => {
          if (err) {
              res.send({'error':'An error has occurred'});
          } else {
              res.send(note);
          } 
        });
      });
};