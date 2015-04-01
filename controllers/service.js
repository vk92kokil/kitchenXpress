/**
 * Created by vikramaditya on 3/27/15.
 */

app.service('fileUpload', ['$http', function ($http,$scope) {

    this.uploadFileToUrl = function(file, uploadUrl,successFn){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
            .success(function(data){
                //console.log("onsuccess data ",data);
                successFn(data);
            })
            .error(function(data){
                console.log("failed",data);
            });
    }
}]);
