const universal_functions = require('../utils/universal_functions');
const customer_services = require('../services/customer_services')
const constant = require('../lib/constant')
const config = require('config');
const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const client = require('twilio')(accountSid, authToken);
const handlebars = require('handlebars');
const _ = require('lodash');
const rn = require('random-number');
const options = {
    min: 1000
    , max: 9999
    , integer: true
}



const sign_up = async (payload) => {
    try {
        let getUser = null, user_id = null
        let check_user = await customer_services.check_email(payload.email);
        if (check_user && check_user.length > 0) {
            throw constant.msg.emailExist
        } else {
            let create_data = await customer_services.create_user(payload);
            await case_services.save_case_name({ user_id: create_data.insertId }, { name: "Case Discussion" })
            await case_services.save_case_name({ user_id: create_data.insertId }, { name: "News" })
            customer_services.email_send(
                {
                    username: payload.username, email: payload.email,
                    msg: constant.email_msg.register,
                    subject: constant.email_msg.register_subject,
                    email_template: constant.email_template.register,
                    body: constant.email_template.register
                }, { username: payload.name })
            user_id = create_data.insertId
        }

        if (user_id) {
            getUser = await customer_services.get_user(user_id);
        }
        return universal_functions.sendSuccess(payload, getUser[0]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const register_other = async (payload) => {
    try {
        let getUser = null, user_id = null
        // let check_user = await customer_services.login_type_check(payload);
        let check_user = await customer_services.check_email(payload.email);
        if (check_user && check_user.length > 0) {
            getUser = check_user[0]
            if (getUser.is_block == 1) {
                throw constant.msg.accountBlock
            } else {
                getUser.type = "customer"
                let token = await customer_services.create_token_customer(getUser);
                getUser.access_token = token
                getUser.device_type = payload.device_type
                getUser.device_token = payload.device_token
                if (payload.login_type == constant.login_type.okta) {
                    await customer_services.update_type(getUser, constant.login_type.okta);
                }
                payload.login_type = constant.login_type.okta
                await customer_services.update_token(getUser, payload);

                return universal_functions.sendSuccess(payload, getUser);
            }
        } else {
            //let check_user = await customer_services.check_email(payload.email);
            // if (check_user && check_user.length > 0) {
            //     throw constant.msg.emailExist
            // } else {
            payload.is_approve = 1
            let create_data = await customer_services.create_user(payload);
            await case_services.save_case_name({ user_id: create_data.insertId }, { name: "Case Discussion" })
            await case_services.save_case_name({ user_id: create_data.insertId }, { name: "News" })
            getUser = await customer_services.get_user(create_data.insertId)
            getUser = getUser[0]
            getUser.type = "customer"
            let token = await customer_services.create_token_customer(getUser);
            getUser.access_token = token
            getUser.device_type = payload.device_type
            getUser.device_token = payload.device_token
            await customer_services.update_token(getUser, payload);

            return universal_functions.sendSuccess(payload, getUser);
            // }
        }
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const login = async (payload) => {
    try {

        let getUser = await customer_services.check_user(payload);
        if (getUser.is_block == 1) {
            throw constant.msg.accountBlock
        } else {
            if (getUser.is_approve == 0) {
                throw constant.msg.accountNotApprove
            } else if (getUser.is_approve == 2) {
                throw constant.msg.accountReject
            } else {
                getUser.type = "customer"
                let token = await customer_services.create_token_customer(getUser);
                getUser.access_token = token
                getUser.device_type = payload.device_type
                getUser.device_token = payload.device_token
                await customer_services.update_token(getUser, payload);

                return universal_functions.sendSuccess(payload, getUser);
            }
        }


    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const check_email = async (payload) => {
    try {
        let getUser = null, user_id = null
        let check_user = await customer_services.check_email(payload.email);
        if (check_user && check_user.length > 0) {
            throw constant.msg.emailExist
        } else {
            return universal_functions.sendSuccess(payload, []);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const check_username = async (payload) => {
    try {
        let getUser = null, user_id = null
        let check_user = await customer_services.check_username(payload.username);
        if (check_user && check_user.length > 0) {
            throw constant.msg.usernameExist
        } else {
            return universal_functions.sendSuccess(payload, []);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const check_other_login = async (payload) => {
    try {
        let getUser = null, user_id = null
        let check_user = await customer_services.login_type_check(payload);
        if (check_user && check_user.length > 0) {
            return universal_functions.sendSuccess(payload, [{ register: true }]);
        } else {
            return universal_functions.sendSuccess(payload, [{ register: false }]);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const otp_verify = async (payload, userData) => {
    try {
        await customer_services.otp_verify(payload, userData);
        return universal_functions.sendSuccess(payload, userData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_details = async (userData) => {
    try {

        let getUser = await customer_services.get_user(userData.user_id)
        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const upload_image = async (payload) => {
    try {
        const image = await customer_services.upload_image(payload.image);
        image.thumbnail_url = "";
        if (payload.thumbnail) {
            const thumbnail = await customer_services.upload_image(payload.thumbnail);
            image.thumbnail_url = thumbnail.image_url;
        }
        return universal_functions.sendSuccess(payload, image);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const update_profile = async (payload, userData) => {
    try {

        await customer_services.update_profile(payload, userData);

        let getUser = await customer_services.get_user(userData.user_id);

        return universal_functions.sendSuccess(payload, getUser[0]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const contact_sync = async (payload, userData) => {
    try {

        let contact_list = await customer_services.contact_sync(payload, userData);
        let get_friend_list = await customer_services.check_friend_list(userData);
        if (contact_list && contact_list.length > 0) {
            let getUser = await customer_services.insert_contact_sync(get_friend_list, contact_list, userData, payload);
        }
        let send_result = await customer_services.check_friend_list(userData);
        return universal_functions.sendSuccess(payload, send_result);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_contact_sync = async (userData) => {
    try {
        let get_friend_list = await customer_services.check_friend_list(userData);
        return universal_functions.sendSuccess({}, get_friend_list);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const doc_upload = async (payload, userData) => {
    try {
        if(payload.old_case_id){
            await customer_services.delete_case(payload,userData);
        }
        let upload_record = await customer_services.doc_upload(payload, userData);
        await customer_services.case_url(payload, upload_record.insertId);
        // let notificationData = { sender_id:null,reciver_id: userData.user_id, text:constant.push_msg.case_add,is_me:1,type:1,case_id:upload_record.insertId }
        // await case_services.create_notification(userData,notificationData);
        let url = "http://13.232.170.228/pages/post/all-post";
        let email = "thien.doan@exac.com,gerald.campbell@exac.com";
        if(process.env.NODE_ENV == 'dev'){
            url = "http://13.232.170.228:3000/pages/post/all-post";
            email = "marlana@modernizedmobile.com,iosdev.cool@gmail.com"
        }
        
        customer_services.email_send(
            {
                email: email,
                username: "Admin",
                subject: constant.email_msg.admin_email,
                email_template: constant.email_template.admin_approve_case,
                body: constant.email_template.admin_approve_case
            }, { username: "Admin",url:url})
        return universal_functions.sendSuccess({}, upload_record);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}  

const get_case = async (userData, query) => {
    try {
        // get all blocked users
        let blocked_users = await customer_services.get_blocked_users({ blocked_by: userData.user_id });        
        blocked_users = blocked_users.map(user => user.user_id);
        query.blocked_users = blocked_users;
        let getCases = await customer_services.get_case(userData.user_id, query);
        let user_data = {};
        if (query.other_user_id) {
            let getUser = await customer_services.get_user(query.other_user_id);
            if (getUser.length > 0) {
                _.set(user_data, 'name', _.get(getUser, [0, 'name'], ""));
                _.set(user_data, 'location', _.get(getUser, [0, 'location'], ""));
                _.set(user_data, 'latitude', _.get(getUser, [0, 'latitude'], ""));
                _.set(user_data, 'longitude', _.get(getUser, [0, 'longitude'], ""));
                _.set(user_data, 'status_msg', _.get(getUser, [0, 'status_msg'], ""));
                _.set(user_data, 'is_verify', _.get(getUser, [0, 'is_verify'], ""));
                _.set(user_data, 'profile_pic', _.get(getUser, [0, 'profile_pic'], ""));
                if (blocked_users.indexOf(_.get(getUser, [0, 'user_id'], "")) != -1 || _.get(getUser, [0, 'is_block'], 0) === 1) {
                    _.set(user_data, 'is_block', 1);
                } else {
                    _.set(user_data, 'is_block', 0);
                }
            }
        }
        return { statusCode: 200, message: "success", userData: user_data, data: getCases };
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_case_caption_search = async (userData, query) => {
    try {
        let getCases = await customer_services.get_case_caption_search(userData.user_id, query)
        return universal_functions.sendSuccess({}, getCases);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_like_case = async (userData, query) => {
    try {

        let getUser = await customer_services.get_like_case(userData.user_id, query)
        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const like_unlike_case = async (payloadData, userData) => {
    try {
        const result = await customer_services.check_like(payloadData, userData)
        if (payloadData.is_like) {
            if (result && result.length > 0) {
                throw constant.msg.likeAlready
            } else {
                await customer_services.like_unlike_case(payloadData, userData)
                await customer_services.like_unlike_case_count(payloadData, userData)
                let caseDetails = await case_services.case_details(payloadData.case_id)
                let replacements = {
                    name: userData.name
                }
                if (caseDetails[0].notification_like == 1) {
                    if (caseDetails[0].user_id != userData.user_id) {
                        let notificationData2 = { case_id: caseDetails[0].case_id, sender_id: userData.user_id, reciver_id: caseDetails[0].user_id, text: handlebars.compile(constant.push_msg.case_like)(replacements), is_me: 1, type: 2 }
                        caseDetails = caseDetails.map(function (el) {
                            var o = Object.assign({}, el);
                            o.type = 2;
                            return o;
                        });
                        case_services.create_notification(userData, notificationData2);
                        case_services.send_single_push(caseDetails, userData)
                    }
                }
            }
        } else {
            if (result && result.length > 0) {
                // let notificationData = {case_id:payloadData.case_id, sender_id:userData.user_id,reciver_id: userData.user_id, text:constant.push_msg.case_unlike_me,is_me:1,type:2 }
                // await case_services.create_notification(userData,notificationData);

                await customer_services.delete_like(payloadData, userData)
                await customer_services.like_unlike_case_count(payloadData, userData)
            } else {
                throw constant.msg.dislikeAlready
            }
        }

        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const report_user = async (query, userData) => {
    try {
        let getUser = await customer_services.check_report_user(userData, query)
        if (getUser && getUser.length > 0) {
            throw constant.msg.userAlreadyReported
        } else {
            let getUser = await customer_services.report_user(userData, query)
            // let notificationData = {case_id:null, sender_id:userData.user_id,reciver_id: userData.user_id, text:constant.push_msg.report,is_me:1,type:3 }
            // await case_services.create_notification(userData,notificationData);
            return universal_functions.sendSuccess({}, getUser);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const mute_user = async (payloadData, userData) => {
    try {
        const result = await customer_services.check_mute(payloadData, userData)
        if (payloadData.is_mute) {
            if (result && result.length > 0) {
                throw constant.msg.muteAlready
            } else {
                await customer_services.mute_user(payloadData, userData)
            }

        } else {
            if (result && result.length > 0) {
                await customer_services.delete_mute(payloadData, userData)
            } else {
                throw constant.msg.unMuteAlready
            }
        }

        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const follow_user = async (payloadData, userData) => {
    try {
        const result = await customer_services.check_follow(payloadData, userData)
        if (payloadData.is_follow) {
            if (result && result.length > 0) {
                throw constant.msg.followAlready
            } else {
                await customer_services.follow_user(payloadData, userData)
                // let notificationData = {case_id:null, sender_id:payloadData.user_id,reciver_id: userData.user_id, text:constant.push_msg.follow,is_me:1,type:4 }
                // await case_services.create_notification(userData,notificationData);



                // let notificationData2 = {case_id:null, sender_id:userData.user_id,reciver_id: payloadData.user_id, text:constant.push_msg.follow_you,is_me:0,type:4 }
                // await case_services.create_notification(userData,notificationData2);
            }

        } else {
            if (result && result.length > 0) {
                await customer_services.delete_follow(payloadData, userData)
            } else {
                throw constant.msg.unfollowAlready
            }
        }

        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const update_username = async (payload, userData) => {
    try {

        let check_user = await customer_services.check_username(payload.username);
        if (check_user && check_user.length > 0) {
            throw constant.msg.usernameExist
        } else {
            await customer_services.update_username(payload, userData)
            let getUser = await customer_services.get_user(userData.user_id);
            return universal_functions.sendSuccess(payload, getUser[0]);
        }
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const resent_otp = async (payload, userData) => {
    try {
        let getUser = []
        getUser.push(userData)
        payload.otp = rn(options)
        await customer_services.update_otp(payload, userData)
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
                }, { username: getUser[0].username, otp: payload.otp })
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
        return universal_functions.sendSuccess(payload, getUser[0]);

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const smsSend = (phone, otp) => {
    client.messages.create({
        body: 'Your login otp for Chime Account ' + otp,
        to: phone,  // Text this number
        from: config.twilio.from // From a valid Twilio number
    })
        .then((message) => console.log(message.sid));
}


const follow_user_list = async (userData, query) => {
    try {

        let getUser = await customer_services.follow_user_list(userData.user_id, query)
        return universal_functions.sendSuccess({}, getUser[0]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const user_list_search = async (userData, query) => {
    try {
        // get all blocked users
        let blocked_users = await customer_services.get_blocked_users({ blocked_by: userData.user_id });
        blocked_users = blocked_users.map(user => user.user_id);
        query.blocked_users = blocked_users;
        let getUser = await customer_services.user_list_search(userData.user_id, query)
        return universal_functions.sendSuccess({}, getUser[0]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const update_notification = async (payload, userData) => {
    try {

        await customer_services.update_notification(payload, userData);

        let getUser = await customer_services.get_user(userData.user_id);

        return universal_functions.sendSuccess(payload, getUser[0]);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const notification_user_list = async (userData, query) => {
    try {

        let getUser = await customer_services.notification_user_list(userData, query)
        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const forgot_password = async (payload, userData) => {
    try {
        payload.forgot_otp = rn(options)
        let check_user = await customer_services.check_email(payload.email);
        if (check_user && check_user.length > 0) {
            userData = check_user[0]
            await customer_services.forgot_password_otp(payload, userData);

            customer_services.email_send(
                {
                    username: userData.username, email: payload.email,
                    msg: constant.email_msg.forgot_otp,
                    subject: constant.email_msg.forgot_otp,
                    email_template: constant.email_template.forgot_otp,
                    body: constant.email_template.forgot_otp
                }, { username: userData.username, otp: payload.forgot_otp })

            return universal_functions.sendSuccess(payload, {});
        } else {
            throw constant.msg.userNotFind
        }
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const reset_password = async (payload, userData) => {
    try {
        let check_user = await customer_services.reset_password(payload);
        if (check_user && check_user.length > 0) {
            await customer_services.forgot_password_otp(payload, check_user[0])
            return universal_functions.sendSuccess(payload, {});
        } else {
            throw constant.msg.userNotFind
        }
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const notification_delete = async (payload, userData) => {
    try {
        await customer_services.notification_delete(payload)
        return universal_functions.sendSuccess(payload, {});

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const delete_case = async (query, userData) => {
    try {

        let getUser = await customer_services.delete_case(query, userData)
        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const change_event_news = async (payloadData, userData) => {
    try {
        let getUser = await customer_services.change_event_news(payloadData, userData)
        getUser = await customer_services.get_user(userData.user_id)
        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const logout = async (payload, userData) => {
    try {
        await customer_services.logout(userData)
        return universal_functions.sendSuccess(payload, {});
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const get_event = async (userData, payload) => {
    try {
        let data = await customer_services.get_event(userData, payload);
        data = data.map(o => {
            if (o.location && o.location !== "") {
                let location = JSON.parse(o.location);
                o.location = `${_.get(location, ['street_address'], '')} ${_.get(location, ['city'], '')} ${_.get(location, ['state'], '')} ${_.get(location, ['country'], '')} `;
                if (location.pincode) {
                    o.location += _.get(location, ['pincode'], '')
                }
            }
            return o;
        })
        return universal_functions.sendSuccess(payload, data);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const get_event_details = async (userData, payload) => {
    try {
        let data = await customer_services.get_event_details(userData, payload);
        if (data.location && data.location !== "") {
            let location = JSON.parse(data.location);
            data.location = `${_.get(location, ['street_address'], '')} ${_.get(location, ['city'], '')} ${_.get(location, ['state'], '')} ${_.get(location, ['country'], '')} `;
            if (location.pincode) {
                data.location += _.get(location, ['pincode'], '')
            }
        }
        return universal_functions.sendSuccess(payload, data);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const block_user = async (payloadData, userData) => {
    try {
        let payload = {
            blocked_by: userData.user_id,
            user_id: payloadData.user_id
        };
        if (payloadData.user_id === userData.user_id) {
            throw constant.msg.selfBlockUnblock;
        }
        const result = await customer_services.get_blocked_user(payload)
        if (payloadData.is_block) {
            if (result && result.length > 0) {
                throw constant.msg.block
            } else {
                await customer_services.block_by_user(payload);
            }
        } else {
            if (result && result.length === 0) {
                throw constant.msg.unblock
            } else {
                await customer_services.unblock_by_user(payload);
            }
        }
        return universal_functions.sendSuccess({}, {});
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const blocked_users = async (userData) => {
    try {
        let data = await customer_services.get_blocked_users({ blocked_by: userData.user_id })
        return universal_functions.sendSuccess({}, data);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

module.exports = {
    sign_up: sign_up,
    login: login,
    check_email: check_email,
    check_username: check_username,
    get_details: get_details,
    otp_verify: otp_verify,
    upload_image: upload_image,
    update_profile: update_profile,
    contact_sync: contact_sync,
    get_contact_sync: get_contact_sync,
    doc_upload: doc_upload,
    get_case: get_case,
    like_unlike_case: like_unlike_case,
    get_like_case: get_like_case,
    report_user: report_user,
    mute_user: mute_user,
    follow_user: follow_user,
    update_username: update_username,
    resent_otp: resent_otp,
    follow_user_list: follow_user_list,
    update_notification: update_notification,
    user_list_search: user_list_search,
    register_other: register_other,
    check_other_login: check_other_login,
    notification_user_list: notification_user_list,
    forgot_password: forgot_password,
    reset_password: reset_password,
    notification_delete: notification_delete,
    delete_case: delete_case,
    change_event_news: change_event_news,
    logout: logout,
    get_case_caption_search,
    get_event,
    block_user,
    get_event_details,
    blocked_users
}

