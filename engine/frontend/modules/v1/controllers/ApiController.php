<?php
/**
 * Created by PhpStorm.
 * User: amihailichenko
 * Date: 29.03.2017
 * Time: 10:09
 */

namespace app\modules\v1\controllers;

use common\helpers\CorsCustom;
use Yii;
use yii\helpers\VarDumper;
use yii\rest\Controller;
use yii\filters\auth\CompositeAuth;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\ContentNegotiator;
use yii\web\Response;
use mdm\admin\components\MenuHelper;

use common\models\LoginForm;
use common\models\User;


class ApiController extends Controller
{
    public function actionLogin(){
        $_POST = json_decode(file_get_contents('php://input'), true);
        $username = !empty($_POST['username'])?$_POST['username']:'';
        $password = !empty($_POST['password'])?$_POST['password']:'';
        $model= new LoginForm();
        $model->username=$username;
        $model->password=$password;
        if($model->login()){
            $user = \common\models\User::findByUsername($username);
            $token = $user->getJwt();
            $decoded=User::decodeJWT($token);
            //VarDumper::dump($decoded,10,true);
            return ['token'=>$token];
        } else {
            return ['errors'=>$model->getErrors()];
        }

    }
    public function actionGetmetadata(){
        $table=(isset($_GET['table']))?$_GET['table']:null;
        $out=[
            'table'=>$table,
            'fields'=>[],
        ];
        if($table){
            $className='common\models\\'.$table;
            $types=[
                'boolean',
                'number',
                'integer',
                'double',
                'string'
            ];
            if(class_exists($className)){
                if(method_exists($className,'rules')){
                    $rules=$className::rules();
                } else {
                    $rules=[];
                }
                if(method_exists($className,'myRules')){
                    $myRules=$className::myRules();
                } else {
                    $myRules=[];
                }
                if(method_exists($className,'attributeLabels')){
                    $al=$className::attributeLabels();
                } else {
                    $al=[];
                }
                $out['result']=true;
                foreach ($al as $field=>$description) {
                    $out['fields'][$field]=[
                        'name'=>$field,
                        'description'=>$description,
                        'rules'=>[
                            'required'=>false,
                        ],

                    ];
                    foreach ($rules as $rule) {
                        $rFields=$rule[0];
                        $r=$rule[1];
                        if(in_array($field,$rFields)){
                            if(in_array($r, $types)){
                                $out['fields'][$field]['rules'][$r]=[];
                                if(isset($rule['max'])){
                                    $out['fields'][$field]['rules'][$r]=[
                                        'max'=>$rule['max'],
                                    ];
                                }
                                if(isset($rule['min'])){
                                    $out['fields'][$field]['rules'][$r]=[
                                        'min'=>$rule['min'],
                                    ];
                                }
                                if(isset($rule['length'])){
                                    $out['fields'][$field]['rules'][$r]=[
                                        'length'=>$rule['length'],
                                    ];
                                }
                            }
                            if($r='default' and isset($rule['value'])){
                                $out['fields'][$field]['rules']['default']=$rule['value'];
                            }
                            if($r='required'){
                                $out['fields'][$field]['rules'][$r]=true;
                            }
                        }
                    }
                }
                foreach ($myRules as $field=>$myRule) {
                    foreach ($myRule as $key=>$value) {
                        $out['fields'][$field]['rules'][$key]=$value;
                    }
                }
                return $out;
            } else {
                return $out;
            }
        }
    }
    public function actionTest(){
        // \Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;
        $tableName=(isset($_GET['table']))?$_GET['table']:null;
        if($tableName){
            $className='common\models\\'.$tableName;
            if(class_exists($className)){
                return ['yes'];
            } else {
                return ['no'];
            }
        }
    }
    public function actionTest1(){
        // \Yii::$app->response->format = \yii\web\Response::FORMAT_RAW;

        $user=Yii::$app->user->identity;
        $ldapInfo=unserialize(Yii::$app->user->identity->ldapInfo);
        //VarDumper::dump($user,10,true);
/*
 *
username: string;
    password: string;
    firstName: string;
    lastName: string;
 */
        $a=array();
        $a[]=array(
            'username'=>$user->username,
            'password'=>'***********',
            'firstName'=>$ldapInfo['givenname'][0],
            'lastName'=>$ldapInfo['sn'][0],
        );
        //$a=array('user'=>1);
        //$b=VarDumper::dumpAsString($a,10,false);
        return $a;
    }
    public function actionGetusermenu(){

        //return Yii::$app->params['JWT_TOKEN'];
        $authHeader = Yii::$app->getRequest()->getHeaders()->get('Authorization');
        $token=null;
        if ($authHeader !== null && preg_match('/^Bearer\s+(.*?)$/', $authHeader, $matches)) {
            $token = $matches[1];
            $decodedToken=User::decodeJWT($token);
            $menu=MenuHelper::getAssignedMenu(Yii::$app->user->id,null,function ($menu) {
                $route=$menu['route'];

                if(strpos($menu['route'],'api/')==1){
                    $route=substr($menu['route'],4);
                }
                $show='';
                return [
                    'label' => $menu['name'],
                    'route' => $route,
                    'show' => $show,
                    'level'=> 1,
                    'children' => $menu['children']
                ];
            },true);
            return $menu;
        }
        return [];
    }
    public function actionGetmenu(){
        $menu=[];
        return $menu;
    }
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['contentNegotiator']=[
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        $behaviors['authenticator']=[
            'class' => CompositeAuth::className(),
            'authMethods' => [HttpBearerAuth::className(),],
            //'only' => ['test'],
        ];
        // remove authentication filter
        $auth = $behaviors['authenticator'];
        unset($behaviors['authenticator']);

        // add CORS filter

        $behaviors['corsFilter'] = [
            'class' => CorsCustom::className(),
        ];

        // re-add authentication filter
        $behaviors['authenticator'] = $auth;
        // avoid authentication on CORS-pre-flight requests (HTTP OPTIONS method)
        $behaviors['authenticator']['except'] = ['options', 'login', 'getmenu', 'getMetaData', 'test'];

        return $behaviors;
    }
}