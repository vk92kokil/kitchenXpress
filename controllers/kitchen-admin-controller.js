/**
 * Created by vikramaditya on 3/25/15.
 */
/* Controller for kitchen admin end */


var PUBNUB_demo;
var alreadyExists;

app.controller('LoginController', function($scope, $rootScope, $location, $http, $cookieStore) {

    var kitchenid = $cookieStore.get("kitchenid");
    var roleId = $cookieStore.get("roleId");
    $scope.getMenu = function() {

        var getUrl = url + $scope.kitchenid + "/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data;
                $location.path("/menu");
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu");
            });
    };

    if(roleId && kitchenid){ // Logged in already

        $scope.kitchenid = kitchenid;
        $rootScope.kitchenid = $scope.kitchenid;

        switch (roleId){
            case "Admin": //Admin
                $scope.getMenu();
                break;
            case "Staff": // Staff
                $location.path("/staffMenu");
                break;
            default: //User
                $location.path("/userMenu");
        }
    }else{
        $location.path("/login");
    }

    $scope.login = function(roleId) {

        if(! $scope.kitchenid){
            window.alert("Empty kitchen id");
            $location.path("/login");
        }else{
            switch (roleId){
                case "Admin": //Admin
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "Admin");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $scope.getMenu();
                    break;
                case "Staff": // Staff
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "Staff");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $location.path("/staffMenu");
                    break;
                default: //User
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "User");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $location.path("/userMenu");
            }
        }
    };

});
app.controller('MenuController', function($scope, $rootScope, $location, $http, $cookieStore) {

    $scope.visibility = false;
    $scope.menu = $rootScope.menu;
    $scope.addItemClicked = function() {
        $location.path("/addItem");
    };
    var postUrl = url + $rootScope.kitchenid + "/menu";

    $scope.postItem = function() {

        $scope.visibility = true;

        var kitchenid = $cookieStore.get("kitchenid");
        $rootScope.kitchenid = kitchenid;

        var Menu = Parse.Object.extend("Menu");
        if(alreadyExists){ // then update Menu
            var query = new Parse.Query(Menu);

            query.equalTo('kitchenid',kitchenid);

            query.first().then(function(saveobj){

                //console.log('Menu saving to server');

                saveobj.set("data", $rootScope.menu);

                saveobj.save(null,function(menu){

                    $scope.$apply(function(){
                        console.log("done saving");
                        $scope.getRefreshedMenu();
                    });
                });
            });
        }else{ // create new Menu
            var menuObj = new Menu();
            menuObj.set("kitchenid",kitchenid);
            menuObj.set("data",$rootScope.menu);

            menuObj.save(null,{

                    success: function(){
                        alreadyExists = true;
                        console.log("Created new Menu successfully");
                        $scope.getRefreshedMenu();
                    },
                    error:  function(){
                        alreadyExists = false;
                    }
            });
        }
    };
    $rootScope.getRefreshedMenu = function() {

        var Menu = Parse.Object.extend("Menu");
        var query = new Parse.Query(Menu);
        query.equalTo("kitchenid", $rootScope.kitchenid);
        query.first({
            success: function(data) {
                // The object was retrieved successfully.
                $scope.$apply(function () {

                    console.log(data,"done!!",$rootScope.kitchenid);
                    $rootScope.menu = data.get("data");
                    $scope.menu = data.get("data");
                    $scope.visibility = false;

                });
            },
            error: function(object, error) {

                console.log(object,error);
                window.alert("Failed to fetch Menu");

            }
        });

        /*
        var getUrl = url + $rootScope.kitchenid + "/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $rootScope.menu = data;
                $scope.menu = data;
                $scope.visibility = false;
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu");
            });
        */
    };
    $scope.editItem = function(itemId) {
        $cookieStore.put("itemId",itemId);
        $rootScope.currentItemId = itemId;
        $location.path("/edit");

    };
    $scope.removeItem = function(itemId) {

        delete $rootScope.menu.items[itemId];
        delete $scope.menu.items[itemId];
        $scope.menu = $rootScope.menu;
    };
    if (!$scope.menu) {
        var kitchenid = $cookieStore.get("kitchenid");
        $rootScope.kitchenid = kitchenid;
        $scope.kitchenid = kitchenid;
        $scope.visibility = true;
        $scope.getRefreshedMenu();
    }
});
app.controller('addItemViewController', function($scope, $rootScope, $location, fileUpload, $mdDialog) {

    $scope.addItem_fileName = "Choose";

    $scope.visibility = false;
    $scope.itemid = Math.floor(Date.now());
    $scope.item =
    {
        name: "",
        desc: "",
        imgurl: "http://files.parsetfss.com/f2586993-6407-483f-bead-faca0ff98f78/tfss-6b15990d-fd37-4971-8bb7-3e805128f0a7-foodplaceholder.jpg"
    };

    $scope.addClicked = function() {
        $rootScope.menu.items[$scope.itemid] = $scope.item;
        $rootScope.itemid = $scope.itemid;
        $location.path("/menu");
    };

    $scope.uploadImage = function() {

        $scope.visibility = true;

        var file = $scope.myFile;
        console.log("file   ",file);
        var fileName = $scope.addItem_fileName;

        fileUpload.uploadFileToUrl(file,fileName,function(result) {
            //console.log("On callback result",result);
            $scope.$apply(function () {
                $scope.item.imgurl = result.url;
                $scope.visibility = false;
            });
        });
    };
    $scope.cancel = function() {

        $location.path("/menu");

    };
    $scope.chooseFile = function() {

        document.getElementById("exampleInputFile").click();

        document.getElementById("exampleInputFile").onchange = function () {

            var itemName =  this.value.substr(this.value.lastIndexOf("\\")+1,this.value.length);
            $scope.$apply(function() {
                $scope.addItem_fileName = itemName;
            });
        };
    }
});
app.controller('EditController', function($scope, $rootScope, $location, fileUpload,$cookieStore) {

    $scope.addItem_fileName = "Choose";

    $scope.visibility = false;
    $scope.currentItemId = $rootScope.currentItemId;
    if(! $scope.currentItemId){
        $scope.currentItemId = $cookieStore.get("itemId");
        $rootScope.currentItemId = $scope.currentItemId;
    }
    $scope.item = $rootScope.menu.items[$scope.currentItemId];

    $scope.edit = function() {
        $rootScope.menu.items[$scope.currentItemId] = $scope.item;
        $cookieStore.remove("itemId");
        $location.path("/menu");
    };
    $scope.uploadImage = function() {
        $scope.visibility = true;

        var file = $scope.myFile;
        //console.log('updated file is ' + JSON.stringify(file));

        var fileName = $scope.addItem_fileName;

        fileUpload.uploadFileToUrl(file, fileName, function(result) {

            $scope.$apply(function () {
                $scope.item.imgurl = result.url;
                $scope.visibility = false;
            });
        });

    };
    $scope.chooseFile = function() {

        document.getElementById("exampleInputFile").click();

        document.getElementById("exampleInputFile").onchange = function () {
            //console.log('Selected file:',this.value.split("\\")[2]);

            var itemName =  this.value.substr(this.value.lastIndexOf("\\")+1,this.value.length);
            $scope.$apply(function() {
                $scope.addItem_fileName = itemName;
            });
        };
    }
});
app.controller('mainController', function($rootScope, $cookieStore, $scope, $location, $http) {

    $rootScope.menuLogout = $scope.menuLogout;
    $rootScope.menuBack = $scope.menuBack;
    $scope.menuLogout = "Logout";
    $scope.menuBack = "Back";


    $rootScope.showToolBar = false;
    $rootScope.showMenu = false;
    var rid = $cookieStore.get("roleId");

    if(rid == "Admin"){
        $rootScope.showToolBar = true;
        $rootScope.showMenu = true;
    }
    else if(rid == "Staff" || rid == "User"){
        $rootScope.showToolBar = true;
    }
    $scope.logout = function() {

        $rootScope.showToolBar = false;
        $rootScope.showMenu = false;

        //$rootScope.kitchenid = "";
        //$rootScope.userId = "";
        $rootScope.tableId = "";
        $rootScope.roleId = "";

        //$scope.kitchenid = "";
        //$scope.userId = "";
        $scope.tableId = "";
        $scope.roleId = "";

        $cookieStore.remove("roleId");
        //$cookieStore.remove("userId");//
        $cookieStore.remove("tableId");//
        //$cookieStore.remove("kitchenid");
        $cookieStore.remove("allCompletedOrder");

        $location.path("/login");
    };
    $scope.back = function() {
        console.log("menu show");
        $location.path("/menu");
    };
    var kid = $cookieStore.get("kitchenid");
    if(kid){
        $scope.kitchenid = kid;
        $rootScope.kitchenid = kid;
    }

    /*
    var kitchenid = $cookieStore.get("kitchenid");
    var roleId = $cookieStore.get("roleId");

    $scope.getMenu = function() {

            var getUrl = url + $scope.kitchenid + "/menu";

            $http.get(getUrl).
                success(function(data, status, headers, config) {
                    $rootScope.menu = data;
                    $location.path("/menu");
                }).
                error(function(data, status, headers, config) {
                    window.alert("Failed to fetch Menu");
                });
        };
    if(roleId && kitchenid){

            if(roleId == "User"){
                //user logged in already

                // check for userid and table number also

                var userid = $cookieStore.get("userId");
                var tableid = $cookieStore.get("tableId");

                if(userid && tableid){

                    $scope.showToolBar = true;

                    $scope.kitchenid = kitchenid;
                    $rootScope.kitchenid = $scope.kitchenid;

                    $scope.userId = userid;
                    $rootScope.userId = $scope.userId;

                    $scope.tableId = tableid;
                    $rootScope.tableId = $scope.tableId;

                    $location.path("/userMenu");

                }else{
                    $location.path("/login");
                }

            }else{
                // staff or admin logged in already
                switch (roleId) {
                    case "Admin": //Admin
                        $scope.showToolBar = true;
                        $scope.getMenu();
                        break;
                    case "Staff": // Staff
                        $scope.showToolBar = true;
                        $location.path("/staffMenu");
                        break;
                    default :
                        $location.path("/login");
                }
            }

        }else{

            $location.path("/login");
    }

    $scope.login = function(roleId){
        console.log("Logging in main");
        if(! $scope.kitchenid){
            window.alert("Empty kitchen id");
            $location.path("/login");
        }else{
            console.log("Logging in");
            $scope.showToolBar = true;

            switch (roleId){
                case "Admin": //Admin
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "Admin");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $scope.getMenu();
                    break;
                case "Staff": // Staff
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "Staff");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $location.path("/staffMenu");
                    break;
                default: //User
                    $rootScope.kitchenid = $scope.kitchenid;
                    $cookieStore.put("roleId", "User");
                    $cookieStore.put("kitchenid", $scope.kitchenid);
                    $location.path("/userMenu");
            }
        }
    }
    */
});
app.controller('loginController',function($rootScope, $cookieStore, $scope, $location, $http){


        var kitchenid = $cookieStore.get("kitchenid");
        var roleId = $cookieStore.get("roleId");

        $scope.getMenu = function() {

            //var getUrl = url + $scope.kitchenid + "/menu";
            //
            //$http.get(getUrl).
            //    success(function(data, status, headers, config) {
            //        $rootScope.menu = data;
            //        $location.path("/menu");
            //    }).
            //    error(function(data, status, headers, config) {
            //        window.alert("Failed to fetch Menu");
            //    });

            var MenuObject = Parse.Object.extend("Menu");
            var query = new Parse.Query(MenuObject);

            query.equalTo("kitchenid", $scope.kitchenid);
            query.first({
                success: function(data) {
                    // The object was retrieved successfully.
                    console.log("MENU",data);
                    var menu;
                    if(data == undefined){
                        menu = {};
                        menu["items"] = {};
                        alreadyExists = false;
                    }else{
                        menu = data.get("data");
                        alreadyExists = true;
                    }

                    $scope.$apply(function(){
                        $rootScope.menu = menu;
                        console.log("obj: ",menu);
                        $location.path("/menu");

                    });
                },
                error: function(object, error) {
                    console.log(object,error);
                    // The object was not retrieved successfully.
                    // error is a Parse.Error with an error code and message.
                }
            });
        };
        if(roleId && kitchenid){

            if(roleId == "User"){
                //user logged in already

                // check for userid and tableno. in cookies

                var userid = $cookieStore.get("userId");
                var tableid = $cookieStore.get("tableId");

                if(userid && tableid){

                    $rootScope.showToolBar = true;

                    $scope.kitchenid = kitchenid;
                    $rootScope.kitchenid = $scope.kitchenid;

                    $scope.userId = userid;
                    $rootScope.userId = $scope.userId;

                    $scope.tableId = tableid;
                    $rootScope.tableId = $scope.tableId;

                    $location.path("/userMenu");

                }else{
                    $location.path("/login");
                }

            }else{
                // staff or admin logged in already
                switch (roleId) {
                    case "Admin": //Admin
                        $scope.kitchenid = kitchenid;
                        $rootScope.kitchenid = $scope.kitchenid;
                        $rootScope.showToolBar = true;
                        $rootScope.showMenu = true;
                        $scope.getMenu();
                        break;
                    case "Staff": // Staff
                        $scope.kitchenid = kitchenid;
                        $rootScope.kitchenid = $scope.kitchenid;

                        $rootScope.showToolBar = true;
                        $location.path("/staffMenu");
                        break;
                    default :
                        $location.path("/login");
                }
            }

        }else{

            $location.path("/login");
        }

        $scope.login = function(roleId){

            if(!$scope.kitchenid){
                window.alert("Empty kitchen id");
                $location.path("/login");
            }else{
                // show logging in
                localStorage.setItem("kitchenid",$scope.kitchenid);

                $rootScope.showToolBar = true;

                switch (roleId){
                    case "Admin": //Admin
                        $rootScope.showMenu = true;
                        $rootScope.kitchenid = $scope.kitchenid;
                        $cookieStore.put("roleId", "Admin");
                        $cookieStore.put("kitchenid", $scope.kitchenid);
                        $scope.getMenu();
                        break;
                    case "Staff": // Staff
                        $rootScope.kitchenid = $scope.kitchenid;
                        $cookieStore.put("roleId", "Staff");
                        $cookieStore.put("kitchenid", $scope.kitchenid);
                        $location.path("/staffMenu");
                        break;
                    default: //User
                        $rootScope.kitchenid = $scope.kitchenid;
                        $cookieStore.put("roleId", "User");
                        $cookieStore.put("kitchenid", $scope.kitchenid);
                        $location.path("/userMenu");
                }
            }
        }
});