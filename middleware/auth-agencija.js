function logovan(req,res,next){
  if(req.session.logovanaAgencija){
    next();
  }else{
    res.redirect('/');
  }
}

module.exports = logovan;