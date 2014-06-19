'use strict';

angular.module('tagyComponents')
    .directive('tagyCmsComponentList', function (EditableSer, EditableMessageChannel) {
        return {
            template: '<div ng-show="componentsOnPage.length>0">' +
                '<div ng-if="isCurrentLayoutFr(frameworkConsts.LAYOUT_FRAMEWORK_BOOTSTRAP)" class="panel-group" id="editable-comp-accordion">' +
                '<div ng-repeat="editableComponent in componentsOnPage" class="panel panel-danger">' +
                '<div class="panel-heading">' +
                '<h4 class="panel-title"><a data-toggle="collapse" data-parent="#editable-comp-accordion" href="#collapse_{{$index}}">{{editableComponent.title}} <span class="badge">{{editableComponent.getEditableContentObjects().length}}</span></a></h4> ' +
                '</div> ' +
                '<div id="collapse_{{$index}}" class="panel-collapse collapse"> ' +
                '<div class="panel-body">' +
                '<ul><li ng-repeat="editableObject in editableComponent.getEditableContentObjects()"><a href="" ng-click="editEditableObject(editableObject)"> {{editableObject.title}} </a> </li></ul>' +
                '</div> ' +
                '</div> ' +
                '</div>' +
                '</div>' +

                '<dl ng-show="isCurrentLayoutFr(frameworkConsts.LAYOUT_FRAMEWORK_FOUNDATION)" class="accordion" data-accordion id="editable-comp-accordion">' +
                '<dd ng-repeat="editableComponent in componentsOnPage">'+
                '<a href="" ng-click="setNowEditingComponent(editableComponent)">{{editableComponent.title}}</a>'+
                '<div class="content" ng-class="{active:nowEditingComponent==editableComponent}">'+
                '<ul><li ng-repeat="editableObject in editableComponent.getEditableContentObjects()"><a href="" ng-hide="isNowEditing(editableObject)" ng-click="editEditableObject(editableObject)"> {{editableObject.title}}</a>' +
                '<tagy-cms-item-editor show-For-Editable-Item="editableObject" get-File-Abs-Path="getFileAbsPath"></tagy-cms-item-editor>' +
                ' </li></ul>' +
                '</div>'+
                '</dd>' +
                '</dl>' +

                '</div>',
            restrict: 'E',
            scope:{
                getFileAbsPath:"="
            } ,
            link: function postLink(scope, element, attrs) {
                scope.nowEditing
                scope.frameworkConsts=EditableSer.frwConst
                scope.isCurrentLayoutFr=function(frConst){
                    return EditableSer.layoutFramework==frConst
                }

                EditableMessageChannel.onEditableComponentAdded(scope,function(addedComp, compArr){
                    scope.componentsOnPage=compArr
                })
                EditableMessageChannel.onEditableComponentRemoved(scope,function(addedComp, compArr){
                    var comp=getComponentById(addedComp.id)
                    if(comp) {
                        var ind=scope.componentsOnPage.indexOf(comp)
                        scope.componentsOnPage.splice(ind,1)
                    }
                })
                EditableMessageChannel.onEditableComponentUpdated(scope,function(updatedComp){

                    var comp=getComponentById(updatedComp.id)
                    if(updatedComp!==comp)comp=updatedComp
                })

                /*scope.getFileAbsPathFn=function(){
                 return scope.getFileAbsPath()()
                 }*/

                scope.editEditableObject=function(editableObj){
                    EditableMessageChannel.dispatchEditEvent(editableObj)
                }

                scope.setNowEditingComponent=function(edComp){
                    if(scope.nowEditingComponent==edComp)return
                    scope.nowEditingComponent=scope.nowEditingComponent==edComp?null:edComp
                    var editableContentObjects = edComp.getEditableContentObjects();
                    if(editableContentObjects.length==1 )scope.editEditableObject(editableContentObjects[0])

                }


                EditableMessageChannel.onEdit(scope, function (editableItem) {
                    scope.nowEditing = editableItem
                    var parentComp=getNowEditingParentComponent(editableItem)
                    if(parentComp)scope.setNowEditingComponent(parentComp)
                    //console.log("PPP!!", scope.getFileAbsPath()("/ppp33"))

                })

                var getNowEditingParentComponent=function(editableItem){
                    for (var i = 0; i < scope.componentsOnPage.length; i++) {
                        var comp = scope.componentsOnPage[i];
                        if(comp.hasEditableItemObj(editableItem)){
                            return comp
                        }
                    }
                    return null
                }

                var getComponentById=function(id){
                    if(scope.componentsOnPage==null)return
                    for (var i = 0; i < scope.componentsOnPage.length; i++) {
                        var comp = scope.componentsOnPage[i];
                        if(comp.id==id){
                            return comp
                        }
                    }
                    return null
                }

                scope.isNowEditing=function(editItem){
                    return scope.nowEditing!=null? editItem.scope.$id==scope.nowEditing.scope.$id : false
                }

                EditableMessageChannel.onEditableItemEditConfirmed(scope,function(editableItem){
                    if(scope.nowEditing==editableItem){
                        scope.nowEditing=null
                    }
                })

                if(scope.isCurrentLayoutFr(EditableSer.frwConst.LAYOUT_FRAMEWORK_BOOTSTRAP))$('#editable-comp-accordion').collapse()
            }
        };
    });
