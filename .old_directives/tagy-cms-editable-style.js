'use strict';

angular.module('tagyComponents')
    .directive('tagyCmsEditableStyle', function (EditableStyleSer,EditableMessageChannel,editableStyleItemFactory) {
        return {
            replace:false,
            restrict: 'A',
            link:function postLink(scope, element, attrs) {
                var members={};
                scope.update = function (styleItem) {
                    element.html(members.getUpdatedStyleStringWithNewValues(element.html(),styleItem))
                    EditableMessageChannel.dispatchStyleValueUpdatedEvent(styleItem)
                }


                members.getEditableStyleItemsFromCSSString = function (cssStyleString) {
                    //TODO works only with .class selectors for now
                    var currClassBody, currClassName, clNameSInd;
                    var ret = []
                    var sInd = cssStyleString.indexOf("{", 0)
                    var eInd
                    while (sInd > 0) {
                        eInd = cssStyleString.indexOf("}", sInd)
                        if (eInd < 0) break;
                        currClassBody = cssStyleString.substring(sInd + 1, eInd)
                        clNameSInd = cssStyleString.lastIndexOf("}", sInd) + 1
                        if (clNameSInd < 0)clNameSInd = 0
                        currClassName = cssStyleString.substring(clNameSInd, sInd)
                        currClassName = currClassName.replace(";", "")
                        ret.push(editableStyleItemFactory.create({element:element,scope:scope, className: currClassName, bodyCss: currClassBody, title: members.parseTitleFromClassName(currClassName), type: members.parseTypeFromClassName(currClassName), value: members.parseValue(currClassBody), cssProperty: members.parseCSSProperty(currClassBody)}))
                        sInd = cssStyleString.indexOf("{", eInd)
                    }
                    return  ret
                }
                members.parseTitleFromClassName = function (className) {
                    var sInd = className.indexOf("_")
                    var eInd = className.indexOf("_", sInd + 1)
                    var title = className.substring(sInd + 1, eInd)
                    title = title.replace("-", " ")
                    return  title
                }
                members.parseTypeFromClassName = function (className) {
                    var sInd = className.lastIndexOf("_")
                    return className.substr(sInd + 1)
                }
                members.parseValue = function (classBody) {
                    var sInd = classBody.indexOf(":")
                    var eInd = classBody.indexOf(";")
                    if (eInd < 0)alert("no semicolon found at css editable declaration")
                    return classBody.substring(sInd + 1, eInd)
                }
                members.parseCSSProperty = function (classBody) {
                    var eInd = classBody.indexOf(":")
                    return classBody.substring(0, eInd)
                }
                members.getUpdatedStyleStringWithNewValues = function (cssStyleString, editableStyleItemObj) {
                    //TODO if there are many declarations with same selector it will find only first
                    var sStylesInd = 0
                    var eStylesInd = cssStyleString.length-1

                    var sInd = cssStyleString.indexOf(editableStyleItemObj.className)
                    if (sInd > eStylesInd)alert("TOOO LATE")
                    var eInd = cssStyleString.indexOf("}", sInd)
                    var updateStr = cssStyleString.substring(sInd, eInd)
                    var propStart = updateStr.indexOf(editableStyleItemObj.cssProperty)
                    if (propStart > -1) {
                        var valueStart = updateStr.indexOf(":") + 1
                        var valueEnd = updateStr.indexOf(";")
                        //console.log("UUUUUCSS0000=", updateStr)
                        updateStr = updateStr.substring(0, valueStart) + editableStyleItemObj.value + updateStr.substr(valueEnd)
                        //console.log("UUUUUCSS=", markup.substr(eInd))
                        return cssStyleString.substring(0, sInd) + updateStr + cssStyleString.substr(eInd)
                    } else {
                        alert("Can't find css property to update with new value (" + editableStyleItemObj.className + editableStyleItemObj.bodyCss + ")")
                        return cssStyleString
                    }
                }


                members.getEditableStyleItemsFromCSSString( element.html())

            }
        };
    });
