var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_search = require('../models/db_search');
var logger = require('../logger');

/* GET home page. */

/********************************/
/*     User_No을 세션에서 가져와야함 */
/*******************************/

router.post('/', function(req, res, next) {
	logger.log('req.body', req.body);
	var search_check = req.body.Search_Check;
	var search_word = req.body.Search_Word;
	var data = search_word;

	if(search_word == ""){
		res.json({
			"Result" : "Key Word None"
		});
	}

	if(search_check == 0){
		db_search.menu_search(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "Fail",
					"MSG" : row
				})
			}
		});
	}else if(search_check == 1){
		db_search.area_search(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "Fail",
					"MSG" : row
				});
			}
		});
	}else if(search_check == 2){ // 임시
		db_search.area_menu_search(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "Fail",
					"MSG" : row
				});
			}
		});
	}else{
		db_search.cafe_search(data, function(check, row){
			if(check){
				res.json({
					"List" : row
				});
			}else{
				res.json({
					"Result" : "Fail",
					"MSG" : row
				});
			}
		});
	}
});

// router.post('/menu/select', function(req, res, next){
// 	console.log('req.body', req.body);
// 	var menu_no = req.body.Menu_No;

// 	if(true){
// 		res.json({
// 			"Menu_Name" : "초코케익",
// 			"Menu_Price" : "4000", 
// 			"Menu_Img" : "이미지", 
// 			"Menu_Info" : "맛있는 초코 케익입니다.",  
// 			"Café_Name" : "잘블랑제리",
// 			"Star_Man" : "4", 
// 			"Star_Woman" : "5", 
// 		});
// 	}else{
// 		res.json({
// 			"Result" : "Menu Select Fail"
// 		});
// 	}
// });

router.post('/random', function(req, res, next){
	db_search.menu_random(1, function(check, row){
		if(check){
			var menu = row;
			var choice = new Array();
			var cnt = 0;
			for(var idx=0; idx<4; idx++){
				var n = parseInt((Math.random()*row.length));
				choice[idx] = menu[n];
				for(var b=0; b<idx; b++){
					if(choice[b]==menu[n]){
						idx--;
						break;
					}
				}
			}
			res.json({
				"Word_List" : [choice[0].menu_name, choice[1].menu_name, choice[2].menu_name, choice[3].menu_name]
			});
		}else{
			res.json({
				"Result" : "Fail",
				"MSG" : row
			})
		}
	});
});

router.post('/auto', function(req, res, next){
	logger.log('req.body', req.body);

	db_search.auto_search(function(check, row1, row2, row3){
		if(check){
			res.json({
				"List_Menu" : row1,
				"List_Cafe" : row2,
				"List_Area" : row3
			});
		}else{
			res.json({
				"Result" : "Fail",
				"MSG" : row
			});
		}
	});
});

router.post('/default', function(req, res, next){
	db_search.default_view(function(check, row){
		if(check){
			res.json({
				"List" : row
			});
		}else{
			res.json({
				"Result" : "Fail",
				"MSG" : row
			});
		}
	});
});

module.exports = router;