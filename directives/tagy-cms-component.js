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
          pre:function preLink(scope, element, attrs,controller){
              var _originalCssDisplayVal=$(element).css('display')
              if(attrs.tagyCmsVisible==null)attrs.tagyCmsVisible=_originalCssDisplayVal!='none'
              scope.setVisible=function(val){
                  if(val=='false' || val==false){
                      _originalCssDisplayVal=$(element).css('display')
                      $(element).css('display','none')
                      $(element).attr('tagy-cms-visible',false)
                      attrs.tagyCmsVisible=false
                      scope.editableComponent.visible=false
                  }else{
                      var dispVal=(_originalCssDisplayVal!=null || _originalCssDisplayVal!='none' || _originalCssDisplayVal.length<1)?'':_originalCssDisplayVal
                      $(element).css('display',dispVal)
                      $(element).removeAttr('tagy-cms-visible')
                      attrs.tagyCmsVisible=true
                      scope.editableComponent.visible=true
                  }
                  if(scope.editableComponent!=null)EditableMessageChannel.dispatchNewValueComponentUpdated(scope.editableComponent.id, {component:scope.editableComponent, element: scope.editableComponent.element})
              }
              // used pre because post is executed in reverse (from bottom up) and children tagy-cms-editable $emit() events before parent component starts to listen
              //var editableComponent = editableComponentFactory.getInstance("untitled",element, scope)
              scope.editableComponent =null
              var compTitle=attrs.editableTitle?attrs.editableTitle:attrs.tagyCmsComponent
              if(compTitle!=null) {
                  scope.editableComponent =editableComponentFactory.getInstance(compTitle,element, scope,null,attrs.tagyCmsVisible)
                  //scope.editableComponent.updateOpts( compTitle, element, attrs.editableDescription)
              }else{
                  scope.editableComponent = editableComponentFactory.getInstance("untitled",element, scope,null,attrs.tagyCmsVisible)
              }
              scope.update = function (val) {
                  if ( angular.isString(val)) {

                  }else if (angular.isObject(val)) {
                      if(val.type!=null ){
                          if(val.type=='visible'){
                              scope.setVisible(val.value)
                              return
                          }else if(val.type=='remove'){
                              controller.remove()
                              return
                          }
                      }
                  }
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
