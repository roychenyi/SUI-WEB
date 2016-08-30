define(function(require, exports, module) {
    var model = require("./model");
    var rm = require("./rm");
    var view = Backbone.View.extend({
        el: "div.ajax-content",
        initialize:function(){
            this.model=new model();
        },
        events:{
            "click button[role='save']":"save1",//保存
            "change #fillDate":"infoChange",
            "change #orgId":"infoChange",
            "change input[name='fillDate']":"infoChange",
            "click button[role='search']":"search"   //查询
        },
        render:function(){
            this.initForm();//表单校验
        },
        save1:function(){
            var viewSelf = this;
            var cellValues = [];
            $("button[role='save']").attr("disabled",true);
            $(".table").find("tr").each(function(){
                var tdArr = $(this).children();
                var itemId = tdArr.eq(0).text();
                var itemName = tdArr.eq(1).text();
                var balance = tdArr.eq(2).find("input").val();
                if(balance=="" || balance==null){
                    balance = "no";
                }
                var profit = tdArr.eq(3).find("input").val();
                if(profit=="" || profit==null){
                    profit = "no";
                }
                var id = tdArr.eq(2).find("input").data("id");
                if(id=="" || id==null){
                    id = "no";
                }
                var lbalance = tdArr.eq(2).find("input").data("lbalance");
                if(lbalance=="" || lbalance==null){
                    lbalance = "no";
                }
                var lprofit = tdArr.eq(3).find("input").data("lprofit");
                if(lprofit=="" || lprofit==null){
                    lprofit = "no";
                }
                var orgId=$('#orgId').val();
                cellValues.push(itemId+","+itemName+","+balance+","+profit+","+id+","+lbalance+","+lprofit+","+orgId);
            });
            cellValues.shift();//删除第一个元素
            if($("#form").valid()){
                $.ajax({
                    type:'GET',
                    url:$$ctx + "/fillFormItem/ifSaved",
                    data:{fillDate:$("#fillDate").val(),
                    	orgId: $('#orgId').val()},
                    success:function(result){
                        $.ajax({
                            type:'POST',
                            url:$$ctx + "/fillFormItem/ifMoreThanTenPercent",
                            data:{
                                cellValues:cellValues
                            },
                            success:function(result1){
                                var flag = "";
                                if("0"==result){//未填报
                                    if(""==result1){
                                        flag = "保存成功。";
                                        viewSelf.save2(flag,cellValues);
                                    }else{
                                        flag = result1+"，是否确认？";
                                        viewSelf.save(flag,cellValues);
                                    }
                                }else{//已填报
                                    if(""==result1){
                                        flag = "今天已填报过，是否覆盖数据？";
                                        viewSelf.save(flag,cellValues);
                                    }else{
                                        flag = "今天已填报过，且"+ result1 + "，是否确认覆盖数据？";
                                        viewSelf.save(flag,cellValues);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        },
        save:function(flag,cellValues){
        	var viewSelf = this;
            bootbox.confirm(flag,function(res){
                if(res == true){
                    $.ajax({
                        type:'POST',
                        url:$$ctx + "/fillFormItem/save",
                        data:{
                            cellValues:cellValues,
                            fillDate:$("#fillDate").val(),
                            memo:$("#memo").val()
                        },
                        success:function(result){
                        	bootbox.alert("保存成功");
                          //  	window.location.reload();
                        	viewSelf.formDate();
                        }
                    });
                }else{
                    //	window.location.reload();
                	viewSelf.formDate();
                }
            });
        },
        save2:function(flag,cellValues){
        	 var viewSelf = this;
            $.ajax({
                type:'POST',
                url:$$ctx + "/fillFormItem/save",
                data:{
                    cellValues:cellValues,
                    fillDate:$("#fillDate").val(),
                    memo:$("#memo").val()
                },
                success:function(result){
                 //   	window.location.reload();
                	bootbox.alert("保存成功");
                    viewSelf.formDate();
                }
            });
        },
        preWorkDay:function(){
            var prevFillDate='';
            $.ajax({
                type:'POST',
                url:$$ctx + "/fillFormItem/prevFillDate",
                async: false,
                success:function(data){
                    prevFillDate=data.substring(0,10);
                }
            });
            return prevFillDate;
        },
        infoChange:function(){
         /*   var functionId=$('#functionId').val(),
                orgId=$('#orgId').val(),
                orgCode=$('#orgCode').val(),
                date=$('#fillDate').val(),
                premLevel=$('#premLevel').val();*/
          //  var prevWorkDay=this.preWorkDay();
           var date=$("input[name='fillDate']:checked").val();
            if(date !== undefined){
               	$('#fillDate').val(date);
            }
          // date=$('#fillDate').val();
            var date1=new Date($('#fillDate').val().replace(/-/g,"\/"));
            if(date1>new Date()){
            	var date1=new Date();
                var month=(date1.getMonth()>9)?(date1.getMonth()+1):("0"+(date1.getMonth()+1));
                var day=(date1.getDate()>9)?(date1.getDate()):("0"+(date1.getDate()));
                var date2=date1.getFullYear()+"-"+month+"-"+day;
                $('#fillDate').val(date2);
            }
            this.formDate();
/*            if(premLevel!="1"){
                var date1=new Date();
                var month=(date1.getMonth()<9)?(date1.getMonth()+1):("0"+(date1.getMonth()+1));
                var day=(date1.getDate()<9)?(date1.getDate()+1):("0"+(date1.getDate()+1));
                var date2=date1.getFullYear()+"-"+month+"-"+day;
                if(date==prevWorkDay||date==date2){
                    this.formDate();
                }else{
                    bootbox.confirm("您选择的时间有误，您只能选择上一个记录日（"+prevWorkDay+"）,点击确定，将跳转到上一个工作日",function(result){
                        if(!result){
                            $('#fillDate').val(prevWorkDay);
                            this.formDate();
                        }
                    });
                }
            }else{
                this.formDate();
            }*/
        },
        formDate:function(){
            var functionId=$('#functionId').val(),
                orgId=$('#orgId').val(),
                orgCode=$('#orgCode').val(),
                date=$('#fillDate').val();
            if(date===undefined){
                date=$("input[name='fillDate']:checked").val();
            }
            $.ajax({
                url:$$ctx + "/fillFormItem",
                type:'POST',
                data:{
                    functionId:functionId,
                    orgId:orgId,
                    date:date
                },
                success:function(data){
                //	console.log(data);
                    $('.page-content-area').empty().html(data);
                }
            });
        },
        initForm: function() {
            /*$("#form").validate({
             rules: rm.rules,
             messages: rm.messages,
             errorPlacement:function(error,element){
             error.appendTo(element.parent());//把错误信息放在验证的元素后面。
             }
             });*/
            jQuery.validator.addMethod("isPositiveNumberTwo", function(value, element) {
                return this.optional(element) || /^[1-9]\d*$/.test(value) || /^\d+(\.\d{1,2})?$/.test(value);
            }, "正整数或两位小数22.");

            $("#form").validate({
                errorPlacement:function(error,element){
                    error.appendTo(element.parent());//把错误信息放在验证的元素后面。
                }
            });
            $("td :text").each(function(){
                $(this).rules("add",{
                    isPositiveNumberTwo:true,
                    messages:{
                        isPositiveNumberTwo:"正整数或两位小数11."
                    }
                });
            });



        },
        search:function(){
        	$.ajax({
        		type:'POST',
                url:$$ctx + "/fillFormItem/search",
                success:function(data){
                	bootbox.dialog({
                        title:"资金头寸表填报状态",
                        message:data
                        
                    });
                }
        	});
        }
    });
    module.exports = view;
});