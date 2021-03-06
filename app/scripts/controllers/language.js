'use strict';
AMIApp.controller('LanguageCtrl', ['$scope', '$timeout', '$location', '$window', '$translate', 'AMIRequest', '$cookies', 'urls', 'envOptions', function ($scope, $timeout, $location, $window, $translate, AMIRequest, $cookies, urls, envOptions) {

  // $translate.onReady(function(){
  //   $translate(['logo_src']).then(function (translation) {
  //     $scope.logo_src = translation["logo_src"];
  //   });
  // });

    $scope.languages = envOptions.supportedLanguages;

    $scope.lang = $scope.languages[$translate.use()];
    
    $scope.selectLanguage = function(lang){
      $translate.use(lang.languageCode);
      urls.setLanguageCode(lang.languageCode);
      moment.lang(lang.languageCodeMoment);
      $cookies.put('languageCode', lang.languageCode);
      AMIRequest.drop('operator');
    }
    $scope.$watch(function() {
      $scope.showControls = (AMIRequest.hierarchy.indexOf($location.path().substring(1)) <= 1);
      $scope.lang = $scope.languages[$translate.use()];
    });
    
}]);
AMIApp.controller('LangStyle', ['$scope', '$translate', function ($scope, $translate) {

    $scope.lang = $translate.use();
    
    $scope.$watch(function() {
      $scope.lang = $translate.use();
    });
    
}]);