var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_config = require('./db_config');
var logger = require('../logger');
var pool = mysql.createPool(db_config);
var graph = require('fbgraph');
var nodemailer = require('nodemailer');

/*****************************/
/*			페이스북  			 */ 
/***************************/
exports.fb = function(data, done){
	var check = 0;
	var access_token = data;
	var join_path = 1;
	logger.info('access_token', access_token);
	graph.setAccessToken(access_token);

	graph.get("me", function(err, res){
		var gender = 1;
		if(res.gender == 'male'){  //남자인지 확인
			gender = 0;
		}
		var fdata = [res.id, res.name, gender, join_path];
		logger.info('fdata', fdata);
		pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = 2;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 아이디 중복 검사
			var id_check =[fdata[0], fdata[3]];
			var sql = "select count(*) cnt from wm_user where user_id=? and user_joinpath=?";
			conn.query(sql, id_check, function(err, row){
				if(err){  // id 중복검사 데이터 입력 오류
					logger.error('err', err);
					check = 2;
					msg = "아이디 중복 검사 DB 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info(row[0].cnt);
					if(row[0].cnt == 0){  // id와 joinpath가 중복 되지 않음
						check = 1;
						done(check, fdata);
						conn.release();
					}else{  // id가 중복됨
						var sql = "select user_no, user_name, user_id, user_gender, user_email, user_joinpath from wm_user where user_id=? and user_joinpath=?";
						conn.query(sql, id_check, function(err, row){
							if(err){  // login 정보 데이터 입력 오류
								console.error('err', err);
								check = 2;
								msg = "login 정보 데이터 입력 오류";
								done(check, msg);
								conn.release();
							}else{
								if(row[0]){
									msg = "Login Success";
									done(check, row);
									conn.release();
								}else{
									msg = "로그인 오류입니다.";
									check = 2;
									console.log(msg);
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
});
};

/*****************************/
/*			페이스북 회원가입	 */ 
/***************************/
exports.fb_join = function(data, done){
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
			var sql = "insert into wm_user(user_id, user_name, user_gender, user_joinpath, user_email, user_withdraw, user_regdate) values(?,?,?,?,?,0,now())";
			conn.query(sql, data, function(err, row){
				if(err){  // 회원가입 DB 입력시 오류
					logger.error('err', err);
					check = false;
					msg = "회원가입 DB 입력 오류";
					done(check ,msg);
					conn.release();
				}else{
					logger.info('row', row);
					if(row.affectedRows == 1){  // 회원가입 입력 OK
						var id_check =[data[0], data[3]];
						var sql = "select user_no, user_name, user_id, user_gender, user_email,user_joinpath from wm_user where user_id=? and user_joinpath=?";
						conn.query(sql, id_check, function(err, row){
							if(err){  // login 정보 데이터 입력 오류
								console.error('err', err);
								check = false;
								msg = "login 정보 데이터 입력 오류";
								done(check, msg);
								conn.release();
							}else{
								if(row[0]){
									var umenu_board = [row[0].user_no, row[0].user_name+"의 메뉴판"];
									logger.info("umenu_board", umenu_board);
									var sql = "insert into wm_user_menu_board(user_no, umb_title, umb_regdate) value(?,?,now())";
									conn.query(sql, umenu_board, function(err, row_umb){
										if(err){  // 기본 메뉴판 추가 시 DB 입력시 오류
											logger.error('err', err);
											check = false;
											msg = "기본 메뉴판 추가 시 DB 입력시 오류";
											done(check ,msg);
											conn.release();
										}else{
											if(row_umb.affectedRows == 1){  // 기본 메뉴판 추가 ok
												msg = "Login Success";
												done(check, row);
												conn.release();
											}else{
												msg = "기본 메뉴판 추가 오류입니다.";
												check = false;
												console.log(msg);
												done(check, msg);
												conn.release();
											}
										}
									});
								}else{
									msg = "로그인 오류입니다.";
									check = false;
									console.log(msg);
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{  // 회원가입 DB 오류
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
/*			일반회원가입		 */ 
/***************************/
exports.join = function(data, done){
	var check = true;
	var msg = "";

	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{  // 아이디 중복 검사
			var id_check =[data[0], data[5]];
			var sql = "select count(*) cnt from wm_user where user_id=? and user_joinpath=?";
			conn.query(sql, id_check, function(err, row){
				if(err){  // id 중복검사 데이터 입력 오류
					logger.error('err', err);
					check = false;
					msg = "아이디 중복 검사 DB 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					logger.info(row[0].cnt);
					if(row[0].cnt == 0){  // id와 joinpath가 중복 되지 않음
						var sql = "insert into wm_user(user_id, user_password, user_name, user_gender, user_email,user_joinpath, user_withdraw, user_regdate) values(?,?,?,?,?,?,0,now())";
						conn.query(sql, data, function(err, row){
							if(err){  // 회원가입 DB 입력시 오류
								logger.error('err', err);
								check = false;
								msg = "회원가입 DB 입력 오류";
								done(check ,msg);
								conn.release();
							}else{
								logger.info('row', row);
								if(row.affectedRows == 1){  // 회원가입 입력 OK
									var sql = "select user_no from wm_user where user_id = ?";
									conn.query(sql, data[0], function(err, row_uno){
										if(err){  // 일반 회원가입 메뉴판 추가 user_id 검색 DB 입력시 오류
											logger.error('err', err);
											check = false;
											msg = "일반 회원가입 메뉴판 추가 user_id 검색 DB 입력시 오류";
											done(check ,msg);
											conn.release();
										}else{
											var umenu_board = [row_uno[0].user_no, data[2]+"의 메뉴판"];
											logger.info("umenu_board", umenu_board);
											var sql = "insert into wm_user_menu_board(user_no, umb_title, umb_regdate) value(?,?,now())";
											conn.query(sql, umenu_board, function(err, row_umb){
												if(err){  // 기본 메뉴판 추가 시 DB 입력시 오류
													logger.error('err', err);
													check = false;
													msg = "기본 메뉴판 추가 시 DB 입력시 오류";
													done(check ,msg);
													conn.release();
												}else{
													if(row_umb.affectedRows == 1){  // 기본 메뉴판 추가 ok
														msg = "Join Success";
														done(check, msg);
														conn.release();
													}else{
														msg = "기본 메뉴판 추가 오류입니다.";
														check = false;
														console.log(msg);
														done(check, msg);
														conn.release();
													}
												}
											});
										}
									});
								}else{  // 회원가입 DB 오류
									check = false;
									msg = "DB 오류 다시 시도해주세요.";
									done(check, msg);
									conn.release();
								}
							}
						});
					}else{  // id가 중복됨
						logger.info("cnt:",row[0].cnt);
						check = false;
						msg = "아이디가 중복 됩니다.";
						done(check, msg);
						conn.release();
					}
				}
			});
}
});
};

/*****************************/
/*			일반로그인		    */ 
/***************************/
exports.login = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			console.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			var sql = "select user_no, user_name, user_id, user_gender, user_email, user_joinpath from wm_user where user_id=? and user_password=? and user_joinpath=0";
			conn.query(sql, data, function(err, row){
				if(err){  // login 정보 데이터 입력 오류
					console.error('err', err);
					check = false;
					msg = "login 정보 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					if(row[0]){
						msg = "Login Success";
						done(check, row);
						conn.release();
					}else{
						msg = "아이디와 비밀번호가 일치하지 않습니다.";
						check = false;
						console.log(msg);
						done(check, msg);
						conn.release();
					}
				}
			});
		}
	});
};

/*****************************/
/*			정보수정			*/ 
/***************************/
exports.modify = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			console.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			var sql = "update wm_user set user_name=?, user_gender=?, user_password=?, user_email=? where user_no=?";
			conn.query(sql, data, function(err, row){
				if(err){  // modify 정보 데이터 입력 오류
					console.error('err', err);
					check = false;
					msg = "modify 정보 데이터 입력 오류";
					done(check, msg);
					conn.release();
				}else{
					if(row.affectedRows == 1){
						msg = "modify Success";
						done(check, row);
						conn.release();
					}else{
						check = false;
						msg = "modify DB Fail";
						done(check, msg);
						conn.release();
					}
				}
			});
		}
	});
};

exports.find_password = function(data, done){
	var check = true;
	var msg = "";
	pool.getConnection(function(err, conn){
		if(err){
			console.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			var sql = "update wm_user set user_password=? where user_no=?";
			conn.query(sql, [data[1], data[2]], function(err, row){
				if(err){
					logger.error('err', err);
					check = false;
					msg = "비밀번호 찾기 비밀번호 변경 DB 에러"
					done(check, msg);
					conn.release();
				}else{
					if(row.affectedRows == 1){
						logger.info('data[0]', data[0]);
						var transporter = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: 'daldimanager@gmail.com',
								pass: 'ekfelekfel@'
							}
						});
						var mailOptions = {
							from: 'daldimanager <daldimanager@gmail.com>',
							to: data[0],
							subject: 'Daldi Application 비밀번호 찾기 서비스입니다.',
							text: '임시 비밀번호는 '+data[1]+' 입니다. \n 회원정보에서 비밀번호를 변경해주세요.',
							html: '임시 비밀번호는 '+data[1]+' 입니다. <br> 회원정보에서 비밀번호를 변경해주세요.'
						};

						transporter.sendMail(mailOptions, function(error, info){
							if(error){
								logger.error(error);
								console.error('err', err);
								check = false;
								msg = "비밀번호 찾기 메일전송 에러"
								done(check, msg);
								conn.release();
							}else{
								logger.info('Message sent: ' + info.response);
								msg = "Find Password Success";
								done(check, msg);
								conn.release();
							}
						});
					}else{
						logger.error('err', err);
						check = false;
						msg = "비밀번호 찾기 비밀번호 변경 에러"
						done(check, msg);
						conn.release();
					}
				}
			});
}
});
};