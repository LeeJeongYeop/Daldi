var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var async = require('async');

/*****************************/
/*			지역 검색 		    */ 
/***************************/
exports.search = function(data, done){
	check = true;
	msg = "";
	logger.info('data', data);
	
	pool.getConnection(function(err, conn){
		if(err){  // DB 연결 오류
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			async.waterfall([
				function(callback){
					var choice = ["아메리카노", "라떼", "프라푸치노", "모카", "에스프레소"];
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
					+"FROM wm_menu m, wm_cafe c "
					+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=3000 and m.menu_price <= 7000 and c.cafe_kind =? "
					+"HAVING distance <= 0.7 ORDER BY distance limit 1";
					async.eachSeries(choice, function(ch, callback1){
						conn.query(sql, [data[0], data[1], data[0], '%'+ch+'%', data[2]], function(err, row){
							logger.info('ch', ch);
							if(err){
								callback(err);
							}else{
								if(err){
									callback(err);
								}else{
									if(typeof row[0] !== 'undefined'){
										callback(null, row);
										logger.info('row', row);
									}else{
										callback1();
									}
								}
							}
						});
					},function(err){
						if(err){
							msg = "waterfall 에러";
							callback(err, msg);
						}else{
							callback(null, [{}]);
						}
					});
				},
				function(row1, callback){
					var choice = ["스무디", "버블티", "에이드", "홍차", "아이스티", "녹차"];
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
					+"FROM wm_menu m, wm_cafe c "
					+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=3000 and m.menu_price <= 7000 and c.cafe_kind =? "
					+"HAVING distance <= 0.7 ORDER BY distance limit 1";
					async.eachSeries(choice, function(ch, callback1){
						conn.query(sql, [data[0], data[1], data[0], '%'+ch+'%', data[2]], function(err, row){
							logger.info('ch', ch);
							if(err){
								callback(err);
							}else{
								if(err){
									callback(err);
								}else{
									if(typeof row[0] !== 'undefined'){
										callback(null, row1, row);
										logger.info('row', row);
									}else{
										callback1();
									}
								}
							}
						});
					},function(err){
						if(err){
							msg = "waterfall 에러";
							callback(err, msg);
						}else{
							callback(null, row1, [{}]);
						}
					});
				},
				function(row1, row2, callback){
					var choice = ["눈꽃빙수", "아이스크림", "팥빙수", "아포가토", "케이크빙수"];
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
					+"FROM wm_menu m, wm_cafe c "
					+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=3000 and m.menu_price <= 7000 and c.cafe_kind =? "
					+"HAVING distance <= 0.7 ORDER BY distance limit 1";
					async.eachSeries(choice, function(ch, callback1){
						conn.query(sql, [data[0], data[1], data[0], '%'+ch+'%', data[2]], function(err, row){
							logger.info('ch', ch);
							if(err){
								callback(err);
							}else{
								if(err){
									callback(err);
								}else{
									if(typeof row[0] !== 'undefined'){
										callback(null, row1, row2, row);
										logger.info('row', row);
									}else{
										callback1();
									}
								}
							}
						});
					},function(err){
						if(err){
							msg = "waterfall 에러";
							callback(err, msg);
						}else{
							callback(null, row1, row2, [{}]);
						}
					});
				},
				function(row1, row2, row3, callback){
					var choice = ["치즈케이크", "티라미수", "초코케이크", "생크림케이크", "에클레어"];
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
					+"FROM wm_menu m, wm_cafe c "
					+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=3000 and m.menu_price <= 7000 and c.cafe_kind =? "
					+"HAVING distance <= 0.7 ORDER BY distance limit 1";
					async.eachSeries(choice, function(ch, callback1){
						conn.query(sql, [data[0], data[1], data[0], '%'+ch+'%', data[2]], function(err, row){
							logger.info('ch', ch);
							if(err){
								callback(err);
							}else{
								if(err){
									callback(err);
								}else{
									if(typeof row[0] !== 'undefined'){
										callback(null, row1, row2, row3, row);
										logger.info('row', row);
									}else{
										callback1();
									}
								}
							}
						});
					},function(err){
						if(err){
							msg = "waterfall 에러";
							callback(err, msg);
						}else{
							callback(null, row1, row2, row3, [{}]);
						}
					});
				},
				function(row1, row2, row3, row4, callback){
					var choice = ["와플", "초콜릿", "타르트", "쿠키"];
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
					+"FROM wm_menu m, wm_cafe c "
					+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=3000 and m.menu_price <= 7000 and c.cafe_kind = ? "
					+"HAVING distance <= 0.7 ORDER BY distance limit 1";
					async.eachSeries(choice, function(ch, callback1){
						conn.query(sql, [data[0], data[1], data[0], '%'+ch+'%', data[2]], function(err, row){
							logger.info('ch', ch);
							if(err){
								callback(err);
							}else{
								if(err){
									callback(err);
								}else{
									if(typeof row[0] !== 'undefined'){
										callback(null, row1, row2, row3, row4, row);
										logger.info('row', row);
									}else{
										callback1();
									}
								}
							}
						});
					},function(err){
						if(err){
							msg = "waterfall 에러";
							callback(err, msg);
						}else{
							callback(null, row1, row2, row3, row4, [{}]);
						}
					});
				},
				],
				function(err, row1, row2, row3, row4, row5, row6){
					if(err){
						logger.error('err', err);
						check = false;
						done(check);
						conn.release();
					}else{
						done(check, row1, row2, row3, row4, row5, row6);
						conn.release();
					}
				});
}
});
};