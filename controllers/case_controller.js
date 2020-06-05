const universal_functions = require('../utils/universal_functions');
const admin_services = require('../services/admin_services')
const constant = require('../lib/constant')
const case_services = require('../services/case_services')
const customer_services = require('../services/customer_services')
const underscore = require('underscore')
const handlebars = require('handlebars');



const save_case = async (userData, payload) => {
    try {
        if (payload.is_save) {
            let resultCheck = await case_services.check_save_case(userData, payload);
            if (resultCheck && resultCheck.length > 0) {
                throw constant.msg.caseAlreadyAdded
            }
            if (payload.name) {
                let resultCheckName = await case_services.check_save_case_name(userData, payload);
                if (resultCheckName && resultCheckName.length > 0) {
                    throw constant.msg.caseAlreadyAddedName
                }
            }
            if (!payload.case_save_name_id) {
                let resultData = await case_services.save_case_name(userData, payload);
                payload.case_save_name_id = resultData.insertId
            } else {
                payload.case_save_name_id = payload.case_save_name_id
            }
            if (payload.case_id) {
                await case_services.save_case(userData, payload);
                // let notificationData = { sender_id:null,reciver_id: userData.user_id, text:constant.push_msg.save_case,is_me:1,type:6,case_id:payload.case_id }
                // await case_services.create_notification(userData,notificationData);
                // let caseDataGet = await case_services.case_details(payload.case_id);
                // let notificationData1 = { sender_id:userData.user_id,reciver_id: caseDataGet[0].user_id, text:constant.push_msg.save_case,is_me:0,type:6,case_id:payload.case_id }
                // await case_services.create_notification(userData,notificationData1);
            }
        } else {
            let resultCheck = await case_services.check_save_case(userData, payload);
            if (resultCheck && resultCheck.length > 0) {
                await case_services.delete_save_case(userData, payload);
                //if(payload.case_save_name_id)
                //  await case_services.delete_save_case_name(userData, payload);
            } else {
                throw constant.msg.caseAlreadyUnSave
            }

        }
        return universal_functions.sendSuccess(payload, payload);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const page_content = async (userData, payload) => {
    try {
        let hippaData = await case_services.page_content(0);
        let faqData = await case_services.page_content(1);

        return universal_functions.sendSuccess(payload, { hippaData, faqData });
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_save_case = async (userData) => {
    try {

        let caseData = await case_services.get_save_case(userData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_save_case_details = async (userData, payload) => {
    try {
        let caseDetails = await case_services.get_save_case_details(userData, payload);
        return universal_functions.sendSuccess(userData, caseDetails);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const add_comment = async (userData, payloadData) => {
    try {
        // get all blocked users
        let blocked_users = await customer_services.get_blocked_users({ blocked_by: userData.user_id });
        blocked_users = blocked_users.map(user => user.user_id);
        let caseData = await case_services.add_comment(userData, payloadData);
        let caseDataGet = await case_services.case_details(payloadData.case_id);
        payloadData.comment_id = caseData.insertId
        await case_services.add_comment_count(payloadData);
        let caseDataSend = await case_services.add_comment_single(payloadData);
        caseDataGet.user_comment_id = userData.user_id
        caseDataGet.user_comment_name = userData.name
        caseDataGet = caseDataGet.map(function (el) {
            var o = Object.assign({}, el);
            o.type = 5;
            return o;
        });
        let replacements = {
            name: userData.name
        }
        if (caseDataGet[0].notification_comment == 1) {
            if (caseDataGet[0].user_id != userData.user_id) {

                let msg = handlebars.compile(constant.push_msg.comment)(replacements)
                universal_functions.send_push_dynamic(caseDataGet, caseDataGet[0].device_token, msg,{})
                let notificationData = { sender_id: userData.user_id, reciver_id: caseDataGet[0].user_id, text: msg, is_me: 1, type: 5, case_id: payloadData.case_id }
                await case_services.create_notification(userData, notificationData);

                // send notification to other commented users
                let otherCommentedUsers = await case_services.case_commented_users({ case_id: payloadData.case_id, user_ids: [caseDataGet[0].user_id, userData.user_id].concat(blocked_users) });
                if (otherCommentedUsers.length) {
                    let msg = handlebars.compile(constant.push_msg.comment_other)({ name: userData.name, caseUser: caseDataGet[0].name });
                    let device_tokens = underscore.pluck(otherCommentedUsers, 'device_token');
                    caseDataGet = caseDataGet.map(function (el) {
                        var o = Object.assign({}, el);
                        o.type = 10;
                        o.case_user_id = o.user_id;
                        o.case_user_name = o.name;
                        return o;
                    });

                    universal_functions.send_push_dynamic(caseDataGet, device_tokens, msg,{});
                    for (let i = 0; i < otherCommentedUsers.length; i++) {
                        let notificationData = { sender_id: userData.user_id, reciver_id: otherCommentedUsers[i].user_id, text: msg, is_me: 0, type: 10, case_id: payloadData.case_id, case_user_name: caseDataGet[0].name, case_user_id: caseDataGet[0].user_id }
                        case_services.create_notification(userData, notificationData);
                    }
                }
            }
            // send tag notification to tagged user
            if (payloadData.user_tag_json.length) {
                let msg = handlebars.compile(constant.push_msg.tag)(replacements)
                let userIds = underscore.pluck(payloadData.user_tag_json, 'id');

                // get user device_tokens
                let usersData = await customer_services.get_users(userIds);
                let device_tokens = underscore.pluck(usersData, 'device_token');
                caseDataGet[0].type = 9;
                universal_functions.send_push_dynamic(caseDataGet, device_tokens, msg,{});
                for (let i = 0; i < usersData.length; i++) {
                    let notificationData = { sender_id: userData.user_id, reciver_id: usersData[i].user_id, text: msg, is_me: 1, type: 9, case_id: payloadData.case_id }
                    case_services.create_notification(userData, notificationData);
                }
            }
        }


        // case_services.send_multi_push(userData,payloadData,caseDataGet);
        // let notificationData1 = { sender_id:null,reciver_id: userData.user_id, text:constant.push_msg.comment_me,is_me:1,type:5,case_id:payloadData.case_id }
        // await case_services.create_notification(userData,notificationData1);
        return universal_functions.sendSuccess(userData, caseDataSend);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

const edit_comment = async (userData, payloadData) => {
    try {
        let caseData = await case_services.edit_comment(userData, payloadData);
        let caseDataSend = await case_services.add_comment_single(payloadData);

        return universal_functions.sendSuccess(userData, caseDataSend);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const delete_comment = async (userData, payloadData) => {
    try {
        let caseDataGet = await case_services.get_one_comment(userData, payloadData);

        if (caseDataGet[0].parent_comment_id != null) {
            await case_services.edit_comment_count(payloadData, 1);
        } else {
            let countInc = await case_services.get_count_comment(userData, payloadData);
            await case_services.edit_comment_count(payloadData, countInc[0].count + 1);
        }
        let caseData = await case_services.delete_comment(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const get_comment = async (userData, payloadData) => {
    try {

        let commentData = await case_services.get_comment(payloadData);
        payloadData.caseIds = underscore.pluck(commentData, 'comment_id')
        let caseDataSub = await case_services.get_sub_comment(payloadData);
        for (let i = 0; i < commentData.length; i++) {
            for (let j = 0; j < caseDataSub.length; j++) {
                if (commentData[i].comment_id === caseDataSub[j].parent_comment_id) {
                    if (commentData[i].child) {
                        commentData[i].child.push(caseDataSub[j])
                    } else {
                        commentData[i].child = []
                        commentData[i].child.push(caseDataSub[j])
                    }
                }
            }
        }
        return universal_functions.sendSuccess(userData, commentData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}



const feedback = async (userData, payloadData) => {
    try {

        let caseData = await case_services.feedback(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const report_case = async (userData, query) => {
    try {
        let getUser = await case_services.check_report_case(userData, query)
        if (getUser && getUser.length > 0) {
            throw constant.msg.caseAlreadyReported
        } else {
            let getUser = await case_services.report_case(userData, query)
            return universal_functions.sendSuccess({}, getUser);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const report_comment = async (userData, query) => {
    try {
        let getUser = await case_services.check_report_comment(userData, query)
        if (getUser && getUser.length > 0) {
            throw constant.msg.commentAlreadyReported
        } else {
            let getUser = await case_services.report_case(userData, query)
            return universal_functions.sendSuccess({}, getUser);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const hide_case = async (query, userData) => {
    try {
        let getUser = await case_services.check_hide_case(userData, query)
        if (getUser && getUser.length > 0) {
            throw constant.msg.caseAlreadyHide
        } else {
            let getUser = await case_services.hide_case(userData, query)
            return universal_functions.sendSuccess({}, getUser);
        }

    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}




const delete_collection = async (userData, payloadData) => {
    try {

        await case_services.delete_save_case_v2(userData, payloadData);
        let caseData = await case_services.delete_save_case_name(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const delete_save_case = async (userData, payloadData) => {
    try {

        let caseData = await case_services.delete_save_case_v3(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}




const edit_save_case = async (userData, payload) => {
    try {
        if (payload.name) {
            let resultCheckName = await case_services.check_save_case_name(userData, payload);
            if (resultCheckName && resultCheckName.length > 0) {
                throw constant.msg.caseAlreadyAddedName
            }
        }
        let result = await case_services.edit_save_case(userData, payload);
        return universal_functions.sendSuccess(payload, {});
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}

const answer_poll = async (userData, payloadData) => {
    try {
        let getUser = await case_services.check_poll_answer(userData, payloadData)
        if (getUser && getUser.length > 0) {
            payloadData.last_answer = getUser[0].answer
            await case_services.dec_poll_answer_case(userData, payloadData)
            await case_services.update_poll_answer_case(userData, payloadData)
            await case_services.update_poll_answer(userData, payloadData)
        } else {
            let caseDataGet = await case_services.case_details(payloadData.case_id);
            console.log("caseDataGet[0].user_id != userData.user_id", caseDataGet[0].user_id != userData.user_id)
            if (caseDataGet[0].user_id != userData.user_id) {
                caseDataGet = caseDataGet.map(function (el) {
                    var o = Object.assign({}, el);
                    o.type = 8;
                    return o;
                });
                let replacements = {
                    name: userData.name
                }
                let pushMsg = handlebars.compile(constant.push_msg.answer_poll)(replacements);
                universal_functions.send_push_dynamic(caseDataGet, caseDataGet[0].device_token, pushMsg,{})
                let notificationData = { case_id: payloadData.case_id, sender_id: userData.user_id, reciver_id: caseDataGet[0].user_id, text: pushMsg, is_me: 1, type: 8 }
                await case_services.create_notification(userData, notificationData);
            }
            await case_services.create_poll_answer(userData, payloadData)
            await case_services.update_poll_answer_case(userData, payloadData)
        }

        return universal_functions.sendSuccess({}, getUser);
    } catch (error) {
        console.log(error);
        return universal_functions.sendError(error);
    }
}


const create_event = async (userData, payloadData) => {
    try {

        let caseData = await case_services.create_event(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}


const get_event = async (userData) => {
    try {

        let caseData = await case_services.get_event(userData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}



const delete_event = async (userData, payloadData) => {
    try {

        let caseData = await case_services.delete_event(userData, payloadData);
        return universal_functions.sendSuccess(userData, caseData);
    } catch (error) {
        return universal_functions.sendError(error);
    }
}

module.exports = {
    save_case: save_case,
    page_content: page_content,
    get_save_case: get_save_case,
    get_save_case_details: get_save_case_details,
    add_comment: add_comment,
    get_comment: get_comment,
    feedback: feedback,
    report_case: report_case,
    hide_case: hide_case,
    delete_collection: delete_collection,
    delete_save_case: delete_save_case,
    edit_save_case: edit_save_case,
    edit_comment: edit_comment,
    delete_comment: delete_comment,
    answer_poll: answer_poll,
    create_event: create_event,
    get_event: get_event,
    delete_event: delete_event,
    report_comment: report_comment
}