'use strict';

angular.module('tagyComponents')
    .factory('editableComponentFactory', function (EditableSer, EditableMessageChannel, editableContentFactory) {


        var EditableComponent = function (title, element, id) {
            this.id=id
            this.updateOpts(title, element)
            this._editableContentObjects = []
            EditableSer.registerComponent(this)
        }
        EditableComponent.prototype.updateOpts = function (title, element) {
            this.title = title
            this.element = $(element)
        }
        EditableComponent.prototype.registerEditableContentObject = function (newEditableContentObj) {

            var count=1
            while(this.contentObjTitleExists(newEditableContentObj.title)){
                var idSeparatorInd = newEditableContentObj.title.indexOf(":");
                if(idSeparatorInd>0)newEditableContentObj.title=newEditableContentObj.title.substring(0,idSeparatorInd)
                newEditableContentObj.title=newEditableContentObj.title+':'+count
                count++
            }

            this._editableContentObjects.push(newEditableContentObj)
            EditableMessageChannel.dispatchEditableComponentUpdated(this)
        }
        EditableComponent.prototype.unregisterEditableContentObject = function (editableContentObj, mute) {

            this._editableContentObjects.splice(this._editableContentObjects.indexOf(editableContentObj),1)
            if(!mute)EditableMessageChannel.dispatchEditableComponentUpdated(this)
        }
        EditableComponent.prototype.createAndRegisterEditableContentObject = function (newEditableContentVO) {
            if(!this.contentObjTitleExists(newEditableContentVO.title)){
                var obj = editableContentFactory.create(newEditableContentVO)
                this.registerEditableContentObject(obj)
                return obj
            }
            return null
        }
        EditableComponent.prototype.contentObjTitleExists = function (title) {
            for (var i = 0; i < this._editableContentObjects.length; i++) {
                var contObj = this._editableContentObjects[i];
                if(contObj.title==title)return true
            }
            return false
        }
        EditableComponent.prototype.getEditableContentObjects = function () {
            return this._editableContentObjects
        }
        EditableComponent.prototype.setEditableItemNewValue = function (newValue, editableItemScopeId) {
            for (var i = 0; i < this._editableContentObjects.length; i++) {
                var obj = this._editableContentObjects[i];
                if (obj.update(newValue, editableItemScopeId))return true
            }
            return false
        }

        EditableComponent.prototype.hasEditableItemObj = function ( editableItem) {
            return api.editableContentArrHasEditableItem(this._editableContentObjects,editableItem)
            /*for (var i = 0; i < this._editableContentObjects.length; i++) {
                var obj = this._editableContentObjects[i];
                if (obj.scope.$id==editableItem.scope.$id)return true
            }
            return false*/
        }

        EditableComponent.prototype.destroy = function ( ) {
            EditableSer.unregisterComponent(this.id)
        }

        var api= {
            getInstance: function (title, element, $scope, id) {
                if(id==null)id=$scope.$id
                var editableComponent = EditableSer.getRegisteredComponent(id)


                if(editableComponent==null) editableComponent=new EditableComponent(title, element, id);
                if ($scope != null) {
                    EditableMessageChannel.onEditableContentObjectAdded($scope, function (editableContentObj) {
                        editableComponent.registerEditableContentObject(editableContentObj)
                    })
                    EditableMessageChannel.onEditableContentObjectRemoved($scope, function (editableContentObj) {
                        editableComponent.unregisterEditableContentObject(editableContentObj)
                    })
                }
                return  editableComponent
            },
            editableContentArrHasEditableItem:function(editableContentObjArr,editableItem){
                for (var i = 0; i < editableContentObjArr.length; i++) {
                    var obj = editableContentObjArr[i];
                    if (obj.scope.$id==editableItem.scope.$id)return true
                }
                return false
            },
            getViewComponentAttributeName:function(){
                //TODO move to editable-content-factory
                return 'tagy-cms-editable'
            },
            getEditableComponentAttributeName:function(){
                return 'tagy-cms-component'
            },
            getViewComponentDirectiveName:function(){
                //TODO move to editable-content-factory
                return 'tagyCmsEditable'
            }
        };
        return api
    });
