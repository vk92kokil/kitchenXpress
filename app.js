/**
 * Created by vikramaditya on 3/25/15.
 */

var app = angular.module("myApp",['ngRoute','ngCookies','ngMaterial']);

app.config(['$routeProvider',function ($routeProvider) {

  $routeProvider.when('/menu', {

    templateUrl: 'views/menuView.html',
    controller: 'MenuController'
    }).
    when('/addItem', {
      templateUrl: 'views/addItem.html',
      controller: 'addItemViewController'
    }).
      when('/login',{
          templateUrl: 'views/login.html',
          controller: 'LoginController'
    }).
    when('/edit',{
          templateUrl: 'views/editItem.html',
          controller: 'EditController'
    }).
    otherwise({redirectTo: '/login'});

}]);
