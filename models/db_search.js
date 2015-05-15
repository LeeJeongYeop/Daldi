var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);

/*****************************/
/*			메뉴 검색		    */ 
/***************************/
exports.menu_search = function(data, done){
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
			var sql = "select m.menu_no, m.menu_name, m.menu_price, m.menu_image_1, c.cafe_no, c.cafe_name "
			+ "from wm_menu m, wm_cafe c "
			+ "where m.cafe_no = c.cafe_no and m.menu_name like ?";
			conn.query(sql, '%'+data+'%', function(err, row){
				if(err){  // 메뉴 검색 목록 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 목록 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 메뉴 검색 목록 OK
						done(check, row);
						conn.release();
					}else{  // 메뉴 검색 목록 DB 오류
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
/*			지역 검색		    */ 
/***************************/
exports.area_search = function(data, done){
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
			var sql = "select m.menu_no, m.menu_name, m.menu_price, m.menu_image_1, c.cafe_no, c.cafe_name "
			+ "from wm_menu m, wm_cafe c "
			+ "where m.cafe_no = c.cafe_no and c.cafe_area like ?";
			conn.query(sql, '%'+data+'%', function(err, row){
				if(err){  // 지역 검색 목록 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 목록 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 지역 검색 목록 OK
						done(check, row);
						conn.release();
					}else{  // 지역 검색 목록 DB 오류
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
/*		지역, 메뉴 검색		    */ 
/***************************/
exports.area_menu_search = function(data, done){
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
			var sql = "select m.menu_no, m.menu_name, m.menu_price, m.menu_image_1, c.cafe_no, c.cafe_name "
			+ "from wm_menu m, wm_cafe c "
			+ "where m.cafe_no = c.cafe_no and c.cafe_area like ?";
			conn.query(sql, '%'+data+'%', function(err, row){
				if(err){  // 지역 검색 목록 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 목록 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 지역 검색 목록 OK
						done(check, row);
						conn.release();
					}else{  // 지역 검색 목록 DB 오류
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
/*		  카페 검색		    */ 
/***************************/
exports.cafe_search = function(data, done){
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
			var sql = "select m.menu_no, m.menu_name, m.menu_price, m.menu_image_1, c.cafe_no, c.cafe_name "
			+ "from wm_menu m, wm_cafe c "
			+ "where m.cafe_no = c.cafe_no and c.cafe_name like ?";
			conn.query(sql, '%'+data+'%', function(err, row){
				if(err){  // 카페 검색 목록 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 팁 목록 DB 입력시 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 카페 검색 목록 OK
						done(check, row);
						conn.release();
					}else{  // 카페 검색 목록 DB 오류
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