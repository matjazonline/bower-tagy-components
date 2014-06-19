'use strict';

angular.module('tagyComponents')
    .service('CrossFrameConnection', function CrossFrameConnection($window, $rootScope, $timeout, EditableMessageChannel, $injector, uuid4, $q) {
        var self = this
        alert("cross-frame-connection_messages.js - this is unfinished test with html5 cross frame messaging listeners - please remove it")
        this.EVENT_FRAME_CONNECTION_SUCCESS = "CrossFrameConnection:connectionSuccEvt"
        this.EVENT_FRAME_DISCONNECT_SUCCESS = "CrossFrameConnection:disconnectionSuccEvt"
        this.onFrameConnectionSuccess = function ($scope, handler) {
            $scope.$on(self.EVENT_FRAME_CONNECTION_SUCCESS, function (event) {
                handler()
            })
        }
        this.onFrameDisconnectSuccess = function ($scope, handler) {
            $scope.$on(self.EVENT_FRAME_DISCONNECT_SUCCESS, function (event) {
                handler()
            })
        }

        var dispatchFrameConnectionSuccess = function () {
            $rootScope.$broadcast(self.EVENT_FRAME_CONNECTION_SUCCESS)
        }

        var dispatchFrameDisconnectedSuccess = function () {
            $rootScope.$broadcast(self.EVENT_FRAME_DISCONNECT_SUCCESS)
        }

        var _messageTypes = {}
        _messageTypes.EVENT_ECHO_SERVICE_CALL = "eventServiceCall"
        _messageTypes.EVENT_ECHO_SERVICE_CALL_RESPONSE = "eventServiceCallResponse"
        _messageTypes.EVENT_ECHO_REGISTER = "eventEchoReg"
        _messageTypes.EVENT_ECHO_CALL = "eventEchoCall"
        _messageTypes.CONNECT_ME = "connectMe"
        _messageTypes.CONNECTED_YOU = "connectedYou"
        _messageTypes.DISCONNECT_ME = "disconnectMe"
        _messageTypes.DISCONNECTED_YOU = "disconnectedYou"
        this.watcherTypes = {}
        this.watcherTypes.ON_SCOPE_EVENT = "onEditableMSGChannel"
        var _crossIframeWindow = null
        var _listenerFunction = null
        var _delayedCallStack = []
        var _echoEventHandlers = {}
        //TODO looks like removeEventListener does not unregister events - quick fix with _handledCallIds (_listenerFunction is called multiple times if iframe reloads)
        var _handledCallIds = {}
        var _waitingCallIdCrossFrameRequest = {}
        var _framesConnected = false
        var _thisID = Math.random()
        var _removedListeners = false

        this.sendMessage = function (message) {
            if (_removedListeners)return
            if (message._messageType == _messageTypes.EVENT_ECHO_REGISTER) {
                //TODO only one event handler supported currently
                _echoEventHandlers[message.eventName] = message
            } else if (message._messageType == _messageTypes.EVENT_ECHO_SERVICE_CALL) {

            }

            // if(message.deferredResult!=null){
            if (message._callId == null)message._callId = uuid4.generate()
            if (message.deferredResult != null)_waitingCallIdCrossFrameRequest[message._callId] = message.deferredResult
            //}

            console.log("POSTMSGGGGGGGGGGG PARENT=", message._messageType, _crossIframeWindow)
            if (angular.isObject(message)) {
                message = angular.toJson(message)
            }

            if (_crossIframeWindow)_crossIframeWindow.postMessage(message, "*")
        }

        var scopeIdEncodeForJSON = function (prop, value) {
            //TODO set converters to service config externally
            var ret = value
            if (prop == "scope" && value.$id != null) {
                ret = {}
                ret["_id"] = value.$id
            }
            return ret
        }

        var scopeIdDecodeForJSON = function (value, prop) {
            //TODO set converters to service config externally

            if (prop == "scope" && value._id != null) {
                var ret = {}
                //ret["scope"] = {}
                ret["$id"] = value._id
                return ret
            }

            if (angular.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    value[i] = scopeIdDecodeForJSON(value[i], null)
                }
                return value
            } else if (angular.isObject(value)) {
                for (var cProp in value) {
                    value[cProp] = scopeIdDecodeForJSON(value[cProp], cProp)
                }
                return value
            }
            return value
        }


        var removeCircularObjects = function (currVal, key) {
            //TODO set converters to service config externally
            if (key != null) {
                if (key.substr(0, 1) == "$" || key.toLowerCase() == "__proto__" || key == "element") {
                    return null
                } else if (key.toLowerCase() == "scope") {
                    return scopeIdEncodeForJSON(key, currVal)
                }
            }
            if (angular.isArray(currVal)) {
                var currCpy = []
                for (var i = 0; i < currVal.length; i++) {
                    try {
                        var cleanPropValue = removeCircularObjects(currVal[i], null);
                        if (cleanPropValue != null)currCpy.push(angular.copy(cleanPropValue))
                    } catch (e) {
                        console.log("INFO argument prop copy error prop=", prop, e.message)
                    }
                }
                return currCpy
            }
            if (angular.isObject(currVal)) {
                var currCpy = {}
                for (var prop in currVal) {
                    try {
                        var cleanPropValue = removeCircularObjects(currVal[prop], prop);
                        if (cleanPropValue != null)currCpy[prop] = angular.copy(cleanPropValue)
                    } catch (e) {
                        console.log("INFO argument prop copy error prop=", prop, e.message)
                    }
                }
                return currCpy
            }
            return  currVal
        }

        var notAlreadyHandeled = function (callId) {
            if (_handledCallIds[callId] == true) {
                return false
            }
            _handledCallIds[callId] = true
            return true
        }

        this.initListener = function () {
            if (_listenerFunction == null) {
                _listenerFunction = function (event) {
                    if (_removedListeners)return
                    var eData = event.data;
                    if (angular.isString(eData) && eData.substr(0, 1) == "{")eData = angular.fromJson(eData)
                    //console.log("MSG=",eData,eData._messageType, _thisID)
                    if (eData._messageType == _messageTypes.CONNECT_ME) {
                        if (notAlreadyHandeled(eData._callId)) {
                            if (_crossIframeWindow == null) {
                                _crossIframeWindow = event.source
                                console.log("CONN RESPONS called", eData._callId)
                                self.sendMessage({_messageType: _messageTypes.CONNECTED_YOU, _thisID: _thisID, _callId: eData._callId})
                            }
                        }
                    } else if (eData._messageType == _messageTypes.CONNECTED_YOU) {
                        if (notAlreadyHandeled(eData._callId)) {
                            console.log("CONNECTED_YOU received", eData._callId)
                            onConnectionSuccess()
                        }

                    } else if (eData._messageType == _messageTypes.DISCONNECT_ME) {
                        console.log("DISCONNECT_ME received")
                        if (notAlreadyHandeled(eData._callId)) {
                            var callObj = {_messageType: _messageTypes.DISCONNECTED_YOU}
                            self.sendMessage(callObj)
                            onDisconnectSuccess()
                        }

                    } else if (eData._messageType == _messageTypes.DISCONNECTED_YOU) {
                        debugger
                        if (notAlreadyHandeled(eData._callId)) {
                            console.log("DISCONNECTED_YOU received PARENT", eData._callId)
                            onDisconnectSuccess()
                        }

                    } else if (eData._messageType == _messageTypes.EVENT_ECHO_REGISTER) {
                        if (notAlreadyHandeled(eData._callId)) {
                            $rootScope.$apply(function (currScope) {
                                currScope.$on(eData.eventName, function (event) {
                                    var argsCopy = []
                                    for (var i = 1; i < arguments.length; i++) {
                                        var currArg = arguments[i];
                                        argsCopy.push(removeCircularObjects(currArg))
                                    }
                                    var retData = {_messageType: _messageTypes.EVENT_ECHO_CALL, _callId: eData._callId, eventName: event.name, args: argsCopy}
                                    self.sendMessage(retData)
                                })
                            })
                        }


                    } else if (eData._messageType == _messageTypes.EVENT_ECHO_CALL) {
                        //TODO handle _callId for events
                        if (notAlreadyHandeled(eData._callId)) {
                            var modifArgs = []
                            for (var j = 0; j < eData.args.length; j++) {
                                var currArg = eData.args[j];
                                modifArgs.push(scopeIdDecodeForJSON(currArg))
                            }

                            _echoEventHandlers[eData.eventName].handlerFn.apply(_echoEventHandlers[eData.eventName].handlerFn, modifArgs)
                            $rootScope.$apply()
                        }
                    } else if (eData._messageType == _messageTypes.EVENT_ECHO_SERVICE_CALL) {
                        if (notAlreadyHandeled(eData._callId)) {
                            var service = $injector.get(eData.serviceName);
                            var method = service[eData.methodName];

                            var res = null
                            try {
                                res = method.apply(service, eData.args)
                            } catch (e) {
                                console.log("ERROR calling method=", e)
                            }
                            $rootScope.$apply()
                            if (eData._callId != null)self.sendMessage({_messageType: _messageTypes.EVENT_ECHO_SERVICE_CALL_RESPONSE, _callId: eData._callId, result: removeCircularObjects(res)})
                        }

                    } else if (eData._messageType == _messageTypes.EVENT_ECHO_SERVICE_CALL_RESPONSE) {
                        if (notAlreadyHandeled(eData._callId)) {
                            var serviceCalldeferredResult = _waitingCallIdCrossFrameRequest[eData._callId];
                            if (serviceCalldeferredResult != null) {
                                eData.result = scopeIdDecodeForJSON(eData.result)
                                serviceCalldeferredResult.resolve(eData.result)
                                delete _waitingCallIdCrossFrameRequest[eData._callId]
                                $rootScope.$apply()
                            }
                        }

                    } else {
                        console.log("INFO CrossFrameConnection event not cought eData._messageType=", eData._messageType)
                    }
                };
                $window.addEventListener("message", _listenerFunction, false);
            }
        }

        this.connectFrames = function (toFrameDoc) {
            //console.log("CONNNNNNNNNNNNNNNNNNNECT FRS")
            if (toFrameDoc != _crossIframeWindow) {
                // self.disconnect()
            }
            _removedListeners = false
            _crossIframeWindow = toFrameDoc.defaultView
            self.initListener($window)
            if (_crossIframeWindow == null)alert("ERROR .defaultView not supported in browser.")
            _crossIframeWindow.onload = function () {
                self.sendMessage({_messageType: _messageTypes.CONNECT_ME})
            }
            //if(_framesConnected)onConnectionSuccess()
        }

        var onConnectionSuccess = function () {
            //
            console.log("CONNNNNNNNNNNNNNNNNNNSSSSSSSSSS PAREnt")
            _framesConnected = true
            dispatchFrameConnectionSuccess()
            processDelayedCallStack()
        }

        var processDelayedCallStack = function () {
            var obj
            while ((obj = _delayedCallStack.pop()) != null) {
                self.sendMessage(obj)
            }
        }

        this.addCrossFrameEventListener = function (watcherObj) {
            watcherObj._messageType = _messageTypes.EVENT_ECHO_REGISTER
            _delayedCallStack.push(watcherObj)
            if (_crossIframeWindow != null) {
                processDelayedCallStack()
            }
        }

        this.invokeServiceMethod = function (serviceName, invokeMethodName, argsArr) {
            var deferred = $q.defer()
            var callObj = {serviceName: serviceName, methodName: invokeMethodName, args: argsArr, deferredResult: deferred}
            callObj._messageType = _messageTypes.EVENT_ECHO_SERVICE_CALL
            //console.log("invokeSMMMMM",callObj._messageType)
            _delayedCallStack.push(callObj)
            if (_crossIframeWindow != null) {
                processDelayedCallStack()
            }
            return deferred.promise
        }

        this.disconnect = function (sendDisconnectMeMsg) {

            if (sendDisconnectMeMsg == null)sendDisconnectMeMsg = true
            //if(_listenerFunction!=null){

            if (sendDisconnectMeMsg == true) {
                var callObj = {_messageType: _messageTypes.DISCONNECT_ME}
                _delayedCallStack.push(callObj)
                processDelayedCallStack()
            }
            return

            //}
        }

        var onDisconnectSuccess = function () {
            //
            console.log("DISSSSCONNNNNNNNNNNNNNNNNNNSSSSSSSSSS PARENT")
            debugger
            $window.removeEventListener('message', _listenerFunction, false)
            $window.removeEventListener('message', _listenerFunction)
            _listenerFunction = null
            _crossIframeWindow = null
            _framesConnected = null
            _removedListeners = true
            _waitingCallIdCrossFrameRequest = {}
            _handledCallIds = {}
            dispatchFrameDisconnectedSuccess()
        }

    })

function EchoEventHandler(eventName, handlerFn) {
    this.eventName = eventName
    this.handlerFn = handlerFn
}
