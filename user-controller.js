/**
 * Created by vikramaditya on 3/28/15.
 */
var url = "http://192.168.1.78:9292/kitchen/";

app.controller('userMenuController',function($scope,$http,$rootScope,$mdDialog,$cookieStore){

    $scope.userId = $rootScope.userId;
    $scope.tableId = $rootScope.tableId;

    $scope.userPendingOrder = {};
    $scope.orderId = [];
    $scope.tableNumber = [];

    $scope.allCompletedOrder = [];

    $scope.showPending = false;
    $scope.userItemCount = 0;
    $scope.userQuantityCount = 0;
    $scope.userAddItem = [];
    $scope.showCart = false;
    //$scope.userMenu = tmp_menu; //delete this after testing

    var currentOrder = $cookieStore.get("currentOrder"); //Usr ADD Item
    var userid = $cookieStore.get("userId");
    var tableid = $cookieStore.get("tableId");

    $scope.getDetail = function(ev,itemid,item) {

        var uid = $cookieStore.get("userId");
        var tid = $cookieStore.get("tableId");
        if(uid && tid){

            $scope.userId = uid;
            $rootScope.userId = uid;
            $scope.tableId = tid;
            $rootScope.tableId = tid;

        }else{

            $mdDialog.show({
                templateUrl: 'views/userDetails.html',
                controller: 'detailsModalController',
                targetEvent: ev
            })
                .then(function(answer) {

                    if(answer == 'ok'){

                        $rootScope.userId = $rootScope.userIdInput;
                        $rootScope.tableId = $rootScope.tableIdInput;
                        $scope.userId = $rootScope.userId;
                        $scope.tableId = $rootScope.tableId;

                        $cookieStore.put("userId",$scope.userId);
                        $cookieStore.put("tableId",$scope.tableId);

                    }
                }, function() {
                    $scope.getDetail();
                });
        }
    };
    $scope.subscribeChannel = function(){

        PUBNUB_demo = PUBNUB.init({
            publish_key: 'pub-c-e14ff346-d55f-47fd-ab96-8012cda81f9d',
            subscribe_key: 'sub-c-4dde67e6-d2fe-11e4-844b-0619f8945a4f'
        });

        PUBNUB_demo.subscribe({
            channel: 'Channel1',
            message: function(m){
                $scope.$apply(function () {


                    if(m.receiverId == $scope.userId && (m.action == "complete" || m.action == "cancelled")){

                        delete $scope.userPendingOrder[m.orderId];
                        $scope.allCompletedOrder.push(m);

                    }
                    if(m.senderId == $scope.userId && m.action == "init"){

                        $scope.userPendingOrder[m.orderId] = m;
                        console.log($scope.userPendingOrder);
                    }
                });
            }
        });
    };
    $scope.getMenu = function() {

        var getUrl = url + $scope.kitchenid + "/menu";

        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $scope.userMenu = data;
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu");
            });
    };
    $scope.placeUserOrder = function(){

        var current_orderid = Math.floor(Date.now());
        var order = {
            "senderId":$scope.userId,
            "receiverId":"staff",
            "action":"init",  //init complete, cancelled
            "orderId": current_orderid.toString(),
            "tableNumber":$scope.tableId,
            "items": []
        };

        //do pubnub publish here
        $scope.showPending = true;

        //$scope.userPendingOrder.push(angular.copy($scope.userAddItem));

        order.items =  angular.copy($scope.userAddItem);

        $scope.tableNumber.push(order.tableNumber);

        PUBNUB_demo.publish({
           channel: 'Channel1',
           message: order
        });

        //console.log("upi: ",$scope.userPendingOrder);
        $scope.emptyCart();

    };
    $scope.emptyCart = function(){

        $cookieStore.remove("currentOrder");
        $cookieStore.remove("currentItemCount");
        $cookieStore.remove("currentQuantityCount");

        $scope.userItemCount = 0;
        $scope.userQuantityCount = 0;
        $scope.showCart = false;
        var len = $scope.userAddItem.length;

        $scope.userAddItem.splice(0,len);

    };
    $scope.updateCookie = function(){

        $cookieStore.put("currentOrder", $scope.userAddItem);
        $cookieStore.put("currentItemCount", $scope.userItemCount);
        $cookieStore.put("currentQuantityCount", $scope.userQuantityCount);

    };
    if(currentOrder){

        $rootScope.kitchenid = $cookieStore.get("kitchenid");
        $scope.kitchenid = $rootScope.kitchenid;
        $scope.userItemCount = $cookieStore.get("currentItemCount");
        $scope.userQuantityCount = $cookieStore.get("currentQuantityCount");
        $scope.subscribeChannel();
        $scope.getDetail();
        $scope.getMenu();

        console.log("already ordered");
        $scope.userAddItem = currentOrder;

        if($scope.userItemCount > 0){
            $scope.showCart = true;
        }else{$scope.showCart = false;
        }
    }
    else{

        $scope.getDetail();
        $scope.subscribeChannel();

        $rootScope.kitchenid = $cookieStore.get("kitchenid");
        $scope.kitchenid = $rootScope.kitchenid;
        $scope.userId = $cookieStore.get("userId");
        $scope.tableId =  $cookieStore.get("tableId");
        $scope.getMenu();
        $scope.emptyCart();
    }

    $scope.showAlert = function(ev,itemid,item) {
        $rootScope.userClickedItem = item;
        $rootScope.userClickedItemid = itemid;
         $mdDialog.show({
             templateUrl: 'views/userModalContent.html',
             controller: 'userModalController',
             targetEvent: ev
            })
            .then(function(answer) {
                if(answer == 'add'){
                    //      Array     ////////////////  Object
                    $scope.userAddItem.push($rootScope.userAddItem);
                    $scope.userItemCount += 1;
                    $scope.userQuantityCount += $rootScope.userAddItem.quantity;

                    $scope.updateCookie();

                    if($scope.userItemCount > 0){
                        $scope.showCart = true;
                    }else{$scope.showCart = false;}
                }else{
                    console.log("cancel");
                }
            }, function() {
                 console.log('You cancelled the dialog.');
            });
    };
    $scope.removeUserItem = function(order){
        $scope.userItemCount -= 1;
        $scope.userQuantityCount -= order.quantity;
        var index = $scope.userAddItem.indexOf(order);
        if(index > -1){$scope.userAddItem.splice(index,1);}

        $scope.updateCookie();

        if($scope.userItemCount > 0){
            $scope.showCart = true;
        }else{$scope.showCart = false;}
    };
});
app.controller('detailsModalController',function($scope,$mdDialog,$rootScope){

    $scope.hide = function() {
        $mdDialog.hide();
    };

    //$scope.cancel = function() {
    //    $mdDialog.cancel();
    //};

    $scope.answer = function(answer) {
        if($scope.userIdInput){
            if($scope.tableIdInput){
                $rootScope.tableIdInput = $scope.tableIdInput;
                $rootScope.userIdInput = $scope.userIdInput;
                $mdDialog.hide(answer);
            }else{
                window.alert("Input table id");
            }
        }else{
            window.alert("Input user id");
        }

    };
});

app.controller('userModalController',function($scope,$mdDialog,$rootScope){

    $scope.item = $rootScope.userClickedItem;
    $scope.userAddItem = {
        itemid:$rootScope.userClickedItemid,
        name:$scope.item.name,
        quantity:"",
        comments:""
    };

    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $rootScope.userAddItem = $scope.userAddItem;
        $mdDialog.hide(answer);
    };

});