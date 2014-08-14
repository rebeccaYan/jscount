/**
 * 计数脚本。查看一个文件夹下，所有文件数量、js文件数量、js代码行数
 * @author yanyinhong 2014-08-13
 */

(function(){
    var fs = require('fs');

    var jscount = (function(){
        var count = {};
        count['file_count'] = 0;
        count['jsfile_count'] = 0;
        count['jsline_count'] = 0;
        
        // var fs = require('fs');
        
        function handFile(path, item){
            var stats = fs.statSync(path);
            
            if (!stats.isDirectory()) {
                var res = item.match(/.*\.js/g);
                if (res) {
                    count['jsfile_count']++;
                    
                    var contents = fs.readFileSync(path, 'utf8');
                    
                    var line_c = contents.match(/\n/g);
                    if (line_c instanceof Array) {
                        count['jsline_count'] += line_c.length + 1;
                    } else {
                        count['jsline_count'] += 1;
                    }
                }
            }
        };    
        
        return {
            getCount: function () {
                return count;
            },
            fileCount: function (path, floor) {
                handFile(path, floor); //判断文件类型（文件夹/文件/js文件，做相应处理）
                floor++;
                var files = fs.readdirSync(path);
                files.forEach(function(item){
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
                });            
            } 
        }
        
    })();

    
    var arguments = process.argv.splice(2);
    // var str = fs.realpathSync('.'); 
    // str = str.replace(/\\/g,'/');

    if (arguments[0] !== undefined && typeof arguments[0] === 'string') {
        jscount.fileCount(arguments[0], 0);
        console.log(jscount.getCount());
    } else {
        console.log("please input the directory path");
    }


    
})();

