var ObjectID = require('mongodb').ObjectID;
const cheerio = require('cheerio');
const request = require('request');
const iconv  = require('iconv-lite');

module.exports = function(app, db) {

    app.post('/scrape', (res, req) => {
        const url = "http://www.acanomas.com/tableromania/6,008,003.htm";        
        let cards = [];
        const requestOptions  = { encoding: null, method: "GET", uri: url};

        request(requestOptions, (error, response, html) => {
            html = iconv.decode(new Buffer(html), "ISO-8859-1");
            if (!error) {
                const $ = cheerio.load(html);
                let words = [];
                let asterisk = false;

                $('td[bgColor=#DADADA]', '#AutoNumber3').each((i, element) => {
                    let card = $(element).text().split('\n');
                    if (i === 0){
                        words = card;
                    }
                    else{
                        words = words.concat(card);
                    }
                });
                
                words = words.filter((word) => { return word.trim() != ''; });

                words = words.map((item) => {
                    let word = item.trim();
                    asterisk = asterisk || (word === '*');
                    
                    if (asterisk && word !== '*') {
                        word = '* ' + word;
                        asterisk = false;
                    }

                    return word; 
                });
                
                words = words.filter((word) => { return word && word != '*'; });
                
                for (let i = 0; i < words.length; i += 5){
                    db.collection('cards').insert({
                        place: words[i],
                        object: words[i+1],
                        action: words[i+2],
                        difficulty: words[i+3],
                        allPlay: words[i+4],
                    });
                }
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