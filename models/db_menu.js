var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var fs = require('fs');
var async = require('async');

/*****************************/
/*			별점 추가 		    */ 
/***************************/
exports.star_add = function(data, done){
	var check = true;
	var msg = "";
	var data_input = [data[0], data[1]];
	var user_gender = data[2];
	logger.info('user_gender', user_gender);

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 별점 중복 검사
			logger.info('data_input', data_input);
			var sql = "select count(*) cnt from wm_menu_star where user_no=? and menu_no=?";
			conn.query(sql, data_input, function(err, row){
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
							var sql_man = "insert into wm_menu_star(user_no, menu_no, star_man, star_regdate) values(?,?,1,now())";
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
							var sql_woman = "insert into wm_menu_star(user_no, menu_no, star_woman, star_regdate) values(?,?,1,now())";
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
					var sql = "select m.menu_no, m.menu_name, m.menu_englishname, m.menu_information, m.menu_price, "
					+ "c.cafe_name, c.cafe_tel, c.cafe_address, c.cafe_open, c.cafe_close, c.cafe_lat, c.cafe_lon "
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
					var sql = "select SUM(s.star_man) star_man, SUM(s.star_woman) star_woman "
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
					var keyword = [];
					var sql = "select FIELD(GREATEST(kw1, kw2, kw3, kw4, kw_f1), kw1, kw2, kw3, kw4, kw_f1) idx_1, "
					+ "FIELD(GREATEST(kw5, kw6, kw7, kw8, kw_f2), kw5, kw6, kw7, kw8, kw_f2) idx_2, "
					+ "FIELD(GREATEST(kw9, kw10, kw11, kw_f3), kw9, kw10, kw11, kw_f3) idx_3, "
					+ "FIELD(GREATEST(kw12, kw13, kw14, kw_f4), kw12, kw13, kw14, kw_f4) idx_4 "
					+ "from wm_menu_keyword "
					+ "where menu_no=?"
					conn.query(sql, data, function(err, kw_row){
						if(err){
							logger.info("keyword 에러");
							callback(err);
						}else{
							logger.info("kw_row", kw_row);
							switch(kw_row[0].idx_1){
								case 1 : keyword.push(0); break;
								case 2 : keyword.push(1); break;
								case 3 : keyword.push(2); break;
								case 4 : keyword.push(3); break;
								case 5 : keyword.push(100); break;
							}
							switch(kw_row[0].idx_2){
								case 1 : keyword.push(4); break;
								case 2 : keyword.push(5); break;
								case 3 : keyword.push(6); break;
								case 4 : keyword.push(7); break;
								case 5 : keyword.push(100); break;
							}
							switch(kw_row[0].idx_3){
								case 1 : keyword.push(8); break;
								case 2 : keyword.push(9); break;
								case 3 : keyword.push(10); break;
								case 4 : keyword.push(100); break;
							}
							switch(kw_row[0].idx_4){
								case 1 : keyword.push(11); break;
								case 2 : keyword.push(12); break;
								case 3 : keyword.push(13); break;
								case 4 : keyword.push(100); break;
							}
						}
						logger.info("keyword", keyword);
						callback(null, row1, menu_img, cafe_img, row2, star, keyword);
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
	+ "where menu_no = ? and tip_cnt = (select MAX(tip_cnt) from wm_menu_tip where menu_no = ? ) "
	+ "order by tip_regdate desc limit 1 "
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
};

exports.keyword_select = function(data, done){
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
			async.series([
				function(callback){
					var sql = "select "+ data[1] +" from wm_menu_keyword where menu_no = ?";
					conn.query(sql, data[0], function(err, row){
						if(err){  // 메뉴 사용사 사진 리스트 DB 입력 오류
							msg = "DB 입력 오류";
							callback(err, msg);
						}else{
							logger.info('row', row);
							var sql = "update wm_menu_keyword set "+data[1]+"="+data[1]+"+1 where menu_no = ?";
							conn.query(sql, data[0], function(err, row){
								if(row.affectedRows == 1){
									logger.info('row', row);
									callback(null);
								}else{
									check = false;
									done(check, result);
									conn.release();
								}
							});
						}
					});
				},
				function(callback){
					var sql = "select "+ data[2] +" from wm_menu_keyword where menu_no = ?";
					conn.query(sql, data[0], function(err, row){
						if(err){  // 메뉴 사용사 사진 리스트 DB 입력 오류
							msg = "DB 입력 오류";
							callback(err, msg);
						}else{
							logger.info('row', row);
							var sql = "update wm_menu_keyword set "+data[2]+"="+data[2]+"+1 where menu_no = ?";
							conn.query(sql, data[0], function(err, row){
								if(row.affectedRows == 1){
									logger.info('row', row);
									callback(null);
								}else{
									check = false;
									done(check, result);
									conn.release();
								}
							});
						}
					});
				},
				function(callback){
					var sql = "select "+ data[3] +" from wm_menu_keyword where menu_no = ?";
					conn.query(sql, data[0], function(err, row){
						if(err){  // 메뉴 사용사 사진 리스트 DB 입력 오류
							msg = "DB 입력 오류";
							callback(err, msg);
						}else{
							logger.info('row', row);
							var sql = "update wm_menu_keyword set "+data[3]+"="+data[3]+"+1 where menu_no = ?";
							conn.query(sql, data[0], function(err, row){
								if(row.affectedRows == 1){
									logger.info('row', row);
									callback(null);
								}else{
									check = false;
									done(check, result);
									conn.release();
								}
							});
						}
					});
				},
				function(callback){
					var sql = "select "+ data[4] +" from wm_menu_keyword where menu_no = ?";
					conn.query(sql, data[0], function(err, row){
						if(err){  // 메뉴 사용사 사진 리스트 DB 입력 오류
							msg = "DB 입력 오류";
							callback(err, msg);
						}else{
							logger.info('row', row);
							var sql = "update wm_menu_keyword set "+data[4]+"="+data[4]+"+1 where menu_no = ?";
							conn.query(sql, data[0], function(err, row){
								if(row.affectedRows == 1){
									logger.info('row', row);
									callback(null);
								}else{
									check = false;
									done(check, result);
									conn.release();
								}
							});
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
						msg = "Keyword Select Success";
						done(check, msg);
						conn.release();
					}
				});
		}
	});
};

/*****************************/
/*		메뉴 사용자 사진 	    */
/***************************/
exports.user_img = function(data, done){
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
			var sql = "select user_no, img_no, img_img from wm_menu_user_img where menu_no = ?";
			conn.query(sql, data, function(err, row){
				if(err){  // 메뉴 사용사 사진 리스트 DB 입력 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 사용사 사진 리스트 DB 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					done(check, row);
					conn.release();
				}
			});
		}
	});
};

/*****************************/
/*		메뉴 사용자 사진 추가	    */
/***************************/
exports.user_img_add = function(data, done){
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
			logger.info('data',data);
			var sql = "insert into wm_menu_user_img(user_no, menu_no, img_img) values(?,?,?)";
			conn.query(sql, data, function(err, row){
				if(err){  // 메뉴 사진 추가 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴 사진 추가 DB 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row.affectedRows == 1){ //메뉴 사용자 사진 추가 ok
						msg = "Menu User Image Add Success";
						done(check, msg);
						conn.release();
					}else{  //메뉴 사용자 사진 추가 DB 오류
						check = false;
						msg = "메뉴판 사용자 사진 추가 DB 오류";
						done(check, msg);
						conn.release();
					}
				}
			});
		}
	});
};

/*****************************/
/*		메뉴 사용자 사진 삭제     */
/***************************/
exports.user_img_delete = function(data, done){
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
					logger.info('data',data);
					var sql = "select count(*) cnt from wm_menu_user_img where user_no=? and img_no=?";
					conn.query(sql, data, function(err, count){
						if(err){
							msg = "사진 등록자 확인 DB 입력 오류";
							callback(err, msg);
						}else{
							callback(null, count);
						}
					});
				},
				function(count, callback){
					logger.info('count[0].cnt', count[0].cnt);
					if(count[0].cnt == 1){
						var sql  = "select img_img from wm_menu_user_img where img_no=?";
						conn.query(sql, data[1], function(err, img){
							if(err){
								msg = "기존 메뉴 사진 불러올 때 데이터 입력 오류";
								callback(err, msg);
							}else{
								callback(null, img);
							}
						});
					}else{
						logger.info('count[0].cnt', count[0].cnt);
						msg = "사진 등록자가 아닙니다.";
						callback(err, msg);
					}
				},
				function(img, callback){
					logger.info('img', img);
					if(img[0].img_img){
						var pathArr = img[0].img_img.split('/');
						var fileName = pathArr[pathArr.length-1];
						var filePath = "./public/images/menu_user/"+fileName;
						fs.unlink(filePath, function(err){
							if(err){
								msg = "메뉴 사진 파일 삭제 에러";
								callback(err, msg);
							}else{
								var sql= "delete from wm_menu_user_img where img_no=?";
								conn.query(sql, data[1], function(err, row){
									if(err){
										msg = "메뉴 사진 DB 삭제 에러";
										callback(err, msg);
									}else{
										if(row.affectedRows == 1){
											msg = "Menu User Image Delete Success";
											callback(null, msg);
										}else{
											msg = "메뉴 사진 삭제 에러";
											callback(err, msg);
										}
									}
								});
							}
						});
					}else{
						msg = "사진 등록된 경로 에러";
						callback(err, msg);
					}
				}
				],
				function(err, result){
					if(err){
						logger.error(err);
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