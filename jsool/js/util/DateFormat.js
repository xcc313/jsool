/*  JSOOL - JavaScript Object Oriented Library 
 *
 *  Copyright (c) 2009, Mikhail Domanoski.
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without modification,
 *  are permitted provided that the following conditions are met:
 *
 *      * Redistributions of source code must retain the above copyright notice,
 *        this list of conditions and the following disclaimer.
 *
 *      * Redistributions in binary form must reproduce the above copyright notice,
 *        this list of conditions and the following disclaimer in the documentation
 *        and/or other materials provided with the distribution.
 *
 *      * Neither the name of Mikhail Domanoski nor the names of its
 *        contributors may be used to endorse or promote products derived from this
 *        software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Patterns:
 * yyy(y) = Four digits year
 * y(y) = two digits year
 * 
 * mmmm = Long month name
 * mmm = Short month name
 * mm = Two digits month number
 * m = One or two digits month number
 * 
 * dd = Two digits day number
 * d = One or two digits day number
 * 
 * EEEE = Long weekday name
 * E(EE) = Short weekday name
 */

jsool.namespace("js.util");

/**
 * Formarts and parse date Objects according with patterns provided by the locale or the user.
 * It provides format methods (Date -> text) and parse methods (text -> date)
 */
js.util.DateFormat = $extends(js.core.Object,{
	cons: function(pattern){
		this.pattern = pattern ? pattern : this.pattern;
		
		this.patternKeyMap = new js.util.HashMap();
		
		for(var i=0,p;p=this.patterns[i++];){
			this.patternKeyMap.put('{'+p.key+'}', p);
		}
	},
	/**
	 * Default data pattern
	 */
	pattern: 'yyyy/mm/dd',
	/**
	 * The compiled pattern
	 */
	compiled: null,
	/**
	 * The weekdays names array
	 */
	weekdays: null,
	/**
	 * the month names array
	 */
	months: null,	
	patternKeyMap: null,
	/**
	 * Formats the data into a pattern-macth text
	 */
	format: function(date){
		var formated = new String(this.pattern);
		var pattern;		
		var length = this.patterns.length; 
		
		for(var i = 0; i < length; i++){
			pattern = this.patterns[i];
			if(formated.search(pattern.pattern) >= 0){
				formated = formated.replace(pattern.pattern, this['get'+pattern.name](date));
			}
		}
		return formated;
	},
	/**
	 * Compiles the current patten
	 */
	compile: function(){
		var compiled = new String(this.pattern);
		var pattern;
		var length = this.patterns.length; 
		
		for(var i = 0; i < length; i++){
			pattern = this.patterns[i];
			compiled = compiled.replace(pattern.pattern, '{'+pattern.key+'}');
		}
		
		this.compiled = compiled;
	},
	/**
	 * Parse a string into a Date
	 */
	parse: function(string){
		if(!String.isString(string)){
			throw new js.core.Exception('invalid argument type: '+ string, this, arguments);
		}		
		
		if(!this.compiled) this.compile();
		
		var resultDate = new Date();
		var openToken, closeToken;
		var currentPattern;
		var referenceString = this.compiled;
		
		string = string.toLowerCase();
		
		while((openToken = referenceString.indexOf('{')) >= 0){
			closeToken = referenceString.indexOf('}')+1;
			string = string.substring(openToken);
			
			currentPattern = this.patternKeyMap.get(referenceString.substring(openToken,closeToken));
			
			string = this['parse'+currentPattern.name](string, resultDate);
			
			referenceString = referenceString.substring(closeToken);
		}
		
		return resultDate;
	},
	patterns: [{pattern: /y{3,}/,key: '0',name: 'LongYear'},
	           {pattern: /y{1,2}/,key: '1',name: 'ShortYear'},
	           {pattern: /M{4,}/,key: '2',name: 'LongMonth'},
	           {pattern: /M{3}/,key: '3',name: 'ShortMonth'},
	           {pattern: /M{2}/,key: '4',name: 'LongNumericMonth'},
	           {pattern: /M{1}/,key: '5',name: 'ShortNumericMonth'},
	           {pattern: /d{2,}/,key: '6',name: 'LongDay'},
	           {pattern: /d/,key: '7',name: 'ShortDay'},
	           {pattern: /E{4,}/,key: '8',name: 'LongWeekday'},
	           {pattern: /E{1,3}/,key: '9',name: 'ShortWeekday'}],
	           
	//FORMATING FUNCTIONS
	getLongYear: function(date){return new String(date.getFullYear());},
	getShortYear: function(date){return new String(date.getFullYear()).substring(2);},
	getLongMonth: function(date){return this.months[date.getMonth()];},
	getShortMonth: function(date){return this.months[date.getMonth()].substring(0,3);},
	getLongNumericMonth: function(date){var month = new String(date.getMonth()+1);return (month.length < 2 ? '0'+month : month);},
	getShortNumericMonth: function(date){return new String(date.getMonth()+1);},
	getLongDay: function(date){var day = new String(date.getDate());return (day.length < 2 ? '0'+day : day);},
	getShortDay: function(date){return new String(date.getDate());},
	getLongWeekday: function(date){return this.weekdays[date.getDay()];},
	getShortWeekday: function(date){return this.weekdays[date.getDay()].substring(0,3);},
	
	//PARSING FUNCTIONS
	parseLongYear: function(string, date){
		var sdate = string.substring(0, 4);
		date.setYear(parseInt(sdate));
		return string.substring(4);
	},
	parseShortYear: function(string, date){
		var sdate = string.substring(0,2);
		var ndate = (new Date()).getFullYear().toString().substring(0, 2) + sdate;		
		date.setYear(parseInt(ndate));
		return string.substring(2);
	},
	parseLongMonth: function(string, date){
		var i = 0;
		while(string.indexOf(this.months[i].toLowerCase())!= 0){i++;}
		date.setMonth(i);
		return string.substring(this.months[i].length);
	},
	parseShortMonth: function(string, date){
		var i = 0;
		while(string.indexOf(this.months[i].substring(0,3).toLowerCase())!= 0){
			i++;
		}
		date.setMonth(i);
		return string.substring(3);
	},
	parseLongNumericMonth: function(string, date){
		var month = string.substring(0,2);
		date.setMonth(window.parseInt(month)-1);
		return string.substring(2);
	},
	parseShortNumericMonth: function(string, date){
		var error = false;
		try{
			var month = window.parseInt(string.substring(0,2));			
			error = string.charCodeAt(1) < 48 || string.charCodeAt(1) > 57;
		}catch(e){
			error = true;
		}
		
		if(error || month > 12){
			month = window.parseInt(string.substring(0,1));
			date.setMonth(month-1);
			return string.substring(1);
		}else{
			date.setMonth(month-1);
			return string.substring(2);
		}
	},
	parseLongDay: function(string, date){
		var day = string.substring(0,2);
		date.setDate(window.parseInt(day));
		return string.substring(2);
	},
	parseShortDay: function(string, date){
		var error = false;
		try{
			var day = window.parseInt(string.substring(0,2));
			error = string.charCodeAt(1) < 48 || string.charCodeAt(1) > 57;
		}catch(e){
			error = true;
		}
		
		if(error || day > 31){
			day = window.parseInt(string.substring(0,1));
			date.setDate(day);
			return string.substring(1);
		}else{
			date.setDate(day);
			return string.substring(2);
		}
	}
},'js.util.DateFormat');