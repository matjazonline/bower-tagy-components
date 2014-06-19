'use strict';

angular.module('tagyComponents')
    .factory('editableStyleItemFactory', function (EditableMessageChannel,uuid4, EditableStyleSer) {


        var EditableStyleItem = function (element, scope, className, bodyCss, title, type, value,cssProperty) {
            this.updateOpts(element, scope, className, bodyCss, title, type, value,cssProperty)
            EditableStyleSer.registerStyleItem(this)
        }

        EditableStyleItem.prototype.updateOpts = function (element, scope, className, bodyCss, title, type, value,cssProperty) {
            if(this.id==null)this.id=uuid4.generate()
            this.element = $(element)
            this.scope = scope
            this.title = title
            this.className=className
            this.bodyCss=bodyCss
            this.type=type
            this.cssProperty=cssProperty
            this.type =type
            this.value=value
        }

        EditableStyleItem.prototype.update = function (newValue) {
            if (this.id == newValue.id) {
                this.value = newValue.value
                if (this.scope && this.scope.update != null)this.scope.update(this)
                return true
            }
            return false
        }

        var api = {
            getInstance: function (element, scope, className, bodyCss, title, type, value,cssProperty) {
                var editableStyleItem = new EditableStyleItem(element, scope, className, bodyCss, title, type, value,cssProperty);
                return  editableStyleItem
            }, create: function (vo) {
                return api.getInstance(vo.element, vo.scope, vo.className, vo.bodyCss, vo.title, vo.type, vo.value,vo.cssProperty)
            }
        }
        return api
    });
