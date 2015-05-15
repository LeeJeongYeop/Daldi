var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);

/*****************************/
/*			카페 리스트	    */ 
/***************************/
exports.compare = function(done){
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
			var sql = "select cafe_no, cafe_name, cafe_kind from wm_cafe";
			conn.query(sql, function(err, row){
				if(err){  // 카페 리스트 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "카페 리스트 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 카페 리스트 OK
						done(check, row);
						conn.release();
					}else{  // 카페 리스트 DB 오류
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
/*		카페 메뉴 리스트	    */ 
/***************************/
exports.compare_list = function(data, done){
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
			var sql = "select menu_no, menu_name, menu_price, menu_image_1, menu_category from wm_menu where cafe_no=?";
			conn.query(sql, data,function(err, row){
				if(err){  // 카페 리스트 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "카페 리스트 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 카페 리스트 OK
						done(check, row);
						conn.release();
					}else{  // 카페 리스트 DB 오류
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

