'use strict';

angular.module('tagyComponents')
    .service('EditableMessageChannel', function EditableMessageChannel($rootScope) {


        var self = this
        this.EVENT_EDIT = "tagyComponents:tagyCmsEditable:editableItemEdit"
        this.EVENT_EDIT_CONFIRMED = "tagyComponents:tagyCmsEditable:editableItemEditComplete"
        this.EVENT_HOVER_OVER = "tagyComponents:tagyCmsEditable:editableItemHoverOver"
        this.EVENT_HOVER_OUT = "tagyComponents:tagyCmsEditable:editableItemHoverOut"
        this.EVENT_EDIT_UPDATED = "tagyComponents:tagyCmsEditable:editableItemSaved"
        this.EVENT_NEW_VALUE_UPDATE_EDITABLE = "tagyComponents:tagyCmsEditable:updateEditableValue"
        this.EVENT_EDITABLE_CONTENT_OBJECT_ADDED = "tagyComponents:tagyCmsEditable:editableContentObjectAdded"
        this.EVENT_EDITABLE_CONTENT_OBJECT_REMOVED = "tagyComponents:tagyCmsEditable:editableContentObjectRemoved"
        this.EVENT_EDITABLE_COMPONENT_ADDED = "tagyComponents:tagyCmsEditable:editableComponentAdded"
        this.EVENT_EDITABLE_COMPONENT_REMOVED = "tagyComponents:tagyCmsEditable:editableComponentRemoved"
        this.EVENT_EDITABLE_COMPONENT_UPDATED = "tagyComponents:tagyCmsEditable:editableComponentUpdated"
        this.EVENT_EDITABLE_MARKUP_CHANGED = "tagyComponents:tagyCmsEditable:editableMarkupChanged"
        this.EVENT_EDITABLE_IFRAME_PREVIEW_MARKUP_RESET = "tagyComponents:tagyCmsEditable:editableIframePreviewMarkupReset"
        this.EVENT_EDITABLE_SELECT_IMAGE_WAITING = "tagyComponents:tagyCmsEditable:editableSelectImageReady"
        this.EVENT_EDITABLE_SELECTED_IMAGE_PATH = "tagyComponents:tagyCmsEditable:editableSelectedImagePath"
        this.EVENT_EDITABLE_STYLE_VALUE_CHANGE = "tagyComponents:tagyCmsEditable:editableStyleValueChange"
        this.EVENT_EDITABLE_STYLE_ITEM_ADDED = "tagyComponents:tagyCmsEditable:editableStyleItemAdded"
        this.EVENT_EDITABLE_STYLE_VALUE_UPDATED = "tagyComponents:tagyCmsEditable:editableStyleValueUpdated"

        this.onEdit = function ($scope, handler) {
            $scope.$on(self.EVENT_EDIT, function (event, editableItem) {
                handler(editableItem)
            })
        }

        this.onUpdated = function ($scope, handler) {
            $scope.$on(self.EVENT_EDIT_UPDATED, function (event, editableItem, updatedElem) {
                handler(editableItem,updatedElem)
            })
        }

        this.dispatchUpdatedEvent = function (editableItem,updatedElem) {
            $rootScope.$broadcast(self.EVENT_EDIT_UPDATED, editableItem, updatedElem)
        }

        this.dispatchEditEvent = function (editableItem) {
            $rootScope.$broadcast(self.EVENT_EDIT, editableItem)
        }

        this.onNewValueUpdateEditable = function ($scope, handler) {
            $scope.$on(self.EVENT_NEW_VALUE_UPDATE_EDITABLE, function (event, newValue, editableItemScopeId) {
                handler(newValue, editableItemScopeId)
            })
        }

        this.dispatchNewValueUpdate = function (newValue, editableItemScopeIdOrScope) {
            var scopeId
            if (angular.isObject(editableItemScopeIdOrScope)) {
                if (editableItemScopeIdOrScope.scope != null) {
                    scopeId = editableItemScopeIdOrScope.scope.$id
                } else {
                    scopeId = editableItemScopeIdOrScope.$id
                }
            } else {
                scopeId = editableItemScopeIdOrScope
            }
            if (scopeId == null) {
                console.log("ERROR - dispatchValueUpdate scopeId not set param=", editableItemScopeIdOrScope)
                return
            }
            $rootScope.$broadcast(self.EVENT_NEW_VALUE_UPDATE_EDITABLE, newValue, scopeId)
            //return editableItem.scope.update(value)
        }

        this.dispatchEditableItemHoverOver = function (editableItem) {
            $rootScope.$broadcast(self.EVENT_HOVER_OVER, editableItem)
        }
        this.dispatchEditableItemHoverOut = function (editableItem) {
            $rootScope.$broadcast(self.EVENT_HOVER_OUT, editableItem)
        }

        this.onEditableContentObjectAdded = function ($scope, handler) {

            $scope.$on(self.EVENT_EDITABLE_CONTENT_OBJECT_ADDED, function (event, editableContentObj) {
                handler(editableContentObj)

                event.stopPropagation()
            })
        }

        this.dispatchEditableContentObjectAdded = function ($scope, editableContentObj) {
            $scope.$emit(self.EVENT_EDITABLE_CONTENT_OBJECT_ADDED, editableContentObj)
        }

        this.onEditableContentObjectRemoved = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_CONTENT_OBJECT_REMOVED, function (event, editableContentObj) {
                handler(editableContentObj)
                event.stopPropagation()
            })
        }

        this.dispatchEditableContentObjectRemoved = function ($scope, editableContentObj) {
            $scope.$emit(self.EVENT_EDITABLE_CONTENT_OBJECT_REMOVED, editableContentObj)
        }

        this.onEditableComponentAdded = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_COMPONENT_ADDED, function (event, editableComponent, componentsArr) {
                handler(editableComponent, componentsArr)
            })
        }

        this.dispatchEditableComponentAdded = function (editableComponent, componentsArr) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_COMPONENT_ADDED, editableComponent, componentsArr)
        }

        this.onEditableComponentRemoved = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_COMPONENT_REMOVED, function (event, editableComponent, componentsArr) {
                handler(editableComponent, componentsArr)
            })
        }

        this.dispatchEditableComponentRemoved = function (editableComponent, componentsArr) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_COMPONENT_REMOVED, editableComponent, componentsArr)
        }

        this.dispatchEditableComponentUpdated = function (editableComponent, componentsArr) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_COMPONENT_UPDATED, editableComponent, componentsArr)
        }

        this.onEditableComponentUpdated = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_COMPONENT_UPDATED, function (event, editableComponent) {
                handler(editableComponent)
            })
        }

        this.onEditableHtmlMarkupChange = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_MARKUP_CHANGED, function (event, markup, markupChangeId, markupWithEditFrameworkResources) {
                handler(markup, markupChangeId, markupWithEditFrameworkResources)
            })
        }

        this.dispatchEditableHtmlMarkupChange = function (markup, markupChangeId, markupWithEditFrameworkResources) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_MARKUP_CHANGED, markup, markupChangeId, markupWithEditFrameworkResources)
        }

        this.onIframePreviewHtmlMarkupReset = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_IFRAME_PREVIEW_MARKUP_RESET, function (event, markup, markupChangeId) {
                handler(markup, markupChangeId)
            })
        }

        this.dispatchIframePreviewHtmlMarkupReset = function (markup, markupChangeId) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_IFRAME_PREVIEW_MARKUP_RESET, markup, markupChangeId)
        }

        this.onEditableItemEditConfirmed = function ($scope, handler) {
            $scope.$on(self.EVENT_EDIT_CONFIRMED, function (event, editableItem) {
                handler(editableItem)
            })
        }

        this.dispatchEditableItemEditConfirmed = function (editableItem) {
            $rootScope.$broadcast(self.EVENT_EDIT_CONFIRMED, editableItem)
        }

        this.onSelectImageWaiting = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_SELECT_IMAGE_WAITING, function (event, editableItem) {
                handler(editableItem)
            })
        }

        this.dispatchSelectImageWaiting = function (editableItem) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_SELECT_IMAGE_WAITING, editableItem)
        }

        this.onSelectedImagePath = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_SELECTED_IMAGE_PATH, function (event, imagePath) {
                handler(imagePath)
            })
        }

        this.dispatchSelectedImagePath = function (imagePath) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_SELECTED_IMAGE_PATH, imagePath)
        }

        this.onStyleValueChange = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_STYLE_VALUE_CHANGE, function (event, value) {
                handler(value)
            })
        }

        this.dispatchStyleValueChange = function (value) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_STYLE_VALUE_CHANGE, value)
        }

        this.onEditableStyleItemAdded = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_STYLE_ITEM_ADDED, function (event, editableStyleItem, styleItemsArr) {
                handler(editableStyleItem, styleItemsArr)
            })
        }

        this.dispatchEditableStyleItemAdded = function (editableStyleItem, styleItemsArr) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_STYLE_ITEM_ADDED, editableStyleItem, styleItemsArr)
        }

        this.onStyleValueUpdatedEvent = function ($scope, handler) {
            $scope.$on(self.EVENT_EDITABLE_STYLE_VALUE_UPDATED, function (event, editableStyleItem) {
                handler(editableStyleItem)
            })
        }

        this.dispatchStyleValueUpdatedEvent = function (editableStyleItem) {
            $rootScope.$broadcast(self.EVENT_EDITABLE_STYLE_VALUE_UPDATED, editableStyleItem)
        }


        this.rootScopeBroadcast=function(attrs){
            $rootScope.$broadcast.apply($rootScope,attrs)
        }
    });
