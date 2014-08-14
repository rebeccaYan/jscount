/**
 * 计数脚本。查看一个文件夹下，所有文件数量、js文件数量、js代码行数
 * @author yanyinhong 2014-08-13
 */

(function(){
    var fs = require('fs');
    var path = require('path');
    var rocambole = require('rocambole');
    // console.log(path.extname("path.html"));

    var jscount = (function(){
        var count = {};
        count['file_count'] = 0;
        count['js_file_count'] = 0;
        count['js_line_count'] = 0;
        count['js_com_line_count'] = 0;
        count['js_comments_percent'] = 0;
        count['css_file_count'] = 0;
        count['css_line_count'] = 0;
        count['less_file_count'] = 0;
        count['less_line_count'] = 0;
        count['html_file_count'] = 0;
        count['html_line_count'] = 0;
               
        function handFile(pathname, item){
            var stats = fs.statSync(pathname);
            
            if (!stats.isDirectory()) {
                var extname = path.extname(item);

                var res = extname === '.js' || extname === '.html' || extname === '.css' || extname === '.less';

                //计算相应后缀文件
                if (res) {
                    var prefix = extname.substr(1);
                    //计算后缀文件的文件个数
                    count[prefix + '_file_count']++;  

                    var contents = fs.readFileSync(pathname, 'utf8');
                    var line_count = contents.match(/\n/g);

                    //计算后缀文件的代码行数
                    if (line_count instanceof Array) {
                        count[prefix + '_line_count'] += line_count.length +1;
                    } else {
                        count[prefix + '_line_count'] += 1;
                    }   

                    //计算.js文件的注释行/代码行的占比
                    if (extname === '.js') {
                        //contents 头行处理，其以#!开头时，处理为空
                        var contents = contents.replace(/[\s]*#!.*/g,'');


                        var ast = rocambole.parse(contents);
                        var tokens = ast.tokens;

                        tokens.forEach(function(item){
                            //计算单行注释所占的行数
                            if (item.type === 'LineComment') {
                                count['js_com_line_count'] += 1;
                            }

                            //计算多行注释所占的行数
                            if (item.type === 'BlockComment') {
                                var tempArr = item.value.match(/\n/g);
                                if (tempArr instanceof Array) {
                                    count['js_com_line_count'] += tempArr.length + 1;
                                } else {
                                    count['js_com_line_count'] += 1;
                                }
                            }
                        });
                    }

                    //计算注释所占比
                    if (count['js_line_count'] === 0) {
                        count['js_comments_percent'] = 'no js code';
                    } else if (count['js_com_line_count'] === 0){
                        count['js_comments_percent'] = 'no comments';
                    } else {
                        var divd = count['js_com_line_count'];
                        var div = count['js_line_count']; 
                        var result = Math.round((divd / div * 10000)) / 100 
                        count['js_comments_percent'] = result + '%';
                    }
                }
            }
        };    
        
        return {
            getCount: function () {
                return count;
            },
            fileCount: function fileCount(path, floor) {
                handFile(path, floor); //判断文件类型（文件夹/文件/js文件，做相应处理）
                floor++;
                var files = fs.readdirSync(path);
                files.forEach(function(item){
                    //去除目录.和..
                    if (!item.match(/^\.$/g) && !item.match(/^\.\.$/g) ) {
                        var nextPath = path + '/' + item;
                        var stats = fs.statSync(nextPath);
                        count['file_count'] += 1;
                        
                        if (stats.isDirectory()) {
                            //递归处理目录文件
                            fileCount(nextPath, floor);
                        } else {
                            //处理非目录文件
                            handFile(nextPath, item);
                        }
                    }
                });            
            } 
        }
        
    })();

    
    var arguments = process.argv.splice(2);

    if (arguments[0] !== undefined && typeof arguments[0] === 'string') {
        jscount.fileCount(arguments[0], 0);
        console.log(jscount.getCount());
    } else {
        console.log("please input the directory path"); 
    }
})();