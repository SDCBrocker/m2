const winston = require('winston');
const moment = require('moment')
let debugging_enabled = true

// console.log replacement
const  log = function () {
    if (debugging_enabled) {
        console.log.apply(console, arguments);
    }
};


const log2 =  (apiReference, log) =>{
    if (debugging_enabled) {
        try {
            log = JSON.stringify(log);
            console.log("-->" + moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSS') + " :----: " +
                apiReference.module + " :=: " + apiReference.api + " :=: " + log);
        } catch  (e) {

        }
    }
};


module.exports = {
    log:log,
    log2:log2
}