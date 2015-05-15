var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_tip = require('../models/db_tip');
var logger = require('../logger');
/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/list', function(req, res, next){
	if(req.session.log_data){
		var user_no = req.session.log_data.user_no;
		var data = user_no;
		db_tip.tip_list(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "Tip List Fail",
					"MSG" : row
				});
			}
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

router.post("/delete", function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var tip_no = req.body.Tip_No;
		var data = [tip_no];
		db_tip.tip_delete(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Tip Delete Fail",
					"MSG" : msg
				});
			}
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

module.exports = router;