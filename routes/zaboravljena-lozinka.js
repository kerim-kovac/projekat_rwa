var express = require('express');
var router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');

router.get('/', function(req, res, next) {
  res.render('zaboravljena-lozinka');
});

router.post('/', async function(req,res,next){
  db.get('SELECT * FROM korisnici WHERE email=?', [req.body.email], async (err,data)=>{
    if(err){
      console.log("greska na bazi");
      return;
    }
    if(data){
    const password = generator.generate({
	      length: 10,
	      numbers: true
      });
    const hashed = await bcrypt.hash(password,10);      
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'i56526455@gmail.com',
        pass: 'samckahttxozyhoy'
        }
        });
        const mailOptions = {
        from: 'i56526455@gmail.com',
        to: req.body.email,
        subject: 'Reset lozinke',
        html: `<h1>Tvoja nova lozinka je: ${password}</h1>`
        };
        db.run('UPDATE korisnici SET password=? WHERE email=?', [hashed,req.body.email], (err,data)=>{
          if(err){
            console.log("greska na bazi");
            return;
          }
          
          transporter.sendMail(mailOptions, (err, info) => {
              if(err){
              console.log(err);
              } else {
              res.render('zaboravljena-lozinka', {uspjesno: "Nova lozinka je poslana na Email"})
              }
              });
          
        });
    }else{
      res.render('zaboravljena-lozinka', {poruka: "E-mail ne postoji u sistemu"})
    }
  });
});
module.exports = router;
