/**
 * Created by vikramaditya on 3/25/15.
 */
app.controller('LoginController',function($scope,$rootScope,$location,$http){

    console.log("kitchenid ", $rootScope.kitchenid );

    $scope.getMenu = function(){
        var getUrl = "http://192.168.1.23:9292/kitchen/"+$rootScope.kitchenid+"/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data
                $location.path("/menu");
            }).
            error(function(data, status, headers, config) {
                console.log("status", data);
                window.alert("Failed to fetch Menu")
            });
        //$rootScope.menu =
        //{
        //    items:{
        //        "itemid1":{
        //            name: "Coffee",
        //            desc: "Cold Coffee",
        //            imgurl: "http://www.purewatergazette.net/blog/wp-content/uploads/2014/09/coffee02-300x279.jpg"
        //        },
        //
        //        "itemid2":{
        //            name: "Tea",
        //            desc: "Hot Tea",
        //            imgurl: "http://www.purewatergazette.net/blog/wp-content/uploads/2014/09/coffee02-300x279.jpg"
        //        }
        //
        //    }
        //
        //};
    }

    if  ($rootScope.kitchenid)
    {
        //$location.path("/menu");
        $scope.getMenu();
    }

    $scope.login = function(){
        $rootScope.kitchenid = $scope.kitchenid;
        $scope.getMenu();


    }

});


app.controller('MenuController',function($scope,$rootScope,$location,$http){

    $scope.menu = $rootScope.menu;

    $scope.addItemClicked = function(){
        $location.path("/addItem");
    }
    var postUrl = "http://192.168.1.23:9292/kitchen/"+$rootScope.kitchenid+"/menu"

    $scope.postItem = function(){

        console.log("Item posting: ", $rootScope.menu);

        $http.post(postUrl, $rootScope.menu).
            success(function(data, status, headers, config) {
                console.log("Posted Successfully");
                $scope.getRefreshedMenu();
            }).
            error(function(data, status, headers, config) {
                window.alert("Error in posting");
            });
    }

    $scope.getRefreshedMenu = function(){
        var getUrl = "http://192.168.1.23:9292/kitchen/"+$rootScope.kitchenid+"/menu";
        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data;
                $scope.menu = data;
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu")
            });
        }
});


app.controller('addItemViewController',function($scope,$rootScope,$location){

    //$rootScope.menu;
    $scope.itemid = Math.floor(Date.now());
    $scope.item = {name: "",desc: "",imgurl:""};

    $scope.addClicked = function(){
        $rootScope.menu.items[$scope.itemid] = $scope.item;

        $rootScope.itemid = $scope.itemid;
        $location.path("/menu");
    }
    //console.log($scope.menu);

});