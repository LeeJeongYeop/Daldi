var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_menu = require('../models/db_menu');
var fs = require('fs');
var logger = require('../logger');

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/:IMG_NAME', function (req, res) {
	var imgName = req.params.IMG_NAME;
	var img = fs.readFileSync('./public/images/menu/' + imgName + '.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.post('/star/add', function(req, res, next){
	logger.info('req.body', req.body);
	var user_no = req.session.log_data.user_no;
	var user_gender = req.session.log_data.user_gender;
	var menu_no = req.body.Menu_No;
	var star_point = req.body.Star_Point;
	var data = [user_no, menu_no, star_point, user_gender];

	if(req.session.log_data){
		db_menu.star_add(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});	
			}else{
				res.json({
					"Result" : "Star Add Fail",
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

router.post("/star/delete", function(req, res, next){
	console.log('req.body', req.body);
	var user_no = req.session.log_data.user_no;
	var menu_no = req.body.Menu_No;
	var data = [user_no, menu_no];

	if(req.session.log_data){
		db_menu.star_delete(data, function(check, msg){
			if(check){
				res.json({
					"Result" : "Star Delete Success"
				});	
			}else{
				res.json({
					"Result" : "Star Delete Fail",
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

router.post("/detail", function(req, res, next){
	console.log('req.body', req.body);
	var menu_no = req.body.Menu_No;

	if(true){
		res.json({
			"Menu_Name" : "초코케익",
			"Menu_Price" : "4000",
			"Menu_Img" : ["http://52.68.54.75:3000/menu/ok1","http://52.68.54.75:3000/menu/ok2","http://52.68.54.75:3000/menu/ok3","http://52.68.54.75:3000/menu/ok4", "http://52.68.54.75:3000/menu/ok5"],
			"Menu_Info" : "맛있는 초코 케익입니다.",
			"Cafe_Name" : "장블랑제리",
			"Cafe_Tel" : "02-1234-1234",
			"Cafe_Address" : "서울시 마포구 홍대입구역",
			"Cafe_Open" : "07:00",
			"Cafe_Close" : "23:00",
			"Cafe_In_Img" : "http://52.68.54.75:3000/menu/c1",
			"Cafe_Out_Img" : "http://52.68.54.75:3000/menu/c2",
			"Cafe_Menu_List" : [
			{"Menu_Name" : "딸기케익", "Menu_Price" : "3000", "Menu_Img" : "http://52.68.54.75:3000/menu/p1"},
			{"Menu_Name" : "왕초밥", "Menu_Price" : "10000", "Menu_Img" : "http://52.68.54.75:3000/menu/p3"}
			],
			"Star_Man" : "4", 
			"Star_Woman" : "5",
			"Keyword1_count" : "10",
			"Keyword2_count" : "20",
			"Keyword3_count" : "30",
			"Keyword4_count" : "15",
			"Keyword5_count" : "14",
			"Keyword6_count" : "22",
			"Keyword7_count" : "32",
			"Keyword8_count" : "55",
			"Keyword9_count" : "90",
			"Keyword10_count" : "12",
			"Keyword11_count" : "32",
			"Keyword12_count" : "2",
			"Keyword13_count" : "6",
			"Keyword14_count" : "90",
			"Keyword15_count" : "102",
			"Tip_List" :
			[
			{"Tip_Title" : "맛있어요!", "Tip_Regdate" : "2015-04-30", "Tip_Like_Count" : "4"},
			{"Tip_Title" : "딱좋아요!", "Tip_Regdate" : "2015-05-01", "Tip_Like_Count" : "3"}
			]

		});
}else{
	res.json({
		"Result" : "Detail Fail"
	});
}
});

router.post("/tip/write", function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var menu_no = req.body.Menu_No;
		var tip_title = req.body.Tip_Title;
		var data = [user_no, menu_no, tip_title];
		db_menu.tip_write(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Tip Write Fail",
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

router.post("/tip/update", function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var tip_no = req.body.Tip_No;
		var tip_title = req.body.Tip_Title;
		var data = [user_no, tip_no, tip_title];

		db_menu.tip_update(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Tip Update Fail",
					"msg" : msg
				});
			}
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

router.post("/tip/like", function(req, res, next){
	console.log('req.body', req.body);
	var tip_no = req.body.Tip_No;
	var tip_point = req.body.Tip_Point;

	if(true){
		res.json({
			"Result" : "Tip Like Success"
		});
	}else{
		res.json({
			"Result" : "Tip Like Fail"
		});
	}
});

router.post("/tip/like/delete", function(req, res, next){
	console.log('req.body', req.body);
	var tip_no = req.body.Tip_No;

	if(true){
		res.json({
			"Result" : "Tip Like Delete Success"
		});
	}else{
		res.json({
			"Result" : "Tip Like Delete Fail"
		});
	}
});

router.post("/keyword/select", function(req, res, next){
	console.log('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var keyword1 = req.body.Keyword1;
	var keyword2 = req.body.Keyword2;
	var keyword3 = req.body.Keyword3;
	var keyword4 = req.body.Keyword4;
	var keyword5 = req.body.Keyword5;
	var keyword6 = req.body.Keyword6;
	var keyword7 = req.body.Keyword7;
	var keyword8 = req.body.Keyword8;
	var keyword9 = req.body.Keyword9;
	var keyword10 = req.body.Keyword10;
	var keyword11 = req.body.Keyword11;
	var keyword12 = req.body.Keyword12;
	var keyword13 = req.body.Keyword13;
	var keyword14 = req.body.Keyword14;
	var keyword15 = req.body.Keyword15;

	if(true){
		res.json({
			"Result" : "Keyword Select Success"
		});
	}else{
		res.json({
			"Result" : "Keyword Select Fail"
		});
	}
});

router.post("/keyword/delete", function(req, res, next){
	console.log('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var keyword1 = req.body.Keyword1;

	if(true){
		res.json({
			"Result" : "Keyword Select Success"
		});
	}else{
		res.json({
			"Result" : "Keyword Select Fail"
		});
	}
});

router.post("/user/img", function(req, res, next){
	console.log('req.body', req.body);
	var menu_no = req.body.Menu_No;

	if(true){
		res.json({
			"Menu_User_Img" : ["http://52.68.54.75:3000/menu/ok1","http://52.68.54.75:3000/menu/ok2","http://52.68.54.75:3000/menu/ok3","http://52.68.54.75:3000/menu/ok4", "http://52.68.54.75:3000/menu/ok5"]
		});
	}else{
		res.json({
			"Result" : "Menu User Image List Fail"
		});
	}
});

router.post("/user/img/add", function(req, res, next){
	console.log('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var menu_img = req.body.Menu_Img;

	if(true){
		res.json({
			"Result" : "Menu User Image Add Success"
		});
	}else{
		res.json({
			"Result" : "Menu User Image Add Fail"
		});
	}
});

module.exports = router;