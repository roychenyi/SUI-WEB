define(function(require, exports, module) {
	var rm = {
		rules:{
			balance:{
				isPositiveNumberTwo: true,
			},
			profit:{
				isPositiveNumberTwo: true,
			}
		},
		messages:{
			balance:{
				isPositiveNumberTwo: "正整数或两位小数--test"
			},
			profit:{
				isPositiveNumberTwo: "正整数或两位小数"
			}
		}
	};
	module.exports = rm;
});