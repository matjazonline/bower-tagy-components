(function (window, angular, undefined) {
    'use strict';


    angular.module('tagyComponents', ['uuid'])
        .directive('tagyCmsEditable', function ($compile, $q, $sce,  EditableSer, EditableMessageChannel, editableContentFactory) {
            //var dropdownId=null
            /*var existingEditInterface=function(element){
             dropdownId=element.attr("data-dropdown")
             if(dropdownId==null)return null
             var found=$("#"+dropdownId)
             return found.length>0?found[0]:null
             }
             var createEditableInterface=function(element){
             var editUI=existingEditInterface(element)
             //if(editUI!=null)return editUI
             if(editUI!=null)$(editUI).remove()
             var date = new Date();
             var now=date.getTime()
             dropdownId = "editable-ui-" + now;
             element.attr("data-dropdown", dropdownId)
             editUI = angular.element('<div id="'+dropdownId+'" class="f-dropdown content small '+EditableSer.removeInProductionClassName+'" data-dropdown-content>\
             <input ng-model="data.value"> \
             <a href="" class="button tiny success" ng-click="saveEdit()">OK</a>\
             </div>')
             $(element).after(
             editUI
             )
             return editUI
             }*/

            return {
                //template: '<div></div>',
                restrict: 'A',
                replace: true,
                priority: 0,
                scope: {
                    editableObj: '=', tagyCmsEditable: '@', editableEscapeHtml: '@'
                },
                controller: function ($scope, $element, $attrs, $transclude) {
                    this.remove = function (muteUpdatedEvent) {
                        var eScopeId=$scope.editable.scope.$id
                        $scope.editable.destroy()
                        $scope.$destroy()
                        if (muteUpdatedEvent != true) {
                            EditableMessageChannel.dispatchUpdatedEvent(null, {element: $element, type:'remove', editableScopeId:eScopeId})
                        }
                        $element.remove()
                    }
                },
                link: function postLink(scope, element, attrs,controller) {
                    //scope.editable = editableContentFactory.getInstance(element, scope, "", "", "", null)
                    var _originalCssDisplayVal=$(element).css('display')
                    if(attrs.tagyCmsVisible==null)attrs.tagyCmsVisible=_originalCssDisplayVal!='none'
                    scope.setVisible=function(val){
                        if(val=='false' || val==false){
                            _originalCssDisplayVal=$(element).css('display')
                            $(element).css('display','none')
                            $(element).attr('tagy-cms-visible',false)
                            attrs.tagyCmsVisible=false
                            scope.editable.visible=false
                        }else{
                            var dispVal=(_originalCssDisplayVal!=null || _originalCssDisplayVal!='none' || _originalCssDisplayVal.length<1)?'':_originalCssDisplayVal
                            $(element).css('display',dispVal)
                            $(element).removeAttr('tagy-cms-visible')
                            attrs.tagyCmsVisible=true
                            scope.editable.visible=true
                        }
                        if(scope.editable!=null && scope.editable.registered)EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element},false)
                    }


                    var eTitle = attrs.editableTitle
                    if (eTitle == null || eTitle.length < 1)eTitle = attrs.tagyCmsEditable
                    if (eTitle != null && eTitle.length > 0) {
                        //scope.editable.updateOpts(element, scope, attrs.editableTitle, attrs.editableDescription, null, getDataValue())
                        scope.editable = editableContentFactory.getInstance(element, scope, eTitle, attrs.editableDescription, null, null,null,(attrs.tagyCmsVisible!='false'))
                        scope.setVisible(attrs.tagyCmsVisible)
                    } else {
                        element.text('Editable item needs a title, for example: tagy-cms-editable="title"')
                        return
                    }

                    var currTagName = element.prop("tagName")

                    var getDataValue = function () {
                        if (scope.data != null && scope.data.value != null && angular.isFunction(scope.data.value.valueOf)) {
                            return scope.data.value.valueOf()
                        }
                        return scope.data.value

                    }


                    var setEditableProps = function (editableProps) {
                        if (editableProps.link != null) {
                            scope.data.editProp_link = editableProps.link
                            element.attr("href", scope.data.editProp_link)
                        }
                        if (scope.data.editProp_backgroundImage != null) {

                            scope.data.editProp_backgroundImage = editableProps.backgroundImage == '' || editableProps.backgroundImage == null ? '' : editableProps.backgroundImage
                            if (scope.data.editProp_backgroundImage != '') {
                                $(element).css("background-image", 'url("' + scope.data.editProp_backgroundImage + '")')
                            } else {
                                $(element).css("background-image", 'none')
                            }
                        }
                    }

                    scope.data = {}
                    function getBackgroundFilePath(cssBackgroundProp) {
                        var cssBackgroundValue = cssBackgroundProp
                        if (cssBackgroundValue == null || cssBackgroundValue == '' || cssBackgroundValue == 'none') {
                            cssBackgroundValue = ''
                        } else {
                            cssBackgroundValue = cssBackgroundValue.replace('"', '')
                            cssBackgroundValue = cssBackgroundValue.replace('url(', '')
                            cssBackgroundValue = cssBackgroundValue.replace(')', '')
                        }
                        return cssBackgroundValue
                    }

                    if (currTagName == "IMG") {
                        scope.data.value = element.attr("src")
                        //element.addClass("editable-image-element")
                        /*var onFileSelected = function (eventHolder) {
                         //console.log("File seelcted=", eventHolder)
                         element.attr("src", eventHolder.result)
                         document.onViewUpdatedCallback()
                         }*/
                        element.click(function (ev) {
                            ev.preventDefault()
                            ev.stopPropagation()
                            scope.$apply(function () {
                                scope.editable.value = scope.data.value
                                EditableMessageChannel.dispatchEditEvent(scope.editable)
                            })

                            /*ev.preventDefault()
                             var now = new Date()
                             document.onViewUpdatedCallback({event: "event:select-file", resHolder: {id: now.getTime(), callbackFn: onFileSelected}})*/
                        })

                        scope.update = function (value) {
                            if (value != element.attr("src") && angular.isString(value)) {
                                element.attr("src", value)
                                //scope.editable.value = value
                                scope.data.value = value
                                EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                            }else if (angular.isObject(value)) {
                                if(value.type!=null ){
                                    if(value.type=='visible'){
                                        scope.setVisible(value.value)
                                        return
                                    }else if(value.type=='remove'){
                                        controller.remove()
                                        return
                                    }
                                }else{
                                    setEditableProps(value)
                                    EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                                }
                            }
                        }

                    } else if (currTagName == "TITLE") {
                        scope.data.value = element.html()
                        scope.update = function (value) {
                            if (value != element.html() && angular.isString(value)) {
                                element.html(value)
                                //scope.editable.value = value
                                scope.data.value = value
                                EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                            }
                        }
                    } else if (currTagName == "META") {
                        scope.data.value = element.attr("content")
                        scope.update = function (value) {
                            if (value != element.attr("content") && angular.isString(value)) {
                                element.attr("content", value)
                                //scope.editable.value = value
                                scope.data.value = value
                                EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                            }
                        }
                    } else {

                        if (scope.editableObj != null && attrs.editablePropertyName != null) {

                            scope.$watch("editableObj." + attrs.editablePropertyName, function (val, old) {
                                scope.data.value = val
                            })
                            scope.$watch("data.value", function (val, old) {
                                scope.editableObj[attrs.editablePropertyName] = val
                            })
                            scope.data.value = scope.editableObj[attrs.editablePropertyName]
                            element.text("")
                        } else if (attrs.editableProps == null) {
                            scope.data.value = element.html()
                        }
                        //scope.editable.value = scope.data.value
                        if (attrs.editableProps == null) {
                            if (scope.editableEscapeHtml == 'true') {
                                /*var nodeString = "{{data.value}}";
                                 element.text(nodeString);*/
                                $(element).empty().append('<span ' + EditableSer.EDITABLE_BINDING_WRAP_ATTR_NAME + ' ng-bind="data.value"></span>')
                                //scope.editable.value = scope.data.value
                            } else {
                                scope.data.value = $sce.trustAsHtml(scope.data.value.toString())
                                $(element).empty().append('<span ' + EditableSer.EDITABLE_BINDING_WRAP_ATTR_NAME + ' ng-bind-html="data.value"></span>')
                                //scope.editable.value = getDataValue()
                            }
                            $compile(element.contents())(scope);
                        } else {
                            scope.editable.value = null
                            scope.data.value = null
                            if (attrs.editableProps.indexOf("background-image") > -1) {
                                scope.data.editProp_backgroundImage = getBackgroundFilePath($(element).css("background-image"));


                                scope.editable.editProps["backgroundImage"] = scope.data.editProp_backgroundImage
                            }
                        }
                        if (currTagName == "A") {
                            scope.data.editProp_link = $(element).attr("href")
                            scope.editable.editProps["link"] = scope.data.editProp_link
                        }

                        //.append("<i class='icon-pencil icon-muted no-muted-hover "+EditableSer.removeInProductionClassName+"' style='position: absolute;'></i>")

                        //moved up - $compile(element.contents())(scope);
                        //$compile (angular.element(createEditableInterface(element)).contents())(scope)


                        element.click(function (ev) {
                            ev.preventDefault()
                            ev.stopPropagation()
                            scope.$apply(function () {
                                scope.editable.value = getDataValue()
                                EditableMessageChannel.dispatchEditEvent(scope.editable)
                            })
                        })


                        scope.update = function (value) {
                            if (angular.isString(value) && value != scope.data.value && scope.data.value != null) {
                                if (scope.editableEscapeHtml == 'true') {
                                    scope.data.value = value
                                } else {
                                    scope.data.value = $sce.trustAsHtml(value.toString())
                                }
                                EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                            } else if (angular.isObject(value)) {


                                if(value.type!=null ){
                                    if(value.type=='visible'){
                                        scope.setVisible(value.value)
                                        return
                                    }else if(value.type=='remove'){
                                        controller.remove()
                                        return
                                    }
                                }else{
                                    setEditableProps(value)
                                    EditableMessageChannel.dispatchUpdatedEvent(scope.editable, {element: scope.editable.element})
                                }

                            }
                        }


                    }

                    /*element.hover(function (ev) {
                     */
                    /*$(".no-muted-hover",element).removeClass("icon-muted")*/
                    /*
                     EditableMessageChannel.dispatchEditableItemHoverOver(scope.editable)
                     }, function (ev) {
                     //$(".no-muted-hover",element).addClass("icon-muted")
                     EditableMessageChannel.dispatchEditableItemHoverOut(scope.editable)
                     })*/

                    /*scope.$watch("tagyCmsEditable", function (val) {
                     if (val != null && val[0] == "{") {
                     var json = angular.fromJson(val)
                     scope.editable.updateOpts(element, scope, json.title, json.description, null, getDataValue())
                     }
                     })*/
                    scope.editable.value = getDataValue()
                    scope.editable.registerOnComponent()
                    /*attrs.$observe('tagyCmsVisible', function(val) {
                     scope.setVisible(val)
                    })*/
                    /*if(attrs.editableTitle!=null){
                     scope.editable.updateOpts(element, scope, attrs.editableTitle, attrs.editableDescription, null, getDataValue())
                     }*/

                }
            }
        })
})(window, angular)