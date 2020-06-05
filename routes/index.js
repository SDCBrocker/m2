/**
 * Created by Akash Deep on  09/05/2019.
 */
'use strict';
const customer_route = require('./customer_route');
const admin_route = require('./admin_route');
const case_route = require('./case_route');
require('../controllers/cron_job');
const all = [].concat(customer_route, admin_route, case_route);

module.exports = all;

