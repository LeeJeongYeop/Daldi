var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var async = require('async');

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
			async.waterfall([
				function(callback){
					var sql = "select m.menu_no, m.menu_name, m.menu_information, m.menu_price, "
					+ "c.cafe_name, c.cafe_tel, c.cafe_address, c.cafe_open, c.cafe_close, c.cafe_out_img, c.cafe_in_img, c.cafe_img "
					+ "from wm_cafe c, wm_menu m "
					+ "where c.cafe_no=m.cafe_no and m.menu_no=?";
					conn.query(sql, data, function(err, row1){
						if(err){
							logger.info("row1 에러");
							callback(err);
						}else{
							logger.info("row1 ", row1);
							callback(null, row1);
						}
					});
				},
				function(row1, callback){
					var sql = "select menu_image_1, menu_image_2, menu_image_3, menu_image_4 "
					+ "from wm_menu "
					+ "where menu_no = ?";
					conn.query(sql, data, function(err, menu_img){
						if(err){
							logger.info("menu_img 에러");
							callback(err);
						}else{
							var img = [];
							img.push(menu_img[0].menu_image_1);
							img.push(menu_img[0].menu_image_2);
							img.push(menu_img[0].menu_image_3);
							img.push(menu_img[0].menu_image_4);
							logger.info("menu_img ", img);
							callback(null, row1, img);
						}
					});
				},
				function(row1, menu_img, callback){
					var sql = "select cafe_in_img, cafe_out_img, cafe_img "
					+ "from wm_cafe "
					+ "where cafe_no = ( select cafe_no from wm_menu where menu_no = ? )";
					conn.query(sql, data, function(err, cafe_img){
						if(err){
							logger.info("cafe_img 에러");
							callback(err);
						}else{
							var img = [];
							img.push(cafe_img[0].cafe_in_img);
							img.push(cafe_img[0].cafe_out_img);
							img.push(cafe_img[0].cafe_img);
							logger.info("cafe_img ", img);
							callback(null, row1, menu_img, img);
						}
					});
				},
				function(row1, menu_img, cafe_img, callback){
					var sql = "select menu_name, menu_price, menu_image_1 "
					+ "from wm_menu "
					+ "where cafe_no = ( select cafe_no from wm_menu where menu_no = ? )";
					conn.query(sql, data, function(err, row2){
						if(err){
							logger.info("row2 에러");
							callback(err);
						}else{
							logger.info("row2 ", row2);
							callback(null, row1, menu_img, cafe_img, row2);
						}
					});
				},
				function(row1, menu_img, cafe_img, row2, callback){
					var sql = "select AVG(s.star_man) star_man, AVG(s.star_woman) star_woman "
					+ "from wm_menu_star s, wm_menu m "
					+ "where s.menu_no=m.menu_no and m.menu_no = ?"
					conn.query(sql, data, function(err, star){
						if(err){
							logger.info("star 에러");
							callback(err);
						}else{
							logger.info("star", star);
							callback(null, row1, menu_img, cafe_img, row2, star);
						}
					});
				},
				function(row1, menu_img, cafe_img, row2, star, callback){
					var sql = "select keyword_1, keyword_2, keyword_3, keyword_4, keyword_5, keyword_6, keyword_7, keyword_8, keyword_9, keyword_10, keyword_11, keyword_12 "
					+ "from wm_menu_keyword "
					+ "where menu_no=?"
					conn.query(sql, data, function(err, keyword){
						if(err){
							logger.info("keyword 에러");
							callback(err);
						}else{
							logger.info("keyword", keyword);
							callback(null, row1, menu_img, cafe_img, row2, star, keyword);
						}
					});
				},
				function(row1, menu_img, cafe_img, row2, star, keyword, callback){
					var sql = "select tip_no, tip_title, date_format(tip_regdate,'%Y-%m-%d') tip_regdate, tip_cnt "
					+ "from wm_menu_tip "
					+ "where menu_no = ?";
					conn.query(sql, [data, data], function(err, tip){
						if(err){
							logger.info("tip 에러");
							callback(err);
						}else{
							logger.info("tip", tip);
							callback(null, row1, menu_img, cafe_img, row2, star, keyword, tip);
						}
					});
				},
				function(row1, menu_img, cafe_img, row2, star, keyword, tip, callback){
					var sql = "select tip_no, tip_title, date_format(tip_regdate,'%Y-%m-%d') tip_regdate, tip_cnt "
					+ "from wm_menu_tip "
					+ "where menu_no = ? and tip_cnt = (select MAX(tip_cnt) from wm_menu_tip where menu_no = ? )"
					conn.query(sql, [data, data], function(err, best_tip){
						if(err){
							logger.info("best_tip 에러");
							callback(err);
						}else{
							logger.info("best_tip", best_tip);
							callback(null, row1, menu_img, cafe_img, row2, star, keyword, tip, best_tip);
						}
					});
				}
				],
				function(err, row1, menu_img, cafe_img, row2, star, keyword, tip, best_tip, callback){
					if(err){
						logger.error('err', err);
						check = false;
						msg = "메뉴 자세히 보기 DB 입력 오류";
						done(check);
						conn.release();
					}else{
						done(check, row1, menu_img, cafe_img , row2, star, keyword, tip, best_tip);
						conn.release();
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


/*****************************/
/*			팁 좋아요 		    */
/***************************/
exports.tip_like = function(data, done){
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
			async.waterfall([
				function(callback){ // 팁 좋아요 중복 검사
					var sql = "select count(*) cnt from wm_menu_tip_like where user_no=? and tip_no=?";
					conn.query(sql, data, function(err, row){
						if(err){
							msg = "팀 좋아요 중복 검사 데이터 입력 오류";
							callback(err, msg);
						}else{
							if(row[0].cnt==1){
								msg="이미 좋아요를 한 팁입니다.";
								callback(check, msg);
							}else{
								callback(null);
							}
						}
					});
				},
				function(callback){
					var sql = "insert into wm_menu_tip_like(user_no, tip_no, tip_like_regdate) values(?,?,now())";
					conn.query(sql, data, function(err, row){
						if(err){
							msg = "팁 좋아요 데이터 입력 오류";
							callback(err, msg);
						}else{
							if(row.affectedRows == 1){
								var sql_cnt = "update wm_menu_tip set tip_cnt=tip_cnt+1 where tip_no=?";
								conn.query(sql_cnt, data[1], function(err, row_cnt){
									if(err){
										msg = "팁 좋아요 증가 데이터 입력 오류";
										callback(err, msg);
									}else{
										if(row_cnt.affectedRows == 0){
											msg = "DB 입력 오류";
											callback(err, msg);
										}else{
											msg = "Tip Like Success";
											callback(null, msg);
										}
									}
								});
							}else{
								msg = "DB 입력 오류";
								callback(err, msg);
							}
						}
					});
				}
				],
				function(err, result){
					if(err){
						check = false;
						done(check, result);
						conn.release();
					}else{
						logger.info('check', check);
						done(check, result);
						conn.release();
					}
				});
}
});
};

/*****************************/
/*		팁 좋아요 삭제 		    */
/***************************/
exports.tip_like_delete = function(data, done){
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
			var sql = "delete from wm_menu_tip_like where user_no=? and tip_no=?";
			conn.query(sql, data, function(err, row){
				if(err){
					logger.error('err',err);
					check = false;
					msg = "팁 좋아요 삭제 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					if(row.affectedRows == 1){
						var sql_cnt = "update wm_menu_tip set tip_cnt=tip_cnt-1 where tip_no=?";
						conn.query(sql_cnt, data[1], function(err, row_cnt){
							if(err){
								logger.error('err',err);
								check = false;
								msg = "팁 좋아요 갯수 감소 데이터 입력 오류";
								done(check, msg);
								conn.release();
							}else{
								if(row_cnt.affectedRows == 1){
									msg = "Tip Like Delete Success";
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{
						logger.error('err',err);
						check = false;
						msg = "DB 입력 오류";
						done(check, msg);
						conn.release();
					}
				}
			});
		}
	});	
}

/*****************************/
/*		메뉴 사용자 사진 	    */
/***************************/
exports.user_img = function(data, done){
	var check = true;
	var msg = "";	
}

/*****************************/
/*		메뉴 사용자 사진 추가	    */
/***************************/
exports.user_img_add = function(data, done){
	var check = true;
	var msg = "";
}