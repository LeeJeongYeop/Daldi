var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var fs = require('fs');
var async = require('async');

/*****************************/
/*			회원메뉴판추가	    */ 
/***************************/
exports.board_add = function(data, done){
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
		}else{  // 내 메뉴판 중복 검사
			logger.info(data);
			var sql = "insert into wm_user_menu_board(user_no, umb_title, umb_img, umb_regdate) values(?,?,?,now())";
			conn.query(sql, data, function(err, row){
				if(err){  // 내 메뉴판  DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "내 메뉴판 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row.affectedRows == 1){  // 내 메뉴판 추가 OK
						msg = "Board Add Success";
						done(check, msg);
						conn.release();
					}else{  // 내 메뉴판 추가 DB 오류
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
/*			회원메뉴판삭제	    */ 
/***************************/
exports.board_delete = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 내 메뉴판 유효 검사
			var sql = "select count(*) cnt from wm_user_menu_board where umb_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 내 메뉴판 유효 검사 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "메뉴판 유효 검사 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info(row[0].cnt);
					if(row[0].cnt == 1){  // 내 메뉴판이 유효함
						var sql = "select umb_img from wm_user_menu_board where umb_no=?";
						conn.query(sql, data, function(err, row){
							if(err){  // 내 메뉴판 이미지 삭제 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "내 메뉴판 이미지 삭제 DB 입력 오류";
								done(check ,msg);
								conn.release();
							}else{
								var pathArr = row[0].umb_img.split('/');
								var fileName = pathArr[pathArr.length-1];
								var filePath = "./public/images/umenu_board/"+fileName;
								logger.info('fileName', fileName);
								fs.unlink(filePath, function(err){
									if(err){ logger.error('err',err); }
									var sql = "delete from wm_user_menu_board where umb_no=?";
									conn.query(sql, data, function(err, row){
										if(err){  // 내 메뉴판  DB 입력시 오류
											logger.error('err', err);
											check = false;
											msg = "내 메뉴판 DB 입력 오류";
											done(check ,msg);
											conn.release();
										}else{
											logger.info('row', row);
											if(row.affectedRows == 1){  // 내 메뉴판 삭제 OK
												msg = "Board Delete Success";
												done(check, msg);
												conn.release();
											}else{  // 내 메뉴판 삭제 DB 오류
												check = false;
												msg = "DB 오류 다시 시도해주세요.";
												done(check, msg);
												conn.release();
											}
										}
									});
								});
							}
						});
					}else{  // 내 메뉴판이 없음
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "존재하지 않는 메뉴판 입니다.";
						done(check, msg);
						conn.release();
					}
				}
			});
}
});
};

/*****************************/
/*			회원메뉴판수정뷰	    */ 
/***************************/
exports.board_modify_view = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 내 메뉴판 유효 검사
			async.waterfall([
				function(callback){
					var sql = "select count(*) cnt from wm_user_menu_board where umb_no=?";
					conn.query(sql, data, function(err, row){
						if(err){
							msg = "메뉴판 유효 검사 데이터 입력 오류";
							callback(err, msg);
						}else{
							callback(null, row, data);
						}
					});
				},
				function(row, data, callback){
					if(row[0].cnt == 1){
						var sql = "select umb_no, umb_title, umb_img from wm_user_menu_board where umb_no=?";
						conn.query(sql, data, function(err, row){
							if(err){
								msg = "메뉴판 정보 검색 DB 입력 오류";
								callback(err, msg);
							}else{
								callback(null, row);
							}
						});
					}else{
						msg = "메뉴판이 존재하지 않습니다.";
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
						done(check, result);
						conn.release();
					}
				});
		}
	});
};

/*****************************/
/*			회원메뉴판수정	    */ 
/***************************/
exports.board_modify = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 내 메뉴판 유효 검사
			if(data.length == 3){  // 사진 변경 할때
				async.waterfall([
					function(callback){
						var sql = "select count(*) cnt from wm_user_menu_board where umb_no=?";
						conn.query(sql, data[2], function(err, row){	
							if(err){
								msg = "메뉴판 유효 검사 데이터 입력 오류";
								callback(err, msg);
							}else{
								callback(null, data, row);
							};
						});
					},
					function(data, row, callback){
						if(row[0].cnt == 1){
							var sql  = "select umb_img from wm_user_menu_board where umb_no=?";
							conn.query(sql, data[2], function(err, row){
								if(err){
									msg = "기존 메뉴판 사진 불러올 때 데이터 입력 오류";
									callback(err, msg);
								}else{
									callback(null, data, row);
								}
							});
						}else{
							msg = "메뉴판이 존재하지 않습니다.";
							callback(err, msg);
						}
					},
					function(data, row, callback){
						logger.info('row', row);
						if(row[0].umb_img){
							var pathArr = row[0].umb_img.split('/');
							var fileName = pathArr[pathArr.length-1];
							var filePath = "./public/images/umenu_board/"+fileName;
							fs.unlink(filePath, function(err){
								if(err){
									msg = "기존 메뉴판 사진 삭제 오류";
									callback(err, msg);
								}else{
									var sql = "update wm_user_menu_board set umb_title=?, umb_img=? where umb_no=?";
									conn.query(sql, data, function(err, row){
										logger.info(row);
								if(row.affectedRows == 1){  // 내 메뉴판 수정 OK
									msg = "Board Update Success";
									callback(null, msg);
								}else{  // 내 메뉴판 수정 DB 오류
									msg = "내 메뉴판 수정 DB 오류";
									callback(err, msg);
								}
							});
								}
							});
						}else{
							var sql = "update wm_user_menu_board set umb_title=?, umb_img=? where umb_no=?";
							conn.query(sql, data, function(err, row){
								logger.info(row);
							if(row.affectedRows == 1){  // 내 메뉴판 수정 OK
								msg = "Board Update Success";
								callback(null, msg);
							}else{  // 내 메뉴판 수정 DB 오류
								msg = "내 메뉴판 수정 DB 오류";
								callback(err, msg);
							}
						});
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
}else{  // 사진 변경 안할때
	async.waterfall([
		function(callback){
			var sql = "select count(*) cnt from wm_user_menu_board where umb_no=?";
			conn.query(sql, data[1], function(err, row){	
				if(err){
					msg = "메뉴판 유효 검사 데이터 입력 오류";
					callback(err, msg);
				}else{
					callback(null, data, row);
				};
			});
		},
		function(data, row, callback){
			if(row[0].cnt == 1){
				var sql  = "update wm_user_menu_board set umb_title=? where umb_no=?";
				conn.query(sql, data, function(err, row){
					if(err){
						msg = "사진 안보내는 메뉴판 업데이트 오류";
						callback(err, msg);
					}else{
						if(row.affectedRows == 1){  // 내 메뉴판 수정 OK
							msg = "Board Update Success";
							callback(null, msg);
							}else{  // 내 메뉴판 수정 DB 오류
								msg = "내 메뉴판 수정 DB 오류";
								callback(err, msg);
							}
						}
					});
			}else{
				msg = "메뉴판이 존재하지 않습니다.";
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
}
});
};

/*****************************/
/*			회원메뉴판리스트	    */ 
/***************************/
exports.board_list = function(data, done){
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
			var sql = "select umb_no, umb_title, umb_img, date_format(umb_regdate,'%Y-%m-%d') umb_regdate, umb_cnt from wm_user_menu_board where user_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // 내 메뉴판 리스트 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "내 메뉴판 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row){  // 내 메뉴판 리스트 OK
						done(check, row);
						conn.release();
					}else{  // 내 메뉴판 리스트 DB 오류
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
/*		회원 메뉴판 메뉴리스트    */ 
/***************************/
exports.list = function(data, done){
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
/*		회원 메뉴판 메뉴추가     */ 
/***************************/
exports.add = function(data, done){
	var check = true;
	var msg = "";
	var len = data[1].length;
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  
			async.waterfall([
				function(callback){ // 내 메뉴판 메뉴 중복 검사
					var sql = "select menu_no from wm_user_menu where umb_no=?";
					conn.query(sql, data[0], function(err, row){
						if(err){
							msg = "메뉴 중복 검사 데이터 입력 오류";
							callback(err);
						}else{
							var len_row = row.length;
							for(var i=0; i<len; i++){
								for(var j=0; j<len_row; j++){
									if(data[1][i]==row[j].menu_no){
										data[1].splice(i, 1);
										i-=1;
										break;
									}
								}
							}
						}
						logger.info('data' ,data[1]);
						callback(null, data[1]);
					});
				},
				function(input_data, callback){
					logger.info('data',data);
					var sql = "insert into wm_user_menu(umb_no, menu_no, umenu_regdate) values(?,?,now())";
					async.each(input_data, function(data_ok, callback){
						conn.query(sql, [data[0], data_ok], function(err, row){
							if(err){
								msg = "메뉴 추가 데이터 입력 오류";
								callback(err);
							}else{
								if(row.affectedRows == 1){
									var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt+1 where umb_no=?";
									conn.query(sql_cnt, data[0], function(err, row_cnt){
										if(err){
											msg = "메뉴 갯수 증가 데이터 입력 오류";
											callback(err);
										}else{
											if(row_cnt.affectedRows == 0){
												msg = "DB 입력 오류";
												callback(err);
											}else{
												callback(null);
											}
										}
									});
								}else{
									msg = "DB 입력 오류";
									callback(err);
								}
							}
						});
					},function(err, msg){
						if(err){
							callback(err, msg);
						}else{
							msg = "Add Success";
							callback(null, msg);
						}
					});
				}
				],
				function(err, result){
					if(err){
						logger.error(err);
						check = false;
						done(check, msg);
						conn.release();
					}else{
						done(check, result);
						conn.release();
					}
				});
}
});
};

exports.add_one = function(data, done){
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
				function(callback){ // 내 메뉴판 메뉴 중복 검사
					var sql = "select count(*) cnt from wm_user_menu where umb_no=? and menu_no=?";
					conn.query(sql, data, function(err, row){
						if(err){
							msg = "메뉴 중복 검사 데이터 입력 오류";
							callback(err, msg);
						}else{
							if(row[0].cnt==1){
								msg="메뉴가 중복 됩니다.";
								callback(check, msg);
							}else{
								callback(null);
							}
						}
					});
				},
				function(callback){
					var sql = "insert into wm_user_menu(umb_no, menu_no, umenu_regdate) values(?,?,now())";
					conn.query(sql, data, function(err, row){
						if(err){
							msg = "메뉴 추가 데이터 입력 오류";
							callback(err, msg);
						}else{
							if(row.affectedRows == 1){
								var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt+1 where umb_no=?";
								conn.query(sql_cnt, data[0], function(err, row_cnt){
									if(err){
										msg = "메뉴 갯수 증가 데이터 입력 오류";
										callback(err, msg);
									}else{
										if(row_cnt.affectedRows == 0){
											msg = "DB 입력 오류";
											callback(err, msg);
										}else{
											msg = "Add Success";
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
/*		회원 메뉴판 메뉴삭제     */ 
/***************************/
exports.delete = function(data, done){
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
			var sql = "delete from wm_user_menu where umenu_no=?";
			async.each(data[1], function(data_ok, callback){
				conn.query(sql, data_ok, function(err, row){
					if(err){
						msg = "메뉴 추가 데이터 입력 오류";
						callback(check, msg);
					}else{
						if(row.affectedRows == 1){
							var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt-1 where umb_no=?";
							conn.query(sql_cnt, data[0], function(err, row_cnt){
								if(err){
									msg = "메뉴 갯수 증가 데이터 입력 오류";
									callback(check, msg);
								}else{
									if(row_cnt.affectedRows == 0){
										msg = "DB 입력 오류";
										callback(check, msg);
									}else{
										callback(null);
									}
								}
							});
						}else{
							msg = "DB 입력 오류";
							callback(check, msg);
						}
					}
				});
			},function(err){
				if(err){
					logger.error('err',err);
					check = false;
					done(check, msg);
					conn.release();
				}else{
					msg = "Delete Success";
					done(check, msg);
					conn.release();
				}
			});
		}
	});	
}

exports.delete_one = function(data, done){
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
			var sql = "delete from wm_user_menu where umenu_no=?";
			logger.info('data',data);
			conn.query(sql, data[1], function(err, row){
				if(err){
					logger.error('err',err);
					check = false;
					msg = "메뉴 추가 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					if(row.affectedRows == 1){
						var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt-1 where umb_no=?";
						conn.query(sql_cnt, data[0], function(err, row_cnt){
							if(err){
								logger.error('err',err);
								check = false;
								msg = "메뉴 갯수 증가 데이터 입력 오류";
								done(check, msg);
								conn.release();
							}else{
								if(row_cnt.affectedRows == 1){
									msg = "Delete Success";
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
/*		회원 메뉴판 메뉴이동     */ 
/***************************/
exports.transfer = function(data, done){
	var check = true;
	var msg = "";
	var len = data[2].length;
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			async.waterfall([
				function(callback){ // 내 메뉴판 메뉴 중복 검사
					var sql = "select menu_no from wm_user_menu where umb_no=?";
					conn.query(sql, data[1], function(err, row){
						if(err){
							msg = "메뉴 중복 검사 데이터 입력 오류";
							callback(err);
						}else{
							var len_row = row.length;
							for(var i=0; i<len; i++){
								for(var j=0; j<len_row; j++){
									if(data[3][i]==row[j].menu_no){
										data[2].splice(i, 1);
										data[3].splice(i, 1);
										i-=1;
										break;
									}
								}
							}
						}
						logger.info('data' ,data[1]);
						callback(null);
					});
				},
				function(callback){
					var sql = "update wm_user_menu set umb_no=? where umenu_no=?";
					async.each(data[2], function(data_ok, callback){
						conn.query(sql, [data[1], data_ok], function(err, row){
							if(err){
								check = false;
								msg = "메뉴 추가 데이터 입력 오류";
								callback(err, msg);
							}else{
								if(row.affectedRows == 1){
									var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt-1 where umb_no=?";
									conn.query(sql_cnt, data[0], function(err, row_cnt){
										if(err){
											msg = "메뉴 갯수 증가 데이터 입력 오류";
											callback(err, msg);
										}else{
											if(row_cnt.affectedRows == 0){
												msg = "이전 메뉴판 cnt 수정 오류";
												callback(err, msg);
											}else{
												var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt+1 where umb_no=?";
												conn.query(sql_cnt, data[1], function(err, row_cnt){
													if(err){
														msg = "메뉴 갯수 증가 데이터 입력 오류";
														callback(err, msg);
													}else{
														if(row_cnt.affectedRows == 0){
															msg = "이후 메뉴판 cnt 수정 오류";
															callback(err, msg);
														}else{
															callback(null, msg);
														}
													}
												});
											}
										}
									});
								}else{
									msg = "DB 입력 오류";
									callback(err, msg);
								}
							}
						});
},function(err){
	if(err){
		callback(err, msg);
	}else{
		msg = "Transfer Success";
		callback(null, msg);
	}
});
}
],
function(err, result){
	if(err){
		logger.error(err);
		check = false;
		done(check, result);
		conn.release();
	}else{
		done(check, result);
		conn.release();
	}
});
}
});	
}

exports.transfer_one = function(data, done){
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
			var sql = "select count(*) cnt from wm_user_menu where umb_no=? and menu_no=?";
			conn.query(sql, [data[1], data[3]], function(err, row){
				if(err){
					logger.error('err',err);
					check = false;
					msg = "메뉴 추가 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					if(row[0].cnt==1){
						logger.error('err',err);
						check = false;
						msg = "메뉴가 중복 됩니다.";
						done(check, msg);
						conn.release();
					}else{
						var sql = "update wm_user_menu set umb_no=? where umenu_no=?";
						conn.query(sql, [data[1], data[2]], function(err, row){
							if(err){
								logger.error('err',err);
								check = false;
								msg = "메뉴 추가 데이터 입력 오류";
								done(check, msg);
								conn.release();
							}else{
								if(row.affectedRows == 1){
									var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt-1 where umb_no=?";
									conn.query(sql_cnt, data[0], function(err, row_cnt){
										if(err){
											logger.error('err',err);
											check = false;
											msg = "메뉴 갯수 증가 데이터 입력 오류";
											done(check, msg);
											conn.release();
										}else{
											if(row_cnt.affectedRows == 0){
												logger.error('err',err);
												check = false;
												msg = "이전 메뉴판 cnt 수정 오류";
												done(check, msg);
												conn.release();
											}else{
												var sql_cnt = "update wm_user_menu_board set umb_cnt=umb_cnt+1 where umb_no=?";
												conn.query(sql_cnt, data[1], function(err, row_cnt){
													if(err){
														logger.error('err',err);
														check = false;
														msg = "메뉴 갯수 증가 데이터 입력 오류";
														done(check, msg);
														conn.release();
													}else{
														if(row_cnt.affectedRows == 0){
															logger.error('err',err);
															check = false;
															msg = "이후 메뉴판 cnt 수정 오류";
															done(check, msg);
															conn.release();
														}else{
															msg = "transfer Success";
															done(check, msg);
															conn.release();
														}
													}
												});
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
}
});
}
});
};