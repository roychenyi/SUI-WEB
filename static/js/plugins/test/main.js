define(function(require, exports, module) {
	var view = require('./view');
	var main={
			init:function(){
				var myView=new view();
				myView.render();
			}
	};
	module.exports=main;
});