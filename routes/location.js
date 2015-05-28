var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_location = require('../models/db_location');
var logger = require('../logger');
/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함  */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/search', function(req, res, next){
	logger.info('req.body', req.body);
	var lat = req.body.Lat;
	var lon = req.body.Lon;
	var check = req.body.Check;
	var data = [lat, lon, check];

	db_location.search(data, function(check, row1, row2, row3, row4, row5){
		if(check){
			res.json({
				"List" : [row1[0], row2[0], row3[0], row4[0], row5[0]]
			});
		}else{
			res.json({
				"Result" : "Search Fail",
				"MSG" : row1
			});
		}
	});
});

router.post('/survey', function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var data = [req.session.log_data.user_no];
		logger.info('req.body.m1', req.body.m1);
		switch(parseInt(req.body.price)){
			case 0 : data.push(0); data.push(3000); break;
			case 1 : data.push(3000); data.push(5000); break;
			case 2 : data.push(5000); data.push(7000); break;
			case 3 : data.push(7000); data.push(10000); break;
			case 4 : data.push(10000); break;
		}
		switch(parseInt(req.body.m1)){
			case 0: data.push("아메리카노"); break;
			case 1: data.push("라떼"); break;
			case 2: data.push("프라푸치노"); break;
			case 3: data.push("모카"); break;
			case 4: data.push("에스프레소"); break;
		}
		switch(parseInt(req.body.m2)){
			case 0: data.push("스무디"); break;
			case 1: data.push("버블티"); break;
			case 2: data.push("에이드"); break;
			case 3: data.push("홍차"); break;
			case 4: data.push("아이스티"); break;
			case 5: data.push("녹차"); break;
		}
		switch(parseInt(req.body.m3)){
			case 0: data.push("눈꽃빙수"); break;
			case 1: data.push("아이스크림"); break;
			case 2: data.push("팥빙수"); break;
			case 3: data.push("아포가토"); break;
			case 4: data.push("케이크빙수"); break;
		}
		switch(parseInt(req.body.m4)){
			case 0: data.push("치즈케이크"); break;
			case 1: data.push("티라미수"); break;
			case 2: data.push("초코케이크"); break;
			case 3: data.push("생크림케이크"); break;
			case 4: data.push("에플레어"); break;
		}
		switch(parseInt(req.body.m5)){
			case 0: data.push("와플"); break;
			case 1: data.push("초콜릿"); break;
			case 2: data.push("타르트"); break;
			case 3: data.push("쿠키"); break;
		}
		db_location.survey(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Survey Fail",
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

router.post('/search/user', function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no  = req.session.log_data.user_no;
		var lat = req.body.Lat;
		var lon = req.body.Lon;
		var check = req.body.Check;
		var data = [user_no, lat, lon, check];
		db_location.search_user(data, function(check, row1, row2, row3, row4, row5){
			if(check){
				res.json({
					"List" : [row1[0], row2[0], row3[0], row4[0], row5[0]]
				});
			}else{
				res.json({
					"Result" : "Search Fail",
					"MSG" : row1
				});
			}
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});
// router.post("/coupon/add", function(req, res, next){
// 	console.log('req.body', req.body);
// 	var coupon_no = req.body.coupon_No;

// 	if(true){
// 		res.json({
// 			"Result" : "Coupon Add Success"
// 		});
// 	}else{
// 		res.json({
// 			"Result" : "Coupon Add Fail"
// 		});
// 	}
// });

module.exports = router;