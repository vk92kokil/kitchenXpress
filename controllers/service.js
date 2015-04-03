/**
 * Created by vikramaditya on 3/27/15.
 */

app.service('fileUpload', ['$http', function ($http,$scope) {

    this.uploadFileToUrl = function(file,fileName,successFn){
        var fd = new FormData();
        fd.append('file', file);

        console.log("File: ",file);
        var parseFile = new Parse.File(fileName, file);
        parseFile.save().then(function(){
            successFn({url: parseFile.url()});
        },function(error){console.log(error)});

    //    $http.post(uploadUrl, fd, {
    //        transformRequest: angular.identity,
    //        headers: {'Content-Type': undefined}
    //    })
    //        .success(function(data){
    //            //console.log("onsuccess data ",data);
    //            successFn(data);
    //        })
    //        .error(function(data){
    //            console.log("failed",data);
    //        });
    }
}]);
