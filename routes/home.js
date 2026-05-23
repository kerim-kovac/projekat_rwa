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
      db.all(`
        
      SELECT kreiranje_putovanja.drzava, kreiranje_putovanja.grad, kreiranje_putovanja.datum, kreiranje_putovanja.cijena, kreiranje_putovanja.lat, kreiranje_putovanja.lng
FROM prijava_putovanja
JOIN korisnici ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE prijava_putovanja.korisnikov_id = ? AND prijava_putovanja.aktivan = 1 AND kreiranje_putovanja.datum < date('now');  
        
        `,[req.session.korisnikId],(err2, putovanja)=>{
              if(err2){
      console.log("greska na bazi");
      return;
    }
      res.render('home', {korisnik: data, putovanja: putovanja});
        });
    }
  });
});

router.get('/logout', logovan, function(req,res,next){
  req.session.destroy();
  res.redirect('/');
});

router.get('/lista-putovanja', logovan, function(req,res,next){
  db.all(`SELECT * FROM kreiranje_putovanja WHERE kreiranje_putovanja.datum >= date('now');`, [],(err, data)=>{
        if(err){
          console.log("greska sa bazom");
          return;
        }
        res.render('home-korisnik-lista-putovanja', {putovanja: data});
  });
});

router.get('/moja-putovanja', logovan, function(req,res,next){
  db.all(`
SELECT kreiranje_putovanja.drzava, kreiranje_putovanja.agencija, kreiranje_putovanja.tip_putovanja, kreiranje_putovanja.prevoz, kreiranje_putovanja.grad, kreiranje_putovanja.datum, kreiranje_putovanja.cijena
FROM prijava_putovanja
JOIN korisnici ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE prijava_putovanja.korisnikov_id = ? AND prijava_putovanja.aktivan = 1  AND kreiranje_putovanja.datum < date('now'); 
    `, [req.session.korisnikId],(err,data)=>{
      if(err){console.log("greska na bazi");return;}
      res.render('home-korisnik-moja-putovanja', {putovanja: data});
    })
});

router.get('/rezervacije', logovan, function(req,res,next){
  db.all(`
  SELECT  kreiranje_putovanja.grad, kreiranje_putovanja.drzava, kreiranje_putovanja.cijena, kreiranje_putovanja.datum, prijava_putovanja.aktivan, kreiranje_putovanja.id AS putovanje_id
FROM prijava_putovanja
JOIN korisnici 
  ON prijava_putovanja.korisnikov_id = korisnici.id
JOIN kreiranje_putovanja 
  ON prijava_putovanja.putovanje_id = kreiranje_putovanja.id
WHERE prijava_putovanja.korisnikov_id = ? AND kreiranje_putovanja.datum >= date('now');`, [req.session.korisnikId], (err,data)=>{
  if(err){console.log("greska"); return;}

  res.render('home-korisnik-rezervacije', {podaci:data});
});
});

router.post('/rezervacije/odjava', logovan, function(req,res,next){
  db.run('DELETE FROM prijava_putovanja WHERE korisnikov_id=? AND putovanje_id=?', [req.session.korisnikId, req.body.putovanjeId],(err,data)=>{
    if(err){console.log("greska na bazi");return;}
    res.redirect('/home/rezervacije');
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
router.post('/postavke/promjena-imena-prezimena', logovan, function(req,res,next){
  db.get('SELECT * FROM korisnici WHERE ime=? AND prezime=?', [req.body.novoIme, req.body.novoPrezime], (err,data)=>{
    if(err){console.log("greska na bazi"); return;}
    
    if(data){
      console.log("postoji neko sa tim Imenom");
    }else{

      db.run('UPDATE korisnici SET ime=?,prezime=? WHERE id=?',[req.body.novoIme,req.body.novoPrezime,req.session.korisnikId],(err,data)=>{
        if(err){console.log("greska na bazi"); return;}
        req.session.destroy();
        res.render('login', {poruka: "Uspjesno promjenjeno ime i prezime", greska:false});
      });
    }
  });
});

router.post('/postavke/promjena-sifre', logovan, async function(req,res,next){
    if(req.body.trenutna == req.body.nova){res.render('login', {poruka: "Ne mozete koristiti istu sifru!"}); return;}
  db.get('SELECT * FROM korisnici WHERE id=?',[req.session.korisnikId], async (err,data)=>{
  if(err){console.log("greska na bazi"); return;}
    if(data){
      const match = await bcrypt.compare(req.body.trenutna, data.password);

      if(match){
        const hashed = await bcrypt.hash(req.body.nova,10);
        db.run('UPDATE korisnici SET password=? WHERE id=?',[hashed,req.session.korisnikId],(err,data)=>{
          if(err){console.log("greska na bazi"); return;}
          res.render('login', {poruka: "Uspjesno promjenjena sifra", greska:false});
        });
      }

    }
  });
});


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
