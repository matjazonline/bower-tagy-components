'use strict';

angular.module('tagyComponents')
    .factory('editableContentFactory', function (EditableMessageChannel) {


        var EditableItem = function (element, scope, title, description, type, value, editProps,visible) {
            this.registered=false;
            this.updateOpts(element, scope, title, description, type, value, editProps,visible)
        }

        EditableItem.prototype.updateOpts = function (element, scope, title, description, type, value, editProps, visible) {
            this.element = $(element)
            this.scope = scope
            this.title = title
            this.description = description
            this.type = (this.element != null && this.element.length > 0) ? this._getType() : type
            this.value = value
            this.visible=(visible==null || visible!=false)?true:false
            if(this.editProps==null)this.editProps={}
            if(editProps!=null)this.editProps=editProps
        }

        EditableItem.prototype._getType = function () {

            switch (this.element.prop("tagName").toLowerCase()) {
                case "img":
                    return "image"
                default:
                    return "text"

            }
            return element.prop("tagName")
        }

        EditableItem.prototype.update = function (newValue, scopeId) {
            if (this.scope.$id == scopeId) {
                if(angular.isObject(newValue)){
                    this.editProps=newValue
                }else{
                    this.value = newValue
                }
                if (this.scope.update != null)this.scope.update(newValue)
                return true
            }
            return false
        }

        EditableItem.prototype.registerOnComponent = function () {
            if (this.registered!=true && this.scope != null && this.scope.$emit != null) {
                EditableMessageChannel.dispatchEditableContentObjectAdded(this.scope, this)
                this.registered=true
            }
            return this.registered
        }


        EditableItem.prototype.destroy = function ( ) {
            if (this.registered==true && this.scope != null && this.scope.$emit != null) {
                EditableMessageChannel.dispatchEditableContentObjectRemoved(this.scope, this)
                this.registered=false
            }
        }


        var api = {
            getInstance: function (element, scope, title, description, type, value, editProps,visible) {
                var editableItem = new EditableItem(element, scope, title, description, type, value, editProps, visible);
                return  editableItem
            }
            ,getAndRegisterInstance: function (element, scope, title, description, type, value, editProps, visible) {
                var editableItem = api.getInstance(element, scope, title, description, type, value, editProps, visible);
                editableItem.registerOnComponent()
                /*if (scope != null && scope.$emit != null) {
                    EditableMessageChannel.dispatchEditableContentObjectAdded(scope, editableItem)
                }*/
                return  editableItem
            }, create: function (vo) {
                return api.getInstance(null, vo.scope, vo.title, vo.description, vo.type, vo.value, vo.editProps,vo.visible)
            },
            getViewComponentAttributeName:function(){
                            return 'tagy-cms-editable'
            },
            getViewComponentDirectiveName:function(){
                            return 'tagyCmsEditable'
            }
        }
        return api
    });
