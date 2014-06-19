'use strict';

angular.module('tagyComponents')
  .directive('tagyCmsComponent', function (EditableSer, editableComponentFactory,EditableMessageChannel) {
    return {
        replace:false,
      restrict: 'A',
        priority:10,
        scope:true,
        controller:function($scope, $element, $attrs, $transclude){
            this.remove=function(muteUpdatedEvent){
                $scope.editableComponent.destroy()
                $scope.$destroy()
                if(muteUpdatedEvent!=true) {
                    EditableMessageChannel.dispatchUpdatedEvent(null, {element: $element})
                }
                $element.remove()
            }
        },
      link:{
          pre:function preLink(scope, element, attrs){
              scope.editableComppp=true
              // used pre because post is executed in reverse (from bottom up) and children tagy-cms-editable $emit() events before parent component starts to listen
              //var editableComponent = editableComponentFactory.getInstance("untitled",element, scope)
              scope.editableComponent =null
              var compTitle=attrs.editableTitle?attrs.editableTitle:attrs.tagyCmsComponent
              if(compTitle!=null) {
                  scope.editableComponent =editableComponentFactory.getInstance(compTitle,element, scope)
                  //scope.editableComponent.updateOpts( compTitle, element, attrs.editableDescription)
              }else{
                  scope.editableComponent = editableComponentFactory.getInstance("untitled",element, scope)
              }

              /*scope.$on("$destroy",function(){
                  scope.editableComponent.destroy()
                  scope.editableComponent=null
              })*/

          },
          post:function postLink(scope, element, attrs) {
          }
        }
    };
  });
