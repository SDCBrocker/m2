const DAO = require('../DAO/mysql');

const get_events = async (payload) => {
    let sql = `select e.* from tb_admin_event as e where 
        (reminder1_datetime >= ${payload.start_time} and reminder1_datetime < ${payload.end_time})
        OR (reminder2_datetime >= ${payload.start_time} and reminder2_datetime < ${payload.end_time})`;
    let events = await DAO.mysql_query("get_events", sql, []);
    if (events == 0) {
        events = [];
    }
    return events;
}

const get_attendees = async (event_id) => {
    let sql = "select u.* from tb_admin_event_attendees as attendees " +
        " left join tb_users as u on u.user_id = attendees.user_id where event_id = ?"
    let value = [event_id];
    let events = await DAO.mysql_query("get_events", sql, value);
    if (events == 0) {
        events = [];
    }
    return events;
}

module.exports = {
    get_events,
    get_attendees
}

