var express = require('express');
var router = express.Router();

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/search', function(req, res, next){
	console.log('req.body', req.body);
	var user_location = req.body.Location;

	if(true){
		res.json({
			"List" : 
			[
			{"Cafe_Area":"홍대", "Cafe_Location":"경도,위도", "Menu_Category":"케익", "Menu_Name":"초코케익", "Menu_Price":"4000", "Menu_Img":"이미지", "Coupon_Name":"초코케익 대박할인!", "Coupon_Info":"초코케익 50%할인!"},
			{"Cafe_Area":"합정", "Cafe_Location":"경도,위도", "Menu_Category":"마카롱", "Menu_Name":"마카롱", "Menu_Price":"2000", "Menu_Img":"이미지", "Coupon_Name":"마카롱 할인!", "Coupon_Info":"마카롱 20%할인!"}
			]
		});
	}else{
		res.json({
			"Result" : "Search Fail"
		});
	}
});

router.post("/coupon/add", function(req, res, next){
	console.log('req.body', req.body);
	var coupon_no = req.body.coupon_No;

	if(true){
		res.json({
			"Result" : "Coupon Add Success"
		});
	}else{
		res.json({
			"Result" : "Coupon Add Fail"
		});
	}
});

module.exports = router;