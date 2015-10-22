'use strict';

angular.module('tagyComponents')
  .directive('styleValueEditorDr', function (EditableMessageChannel) {
    return {
      template: '<div><input type="color" name="colorInput" ng-model="styleValueObj.value"/><small>{{styleValueObj.value}}</small> {{styleValueObj.title}}  </div>',
      restrict: 'E',
        scope:{
            styleValueObj:'='
        },
        replace:true,
      link: function postLink(scope, element, attrs) {

          scope.$watch("styleValueObj",function(val,old){
              if(val!=old) {EditableMessageChannel.dispatchStyleValueChange(val)
              }
          },true)
      }
    };
  });
