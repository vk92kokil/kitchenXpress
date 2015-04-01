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
            channel: 'Channel1',
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
    if(kitchenid){
        var pendingOrder = $cookieStore.get("allPendingOrder");
        var completedOrder = $cookieStore.get("allCompletedOrder");

        if(pendingOrder){
            $scope.allPendingOrder = pendingOrder;
        }
        if(completedOrder){
            $scope.allCompletedOrder = completedOrder;
        }

        $rootScope.kitchenid = kitchenid;
        $scope.subscribeChannel();

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
            channel: 'Channel1',
            message: sendorder
        });
        PUBNUB_demo.publish({
            channel: 'Channel1',
            message: {
                "aps": {
                    "alert": "You got your emails.",
                    "badge": 9,
                    "sound": "bingbong.aiff"
                },
                "acme 1": 42
            }
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
            channel: 'Channel1',
            message: sendorder
        });
    };
});