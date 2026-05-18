function logovan(req,res,next){
  if(req.session.logovaniKorisnik){
    next();
  }else{
    res.redirect('/');
  }
}

module.exports = logovan;