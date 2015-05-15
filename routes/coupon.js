var express = require('express');
var router = express.Router();

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/list', function(req, res, next){
	console.log('req.body', req.body);

	if(true){
		res.json({
			"List" : 
			[
			{"Coupon_Name":"초코케익 대박할인!", "Coupon_Info":"초코케익 50%할인!", "Cafe_Name":"장블랑제리", "Ucoupon_Check":"0"},
			{"Coupon_Name":"마카롱 할인!", "Coupon_Info":"마카롱 20%할인!", "Cafe_Name":"마카롱월드", "Ucoupon_Check":"1"}
			]
		});
	}else{
		res.json({
			"Result" : "List Fail"
		});
	}
});

router.post("/use", function(req, res, next){
	console.log('req.body', req.body);
	var ucoupon_no = req.body.Ucoupon_No;

	if(true){
		res.json({
			"Result" : "Use Success"
		});
	}else{
		res.json({
			"Result" : "Use Fail"
		});
	}
});

module.exports = router;