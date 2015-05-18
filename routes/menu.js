var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_menu = require('../models/db_menu');
var fs = require('fs');
var multer = require('multer');
var logger = require('../logger');

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.use(multer({
	dest: './public/images/menu_user',
	rename: function (fieldname, filename) {
		return filename.toLowerCase() + Date.now();
	}
}));

router.get('/:IMG_NAME', function (req, res) {
	var imgName = req.params.IMG_NAME;
	var img = fs.readFileSync('./public/images/menu/' + imgName + '.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.get('/userImg/:IMG_NAME', function (req, res) {
	var imgName = req.params.IMG_NAME;
	var img = fs.readFileSync('./public/images/menu_user/' + imgName);
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.post('/star/add', function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var user_gender = req.session.log_data.user_gender;
		var menu_no = req.body.Menu_No;
		var data = [user_no, menu_no, user_gender];

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
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var menu_no = req.body.Menu_No;
		var data = [user_no, menu_no];

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
	logger.info('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var data = menu_no;

	db_menu.detail(data, function(check, row1, menu_img, cafe_img, row2, star, keyword, tip, best_tip){
		if(check){
			res.json({
				"List1" : row1,
				"Menu_Img" : menu_img,
				"Cafe_Img" : cafe_img,
				"List2" : row2,
				"Star" : star,
				"Keyword" : keyword,
				"Tip" : tip,
				"Best_Tip" : best_tip
			});	
		}else{
			res.json({
				"Result" : "Detail Fail"
			});	
		}
	});
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
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var tip_no = req.body.Tip_No;
		var data = [user_no, tip_no];

		db_menu.tip_like(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Tip Like Fail",
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

router.post("/tip/like/delete", function(req, res, next){
	if(req.session.log_data){
		logger.log('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var tip_no = req.body.Tip_No;
		var data = [user_no, tip_no];

		db_menu.tip_like_delete(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Tip Like Delete Fail",
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

router.post("/keyword/select", function(req, res, next){
	logger.info('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var keyword = req.body.Keyword;
	for(var i=0; i<4; i++){
		keyword[i] = "kw"+keyword[i];
	}
	var data = [menu_no, keyword[0], keyword[1], keyword[2], keyword[3]];

	logger.info('data', data);
	db_menu.keyword_select(data, function(check, msg){
		if(check){
			res.json({
				"Result" : msg
			});
		}else{
			res.json({
				"Result" : "Keyword Select Fail",
				"msg" : msg
			});
		}
	});
});

// router.post("/keyword/delete", function(req, res, next){
// 	console.log('req.body', req.body);
// 	var menu_no = req.body.Menu_No;
// 	var keyword1 = req.body.Keyword1;

// 	if(true){
// 		res.json({
// 			"Result" : "Keyword Select Success"
// 		});
// 	}else{
// 		res.json({
// 			"Result" : "Keyword Select Fail"
// 		});
// 	}
// });


router.post("/user/img", function(req, res, next){
	logger.info('req.body', req.body);
	var menu_no = req.body.Menu_No;
	var data = menu_no;

	db_menu.user_img(data, function(check, row){
		if(check){
			res.json({
				"Menu_User_Img" : row
			});
		}else{
			res.json({
				"Result" : "Menu User Image List Fail",
				"msg" : row
			});
		}
	});
});

router.post("/user/img/add", function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		logger.info('req.files', req.files);
		var user_no = req.session.log_data.user_no;
		var menu_no = req.body.Menu_No;
		if(req.files.Menu_User_Img){
			var filename = req.files.Menu_User_Img.name;
			var file_path = 'http://52.68.54.75/menu/userImg/'+filename;
			var data = [user_no, menu_no, file_path];

			db_menu.user_img_add(data, function(check, msg){
				if(check){
					res.json({
						"Result" : msg
					});
				}else{
					res.json({
						"Result" : "Menu User Image Add Fail",
						"msg" : msg
					});
				}
			});
		}else{
			res.json({
				"Result" : "Menu User Image Add Fail",
				"msg" : "사진을 추가해 주세요."
			});
		}
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

router.post("/user/img/delete", function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		var user_no = req.session.log_data.user_no;
		var img_no = req.body.Img_No;
		var data = [user_no, img_no];

		db_menu.user_img_delete(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});
			}else{
				res.json({
					"Result" : "Menu User Image Delete Fail",
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

module.exports = router;