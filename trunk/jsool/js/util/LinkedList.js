js.util.LinkedList = Extends(js.util.List, {
	constructor: function(){
		js.core.Object.apply(this, arguments);
		this.header = {element: null, next: null, previous: null};
		this.header.next = this.header.previous = this.header;
	},
	header: null,
	last: null,
	_size: 0,
	_newEntry: function(el, nex, prev){
		return {element: el, next: nex, previous: prev};
	},
	_addBefore: function(entry, before){
		var node = this._newEntry(entry, before, before.previous);
		node.previous.next = node;
		node.next.previous = node;
		this._size++;
	},
	_entry: function(index){
		if(index < 0 || index >= this._size)
			throw new js.core.Exception('Index Out Of Bounds: '+index, this, arguments);
		
		var e = this.header;
		if (index < (this._size >> 1)) {
            for (var i = 0; i <= index; i++)
                e = e.next;
        } else {
            for (var j = this._size; j > index; j--)
                e = e.previous;
        }
        return e;
	},
	_remove: function(entry){
		if(entry == this.header)
			throw new js.core.Exception('No Such Element',this, arguments);
		
        var result = entry.element;
        entry.previous.next = entry.next;
        entry.next.previous = entry.previous;
        entry.next = entry.previous = null;
        entry.element = null;
        this._size--;
	},
	add: function(object, index){
		if(index == null){
			this._addBefore(object, this.header);
		}else{
			if(typeof index != 'number')
				throw new js.core.Exception("Invalid argument type: "+ typeof number, this, arguments);
			if(index >= this._size)
				throw new js.core.Exception("Array index out of bounds: "+ number, this, arguments);
			
			this._addBefore(object, index == this._size ? this.header : this._entry(index));
		}
	},
	get: function(index){
		return this._entry(index).element;
	},
	set: function(obj, index){
		var e = this._entry(index);
		e.element = obj;
	},
	remove: function(obj){
		if(typeof obj == 'number')
			this._remove(this._entry(obj));
		else if(typeof obj == 'object')
			for (var e = this.header.next; e != this.header; e = e.next) {
                if (obj == e.element) {
                    this._remove(e);
                }
            }
	},
	clear: function(){
		var e = this.header.next;
        while (e != this.header) {
            var next = e.next;
            e.next = e.previous = null;
            e.element = null;
            e = next;
        }
        this.header.next = this.header.previous = this.header;
        this._size = 0;
	},
	addAll: function(array){
		if(array.iterator){
			var i = array.iterator();
			while(i.hasNext()){
				this.add(i.next());
			}
		}else{
			for(var j = 0; j < array.length; j++)
				this.add(array[j]);
		}
	},
	toArray: function(){
		var arr = new Array();
		for(var e = this.header.next; e != this.header; e = e.next)
			arr.push(e.element);
		return arr;
	},
	indexOf: function(object){
		var index = 0;
        for (var e = this.header.next; e != this.header; e = e.next) {
            if (object  == e.element)
                return index;
            index++;
        }
        return -1;
	},
	contains: function(object){
		return this.indexOf(object) != -1;
	},
	iterator: function(){		
		return new js.util.LinkedList.Iterator(this);
	},
	size: function(){
		return this._size;
	},
	clone: function(){
		var copy = new js.util.LinkedList();
		copy.addAll(this);
		return copy;
	}
}, 'js.util.LinkedList');

js.util.LinkedList.Iterator = Extends(js.core.Object,{
	constructor: function(list){
		js.core.Object.apply(this,arguments);
		this.size = list._size;
		this.nextNode = list.header.next;
		this.header = list.header;
	},
	size: 0,
	nextNode: null,
	header: null,
	index: 0,
	hasNext: function(){				
		return this.nextNode != this.header;
	},
	next: function(){
		if(!this.hasNext())
			throw new js.core.Exception('No Such Element', this, arguments);
		
		var node = this.nextNode;
		this.nextNode = node.next;
		this.index ++;
		return node.element;
	},
	nextIndex: function(){
		return this.index + 1;
	}
},'js.util.LinkedList.Iterator');