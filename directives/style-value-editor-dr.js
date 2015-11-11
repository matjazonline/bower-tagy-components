'use strict';

angular.module('tagyComponents')
  .directive('styleValueEditorDr', function (EditableMessageChannel) {
    return {
      template: '<div  class="style-value-editor">' +
                  '<span class="color-edit-swatch">' +
                      '<input type="color" name="colorInput" ng-model="styleValueObj.value"/>' +
                      '<small class="color-edit-swatch-caption">{{styleValueObj.value}}</small>' +
                  '</span>  ' +
                  '<span class="color-edit-title">{{styleValueObj.title}}</span>  ' +
                '</div>',
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
