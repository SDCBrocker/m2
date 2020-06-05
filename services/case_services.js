const DAO = require('../DAO/mysql');
const constant = require('../lib/constant')

const underscore = require('underscore')
const universal_functions = require('../utils/universal_functions');
const handlebars = require('handlebars');

async function page_content(type) {
    try {
        let sql = 'select * from tb_static_content where type = ?'
        return await DAO.mysql_query("get_admin", sql, [type]);
    } catch (error) {
        throw error;
    }
}


async function check_user(payload) {
    try {
        let sql = 'select * from tb_admin where email = ? '
        let data = await DAO.mysql_query("get_admin", sql, [payload.email]);
        if (data && data.length > 0) {
            if (data[0].password == md5(payload.password)) {
                return data[0]
            } else {
                throw constant.msg.passwordNotFind
            }
        } else {
            throw constant.msg.emailNotFind
        }
    } catch (error) {
        throw error;
    }
}


async function save_case(userData, payload) {
    try {
        let sql = 'INSERT INTO `tb_case_save`(`user_id`, `case_id`,`case_save_name_id`) VALUES (?,?,?)'
        return await DAO.mysql_query("save_case", sql, [userData.user_id, payload.case_id, payload.case_save_name_id]);
    } catch (error) {
        throw error;
    }
}



async function save_case_name(userData, payload) {
    try {
        let sql = 'INSERT INTO `tb_case_save_name`(`user_id`, `name`) VALUES (?,?)'
        return await DAO.mysql_query("save_case_name", sql, [userData.user_id, payload.name]);
    } catch (error) {
        throw error;
    }
}



async function check_save_case(userData, payload) {
    try {
        let sql = 'select * from tb_case_save where  user_id = ? and case_id = ? '
        return await DAO.mysql_query("check_save_case", sql, [userData.user_id, payload.case_id]);
    } catch (error) {
        throw error;
    }
}
async function check_save_case_name(userData, payload) {
    try {
        let sql = 'select * from tb_case_save_name where  user_id = ? and name = ? '
        return await DAO.mysql_query("check_save_case_name", sql, [userData.user_id, payload.name]);
    } catch (error) {
        throw error;
    }
}


async function get_save_case(userData) {
    try {
        let sql = 'select n.*,GROUP_CONCAT(DISTINCT(c.url)) as url ,GROUP_CONCAT(DISTINCT(s.case_id)) as case_ids ,' +
            ' s.case_save_id from tb_case_save_name as n ' +
            ' LEFT JOIN tb_case_save as s ON s.case_save_name_id = n.case_save_name_id  ' +
            ' LEFT JOIN tb_case_url as c ON c.case_id = s.case_id  where  n.user_id = ? GROUP BY n.case_save_name_id'
        return await DAO.mysql_query("get_admin", sql, [userData.user_id]);
    } catch (error) {
        throw error;
    }
}

async function get_save_case_details(userData, payload) {
    try {
        let pushAr = [userData.user_id, userData.user_id
            , userData.user_id, userData.user_id, userData.user_id, userData.user_id, payload.case_save_name_id]
        let sql = `SELECT  s.* , follow.follow_users_id as follow, mute.mute_users_id as mute ,u.name as commnet_user_profile_pic, 
            u.name as commnet_user_name,c.comment ,save.case_save_id as isSaved,ls.user_id as isliked,user.profile_pic,
            user.is_verify,user.title,user.name,cases.*
        from tb_case_save as s
        LEFT JOIN tb_case as cases  ON s.case_id = cases.case_id
        LEFT JOIN tb_users as user ON cases.user_id = user.user_id
        LEFT JOIN tb_case_like as ls ON cases.case_id =  ls.case_id and ls.user_id = ?
        LEFT JOIN tb_comment as c ON cases.comment_id =  c.comment_id
        LEFT JOIN tb_users as u ON c.user_id =  u.user_id
        LEFT JOIN tb_case_save as save ON cases.case_id =  save.case_id and save.user_id = ?
        LEFT JOIN tb_mute_users as mute ON cases.user_id =  mute.user_id and mute.repoter_id = ?
        LEFT JOIN tb_follow_users as follow ON cases.user_id =  follow.user_id and follow.follower_id = ?
        LEFT JOIN tb_hide_case as hide ON cases.case_id =  hide.case_id and hide.user_id = ?
            where  s.user_id = ? and s.case_save_name_id = ? GROUP BY s.case_save_id `


        if (payload.limit) {
            sql += " limit ? "
            pushAr.push(payload.limit)
        }
        if (payload.skip) {
            sql += "  OFFSET ?"
            pushAr.push(payload.skip)

        }

        let result = await DAO.mysql_query("get_save_case_details", sql, pushAr);

        if (result && result.length > 0) {
            let caseIds = underscore.pluck(result, 'case_id')
            let sqlQuery = "select * from tb_case_url where case_id in (?) "
            let urlArray = await DAO.mysql_query_old("create_user", sqlQuery, [caseIds]);
            if (urlArray && urlArray.length) {
                urlArray = urlArray[0]
                for (let i = 0; i < result.length; i++) {
                    for (let j = 0; j < urlArray.length; j++) {
                        if (result[i].case_id == urlArray[j].case_id) {
                            if (result[i].collection) {
                                result[i].collection.push(urlArray[j])
                            } else {

                                result[i].collection = [urlArray[j]]
                            }
                        }
                    }
                }
            }
        }
        return result
    } catch (error) {
        throw error;
    }
}


async function get_case_details(userData, payload) {
    try {
        let sql = 'SELECT user.name,cases.*,GROUP_CONCAT(url) as urls FROM `tb_case` as cases ' +
            ' LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ' +
            ' LEFT JOIN tb_users as user ON cases.user_id = user.user_id ' +
            ' WHERE cases.case_id IN (?) GROUP BY cases.case_id ';
        return await DAO.mysql_query_old("get_case_details", sql, [payload.caseDataIds, userData.user_id]);
    } catch (error) {
        throw error;
    }
}




async function add_comment(userData, payload) {
    try {
        let sql = 'INSERT INTO `tb_comment`(`case_id`, `user_id`, `parent_comment_id`, `comment`,`user_tag_json`) VALUES (?,?,?,?,?)'
        return await DAO.mysql_query("save_case_name", sql, [payload.case_id, userData.user_id, payload.parent_comment_id || null,
        payload.comment, payload.user_tag_json || []]);

    } catch (error) {
        throw error;
    }
}




async function add_comment_count(payload) {

    try {
        let value = []
        let sql = 'UPDATE `tb_case` SET comment_count = comment_count + 1 , comment_id = ? where case_id = ?';
        value.push(payload.comment_id, payload.case_id)
        return await DAO.mysql_query("add_comment_count", sql, value);

    } catch (error) {
        throw error;
    }
}


async function get_comment(payload) {
    try {
        let sql = 'SELECT c.*,u.username,u.name,u.location,u.latitude,u.longitude,u.title,u.profile_pic,u.is_verify FROM `tb_comment` as c ' +
            ' LEFT JOIN tb_users as u ON u.user_id = c.user_id ' +
            ' WHERE c.case_id = ? and parent_comment_id IS NULL order by comment_id asc '
        return await DAO.mysql_query("get_comment", sql, [payload.case_id]);
    } catch (error) {
        throw error;
    }
}

async function case_commented_users(payload) {
    try {
        let sql = `SELECT DISTINCT c.*,u.device_token FROM tb_comment as c 
            LEFT JOIN tb_users as u ON u.user_id = c.user_id 
            WHERE c.case_id = ? AND c.user_id NOT IN (${Array(payload.user_ids.length).fill("?")}) group by c.user_id `
        return await DAO.mysql_query("case_commented_users", sql, [payload.case_id].concat(payload.user_ids));
    } catch (error) {
        throw error;
    }
}

async function get_sub_comment(payload) {
    try {
        let sql = `SELECT c.*,u.username,u.name,u.location,u.latitude,u.title,u.profile_pic,u.is_verify FROM tb_comment as c 
             LEFT JOIN tb_users as u ON u.user_id = c.user_id
             WHERE c.parent_comment_id IN (${Array(payload.caseIds.length).fill("?")}) order by comment_id asc`
        return await DAO.mysql_query("get_sub_comment", sql, [].concat(payload.caseIds));
    } catch (error) {
        throw error;
    }
}



async function add_comment_single(payload) {
    try {
        let sql = 'SELECT c.*,u.username,u.title,u.profile_pic FROM `tb_comment` as c ' +
            ' LEFT JOIN tb_users as u ON u.user_id = c.user_id ' +
            ' WHERE c.comment_id = ? order by comment_id desc'
        return await DAO.mysql_query("get_comment", sql, [payload.comment_id]);
    } catch (error) {
        throw error;
    }
}


async function feedback(userData, payload) {
    try {
        let sql = 'INSERT INTO `tb_feedback`(`user_id`, `text`) VALUES (?,?)'
        return await DAO.mysql_query("save_case_name", sql, [userData.user_id, payload.text]);
    } catch (error) {
        throw error;
    }
}






async function delete_save_case(userData, payload) {
    try {
        let sql = 'delete from tb_case_save where  user_id = ? and case_id = ? '
        return await DAO.mysql_query("check_save_case", sql, [userData.user_id, payload.case_id]);
    } catch (error) {
        throw error;
    }
}


async function delete_save_case_name(userData, payload) {
    try {
        let sql = 'delete from tb_case_save_name where  case_save_name_id = ?  '
        return await DAO.mysql_query("check_save_case", sql, [payload.case_save_name_id]);
    } catch (error) {
        throw error;
    }
}

async function delete_save_case_v2(userData, payload) {
    try {
        let sql = 'delete from tb_case_save where  case_save_name_id = ?  '
        return await DAO.mysql_query("check_save_case", sql, [payload.case_save_name_id]);
    } catch (error) {
        throw error;
    }
}

async function delete_save_case_v3(userData, payload) {
    try {
        let sql = 'delete from tb_case_save where  case_save_name_id = ? and case_id = ?'
        return await DAO.mysql_query("check_save_case", sql, [payload.case_save_name_id, payload.case_id]);
    } catch (error) {
        throw error;
    }
}





async function check_report_case(userData, payload) {
    try {
        let sql = 'select * from tb_report_case where case_id = ? and reporter_id = ?'
        return await DAO.mysql_query("save_case_name", sql, [payload.case_id, userData.user_id]);
    } catch (error) {
        throw error;
    }
}

async function check_report_comment(userData, payload) {
    try {
        let sql = 'select * from tb_report_case where comment_id = ? and reporter_id = ?'
        return await DAO.mysql_query("check_report_comment", sql, [payload.comment_id, userData.user_id]);
    } catch (error) {
        throw error;
    }
}

async function report_case(userData, payload) {
    try {
        let sql = 'INSERT INTO `tb_report_case` (`user_id`, `case_id`,`comment_id`, `reporter_id`) VALUES (?,?,?,?)'
        return await DAO.mysql_query("save_case_name", sql, [payload.user_id, payload.case_id || null, payload.comment_id || null, userData.user_id]);
    } catch (error) {
        throw error;
    }
}


const hide_case = async (userData, payload) => {
    try {

        let sql = 'INSERT INTO `tb_hide_case`(`user_id`,`case_id`) VALUES (?,?)';
        return await DAO.mysql_query("report_user", sql, [userData.user_id, payload.case_id]);

    } catch (error) {
        throw error;
    }
}

const check_hide_case = async (userData, payload) => {
    let sql = 'select * from tb_hide_case where  user_id = ? and case_id = ?'
    return await DAO.mysql_query("get_user", sql, [userData.user_id, payload.case_id]);
}


async function edit_save_case(user, payload) {

    try {
        let value = []
        let sql = 'UPDATE `tb_case_save_name` SET ';

        if (payload.name && payload.image) {
            sql += "  name = ? , image = ?";
            value.push(payload.name, payload.image)
        } else if (payload.name) {
            sql += "  name = ? ";
            value.push(payload.name)
        } else if (payload.image) {
            sql += "  image = ? ";
            value.push(payload.image)
        }

        sql += " where case_save_name_id = ? ";
        value.push(payload.case_save_name_id)
        return await DAO.mysql_query("add_comment_count", sql, value);

    } catch (error) {
        throw error;
    }
}



async function edit_comment(user, payload) {

    try {
        let value = []
        let sql = 'UPDATE `tb_comment` SET ';

        if (payload.comment && payload.user_tag_json) {
            sql += "  comment = ? , user_tag_json = ?";
            value.push(payload.comment, payload.user_tag_json)
        } else if (payload.comment) {
            sql += "  comment = ? ";
            value.push(payload.comment)
        } else if (payload.user_tag_json) {
            sql += "  user_tag_json = ? ";
            value.push(payload.user_tag_json)
        }

        sql += " where comment_id = ? ";
        value.push(payload.comment_id)
        return await DAO.mysql_query("edit_comment_count", sql, value);

    } catch (error) {
        throw error;
    }
}



async function edit_comment_count(payload, countInc) {

    try {
        let value = []
        let sql = 'UPDATE `tb_case` SET comment_count = comment_count - ? where case_id = ?';
        value.push(countInc, payload.case_id)
        return await DAO.mysql_query("edit_comment_count", sql, value);

    } catch (error) {
        throw error;
    }
}

async function delete_comment(userData, payload) {
    try {
        let sql = 'delete from tb_comment where  comment_id = ? OR parent_comment_id = ? '
        return await DAO.mysql_query("delete_comment", sql, [payload.comment_id, payload.comment_id]);
    } catch (error) {
        throw error;
    }
}




async function case_details(caseId) {
    try {
        let sql = 'SELECT user.notification_case,user.notification_like,user.notification_comment,user.name,user.device_token,cases.*  FROM `tb_case` as cases ' +
            ' LEFT JOIN tb_users as user ON cases.user_id = user.user_id ' +
            ' WHERE cases.case_id = ? GROUP BY cases.case_id ';
        return await DAO.mysql_query("case_details", sql, [caseId]);
    } catch (error) {
        throw error;
    }
}



async function send_multi_push(userData, payloadData, caseDataGet) {
    try {
        let userIds = underscore.pluck(payloadData.user_tag_json, 'id')
        let sql = 'select * from tb_users where user_id in (?)';
        let result = await DAO.mysql_query_old("case_details", sql, [userIds]);
        let replacements = {
            name: userData.name
        }
        for (let i = 0; i < result[0].length; i++) {
            if ((result[0][i].user_id == caseDataGet[0].user_id) && result[0][i].notification_comment == 1) {
                payloadData.type = 1
                universal_functions.send_push_dynamic(payloadData, result[0][i].device_token, 
                    handlebars.compile(constant.push_msg.tag)(replacements),{})
                let notificationData = {
                    sender_id: userData.user_id,
                    reciver_id: result[0][i].user_id,
                    text: handlebars.compile(constant.push_msg.tag)(replacements),
                    is_me: 0,
                    type: 1,
                    case_id: payloadData.case_id
                }
                create_notification_i(userData, notificationData);
            } else if ((result[0][i].user_id != caseDataGet[0].user_id) && result[0][i].notification_case == 1) {
                payloadData.type = 1;
                universal_functions.send_push_dynamic(payloadData, result[0][i].device_token, 
                    handlebars.compile(constant.push_msg.tag)(replacements),{})
                let notificationData = {
                    sender_id: userData.user_id,
                    reciver_id: result[0][i].user_id,
                    text: handlebars.compile(constant.push_msg.tag)(replacements),
                    is_me: 0,
                    type: 1,
                    case_id: payloadData.case_id
                }
                create_notification_i(userData, notificationData);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function send_single_push(caseData, userData) {
    try {
        let replacements = {
            name: userData.name
        }
        universal_functions.send_push_dynamic(caseData, caseData[0].device_token, 
            handlebars.compile(constant.push_msg.case_like)(replacements),{})

    } catch (error) {
        throw error;
    }
}


const check_poll_answer = async (userData, payload) => {
    let sql = 'select * from tb_answer_poll where  user_id = ? and case_id = ? and case_url_id = ? '
    return await DAO.mysql_query("check_poll_answer", sql, [userData.user_id, payload.case_id, payload.case_url_id]);
}

const create_poll_answer = async (userData, payload) => {
    let sql = 'INSERT INTO `tb_answer_poll`  (`user_id`, `case_id`, `case_url_id`, `answer` ) VALUES ' +
        ' (?,?,?,?) '
    return await DAO.mysql_query("create_poll_answer", sql, [userData.user_id, payload.case_id, payload.case_url_id, payload.answer]);
}

const update_poll_answer = async (userData, payload) => {
    let sql = 'UPDATE `tb_answer_poll` SET `answer`= ? where `user_id` = ? and `case_id` = ? and `case_url_id` = ? '
    return await DAO.mysql_query("update_poll_answer", sql, [payload.answer, userData.user_id, payload.case_id, payload.case_url_id]);
}

const update_poll_answer_case = async (userData, payload) => {
    let sql = 'UPDATE `tb_case_url` SET  '

    if (payload.answer == 1) {
        sql += '  `answer1count` = answer1count + 1 '
    } else if (payload.answer == 2) {
        sql += '  `answer2count` = answer2count + 1 '
    } else if (payload.answer == 3) {
        sql += ' `answer3count` = answer3count + 1 '
    } else if (payload.answer == 4) {
        sql += '  `answer4count` = answer4count + 1 '
    }
    sql += ' where  `case_url_id` = ? '
    return await DAO.mysql_query("update_poll_answer", sql, [payload.case_url_id]);
}

const dec_poll_answer_case = async (userData, payload) => {
    let sql = 'UPDATE `tb_case_url` SET  '

    if (payload.last_answer == 1) {

        sql += '  `answer1count` = answer1count - 1 '
    } else if (payload.last_answer == 2) {
        sql += '  `answer2count` = answer2count - 1 '
    } else if (payload.last_answer == 3) {
        sql += '  `answer3count` = answer3count - 1 '
    } else if (payload.last_answer == 4) {
        sql += ' `answer4count` = answer4count - 1 '
    }
    sql += ' where  `case_url_id` = ? '
    return await DAO.mysql_query("update_poll_answer", sql, [payload.case_url_id]);
}


async function create_event(userData, payload) {
    try {
        console.log(payload);
        
        let sql = 'INSERT INTO `tb_event`(`user_id`,event_save_id,start_date,end_date, `title`, `time`, `location`, `description`, `list_of_types`, `link`, `latitude`, `longitude`, `is_private`) ' +
            ' VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?)'
        return await DAO.mysql_query("create_event", sql, [userData.user_id, payload.event_save_id || null, payload.start_date || null, payload.end_date || null, payload.title || null, payload.time || null, payload.location || null,
        payload.description || null, payload.list_of_types || [], payload.link || null, payload.latitude || 0, payload.longitude || 0, payload.is_private || 0]);
    } catch (error) {
        throw error;
    }
}

async function remove_event(user_ids, event_id) {
    try {
        let sql = `DELETE FROM tb_event WHERE event_save_id = ? and user_id IN (${Array(user_ids.length).fill("?")})`;
        return await DAO.mysql_query_old("remove_event", sql, [event_id].concat(user_ids));
    } catch (error) {
        throw error;
    }
}

const get_event = async (userData) => {
    let sql = 'select * from tb_event where  user_id = ?'
    return await DAO.mysql_query("get_event", sql, [userData.user_id]);
}

async function get_one_comment(userData, payload) {
    try {
        let sql = 'select * from tb_comment where  comment_id = ?  '
        return await DAO.mysql_query("get_one_comment", sql, [payload.comment_id]);
    } catch (error) {
        throw error;
    }
}

async function get_count_comment(userData, payload) {
    try {
        let sql = 'select count(*) as count from tb_comment where  parent_comment_id = ?  '
        return await DAO.mysql_query("get_count_comment", sql, [payload.comment_id]);
    } catch (error) {
        throw error;
    }
}


const delete_event = async (userData, payload) => {
    let sql = ' Delete  from tb_event where  event_save_id = ? and user_id = ?'
    return await DAO.mysql_query("delete_event", sql, [payload.event_save_id, userData.user_id]);
}

const create_notification = async (userData, payload) => {
    let sql = ' INSERT INTO `tb_notification`(`sender_id`, `reciver_id`, `text`, `is_me`, `type`,`case_id`, `case_user_name`, `case_user_id`) VALUES ' +
        ' (?,?,?,?,?,?,?,?) '
    return await DAO.mysql_query("create_poll_answer", sql, [payload.sender_id || null, payload.reciver_id || null, payload.text, payload.is_me, payload.type, payload.case_id, payload.case_user_name || null, payload.case_user_id || null]);
}


const create_notification_i = async (userData, payload) => {
    let sql = ' INSERT INTO `tb_notification`(`sender_id`, `reciver_id`, `text`, `is_me`, `type`,`case_id`) VALUES ' +
        ' (?,?,?,?,?,?) '
    return await DAO.mysql_query("create_poll_answer", sql, [payload.sender_id || null, payload.reciver_id || null, payload.text, payload.is_me, payload.type, payload.case_id]);
}

const get_user = async (user_id) => {
    let sql = 'select * from tb_users where  user_id = ? '
    return await DAO.mysql_query("get_user", sql, [user_id]);
}

module.exports = {
    page_content: page_content,
    check_user: check_user,
    save_case: save_case,
    check_save_case: check_save_case,
    save_case_name: save_case_name,
    check_save_case_name: check_save_case_name,
    get_save_case: get_save_case,
    get_save_case_details: get_save_case_details,
    get_case_details: get_case_details,
    add_comment: add_comment,
    add_comment_count: add_comment_count,
    get_comment: get_comment,
    get_sub_comment: get_sub_comment,
    feedback: feedback,
    delete_save_case: delete_save_case,
    delete_save_case_v2: delete_save_case_v2,
    delete_save_case_name: delete_save_case_name,
    check_report_case: check_report_case,
    report_case: report_case,
    hide_case: hide_case,
    check_hide_case: check_hide_case,
    delete_save_case_v3: delete_save_case_v3,
    edit_save_case: edit_save_case,
    edit_comment: edit_comment,
    edit_comment_count: edit_comment_count,
    delete_comment: delete_comment,
    add_comment_single: add_comment_single,
    case_details: case_details,
    send_multi_push: send_multi_push,
    send_single_push: send_single_push,
    check_poll_answer: check_poll_answer,
    create_poll_answer: create_poll_answer,
    update_poll_answer: update_poll_answer,
    update_poll_answer_case: update_poll_answer_case,
    dec_poll_answer_case: dec_poll_answer_case,
    create_event: create_event,
    get_event: get_event,
    get_one_comment: get_one_comment,
    get_count_comment: get_count_comment,
    delete_event: delete_event,
    create_notification: create_notification,
    get_user: get_user,
    check_report_comment: check_report_comment,
    case_commented_users,
    remove_event
}