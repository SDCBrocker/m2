const universal_functions = require('../utils/universal_functions');
const admin_services = require('../services/admin_services')
const constant = require('../lib/constant')
const customer_services = require('../services/customer_services')
const case_services = require('../services/case_services')
const config = require('config');
const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const client = require('twilio')(accountSid, authToken);
const rn = require('random-number');
const underscore = require('underscore')
const _ = require('lodash');
let  redisClient = null
if(process.env.NODE_ENV){
     redisClient = require('redis').createClient();
}


const options = {
    min: 1000
    , max: 9999
    , integer: true
}
//
// client.messages.create({
//     body: 'Hello from Node',
//     to: '+919050920333',  // Text this number
//     from:  config.twilio.from // From a valid Twilio number
// })
//     .then((message) => console.log(message.sid));

const admin_login = async (payload) => {
    try {

        let getUser = await admin_services.check_user(payload);
        let token = await admin_services.create_token_admin(getUser);
        await admin_services.update_token(token, getUser);
        getUser.access_token = token
        return universal_functions.sendSuccess(payload, [getUser]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_surgen = async (userData, payload) => {
    try {

        let getUserCount = await admin_services.get_surgen_count(payload);
        let getUser = await admin_services.get_surgen(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const get_all_block_surgeon = async (userData, payload) => {
    try {

        let getUserCount = await admin_services.get_block_count(payload);
        let getUser = await admin_services.get_surgen_block(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const all_surgeon_for_verify = async (userData, payload) => {
    try {

        let getUserCount = await admin_services.all_surgeon_for_verify_count(payload);
        let getUser = await admin_services.get_surgen_for_verify(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const approve_reject = async (userData, payload) => {
    try {

        let getUser = await admin_services.get_surgen_by_id(payload);
        if (getUser && getUser.length > 0) {
            payload.otp = rn(options)
            await admin_services.approve_reject(payload);
            if (payload.is_approve) {
                customer_services.email_send(
                    {
                        username: getUser[0].name, email: getUser[0].email,
                        msg: constant.email_msg.account_approve,
                        subject: constant.email_msg.account_approve_subject,
                        email_template: constant.email_template.account_approve,
                        body: constant.email_template.account_approve
                    }, { username: getUser[0].name })
            } else {
                customer_services.email_send(
                    {
                        username: getUser[0].name, email: getUser[0].email,
                        msg: constant.email_msg.account_reject,
                        subject: constant.email_msg.account_reject_subject,
                        email_template: constant.email_template.account_reject,
                        body: constant.email_template.account_reject
                    }, { username: getUser[0].name, comment: payload.comment })
            }
            if (payload.is_approve) {
                if (getUser[0].call_me != null) {
                    smsSend(getUser[0].call_me, payload.otp)
                } else if (getUser[0].sale_call != null) {
                    smsSend(getUser[0].sale_call, payload.otp)
                } else if (getUser[0].email_me != null) {
                    customer_services.email_send(
                        {
                            username: getUser[0].name, email: getUser[0].email_me,
                            msg: constant.email_msg.account_reject,
                            subject: constant.email_msg.login_otp,
                            email_template: constant.email_template.login_otp,
                            body: constant.email_template.login_otp
                        }, { username: getUser[0].name, otp: payload.otp })
                } else if (getUser[0].sale_email != null) {
                    customer_services.email_send(
                        {
                            username: getUser[0].name, email: getUser[0].sale_email,
                            msg: constant.email_msg.account_reject,
                            subject: constant.email_msg.login_otp,
                            email_template: constant.email_template.login_otp,
                            body: constant.email_template.login_otp
                        }, { username: getUser[0].name, otp: payload.otp })
                }
            }
            return universal_functions.sendSuccess(payload, getUser);
        } else {
            throw constant.msg.userNotFind
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const approve_reject_case = async (userData, payload) => {
    try {
        let caseDataGet = await case_services.case_details(payload.case_id);
        if(!caseDataGet.length){
            throw new Error("Case not exists");
        }
        
        await admin_services.approve_reject_case(payload);
        let type = 12;
        let msg = constant.push_msg.case_approved;
        let titlePush = constant.push_msg.approveTitle
        if (payload.status != 1) {
            type = 13;
            msg = constant.push_msg.case_rejected;
            titlePush = constant.push_msg.rejectTitle
        } 
        caseDataGet = caseDataGet.map(function (el) {
            var o = Object.assign({}, el);
            o.type = type;
            return o;
        });
        // send notification
        universal_functions.send_push_dynamic(caseDataGet, caseDataGet[0].device_token, msg,{title:titlePush})
        let notificationData = { sender_id: userData.admin_id, reciver_id: caseDataGet[0].user_id, text: msg, is_me: 1, type: type, case_id: payload.case_id }
        await case_services.create_notification(userData, notificationData);

        return universal_functions.sendSuccess(payload, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const page_content = async (userData, payload) => {
    try {
        let page = await admin_services.page_content(payload);
        return universal_functions.sendSuccess(payload, { page });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}




const add_page_content = async (payload) => {
    try {
        let page = await admin_services.add_page_content(payload);
        return universal_functions.sendSuccess(payload, { page });
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const create_event = async (userData, payload) => {
    try {
        let event = await admin_services.create_event(payload);
        if (event.affectedRows) {
            payload.list_of_attendees = underscore.uniq(payload.list_of_attendees);
            await admin_services.add_attendees(payload.list_of_attendees, event.insertId);
            // send notification to all attendees    
            if (payload.send_notification) {
                // get user device_tokens
                let usersData = await customer_services.get_users(payload.list_of_attendees)
                let device_tokens = underscore.pluck(usersData, 'device_token');
                let msg = constant.push_msg.admin_event;
                let pushData = [{
                    type: 11,
                    title: msg,
                    other: event.insertId
                }];
                universal_functions.send_push_dynamic(pushData, device_tokens, msg,{});
                usersData.map(user => {
                    let notificationData2 = { case_id: event.insertId, sender_id: userData.admin_id, reciver_id: user.user_id, text: msg, is_me: 1, type: 11 };
                    case_services.create_notification(userData, notificationData2);
                    return 1;
                });
            }
            if (typeof payload.location === 'string') {
                payload.location = JSON.parse(payload.location);
            }
            // add event to calender
            for (let i = 0; i < payload.list_of_attendees.length; i++) {
                let eventPayload = {
                    event_save_id: event.insertId,
                    time: payload.start_datetime || null,
                    start_date: payload.start_datetime || null,
                    end_date: payload.end_datetime || null,
                    title: payload.title || null,
                    location: payload.location ? payload.location.street_address : null,
                    description: payload.description || null,
                    list_of_types: [],
                    link: payload.url || null,
                    latitude: payload.latitude || 0,
                    longitude: payload.longitude || 0,
                    is_private: 1
                }
                case_services.create_event({ user_id: payload.list_of_attendees[i] }, eventPayload);
            }
        }
        return universal_functions.sendSuccess({}, event);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const edit_event = async (userData, payload) => {
    try {
        let eventDetail = await admin_services.get_event_details({ event_id: payload.event_id });
        if (eventDetail) {
            eventDetail = eventDetail[0];
            await admin_services.edit_event(payload);
            eventDetail.list_of_attendees = eventDetail.list_of_attendees.split(',');
            eventDetail.list_of_attendees = eventDetail.list_of_attendees.map(id => parseInt(id));
            let newAttendees = _.difference(payload.list_of_attendees, eventDetail.list_of_attendees);
            let removeAttendees = _.difference(eventDetail.list_of_attendees, payload.list_of_attendees);
            if (newAttendees.length > 0) {
                newAttendees = underscore.uniq(newAttendees);
                await admin_services.add_attendees(newAttendees, payload.event_id);
                if (typeof payload.location === 'string') {
                    payload.location = JSON.parse(payload.location);
                }
                // add event to calender
                for (let i = 0; i < newAttendees.length; i++) {
                    let eventPayload = {
                        event_save_id: payload.event_id,
                        time: payload.start_datetime || null,
                        start_date: payload.start_datetime || null,
                        end_date: payload.end_datetime || null,
                        title: payload.title || null,
                        location: payload.location ? payload.location.street_address : null,
                        description: payload.description || null,
                        list_of_types: [],
                        link: payload.url || null,
                        latitude: payload.latitude || 0,
                        longitude: payload.longitude || 0,
                        is_private: 1
                    }
                    case_services.create_event({ user_id: newAttendees[i] }, eventPayload);
                }
            }

            if (removeAttendees.length > 0) {
                removeAttendees = underscore.uniq(removeAttendees);
                await admin_services.remove_attendees(removeAttendees, payload.event_id);
                case_services.remove_event(removeAttendees, payload.event_id);
            }
            return universal_functions.sendSuccess({}, {});
        } else {
            throw new Error("Event not exists");
        }
    } catch (error) {
        console.log(error);

        return universal_functions.sendError(error);
    }
}

const get_event = async (payload) => {
    try {
        let data = await admin_services.get_event(payload);
        data = data.map(o => {
            o.list_of_attendees = o.list_of_attendees.split(',');
            o.list_of_attendees = o.list_of_attendees.map(id => parseInt(id));
            if (o.location && o.location !== "") {
                o.location = JSON.parse(o.location);
            }
            return o;
        });
        return universal_functions.sendSuccess(payload, data);
    } catch (error) {
        console.log(error);

        return universal_functions.sendError(error);
    }
}

const delete_event = async (payloadData) => {
    try {
        await admin_services.delete_event(payloadData);
        return universal_functions.sendSuccess(payloadData, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const verify_unverify = async (userData, payload) => {
    try {

        let getUser = await admin_services.get_surgen_by_id(payload);
        if (getUser && getUser.length > 0) {
            await admin_services.verify_unverify(payload);
            return universal_functions.sendSuccess(payload, getUser);
        } else {
            throw constant.msg.userNotFind
        }
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const get_all_report_post = async (userData, payload) => {
    try {
        let getUserCount = await admin_services.get_report_count(payload);
        let getUser = await admin_services.get_report_data(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const block_user = async (payloadData, userData) => {
    try {
        const result = await customer_services.get_user(payloadData.user_id)
        if (payloadData.is_block) {
            if (result && result.length > 0 && result[0].is_block == 1) {
                throw constant.msg.block
            } else {
                await customer_services.block_unblock(payloadData)
            }
        } else {
            if (result && result.length > 0 && result[0].is_block == 0) {
                throw constant.msg.unblock
            } else {
                await customer_services.block_unblock(payloadData)
            }
        }

        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const send_push_admin = async (payloadData) => {
    try {
        let result = await customer_services.get_user_filter(payloadData)
        universal_functions.send_push_dynamic(payloadData, underscore.pluck(result, 'device_token'), payloadData.title,{})
        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const get_surgeon_for_specialization = async (userData, payload) => {
    try {
        let getUserCount = await admin_services.get_surgeon_for_specialization_count(payload);
        let getUser = await admin_services.get_surgeon_for_specialization(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const assign_title_to_user = async (userData, payload) => {
    try {

        let getUserCount = await admin_services.update_details(payload);
        return universal_functions.sendSuccess(payload, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const staff_directory = async (userData, payload) => {
    try {

        let getUserCount = await admin_services.staff_directory(payload);
        return universal_functions.sendSuccess(payload, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_staff_directory = async (userData, payload) => {
    try {
        let getUserCount = await admin_services.get_staff_directory_count(payload);
        let getUser = await admin_services.get_staff_directory(payload);
        return universal_functions.sendSuccess(payload, { users: getUser, count: getUserCount });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const delete_case = async (payloadData, userData) => {
    try {
        await admin_services.delete_case(payloadData);
        return universal_functions.sendSuccess(payloadData, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const delete_staff_directory = async (payloadData, userData) => {
    try {

        await admin_services.delete_staff_directory(payloadData);
        return universal_functions.sendSuccess(payloadData, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const delete_comment = async (payloadData, userData) => {
    try {

        await admin_services.delete_comment(payloadData);
        await admin_services.delete_comment_status(payloadData);
        return universal_functions.sendSuccess(payloadData, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_case = async (userData, query) => {
    try {

        if (query.user_id) {
            query.other_user_id = query.user_id
            let getUser = await customer_services.get_case(query.user_id, query)
            return universal_functions.sendSuccess({}, getUser);
        } else {
            let getUser = await admin_services.get_case(query)
            return universal_functions.sendSuccess({}, getUser);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_case_by_id = async (query) => {
    try {
        let getCase = await admin_services.get_case_by_id(query)
        return universal_functions.sendSuccess({}, getCase);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const validate_notification_request = async (request) => {
    return new Promise((resolve, reject) => {
        const xFF = request.headers['x-forwarded-for']
        const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
        let blockIp = "block:" + ip;
        let max_attempt = 2;
        // validate request before send notifications
        redisClient.get(blockIp, function (err, exists) {
            if (exists) {
                return reject({ message: "Your request has been temporarily disabled for security reason", status: 429 });
            }
            redisClient.get(ip, function (err1, value) {
                if (!value) {
                    // this key will expire after 10 minutes
                    redisClient.set(ip, 1, "EX", 600, () => {
                        return resolve();
                    });
                } else if (parseInt(value) < max_attempt) {
                    redisClient.set(ip, parseInt(value) + 1, "EX", 600, () => {
                        return resolve();
                    }); // update val of key
                } else {
                    redisClient.set(blockIp, 1, "EX", 3600, () => {
                        return reject({ message: "Your request has been temporarily disabled for security reason", status: 429 });
                    }); // block ip for 1 hours(3600 sec)
                }
            });
        });
    })
}

const notification = async (payloadData, request) => {
    try {

        await validate_notification_request(request);

        if (payloadData.type == "event") {
            payloadData.queryData = " where event_noti = 1"
            payloadData.title = "Exactech uploaded a new event"
            payloadData.type = 6
        } else {
            payloadData.queryData = " where news_noti = 1"
            payloadData.title = "Exactech uploaded a news article"
            payloadData.type = 7
        }
        let notificationData = { sender_id: null, reciver_id: null, text: payloadData.other || constant.push_msg.event, is_me: 0, type: payloadData.type, case_id: null }
        await case_services.create_notification({}, notificationData);
        let data = await admin_services.get_user_for_not(payloadData.queryData);
        data = underscore.pluck(data, 'device_token');
        data = underscore.uniq(data);
        universal_functions.send_push_dynamic([payloadData], data, payloadData.title,{})
        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        return universal_functions.sendError(error);
    }
}


const get_all_feedback = async (userData, payload) => {
    try {
        let getUser = await admin_services.get_all_feedback(payload);
        return universal_functions.sendSuccess(payload, { users: getUser });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const reply_feedback = async (query) => {
    try {
        let getFeedback = await admin_services.get_all_feedback(query)
        let getUser = await customer_services.get_user(getFeedback[0].user_id)
        customer_services.email_send(
            {
                username: getUser[0].name, email: getUser[0].email,
                msg: query.msg,
                subject: query.subject,
                email_template: query.msg,
                body: query.msg
            }, { username: getUser[0].username })
        return universal_functions.sendSuccess({}, getUser);

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const smsSend = (phone, otp) => {
    client.messages.create({
        body: 'Welcome to Chime app! Learning from other clinicians is about to get a whole lot easier. To complete your registration, Please enter the four digit ' + otp + ' in the app',
        to: phone,  // Text this number
        from: config.twilio.from // From a valid Twilio number
    })
        .then((message) => console.log(message.sid));
}

module.exports = {
    admin_login: admin_login,
    get_surgen: get_surgen,
    approve_reject: approve_reject,
    page_content: page_content,
    add_page_content: add_page_content,
    verify_unverify: verify_unverify,
    get_all_report_post: get_all_report_post,
    block_user: block_user,
    all_surgeon_for_verify: all_surgeon_for_verify,
    send_push_admin: send_push_admin,
    get_surgeon_for_specialization: get_surgeon_for_specialization,
    assign_title_to_user: assign_title_to_user,
    staff_directory: staff_directory,
    get_staff_directory: get_staff_directory,
    delete_case: delete_case,
    delete_comment: delete_comment,
    get_case: get_case,
    get_case_by_id,
    notification: notification,
    get_all_block_surgeon: get_all_block_surgeon,
    delete_staff_directory: delete_staff_directory,
    get_all_feedback: get_all_feedback,
    reply_feedback: reply_feedback,
    create_event,
    edit_event,
    get_event,
    delete_event,
    approve_reject_case
}