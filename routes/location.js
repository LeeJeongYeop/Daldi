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
	console.log('req.body', req.body);
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
				"MSG" : row
			});
		}
	});
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