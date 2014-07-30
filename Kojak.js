// Kojak Version 0.1.0 
// Last built 2014-07-30
// Distributed Under MIT License
// (c) 2013 Bart Wood 

// Shim originally written by http://stackoverflow.com/users/1114506/rajesh
// found at http://stackoverflow.com/questions/19196337/string-contains-doesnt-exist-while-working-in-chrome

if(!('contains' in String.prototype)) {
	String.prototype.contains = function(str, startIndex) {
		return -1 !== String.prototype.indexOf.call(this, str, startIndex);
	};
}
window.Kojak = {};

Kojak.Core = {

    // Enums / constants for non config code
    CLAZZ: 'CLAZZ',
    FUNCTION: 'FUNCTION',
    PAKAGE: 'PAKAGE',
    _REGEX_ALPHA: /^[A-Za-z]+$/,

    // fields
    _uniqueId: 0,

    // Extends obj with {} values. Typically used for creating 'clazzes'
    extend: function(obj) {
        var args, argCount, arg;

        args = Array.prototype.slice.call(arguments, 1);

        for(argCount = 0; argCount < args.length; argCount++){
            arg = args[argCount];

            if(arg){
                for (var prop in arg) {
                    obj[prop] = arg[prop];
                }
            }
        }

        return obj;
    },

    // Get a context via a name delimited by periods
    getContext: function(contextPath){
        var contextPathItems, count, currentContextPath, context;

        Kojak.Core.assert(Kojak.Core.isString(contextPath), 'getContext can only be called with a string');

        context = window;
        contextPathItems = contextPath.split('.');

        for(count = 0; count < contextPathItems.length; count++){
            currentContextPath = contextPathItems[count];

            if(typeof(context[currentContextPath]) === 'undefined'){
                return undefined;
            }

            context = context[currentContextPath];
        }

        return context;
    },

    isObject: function(obj) {
        return obj === Object(obj);
    },

    getPropCount: function(obj){
        return Kojak.Core.getKeys(obj).length;
    },

    getKeys: function(obj){
        var keys = [], key;
        Kojak.Core.assert(Kojak.Core.isObject(obj), 'Only use with objects');

        for(key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }

        return keys;
    },

    getValues: function(obj){
        var values = [], key, value;
        Kojak.Core.assert(Kojak.Core.isObject(obj), 'Only use with objects');

        for(key in obj){
            if(obj.hasOwnProperty(key)){
                values.push(obj[key]);
            }
        }

        return values;
    },

    // only tested with array of strings
    unique: function(arr){
        var i, seen = {}, uq = [];
        Kojak.Core.assert(Kojak.Core.isArray(arr), 'Only use unique with arrays');

        for(i = 0; i < arr.length; i++){
            Kojak.Core.assert(Kojak.Core.isString(arr[i]), 'Only use unique with an array of strings');
            if(!seen[arr[i]]){
                uq.push(arr[i]);
                seen[arr[i]] = true;
            }
        }

        return uq;
    },

    // Kojak types - Clazz, Function, Pakage, undefined
    inferKojakType: function(objName, obj){
        var firstChar;

        if(obj && Kojak.Core.isFunction(obj)){
            firstChar = objName.substring(0, 1);
            if(Kojak.Core.isStringOnlyAlphas(firstChar) && firstChar === firstChar.toUpperCase()){
                return Kojak.Core.CLAZZ;
            }
            else {
                return Kojak.Core.FUNCTION;
            }
        }
        else if(obj && obj.constructor && obj.constructor.prototype === Object.prototype){
            return Kojak.Core.PAKAGE;
        }
        else {
            return undefined;
        }
    },

    getPath: function(kPath){
        Kojak.Core.assert(kPath, 'kPath is not defined');
        if(kPath.length < 3 || ! kPath.contains('.')){
            return kPath;
        }
        else{
            return kPath.substring(0, kPath.lastIndexOf('.'));
        }
    },

    getObjName: function(kPath){
        Kojak.Core.assert(kPath, 'kPath is not defined');
        if(kPath.length < 3 || ! kPath.contains('.')){
            return kPath;
        }
        else{
            return kPath.substring(kPath.lastIndexOf('.') + 1);
        }
    },

    // This will only work with kPaths to clazzes.  If the function name is part of the path this will fail
    // Use with care
    getPakageName: function(kPath){
        var pathParts;
        Kojak.Core.assert(kPath, 'kPath is not defined');
        pathParts = kPath.split('.');
        if(pathParts.length === 1){
            return kPath;
        }
        else {
            if(pathParts[pathParts.length - 1] === 'prototype'){
                pathParts = pathParts.splice(0, pathParts.length - 1);
            }
            pathParts = pathParts.splice(0, pathParts.length - 1);
            return pathParts.join('.');
        }
    },

    // This will only work with kPaths to clazzes.  If the function name is part of the path this will fail
    // Use with care
    getClazzName: function(kPath){
        var pathParts, clazzName = '';
        Kojak.Core.assert(kPath, 'kPath is not defined');
        pathParts = kPath.split('.');
        if(pathParts.length === 1){
            return '';
        }
        else {
            if(pathParts[pathParts.length - 1] === 'prototype'){
                clazzName = '.prototype';
                pathParts = pathParts.splice(0, pathParts.length - 1);
            }
            return pathParts[pathParts.length - 1] + clazzName;
        }
    },

    isStringOnlyAlphas: function(check){
        Kojak.Core.assert(Kojak.Core.isString(check, 'only use with strings'));
        return check.match(Kojak.Core._REGEX_ALPHA);
    },

    isStringArray: function(check){
        var isStringArray = true;

        if(Kojak.Core.isArray(check)){
            check.forEach(function(c){
                if(!Kojak.Core.isString(c)){
                    isStringArray = false;
                }
            });
        }
        else {
            isStringArray = false;
        }

        return isStringArray;
    },

    assert: function(test, msg){
        if(!test){
            throw msg;
        }
    },

    uniqueId: function(){
        return ++Kojak.Core._uniqueId;
    }
};

// Add the isXXX type checkers
['Arguments', 'Function', 'String', 'Number', 'Array', 'Date', 'RegExp', 'Boolean'].forEach(function(name) {
    Kojak.Core['is' + name] = function(o) {
        return Object.prototype.toString.call(o) === '[object ' + name + ']';
    };
});
Kojak.Config = {

    // enums / constants
    CURRENT_VERSION: 1,
    AUTO_START_NONE: 'none',
    AUTO_START_IMMEDIATE: 'immediate',
    AUTO_ON_JQUERY_LOAD: 'on_jquery_load',
    AUTO_START_DELAYED: 'delayed',

    _LOCAL_STORAGE_KEY: 'kojak',
    _LOCAL_STORAGE_BACKUP_KEY: 'kojak_backup',
    
    //config for kojak SaaS
    _SERVER_URL: 'http://localhost:1337',
    _API_KEY: '',
    _SECRET_KEY: '',
    _SYNC: false,
    _DELAY: 5,

    load: function () {
        if (localStorage.getItem('kojak')) {
            this._configValues = this._loadLocalStorage();
        }
        else {
            this._configValues = this._createDefaults();
            this._save();
        }
    },

    sync: function (secretKey, apiKey) {
        this._SECRET_KEY = secretKey;
        this._API_KEY = apiKey;
        this._SYNC = true;
    },

    saveBackup: function(){
        Kojak.Core.assert(localStorage.getItem(Kojak.Config._LOCAL_STORAGE_KEY), 'kojak not defined yet in local storage');
        localStorage.setItem('kojak_backup', localStorage.getItem(Kojak.Config._LOCAL_STORAGE_KEY));
    },

    restoreBackup: function(){
        Kojak.Core.assert(localStorage.getItem(Kojak.Config._LOCAL_STORAGE_BACKUP_KEY), 'no backup existed in local storage');
        localStorage.setItem(Kojak.Config._LOCAL_STORAGE_KEY, localStorage.getItem(Kojak.Config._LOCAL_STORAGE_BACKUP_KEY));
        this._configValues = this._loadLocalStorage();
    },

    getAutoStartInstrumentation: function(){
        return this._configValues.autoStartInstrumentation;
    },

    setAutoStartInstrumentation: function (val) {
        Kojak.Core.assert( [Kojak.Config.AUTO_START_NONE, Kojak.Config.AUTO_START_IMMEDIATE, Kojak.Config.AUTO_ON_JQUERY_LOAD, Kojak.Config.AUTO_START_DELAYED].indexOf(val) !== -1,
                           'Invalid auto start option \'' + val + '\'.');

        this._configValues.autoStartInstrumentation = val;
        this._save();

        console.log('autoStartInstrumentation updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }

        if(val === Kojak.Config.AUTO_START_DELAYED && !this._isAutoStartDelayValid(this.getAutoStartDelay())){
            console.log('setting a default auto start delay');
            this.setAutoStartDelay(4000);
        }
        
        
    },

    getEnableNetWatcher: function(){
        return this._configValues.enableNetWatcher;
    },

    setEnableNetWatcher: function (val) {
        Kojak.Core.assert(Kojak.Core.isBoolean(val), 'Invalid enableNetWatcher option \'' + val + '\'.');

        this._configValues.enableNetWatcher = val;
        this._save();

        console.log('enableNetWatcher updated');
        console.log('reload your browser to notice the change.');
    },

    // *****************************************************************************************************************
    // Included pakages
    addIncludedPakage: function (pkg) {
        Kojak.Core.assert(this._configValues.includedPakages.indexOf(pkg) === -1, 'Pakage is already included');

        this._configValues.includedPakages.push(pkg);
        this._save();

        console.log('includedPakages updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change');
        }
    },

    setIncludedPakages: function (pks) {
        Kojak.Core.assert(Kojak.Core.isArray(pks), 'Only pass an array of strings for the included pakage names');

        this._configValues.includedPakages = pks;
        this._save();

        console.log('includedPakages updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },

    removeIncludedPakage: function (pkg) {
        var pathIndex = this._configValues.includedPakages.indexOf(pkg);
        Kojak.Core.assert(pathIndex !== -1, 'Pakage is not currently included.');

        this._configValues.includedPakages.splice(pathIndex, 1);
        this._save();

        console.log('included path removed');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },

    getIncludedPakages: function(){
        return this._configValues.includedPakages;
    },
    // Included pakages
    // *****************************************************************************************************************

    // *****************************************************************************************************************
    // Excluded paths
    arePathsExcluded: function(){
        var args = Array.prototype.slice.call(arguments), i, path;

        for(i = 0; i < args.length; i++){
            path = args[i];

            if(this.isPathExcluded(path)){
                return true;
            }
        }

        return false;
    },

    isPathExcluded: function(path){
        var i, excludePaths = this._configValues.excludedPaths, isExcluded = false;

        for(i = 0; i < excludePaths.length; i++){
            if(path.contains(excludePaths[i])){
                isExcluded = true;
                break;
            }
        }

        return isExcluded;
    },

    getExcludedPaths: function(){
        return this._configValues.excludedPaths;
    },

    addExcludedPath: function (path) {
        Kojak.Core.assert(this._configValues.excludedPaths.indexOf(path) === -1, 'Path is already excluded');

        this._configValues.excludedPaths.push(path);
        this._save();

        console.log('excluded paths updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },

    removeExcludedPath: function (path) {
        var pathIndex = this._configValues.excludedPaths.indexOf(path);
        Kojak.Core.assert(pathIndex !== -1, 'Path is not currently excluded.');

        this._configValues.excludedPaths.splice(pathIndex, 1);
        this._save();

        console.log('excluded paths updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },

    setExcludedPaths: function (paths) {
        Kojak.Core.assert(Kojak.Core.isArray(paths), 'Only pass an array of strings for the excluded paths');

        this._configValues.excludedPaths = paths;
        this._save();

        console.log('excludePaths updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },
    // Excluded paths
    // *****************************************************************************************************************

    getAutoStartDelay: function(){
        return this._configValues.autoStartDelay;
    },

    _isAutoStartDelayValid: function(delay){
        return delay > 0 && delay < 100000;
    },

    setAutoStartDelay: function (delay) {
        Kojak.Core.assert(this._isAutoStartDelayValid(delay), 'The autoStartDelay option should be a valid number in milliseconds');
        this._configValues.autoStartDelay = delay;
        this._save();

        console.log('set autoStartDelay to ' + delay + ' milliseconds');

        if(this.getAutoStartInstrumentation() !== Kojak.Config.AUTO_START_DELAYED){
            console.log('warning, the auto start is not current auto delayed.');
        }

        console.log('autoStartDelay updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('reload your browser to notice the change.');
        }
    },

    getRealTimeFunctionLogging: function(){
        return this._configValues.realTimeFunctionLogging;
    },

    setRealTimeFunctionLogging: function(val){
        Kojak.Core.assert(val === true || val === false, 'The realTimeFunctionLogging option should be true or false');

        this._configValues.realTimeFunctionLogging = val;
        this._save();

        console.log('realTimeFunctionLogging updated');
        if(Kojak.instrumentor.hasInstrumented()){
            console.log('changes should be reflected immediately');
        }
    },

    _save: function () {
        localStorage.setItem(Kojak.Config._LOCAL_STORAGE_KEY, JSON.stringify(this._configValues));
    },

    _loadLocalStorage: function () {
        var storageString = localStorage.getItem(Kojak.Config._LOCAL_STORAGE_KEY);
        var configValues = JSON.parse(storageString);

        // a simple check to see if the storage item resembles a kojak config item
        Kojak.Core.assert(configValues.version, 'There is no version in the item \'' + Kojak.Config._LOCAL_STORAGE_KEY + '\' in localStorage.  It looks wrong.');

        this._upgradeConfig(configValues);
        return configValues;
    },

    _upgradeConfig: function (configValues) {
        while (configValues.version !== Kojak.Config.CURRENT_VERSION) {
            switch (configValues.version) {
                case 1:
                    // Example
                    // console.log('upgrading Kojak config from v1 to v2');
                    // add config values or modify existing ones
                    // configValues.version = 2;
                    break;
                case 2:
                    // upgrade from v2 to v3
                    break;

                default:
                    throw 'Unknown version found in your configuration ' + config.version;
            }
        }
    },

    _createDefaults: function () {
        return {
            version: Kojak.Config.CURRENT_VERSION,
            realTimeFunctionLogging: false,
            includedPakages: [],
            excludedPaths: [],
            autoStartInstrumentation: Kojak.Config.AUTO_START_NONE,
            enableNetWatcher: false
        };
    }

};

Kojak.Formatter = {

    makeTabs: function(num){
        var tabs = '';
        for (var level = 0; level < num; level++) {
            tabs += '\t';
        }
        return tabs;
    },

    appendPadding: function(val, paddingLength){
        if(!val){
            val = '';
        }

        while(val.length < paddingLength){
            val += ' ';
        }

        return val;
    },

    number: function(num){
        var numAsString, decimals, integers, integerCount, integersWithCommas = '';
        numAsString = num.toFixed(2);
        decimals =  numAsString.substring(numAsString.indexOf('.'));
        integers = numAsString.replace(decimals, '');
        integers = integers.split('').reverse();

        for(integerCount = 0; integerCount < integers.length; integerCount++){
            integersWithCommas = integers[integerCount] + integersWithCommas;

            if((integerCount+1) < integers.length && (integerCount+1) % 3 === 0){
                integersWithCommas = ',' + integersWithCommas;
            }
        }

        if(decimals === '.00'){
            decimals = '';
        }

        return integersWithCommas + decimals;
    },

    formatReport: function(report){
        var rowCount, row, rowString, fieldCount, fieldVal, fieldWidths = [];

        Kojak.Core.assert(Kojak.Core.isArray(report), 'Reports should be 2d string arrays');

        // First calculate the field widths, format numbers
        for(rowCount = 0; rowCount < report.length; rowCount++){
            row = report[rowCount];

            for(fieldCount = 0; fieldCount < row.length; fieldCount++){
                fieldVal = row[fieldCount];

                if(Kojak.Core.isNumber(fieldVal)){
                    row[fieldCount] = fieldVal = Kojak.Formatter.number(fieldVal);
                }

                fieldVal += '  ';

                if(!fieldWidths[fieldCount]){
                    fieldWidths[fieldCount] = fieldVal.length;
                }
                else if(fieldVal.length > fieldWidths[fieldCount]){
                    fieldWidths[fieldCount] = fieldVal.length;
                }
            }
        }

        // Now actually render the values with proper padding
        for(rowCount = 0; rowCount < report.length; rowCount++){
            row = report[rowCount];
            rowString = '';

            for(fieldCount = 0; fieldCount < row.length; fieldCount++){
                rowString +=  Kojak.Formatter.appendPadding(row[fieldCount], fieldWidths[fieldCount]);
            }

            console.log(rowString);
        }
    }
};

Kojak.FunctionProfile = function (container, functionName, origFunction) {
    var _this = this;

    Kojak.Core.assert( container &&
                       (container._kPath || container._kPath === '') &&
                       Kojak.Core.isString(functionName) &&
                       Kojak.Core.isFunction(origFunction),
                       'FunctionProfile constructor args are not correct');

    this._container = container;
    this._functionName = functionName;
    this._origFunction = origFunction;
    this._kPath = container._kPath + '.' + functionName;

    this._startTimes = [];
    this._callCount = 0;
    this._callPaths = {};

    this._wholeTime = 0;
    this._wholeTimes = [];

    this._isolatedTime = 0;
    this._isolatedTimes = [];

    this.takeCheckpoint();

    this._wrappedFunction = function(){
        var error;

        // Check if this function was invoked with the 'new' operator
        // if it was, we accidentally wrapped a clazzes constructor which will probably cause the host app to crash
        if(this instanceof _this._wrappedFunction){
            error = 'Kojak Error! It looks like Kojak wrapped a function that is used as a constructor: ' + _this._kPath +
                    '\n\tTo fix this you can either rename the reference to the function to start with upper case' +
                    '\n\tor you could ignore it by passing calling Kojak.Config.addExcludedPath(\'' + _this._kPath + '\')';
            throw error;
        }

        Kojak.instrumentor.recordStartFunction(_this);
        var returnValue = origFunction.apply(this, arguments);
        Kojak.instrumentor.recordStopFunction(_this);

        return returnValue;
    };

    this._wrappedFunction._kFProfile = this;
};

Kojak.Core.extend(Kojak.FunctionProfile.prototype, {
    getContainer: function(){
        return this._container;
    },

    getFunctionName: function(){
        return this._functionName;
    },

    getOrigFunction: function(){
        return this._origFunction;
    },

    getWrappedFunction: function(){
        return this._wrappedFunction;
    },

    getKPath: function(){
        return this._kPath;
    },

    pushStartTime: function(startTime, callPath){
        this._startTimes.push(startTime);
    },

    popStartTime: function(){
        return this._startTimes.pop();
    },

    recordCallMetrics: function(callPath, isolatedTime, wholeTime){
        if(!this._callPaths[callPath]){
            this._callPaths[callPath] = 1;
        }
        else {
            this._callPaths[callPath]++;
        }

        this._callCount++;

        this._isolatedTime += isolatedTime;
        this._wholeTime += wholeTime;

        this._isolatedTimes.push(isolatedTime);
        this._wholeTimes.push(wholeTime);

        this._isolatedTimes_checkpoint.push(isolatedTime);
        this._wholeTimes_checkpoint.push(wholeTime);
    },

    takeCheckpoint: function(){
        this._callCount_checkpoint = this._callCount;
        this._wholeTime_checkpoint = this._wholeTime;
        this._isolatedTime_checkpoint = this._isolatedTime;
        this._wholeTimes_checkpoint = [];
        this._isolatedTimes_checkpoint = [];
    },

    getProperty: function(propName){
        return this['get' + propName]();
    },

    getWholeTime: function(){
        return this._wholeTime;
    },

    getCallCount: function(){
        return this._callCount;
    },

    getCallPaths: function(){
        return this._callPaths;
    },

    getIsolatedTime: function(){
        return this._isolatedTime;
    },

    getAvgIsolatedTime: function(){
        if(this._callCount > 0){
            return this._isolatedTime / this._callCount;
        }
        else {
            return 0;
        }
    },

    getAvgWholeTime: function(){
        if(this._callCount > 0){
            return this._wholeTime / this._callCount;
        }
        else {
            return 0;
        }
    },

    getMaxIsolatedTime: function(){
        var max = 0;

        this._isolatedTimes.forEach(function(isoTime){
            if(isoTime > max){
                max = isoTime;
            }
        });

        return max;
    },

    getMaxWholeTime: function(){
        var max = 0;

        this._wholeTimes.forEach(function(wholeTime){
            if(wholeTime > max){
                max = wholeTime;
            }
        });

        return max;
    },

    getCallCount_Checkpoint: function(){
        return this._callCount - this._callCount_checkpoint;
    },

    getWholeTime_Checkpoint: function(){
        return this._wholeTime - this._wholeTime_checkpoint;
    },

    getIsolatedTime_Checkpoint: function(){
        return this._isolatedTime - this._isolatedTime_checkpoint;
    },

    getAvgIsolatedTime_Checkpoint: function(){
        if(this.getCallCount_Checkpoint() > 0){
            return this._isolatedTime / this.getCallCount_Checkpoint();
        }
        else {
            return 0;
        }
    },

    getAvgWholeTime_Checkpoint: function(){
        if(this.getCallCount_Checkpoint() > 0){
            return this._wholeTime_checkpoint / this.getCallCount_Checkpoint();
        }
        else {
            return 0;
        }
    },

    getMaxIsolatedTime_Checkpoint: function(){
        var max = 0;

        this._isolatedTimes_checkpoint.forEach(function(isoTime){
            if(isoTime > max){
                max = isoTime;
            }
        });

        return max;
    },

    getMaxWholeTime_Checkpoint: function(){
        var max = 0;

        this._wholeTimes_checkpoint.forEach(function(wholeTime){
            if(wholeTime > max){
                max = wholeTime;
            }
        });

        return max;
    }
});
Kojak.Instrumentor = function () {
    this._hasInstrumented = false;
    this._lastCheckpointTime = undefined;

    this._origFunctions = {};
    this._functionProfiles = [];
    this._clazzPaths = [];

    this._stackLevel = -1;
    this._stackLevelCumTimes = {};
    this._stackContexts = [];
};

Kojak.Core.extend(Kojak.Instrumentor.prototype, {

    instrument: function () {
        var candidates;

        try {
            Kojak.Core.assert(!this.hasInstrumented(), 'The code has already been instrumented');

            this._hasInstrumented = true;

            candidates = this._findFunctionCandidates();
            this._processFunctionCandidates(candidates);
            this._findUniqueClazzPaths();

            console.log('Kojak has completed instrumenting.  Run Kojak.Report.instrumentedCode() to see what functions have been instrumented');
        }
        catch (exception) {
            console.error('Error, Kojak instrument has failed ', exception);
            if(exception.stack){
                console.error('Stack:\n', exception.stack);
            }
        }
    },

    hasInstrumented: function(){
        return this._hasInstrumented;
    },

    getClazzPaths: function(){
        return this._clazzPaths;
    },

    // Root through all included pakages and find candidate functions
    // These functions might be clazzes or just plain old functions
    //   Keep track of duplicate function references
    //     When there are duplicates if at least one looks like a clazz then assume they will all be used like a clazz
    //     Clazzes are not wrapped at all - anything that might be invoked with the new operator must not be wrapped
    _findFunctionCandidates: function(){
        var candidates = {},
            curPakageNames,
            pakagePath,
            pakage,
            pakageName,
            childName,
            child,
            childKojakType;

        curPakageNames = Kojak.Config.getIncludedPakages().slice(0);

        while (curPakageNames.length > 0) {
            pakagePath = curPakageNames.pop();
            pakage = Kojak.Core.getContext(pakagePath);

            if(! this._shouldIgnorePakage(pakagePath, pakage)){
                // Now the pakage can be self aware it's own path
                pakage._kPath = pakagePath;

                // Define the _kPath property so that it is not enumerable.
                // Otherwise the _kPath might show up incorrectly in iterators
                Object.defineProperty(pakage, '_kPath', {enumerable: false});

                for (childName in pakage) {
                    if (pakage.hasOwnProperty(childName)) {
                        child = pakage[childName];
                        childKojakType = Kojak.Core.inferKojakType(childName, child);

                        if(childKojakType === Kojak.Core.CLAZZ || childKojakType === Kojak.Core.FUNCTION ){
                            if(!this._shouldIgnoreFunction(pakagePath, childName)){
                                if(!child._kFid){
                                    child._kFid = Kojak.Core.uniqueId();
                                    // Define the _kPath property so that it is not enumerable.
                                    // Otherwise the _kPath might show up incorrectly in iterators
                                    Object.defineProperty(child, '_kFid', {enumerable: false});

                                    this._origFunctions[child._kFid] = child;
                                    candidates[child._kFid] = [pakagePath + '.' + childName];
                                }
                                else {
                                    // there is a duplicate ref to the same clazz or function
                                    candidates[child._kFid].push(pakagePath + '.' + childName);
                                }
                            }
                        }

                        // A pakage and contain nested pakages or clazzes so recurse on them and check for functions there too
                        if(childKojakType === Kojak.Core.PAKAGE){
                            curPakageNames.push(pakagePath + '.' + childName);
                        }
                        else if(childKojakType === Kojak.Core.CLAZZ){
                            // Treat a clazz as a possible pakage
                            curPakageNames.push(pakagePath + '.' + childName);

                            // Check the clazz function's prototype for functions
                            curPakageNames.push(pakagePath + '.' + childName + '.prototype');
                        }
                    }
                }

                // If treating clazzes as a possible pakages we need to check for that here and drill down to the prototype.
                // This only happens when a clazz was passed in as one of the original pakages in Config
                pakageName = Kojak.Core.getObjName(pakagePath);
                if(   Kojak.Core.inferKojakType(pakageName, pakage) === Kojak.Core.CLAZZ &&
                    ! pakage.prototype._kPath){
                    console.log('---found PACKAGE that is a clazz ', pakagePath);
                    curPakageNames.push(pakagePath + '.prototype');
                }
            }
        }

        return candidates;
    },

    _shouldIgnorePakage: function(pakagePath, pakage){
        if(!pakage){
            return true;
        }
        else if( Kojak.Core.inferKojakType(pakagePath, pakage) === Kojak.Core.PAKAGE && pakage._kPath){
            console.warn('ignored circular/duplicate package reference: ', pakagePath);
            return true;
        }
        else {
            return Kojak.Config.isPathExcluded(pakagePath);
        }
    },

    _shouldIgnoreFunction: function(pakagePath, funcName){
        // possibly ignore functions name constructor
        //name === 'constructor';
        return Kojak.Config.arePathsExcluded(pakagePath, pakagePath + '.' + funcName, funcName);
    },

    _processFunctionCandidates: function(candidates){
        var kFuncId, origFunc, funcPaths, anyClazzes;

        for(kFuncId in candidates){
            funcPaths = candidates[kFuncId];
            origFunc = this._origFunctions[kFuncId];

            // figure out if any references look like a clazz reference
            // I cannot wrap any function that people expect to use with the new operator - i.e. clazzes
            // If there is even a single clazz I shouldn't wrap any of the functions
            anyClazzes = false;
            funcPaths.forEach(function(fullFuncPath){
                if(this._isFuncAClazz(fullFuncPath)){
                    anyClazzes = true;
                }
            }.bind(this));

            if(!anyClazzes){
                // Each will have it's own independent wrapper that points to the original function
                funcPaths.forEach(function(fullFuncPath){
                    this._instrumentFunction(fullFuncPath, origFunc);
                }.bind(this));
            }
        }
    },

    _isFuncAClazz: function(fullFuncPath){
        var funcName, firstChar;

        funcName = Kojak.Core.getObjName(fullFuncPath);
        firstChar = funcName.substring(0, 1);
        return Kojak.Core.isStringOnlyAlphas(firstChar) && firstChar === firstChar.toUpperCase();
    },

    _instrumentFunction: function(fullFuncPath, origFunc){
        var containerPath, container, funcName, funcProfile;

        containerPath = Kojak.Core.getPath(fullFuncPath);
        funcName = Kojak.Core.getObjName(fullFuncPath);

        container = Kojak.Core.getContext(containerPath);

        if(!container){
            console.error('Kojak error, the function path could not be located: ' + fullFuncPath);
        }
        else{
            funcProfile = new Kojak.FunctionProfile(container, funcName, origFunc);
            container[funcName] = funcProfile.getWrappedFunction();
            this._functionProfiles.push(funcProfile);
        }
    },

    _findUniqueClazzPaths: function(){
        var uniquePaths = {}, functionKPath, clazzPath;

        this._functionProfiles.forEach(function(functionProfile){
            functionKPath = functionProfile.getKPath();
            clazzPath = Kojak.Core.getPath(functionKPath);

            if(!uniquePaths[clazzPath]){
                uniquePaths[clazzPath] = true;
                this._clazzPaths.push(clazzPath);
            }
        }.bind(this));

        this._clazzPaths.sort();
    },

    takeCheckpoint: function(){
        if(!this.hasInstrumented()){
            this.instrument();
        }
        console.log('takeCheckpoint:_______________________________________');
        this._lastCheckpointTime = Date.now();
        this._functionProfiles.forEach(function(functionProfile){
            functionProfile.takeCheckpoint();
        }.bind(this));
    },

    getLastCheckpointTime: function(){
        return this._lastCheckpointTime;
    },

    // Only should be called from FunctionProfile
    recordStartFunction: function (functionProfile) {
        this._stackLevel++;
        this._stackLevelCumTimes[this._stackLevel] = 0;
        this._stackContexts[this._stackLevel] = functionProfile.getKPath();

        functionProfile.pushStartTime(Date.now());

        if (Kojak.Config.getRealTimeFunctionLogging()) {
            console.log(Kojak.Formatter.makeTabs(this._stackLevel) + 'start: ' + functionProfile.getKPath(), Kojak.Formatter.number(functionProfile.getIsolatedTime()));
        }
    },

    // Only should be called from FunctionProfile
    recordStopFunction: function (functionProfile) {
        var startTime, wholeTime, isolatedTime;

        this._stackLevel--;
        startTime = functionProfile.popStartTime();
        wholeTime = Date.now() - startTime;
        isolatedTime = wholeTime - this._stackLevelCumTimes[this._stackLevel + 1];

        functionProfile.recordCallMetrics(this._stackContexts.join(' > '), isolatedTime, wholeTime);

        this._stackLevelCumTimes[this._stackLevel] += wholeTime;
        this._stackContexts.pop();

        if (Kojak.Config.getRealTimeFunctionLogging()) {
            console.log(Kojak.Formatter.makeTabs(this._stackLevel + 1) + 'stop:  ' + functionProfile.getKPath(), Kojak.Formatter.number(functionProfile.getIsolatedTime()));
        }
    },

    getPackageProfiles: function(){
        return this._packageProfiles;
    },

    getFunctionProfiles: function(){
        return this._functionProfiles;
    }
});

Kojak.NetProfile = function(urlBase){
    Kojak.Core.assert(urlBase, 'Parameters to NetProfile not set correctly');
    this._urlBase = urlBase;
    this._calls = [];
};

Kojak.Core.extend(Kojak.NetProfile.prototype, {
    addCall: function(urlParams, callTime, responseText){
        this._calls.push(new Kojak.NetProfileCall(urlParams, callTime, responseText));
    },

    getTotalCallTime: function(){
        var total = 0;

        this._calls.forEach(function(profileCall){
            total += profileCall.getCallTime();
        });

        return total;
    },

    getUrlBase: function(){
        return this._urlBase;
    },

    getCallsSortedByDate: function(){
        return this._calls.sort(function(a, b){
            return b.getDate() - a.getDate();
        });
    }
});

Kojak.NetProfile.parseUrl = function(httpMethod, url){
    var urlBase, urlParams, id, urlBaseParts;

    Kojak.Core.assert(url, 'UrlBase was not defined');

    if(url.contains('?')){
        urlBase = url.substring(0, url.indexOf('?'));
        urlParams = url.substring(url.indexOf('?'));
    }
    else {
        urlBase = url;
        urlParams = '';
    }

    // Rest style urls will probably have an id at the end, in this case, remove that id from the url base
    urlBaseParts = urlBase.split('/');

    if(!isNaN(parseInt(urlBaseParts[urlBaseParts.length - 1], 10))){
        id = parseInt(urlBaseParts[urlBaseParts.length - 1], 10);
        urlParams = '/' + id + urlParams;
        urlBase = urlBase.replace(id, '');
    }

    urlBase += ' [' + httpMethod + ']';

    return {urlBase: urlBase, urlParams: urlParams};
};



Kojak.NetProfileCall = function(urlParams, callTime, responseText){
    Kojak.Core.assert((urlParams || urlParams === '') && (callTime || callTime === 0), 'Parameters to NetProfile not set correctly');
    this._date = Date.now();
    this._urlParams = urlParams;
    this._callTime = callTime;

    this._responseSize = (responseText && responseText.length) ? (2*responseText.length) : 0;

    try {
        this._objCount = Kojak.Core.getKeys(JSON.parse(responseText)).length;
    } catch(e) {
        this._objCount = 1;
    }
};

Kojak.Core.extend(Kojak.NetProfileCall.prototype, {

    getCallTime: function(){
        return this._callTime;
    },

    getDate: function(){
        return this._date;
    },

    getUrlParams: function(){
        return this._urlParams;
    },

    getResponseSize: function(){
        return this._responseSize;
    },

    getObjCount: function(){
        return this._objCount;
    }

});


Kojak.NetWatcher = function(){
    Kojak.Core.assert(window.jQuery, 'You can\'t use the NetWatcher unless you have included jQuery.');
    this._hasStarted = false;
    this._netProfiles = {};
    this._netProfiles_checkpoint = {};
};

Kojak.Core.extend(Kojak.NetWatcher.prototype, {

    start: function(){
        Kojak.Core.assert(!this.hasStarted(), 'The Net Watcher has already started.');

        this._hasStarted = true;

        this._onAjaxSend = this._onAjaxSend.bind(this);
        this._onAjaxComplete = this._onAjaxComplete.bind(this);

        jQuery(document).ajaxSend(this._onAjaxSend);
        jQuery(document).ajaxComplete(this._onAjaxComplete);
    },

    hasStarted: function(){
        return this._hasStarted;
    },

    takeCheckpoint: function(){
        if(!this.hasStarted()){
            this.start();
        }

        // Just reset the checkpoints
        this._netProfiles_checkpoint = {};
    },

    _onAjaxSend: function( event, jqXHR, options) {
        options._kStartTime = Date.now();
    },

    _onAjaxComplete: function( event, jqXHR, options) {
        if(options._kStartTime){
            this.trackNetResponse(options.type, options.url, Date.now() - options._kStartTime, jqXHR.responseText);
        }
        else {
            console.warn('Kojak NetWatcher Warning: a web service call was not properly instrumented. (' + options.url + ')');
            console.warn('\tThis is probably because the watcher was started in the middle of a call.');
        }
    },

    // You will need to call this from a web worker handler if you want to track web worker network calls
    trackNetResponse: function(httpMethod, url, callTime, responseText){
        var urlParts;

        urlParts = Kojak.NetProfile.parseUrl(httpMethod, url);

        if(!this._netProfiles[urlParts.urlBase]){
            this._netProfiles[urlParts.urlBase] = new Kojak.NetProfile(urlParts.urlBase);
        }

        this._netProfiles[urlParts.urlBase].addCall(urlParts.urlParams, callTime, responseText);

        // The checkpoint entries are just references
        if(!this._netProfiles_checkpoint[urlParts.urlBase]){
            this._netProfiles_checkpoint[urlParts.urlBase] = this._netProfiles[urlParts.urlBase];
        }
    },

    getNetProfiles: function(){
        return this._netProfiles;
    },

    getNetProfiles_Checkpoint: function(){
        return this._netProfiles_checkpoint;
    }

});
//Need jquery for sync.
//TODO: implement native ajax call with webworkers
Kojak.Sync = {
    syncData: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {report: data, secretKey: Kojak.Config._SECRET_KEY, 
        clientKey: Kojak.Config._API_KEY};
      
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setFuncReport',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    },
    
    syncNetData: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {report: data, secretKey: Kojak.Config._SECRET_KEY, 
        clientKey: Kojak.Config._API_KEY};
      
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setNetReport',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    },
    
    syncDataAfterCheckpoint: function (data) {
      Kojak.Core.assert(Kojak.Config._SERVER_URL, 'server url not defined');
      
      var report = {
          totalJSHeapSize: data.totalJSHeapSize,
          jsHeapSizeLimit: data.jsHeapSizeLimit,
          secretKey: Kojak.Config._SECRET_KEY,
          usedJSHeapSize: data.usedJSHeapSize,
          clientKey: Kojak.Config._API_KEY,
          snapshotName: data.snapshotName,
          report: data.report
      };
      $.ajax({
          type: 'POST',
          url: Kojak.Config._SERVER_URL + '/setAfterCheckpoint',
          crossDomain: true,
          data: report,
          dataType: 'json',
          success: function(responseData, textStatus, jqXHR) {
              //var value = responseData;
              console.log('Kojak Saas:' + textStatus);
          },
          error: function (responseData, textStatus, errorThrown) {
              console.log('post data to kojak saas is failed. ' + JSON.stringify(responseData));
          }
      });
    }
};
Kojak.Report = {

    // opts are
    //  filter: a string or an array of strings.  If a function's kPath partially matches any of the filter strings it's included
    //  verbose: true.  If you want to see each individual named function
    instrumentedCode: function(opts){
        var optsWereEmpty, clazzPaths, report = [], totalClazzes = 0, totalFuncs = 0;

        if(!Kojak.instrumentor.hasInstrumented()){
            console.warn('You have not ran Kojak.instrumentor.instrument() yet.');
            return;
        }

        optsWereEmpty = !opts;
        opts = opts || {};

        if(opts && opts.filter){
            Kojak.Core.assert( Kojak.Core.isString(opts.filter) || Kojak.Core.isStringArray(opts.filter),
                               'filter must be a string or an array of strings');
        }

        try {
            console.log('Currently instrumented code in Kojak: ' + (opts.filter ? '(filtered by \'' + opts.filter + '\')' : ''));

            // Report header
            if(opts.verbose){
                report.push(['--Pakage--', '--Clazz--', '--Function--', '--Call Count--']);
            }
            else {
                report.push(['--Pakage--', '--Clazz--', '--Function Count--']);
            }

            // Report body
            clazzPaths = Kojak.instrumentor.getClazzPaths();

            clazzPaths.forEach(function(clazzPath){
                var clazzPackagePath, clazzName, kFuncProfiles, funcCount = 0;

                clazzPackagePath = Kojak.Core.getPakageName(clazzPath);
                clazzName = Kojak.Core.getClazzName(clazzPath);

                if (!opts.filter || this._matchesAnyFilter(opts.filter, clazzPath, clazzPackagePath, clazzName)) {

                    if (opts.verbose) {
                        kFuncProfiles = this._getKFuncProfiles(opts, clazzPath);
                        kFuncProfiles.forEach(function(kFProfile){
                            report.push([clazzPackagePath, clazzName, kFProfile.getFunctionName(), kFProfile.getCallCount()]);
                            funcCount++;
                        }.bind(this));
                    }
                    else {
                        funcCount = this._getFunctionCount(clazzPath);
                        report.push([clazzPackagePath, clazzName, funcCount]);
                    }

                    totalFuncs += funcCount;
                    totalClazzes++;
                }
            }.bind(this));

            Kojak.Formatter.formatReport(report);

            console.log('\n\tNumber of clazzes reported: ' + Kojak.Formatter.number(totalClazzes));
            console.log('\tNumber of functions reported: ' + Kojak.Formatter.number(totalFuncs));

            if(opts.filter){
                console.log('\tClazz and function counts are less than what has been instrumented in your application');
                console.log('\tCounts are based off of what has been filtered with \'' + opts.filter + '\'');
            }

            if(optsWereEmpty){
                console.log('\n\tOptions for this command are {filter: [\'xxx\', \'yyy\'], verbose: true}');
            }
        }
        catch (exception) {
            console.error('Error, Kojak.Report.instrumentedCode has failed ', exception);
            if(exception.stack){
                console.error('Stack:\n', exception.stack);
            }
        }
    },

    _getFunctionCount: function(clazzPath){
        var clazz, childName, child, funcCount = 0;

        clazz = Kojak.Core.getContext(clazzPath);
        Kojak.Core.assert(clazz, 'The clazz could not be found: ' + clazzPath);

        for(childName in clazz){
            if(clazz.hasOwnProperty(childName)){
                child = clazz[childName];

                if(child && child._kFProfile){
                    funcCount++;
                }
            }
        }

        return funcCount;
    },

    _getKFuncProfiles: function(opts, clazzPath){
        var clazz, childName, child, kFuncProfiles = [];

        clazz = Kojak.Core.getContext(clazzPath);
        Kojak.Core.assert(clazz, 'The clazz could not be found: ' + clazzPath);

        for(childName in clazz){
            if(clazz.hasOwnProperty(childName)){
                child = clazz[childName];

                if(child && child._kFProfile){
                    if(! opts.filter || this._matchesAnyFilter(opts.filter, childName, child._kFProfile.getKPath())){
                        kFuncProfiles.push(child._kFProfile);
                    }
                }
            }
        }

        kFuncProfiles = kFuncProfiles.sort(function(a, b){
            return b.getFunctionName() - a.getFunctionName();
        });

        return kFuncProfiles;
    },


    funcPerf: function(opts){
        var props = ['KPath', 'IsolatedTime', 'WholeTime', 'CallCount', 'AvgIsolatedTime', 'AvgWholeTime', 'MaxIsolatedTime', 'MaxWholeTime'],
            totalProps = ['IsolatedTime', 'CallCount'];

        opts = opts || {};

        opts.sortBy = opts.sortBy || 'IsolatedTime';

        opts.max = opts.max || 20;

        var report = this._functionPerfProps(opts, props, totalProps);

        if(Kojak.Config._SYNC) {
            Kojak.Sync.syncData(report);
        }
    },

    funcPerfAfterCheckpoint: function(opts){
        var props = ['KPath', 'IsolatedTime_Checkpoint', 'WholeTime_Checkpoint', 'CallCount_Checkpoint',  'AvgIsolatedTime_Checkpoint', 'AvgWholeTime_Checkpoint', 'MaxIsolatedTime_Checkpoint', 'MaxWholeTime_Checkpoint'],
            totalProps = ['IsolatedTime_Checkpoint', 'CallCount_Checkpoint'];

        if(!Kojak.instrumentor.getLastCheckpointTime()){
            console.warn('You have not taken any checkpoints yet to report on.  First run Kojak.takeCheckpoint() and invoke some of your code to test.');
            return;
        }

        opts = opts || {};

        opts.sortBy = opts.sortBy || 'IsolatedTime_Checkpoint';

        opts.max = opts.max || 20;

        console.log('Results since checkpoint taken: ' + (new Date(Kojak.instrumentor.getLastCheckpointTime())).toString('hh:mm:ss tt'));

        if(Kojak.Config._SYNC) {
            Kojak.Sync.syncDataAfterCheckpoint(
                this._collectDataForAfterCheckpoint(opts, props, totalProps)
            );
            this._safeGc(opts);
        }
    },

    _collectDataForAfterCheckpoint: function (options, properties, totalProperties) {
        var report = this._functionPerfProps(options, properties, totalProperties),
            data = {
                totalJSHeapSize: performance.memory.totalJSHeapSize/1024,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit/1024,
                usedJSHeapSize: performance.memory.usedJSHeapSize/1024,
                snapshotName: options.snapshotName,
                report: report
            };

        return data;
    },

    _safeGc: function (options) {
        if(options && options.gc) {
            try{
                gc();
            } catch(e) {
                console.log('You do not have access to garbage collector from you browser, ' +
                    'you could run chrome with --js-flags="--expose-gc" param.');
            }
        }
    },

    // opts are
    //  max: a number - how many rows do you want to show
    //  filter: a string or an array of strings.  If a function's kPath partially matches any of the filter strings it's included
    _functionPerfProps: function(opts, props, totalProps){
        var sortedProfiles = [],
            report = [],
            reportRow,
            profileCount,
            kFProfile,
            fieldCount,
            totals = {},
            totalsRow = [];

        if(!Kojak.instrumentor.hasInstrumented()){
            console.warn('You have not ran Kojak.instrumentor.instrument() yet.');
            return;
        }

        try {
            if(opts.filter){
                Kojak.Core.assert( Kojak.Core.isString(opts.filter) || Kojak.Core.isStringArray(opts.filter),
                    'filter must be a string or an array of strings');
            }

            if(opts.max){
                Kojak.Core.assert(Kojak.Core.isNumber(opts.max) && opts.max > 0, 'max should be a number greater than 0');
            }

            // First filter
            Kojak.instrumentor.getFunctionProfiles().forEach(function(kFProfile){
                if(!opts.filter || this._matchesAnyFilter(opts.filter, kFProfile.getKPath())){
                    sortedProfiles.push(kFProfile);
                }
            }.bind(this));

            // Then sort
            sortedProfiles.sort(function(a, b){
                return b.getProperty(opts.sortBy) - a.getProperty(opts.sortBy);
            });

            reportRow = [];
            props.forEach(function(prop){reportRow.push('--' + prop.replace('_Checkpoint', '') + '--');});
            report.push(reportRow);

            for (profileCount = 0; profileCount < sortedProfiles.length && profileCount < opts.max; profileCount++) {
                kFProfile = sortedProfiles[profileCount];

                reportRow = [];
                for(fieldCount = 0; fieldCount < props.length; fieldCount++){
                    reportRow.push(kFProfile.getProperty(props[fieldCount]));
                }
                report.push(reportRow);
            }

            // function totals
            Kojak.instrumentor.getFunctionProfiles().forEach(function(kFProfile){
                totalProps.forEach(function(totalProp){
                    var val = kFProfile.getProperty(totalProp);

                    if(Kojak.Core.isNumber(val)){
                        if(!totals[totalProp]){
                            totals[totalProp] = 0;
                        }
                        totals[totalProp] += val;
                    }
                }.bind(this));
            }.bind(this));

            props.forEach(function(prop){
                if(prop === 'KPath'){
                    totalsRow.push('--Totals across all instrumented functions: ');
                }
                else if(totals[prop]){
                    totalsRow.push(totals[prop]);
                }
                else {
                    totalsRow.push('-');
                }
            });

            report.push(totalsRow);

            console.log('Top ' + opts.max + ' functions displayed sorted by ' + opts.sortBy + (opts.filter ? ' based on your filter: \'' + opts.filter: '\''));
            console.table(report);
        }
        catch (exception) {
            console.error('Error, Kojak.Report.funcPerf has failed ', exception);
            if(exception.stack){
                console.error('Stack:\n', exception.stack);
            }
        }
        
        return report;
    },

    callPaths: function(funcPath){
        var funcWrapper, kFProfile, callPaths, callPath, count, sorted = [], pathsReport = [], summaryReport = [];

        if(!Kojak.instrumentor.hasInstrumented()){
            console.warn('You have not ran Kojak.instrumentor.instrument() yet.');
            return;
        }

        funcWrapper = Kojak.Core.isString(funcPath) ? Kojak.Core.getContext(funcPath) : funcPath;
        Kojak.Core.assert(funcWrapper, 'Function not found.');
        kFProfile = funcWrapper._kFProfile;
        Kojak.Core.assert(kFProfile, 'Function profile not found.  Are you sure it was included to be profiled?');

        callPaths = kFProfile.getCallPaths();
        for(callPath in callPaths){
            count = callPaths[callPath];
            sorted.push({path: callPath, count: count});
        }

        sorted = sorted.sort(function(a, b){
            return b.count - a.count;
        });

        pathsReport.push(['--Call Count--', '--Call Path--']);
        sorted.forEach(function(item){
            pathsReport.push([item.count, item.path]);
        }.bind(this));

        Kojak.Formatter.formatReport(pathsReport);

        console.log();
        summaryReport.push(['IsolatedTime: ', kFProfile.getIsolatedTime()]);
        summaryReport.push(['WholeTime: ', kFProfile.getWholeTime()]);
        summaryReport.push(['CallCount: ', kFProfile.getCallCount()]);
        Kojak.Formatter.formatReport(summaryReport);

        console.log('\n\tRemember, only profiled functions show up in call paths.');
        console.log('\tAnonymous functions with no references are never profiled.');
    },

    netCalls: function(){
        this._netCalls(Kojak.netWatcher.getNetProfiles());
    },

    netCallsAfterCheckpoint: function(){
        this._netCalls(Kojak.netWatcher.getNetProfiles_Checkpoint());
    },

    _netCalls: function(netProfiles){
        var urlBase, netProfile, sorted = [], report = [];

        if(!Kojak.netWatcher){
            console.warn('The NetWatcher is not loaded.  Have you set Kojak.Config.setEnableNetWatcher(true)?');
            return;
        }

        for(urlBase in netProfiles){
            netProfile = netProfiles[urlBase];
            sorted.push({totalCallTime: netProfile.getTotalCallTime(), netProfile: netProfile});
        }

        sorted = sorted.sort(function(a, b){
            return b.totalCallTime - a.totalCallTime;
        });

        report.push(['--urlBase--', '--urlParameters--', '--When Called--', '--Call Time--', '--Size (bytes)--', '--Obj Count--']);

        sorted.forEach(function(item){
            var addedUrlBase = false;

            item.netProfile.getCallsSortedByDate().forEach(function(netProfileCall){
                var reportLine = [];

                if(!addedUrlBase){
                    reportLine.push(item.netProfile.getUrlBase());
                    addedUrlBase = true;
                }
                else {
                    reportLine.push('');
                }

                reportLine.push(netProfileCall.getUrlParams());
                reportLine.push((new Date(netProfileCall.getDate())).toString('hh:mm:ss tt'));
                reportLine.push(netProfileCall.getCallTime());
                reportLine.push(netProfileCall.getResponseSize());
                reportLine.push(netProfileCall.getObjCount());

                report.push(reportLine);
            });
        });

        Kojak.Formatter.formatReport(report);

        if(Kojak.Config._SYNC) {
            Kojak.Sync.syncNetData(report);
        }
    },

    randomKojakQuote: function(){
        var kojakQuotes = ['Who loves ya, baby?',
                           'Counselor, you tell your client to make his mouth behave, or he\'s a prime candidate for a get well card.',
                           'Greeks don\'t threaten. They utter prophecies.',
                           'Dumb got him killed. Dead is not guts. Dead is dumb.'];
        return kojakQuotes[Math.floor(Math.random() * kojakQuotes.length)];
    },

    // *****************************************************************************************************************
    // Helper functions
    // filter can be a string or an array of strings
    // remaining parameters are compared with strings in the filter.
    _matchesAnyFilter: function(filter){
        var anyMatches, checks;

        anyMatches = false;
        checks = Array.prototype.slice.call(arguments, 1);

        if(Kojak.Core.isString(filter)){
            filter = [filter];
        }

        Kojak.Core.assert(Kojak.Core.isArray(filter), 'filter should be a string or an array of strings');

        filter.forEach(function(f){
            checks.forEach(function(c){
                if(c.contains(f)){
                    anyMatches = true;
                }
            });
        });

        return anyMatches;
    }
};


// See if the Browser can support the features that Kojak needs
if(!Object && Object.defineProperty){
    throw('Kojak requires the function Object.defineProperty');
}
// todo - other feature detection


// Loads configuration from local storage
Kojak.Config.load();
Kojak.instrumentor = new Kojak.Instrumentor();

switch(Kojak.Config.getAutoStartInstrumentation()){
    case Kojak.Config.AUTO_START_IMMEDIATE:
        console.log('Running Kojak.instrumentor.instrument() immediately.  Kojak should have been the last included JavaScript code in the browser for this to work.');
        Kojak.instrumentor.instrument();
        break;
    case Kojak.Config.AUTO_ON_JQUERY_LOAD:
        if(window.jQuery && window.jQuery.ready){
            jQuery(document).ready(function(){
                console.log('Running Kojak.instrumentor.instrument() in the jQuery.ready handler.');
                Kojak.instrumentor.instrument();
            });
        }
        else {
            console.log('Kojak autoStart set to Kojak.Config.AUTO_ON_JQUERY_LOAD but jQuery was not found.\nDid you forget to include jQuery?');
        }
        break;
    case Kojak.Config.AUTO_START_DELAYED:
        setTimeout(function(){
            console.log('Running Kojak.instrumentor.instrument() after the auto delay of ' + Kojak.Formatter.number(Kojak.Config.getAutoStartDelay()) + ' milliseconds.');
            Kojak.instrumentor.instrument();
        }, Kojak.Config.getAutoStartDelay());
        break;
}

if(Kojak.Config.getEnableNetWatcher()){
    Kojak.netWatcher = new Kojak.NetWatcher();
    // For now, just start watching network traffic immediately
    Kojak.netWatcher.start();
}

// Convenience shortcuts if there are no conflicts
// Do not use these in code - just a convenience for typing in the console
if(!window.kConfig){
    window.kConfig = Kojak.Config;
}
else {
    console.warn('Warning, the window.kConfig variable already existed.  Kojak shortcut will not exist.');
}

if(!window.kInst){
    window.kInst = Kojak.instrumentor;
}
else {
    console.warn('Warning, the window.kInst variable already existed.  Kojak shortcut will not exist.');
}

if(Kojak.netWatcher){
    if(!window.kNetWatch){
        window.kNetWatch = Kojak.instrumentor;
    }
    else {
        console.warn('Warning, the window.kNetWatch variable already existed.  Kojak shortcut will not exist.');
    }
}

if(!window.kRep){
    window.kRep = Kojak.Report;
}
else {
    console.warn('Warning, the window.kRep variable already existed.  Kojak shortcut will not exist.');
}


