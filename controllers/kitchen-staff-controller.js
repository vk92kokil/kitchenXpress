/**
 * Created by vikramaditya on 3/28/15.
 */
app.controller('staffMenuController',function($scope, $rootScope, $location, $http, $cookieStore){

    $scope.showPending = true;
    $scope.allCompletedOrder = {};
    $scope.allPendingOrder = {};

    var current_order;
    var kitchenid = $cookieStore.get("kitchenid");


    $scope.subscribeChannel = function(){

        PUBNUB_demo = PUBNUB.init({
            publish_key: 'pub-c-e14ff346-d55f-47fd-ab96-8012cda81f9d',
            subscribe_key: 'sub-c-4dde67e6-d2fe-11e4-844b-0619f8945a4f'
        });

        PUBNUB_demo.subscribe({
            channel: $rootScope.kitchenid,
            message: function(m){
                console.log(" M = ",m);
                $scope.$apply(function () {

                    if(m.action == "complete" || m.action == "cancelled"){


                        var orders = Parse.Object.extend("Orders");
                        var query = new Parse.Query(orders);

                        query.equalTo('kitchenId',$scope.kitchenid);
                        query.equalTo('state', 'pending');
                        query.equalTo('orderId', m.orderId);

                        query.first().then(function(saveobj){

                            saveobj.set('state', m.action);

                            saveobj.save(null,function(){
                                    console.log("order completed");
                            });
                        });
                        //$scope.$apply();
                        //$scope.allCompletedOrder = angular.copy($scope.allPendingOrder[m.orderId]);

                        delete $scope.allPendingOrder[m.orderId];
                        $scope.allCompletedOrder[m.orderId] = m;
                        //console.log($scope.allPendingOrder,$scope.allCompletedOrder," LOG ");
                        /*$cookieStore.put("allPendingOrder", $scope.allPendingOrder);
                        $cookieStore.put("allCompletedOrder", $scope.allCompletedOrder);
                        */
                        //$scope.getOrdersList();
                    }
                    if(m.action == "pending"){
                        $scope.getOrdersList();
                    }
                });
            }
        });
    };

    $scope.getOrdersList = function(){

        var orders = Parse.Object.extend("Orders");
        var query = new Parse.Query(orders);

        query.equalTo('kitchenId',$scope.kitchenid);
        query.equalTo('state', 'pending');

        query.find({

            success: function (results) {

                $scope.$apply(function () {
                    $scope.allPendingOrder = {};
                    for(var i=0;i<results.length;i++){
                        var oid = results[i].get("orderId");
                        $scope.allPendingOrder[oid] = results[i];
                    }
                });
                setPopOvers();
                console.log($scope.allPendingOrder,results);
            },
            error: function (error) {

                console.log("No pending List", error);
            }
        });

        /*
        var query2 = new Parse.Query(orders);
        query2.equalTo('kitchenId',$scope.kitchenid);
        query2.notEqualTo('state', 'pending'); //Not equal to

        query2.find({

            success: function (results) {
                $scope.$apply(function () {
                    $scope.allCompletedOrder= {};
                    for(var i=0;i<results.length;i++){
                        var oid = results[i].get("orderId");
                        $scope.allCompletedOrder[oid] = results[i];
                    }
                    console.log("cos");
                    //$scope.allCompletedOrder = results;
                });
            },
            error: function (error) {

                console.log("Error in fetching completed orders", error);
            }
        });
        */

    };
    $scope.getMenu = function() {

        var getUrl = url + $scope.kitchenid + "/menu";

        /*
        $http.get(getUrl).
            success(function(data, status, headers, config) {
                $scope.menu = data;
                $rootScope.menu = data;
            }).
            error(function(data, status, headers, config) {
                window.alert("Failed to fetch Menu");
            });
        */
        var MenuObject = Parse.Object.extend("Menu");
        var query = new Parse.Query(MenuObject);

        query.equalTo("kitchenid", $scope.kitchenid);
        query.first({
            success: function(data) {
                // The object was retrieved successfully.
                var menu = data.get("data");
                $scope.$apply(function(){
                    $scope.menu = menu;
                    $rootScope.menu = menu;
                });
            },
            error: function(object, error) {
                console.log(object,error);
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
            }
        });
    };

    if(kitchenid){

        removeCSS();
        $rootScope.kitchenid = kitchenid;
        $scope.kitchenid = kitchenid;
        $scope.getMenu();
        $scope.subscribeChannel();
        $scope.getOrdersList();

        var pendingOrder = $cookieStore.get("allPendingOrder");
        var completedOrder = $cookieStore.get("allCompletedOrder");

        /*
        if(pendingOrder){
            $scope.allPendingOrder = pendingOrder;
        }
        if(completedOrder){
            $scope.allCompletedOrder = completedOrder;
        }
        */


    }else{
        $location.path("/login");
    }

    $scope.userOrderCompleted = function (order) {
        current_order = order;
        var sendorder = {
            "senderId":"staff",
            "receiverId":order.get('userId'),
            "action":"complete",  //pending complete, cancelled
            "orderId":order.get('orderId'),
            "tableNumber":order.get('tableNumber'),
            "items": order.get('data').items
        };
        PUBNUB_demo.publish({
            channel: $rootScope.kitchenid,
            message: sendorder
        });
    };
    $scope.userOrderCancelled = function (order) {

        current_order = order;

        var sendorder = {
            "senderId":"staff",
            "receiverId":order.get('userId'),
            "action":"cancelled",  //init complete, cancelled
            "orderId":order.get('orderId'),
            "tableNumber":order.get('tableNumber'),
            "items": order.get('data').items
        };
        PUBNUB_demo.publish({
            channel: $rootScope.kitchenid,
            message: sendorder
        });
    };


    var setPopOvers = function(){
        $("[data-toggle='tooltip']").tooltip({trigger: 'hover'});
        $("[data-toggle='popover']").popover({trigger: 'click'});
    };
});
removeCSS = function(){
    $('body').removeClass('banner');
    $('body').addClass('no-bg');
    $('#overlay').removeClass('overlay');
};