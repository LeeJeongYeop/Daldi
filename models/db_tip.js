var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);

/*****************************/
/*			팁 목록 		    */ 
/***************************/
exports.tip_list = function(data, done){
	var check = true;
	var msg = "";

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			logger.info('data', data);
			var sql = "select m.menu_no, m.menu_name, t.tip_no, t.tip_title, date_format(t.tip_regdate,'%Y-%m-%d') tip_regdate "
			+ "from wm_menu m, wm_menu_tip t "
			+ "where m.menu_no = t.menu_no and t.user_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 메뉴 팁 목록 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 목록 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 메뉴 팁 목록 OK
						done(check, row);
						conn.release();
					}else{  // 메뉴 팁 목록 DB 오류
						check = false;
						msg = "DB 오류 다시 시도해주세요.";
						done(check, msg);
						conn.release();
					}
				}
			});	
		}
	});
};

/*****************************/
/*			팁 삭제 		    */ 
/***************************/
exports.tip_delete = function(data, done){
	var check = true;
	var msg = "";

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			logger.info('data', data);
			var sql = "delete from wm_menu_tip where tip_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 메뉴 팁 삭제 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 삭제 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row.affectedRows == 1){  // 메뉴 팁 삭제 OK
						msg = "Tip Delete Success";
						done(check, msg);
						conn.release();
					}else{  // 메뉴 팁 삭제 DB 오류
						check = false;
						msg = "DB 오류 다시 시도해주세요.";
						done(check, msg);
						conn.release();
					}
				}
			});	
		}
	});
};