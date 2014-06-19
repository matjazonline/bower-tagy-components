'use strict';

angular.module('tagyComponents')
  .directive('styleValueEditorDr', function (EditableMessageChannel) {
    return {
      template: '<div>{{styleValueObj.title}} <small>{{styleValueObj.value}}</small> <input type="color" name="colorInput" ng-model="styleValueObj.value"/></div>',
      restrict: 'E',
        scope:{
            styleValueObj:'='
        },
        replace:true,
      link: function postLink(scope, element, attrs) {
          scope.$watch("styleValueObj",function(val,old){
              if(val!=old) EditableMessageChannel.dispatchStyleValueChange(val)
          },true)
      }
    };
  });
