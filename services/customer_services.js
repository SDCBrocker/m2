const DAO = require('../DAO/mysql');
const rn = require('random-number');
const constant = require('../lib/constant')
const token = require('../lib/token_manager')
const image_upload = require('../utils/universal_functions')
const underscore = require('underscore')
const moment = require('moment')
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const md5 = require('md5');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use SSL
    auth: {
        user: 'iosdev.cool@gmail.com',
        pass: 'C@@Ldev@!2019'
    }
});



const options = {
    min: 1000
    , max: 9999
    , integer: true
}

const create_user = async (payload) => {
    try {

        let sql = 'INSERT INTO `tb_users`(`email`,`password`, `name`, `otp`,`device_type`,`device_token`,`username`,`profile_pic`,`call_me`,`email_me`,`sale_call`,`sale_email`,login_type,login_id,npi,is_approve,read_access,location,latitude,longitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        return await DAO.mysql_query("create_user", sql, [payload.email, payload.password ? md5(payload.password) : null, payload.name, rn(options), payload.device_type || null, payload.device_token || null, payload.username || null,
        payload.image || null, payload.call_me || null, payload.email_me || null, payload.sale_call || null, payload.sale_email || null, payload.login_type || null, payload.login_id || null, payload.npi || null, 1, payload.read_access || "no", payload.location || null, payload.latitude || 0, payload.longitude || 0]);

    } catch (error) {
        throw error;
    }
}

async function otp_verify(payload, userData) {
    try {
        if (payload.otp == userData.otp) {
            let sql = 'UPDATE `tb_users` SET otp = ? , is_number_verify = 1 where user_id = ?'
            return await DAO.mysql_query("otp_verify", sql, [null, userData.user_id]);
        } else if (userData.otp == null) {
            throw constant.msg.otpAlreadyVerified
        }
        else {
            throw constant.msg.wrongOtp
        }
    } catch (error) {
        throw error;
    }
}


async function get_user(user_id) {
    try {
        let sql = 'select * from tb_users where user_id = ?'
        return await DAO.mysql_query("get_user", sql, [user_id]);
    } catch (error) {
        throw error;
    }
}

async function get_users(user_ids) {
    try {
        let sql = `select * from tb_users where user_id  IN (${Array(user_ids.length).fill("?")}) `
        let result = await DAO.mysql_query("get_users", sql, [].concat(user_ids));
        return result;
    } catch (error) {
        throw error;
    }
}

async function get_user_phone(payload, userData) {
    try {
        let sql = 'select * from tb_users where otp = ? and user_id = ? limit 1'
        let user_data = await DAO.mysql_query("get_user_phone", sql, [payload.otp, userData.user_id]);
        if (user_data && user_data.length > 0) {
            if (user_data[0].otp == null) {
                throw constant.msg.otpAlreadyVerified
            } else {
                return user_data[0]
            }
        } else {
            throw constant.msg.userNotFind
        }
    } catch (error) {
        throw error;
    }
}

async function create_token_customer(userData) {
    try {
        return token.create_token(userData)
    } catch (error) {
        throw error;
    }
}

async function upload_image(file) {
    try {
        let url = await image_upload.upload_image_s3(file, '12', 'user_profile')
        return { image_url: url }
    } catch (error) {
        throw error;
    }
}

async function update_profile(payload, userData) {

    try {
        let value = []
        let sql = 'UPDATE `tb_users` SET name = ? ';
        value.push(payload.name)
        if (payload.profile_pic) {
            sql += ' , profile_pic = ?  '
            value.push(payload.profile_pic)
        }
        if (payload.status_msg) {
            sql += ' , status_msg = ?  '
            value.push(payload.status_msg)
        }
        if (payload.location) {
            sql += ' , location = ?  '
            value.push(payload.location)
        }
        if (payload.latitude) {
            sql += ' , latitude = ?  '
            value.push(payload.latitude)
        }
        if (payload.longitude) {
            sql += ' , longitude = ?  '
            value.push(payload.longitude)
        }
        if (payload.title) {
            sql += ' , title = ?  '
            value.push(payload.title)
        }
        if (payload.is_term) {
            sql += ' , is_term = ?  '
            value.push(payload.is_term)
        }
        sql += ' where user_id = ? ';
        value.push(userData.user_id)

        return await DAO.mysql_query("update_profile", sql, value);

    } catch (error) {
        throw error;
    }
}


async function check_email(email) {
    try {
        let sql = 'select * from tb_users where email = ?'
        return await DAO.mysql_query("check email", sql, [email]);
    } catch (error) {
        throw error;
    }
}

async function check_username(username) {
    try {
        let sql = 'select * from tb_users where username = ?'
        return await DAO.mysql_query("check username", sql, [username]);
    } catch (error) {
        throw error;
    }
}


async function update_otp(payload, userData) {

    try {
        let value = []
        let sql = 'UPDATE `tb_users` SET  otp = ?  where user_id = ?';
        value.push(payload.otp, userData.user_id)
        return await DAO.mysql_query("update_otp", sql, value);

    } catch (error) {
        throw error;
    }
}




const contact_sync = async (payload, userData) => {
    try {
        let phone_no = underscore.pluck(payload.contact, 'phone_number')
        let sql = `select phone_number,user_id from tb_users where phone_number in (${Array(phone_no.length).fill("?")}) `;
        let result = await DAO.mysql_query("contact_sync", sql, [].concat(phone_no));
        if (result && result.length > 0) {
            return result
        } else {
            throw constant.msg.userNotFind
        }
    } catch (error) {
        throw error;
    }
}

const insert_contact_sync = async (get_friend_list, contactList, userData, payload) => {
    try {
        let array_push = []
        for (let i = 0; i < contactList.length; i++) {
            if (get_friend_list.find(o => o.friend_id == contactList[i].user_id)) {

            } else {
                let internal_array = []
                let obj = payload.contact.find(o => o.phone_number == contactList[i].phone_number);
                internal_array.push(userData.user_id, contactList[i].user_id, obj.name);
                array_push.push(internal_array)
            }

        }
        if (array_push.length > 0) {
            let sql = 'INSERT INTO `tb_user_contact`(`user_id`, `friend_id`, `name`) VALUES ?';
            return await DAO.mysql_query_old("create_user", sql, [array_push]);
        } else {
            return 0
        }


    } catch (error) {
        throw error;
    }
}

async function check_friend_list(userData) {
    try {
        let sql = 'select uc.*,u.phone_number,u.country_code,u.profile_pic,u.name as name_db from tb_user_contact as uc ' +
            ' left join tb_users as u ON uc.friend_id = u.user_id  where uc.user_id = ? '
        return await DAO.mysql_query("get_user", sql, [userData.user_id]);
    } catch (error) {
        throw error;
    }
}


const check_token = async (token) => {
    let sql = 'select * from tb_users where access_token = ?'
    return await DAO.mysql_query("get_user", sql, [token]);
}

async function last_seen_update(data) {

    try {
        let value = []
        let sql = 'UPDATE `tb_users` SET last_seen = ? where access_token = ?';
        value.push(moment()._d, data.access_token)
        return await DAO.mysql_query("update_otp", sql, value);

    } catch (error) {
        throw error;
    }
}

async function online_update(data) {

    try {
        let value = []
        let last_mintue = moment().add(-30, 'seconds')
        let sql = 'UPDATE `tb_users` SET online = ? , last_seen = ? where access_token = ?';
        value.push(moment()._d, last_mintue._d, data.access_token)
        return await DAO.mysql_query("update_otp", sql, value);

    } catch (error) {
        throw error;
    }
}

async function delete_contact(data) {

    try {
        let value = []
        let sql = 'DELETE FROM `tb_user_contact` where 	user_id = ?';
        value.push(data.user_id)
        return await DAO.mysql_query("delete_contact", sql, value);

    } catch (error) {
        throw error;
    }
}

async function email_send(data, replacements) {
    try {
        var htmlToSend = handlebars.compile(data.body)(replacements);
        let info = await transporter.sendMail({
            from: '"Exactech" <mobiledev.cool@gmail.com>', // sender address
            to: data.email, // list of receivers
            subject: data.subject, // Subject line
            html: htmlToSend // html body
        });
        return info
    } catch (error) {
        throw error;
    }

}

async function check_user(payload) {
    try {
        let sql = 'select * from tb_users where email = ? OR username = ? '
        let data = await DAO.mysql_query("get_admin", sql, [payload.email, payload.email]);
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



async function update_token(data, payload) {
    try {
        let sql = 'update tb_users set access_token = ? , device_type = ? ,device_token = ?   where user_id = ? '
        return await DAO.mysql_query("update_token", sql, [data.access_token, payload.device_type, payload.device_token, data.user_id]);
    } catch (error) {
        throw error;
    }
}

const doc_upload = async (payload, userData) => {
    try {

        let sql = 'INSERT INTO `tb_case`(`description`,`user_id`) VALUES (?,?)';
        return await DAO.mysql_query("doc_upload", sql, [payload.description || null, userData.user_id]);

    } catch (error) {
        throw error;
    }
}

const case_url = async (payload, id) => {
    try {
        let array_push = []
        for (let i = 0; i < payload.urls.length; i++) {
            let internal_array = [];
            internal_array.push(id, payload.urls[i].url, payload.urls[i].thumbnail || null, payload.urls[i].name || null, payload.urls[i].type || null,
                payload.urls[i].answer1 || null, payload.urls[i].answer2 || null, payload.urls[i].answer3 || null, payload.urls[i].answer4 || null);
            array_push.push(internal_array)
        }
        if (array_push.length > 0) {
            let sql = 'INSERT INTO `tb_case_url`(`case_id`, `url`,`thumbnail`,`name`,`type`,`answer1`,`answer2`,`answer3`,answer4) VALUES ?';
            return await DAO.mysql_query_old("add_user_chat", sql, [array_push]);
        } else {
            return 0
        }
    } catch (error) {
        throw error;
    }
}

async function get_case(user_id, query) {
    try {
        let pushAr = []
        let sql = 'SELECT  follow.follow_users_id as follow, mute.mute_users_id as mute ,u.name as commnet_user_profile_pic,user.location as location, user.latitude as latitude, user.longitude as longitude,u.name as commnet_user_name,c.comment ,save.case_save_id as isSaved,ls.user_id as isliked,user.status_msg,user.username,user.title,user.profile_pic,user.is_verify,user.title,user.name,cases.* ' +
            ' FROM `tb_case` as cases ' +
            // ' LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ' +
            ' inner join  tb_users as user ON cases.user_id = user.user_id and user.is_block = 0 ' +
            ' LEFT JOIN tb_case_like as ls ON cases.case_id =  ls.case_id and ls.user_id = ? ' +
            ' LEFT JOIN tb_comment as c ON cases.comment_id =  c.comment_id   ' +
            ' LEFT JOIN tb_users as u ON c.user_id =  u.user_id   ' +
            ' LEFT JOIN tb_case_save as save ON cases.case_id =  save.case_id and save.user_id = ? ' +
            ' LEFT JOIN tb_mute_users as mute ON cases.user_id =  mute.user_id and mute.repoter_id = ? ' +
            ' LEFT JOIN tb_follow_users as follow ON cases.user_id =  follow.user_id and follow.follower_id = ? ' +
            ' LEFT JOIN tb_hide_case as hide ON cases.case_id =  hide.case_id and hide.user_id = ? ';

        pushAr.push(user_id, user_id, user_id, user_id, user_id)
        let statusCondition = "AND ((cases.user_id != "+user_id+" and cases.status = 1) OR (cases.user_id = "+user_id+"))";
        if (query.other_user_id) {
            sql += " WHERE  hide.hide_case_id IS NULL and cases.user_id = ? and cases.is_deleted = 0 "+ statusCondition+" GROUP BY cases.case_id order by cases.case_id desc "
            pushAr.push(query.other_user_id)
        } else {
            if (query.case_id) {
                sql += " WHERE cases.case_id = ? and cases.is_deleted = 0 "+statusCondition +" GROUP BY cases.case_id order by cases.case_id desc "
                pushAr.push(query.case_id)
            } else {
                if (query.is_my) {
                    if(query.status && query.status != 3){
                        sql += " WHERE  hide.hide_case_id IS NULL and cases.user_id = ? and cases.status = ? and cases.is_deleted = 0 GROUP BY cases.case_id order by cases.case_id desc "
                        pushAr = pushAr.concat([user_id, query.status])
                    }else{
                        sql += " WHERE  hide.hide_case_id IS NULL and cases.user_id = ? and cases.is_deleted = 0 "+ statusCondition+" GROUP BY cases.case_id order by cases.case_id desc "
                        pushAr.push(user_id)
                    }
                } else {
                    if(query.blocked_users.length){
                        sql += ` WHERE hide.hide_case_id IS NULL and cases.is_deleted = 0 and user.user_id NOT IN (${Array(query.blocked_users.length).fill("?")}) ${statusCondition} GROUP BY cases.case_id order by cases.case_id desc `;
                        pushAr = pushAr.concat(query.blocked_users);
                    }else{
                        sql += ` WHERE hide.hide_case_id IS NULL and cases.is_deleted = 0 ${statusCondition} GROUP BY cases.case_id order by cases.case_id desc `;
                    }
                }
            }

        }



        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ?"
            pushAr.push(query.skip)

        }
        let result = await DAO.mysql_query("get_case", sql, pushAr);
        let caseIds = underscore.pluck(result, 'case_id')
        let sqlQuery = "select c.*,p.answer as answer_by_you from tb_case_url as c " +
            " left join tb_answer_poll as p on c.case_url_id = p.case_url_id and p.user_id = ? where c.case_id in (?) "
        let urlArray = await DAO.mysql_query_old("create_user", sqlQuery, [user_id, caseIds]);
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

async function get_case_caption_search(user_id, query) {
    try {
        let pushAr = []
        let sql = 'SELECT  follow.follow_users_id as follow, mute.mute_users_id as mute ,u.name as commnet_user_profile_pic,user.location as location, user.latitude as latitude, user.longitude as longitude,u.name as commnet_user_name,c.comment ,save.case_save_id as isSaved,ls.user_id as isliked,user.status_msg,user.username,user.title,user.profile_pic,user.is_verify,user.title,user.name,cases.* ' +
            ' FROM `tb_case` as cases ' +
            ' LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ' +
            ' inner join  tb_users as user ON cases.user_id = user.user_id and user.is_block = 0 ' +
            ' LEFT JOIN tb_case_like as ls ON cases.case_id =  ls.case_id and ls.user_id = ? ' +
            ' LEFT JOIN tb_comment as c ON cases.comment_id =  c.comment_id   ' +
            ' LEFT JOIN tb_users as u ON c.user_id =  u.user_id   ' +
            ' LEFT JOIN tb_case_save as save ON cases.case_id =  save.case_id and save.user_id = ? ' +
            ' LEFT JOIN tb_mute_users as mute ON cases.user_id =  mute.user_id and mute.repoter_id = ? ' +
            ' LEFT JOIN tb_follow_users as follow ON cases.user_id =  follow.user_id and follow.follower_id = ? ' +
            ' LEFT JOIN tb_hide_case as hide ON cases.case_id =  hide.case_id and hide.user_id = ? ';

        pushAr.push(user_id, user_id, user_id, user_id, user_id)
        if (query.caption) {
            sql += ` WHERE url.name LIKE "%${query.caption}%" and hide.hide_case_id IS NULL and cases.is_deleted = 0 GROUP BY cases.case_id order by cases.case_id desc `
        }

        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ? "
            pushAr.push(query.skip)

        }
        let result = await DAO.mysql_query("get_case", sql, pushAr);
        let caseIds = underscore.pluck(result, 'case_id')
        let sqlQuery = "select c.*,p.answer as answer_by_you from tb_case_url as c " +
            " left join tb_answer_poll as p on c.case_url_id = p.case_url_id and p.user_id = ? where c.case_id in (?) "
        let urlArray = await DAO.mysql_query_old("create_user", sqlQuery, [user_id, caseIds]);
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

async function get_like_case(user_id, query) {
    try {
        let pushAr = []
        let sql = 'SELECT  u.name,c.comment ,save.case_save_id as isSaved,ls.user_id as isliked,user.profile_pic,user.title,user.name,cases.*,GROUP_CONCAT(url) as urls,' +
            'CONCAT("[", TRIM(BOTH "," FROM GROUP_CONCAT(url) ), "]") AS urls_brackets FROM `tb_case` as cases ' +
            ' LEFT JOIN tb_case_url as url ON cases.case_id = url.case_id ' +
            ' LEFT JOIN tb_users as user ON cases.user_id = user.user_id ' +
            ' LEFT JOIN tb_case_like as ls ON cases.case_id =  ls.case_id ' +
            ' LEFT JOIN tb_comment as c ON cases.comment_id =  c.comment_id   ' +
            ' LEFT JOIN tb_users as u ON c.user_id =  u.user_id   ' +
            ' LEFT JOIN tb_case_save as save ON cases.case_id =  save.case_id ';
        sql += " WHERE ls.user_id = ? and cases.is_deleted = 0 GROUP BY cases.case_id order by cases.case_id desc "
        pushAr.push(user_id)
        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ?"
            pushAr.push(query.skip)

        }
        return await DAO.mysql_query("get_case", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

const like_unlike_case = async (payload, userData) => {
    try {

        let sql = 'INSERT INTO `tb_case_like`(`case_id`,`user_id`) VALUES (?,?)';
        return await DAO.mysql_query("doc_upload", sql, [payload.case_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}


async function delete_like(payload, userData) {

    try {
        let value = []
        let sql = 'DELETE FROM `tb_case_like` where  case_id = ? and user_id = ?';
        return await DAO.mysql_query("delete_contact", sql, [payload.case_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}


const check_like = async (payload, userData) => {
    let sql = 'select * from tb_case_like where  case_id = ? and user_id = ?'
    return await DAO.mysql_query("get_user", sql, [payload.case_id, userData.user_id]);
}


async function like_unlike_case_count(payload, userData) {
    try {
        if (payload.is_like) {
            let sql = 'update tb_case set case_like =  case_like + 1  where case_id = ? '
            return await DAO.mysql_query("like_unlike_case_count", sql, [payload.case_id]);
        } else {
            let sql = 'update tb_case set case_like = case_like - 1  where case_id = ? '
            return await DAO.mysql_query("like_unlike_case_count", sql, [payload.case_id]);
        }

    } catch (error) {
        throw error;
    }
}


const report_user = async (userData, payload) => {
    try {

        let sql = 'INSERT INTO `tb_report_users`(`user_id`,`repoter_id`) VALUES (?,?)';
        return await DAO.mysql_query("report_user", sql, [payload.user_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}

const check_report_user = async (userData, payload) => {
    let sql = 'select * from tb_report_users where  user_id = ? and repoter_id = ?'
    return await DAO.mysql_query("get_user", sql, [payload.user_id, userData.user_id]);
}



const check_mute = async (payload, userData) => {
    let sql = 'select * from  tb_mute_users where  user_id = ? and repoter_id = ?'
    return await DAO.mysql_query("get_user", sql, [payload.user_id, userData.user_id]);
}

const mute_user = async (payload, userData) => {
    try {
        let sql = 'INSERT INTO `tb_mute_users`(`user_id`,`repoter_id`) VALUES (?,?)';
        return await DAO.mysql_query("doc_upload", sql, [payload.user_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}

async function delete_mute(payload, userData) {

    try {
        let value = []
        let sql = 'DELETE FROM `tb_mute_users` where  user_id = ? and repoter_id = ?';
        return await DAO.mysql_query("delete_contact", sql, [payload.user_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}




const check_follow = async (payload, userData) => {
    let sql = 'select * from   tb_follow_users where  user_id = ? and follower_id = ?'
    return await DAO.mysql_query("get_user", sql, [payload.user_id, userData.user_id]);
}

const follow_user = async (payload, userData) => {
    try {
        let sql = 'INSERT INTO `tb_follow_users`(`user_id`,`follower_id`) VALUES (?,?)';
        return await DAO.mysql_query("doc_upload", sql, [payload.user_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}

async function delete_follow(payload, userData) {

    try {
        let value = []
        let sql = 'DELETE FROM `tb_follow_users` where  user_id = ? and follower_id = ?';
        return await DAO.mysql_query("delete_contact", sql, [payload.user_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}


async function update_username(payload, userData) {
    try {

        let sql = 'update tb_users set 	username =  ?  where user_id = ? '
        return await DAO.mysql_query("like_unlike_case_count", sql, [payload.username, userData.user_id]);


    } catch (error) {
        throw error;
    }
}

async function follow_user_list(user_id, query) {
    try {
        let pushAr = []
        let sql = ' SELECT u.user_id , u.name FROM `tb_follow_users`  as f ' +
            ' left join  tb_users as u on u.user_id =f.follower_id  where f.user_id = ? ';


        if (query.text) {
            sql += ` AND u.name LIKE "%${query.text}%" `
        }
        sql += " order by name asc "
        pushAr.push(user_id)
        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ? "
            pushAr.push(query.skip)

        }
        pushAr.push(user_id)
        return await DAO.mysql_query_old("follow_user_list", sql, pushAr);
    } catch (error) {
        throw error;
    }
}

async function block_unblock(payload) {
    try {
        let block = 0
        if (payload.is_block) {
            block = 1
        }
        let sql = 'update tb_users set 	is_block =  ?  where user_id = ? '
        return await DAO.mysql_query("like_unlike_case_count", sql, [block, payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function get_blocked_user(payload) {
    try {
        let sql = 'SELECT id  from `tb_block_users` WHERE blocked_by = ? and user_id = ?';
        return await DAO.mysql_query("block_by_user", sql, [payload.blocked_by, payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function get_blocked_users(payload) {
    try {
        let sql = 'SELECT u.user_id,u.name,u.profile_pic,u.username,u.status_msg,u.location,u.latitude,u.longitude,u.is_verify from `tb_block_users` as buer ' + ' left join  tb_users as u on u.user_id =buer.user_id WHERE blocked_by = ?';
        return await DAO.mysql_query("block_by_user", sql, [payload.blocked_by]);
    } catch (error) {
        throw error;
    }
}

async function block_by_user(payload) {
    try {
        let sql = 'INSERT INTO `tb_block_users` (blocked_by, user_id) VALUES (?,?)';
        return await DAO.mysql_query("block_by_user", sql, [payload.blocked_by, payload.user_id]);
    } catch (error) {
        throw error;
    }
}

async function unblock_by_user(payload) {
    try {
        let value = []
        let sql = 'DELETE FROM `tb_block_users` where blocked_by = ? and user_id = ?';
        value.push(payload.blocked_by, payload.user_id)
        return await DAO.mysql_query("unblock_by_user", sql, value);
    } catch (error) {
        throw error;
    }
}
async function update_notification(payload, userData) {

    try {
        let value = []
        let sql = 'UPDATE `tb_users` SET notification_comment = ? , notification_case = ? , notification_like = ?';
        value.push(payload.notification_comment, payload.notification_case, payload.notification_like)

        sql += ' where user_id = ? ';
        value.push(userData.user_id)

        return await DAO.mysql_query("update_notification", sql, value);

    } catch (error) {
        throw error;
    }
}


async function user_list_search(user_id, query) {
    try {
        let pushAr = []
        let sql = ' SELECT u.user_id,u.name,u.profile_pic,u.username,u.status_msg,u.location,u.latitude,u.longitude,u.is_verify,u.is_block FROM tb_users as u where 1 = 1 ';

        if (query.text) {
            sql += ` AND u.name LIKE "%${query.text}%" `
        }

        if(query.blocked_users.length){
            sql += ` AND u.user_id NOT IN (${Array(query.blocked_users.length).fill("?")}) `
            pushAr = pushAr.concat(query.blocked_users);
        }

        sql += " order by name asc "
        if (query.limit) {
            sql += " limit ? "
            pushAr.push(query.limit)
        }
        if (query.skip) {
            sql += "  OFFSET ? "
            pushAr.push(query.skip)
        }
        pushAr.push(user_id)
        return await DAO.mysql_query_old("user_list_search", sql, pushAr);
    } catch (error) {
        throw error;
    }
}


async function login_type_check(payload) {
    try {
        let sql = 'select * from tb_users where login_type = ? and login_id = ?'
        return await DAO.mysql_query("check login_type_check", sql, [payload.login_type, payload.login_id]);
    } catch (error) {
        throw error;
    }
}


async function notification_user_list(user, payload) {
    try {
        let value = [user.user_id]
        let sql = 'SELECT n.*,c.description,u.name as sender_name,u.profile_pic,u1.url FROM `tb_notification` as n ' +
            ' left join tb_case as c on n.case_id = c.case_id ' +
            ' left join tb_case_url as u1 on c.case_id = u1.case_id ' +
            ' left join tb_users as u on n.sender_id = u.user_id ' +
            ' WHERE (n.reciver_id = ? OR n.reciver_id IS NULL) '
        if (payload.type == "my") {
            sql += " and n.is_me = 1 "
        } else {
            sql += " and n.is_me = 0 "
        }
        sql += " group by n.notification_id order by n.notification_id desc"
        if (payload.limit) {
            sql += " limit ? "
            value.push(payload.limit)
        }
        if (payload.skip) {
            sql += "  OFFSET ? "
            value.push(payload.skip)

        }
        return await DAO.mysql_query("check notification_user_list", sql, value);
    } catch (error) {
        throw error;
    }
}

async function get_user_filter(payload) {
    try {
        let value = []
        let sql = 'select device_type,device_token from tb_users where is_deleted = 0  ';
        if (payload.type == "all") {

        } else if (payload.type == "surgeons") {
            sql += " and login_type IS NULL ";
        } else if (payload.type == "gps") {
            sql += " and login_type = ? "
            value.push("gps")
        } else if (payload.type == "okta") {
            sql += " and login_type = ? ";
            value.push("okta")
        } else {

        }
        return await DAO.mysql_query("get_user", sql, value);
    } catch (error) {
        throw error;
    }
}



async function forgot_password_otp(payload, userData) {

    try {
        let value = []
        let sql = 'UPDATE `tb_users` SET forgot_otp = ?';
        value.push(payload.forgot_otp || null)

        if (payload.password) {
            sql += ' , password = ? ';
            value.push(md5(payload.password))
        }
        sql += ' where user_id = ? ';
        value.push(userData.user_id)

        return await DAO.mysql_query("forgot_password_otp", sql, value);

    } catch (error) {
        throw error;
    }
}


async function reset_password(payload) {
    try {
        let sql = 'select * from tb_users where email = ? and forgot_otp = ?'
        return await DAO.mysql_query("reset_password", sql, [payload.email, payload.forgot_otp]);
    } catch (error) {
        throw error;
    }
}


async function notification_delete(payload) {
    try {
        let value = []
        let sql = 'DELETE FROM `tb_notification` where 	notification_id = ?';
        value.push(payload.notification_id)
        return await DAO.mysql_query("notification_delete", sql, value);

    } catch (error) {
        throw error;
    }
}

async function delete_case(payload, userData) {

    try {
        let sql = 'UPDATE `tb_case` SET is_deleted = 1  where  case_id = ? and user_id = ?  ';
        return await DAO.mysql_query("delete_case", sql, [payload.case_id || payload.old_case_id, userData.user_id]);

    } catch (error) {
        throw error;
    }
}
async function change_event_news(payload, userData) {
    try {
        let arrayPush = []
        let sql = 'update tb_users set '
        if (payload.type == "news") {
            sql += " news_noti  = ? "
            arrayPush.push(payload.is_on)
        } else {
            sql += "  event_noti = ? "
            arrayPush.push(payload.is_on)
        }

        sql += " where user_id = ? "
        arrayPush.push(userData.user_id)
        return await DAO.mysql_query("like_unlike_case_count", sql, arrayPush);


    } catch (error) {
        throw error;
    }


}

async function update_type(getUser, okta) {
    try {
        let sql = 'update tb_users set  login_type = ?   where user_id = ? '
        return await DAO.mysql_query("update_type", sql, [okta, getUser.user_id]);
    } catch (error) {
        throw error;
    }
}


async function logout(payload) {

    try {
        let value = []
        let sql = 'update tb_users set  access_token = null,device_token =null   where user_id = ? ';
        value.push(payload.user_id)
        return await DAO.mysql_query("logout", sql, value);

    } catch (error) {
        throw error;
    }
}

const get_event = async (userData, payload) => {
    let current_utc_time = moment().unix();
    let sql = "select e.* from tb_admin_event_attendees as uevent " +
        " left join tb_admin_event as e on e.event_id = uevent.event_id where uevent.user_id = ? and e.event_id IS NOT NULL and e.is_deleted = 0 and e.end_datetime >= ? order by e.start_datetime asc "
    let value = [userData.user_id, current_utc_time];
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

const get_event_details = async (userData, payload) => {
    let sql = "select * from tb_admin_event where event_id = ? and e.is_deleted = 0";
    let value = [payload.event_id];
    let data = await DAO.mysql_query("get_event_details", sql, value);
    if (data.length > 0) {
        data = data[0];
    } else {
        data = {};
    }
    return data;
}

module.exports = {
    create_user: create_user,
    get_user: get_user,
    otp_verify: otp_verify,
    get_user_phone: get_user_phone,
    create_token_customer: create_token_customer,
    upload_image: upload_image,
    update_profile: update_profile,
    check_email: check_email,
    check_username: check_username,
    update_otp: update_otp,
    contact_sync: contact_sync,
    insert_contact_sync: insert_contact_sync,
    check_friend_list: check_friend_list,
    check_token: check_token,
    online_update: online_update,
    last_seen_update: last_seen_update,
    delete_contact: delete_contact,
    email_send: email_send,
    check_user: check_user,
    update_token: update_token,
    doc_upload: doc_upload,
    case_url: case_url,
    get_case: get_case,
    like_unlike_case: like_unlike_case,
    delete_like: delete_like,
    check_like: check_like,
    get_like_case: get_like_case,
    like_unlike_case_count: like_unlike_case_count,
    report_user: report_user,
    check_report_user: check_report_user,
    check_mute: check_mute,
    mute_user: mute_user,
    delete_mute: delete_mute,
    check_follow: check_follow,
    follow_user: follow_user,
    delete_follow: delete_follow,
    update_username: update_username,
    follow_user_list: follow_user_list,
    block_unblock: block_unblock,
    update_notification: update_notification,
    user_list_search: user_list_search,
    login_type_check: login_type_check,
    notification_user_list: notification_user_list,
    get_user_filter: get_user_filter,
    forgot_password_otp: forgot_password_otp,
    reset_password: reset_password,
    notification_delete: notification_delete,
    delete_case: delete_case,
    change_event_news: change_event_news,
    update_type: update_type,
    logout: logout,
    get_users,
    get_case_caption_search,
    get_event,
    get_event_details,
    get_blocked_user,
    get_blocked_users,
    block_by_user,
    unblock_by_user
}

