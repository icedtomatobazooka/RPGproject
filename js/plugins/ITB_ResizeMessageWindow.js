//ITB_ResizeMessageWindow.js
//version 1.0


/*:
* @plugindesc v.1.0 メッセージウインドウのサイズ(幅・行数)を変更します。
* @target MZ
* @url 
* @author アイストマトバズーカ

* @target MZ
* @param mwwdr
* @text ウインドウ幅(%)
* @default 100
* @type number
* @desc UIエリアに対するメッセージウインドウの幅(0~100%)
* @param mwrow
* @text ウインドウ高さ(行)
* @default 4
* @type number
* @desc メッセージウインドウの高さ(表示文章の行数)

* @command setparavalue
* @text 値の変更
* @desc 値を変更するのだ
* @arg mwrowc
* @text ウインドウ高さ(行)
* @default 4
* @type number
* @desc メッセージウインドウの高さ(表示文章の行数)

* @help メッセージウインドウの幅と行数を指定してサイズ変更します。
*
* ウインドウ幅は"UIエリアの幅"を100％としてパーセンテージで指定します。
* "UIエリアの幅は"データベースのシステム２で設定する値です。
*
* ウインドウ高さは表示する文章の行数で指定します。
*
*
* 利用規約:
*   ・改変、再配布、利用形態の制限はありません。
*   ・本プラグインによるトラブル等、一切の責任を負いかねます。
*/

(() => {
    'use strict';
    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
    const parameters = PluginManager.parameters(pluginName);

    const mwwdr = parameters['mwwdr'];
    let mwrow = parameters['mwrow'];

    PluginManager.registerCommand(pluginName, "setparavalue", args => {
        mwrow = args.mwrowc;
    });

    Scene_Message.prototype.messageWindowRect = function() {
        const ww = Graphics.boxWidth * mwwdr/100;
        const wh = this.calcWindowHeight(mwrow, false) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    };

})();

















//console.log("ini:", mwrow);
//        console.log("parmwrow:", mwrowc)
//console.log("height:", mwrow);