/**
 * Created by vikramaditya on 3/25/15.
 */
var url = "http://192.168.1.23:9292/kitchen/";
var uploadUrl = "http://192.168.1.23:9292/imageupload";

app.controller('LoginController',function($scope,$rootScope,$location,$http,$cookieStore){

    var kitchenid = $cookieStore.get("kitchenid");

    $scope.getMenu = function(){

        var getUrl = url+$scope.kitchenid+"/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data
                $location.path("/menu");
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu")
            });
    }

    if(kitchenid) // Logged in already
    {
        console.log("Yes Cookie ",kitchenid);
        $rootScope.kitchenid = kitchenid;
        $scope.kitchenid = kitchenid;
        $scope.getMenu();

    }

    $scope.login = function(){

        console.log("No Cookie ",$scope.kitchenid);
        $rootScope.kitchenid = $scope.kitchenid;
        $cookieStore.put("kitchenid",$scope.kitchenid);
        $scope.getMenu();
    }
});
app.controller('MenuController',function($scope,$rootScope,$location,$http,$cookieStore){

    $scope.visibility = false;
    $scope.menu = $rootScope.menu;

    $scope.addItemClicked = function(){
        $location.path("/addItem");
    };
    var postUrl = url+$rootScope.kitchenid+"/menu"

    $scope.postItem = function(){

        console.log("Item posting: ", $rootScope.menu);

        $http.post(postUrl, $rootScope.menu).
            success(function(data, status, headers, config) {
                console.log("Posted Successfully");
                $scope.visibility = true;

                var kitchenid = $cookieStore.get("kitchenid");
                $rootScope.kitchenid = kitchenid;

                $scope.getRefreshedMenu();

            }).
            error(function(data, status, headers, config) {
                window.alert("Error in posting");
            });
    };
    $scope.getRefreshedMenu = function(){


        var getUrl = url+$rootScope.kitchenid+"/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data;
                $scope.menu = data;
                $scope.visibility = false;
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu")
            });
    };
    $scope.editItem = function(itemId){
        $rootScope.currentItemId = itemId;
        $location.path("/edit");
    };
    $scope.removeItem = function(itemId){

        delete $rootScope.menu.items[itemId];
        delete $scope.menu.items[itemId];
        $scope.menu = $rootScope.menu;
    };
    if(!$scope.menu){
        var kitchenid = $cookieStore.get("kitchenid");
        $rootScope.kitchenid = kitchenid;
        $scope.visibility = true;
        $scope.getRefreshedMenu();
    }
});
app.controller('addItemViewController',function($scope,$rootScope,$location,fileUpload){

    //$rootScope.menu;
    $scope.visibility = false;
    $scope.itemid = Math.floor(Date.now());
    $scope.item = {name: "",desc: "",imgurl:"/images/icons/placeholder--medium.png"};
    //$scope.itemImage = "/images/icons/placeholder--medium.png";

    $scope.addClicked = function(){
        $rootScope.menu.items[$scope.itemid] = $scope.item;
        $rootScope.itemid = $scope.itemid;
        $location.path("/menu");
    }

    $scope.uploadImage = function(){

        $scope.visibility = true;

        var file = $scope.myFile;

        console.log('file is ' + JSON.stringify(file));

        fileUpload.uploadFileToUrl(file, uploadUrl,function(result){
            //console.log("On callback result",result);
            $scope.item.imgurl = result.url;
            $scope.visibility = false;
        });
    }
});
app.controller('EditController',function($scope,$rootScope,$location,fileUpload){

    $scope.visibility = false;
    $scope.currentItemId = $rootScope.currentItemId;
    $scope.item = $rootScope.menu.items[$scope.currentItemId];

    $scope.edit = function(){
        $rootScope.menu.items[$scope.currentItemId] = $scope.item;
        $location.path("/menu");
    }
    $scope.uploadImage = function(){
        $scope.visibility = true;
        var file = $scope.myFile;

        //console.log('updated file is ' + JSON.stringify(file));

        fileUpload.uploadFileToUrl(file, uploadUrl,function(result){
            console.log("Image updated",result);
            $scope.item.imgurl = result.url;

            $scope.visibility = false;
        });

    }
});
app.controller('mainController',function($rootScope,$cookieStore,$scope,$location){

    $rootScope.menuLogout = $scope.menuLogout
    $rootScope.menuBack = $scope.menuBack
    $scope.menuLogout = "Logout";
    $scope.menuBack = "Back";

    $scope.logout = function(){
        $rootScope.kitchenid = "";
        $cookieStore.remove("kitchenid");
        $location.path("/login");
    }
    $scope.back = function(){
        $location.path("/menu");
    }
})

/*
    $rootScope.menu =
    {
        items:{
            "itemid1":{
                name: "Coffee",
                desc: "Cold Coffee",
                imgurl: "http://www.purewatergazette.net/blog/wp-content/uploads/2014/09/coffee02-300x279.jpg"
            },

            "itemid2":{
                name: "Tea",
                desc: "Hot Tea",
                imgurl: "http://www.purewatergazette.net/blog/wp-content/uploads/2014/09/coffee02-300x279.jpg"
            }

        }

    };
*/
