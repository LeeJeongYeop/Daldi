var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var logger = require('../logger');
var db_config = require('./db_config');
var pool = mysql.createPool(db_config);
var async = require('async');

/*****************************/
/*		비회원 지역 검색		    */ 
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
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
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
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
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
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
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
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
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
					var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
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
				function(err, row1, row2, row3, row4, row5){
					if(err){
						logger.error('err', err);
						check = false;
						done(check);
						conn.release();
					}else{
						done(check, row1, row2, row3, row4, row5);
						conn.release();
					}
				});
}
});
};

/*****************************/
/*		회원 설문 조사 		    */ 
/***************************/
exports.survey = function(data, done){
	check = true;
	msg = "";
	logger.info('data', data);
	pool.getConnection(function(err, conn){
		if(err){
			logger.error('err',err);
			check = false;
			msg = "DB connect error";
			done(check, msg);
			conn.release();
		}else{
			var sql = "select count(*) cnt from wm_survey";
			conn.query(sql, data[0], function(err, row){
				if(err){
					logger.error('err',err);
					check = false;
					msg = "설문조사 중복 에러";
					done(check, msg);
					conn.release();
				}else{
					if(row[0].cnt == 1){
						data.push(data[0]);
						data.shift();
						var sql = "update wm_survey set suv_price1=?, suv_price2=?, suv_g1=?, suv_g2=?, suv_g3=?, suv_g4=?, suv_g5=? where user_no=?";
						conn.query(sql, data, function(err, msg){
							if(err){
								logger.error('err',err);
								check = false;
								msg = "설문조사 수정 입력 DB 에러";
								done(check, msg);
								conn.release();		
							}else{
								if(msg.affectedRows == 1){
									msg = "Survey Update Success";
									done(check, msg);
									conn.release();
								}else{
									logger.error('err',err);
									check = false;
									msg = "설문조사 수정 에러";
									done(check, msg);
									conn.release();	
								}
							}
						});
					}else{
						var sql = "insert into wm_survey(user_no, suv_price1, suv_price2, suv_g1, suv_g2, suv_g3, suv_g4, suv_g5) values(?,?,?,?,?,?,?,?)";
						conn.query(sql, data, function(err, msg){
							if(err){
								logger.error('err',err);
								check = false;
								msg = "설문조사 입력 DB 에러";
								done(check, msg);
								conn.release();		
							}else{
								if(msg.affectedRows == 1){
									msg = "Survey Success";
									done(check, msg);
									conn.release();
								}else{
									logger.error('err',err);
									check = false;
									msg = "설문조사 에러";
									done(check, msg);
									conn.release();	
								}
							}
						});
					}
				}
			});		
}
});
};



/*****************************/
/*		회원 지역 검색 		    */ 
/***************************/
exports.search_user = function(data, done){
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
			var sql = "select suv_price1, suv_price2, suv_g1, suv_g2, suv_g3, suv_g4, suv_g5 from wm_survey where user_no=?";
			conn.query(sql, data[0], function(err, suv){
				if(err){
					logger.error('err', err);
					check = false;
					msg = "회원 설문 가져오기 에러";
					done(check, msg);
				}else{
					if(suv.length > 0){
						async.waterfall([
							function(callback){
								var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
								+"FROM wm_menu m, wm_cafe c "
								+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=? and m.menu_price <=? and c.cafe_kind =? "
								+"HAVING distance <= 0.7 ORDER BY distance limit 1";
								conn.query(sql, [data[1], data[2], data[1], '%'+suv[0].suv_g1+'%', suv[0].suv_price1, suv[0].suv_price2, data[3]], function(err, row){
									if(err){
										callback(err);
									}else{
										if(typeof row[0] !== 'undefined'){
											callback(null, row);
											logger.info('row', row);
										}else{
											callback(null, [{}]);
										}	
									}
								});
							},
							function(row1, callback){
								var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
								+"FROM wm_menu m, wm_cafe c "
								+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=? and m.menu_price <=? and c.cafe_kind =? "
								+"HAVING distance <= 0.7 ORDER BY distance limit 1";
								conn.query(sql, [data[1], data[2], data[1], '%'+suv[0].suv_g2+'%', suv[0].suv_price1, suv[0].suv_price2, data[3]], function(err, row){
									if(err){
										callback(err);
									}else{
										if(typeof row[0] !== 'undefined'){
											callback(null, row1, row);
											logger.info('row', row);
										}else{
											callback(null, row1, [{}]);
										}	
									}
								});
							},
							function(row1, row2, callback){
								var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
								+"FROM wm_menu m, wm_cafe c "
								+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=? and m.menu_price <=? and c.cafe_kind =? "
								+"HAVING distance <= 0.7 ORDER BY distance limit 1";
								conn.query(sql, [data[1], data[2], data[1], '%'+suv[0].suv_g3+'%', suv[0].suv_price1, suv[0].suv_price2, data[3]], function(err, row){
									if(err){
										callback(err);
									}else{
										if(typeof row[0] !== 'undefined'){
											callback(null, row1, row2, row);
											logger.info('row', row);
										}else{
											callback(null, row1, row2, [{}]);
										}	
									}
								});
							},
							function(row1, row2, row3, callback){
								var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
								+"FROM wm_menu m, wm_cafe c "
								+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=? and m.menu_price <=? and c.cafe_kind =? "
								+"HAVING distance <= 0.7 ORDER BY distance limit 1";
								conn.query(sql, [data[1], data[2], data[1], '%'+suv[0].suv_g4+'%', suv[0].suv_price1, suv[0].suv_price2, data[3]], function(err, row){
									if(err){
										callback(err);
									}else{
										if(typeof row[0] !== 'undefined'){
											callback(null, row1, row2, row3, row);
											logger.info('row', row);
										}else{
											callback(null, row1, row2, row3, [{}]);
										}	
									}
								});
							},
							function(row1, row2, row3, row4, callback){
								var sql = "SELECT m.menu_no, m.menu_name, m.menu_price, m.menu_category, m.menu_image_1, c.cafe_name, c.cafe_address, c.cafe_lat, c.cafe_lon, (6371*acos(cos(radians(?))*cos(radians(c.cafe_lat))*cos(radians(c.cafe_lon)-radians(?))+sin(radians(?))*sin(radians(c.cafe_lat)))) AS distance "
								+"FROM wm_menu m, wm_cafe c "
								+"where m.cafe_no = c.cafe_no and m.menu_name like ? and m.menu_price >=? and m.menu_price <=? and c.cafe_kind =? "
								+"HAVING distance <= 0.7 ORDER BY distance limit 1";
								conn.query(sql, [data[1], data[2], data[1], '%'+suv[0].suv_g5+'%', suv[0].suv_price1, suv[0].suv_price2, data[3]], function(err, row){
									if(err){
										callback(err);
									}else{
										if(typeof row[0] !== 'undefined'){
											callback(null, row1, row2, row3 , row4, row);
											logger.info('row', row);
										}else{
											callback(null, row1, row2, row3 , row4, [{}]);
										}	
									}
								});
							}
							],
							function(err, row1, row2, row3, row4, row5){
								if(err){
									logger.error('err', err);
									check = false;
									done(check);
									conn.release();
								}else{
									done(check, row1, row2, row3, row4, row5);
									conn.release();
								}
							});
}else{
	check = false;
	msg = "설문 작성하지 않은 회원";
	done(check, msg);
}
}
});
}
});
};