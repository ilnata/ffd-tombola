var express = require('express');
var router = express.Router();

var io = require('socket.io')();


io.on('connection', function(socket){
  console.log('a user connected');
});
io.listen(1223);


console.log("CONNECTED TO MONGO");
let _ = require('lodash');
let Cartella = require('../db/cartelle');
let Estrazione = require('../db/estrazione');
let Cabala = require('../db/cabala');
/* GET home page. */
router.get('/', async function(req, res, next) {
  let numeri = await Estrazione.find().lean();
  let cabala = await Cabala.find().lean()
  res.render('estrazione', { numeri: numeri.map(function(n){return n.number}), cabala });
});
router.get('/estrattore', async function(req, res, next) {
  res.render('estrattore');
});

router.get('/estratti', async function(req, res, next) {
  let e = await Estrazione.find().lean();
  res.json({numeri: e.map(function(n){return n.number})});
});

router.post('/pulisci_tabellone', async function(req, res, next){
  await Estrazione.deleteMany({});
  return res.json({status: 200});
});

router.post('/estratto', async function(req, res, next){
  let numero = Number(req.body.numero);
  if (numero>0 && numero<91) {
    let es = await Estrazione.findOne({number: numero}).lean();
    if (!es) {
      let e = new Estrazione();
      e.number = numero;
      await e.save();
    }
    io.emit('estratto', {numero: numero});
  }


  let estratt = await Estrazione.find().lean();
  let estratti = estratt.map(function(n){return n.number});

  let cinquine = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$cinquina_1",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_2",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_3",estratti]}},
    ]});


  let tombole = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$sequence",estratti]}}
    ]});

  return res.json({status: 200, cinquine: cinquine,
    tombole: tombole});
});




router.post('/cancellaestratto', async function(req, res, next){
  let numero = Number(req.body.numero);
  if (numero>0 && numero<91) {
    let es = await Estrazione.findOne({number: numero}).lean();
    if (es) {
      await Estrazione.deleteOne({number: numero});
    }
    io.emit('cancellaestratto', {numero: numero});
  }


  let estratt = await Estrazione.find().lean();
  let estratti = estratt.map(function(n){return n.number});

  let cinquine = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$cinquina_1",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_2",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_3",estratti]}},
    ]});


  let tombole = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$sequence",estratti]}}
    ]});

  return res.json({status: 200, cinquine: cinquine,
    tombole: tombole});
});


router.get('/parse', async function(req, res){

  const csv = require('csv-parser');
  const fs = require('fs');

  fs.createReadStream('cartelle.csv')
      .pipe(csv())
      .on('data', async (row) => {
        console.log(row);
        for(let r=0; r<3; r++) {
          let cinquina = [];
          for (let i = 1; i <= 9; i++) {
            let cella = row[String(r*9+i)];
            if (cella!='') cinquina.push(cella);
          }
          let up = {};
          up[`cinquina_${(r+1)}`] = cinquina
          await Cartella.updateOne(
              {code: Number(row.code)},{$set: up}
              );
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });

  res.json({status: 200});
});

router.get('/find', async function(req, res){


  let estratti = req.query.e;

  if (estratti){
    estratti = estratti.map((e)=>{return Number(e)});
  }

  let cinquine = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$cinquina_1",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_2",estratti]}},
      {$expr:{$setIsSubset:["$cinquina_3",estratti]}},
      ]});


  let tombole = await Cartella.find({$or: [
      {$expr:{$setIsSubset:["$sequence",estratti]}}
      ]});


  res.json({
    e:estratti,
    cinquine: cinquine,
    tombole: tombole
  })

});

router.get('/generator', async function(req, res){

  return;
  var fs = require('fs');

  fs.writeFileSync('cartelle.csv', "", {mode: 0o755});
  fs.appendFileSync('cartelle.csv', "code,", {mode: 0o755});
  for (let r=0; r<=2; r++) {
    for (let c = 0; c <= 8; c++) {
      fs.appendFileSync('cartelle.csv', ((r*9)+(c+1))+(c==8&&r==2?"\n":","), {mode: 0o755});
    }
  }

  for (let ciclo = 1; ciclo<=600; ciclo++) {
    let extracted = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    };
    let extracted_sequence = [];
    let conta_estratti = 0;

    do {
      let colonna = Math.floor(Math.random() * 9); //nomero della colonna
      if (extracted[colonna].length < 3) {
        let extract = Math.floor(Math.random() * 10) + (colonna * 10);
        if (extract == 0) {
          extract = 90;
          colonna = 8;
        }
        if (extracted[colonna].indexOf(extract) === -1) {
          extracted[colonna].push(extract);
          extracted_sequence.push(extract);
          conta_estratti++;
        }
      }
    } while (conta_estratti < 15);


    let tabella = [];
    for (let r = 3; r >= 1; r--) {
      let colonne_estratte = [];
      let riga = {};
      let timeout = 200;
      do {
        let colonna = -1;
        //prima prendo quelli che hanno 3 celle poi 2 poi quelli che restano
        for (let c2 = 0; c2 < 9; c2++) {
          if (extracted[c2].length == r) {
            //prendo direttamente questa colonna
            colonna = c2;
            break;
          }
        }
        if (colonna == -1) {
          colonna = Math.floor(Math.random() * 9); //nomero della colonna
        }
        if (colonne_estratte.indexOf(colonna) == -1 && extracted[colonna].length > 0) {
          colonne_estratte.push(colonna);
          let numero = extracted[colonna].pop();
          riga[colonna] = numero;
        } else {

        }
        timeout--;
      } while (colonne_estratte.length < 5 && timeout > 0)
      tabella.push(riga);

    }

    fs.appendFileSync('cartelle.csv', (String(ciclo)).padStart(3, "0")+",", {mode: 0o755});

    let estrazione = []
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 8; c++) {
        if (tabella[r][c]) estrazione.push(tabella[r][c]);
        fs.appendFileSync('cartelle.csv', tabella[r][c] ? tabella[r][c] : "", {mode: 0o755});
        if (r == 2 && c == 8) {
          fs.appendFileSync('cartelle.csv', "\n");
        } else {
          fs.appendFileSync('cartelle.csv', ',');
        }
      }
    }

    estrazione.sort(function(a, b){return a-b});

    let cc = new Cartella();
    cc.code = ciclo;
    cc.sequence = estrazione;
    cc.string_sequence = estrazione.join('_');
    await cc.save();
  }


  return res.json({status: 200});
})

module.exports = router;
