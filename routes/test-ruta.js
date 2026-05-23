var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const logovan = require('../middleware/auth-korisnik');

/*


SELECT kreiranje_putovanja.lat, kreiranje_putovanja.lng
FROM prijava_putovanja JOIN korisnici ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE korisnici.id=9 AND prijava_putovanja.aktivan = 1;     

*/


router.get('/',  function(req,res,next){
 db.all(`
  
SELECT kreiranje_putovanja.lat, kreiranje_putovanja.lng
FROM prijava_putovanja JOIN korisnici ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE korisnici.id=9 AND prijava_putovanja.aktivan = 1;       
  
  `,[],(err,data)=>{
    if(err){console.log("greska na bazi");return;}
    console.log(data);
    res.render('test', {podaci: data});
  });
});

module.exports = router;
