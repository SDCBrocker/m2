/**
 * Created by Akash Deep on  09/05/2019.
 */
'use strict';
const customer_route = require('./customer_route');
const admin_route = require('./admin_route');
require('../controllers/cron_job');
const all = [].concat(customer_route, admin_route);

module.exports = all;

