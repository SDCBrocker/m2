const DAO = require('../DAO/mysql');
const md5 = require('md5');



const  create_user_admin =  async (payload) =>{
    try {
        let sql3 = 'select * from `tb_admin`';
        let result =  await DAO.mysql_query("create_user_admin",sql3 ,[]);
        if(result && result.length == 0){
            let sql = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
            await DAO.mysql_query("create_user_admin",sql ,['akash.timt@gmail.com','name',md5('akash@123')]);
            let sql1 = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
             await DAO.mysql_query("create_user_admin",sql1 ,['tps.teji@gmail.com','teji',md5('teji@123')]);
            let sql2 = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
            return await DAO.mysql_query("create_user_admin",sql2 ,['info@chime.com','chime',md5('chime@123')]);
        } else {
            return 0
        }
        let sql = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
         await DAO.mysql_query("create_user_admin",sql ,['akash.timt@gmail.com','name',md5('akash@123')]);
        let sql1 = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
         await DAO.mysql_query("create_user_admin",sql1 ,['tps.teji@gmail.com','teji',md5('teji@123')]);
        let sql2 = 'INSERT INTO `tb_admin`(`email`,`name`,`password`) VALUES (?,?,?)';
        return await DAO.mysql_query("create_user_admin",sql2 ,['info@chime.com','chime',md5('chime@123')]);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    create_user_admin: create_user_admin
}