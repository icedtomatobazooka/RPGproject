//ITB_PictureParallax.js
//version 1.0


/*:
* @plugindesc v.1.0 任意のピクチャを画面スクロールの影響を受けるようにします。
* @target MZ
* @url 
* @author アイストマトバズーカ

* @target MZ
* @help 画像ファイル名の最初に"!"をつけるとその画像はピクチャ表示/移動時に
* 画面スクロールの影響を受けるようになります。
* 座標はピクセル単位ままで原点はマップの左上になります。
*
* 利用規約:
*   ・改変、再配布、利用形態の制限はありません。
*   ・本プラグインによるトラブル等、一切の責任を負いかねます。
*/

(() => {
    'use strict';

    Sprite_Picture.prototype.updatePosition = function() {
    const picture = this.picture();
    if(this._pictureName.charAt(0) === "!"){
        this.x = Math.round(picture.x()) - $gameMap._displayX * $gameMap.tileWidth();
        this.y = Math.round(picture.y()) - $gameMap._displayY * $gameMap.tileHeight();
    }
    else{
	this.x = Math.round(picture.x());
        this.y = Math.round(picture.y());
    }
};

})();