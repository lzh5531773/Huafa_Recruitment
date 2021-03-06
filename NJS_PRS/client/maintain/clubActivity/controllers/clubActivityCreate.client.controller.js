/**
 * Created by SUKE3 on 11/25/2016.
 */

(function () {
    'use strict';
    angular.module('clubActivityManagement').controller('ClubActivityCreate', ClubActivityCreate);

    ClubActivityCreate.$inject = ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster','UserService','ClubActivityService','SignupFieldService','RecreationClubService','$cookies', 'Upload','RecreationClubTMService'];

    function ClubActivityCreate(instance, $scope, $http, $uibModal, $uibModalInstance, toaster, UserService, ClubActivityService,SignupFieldService,RecreationClubService,$cookies, Upload,RecreationClubTMService){

        const TIP_CREATE_SUCCESS = "创建成功";
        const TIP_CREATE_FAILED = "创建失败，请重试";
        const PUBLISHED = "已发布";
        const NOT_PUBLISH = "待发布";

        RCTemplateInit(instance, $scope);
        $scope.currentUser = JSON.parse($cookies.get('USER_INFO'))?JSON.parse($cookies.get('USER_INFO')):{};

        var user=JSON.parse($cookies.get('USER_INFO'));
        $scope.user = user;


        UserService.findUsers({userid:user.userid}, function(err, users){
            if(!_.isEmpty(users)){
                $scope.users = users;
            }else{
                $scope.users = [];
            }
        });


        $scope.submit = function(isValid){
            if(isValid){
                $scope.ClubActivity.status = NOT_PUBLISH;
                $scope.ClubActivity.currentCount = 0;
                $scope.ClubActivity.club = $scope.user.club._id;
                ClubActivityService.upsertClubActivity($scope.ClubActivity, function (err, data) {
                    if (err) {
                        toaster.pop('error', TIP_CREATE_FAILED);
                    } else {
                        $uibModalInstance.close('ok');
                        toaster.pop('success', TIP_CREATE_SUCCESS);
                        instance.refreshForCreateOrUpdate(null);
                    }
                });
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };

        SignupFieldService.findSignupFields({}, function(err, fields){
            if(!_.isEmpty(fields)){
                $scope.allFields = fields;
            }else{
                $scope.allFields = [];
            }
        })

        $scope.upload = function (files) {
            if(files && files.length > 0) {
                Upload.upload({
                    url: '/api/fileUpload',
                    fields: {'userid': $scope.currentUser.userid},
                    file: files
                }).then(function (res) {
                    RecreationClubService.getUpfiles({createUser: $scope.currentUser.userid,name: res.config.file[0].name },
                        function (err, upfiles) {
                            if (err) console.log(err);
                            else {
                                $scope.upfiles = upfiles.upfiles;
                                if ($scope.upfiles && $scope.upfiles.length > 0) {
                                    $scope.ClubActivity.cover=$scope.upfiles[0].fileSrc.indexOf('public/')>=0?$scope.upfiles[0].fileSrc.substr($scope.upfiles[0].fileSrc.indexOf('/')+1):$scope.upfiles[0].fileSrc
                                    $scope.upfileName=res.config.file[0].name;
                                }
                            }
                    })
                }, function (res) {
                    console.log('Error status: ' + res.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file[0].name);
                });
            }
        };

        $scope.getPageTpls = function(){
            var data = {
                'createUser': $scope.currentUser.userid,
                'isDelete': false,
                'type': '1101'
            };
            RecreationClubTMService.getPageTpls(data, function(error, res){
                if(200 === res.data.code){
                    if (res.data.templates && res.data.templates.length > 0) {
                        $scope.allH5Introduces = res.data.templates;
                    }
                    else{
                        $scope.allH5Introduces = [];
                    }
                }
            })
        };
        $scope.getPageTpls();

        $scope.getH5Url = function(){
            RecreationClubTMService.getH5Url(function(err, res) {
                if (!err) {
                    $scope.h5Id = res.data._id;
                    $scope.h5Url = res.data.url;
                }
            });
        };
        $scope.getH5Url();

        $scope.createTplByH5 = function(){
            var data = {
                'username': $scope.currentUser.userid
            }
            UserService.getUser(data, function(err, user){
                if(user) {
                    var options = {};
                    options.user = user;
                    options.h5Id = $scope.h5Id
                    RecreationClubTMService.createTplByH5(options, function(err, res){
                        if(!err){
                        }
                    });
                }
            });
        }

    }

    function RCTemplateInit(instance, $scope) {

        //$scope.allH5Introduces = [
        //    {name: '2011 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //    {name: '2012 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //    {name: '2013 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //    {name: '2014 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //    {name: '2015 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //    {name: '2016 ZHA Basketball', link: 'http://h5-slide.cloud.dachuanqi.cn/view/v-rkjtoigxbxvl5wmi'},
        //];

        // $scope.allUsers = UserService.findUsers

        $scope._simpleConfig = {
            //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
            toolbars: [
                [
                    'fontfamily', 'fontsize', '|',
                    'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify','|','customstyle', 'paragraph', '|', 
                    'indent','rowspacingtop', 'rowspacingbottom', 'lineheight', 
                    
                    'forecolor', 'backcolor', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'insertorderedlist','insertunorderedlist',
                    'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'undo', 'redo',
                      '|', 'selectall', 'cleardoc', '|',
                      'imagenone', 'imageleft', 'imageright', 'imagecenter','simpleupload', 'insertimage','snapscreen', 'wordimage', 'source'
                ]
            ],
            //focus时自动清空初始化时的内容
            autoClearinitialContent: true,
            //关闭字数统计
            wordCount: false,
            //关闭elementPath
            elementPathEnabled: false,
            autoHeightEnabled: false,
            scaleEnabled: false,
            zIndex : 1300
        };
    }

}());