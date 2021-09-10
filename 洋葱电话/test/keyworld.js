'use strict';
let m = 'yy yy yy yaasoidjoiajsoidjaijsodijaosj';

let s = m.split('yy');
let result = [];
let i = 0;
console.log(s);
for (let item of s) {
	if (i > 0) {
		result.push("我");
	}
	result.push(item);
	i++;
}
console.log(result);
