var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var db_cafe = require('../models/db_cafe');
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
	var img = fs.readFileSync('./public/images/cafe/' + imgName + '.jpg');
	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.end(img, 'binary');
});

router.post('/compare', function(req, res, next){
	console.log('req.body', req.body);

	db_cafe.compare(function(check, row){
		if(check){
			res.json({
				"List" : row
			});	
		}else{
			res.json({
				"Result" : "Cafe Compare Fail",
				"MSG" : row
			});			
		}
	});
});

router.post("/compare/list", function(req, res, next){
	console.log('req.body', req.body);
	var cafe_no = req.body.Cafe_No;
	var data = cafe_no

	db_cafe.compare_list(data, function(check, row){
		if(check){
			res.json({
				"List" : row
			});	
		}else{
			res.json({
				"Result" : "Cafe Compare List Fail",
				"MSG" : row
			});			
		}
	});
});

module.exports = router;