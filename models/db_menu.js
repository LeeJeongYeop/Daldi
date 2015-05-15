var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);

/*****************************/
/*			별점 추가 		    */ 
/***************************/
exports.star_add = function(data, done){
	var check = true;
	var msg = "";
	var data_check = [data[0], data[1]];
	var data_input = [data[0], data[1], data[2]];
	var user_gender = data[3];
	logger.info('user_gender', user_gender);

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 별점 중복 검사
			logger.info('data_check', data_check);
			var sql = "select count(*) cnt from wm_menu_star where user_no=? and menu_no=?";
			conn.query(sql, data_check, function(err, row){
				if(err){  // 별점 중복 검사 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴판 중복 검사 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info('check point', row[0].cnt);
					if(row[0].cnt == 0){  // 중복되지 않음
						logger.info('user_gender', user_gender);
						if(user_gender == 0){
							logger.info('data_input', data_input);
							var sql_man = "insert into wm_menu_star(user_no, menu_no, star_man, star_regdate) values(?,?,?,now())";
							conn.query(sql_man, data_input, function(err, row_man){
							if(err){  // 메뉴 남자 별점 주기 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "메뉴 남자 별점 주기 DB 입력시 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row_man', row_man);
								if(row_man.affectedRows == 1){  // 메뉴에 남자 별점 주기 OK
									msg = "Menu Man Star Add Success";
									done(check, msg);
									conn.release();
								}else{  // 메뉴에 남자 별점 주기 DB 오류
									check = false;
									msg = "DB 오류 다시 시도해주세요.";
									done(check, msg);
									conn.release();
								}
							}
						});
						}else{
							var sql_woman = "insert into wm_menu_star(user_no, menu_no, star_woman, star_regdate) values(?,?,?,now())";
							conn.query(sql_woman, data_input, function(err, row_woman){
							if(err){  // 메뉴 여자 별점 주기 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "메뉴 여자 별점 주기 DB 입력시 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row_woman', row_woman);
								if(row_woman.affectedRows == 1){  // 메뉴에 여자 뱔잠 주기 OK
									msg = "Menu Woman Star Add Success";
									done(check, msg);
									conn.release();
								}else{  // 메뉴에 여자 별점 주기 DB 오류
									check = false;
									msg = "DB 오류 다시 시도해주세요.";
									done(check, msg);
									conn.release();
								}
							}							
						});
						}
					}else{  // 이미 별점을 메긴 메뉴입니다.
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "이미 별점을 메긴 메뉴입니다.";
						done(check, msg);
						conn.release();
					}
				}
			});		
}
});
};

/*****************************/
/*			별점 삭제		    */ 
/***************************/
exports.star_delete = function(data, done){
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
			var sql = "select count(*) cnt from wm_menu_star where user_no=? and menu_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 별점 여부 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "별점 여부 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info('check point', row[0].cnt);
					if(row[0].cnt == 1){  // 별점 매긴 상태
						logger.info('data', data);
						var sql = "delete from wm_menu_star where user_no=? and menu_no=?";
						conn.query(sql, data, function(err, row){
							if(err){  // 메뉴 별점 삭제 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "메뉴 별점 삭제 DB 입력시 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row', row);
								if(row.affectedRows == 1){  // 메뉴에 별점 삭제
									msg = "Menu Star Delete Success";
									done(check, msg);
									conn.release();
								}else{  // 메뉴에 별점 삭제 DB 오류
									check = false;
									msg = "메뉴에 별점 삭제 DB 오류.";
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{  // 별점을 메기지 않은 메뉴입니다.
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "별점을 메기지 않은 메뉴입니다.";
						done(check, msg);
						conn.release();
					}
				}
			});	
}
});
};

/*****************************/
/*		메뉴 상세 정보 		    */ 
/***************************/
exports.detail = function(data, done){
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
			var sql = "select umb.umb_title, m.menu_no, m.menu_name, m.menu_image_1, m.menu_price, c.cafe_name, um.umenu_no "
			+ "from wm_user_menu_board umb, wm_cafe c, wm_menu m, wm_user_menu um "
			+ "where um.umb_no = umb.umb_no and um.menu_no=m.menu_no and c.cafe_no=m.cafe_no and umb.umb_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 내 메뉴판 메뉴 리스트 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "내 메뉴판 메뉴 리스트 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 내 메뉴판 메뉴 리스트 OK
						done(check, row);
						conn.release();
					}else{  // 내 메뉴판 메뉴 리스트 DB 오류
						check = false;
						msg = "DB 오류 다시 시도해주세요.";
						done(check, msg);
						conn.release();
					}
				}
			});
		}
	});	
}

/*****************************/
/*			팁 추가 		    */ 
/***************************/
exports.tip_write = function(data, done){
	var check = true;
	var msg = "";
	var data_check = [data[0], data[1]];

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 팁 중복 검사
			logger.info('data_check', data_check);
			var sql = "select count(*) cnt from wm_menu_tip where user_no=? and menu_no=?";
			conn.query(sql, data_check, function(err, row){
				if(err){  // 팀 중복 검사 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "팁 중복 검사 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info('check point', row[0].cnt);
					if(row[0].cnt == 0){  // 중복되지 않음
						logger.info('data', data);
						var sql = "insert into wm_menu_tip(user_no, menu_no, tip_title, tip_regdate) values(?,?,?,now())";
						conn.query(sql, data, function(err, row){
							if(err){  // 메뉴 남자 별점 주기 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "메뉴 팁 추가 DB 입력시 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row', row);
								if(row.affectedRows == 1){  // 메뉴 팁 추가 OK
									msg = "Tip Add Success";
									done(check, msg);
									conn.release();
								}else{  // 메뉴 팁 추가 DB 오류
									check = false;
									msg = "DB 오류 다시 시도해주세요.";
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{  // 이미 팁을 남긴 메뉴입니다.
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "이미 팁을 남긴 메뉴입니다.";
						done(check, msg);
						conn.release();
					}
				}
			});		
}
});
};

/*****************************/
/*			팁 수정 		    */ 
/***************************/
exports.tip_update = function(data, done){
	var check = true;
	var msg = "";
	var data_check = [data[0], data[1]];
	var data_input = [data[2], data[1]];

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 본인 확인
			logger.info('data_check', data_check);
			var sql = "select count(*) cnt from wm_menu_tip where user_no=? and tip_no=?";
			conn.query(sql, data_check, function(err, row){
				if(err){  // 본인 확인 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "본인 확인 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info('check point', row[0].cnt);
					if(row[0].cnt == 1){  // 본인 확인
						logger.info('data', data);
						var sql = "update wm_menu_tip set tip_title=? where tip_no=?";
						conn.query(sql, data_input, function(err, row){
							if(err){  // 메뉴 남자 별점 주기 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "팁 수정 시 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row', row);
								if(row.affectedRows == 1){  // 팁 수정 OK
									msg = "Tip Update Success";
									done(check, msg);
									conn.release();
								}else{  // 메뉴 팁 수정 DB 오류
									check = false;
									msg = "DB 오류 다시 시도해주세요.";
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{  // 본인이 남긴 팁이 아닙니다.
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "본인이 남긴 팁이 아닙니다.";
						done(check, msg);
						conn.release();
					}
				}
			});		
}
});
};
