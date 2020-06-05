var cron = require('node-cron');
var moment = require('moment');
const universal_functions = require('../utils/universal_functions');
const cron_job_services = require('../services/cron_job_services')
const case_services = require('../services/case_services')
const customer_services = require('../services/customer_services')
const underscore = require('underscore')

// every minute cron
cron.schedule('* * * * *', async () => {
    try {
        var start_time = moment().seconds(0).unix();
        var end_time = moment().add(1, 'Minute').seconds(0).unix();

        // get events for remind user
        let events = await cron_job_services.get_events({ start_time, end_time });
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let reminder_type = 0;
            if (parseInt(event.reminder1_datetime) >= start_time && parseInt(event.reminder1_datetime) < end_time) {
                reminder_type = event.reminder_type1;
            } else {
                reminder_type = event.reminder_type2;
            }

            if (reminder_type != 0) {
                // get attendeed for perticular event
                let usersData = await cron_job_services.get_attendees(events[i].event_id);
                // send push notification
                if (reminder_type === 2 || reminder_type === 3) {
                    let device_tokens = underscore.pluck(usersData, 'device_token');
                    device_tokens = underscore.uniq(device_tokens);
                    device_tokens = underscore.uniq(device_tokens);
                    device_tokens = underscore.compact(device_tokens);
                    let pushData = [{
                        type: 11,
                        title: event.push_msg,
                        other: event.event_id
                    }];
                    universal_functions.send_push_dynamic(pushData, device_tokens, event.push_msg,{});
                    usersData.map(user => {
                        let notificationData2 = { case_id: event.event_id, sender_id: null, reciver_id: user.user_id, text: event.push_msg, is_me: 1, type: 11 };
                        case_services.create_notification({}, notificationData2);
                        return 1;
                    });
                }

                // send email
                if (reminder_type === 1 || reminder_type === 3) {
                    usersData.map(user => {
                        if (user.email) {
                            customer_services.email_send({
                                email: user.email,
                                subject: event.email_subject,
                                body: event.email_body
                            }, {});
                        }
                        return 1;
                    });
                }
            }
        }
    } catch (err) {
        console.log("err cron");
        console.log(err);
    }
});
