const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./baza.db', (err)=>{
    if(err){
        console.log("Neuspjesna konekcija sa bazom");
        return;
    }
        console.log("Uspjesna konekcija sa bazom");
})

module.exports = db;