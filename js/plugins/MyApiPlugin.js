/*:
 * @target MZ
 * @plugindesc XREA PHP API連携プラグイン
 * @author YourName
 *
 * @help このプラグインは、XREAのPHP API（データベース連携）を
 * RPGツクールMZからプラグインコマンド経由で利用できるようにします。
 *
 * @param baseUrl
 * @type string
 * @text APIベースURL
 * @desc データを取得/保存するAPIのベースURL。例: http://your-domain.com/api.php
 * @default http://www.icedtomatobazooka.shop/api.php
 *
 * @command fetchPlayers
 * @text プレイヤーデータを取得
 * @desc APIからプレイヤーデータを取得します。
 *
 * @arg successVariableId
 * @type variable
 * @text 成功時格納変数ID
 * @desc 取得したJSONデータ（data.data部分）を格納する変数ID。JSON文字列として格納されます。
 *       空の場合、変数には格納されません。
 * @default 0
 *
 * @arg errorVariableId
 * @type variable
 * @text 失敗時格納変数ID
 * @desc エラーメッセージ（data.message部分）を格納する変数ID。
 *       空の場合、変数には格納されません。
 * @default 0
 *
 * @arg successCommonEventId
 * @type common_event
 * @text 成功時コモンイベントID
 * @desc データ取得成功時に呼び出すコモンイベントのID。
 * @default 0
 *
 * @arg errorCommonEventId
 * @type common_event
 * @text 失敗時コモンイベントID
 * @desc データ取得失敗時に呼び出すコモンイベントのID。
 * @default 0
 *
 * @command savePlayer
 * @text プレイヤーデータを保存
 * @desc APIにプレイヤーデータをPOSTします。
 *
 * @arg playerId
 * @type number
 * @text プレイヤーID (更新時)
 * @desc 既存プレイヤーを更新する場合はIDを指定。新規作成の場合は0または空に。
 * @default 0
 *
 * @arg playerNameVariableId
 * @type variable
 * @text プレイヤー名変数ID
 * @desc 保存するプレイヤーの名前が格納されている変数ID。
 * @default 0
 *
 * @arg playerScoreVariableId
 * @type variable
 * @text プレイヤースコア変数ID
 * @desc 保存するプレイヤーのスコアが格納されている変数ID。
 * @default 0
 *
 * @arg successVariableId
 * @type variable
 * @text 成功時格納変数ID
 * @desc 保存成功時、APIからの返り値（status, message, idなど）を格納する変数ID。JSON文字列として格納されます。
 * @default 0
 *
 * @arg errorVariableId
 * @type variable
 * @text 失敗時格納変数ID
 * @desc エラーメッセージ（data.message部分）を格納する変数ID。
 * @default 0
 *
 * @arg successCommonEventId
 * @type common_event
 * @text 成功時コモンイベントID
 * @desc データ保存成功時に呼び出すコモンイベントのID。
 * @default 0
 *
 * @arg errorCommonEventId
 * @type common_event
 * @text 失敗時コモンイベントID
 * @desc データ保存失敗時に呼び出すコモンイベントのID。
 * @default 0
 */

(() => {
    const pluginName = "MyApiPlugin";
    const parameters = PluginManager.parameters(pluginName);
    const baseUrl = parameters.baseUrl;

    // 非同期処理を待機しつつイベントをブロックするための関数
    // RPGツクールMZのイベントは非同期処理をそのまま実行するとイベントが完了してしまうため
    const waitAsyncEvent = async (callback) => {
        const interpreter = $gameMap._interpreter;
        if (interpreter) {
            interpreter.setWaitMode("apiFetch");
            await callback();
            interpreter.setWaitMode("");
        } else {
            // マップ上でない場合（テストプレイのコンソールなど）
            await callback();
        }
    };

    // 結果を変数に格納するヘルパー関数
    const setVariable = (varId, value) => {
        if (varId > 0) {
            $gameVariables.setValue(varId, value);
        }
    };

    // コモンイベントを呼び出すヘルパー関数
    const callCommonEvent = (eventId) => {
        if (eventId > 0) {
            $gameTemp.reserveCommonEvent(eventId);
        }
    };

    // プレイヤーデータを取得するプラグインコマンド
    PluginManager.registerCommand(pluginName, "fetchPlayers", async (args) => {
        const url = `${baseUrl}?action=getPlayers`;
        const successVarId = Number(args.successVariableId || 0);
        const errorVarId = Number(args.errorVariableId || 0);
        const successCEId = Number(args.successCommonEventId || 0);
        const errorCEId = Number(args.errorCommonEventId || 0);

        await waitAsyncEvent(async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("APIからプレイヤーデータを取得しました:", data);

                if (data.status === 'success') {
                    setVariable(successVarId, JSON.stringify(data.data)); // data.data部分をJSON文字列として格納
                    callCommonEvent(successCEId);
                } else {
                    setVariable(errorVarId, data.message || "不明なエラー");
                    callCommonEvent(errorCEId);
                }
            } catch (error) {
                console.error("APIからのデータ取得に失敗しました:", error);
                setVariable(errorVarId, error.message || "ネットワークエラー");
                callCommonEvent(errorCEId);
            }
        });
    });

    // プレイヤーデータを保存するプラグインコマンド
    PluginManager.registerCommand(pluginName, "savePlayer", async (args) => {
        const playerId = Number(args.playerId || 0);
        const playerNameVarId = Number(args.playerNameVariableId || 0);
        const playerScoreVarId = Number(args.playerScoreVariableId || 0);
        const successVarId = Number(args.successVariableId || 0);
        const errorVarId = Number(args.errorVariableId || 0);
        const successCEId = Number(args.successCommonEventId || 0);
        const errorCEId = Number(args.errorCommonEventId || 0);

        const playerName = playerNameVarId > 0 ? $gameVariables.value(playerNameVarId) : '';
        const playerScore = playerScoreVarId > 0 ? $gameVariables.value(playerScoreVarId) : 0;

        // プレイヤー名とスコアは必須
        if (!playerName || playerScore === 0) { // スコアが0も弾くかは要検討。ここでは0は無効とする
            const errorMessage = "プレイヤー名とスコアは必須です。";
            console.error(errorMessage);
            setVariable(errorVarId, errorMessage);
            callCommonEvent(errorCEId);
            return;
        }

        const requestBody = {
            action: 'savePlayer',
            name: String(playerName), // 文字列として送信
            score: Number(playerScore) // 数値として送信
        };
        if (playerId > 0) {
            requestBody.id = playerId;
        }

        await waitAsyncEvent(async () => {
            try {
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log("プレイヤーデータを保存しました:", result);

                if (result.status === 'success') {
                    setVariable(successVarId, JSON.stringify(result)); // 全ての返り値をJSON文字列として格納
                    callCommonEvent(successCEId);
                } else {
                    setVariable(errorVarId, result.message || "不明なエラー");
                    callCommonEvent(errorCEId);
                }
            } catch (error) {
                console.error("プレイヤーデータの保存に失敗しました:", error);
                setVariable(errorVarId, error.message || "ネットワークエラー");
                callCommonEvent(errorCEId);
            }
        });
    });
})();