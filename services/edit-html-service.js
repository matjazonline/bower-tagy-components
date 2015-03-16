'use strict';

angular.module('tagyComponents')
    .service('EditHtmlService', function EditHtmlService($rootScope, $q, $timeout, EditableSer, markupChangeIdFac, editableComponentFactory, EditableMessageChannel) {

        this.removeInProductionClassName = "remove-in-production"
        this.keepInProdAttrName = "keep-in-production";
        this.removeEditGeneratedTagsAfterThisMetaElement = '<meta class="remove-added-tags-to-head-from-here">'
        this.removeAddedScriptsStartAttr = 'remove-script-start'
        this.removeAddedScriptsStart = '<script '+this.removeAddedScriptsStartAttr+'></script>'
        this.removeAddedScriptsEndAttr = 'remove-script-end'
        this.removeAddedScriptsEnd = '<script '+this.removeAddedScriptsEndAttr+'></script>'
        var baseTagHref=""
        var iframeAppScriptPath = "bower-tagy-components-iframe-app/scripts/scripts.js";
        var iframeAppExtraModulesArr =[]
        var iframeAppExtraModulesPathArr =[]
        var iframeEditorAppAttr = 'ng-app="tagyCmsClientApp"';
        var editModeCssClassName = "tagy-cms-edit-mode";
        var self = this

        var _editingHtmlMarkup = null

        var _lastMarkupChangeId = null


        this.editHtmlMarkup = function (markup, resetMarkupChangeId, pageRootRelPath) {
            var deferred = $q.defer()
            var newChangeId = null
            if (markup != null) {
                newChangeId = markupChangeIdFac.getMarkupChangeId(markup)
                var changeMarkupChangeId = (resetMarkupChangeId==true || newChangeId <= _lastMarkupChangeId );
                markup = self.getIframeHtmlMarkup(markup, changeMarkupChangeId,pageRootRelPath)
                if (changeMarkupChangeId)newChangeId = markupChangeIdFac.getMarkupChangeId(markup)
                _editingHtmlMarkup = markup
                var cleanMarkup = self.cleanEditFrameworkCode(markup);
                EditableMessageChannel.dispatchEditableHtmlMarkupChange(cleanMarkup, newChangeId,_editingHtmlMarkup)
                deferred.resolve()
            }else{
                deferred.reject()
            }
            return deferred.promise
        }

        this.getDocTypeAsString = function (doc) {
            var node = doc.doctype;
            return node ? "<!DOCTYPE "
                + node.name
                + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                + (node.systemId ? ' "' + node.systemId + '"' : '')
                + '>\n' : '';
        }

        this.cleanEditFrameworkCode = function (markup) {
            markup=markup.replace(editModeCssClassName,"")
            //remove elements added to <head>
            var startAt = markup.indexOf(self.removeEditGeneratedTagsAfterThisMetaElement)
            if (startAt < 0) {
                return markup
            }
            var endAt = markup.indexOf("</head>", startAt)
            markup = markup.slice(0, startAt) + markup.slice(endAt)

            //remove scripts at the top


                endAt=markup.indexOf("</head>", startAt)
                if(endAt>0){
                    endAt=markup.lastIndexOf(self.removeAddedScriptsEndAttr, endAt)
                    if(endAt>0){
                        var headTag = "<head>";
                        startAt = markup.indexOf(headTag)+headTag.length
                        var endStr = "</script>";
                        endAt=markup.indexOf(endStr, endAt)+endStr.length
                        markup = markup.slice(0, startAt) + markup.slice(endAt)
                    }
                }

            markup=self.removeElementsWithoutKeepInProduction(markup)
            //remove elements with removeInProductionClassName
            var bodyHtml = self.getStringInsideBodyOrHeadTag(markup, "body")
            var bodyEl = $("<div/>").html(bodyHtml)
            bodyEl.find("." + self.removeInProductionClassName).remove()
            bodyEl.find("[" + self.removeInProductionClassName+"]").remove()
            markup = self.replaceStringInsideBodyOrHeadTag(markup, bodyEl.html(), "body")
            var headHtml = self.getStringInsideBodyOrHeadTag(markup, "head")
            var headEl = $("<div/>").html(headHtml)
            headEl.find("." + self.removeInProductionClassName).remove()
            headEl.find("[" + self.removeInProductionClassName+"]").remove()
            markup = self.replaceStringInsideBodyOrHeadTag(markup, headEl.html(), "head")
            // make html class values unique
            markup = self.makeHtmlClassValuesUnique(markup)
            //remove angular styles
            var searchFor = ".ng-hide"
            var foundInd = markup.indexOf(searchFor)

            while (foundInd > -1) {
                startAt = markup.lastIndexOf("<style", foundInd)
                var endStr = "</style>";
                endAt = markup.indexOf(endStr, foundInd) + endStr.length
                markup = markup.substring(0, startAt) + markup.substr(endAt)
                foundInd = markup.indexOf(searchFor)
            }

            //markup=markup.replace(iframeEditorAppAttr,"")
            //remove base tag
            var baseStartStop=findBaseTagSpanIndexes(markup,false)
            if(baseStartStop!=null)markup=markup.substring(0,baseStartStop[0])+markup.substring(baseStartStop[1])
            markup=self.cleanEditableMarkupWraps(markup)
            //markup=self.cleanMagnetAdminUIElements(markup)
            return markup
        }

        /*this.cleanMagnetAdminUIElements=function(markup) {
         var bodyHtml = self.getStringInsideBodyOrHeadTag(markup, "body")
         var $mkp = $("<div/>").html(bodyHtml)

         $mkp.find('[' + EditableSer.ADMIN_UI_ELEM_ATTR_TO_REMOVE + ']').remove()


         return self.replaceStringInsideBodyOrHeadTag(markup, $mkp.html(), "body")
         }*/

        this.cleanEditableMarkupWraps=function(markup){
            var mkp=markup
            var bodyHtml = self.getStringInsideBodyOrHeadTag(mkp, "body")
            var hasBodyTag=bodyHtml.length>0
            if(!hasBodyTag)bodyHtml=mkp
            var $mkp = $("<div/>").html(bodyHtml)

            $mkp.find('[' + EditableSer.EDITABLE_BINDING_WRAP_ATTR_NAME + ']').each(function(i,obj){
                var $obj=$(obj)
                var cont=$obj.html()
                var prnt = $obj.parent();
                prnt.html(cont)
                prnt.removeClass("ng-isolate-scope")
                prnt.removeClass("ng-scope")
                var clArr = prnt.attr('class').split(/\s+/);
                if(clArr!=null && (clArr.length<1 || (clArr.length==1 && clArr[0].length<1))){
                    prnt.removeAttr('class');
                }
            })

            if(!hasBodyTag){
                return $mkp.html()
            }/*else{
             var headCleaned=self.cleanEditableMarkupWraps(self.getStringInsideBodyOrHeadTag(mkp, "head"))
             //console.log("HHHHHCCCCCCCC=",headCleaned)
             mkp=self.replaceStringInsideBodyOrHeadTag(mkp, headCleaned, "head")
             }*/
            return self.replaceStringInsideBodyOrHeadTag(mkp, $mkp.html(), "body")
        }

        this.cleanRemoveInProductionCssClasses=function(markup){
            // removes classes that end with '_remove-in-production' - 'my-class_remove-in-production'
            var bodyHtml = self.getStringInsideBodyOrHeadTag(markup, "body")
            var hasBodyTag=bodyHtml.length>0
            if(!hasBodyTag)bodyHtml=markup
            var $mkp = $("<div/>").html(bodyHtml)

            var elems=$mkp.find('*')
            for (var i = 0; i < elems.length; i++) {
                var $currElem = $(elems[i]);
                var attrCl = $currElem.attr("class");
                if(attrCl){
                    var remClArr=attrCl.match(/[\w-]*_remove-in-production[\w-]*/g);
                    if(remClArr && remClArr.length>0){
                        for (var j = 0; j < remClArr.length; j++) {
                            var toRemClass = remClArr[j];
                            $currElem.removeClass(toRemClass)
                        }
                    }
                }
            }
            if(!hasBodyTag)return $mkp.html()
            return self.replaceStringInsideBodyOrHeadTag(markup, $mkp.html(), "body")
        }

        this.clearAndAppendToHeadElement = function (markup, appendString, clearIfExists) {
            if (clearIfExists)  markup = markup.replace(appendString, "")
            var startAt = markup.indexOf("</head>")
            if (startAt < 0)return markup
            var ret = markup.slice(0, startAt) + appendString + markup.slice(startAt);
            return  ret
        }

        this.clearAndPrependToHeadElement = function (markup, prependString, clearIfExists) {
            if (clearIfExists)  markup = markup.replace(prependString, "")
            var appToTag = "<head>";
            var startAt = markup.indexOf(appToTag)+appToTag.length
            if (startAt <= appToTag.length)return markup
            var ret = markup.slice( 0,startAt) + prependString + markup.slice(startAt);
            return  ret
        }

        this.addKeepInProductionAttrs = function (markup) {
            var headHtml = self.getStringInsideBodyOrHeadTag(markup, "head")
            var headTempHolderEl = $("<div/>").html(headHtml)
            headTempHolderEl.find("script,style").attr(self.keepInProdAttrName,'')
            markup = self.replaceStringInsideBodyOrHeadTag(markup, headTempHolderEl.html(), "head")
            var bodyHtml = self.getStringInsideBodyOrHeadTag(markup, "body")
            var bodyTempHolderEl = $("<div/>").html(bodyHtml)
            bodyTempHolderEl.find("script,style").attr(self.keepInProdAttrName,'')
            markup = self.replaceStringInsideBodyOrHeadTag(markup, bodyTempHolderEl.html(), "body")
            return markup
        }

        this.removeElementsWithoutKeepInProduction = function (markup) {
            var headHtml = self.getStringInsideBodyOrHeadTag(markup, "head")
            var headTempHolderEl = $("<div/>").html(headHtml)
            //console.log("removeElementsWithoutKeepInProductionHHH",headHtml)
            headTempHolderEl.find("script,style").each(function(i,el){
                var $el = $(el);
                if($el.attr(self.keepInProdAttrName)==null){
                    $el.remove()
                }else{
                    $el.removeAttr(self.keepInProdAttrName)
                }
            })
            markup = self.replaceStringInsideBodyOrHeadTag(markup, headTempHolderEl.html(), "head")
            var bodyHtml = self.getStringInsideBodyOrHeadTag(markup, "body")
            var bodyTempHolderEl = $("<div/>").html(bodyHtml)
            bodyTempHolderEl.find("script,style").each(function(i,el){
                var $el = $(el);
                if($el.attr(self.keepInProdAttrName)==null){
                    $el.remove()
                }else{
                    $el.removeAttr(self.keepInProdAttrName)
                }
            })
            markup = self.replaceStringInsideBodyOrHeadTag(markup, bodyTempHolderEl.html(), "body")
            return markup
        }

        this.getBodyOrHeadOpenTag = function (markupString, tagName) {
            var searchOpenTagStr = "<" + tagName;
            var openTagCloseStr = ">"
            var startAt = markupString.indexOf(searchOpenTagStr);
            if (startAt < 0)return ""
            var endAt = markupString.indexOf(openTagCloseStr)
            var ret = markupString.slice(startAt, endAt)
            return  ret
        }
        this.getStringInsideBodyOrHeadTag = function (markupString, tagName) {
            var searchOpenTagStr = "<" + tagName;
            var openTagCloseStr = ">"
            var fromIndex = markupString.indexOf(searchOpenTagStr);
            if (fromIndex < 0)return ""
            var startAt = markupString.indexOf(openTagCloseStr, fromIndex) + 1
            var endAt = markupString.indexOf("</" + tagName)
            var ret = markupString.slice(startAt, endAt)
            return  ret
        }
        this.replaceStringInsideBodyOrHeadTag = function (originalMarkup, replaceWithMarkup, tagName) {
            var searchOpenTagStr = "<" + tagName;
            var openTagCloseStr = ">"
            var fromIndex = originalMarkup.indexOf(searchOpenTagStr);
            if (fromIndex < 0)return ""
            var startAt = originalMarkup.indexOf(openTagCloseStr, fromIndex) + 1
            var endAt = originalMarkup.indexOf("</" + tagName)
            var betweenOpenStart=originalMarkup.lastIndexOf(searchOpenTagStr, endAt)
            var prevStartAt=startAt
            while(betweenOpenStart>prevStartAt) {
                endAt = originalMarkup.indexOf("</" + tagName, endAt)
                prevStartAt=betweenOpenStart
                betweenOpenStart=originalMarkup.lastIndexOf(searchOpenTagStr, endAt)
            }

            var ret = originalMarkup.slice(0, startAt) + replaceWithMarkup + originalMarkup.slice(endAt)
            return  ret
        }
        this.makeHtmlClassValuesUnique = function (markup) {
            var searchOpenTagStr = "<html";
            var openTagCloseStr = ">"
            var startIndex = markup.indexOf(searchOpenTagStr);
            if (startIndex < 0)return markup
            var openTagClosesIndex = markup.indexOf(openTagCloseStr, startIndex) + 1
            var markupHtmlOpenTagValues = markup.slice(startIndex + searchOpenTagStr.length, openTagClosesIndex);
            var elem = $("<div" + markupHtmlOpenTagValues + "</div>")
            var classes = []
            var classesAttrVal = null
            try {
                classesAttrVal = elem.attr('class')
                classes = _.uniq(classesAttrVal.split(" "))
            } catch (err) {
            }

            if (classesAttrVal != null) {
                markupHtmlOpenTagValues.replace("'", '"')
                //TODO use regEx
                var classAttrInd = markupHtmlOpenTagValues.indexOf("class")
                var classAttrValStartInd = markupHtmlOpenTagValues.indexOf('"', classAttrInd) + 1
                var classAttrValEndInd = markupHtmlOpenTagValues.indexOf('"', classAttrValStartInd)
                markupHtmlOpenTagValues = markupHtmlOpenTagValues.slice(0, classAttrValStartInd) + classes.join(" ") + markupHtmlOpenTagValues.slice(classAttrValEndInd)
                var newHeadOpenTag = '<html' + markupHtmlOpenTagValues
                var ret = markup.slice(0, startIndex) + newHeadOpenTag + markup.slice(openTagClosesIndex)
                return   ret
            }
            return markup
        }


        this.getIframeHtmlMarkup = function (markup, changeMarkupChangeId,pageRootRelPath) {
            //TODO cache getMarkup() result
            if (markup == null)return ""
            if (markup.indexOf("<html") < 0) {
                markup = markupChangeIdFac.wrapMarkupInHtmlTags(markup)

            } else {
                if (changeMarkupChangeId)markup = markupChangeIdFac.changeMarkupChangeId(markup)
            }
            //for manual bootstrap check if any cnv-* directive present if(markup.indexOf(iframeEditorAppAttr)<0)markup = markup.replace("<html", '<html ng-app="tagyCmsClientApp" ')
            if(markup.indexOf("cnv-")<0)markup = markup.replace("<html", '<html ng-app="tagyCmsClientApp" ')
            markup=self.addEditModeCssClass(markup)
            markup=self.addTopLevelEditableComponentAttr(markup)
            markup=insertBaseTag(markup)
            //TODO removeEditGeneratedTagsAfterThisMetaElement is a quick fix better remove with search

            markup = self.clearAndAppendToHeadElement(markup, self.removeEditGeneratedTagsAfterThisMetaElement)
            markup=self.clearAndPrependToHeadElement(markup,self.removeAddedScriptsStart+self.removeAddedScriptsEnd)
            var editStylesheets = ''
            //TODO move/add directive specific scripts from directive itself
            var editScripts = ''
                + '<script '+self.removeInProductionClassName+' src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>'
                + '<script '+self.removeInProductionClassName+' src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>'
                + getExtraModulesScriptPaths()
                + getExtraModulesInitArr()
                + '<script '+self.removeInProductionClassName+' src="'+ iframeAppScriptPath+'"></script>'
            if(pageRootRelPath)editScripts=editScripts+ '<script '+self.removeInProductionClassName+'>window.cnvXConfigPath="'+pageRootRelPath+'"</script>'
            markup = self.clearAndAppendToHeadElement(markup, editStylesheets)
            markup = self.clearAndPrependToHeadElement(markup, editScripts)
            markup= self.addKeepInProductionAttrs(markup)
            return markup
        }

        var getExtraModulesScriptPaths=function(){
            var ret=''
            for (var i = 0; i < iframeAppExtraModulesPathArr.length; i++) {
                var path = iframeAppExtraModulesPathArr[i];
                if(path!=null&& path.length>0)ret=ret+'<script '+self.removeInProductionClassName+' src="'+ path+'"></script>'
            }
            return ret
        }
        var getExtraModulesInitArr=function(){
            var ret=''
            var modulesArrStr=''
            for (var i = 0; i < iframeAppExtraModulesArr.length; i++) {
                var moduleName = iframeAppExtraModulesArr[i];
                if(i==0)modulesArrStr='['
                if(moduleName!=null&& moduleName.length>0)modulesArrStr=modulesArrStr+'"'+moduleName+'"'
                if(i+1<iframeAppExtraModulesArr.length)modulesArrStr=modulesArrStr+','
                if(i+1==iframeAppExtraModulesArr.length)modulesArrStr=modulesArrStr+']'
            }
            if(modulesArrStr.length>0) {
                ret='<script '+self.removeInProductionClassName+'>var _tagyCmsClientAppExtraModules='+modulesArrStr+'</script>'
            }
            return ret
        }


        var findBaseTagSpanIndexes=function(markup, leaveIfBaseHrefIsOK){
            var tagOpen = '<base';
            var bTag = getBaseTagString()//tagOpen+' href="' + baseTagHref + '"/>';
            if(leaveIfBaseHrefIsOK==true && markup.indexOf(bTag)>-1)return null;
            var searchOpenTagStr = tagOpen;
            var openTagCloseStr = ">"
            var fromIndex = markup.indexOf(searchOpenTagStr);
            if(fromIndex>-1){
                var toInd=markup.indexOf(openTagCloseStr,fromIndex)+1
                if(markup.substring(toInd-2,toInd)!="/>"){
                    var closeTagToInd=markup.indexOf("</base>",fromIndex)+7
                    if(closeTagToInd>7) {
                        toInd=closeTagToInd
                    }
                }
                return [fromIndex,toInd];
            }
            return null
        }

        var getBaseTagString=function(){
            var tagOpen = '<base';
            return tagOpen+' href="' + baseTagHref + '"/>'
        }

        var insertBaseTag=function(markup){
            /*var tagOpen = '<base';
             var bTag = tagOpen+' href="' + baseTagHref + '"/>';
             if(markup.indexOf(bTag)>-1)return markup
             var searchOpenTagStr = tagOpen;
             var openTagCloseStr = ">"
             var fromIndex = markup.indexOf(searchOpenTagStr);
             if(fromIndex>-1){
             var toInd=markup.indexOf(openTagCloseStr,fromIndex)+1
             if(markup.substring(toInd-2,toInd)!="/>"){
             var closeTagToInd=markup.indexOf("</base>",fromIndex)+7
             if(closeTagToInd>7) {
             toInd=closeTagToInd
             }
             }
             return markup.substring(0,fromIndex)+bTag+markup.substring(toInd);
             }*/
            var baseStartStopInd=findBaseTagSpanIndexes(markup, true)
            if(baseStartStopInd!=null) {
                return markup.substring(0,baseStartStopInd[0])+getBaseTagString()+markup.substring(baseStartStopInd[1]);
            }
            var searchOpenTagStr="<head"
            var openTagCloseStr=">"
            var fromIndex = markup.indexOf(searchOpenTagStr);
            if(fromIndex>-1){
                var toInd=markup.indexOf(openTagCloseStr,fromIndex)+1
                return markup.substring(0,toInd)+getBaseTagString()+markup.substring(toInd)
            }
            alert("No <head> tag?")
        }


        this.setIframeAppExtraModules=function(extraModulesMapArr){
            iframeAppExtraModulesArr=[]
            iframeAppExtraModulesPathArr=[]
            for(var i=0; i< extraModulesMapArr.length;i++) {
                if(extraModulesMapArr[i].module)iframeAppExtraModulesArr.push(extraModulesMapArr[i].module)
                if(extraModulesMapArr[i].src)iframeAppExtraModulesPathArr.push(extraModulesMapArr[i].src)
            }
        }

        this.setIframeAppJSFilePath=function(jsPath){
            iframeAppScriptPath=jsPath
        }

        this.setIframeBaseTagHref=function(basePath){
            baseTagHref=basePath
        }

        this.addEditModeCssClass=function(markup){
            if(self.getBodyOrHeadOpenTag(markup,"html").indexOf(editModeCssClassName)>0)return
            var stInd=markup.indexOf("<html")
            var endInd=markup.indexOf(">",stInd) +1
            var htmlOpenTag=markup.substring(stInd,endInd)
            var $updatedHtmlTag=$($.parseXML(htmlOpenTag+"</html>"))
            $updatedHtmlTag.find("html").addClass(editModeCssClassName)
            htmlOpenTag=(new XMLSerializer()).serializeToString($updatedHtmlTag[0]).replace("</html>","").replace("/>",">")
            var ret=markup.substring(0,stInd)+htmlOpenTag+markup.substring(endInd)

            return ret
        }
        this.addTopLevelEditableComponentAttr=function(markup){

            var stInd=markup.indexOf("<html")
            var endInd=markup.indexOf(">",stInd)
            var compAttrInd = markup.indexOf(editableComponentFactory.getEditableComponentAttributeName());
            if(stInd>-1 && endInd>stInd &&  ( compAttrInd==-1 || (compAttrInd>endInd) ) ){
                return markup.substring(0,endInd)+' '+editableComponentFactory.getEditableComponentAttributeName()+'="top level content"'+markup.substring(endInd)
            }else if(stInd<0){
                console.log("INFO editHtmlService - no <html tag found")
            }
            return markup
        }
    });
