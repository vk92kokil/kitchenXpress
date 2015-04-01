/**
 * Created by vikramaditya on 3/25/15.
 */
var url = "http://192.168.1.78:9292/kitchen/";
var uploadUrl = "http://192.168.1.78:9292/imageupload";

var app = angular.module("myApp",['ngRoute','ngCookies','ngMaterial','pubnub.angular.service']);

app.config(['$routeProvider',function ($routeProvider) {

  $routeProvider.when('/menu', {

    templateUrl: 'views/adminMenuView.html',
    controller: 'MenuController'
    }).
    when('/addItem', {
      templateUrl: 'views/adminAddItem.html',
      controller: 'addItemViewController'
    }).
    when('/login',{
          templateUrl: 'views/login.html',
          controller: 'loginController'
    }).
    when('/edit',{
          templateUrl: 'views/adminEditItem.html',
          controller: 'EditController'
    }).
    when('/userMenu',{
          templateUrl: 'views/userMenuView.html',
          controller: 'userMenuController'
    }).
    when('/staffMenu',{
          templateUrl: 'views/staffMenu.html',
          controller: 'staffMenuController'
      }).
    otherwise({redirectTo: '/login'});

}]);
