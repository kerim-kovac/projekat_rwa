var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.render('register');
});
router.get('/korisnik', function(req,res,next) {
    res.render('register-korisnik');
});
router.get('/agencija', function(req,res,next){
  res.render('register-agencija');
});


router.post('/korisnik', async function(req,res,next){
  db.get('SELECT * FROM korisnici WHERE username=? OR email=?',[req.body.username, req.body.email], async(err,data)=>{
      if(err){
        res.end("greska sa bazom");
        return;
      }
      if(data){
        res.render('register-agencija', {poruka: "Vaši podaci su vec registrovani"});
        return;
      }else{
        if(req.body.password == req.body.ponovljeni){
        const password = req.body.password;
        const role = 'User';
        const hashed = await bcrypt.hash(password, 10);
        db.run('INSERT INTO korisnici (ime, prezime, username, email, password,role)  VALUES(?,?,?,?,?,?)',[req.body.ime, req.body.prezime,req.body.username,req.body.email,hashed,role], (err,data)=>{
          if(err){
            res.end("greska na bazi");
            return;
          }
          res.redirect('/');
        })
        }else{
        res.render('register-agencija', {poruka: "Sifre se ne poklapaju"});
      }
      }
  });
});

router.post('/agencija', function(req,res,next){
  db.get('SELECT * FROM agencija WHERE naziv=? OR email=?',[req.body.naziv_agencije, req.body.email], async(err,data)=>{
      if(err){
        res.end("greska sa bazom");
        return;
      }
      if(data){
        res.render('register-agencija', {poruka: "Email adresa zauzeta"});
      }else{
        if(req.body.password == req.body.ponovljena_lozinka){
        const password = req.body.password;
        const role = 'Agencija';
        const hashed = await bcrypt.hash(password, 10);
        db.run('INSERT INTO agencija (naziv, email, datum, password,role)  VALUES(?,?,?,?,?)',[req.body.naziv_agencije,req.body.email,req.body.datum_osnivanja,hashed,role], (err,data)=>{
          if(err){
            res.end("greska na bazi");
            return;
          }
          res.redirect('/');
        })
        }else{
        res.render('register-agencija', {poruka: "Sifre se ne poklapaju"});
        return;
      }
      }
  });
});
module.exports = router;
