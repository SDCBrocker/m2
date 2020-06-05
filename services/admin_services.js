const DAO = require('../DAO/mysql');
const rn = require('random-number');
const constant = require('../lib/constant')
const token = require('../lib/token_manager')
const image_upload = require('../utils/universal_functions')
const underscore = require('underscore')
const moment = require('moment')
const md5 = require('md5');


async function get_admin(admin_id) {
    try {
        let sql = 'select * from tb_admin where admin_id = ?'
        return await DAO.mysql_query("get_admin", sql, [admin_id]);
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

async function create_token_admin(userData) {
    try {
        userData.user_id = userData.admin_id
        userData.type = "admin"
        return token.create_token(userData)
    } catch (error) {
        throw error;
    }
}

async function get_surgen(payload) {
    try {

        let sql = 'select * from tb_users where is_deleted = 0 '
        let pushAr = []

        if (payload.isAdminApprove !== 'all') {
            sql += " AND is_approve = ? "
            if (payload.isAdminApprove == "true") {
                pushAr.push(1)
            } else {
                pushAr.push(0)
            }
        }

        if (payload.type !== 'all') {
            sql += " AND login_type = ? "
            pushAr.push(payload.type)
        }

        if (payload.searchUser) {
            sql += ` AND ( name LIKE "%${payload.searchUser}%"  OR email LIKE "%${payload.searchUser}%" ) `
        }

        sql += " ORDER BY user_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_surgen_block(payload) {
    try {

        let sql = 'select * from tb_users where is_deleted = 0 '
        let pushAr = []

        if (payload.isAdminApprove !== 'all') {
            sql += " AND is_block = ? "
            if (payload.isblock == "true") {
                pushAr.push(1)
            } else {
                pushAr.push(0)
            }
        }
        if (payload.searchUser) {
            sql += " AND ( name = ?  OR email = ?  OR username = ?  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }

        sql += " ORDER BY user_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_surgen_for_verify(payload) {
    try {

        let sql = 'select * from tb_users where is_deleted = 0 '
        let pushAr = []
        let first = 0

        if (payload.isAdminVerified !== 'all') {
            sql += " AND is_verify = ? "
            if (payload.isAdminVerified == "true") {
                first = 1
            }
            pushAr.push(first)
        }

        if (payload.searchUser) {
            sql += " AND ( name = ?  OR email = ?  OR username = ?  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }

        sql += " ORDER BY user_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}
async function all_surgeon_for_verify_count(payload) {
    try {

        let sql = 'select count(*) as count from tb_users where is_deleted = 0 '
        let pushAr = []
        if (payload.isAdminVerified !== 'all') {
            sql += " AND is_verify = ? "
            if (payload.isAdminVerified == "true") {
                pushAr.push(1)
            } else {
                pushAr.push(0)
            }
        }
        if (payload.searchUser) {
            sql += " AND ( name = ? OR email = ?  OR username = ?'  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_surgen_count(payload) {
    try {

        let sql = 'select count(*) as count from tb_users where is_deleted = 0 '
        let pushAr = []
        if (payload.isAdminApprove !== 'all') {
            sql += " AND is_approve = ? "
            if (payload.isAdminApprove == "true") {
                pushAr.push(1)
            } else {
                pushAr.push(0)
            }
        }
        if (payload.type !== 'all') {
            sql += " AND login_type = ? "
            pushAr.push(payload.type)

        }
        if (payload.searchUser) {
            sql += " AND ( name = ? OR email = ?  OR username = ?  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_block_count(payload) {
    try {

        let sql = 'select count(*) as count from tb_users where is_deleted = 0 '
        let pushAr = []
        if (payload.isAdminApprove !== 'all') {
            sql += " AND is_block = ? "
            if (payload.isblock == "true") {
                pushAr.push(1)
            } else {
                pushAr.push(0)
            }
        }
        if (payload.searchUser) {
            sql += " AND ( name = ? OR email = ?  OR username = ?  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        return await DAO.mysql_query("get_block_count", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function update_token(access_token, payload) {
    try {
        let sql = 'update tb_admin set access_token = ?  where admin_id = ?'
        return await DAO.mysql_query("get_admin", sql, [access_token, payload.admin_id]);
    } catch (error) {
        throw error;
    }
}

async function approve_reject_case(payload) {
    try {
        if(!payload.reject_reason){
            payload.reject_reason = null;
        }
        
        let sql = 'update tb_case set status = ?, reject_reason = ? where case_id = ?'
        return await DAO.mysql_query("approve_reject_case", sql, [payload.status, payload.reject_reason, payload.case_id]);
    } catch (error) {
        throw error;
    }
}

async function get_surgen_by_id(payload) {
    try {
        let sql = 'select * from tb_users where is_deleted = 0 and user_id = ?'
        return await DAO.mysql_query("get_admin", sql, [payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function approve_reject(payload) {
    try {
        let sql = 'update tb_users set is_approve = ? ,title = ?,otp = ? where user_id = ?'
        let updateStatus = 2
        if (payload.is_approve) {
            updateStatus = 1
        }
        return await DAO.mysql_query("approve_reject", sql, [updateStatus, payload.title || null, payload.otp, payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function page_content(payload) {
    try {

        let sql = 'select * from tb_static_content '
        let pushAr = []
        return await DAO.mysql_query("page_content", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function add_page_content(payload) {
    try {

        let sql = 'INSERT INTO `tb_static_content`(`title`, `type`, `text`) VALUES (?,?,?)'
        let pushAr = [payload.title, payload.type, payload.text]
        return await DAO.mysql_query("add_page_content", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function create_event(payload) {
    try {
        if (payload.location && !underscore.isEmpty(payload.location)) {
            payload.location = JSON.stringify(payload.location);
        }

        let sql = 'INSERT INTO `tb_admin_event`(start_datetime, end_datetime, `title`, `location`, `description`, `url`, `latitude`, `longitude`, `reminder_type1`, `reminder_type2`, `reminder1_datetime`, `reminder2_datetime`, `push_msg`, `email_subject`, `email_body`) ' + ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        return await DAO.mysql_query("create_event", sql, [payload.start_datetime || null, payload.end_datetime || null, payload.title || null, payload.location || null,
        payload.description || null, payload.url || null, payload.latitude || 0, payload.longitude || 0, payload.reminder_type1 || 0, payload.reminder_type2 || 0, payload.reminder1_datetime || null, payload.reminder2_datetime || null, payload.push_msg || null, payload.email_subject || null, payload.email_body || null]);
    } catch (error) {
        console.log(error);

        throw error;
    }
}

async function edit_event(payload) {
    try {
        if (payload.location && !underscore.isEmpty(payload.location)) {
            payload.location = JSON.stringify(payload.location);
        }

        let sql = 'UPDATE `tb_admin_event` SET start_datetime = ?, end_datetime = ?, title = ?, location=?, description=?, url=?, latitude=?, longitude=?, reminder_type1=?, reminder_type2=?, reminder1_datetime=?, reminder2_datetime=?, push_msg=?, email_subject=?, email_body=? WHERE event_id = ?';
        return await DAO.mysql_query("edit_event", sql, [payload.start_datetime || null, payload.end_datetime || null, payload.title || null, payload.location || null,
        payload.description || null, payload.url || null, payload.latitude || 0, payload.longitude || 0, payload.reminder_type1 || 0, payload.reminder_type2 || 0, payload.reminder1_datetime || null, payload.reminder2_datetime || null, payload.push_msg || null, payload.email_subject || null, payload.email_body || null, payload.event_id]);
    } catch (error) {
        console.log(error);

        throw error;
    }
}

const get_event = async (payload) => {
    let sql = "select e.*, GROUP_CONCAT(attendees.user_id) as list_of_attendees from tb_admin_event as e " +
        " left join tb_admin_event_attendees as attendees on e.event_id = attendees.event_id where e.event_id IS NOT NULL and e.is_deleted = 0 GROUP BY e.event_id order by e.start_datetime asc ";

    let value = [];
    if (payload.limit) {
        sql += " limit ? "
        value.push(payload.limit)
    }
    if (payload.skip) {
        sql += "  OFFSET ? "
        value.push(payload.skip)
    }
    return await DAO.mysql_query("get_event", sql, value);
}

const get_event_details = async (payload) => {
    let sql = "select e.*, GROUP_CONCAT(attendees.user_id) as list_of_attendees from tb_admin_event as e " +
        " left join tb_admin_event_attendees as attendees on e.event_id = attendees.event_id where e.event_id IS NOT NULL and e.is_deleted = 0 and e.event_id = ? GROUP BY e.event_id order by e.start_datetime asc ";

    let value = [payload.event_id];
    if (payload.limit) {
        sql += " limit ? "
        value.push(payload.limit)
    }
    if (payload.skip) {
        sql += "  OFFSET ? "
        value.push(payload.skip)
    }
    return await DAO.mysql_query("get_event", sql, value);
}

async function delete_event(payload) {
    try {
        let sql = 'update tb_admin_event set is_deleted = 1 where event_id = ?'
        return await DAO.mysql_query("delete_event", sql, [payload.event_id]);
    } catch (error) {
        throw error;
    }
}
async function add_attendees(attendees, event_id) {
    try {
        let array_push = []
        for (let i = 0; i < attendees.length; i++) {
            let internal_array = [];
            internal_array.push(event_id, attendees[i]);
            array_push.push(internal_array)
        }
        if (array_push.length > 0) {
            let sql = 'INSERT INTO `tb_admin_event_attendees`(`event_id`, `user_id`) ' + ' VALUES ?';
            return await DAO.mysql_query_old("add_attendees", sql, [array_push]);
        } else {
            return 0;
        }
    } catch (error) {
        throw error;
    }
}

async function remove_attendees(user_ids, event_id) {
    try {
        let sql = `DELETE FROM tb_admin_event_attendees WHERE event_id = ? and user_id IN (${Array(user_ids.length).fill("?")})`;
        return await DAO.mysql_query_old("add_attendees", sql, [event_id].concat(user_ids));
    } catch (error) {
        throw error;
    }
}

async function verify_unverify(payload) {
    try {
        let sql = 'update tb_users set is_verify = ? where user_id = ?'
        let updateStatus = 0
        if (payload.is_verify) {
            updateStatus = 1
        }
        return await DAO.mysql_query("approve_reject", sql, [updateStatus, payload.user_id]);
    } catch (error) {
        throw error;
    }
}


async function get_report_count(payload) {
    try {

        let sql = 'select count(*) as count from tb_report_case where 1 = 1 '
        if (payload.type !== 'all') {
            if (payload.type == "case") {
                sql += " AND case_id IS NOT NULL "
            } else {
                sql += " AND comment_id IS NOT NULL "
            }
        }
        let pushAr = []
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_report_data(payload) {
    try {

        let sql = 'select r.*,comment.comment, url.name,url.type,url.url ,u1.is_block,u1.name,u1.email,u1.profile_pic ,u.name as reporterName,u.email as reporterEmail, ';
        sql += " u.profile_pic as reporterPic from tb_report_case as r ";
        sql += " left join tb_users as u on u.user_id = r.reporter_id ";
        sql += " left join tb_users as u1 on u1.user_id = r.user_id ";
        sql += " LEFT JOIN tb_case as cases ON cases.case_id = r.case_id ";
        sql += " LEFT JOIN tb_comment as comment ON comment.comment_id = r.comment_id ";
        sql += " LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ";
        sql += " where 1 = 1 ";

        if (payload.type !== 'all') {
            if (payload.type == "case") {
                sql += " AND r.case_id IS NOT NULL "
            } else {
                sql += " AND r.comment_id IS NOT NULL "
            }
        }
        let pushAr = []

        sql += " ORDER BY r.report_case_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)

        let result = await DAO.mysql_query("get_report_data", sql, pushAr);
        let caseIds = underscore.pluck(result, 'case_id')
        let sqlQuery = "select c.*,p.answer as answer_by_you from tb_case_url as c " +
            " left join tb_answer_poll as p on c.case_url_id = p.case_url_id and c.case_id in (?) "
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
        return result;
    } catch (error) {
        throw error;
    }
}


async function get_surgeon_for_specialization_count(payload) {
    try {
        let sql = 'select count(*) as count from tb_users where is_deleted = 0 '
        let pushAr = []
        if (payload.type !== 'all') {
            sql += " AND login_type = ? "
            if (payload.type == "gps") {
                pushAr.push("gps")
            } else {
                pushAr.push("okta")
            }
        } else {
            sql += " AND (login_type = ? OR login_type = ?)  "
            pushAr.push("gps", "okta")
        }
        if (payload.searchUser) {
            sql += " AND ( name = ? OR email = ?  OR username = ?'  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_surgeon_for_specialization(payload) {
    try {

        let sql = 'select * from tb_users where is_deleted = 0 '
        let pushAr = []
        if (payload.type !== 'all') {
            sql += " AND login_type = ? "
            if (payload.type == "gps") {
                pushAr.push("gps")
            } else {
                pushAr.push("okta")
            }
        } else {
            sql += " AND (login_type = ? OR login_type = ?)  "
            pushAr.push("gps", "okta")
        }
        if (payload.searchUser) {
            sql += " AND ( name = ? OR email = ?  OR username = ?'  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        return await DAO.mysql_query("get_admin", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function update_details(payload) {
    try {
        let sql = 'update tb_users set title = ? ,name = ? where user_id = ?'
        return await DAO.mysql_query("approve_reject", sql, [payload.title, payload.name, payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function staff_directory(payload) {
    try {
        let sql = 'INSERT INTO `tb_staff_directory` ( `name`, `title`, `photo`, `email`, `phone_number`, `department`, `location`) VALUES ' +
            ' ( ?,?,?,?,?,?,?)'
        return await DAO.mysql_query("staff_directory", sql, [payload.name, payload.title || null,
        payload.photo || null, payload.email || null, payload.phone_number || null, payload.department || null, payload.location || null]);
    } catch (error) {
        throw error;
    }
}


async function get_staff_directory_count(payload) {
    try {
        let sql = 'select count(*) as count from tb_staff_directory where  1 = 1 '
        let pushAr = []
        if (payload.searchUser) {
            sql += " and ( name = ? OR title = ?  OR email = ?  ) "
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        sql += " ORDER BY staff_directory_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)
        return await DAO.mysql_query("get_staff_directory_count", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function get_staff_directory(payload) {
    try {
        let sql = 'select * from tb_staff_directory where  1 = 1 '
        let pushAr = []
        if (payload.searchUser) {
            sql += ' and ( name = ? OR title = ?  OR email = ?  ) '
            pushAr.push(payload.searchUser, payload.searchUser, payload.searchUser)
        }
        sql += " ORDER BY staff_directory_id DESC  LIMIT ? OFFSET ? "
        pushAr.push(payload.limit, payload.skip)
        return await DAO.mysql_query("get_staff_directory_count", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function delete_case(payload) {
    try {
        let sql = 'update tb_case set is_deleted = 1 where case_id = ?'
        return await DAO.mysql_query("delete_case", sql, [payload.case_id]);
    } catch (error) {
        throw error;
    }
}

async function delete_comment(payload) {
    try {
        let sql = 'delete from tb_comment where  comment_id = ? OR parent_comment_id = ? '
        return await DAO.mysql_query("delete_comment", sql, [payload.comment_id, payload.comment_id]);
    } catch (error) {
        throw error;
    }



}

async function delete_comment_status(payload) {
    try {
        let sql = 'update tb_report_case set status = 1 where comment_id = ?'
        return await DAO.mysql_query("delete_comment_status", sql, [payload.comment_id]);
    } catch (error) {
        throw error;
    }
}

async function delete_staff_directory(payload) {
    try {
        let sql = 'delete from tb_staff_directory where  staff_directory_id = ?'
        return await DAO.mysql_query("delete_staff_directory", sql, [payload.staff_directory_id]);
    } catch (error) {
        throw error;
    }
}

async function get_case(query) {
    try {
        let pushAr = []
        let sql = 'SELECT user.username,user.title,user.profile_pic,user.is_verify,user.title,user.name,cases.* ' +
            ' FROM `tb_case` as cases ' +
            // ' LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ' +
            ' LEFT JOIN tb_users as user ON cases.user_id = user.user_id ' +
            ' WHERE   ' ;
            if (query.status && (query.status ==1)) {
                sql += " cases.is_deleted = 0 and cases.status in (?) "
                pushAr.push([0,1])
            }else if (query.status && (query.status ==2)) {
                sql += " cases.status in (?) "
                pushAr.push([2])
            }
            sql += 'GROUP BY cases.case_id order by cases.case_id desc';




        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ?"
            pushAr.push(query.skip)

        }
        console.log(sql)
        let result = await DAO.mysql_query_old("get_case", sql, pushAr);
        result = result[0]
        let caseIds = underscore.pluck(result, 'case_id')
        let sqlQuery = "select c.*,p.answer as answer_by_you from tb_case_url as c " +
            " left join tb_answer_poll as p on c.case_url_id = p.case_url_id where c.case_id in (?) "
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

        return result



    } catch (error) {
        throw error;
    }
}

async function get_case_by_id(query) {
    try {
        let pushAr = []
        let sql = 'SELECT user.username,user.title,user.profile_pic,user.is_verify,user.title,user.name,cases.* ' +
            ' FROM `tb_case` as cases ' +
            ' LEFT JOIN tb_users as user ON cases.user_id = user.user_id ' +
            ' WHERE cases.case_id = ' + query.case_id + ' GROUP BY cases.case_id order by cases.case_id desc';
        let result = await DAO.mysql_query("get_case", sql, pushAr);
        let caseIds = underscore.pluck(result, 'case_id')
        let sqlQuery = "select c.*,p.answer as answer_by_you from tb_case_url as c " +
            " left join tb_answer_poll as p on c.case_url_id = p.case_url_id where c.case_id in (?) "
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
        if (result.length > 0)
            result = result[0];
        else
            result = {};
        return result
    } catch (error) {
        throw error;
    }
}

async function get_user_for_not(not) {
    try {
        let sql = 'select device_token from tb_users';
        sql += not + ' AND device_token IS NOT NULL';
        return await DAO.mysql_query("get_user_for_not", sql, []);
    } catch (error) {
        throw error;
    }
}


async function get_all_feedback(payload) {
    try {

        let sql = 'select f.*,u.username,u.name,u.email,u.profile_pic from `tb_feedback` as f ';
        sql += ' left join tb_users as u on u.user_id = f.user_id where 1 = 1 ';
        let pushAr = []

        if (payload.feedback_id) {
            sql += ' and feedback_id = ? ';
            pushAr.push(payload.feedback_id)
        }
        sql += " ORDER BY f.feedback_id DESC "
        return await DAO.mysql_query("get_all_feedback", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    get_admin: get_admin,
    check_user: check_user,
    create_token_admin: create_token_admin,
    get_surgen: get_surgen,
    update_token: update_token,
    get_surgen_by_id: get_surgen_by_id,
    approve_reject: approve_reject,
    get_surgen_count: get_surgen_count,
    page_content: page_content,
    add_page_content: add_page_content,
    verify_unverify: verify_unverify,
    get_report_count: get_report_count,
    get_report_data: get_report_data,
    all_surgeon_for_verify_count: all_surgeon_for_verify_count,
    get_surgen_for_verify: get_surgen_for_verify,
    get_surgeon_for_specialization: get_surgeon_for_specialization,
    get_surgeon_for_specialization_count: get_surgeon_for_specialization_count,
    update_details: update_details,
    staff_directory: staff_directory,
    get_staff_directory_count: get_staff_directory_count,
    get_staff_directory: get_staff_directory,
    delete_case: delete_case,
    delete_comment: delete_comment,
    get_case: get_case,
    get_case_by_id,
    get_user_for_not: get_user_for_not,
    get_block_count: get_block_count,
    get_surgen_block: get_surgen_block,
    delete_staff_directory: delete_staff_directory,
    get_all_feedback: get_all_feedback,
    create_event,
    edit_event,
    add_attendees,
    get_event,
    get_event_details,
    delete_event,
    remove_attendees,
    approve_reject_case,
    delete_comment_status:delete_comment_status
}