var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const logovan = require('../middleware/auth-korisnik');


router.get('/', logovan, function(req,res,next){
  db.get('SELECT * FROM korisnici WHERE username=? AND email=?', [req.session.username, req.session.email],(err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
      res.render('home', {korisnik: data});
    }
  });
})

router.get('/logout', logovan, function(req,res,next){
  req.session.destroy();
  res.redirect('/');
});

router.get('/lista-putovanja', logovan, function(req,res,next){
  db.all('SELECT * FROM kreiranje_putovanja;', [],(err, data)=>{
        if(err){
          console.log("greska sa bazom");
          return;
        }
        res.render('home-korisnik-lista-putovanja', {putovanja: data});
  });
});

router.get('/postavke', logovan, function(req,res,next){
  db.get('SELECT * FROM korisnici WHERE username=? AND email=?', [req.session.username, req.session.email],(err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
      res.render('home-postavke', {korisnik: data});
    }
  });
});

/*
req.session.logovaniKorisnik = true;
req.session.ime = data.ime;
req.session.prezime = data.prezime;
req.session.username = data.username;
req.session.email = data.email;
*/

router.post('/prijava-putovanja', logovan, function(req,res,next){
  db.run('INSERT INTO prijava_putovanja (korisnikov_id, putovanje_id, aktivan) VALUES (?, ?, ?);',[req.session.korisnikId, req.body.id, 0], (err, data)=>{
    if(err){
      console.log("vec ste prijavljeni na ovo putovanje")
      return;
    }
    res.redirect('/home/lista-putovanja');
  })
});

module.exports = router;
