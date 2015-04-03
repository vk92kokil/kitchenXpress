/**
 * Created by vikramaditya on 3/28/15.
 */
app.controller('staffMenuController',function($scope, $rootScope, $location, $http, $cookieStore){

    $scope.showPending = true;
    $scope.allCompletedOrder = [];
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
                $scope.$apply(function () {
                    if(m.action == "complete" || m.action == "cancelled"){

                        delete $scope.allPendingOrder[m.orderId];
                        $scope.allCompletedOrder.push(m);
                        $cookieStore.put("allPendingOrder", $scope.allPendingOrder);
                        $cookieStore.put("allCompletedOrder", $scope.allCompletedOrder);

                        //var index = $scope.allPendingOrder.indexOf(current_order);
                        //if(index > -1){
                        //    $scope.allPendingOrder.splice(index,1);
                        //    $scope.allCompletedOrder.push(m);
                        //}
                    }
                    if(m.action == "init"){
                        $scope.allPendingOrder[m.orderId] = m;
                        $cookieStore.put("allPendingOrder", $scope.allPendingOrder);
                        //$scope.allPendingOrder.push(m);
                    }
                });
            }
        });
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
        $rootScope.kitchenid = kitchenid;
        $scope.kitchenid = kitchenid;
        $scope.getMenu();
        $scope.subscribeChannel();

        var pendingOrder = $cookieStore.get("allPendingOrder");
        var completedOrder = $cookieStore.get("allCompletedOrder");

        if(pendingOrder){
            $scope.allPendingOrder = pendingOrder;
        }
        if(completedOrder){
            $scope.allCompletedOrder = completedOrder;
        }



    }else{
        $location.path("/login");
    }

    $scope.userOrderCompleted = function (order) {
        current_order = order;
        var sendorder = {
            "senderId":"staff",
            "receiverId":order.senderId,
            "action":"complete",  //init complete, cancelled
            "orderId":order.orderId,
            "tableNumber":order.tableNumber,
            "items": order.items
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
            "receiverId":order.senderId,
            "action":"cancelled",  //init complete, cancelled
            "orderId":order.orderId,
            "tableNumber":order.tableNumber,
            "items": order.items
        };
        PUBNUB_demo.publish({
            channel: $rootScope.kitchenid,
            message: sendorder
        });
    };
});