/**************

Copyright 2016 Open Effect

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

***************/

AMIApp.controller('SubscriberCtrl', ['$scope', '$location', '$window', 'NavCollection', 'AMIRequest', 'identifiers', 'urls', 'dataProviderService', function ($scope, $location, $window, NavCollection, AMIRequest, identifiers, urls, dataProviderService) {
  $window.scrollTo(0,0);
  $scope.nextIsLoading = false;
  
  $scope.$watch(function(){
     $scope.previousStage = NavCollection.previousItem();
    $scope.nextStage = NavCollection.nextItem();
  });
  $scope.previous = function(){
    $location.url($scope.previousStage.id);
  }
  $scope.next = function(){
    $location.url($scope.nextStage.id);
  }
  if(!AMIRequest.has('services')){
    $scope.previous();
    return;
  }
  $scope.services = AMIRequest.get('services');
  if(identifiers){
    if(AMIRequest.has('subject')){
      $scope.subject = AMIRequest.get('subject');
    }
    else{
      $scope.subject = {};
      $scope.subject.basic_personal_info = {};
      $scope.subject.service_identifiers = {};
      console.log("subject overwrite", $scope.subject);
      AMIRequest.set('subject', $scope.subject);
    }
    console.log($scope.subject);
    if(identifiers['basic_personal_info']){
      $scope.basic_identifiers = identifiers['basic_personal_info'];
    }
    $scope.service_identifiers = identifiers;
    delete $scope.service_identifiers['basic_personal_info'];
    for(i in $scope.service_identifiers){
      if(typeof $scope.subject.service_identifiers[i] == "undefined"){
        $scope.subject.service_identifiers[i] = {};
      }
    }
  }

  var findEmail = function(subject){
    var email = null;
    var keys;
    for(var property in subject.basic_personal_info){
      console.log(subject.basic_personal_info[property]);
      if(subject.basic_personal_info[property]['title'].match(/email/i)){
        email = subject.basic_personal_info[property]['value'];
      }
      if(email){
        break;
      }
    }
    return email;
  }
  $scope.email = {};
  $scope.rateLimited = false;
  $scope.statistics = true;
  $scope.subscribe = false;
  $scope.anon = AMIRequest.getAnon();
  $scope.servicelist = '';  
  for(var i=0; i < $scope.anon.services.length; i++){
    var dividerChar = "";
    if(i == $scope.anon.services.length - 1){
      dividerChar = ""
    }
    else{
      dividerChar = ", ";
    }
    $scope.servicelist = $scope.servicelist + $scope.anon.services[i].title + dividerChar;
  }

  if(AMIRequest.has('operator')){
    $scope.company = AMIRequest.get('operator');
  }

  $scope.$watch('subject', function(newVal, oldVal){
    console.log("subject", newVal);
    AMIRequest.set('subject', newVal);
  });
    
  $scope.$watch(function(){
    $scope.nextStage = NavCollection.nextItem();
        if(AMIRequest.has('subject')){
      $scope.email.address = findEmail(AMIRequest.get('subject'));
    }
  });
  
  $scope.submit = function(){
     AMIRequest.serverResponse = {};
     AMIRequest.serverResponse.serverIsLoading = true;
     dataProviderService.postItem(urls.enrollmentURL(), "/enroll/", {}, 
      {
        data: $scope.anon,
        subscribe: $scope.subscribe,
        email: $scope.email
        // ,"_csrf": encodeURIComponent($scope.token)
      })
     .then(function(response){
      AMIRequest.serverResponse.serverIsLoading = false;
      AMIRequest.serverResponse.serverError = false;
      AMIRequest.serverResponse.serverDown = false;
      AMIRequest.serverResponse.response = response.title;
      AMIRequest.serverResponse.responseStatuses = {};
      AMIRequest.serverResponse.responseStatuses[response.title.statusCode] = true;
      AMIRequest.serverResponse.success = true;
     }, function(response){
      AMIRequest.serverResponse = {};
      AMIRequest.serverResponse.serverIsLoading = false;
      AMIRequest.serverResponse.serverError = true;
      if(response.status === -1){
        AMIRequest.serverResponse.serverDown = true;
      }
      else{
        AMIRequest.serverResponse.serverDown = false;
      }
      if(response.status === 429){
        AMIRequest.serverResponse.rateLimited = true;
      }
     });
  }
  $scope.submitAndNext = function(){
    $scope.submit();
    $scope.next();
  }
}]);