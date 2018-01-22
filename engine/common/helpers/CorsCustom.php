<?php
/**
 * Created by PhpStorm.
 * User: amihailichenko
 * Date: 05.04.2017
 * Time: 17:35
 */

namespace common\helpers;


use Yii;
use yii\filters\Cors;

class CorsCustom extends  Cors

{
    public function beforeAction($action)
    {
        parent::beforeAction($action);

        if (Yii::$app->getRequest()->getMethod() === 'OPTIONS') {
            Yii::$app->getResponse()->getHeaders()->set('Allow', 'POST GET PUT');
            Yii::$app->end();
        }
        if (Yii::$app->getRequest()->getMethod() === 'GET') {
            Yii::$app->getResponse()->getHeaders()->set("Access-Control-Expose-Headers","X-Pagination-Current-Page, X-Pagination-Page-Count, X-Pagination-Per-Page, X-Pagination-Total-Count");
        }

        return true;
    }
}