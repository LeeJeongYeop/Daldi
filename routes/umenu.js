var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_umenu = require('../models/db_umenu');
var logger = require('../logger');
var fs = require('fs');
var multer = require('multer');
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

router.use(multer({
	dest: './public/images/umenu_board',
	rename: function (fieldname, filename) {
		return filename.toLowerCase() + Date.now();
	}
}));

router.get('/:IMG_NAME', function (req, res) {
	var imgName = req.params.IMG_NAME;
	var img = fs.readFileSync('./public/images/menu/' + imgName + '.JPG');
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.get('/umenuBoard/:IMG_NAME', function (req, res) {
	var imgName = req.params.IMG_NAME;
	var img = fs.readFileSync('./public/images/umenu_board/' + imgName);
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.post('/board/add', function(req, res, next){
	if(req.session.log_data){
		logger.info('req.body', req.body);
		logger.info('req.files', req.files);
		var user_no = req.session.log_data.user_no;
		var umb_title = req.body.Umb_Title;
		if(req.files.Umb_Img){
			var filename = req.files.Umb_Img.name;
			var file_path = 'http://52.68.54.75/umenu/umenuBoard/'+filename;
		}else{
			var file_path = null;
		}
		var data = [user_no, umb_title, file_path];
		var null_check = 0;
		null_check = data_check(data);

		if(null_check == 1){
			res.json({
				"Result" : "Board Add Fail",
				"MSG" : "메뉴판 제목을 넣어주세요"
			});
		}else{
			db_umenu.board_add(data, function(check, msg){
				if(check){
					res.json({
						"Result" : "Board Add Success"
					});	
				}else{
					res.json({
						"Result" : "Board Add Fail",
						"MSG" : msg
					});			
				}
			});
		}
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		});
	}
});

router.post("/board/delete", function(req, res, next){
	logger.info('req.body', req.body);
	var umb_no = req.body.Umb_No;
	data = umb_no;

	if(req.session.log_data){
		db_umenu.board_delete(data, function(check, msg){
			if(check){
				res.json({
					"Result" : "Board Delete Success"
				});	
			}else{
				res.json({
					"Result" : "Board Delete Fail",
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

router.post("/board/update/view", function(req, res, next){
	logger.info('req.body', req.body);
	var umb_no = req.body.Umb_No;
	var data = umb_no;

	if(req.session.log_data){
		db_umenu.board_modify_view(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});	
			}else{
				res.json({
					"Result" : "Board Update View Fail",
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

router.post("/board/update", function(req, res, next){
	logger.info('req.body', req.body);
	var umb_no = req.body.Umb_No;
	var new_umb_title = req.body.New_Umb_Title;
	if(req.files.New_Umb_Img){
		var filename = req.files.New_Umb_Img.name;
		var file_path = 'http://52.68.54.75/umenu/umenuBoard/'+filename;
		var data = [new_umb_title, file_path, umb_no];
	}else{
		var data = [new_umb_title, umb_no];
	}

	if(req.session.log_data){
		db_umenu.board_modify(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});	
			}else{
				res.json({
					"Result" : "Board Update Fail",
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

router.post("/board/list", function(req, res, next){
	logger.info('req.body', req.body);

	if(req.session.log_data){
		var user_no = req.session.log_data.user_no;
		var data = user_no;
		db_umenu.board_list(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});	
			}else{
				res.json({
					"Result" : "Board List Fail",
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

router.post("/list", function(req, res, next){
	logger.info('req.body', req.body);
	var umb_no = req.body.Umb_No;
	data = umb_no;

	if(req.session.log_data){
		db_umenu.list(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "List Fail",
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

// router.post("/sharing", function(req, res, next){
// 	logger.info('req.body', req.body);
// 	var umenu_no = req.body.Umenu_No;

// 	if(true){
// 		res.json({
// 			"Menu_Name" : "초코케익",
// 			"Img" : "이미지",
// 			"User_Name" : "강수현"
// 		});
// 	}else{
// 		res.json({
// 			"Result" : "sharing Fail"
// 		});
// 	}
// });

router.post("/add", function(req, res, next){
	logger.info('req.body', req.body);
	var umb_no = req.body.Umb_No;
	var menu_no = req.body.Menu_No;
	var data = [umb_no, menu_no];

	if(req.session.log_data){
		db_umenu.add(data, function(check, msg){
			if(check){
				res.json({
					"Result" : msg
				});	
			}else{
				res.json({
					"Result" : "Add Fail",
					"MSG" : msg
				});			
			}
		});
	}else{
		res.json({
			"Result" : "로그인 먼저 하소~"
		})
	}
});

router.post("/delete", function(req, res, next){
	logger.info('req.body', req.body);
	var umenu_no = req.body.Umenu_No;

	if(true){
		res.json({
			"Result" : "Delete Success"
		});
	}else{
		res.json({
			"Result" : "Delete Fail"
		});
	}
});

module.exports = router;