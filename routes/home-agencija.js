var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const logovan = require('../middleware/auth-agencija');
/*
function logovan(req,res,next){
  if(req.session.logovanaAgencija){
    next();
  }else{
    res.redirect('/');
  }
}
*/
router.get('/', logovan, function(req,res,next){
  db.get('SELECT * FROM agencija WHERE naziv=? AND email=?', [req.session.naziv, req.session.email],(err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
      res.render('home-agencija', {agencija: data});
    }
  });
});

router.get('/logout', logovan, function(req,res,next){
  req.session.destroy();
  res.redirect('/');
})

router.get('/kreiraj-putovanje', logovan, function(req,res,next){
  res.render('home-agencija-putovanja');
});

router.get('/lista-putovanja', logovan, function(req,res,next){
  db.all('SELECT * FROM kreiranje_putovanja', [], (err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
      res.render('home-agencija-lista-putovanja', {putovanja: data, agencija: req.session.naziv});
    }
  })
});

router.get('/opcije', logovan, function(req,res,next){
  db.get('SELECT * FROM agencija WHERE naziv=? AND email=?', [req.session.naziv, req.session.email],(err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
      res.render('home-agencija-opcije', {agencija: data});
    }
  });
});

router.get('/prijavljeni-useri', logovan, function(req,res,next){
db.all(
`
SELECT korisnici.ime,korisnici.id, korisnici.prezime, korisnici.email, kreiranje_putovanja.grad, kreiranje_putovanja.drzava, kreiranje_putovanja.datum, prijava_putovanja.aktivan
FROM prijava_putovanja
JOIN korisnici ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE kreiranje_putovanja.agencija=?;
`, [req.session.naziv], (err, data)=>{
  if(err){
    console.log("greska na bazi");
    return;
  }
    console.log(data);

    res.render('home-agencija-prijavljeni-useri', {podaci: data});
})
});

router.post('/kreiraj-putovanje', logovan, function(req,res,next){
  db.run('INSERT INTO kreiranje_putovanja (agencija, drzava, grad, deskripcija, datum, min, max, cijena, agencija_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?);', [req.session.naziv,req.body.drzava, req.body.grad, req.body.deskripcija, req.body.datum, req.body.minimalan, req.body.maximalan, req.body.cijena], (err,data)=>{
      if(err){
        console.log("greska na bazi");
        return;
      }
      res.redirect('/home-agencija');
  })
});
 router.post('/lista-putovanja', logovan, function(req,res,next){
  db.run('DELETE FROM kreiranje_putovanja WHERE id=?', [req.body.id], (err,data)=>{
    if(err){   
      console.log("erorr");
      return;
    }
    db.run('DELETE FROM prijava_putovanja WHERE putovanje_id=?;', [req.body.id], (err,data)=>{
      if(err){
        console.log("greska na bazi");
        return;
      }
      res.redirect('/home-agencija/lista-putovanja');
    });
  })
});

router.post('/prijavljeni-useri/odobreno', logovan, function(req,res,next){
    db.run('UPDATE prijava_putovanja SET aktivan = 1 WHERE korisnikov_id=?', [req.body.id], (err,data)=>{
      if(err){
        console.log("greska sa bazom");
        return;
      }
      res.redirect('/home-agencija/prijavljeni-useri');
    })
});

module.exports = router;
