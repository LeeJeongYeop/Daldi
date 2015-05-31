var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_user = require('../models/db_user');
var crypto = require('crypto');
var _crypto = require('../models/db_crypto');
var logger = require('../logger');

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

var data_check = function(data){
	var len = data.length;
	for(var i=0; i<len; i++){
		if(data[i]===""){
			return 1;
		}
	}
}

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/join', function(req, res, next){
	logger.info('req.body', req.body);
	var user_name = req.body.User_Name;
	var user_id = req.body.User_ID;
	var user_password = _crypto.do_ciper(req.body.User_Password);
	var user_gender = req.body.User_Gender;
	var join_path = 0;
	var data = [user_id, user_password, user_name, user_gender, user_id, join_path];
	var null_check = 0;
	null_check = data_check(data);

	logger.info(data);
	if(null_check == 1){
		res.json({
			"Result" : "Join Fail",
			"MSG" : "빈칸을 입력해주세요."
		});
	}else{
		db_user.join(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});	
			}else{
				res.json({
					"Result" : "Join Fail",
					"MSG" : msg
				});			
			}
		});
	}
});

router.post("/fb", function(req, res, next){
	logger.info('req.body', req.body);
	var access_token = req.body.access_token;
	
	if(access_token){
		db_user.fb(access_token, function(check, row){
			if(check == 0){
				req.session.log_data = row[0];
				res.json({
					"Result" : "FB Success"
				});
			}else if(check == 1){
				req.session.log_data = row;
				res.json({
					"Result" : "FB Not"
				});
			}else{
				res.json({
					"Result" : "FB Fail",
					"MSG" : msg
				});
			}
		});
	}else{
		res.json({
			"Result" : "FB Fail",
			"MSG" : "access token을 보내주세요."
		});
	}
});

router.post("/fb/join", function(req, res, next){
	logger.info('req.body', req.body);
	logger.info('fdata', req.session.log_data);
	var user_email = req.body.User_Email;
	var data = req.session.log_data;
	data.push(user_email);
	logger.info('data', data);

	db_user.fb_join(data, function(check, row){
		if(check){
			req.session.log_data = row[0];
			res.json({
				"Result" : "Join_FB Success"
			});
		}else{
			res.json({
				"Result" : "Join_FB Fail",
				"MSG" : row
			});
		}
	});
});

router.post("/login", function(req, res, next){
	logger.info('req.body', req.body);
	var user_id = req.body.User_ID;
	var user_password = _crypto.do_ciper(req.body.User_Password);
	var data = [user_id, user_password];
	var null_check = 0;
	null_check = data_check(data);

	if(null_check == 1){
		res.json({
			"Result" : "Login Fail",
			"MSG" : "빈칸을 입력해주세요."
		});
	}else{
		db_user.login(data, function(check, row){
			if(check){
				req.session.log_data = row[0];
				res.json({
					"Result" : "Login Success",
				});	
			}else{
				res.json({
					"Result" : "Login Fail",
					"MSG" : row
				});			
			}
		});
	}
});

router.post("/find/password", function(req, res, next){
	logger.info('req.body', req.body);
	var user_id = req.body.User_ID;
	var imsi = Math.floor(Math.random() * 1000000)+100000;
	if(imsi>1000000){
		imsi = imsi - 100000;
	}
	var data = [user_id, imsi];

	db_user.find_password(data, function(check, msg){
		if(check){
			res.json({
				"Result" : msg
			});
		}else{
			res.json({
				"Result" : "Find Password Fail",
				"MSG" : msg
			});	
		}
	});
});

router.post("/info", function(req, res, next){
	if(req.session.log_data){
		user_no = req.session.log_data.user_no;
		user_id = req.session.log_data.user_id;
		user_name = req.session.log_data.user_name;
		user_gender = req.session.log_data.user_gender;
		user_email = req.session.log_data.user_email;
		logger.info('user_name', user_name, 'user_gender', user_gender, 'user_email', user_email);
		res.json({
			"User_No" : user_no,
			"User_ID" : user_id,
			"User_Name" : user_name,
			"User_Gender" : user_gender,
			"User_Email" : user_email
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

router.post("/modify", function(req, res, next){
	logger.info('req.body', req.body);
	if(req.session.log_data){
		var user_no = req.session.log_data.user_no; // 프로토콜 정의서 x
		var user_name = req.body.User_Name;
		var user_gender = req.body.User_Gender;
		var user_email = req.body.User_Email;
		var user_new_password = req.body.User_New_Password;
		if(user_new_password == ""){
			var data = [user_name, user_gender, user_email, user_no];
			db_user.modify(data, function(check, row){
				if(check){
					req.session.log_data.user_name = user_name;
					req.session.log_data.user_gender = user_gender;
					res.json({
						"Result" : "Modify Success"
					});
				}else{
					res.json({
						"Result" : "Modify Fail",
						"MSG" : row
					});
				}
			});
		}else{
			user_new_password = _crypto.do_ciper(user_new_password);
			var data = [user_name, user_gender, user_new_password, user_email, user_no];
			db_user.modify(data, function(check, row){
				if(check){
					req.session.log_data.user_name = user_name;
					req.session.log_data.user_gender = user_gender;
					res.json({
						"Result" : "Modify Success"
					});
				}else{
					res.json({
						"Result" : "Modify Fail",
						"MSG" : row
					});
				}
			});
		}
	}else{
		res.json({
			"Result" : "Modify Fail",
			"MSG" : "로그인 먼저 하소~"
		});
	}
});

router.post("/logout", function(req, res, next){
	logger.info('req.session.log_data', req.session.log_data);

	if(req.session.log_data){
		req.session.destroy(function(err){
			if(err){
				res.json({
					"Result" : "Logout Fail"
				});
			}else{
				res.json({
					"Result" : "Logout Success"
				});
			}
		});
	}else{
		res.json({
			"Result" : "Logout Fail"
		});
	}
});

router.post("/login/check", function(req, res, next){
	if(req.session.log_data){
		res.json({
			"Result" : req.session.log_data.user_name
		});
	}else{
		res.json({
			"Result" : "로그 아웃 상태"
		});
	}
});

module.exports = router;