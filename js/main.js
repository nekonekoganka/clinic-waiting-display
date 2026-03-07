// ==========================================
//  設定エリア (ここを変更するだけで調整可能)
// ==========================================
const CONFIG = {
    // 画面切り替え時間（ミリ秒: 1000 = 1秒）
    durations: {
        main: 30000,          // メイン画面
        alert: 15000,         // 花粉注意画面
        tips: 15000,          // 対策ポイント(テキスト)
        billiard: 30000,      // ビリヤードロゴアニメーション
        multilang: 30000,     // 多言語グリッド画面
        clock: 15000,         // 時計画面
        weather: 15000,       // 天気予報画面
        weatherError: 3000,   // 天気予報エラー時
        uv: 10000,            // 紫外線情報画面
        sunExposure: 15000,   // 日光浴おすすめ画面
        logo: 25000,          // ロゴアニメーション（パーティクル）
        famicom: 15000,       // ファミコン風ロゴ
        slideshowDefault: 15000 // スライドショーのデフォルト表示時間（規則外ファイル用）
    },
    // レベルの重み付け（数値が大きいほど優先表示）
    levelOrder: { '多い': 3, 'やや多い': 2, '少ない': 1, '': 0 },
    // スライドショー設定ファイルのパス
    slideshowConfigPath: 'images/config.json',
    // 全体設定ファイルのパス
    settingsPath: 'settings.json'
};

// 外部設定（settings.jsonから読み込み）
let SETTINGS = null;

// ==========================================
//  花粉データ管理エリア
// ==========================================
const POLLEN_DATA = [
    {
        name: 'ハンノキ属',
        type: 'tree',
        schedule: { 1: '少ない', 2: '少ない', 3: '少ない', 4: '少ない', 5: '少ない', 6: '少ない' }
    },
    {
        name: 'スギ',
        type: 'tree',
        schedule: { 1: '少ない', 2: 'やや多い', 3: '多い', 4: '多い', 5: '少ない', 10: '少ない', 11: '少ない', 12: '少ない' }
    },
    {
        name: 'ヒノキ',
        type: 'tree',
        schedule: { 2: '少ない', 3: 'やや多い', 4: '多い', 5: 'やや多い', 6: '少ない' }
    },
    {
        name: 'イネ科',
        type: 'grass',
        schedule: { 4: '少ない', 5: 'やや多い', 6: '多い', 7: '少ない', 8: '少ない', 9: '少ない', 10: '少ない' }
    },
    {
        name: 'ブタクサ属',
        type: 'grass',
        schedule: { 8: 'やや多い', 9: '多い', 10: '少ない' }
    },
    {
        name: 'ヨモギ属',
        type: 'grass',
        schedule: { 8: '少ない', 9: '少ない', 10: '少ない' }
    },
    {
        name: 'カナムグラ',
        type: 'grass',
        schedule: { 8: '少ない', 9: 'やや多い', 10: 'やや多い', 11: '少ない' }
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const currentMonth = new Date().getMonth() + 1;

    // 花粉ごとのアイコンマッピング
    const pollenIcons = {
        'ハンノキ属': '🌳', 'スギ': '🌲', 'ヒノキ': '🎄',
        'イネ科': '🌾', 'ブタクサ属': '🌿', 'ヨモギ属': '🍃', 'カナムグラ': '🍀'
    };

    // 月ごとのアイコンマッピング
    const monthIcons = {
        1: '🎍', 2: '💝', 3: '🌸', 4: '🌷', 5: '🎏', 6: '☔',
        7: '🎋', 8: '🌻', 9: '🎑', 10: '🎃', 11: '🍁', 12: '🎄'
    };

    // ヘルパー関数
    function getLevelClass(level) {
        if (level === '多い') return 'high';
        if (level === 'やや多い') return 'medium';
        if (level === '少ない') return 'low';
        return '';
    }

    // テーブルの自動生成
    function renderTable() {
        const tbody = document.getElementById('pollen-table-body');
        tbody.innerHTML = ''; // クリア

        POLLEN_DATA.forEach(plant => {
            const tr = document.createElement('tr');
            
            // 植物名セル
            const nameTd = document.createElement('td');
            nameTd.className = 'plant-name';
            nameTd.scope = 'row';
            nameTd.textContent = plant.name;
            tr.appendChild(nameTd);

            // 1月〜12月のセル
            for (let m = 1; m <= 12; m++) {
                const td = document.createElement('td');
                td.dataset.month = m;
                
                const level = plant.schedule[m];
                if (level) {
                    const levelClass = getLevelClass(level);
                    td.className = `${plant.type}-${levelClass}`; // 例: tree-high
                    td.dataset.pollen = plant.name;
                    td.dataset.level = level;
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
    }

    // 今月の花粉データを取得（データソースから直接取得）
    function getCurrentMonthPollens() {
        const pollens = [];
        POLLEN_DATA.forEach(plant => {
            const level = plant.schedule[currentMonth];
            if (level) {
                pollens.push({
                    name: plant.name,
                    level: level,
                    type: plant.type,
                    levelClass: getLevelClass(level),
                    icon: pollenIcons[plant.name] || '🌼'
                });
            }
        });
        
        // レベルが高い順にソート
        pollens.sort((a, b) => (CONFIG.levelOrder[b.level] || 0) - (CONFIG.levelOrder[a.level] || 0));
        return pollens;
    }

    function highlightCurrentMonthColumn() {
        const header = document.getElementById(`month-${currentMonth}`);
        if (header) { header.classList.add('current-month-column'); }
        // 生成されたセルに対して適用
        document.querySelectorAll(`td[data-month="${currentMonth}"]`).forEach(cell => { 
            cell.classList.add('current-month-column'); 
        });
    }

    function displayCurrentMonthInfo() {
        const pollens = getCurrentMonthPollens();
        const titleElement = document.getElementById('current-month-title');
        const detailsContainer = document.getElementById('pollen-details');
        const monthName = `${currentMonth}月`;
        detailsContainer.innerHTML = '';
        
        if (pollens.length === 0) {
            titleElement.textContent = `！${monthName}は花粉の少ない時期です！`;
            const messageDiv = document.createElement('div');
            messageDiv.className = 'info-message';
            const p1 = document.createElement('p');
            p1.textContent = '現在は主要な花粉の飛散時期ではありません。';
            const p2 = document.createElement('p');
            p2.textContent = '比較的過ごしやすい時期ですが、お困りの際はお声がけください。';
            messageDiv.append(p1, p2);
            detailsContainer.appendChild(messageDiv);
        } else {
            const mainPollen = pollens[0];
            titleElement.textContent = `！${monthName}は「${mainPollen.name}」などに注意！`;
            pollens.forEach(p => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `pollen-item ${p.type}-${p.levelClass}`;
                if (p.level === '多い') {
                    itemDiv.classList.add('pollen-item-high-alert');
                }
                const nameSpan = document.createElement('span');
                nameSpan.className = 'pollen-item-name';
                nameSpan.textContent = p.name;
                const levelSpan = document.createElement('span');
                levelSpan.className = 'pollen-item-level';
                levelSpan.textContent = `【${p.level}】`;
                itemDiv.append(nameSpan, levelSpan);
                detailsContainer.appendChild(itemDiv);
            });
        }
    }

    // フルスクリーン花粉アラートを設定
    function setupPollenAlertScreen() {
        const pollens = getCurrentMonthPollens();
        const monthIcon = document.getElementById('pollen-alert-icon');
        const monthTitle = document.getElementById('pollen-alert-month');
        const listContainer = document.getElementById('pollen-alert-list');

        // 月別アイコンを設定
        monthIcon.textContent = monthIcons[currentMonth] || '🌼';
        monthTitle.textContent = `${currentMonth}月`;
        listContainer.innerHTML = '';

        pollens.forEach(p => {
            const item = document.createElement('div');
            item.className = 'pollen-alert-item';
            item.innerHTML = `
                <div class="pollen-alert-item-icon">${p.icon}</div>
                <div class="pollen-alert-item-info">
                    <div class="pollen-alert-item-name">${p.name}</div>
                    <div class="pollen-alert-item-level level-${p.levelClass}">${p.level}</div>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    // 時計表示の更新
    function updateClock() {
        const now = new Date();
        
        // 時計画面が表示されている時のみDOMを更新
        const clockScreen = document.getElementById('clock-screen');
        if (!clockScreen || !clockScreen.classList.contains('active')) {
            return; // 時計画面が非表示なら何もしない
        }
        
        // 時間の更新
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        document.getElementById('clock-time-display').innerHTML = 
            `<span class="number">${hours}</span><ruby>時<rt>じ</rt></ruby>` +
            `<span class="number">${minutes}</span><ruby>分<rt>ふん</rt></ruby>` +
            `<span class="seconds-number">${seconds}</span><ruby class="seconds-kanji">秒<rt>びょう</rt></ruby>`;
        
        // 日付の更新
        const month = now.getMonth() + 1;
        const date = now.getDate();

        document.getElementById('clock-date-display').innerHTML = 
            `<span class="number">${month}</span><ruby>月<rt>がつ</rt></ruby>` +
            `<span class="number">${date}</span><ruby>日<rt>にち</rt></ruby>`;

        // 曜日の更新
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const weekdayRuby = ['にちようび', 'げつようび', 'かようび', 'すいようび', 'もくようび', 'きんようび', 'どようび'];
        const dayOfWeek = now.getDay();
        
        document.getElementById('clock-weekday-main').textContent = weekdays[dayOfWeek];
        document.getElementById('clock-weekday-ruby').textContent = weekdayRuby[dayOfWeek];
    }

    // 画面切り替えローテーション
    let currentScreen = 0;
    let rotationTimeoutId = null;
    let fadeOutTimeoutId = null; // フェードアウト用タイマー
    let weatherDataLoaded = false; // 天気データ読み込み状態
    let slideshowImages = []; // スライドショー画像リスト

    // 基本の画面リスト（スライドショー画像は動的に追加）
    const baseScreens = [
        { id: null, duration: CONFIG.durations.main },                    // メイン画面
        { id: 'pollen-alert-screen', duration: CONFIG.durations.alert },  // 花粉アラート
        { id: 'tips-screen', duration: CONFIG.durations.tips },           // 対策ポイント(テキスト)
    ];

    // 後半の固定画面
    const endScreens = [
        { id: 'clock-screen', duration: CONFIG.durations.clock },         // 時計表示
        { id: 'weather-screen', duration: CONFIG.durations.weather },     // 天気予報
        { id: 'uv-screen', duration: CONFIG.durations.uv },               // 紫外線情報
        { id: 'sun-exposure-screen', duration: CONFIG.durations.sunExposure }, // 日光浴おすすめ
        { id: 'multilang-grid-screen', duration: CONFIG.durations.multilang }   // 多言語グリッド画面
    ];

    // スライドショー画像を含む全画面リスト
    let screens = [];

    // ファイル名から順番と表示秒数を解析
    // 形式1: {順番}_{秒数}_{分割数}_{説明}.{拡張子}  例: 6_20_3_花粉症ポスター.png（3分割）
    // 形式2: {順番}_{秒数}_{説明}.{拡張子}  例: 1_15_花粉症対策.png（従来形式）
    // 順番は小数点対応: 22.5_30_新画像.png → 22と23の間に挿入
    // CMマーカー: 説明部分が「_CM」で終わる場合、この画像の後にCMを挿入
    //            例: 5_30_フレイル予防_CM.png
    function parseImageFilename(filename) {
        // CMマーカーの検出（説明部分が_CMで終わるかチェック）
        const hasCM = /_CM\.(png|jpg|jpeg|gif|webp|pdf)$/i.test(filename);
        // CMマーカーを除去したファイル名で解析
        const cleanFilename = filename.replace(/_CM\./i, '.');

        // 分割数ありの形式をまずチェック（順番は小数点対応）
        const matchWithSplit = cleanFilename.match(/^(\d+(?:\.\d+)?)_(\d+)_(\d+)_(.+)\.(png|jpg|jpeg|gif|webp|pdf)$/i);
        if (matchWithSplit) {
            const ext = matchWithSplit[5].toLowerCase();
            return {
                order: parseFloat(matchWithSplit[1]),  // 小数点対応
                duration: parseInt(matchWithSplit[2]) * 1000, // 秒→ミリ秒
                splitCount: parseInt(matchWithSplit[3]),      // 分割数
                description: matchWithSplit[4],
                filename: filename,  // 元のファイル名を保持
                isPDF: ext === 'pdf',
                hasCM: hasCM         // CMマーカーフラグ
            };
        }

        // 従来形式（分割なし、順番は小数点対応）
        const match = cleanFilename.match(/^(\d+(?:\.\d+)?)_(\d+)_(.+)\.(png|jpg|jpeg|gif|webp|pdf)$/i);
        if (match) {
            const ext = match[4].toLowerCase();
            return {
                order: parseFloat(match[1]),  // 小数点対応
                duration: parseInt(match[2]) * 1000, // 秒→ミリ秒
                splitCount: 1,                       // 分割なし
                description: match[3],
                filename: filename,  // 元のファイル名を保持
                isPDF: ext === 'pdf',
                hasCM: hasCM         // CMマーカーフラグ
            };
        }
        // 形式が合わない場合はデフォルト値
        const ext = filename.split('.').pop().toLowerCase();
        return {
            order: 999,
            duration: CONFIG.durations.slideshowDefault,
            splitCount: 1,
            description: filename,
            filename: filename,
            isPDF: ext === 'pdf',
            hasCM: hasCM             // CMマーカーフラグ
        };
    }

    // 全体設定を読み込み
    async function loadSettings() {
        try {
            const response = await fetch(CONFIG.settingsPath);
            if (!response.ok) {
                console.log('settings.json が見つかりません。デフォルト設定を使用します。');
                return null;
            }
            const settings = await response.json();
            console.log('設定読み込み完了:', settings);
            return settings;
        } catch (error) {
            console.log('settings.json 読み込みエラー:', error);
            return null;
        }
    }

    // スライドショー設定を読み込み
    async function loadSlideshowConfig() {
        try {
            const response = await fetch(CONFIG.slideshowConfigPath);
            if (!response.ok) {
                console.log('スライドショー設定ファイルが見つかりません');
                return [];
            }
            const config = await response.json();
            if (config.images && Array.isArray(config.images)) {
                // 画像情報を解析してソート
                const parsed = config.images
                    .map(filename => parseImageFilename(filename))
                    .sort((a, b) => a.order - b.order);
                console.log('スライドショー画像:', parsed);
                return parsed;
            }
        } catch (error) {
            console.log('スライドショー設定読み込みエラー:', error);
        }
        return [];
    }

    // 画面リストを構築
    async function buildScreensList() {
        // 設定を読み込み
        SETTINGS = await loadSettings();
        slideshowImages = await loadSlideshowConfig();

        // スライドショー画像を画面リストに変換（分割対応）
        const slideshowScreens = [];
        slideshowImages.forEach(img => {
            const splitCount = img.splitCount || 1;
            for (let i = 0; i < splitCount; i++) {
                slideshowScreens.push({
                    id: 'slideshow-screen',
                    duration: img.duration,
                    slideshowImage: 'images/' + img.filename,
                    isPDF: img.isPDF || false,
                    splitCount: splitCount,
                    splitIndex: i,  // 0から始まる分割インデックス
                    // CMマーカーは最後の分割部分にのみ適用
                    hasCM: img.hasCM && (i === splitCount - 1)
                });
            }
        });

        // CM設定がある場合、_CMマーカーがある画像の後にCMを挿入
        let contentScreens = [];
        if (SETTINGS && SETTINGS.cm && SETTINGS.cm.enabled && slideshowScreens.length > 0) {
            const cmAnimations = (SETTINGS.cm.animations || []).filter(cm => cm.enabled);
            let cmIndex = 0;

            // スライドショー開始前にロゴアニメを挿入
            if (cmAnimations.length > 0) {
                const firstCm = cmAnimations[cmIndex % cmAnimations.length];
                if (firstCm.type === 'video' && firstCm.src) {
                    contentScreens.push({
                        id: 'video-cm-screen',
                        duration: firstCm.duration * 1000,
                        videoSrc: firstCm.src,
                        isCM: true
                    });
                } else {
                    contentScreens.push({
                        id: firstCm.id,
                        duration: firstCm.duration * 1000,
                        isCM: true,
                        pattern: firstCm.pattern // ビリヤード用パターン
                    });
                }
                cmIndex++;
            }

            slideshowScreens.forEach((slide, index) => {
                contentScreens.push(slide);

                // _CMマーカーがある画像の後にCMを挿入
                if (slide.hasCM && cmAnimations.length > 0) {
                    const cm = cmAnimations[cmIndex % cmAnimations.length];

                    // CMタイプに応じて画面データを作成
                    if (cm.type === 'video' && cm.src) {
                        // 動画CM
                        contentScreens.push({
                            id: 'video-cm-screen',
                            duration: cm.duration * 1000,
                            videoSrc: cm.src,
                            isCM: true
                        });
                    } else {
                        // HTMLアニメーションCM
                        contentScreens.push({
                            id: cm.id,
                            duration: cm.duration * 1000,
                            isCM: true,
                            pattern: cm.pattern // ビリヤード用パターン
                        });
                    }

                    // followedByがある場合、追加の画面を挿入
                    if (cm.followedBy) {
                        contentScreens.push({
                            id: cm.followedBy.id,
                            duration: cm.followedBy.duration * 1000,
                            isCM: true
                        });
                        console.log('followedBy挿入:', cm.followedBy.name);
                    }

                    cmIndex++;
                }
            });
            console.log('CM挿入完了: _CMマーカー方式, CM数=' + cmIndex);
        } else {
            // 設定がない場合は従来通り
            contentScreens = slideshowScreens;
        }

        // 後半画面からCMアニメーションを除外（CMとして挿入済みのため）
        let finalEndScreens = endScreens;
        if (SETTINGS && SETTINGS.cm && SETTINGS.cm.enabled) {
            const cmIds = (SETTINGS.cm.animations || []).filter(cm => cm.enabled).map(cm => cm.id);
            // billiard-line/billiard-multi が有効な場合、billiard-screen も除外
            const hasBilliardCM = cmIds.includes('billiard-line') || cmIds.includes('billiard-multi');
            finalEndScreens = endScreens.filter(screen => {
                if (screen.id === 'billiard-screen' && hasBilliardCM) {
                    return false; // ビリヤードCMが有効なら除外
                }
                return !cmIds.includes(screen.id);
            });
        }

        // 画面リストを構築: 基本画面 + コンテンツ(スライド+CM) + 後半画面
        screens = [...baseScreens, ...contentScreens, ...finalEndScreens];
        console.log('画面リスト構築完了:', screens.length, '画面');

        // 動画CMを事前バッファリング
        preloadVideoCMs();
    }

    function showScreen(index) {
        // すべてのオーバーレイを非表示
        document.querySelectorAll('.fullscreen-overlay').forEach(el => {
            el.classList.remove('active');
        });

        // 指定された画面を表示
        if (screens[index].id) {
            // billiard-line/billiard-multi は実際のHTML要素ID(billiard-screen)にマッピング
            let screenElementId = screens[index].id;
            if (screens[index].id === 'billiard-line' || screens[index].id === 'billiard-multi') {
                screenElementId = 'billiard-screen';
            }
            document.getElementById(screenElementId).classList.add('active');

            // スライドショー画面の場合は画像またはPDFを設定
            if (screens[index].id === 'slideshow-screen' && screens[index].slideshowImage) {
                const imgEl = document.getElementById('slideshow-image');
                const pdfEl = document.getElementById('slideshow-pdf');
                const splitCount = screens[index].splitCount || 1;
                const splitIndex = screens[index].splitIndex || 0;

                if (screens[index].isPDF) {
                    // PDFファイルの場合（分割非対応、そのまま表示）
                    imgEl.style.display = 'none';
                    imgEl.classList.remove('split-view');
                    // フェードイン効果
                    pdfEl.classList.add('fade-out');
                    pdfEl.src = screens[index].slideshowImage;
                    pdfEl.style.display = 'block';
                    // 少し遅延してフェードイン
                    setTimeout(() => pdfEl.classList.remove('fade-out'), 50);
                } else {
                    // 画像ファイルの場合
                    pdfEl.style.display = 'none';
                    pdfEl.src = '';

                    // フェードイン効果: まず透明にしてから画像を設定
                    imgEl.classList.add('fade-out');
                    imgEl.src = screens[index].slideshowImage;
                    imgEl.alt = screens[index].slideshowImage;
                    imgEl.style.display = 'block';

                    // 分割表示の設定
                    if (splitCount > 1) {
                        imgEl.classList.add('split-view');
                        // object-positionで表示位置を制御
                        // 縦方向の位置を％で計算（上部=0%, 下部=100%）
                        const positionPercent = (splitIndex / (splitCount - 1)) * 100;
                        imgEl.style.objectPosition = `center ${positionPercent}%`;
                    } else {
                        imgEl.classList.remove('split-view');
                        imgEl.style.objectPosition = 'center center';
                    }

                    // 画像読み込み完了後にフェードイン
                    imgEl.onload = () => {
                        imgEl.classList.remove('fade-out');
                    };
                    // 既にキャッシュされている場合のフォールバック
                    if (imgEl.complete) {
                        setTimeout(() => imgEl.classList.remove('fade-out'), 50);
                    }
                }
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
            } else if (screens[index].id === 'video-cm-screen' && screens[index].videoSrc) {
                // 動画CM画面
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                startVideoCM(screens[index].videoSrc);
            } else if (screens[index].id === 'logo-animation-screen') {
                // ロゴアニメーション画面
                startParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
            } else if (screens[index].id === 'billiard-screen' || screens[index].id === 'billiard-line' || screens[index].id === 'billiard-multi') {
                // ビリヤードアニメーション画面（横1列・横3行両対応）
                stopParticleAnimation();
                stopBilliardAnimation(); // 前のビリヤードアニメーションを確実に停止
                startBilliardAnimation(screens[index].pattern);
                stopFamicomAnimation();
                stopVideoCM();
            } else if (screens[index].id === 'famicom-logo-screen') {
                // ファミコン風ロゴ画面
                stopParticleAnimation();
                stopBilliardAnimation();
                startFamicomAnimation();
                stopVideoCM();
            } else if (screens[index].id === 'weather-screen') {
                // 天気予報画面
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
                updateWeatherScreenBackground(); // 時間帯に応じた背景に変更
                fetchWeatherData();
            } else if (screens[index].id === 'uv-screen') {
                // 紫外線情報画面
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
                updateUVScreen();
            } else if (screens[index].id === 'sun-exposure-screen') {
                // 日光浴おすすめ画面
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
                updateSunExposureScreen();
            } else if (screens[index].id === 'multilang-grid-screen') {
                // 多言語グリッド画面
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
                resetMultilangAnimation();
            } else {
                // その他の画面ではアニメーションを停止
                stopParticleAnimation();
                stopBilliardAnimation();
                stopFamicomAnimation();
                stopVideoCM();
            }
        } else {
            // メイン画面の場合もアニメーションを停止
            stopParticleAnimation();
            stopBilliardAnimation();
            stopFamicomAnimation();
            stopVideoCM();
        }
    }

    // スライドショー画像のフェードアウト処理
    function fadeOutSlideshow() {
        const imgEl = document.getElementById('slideshow-image');
        const pdfEl = document.getElementById('slideshow-pdf');
        if (imgEl) imgEl.classList.add('fade-out');
        if (pdfEl) pdfEl.classList.add('fade-out');
    }

    function rotateScreens() {
        showScreen(currentScreen);

        // 天気予報画面でデータ未取得の場合は3秒で次へ
        let duration = screens[currentScreen].duration;
        if (screens[currentScreen].id === 'weather-screen' && !weatherDataLoaded) {
            duration = CONFIG.durations.weatherError;
        }

        // スライドショー画面の場合、切り替え0.25秒前にフェードアウト開始
        const fadeOutDelay = 250; // フェードアウトにかかる時間(ms)
        if (screens[currentScreen].id === 'slideshow-screen') {
            fadeOutTimeoutId = setTimeout(() => {
                fadeOutSlideshow();
            }, duration - fadeOutDelay);
        }

        // 次の画面がスライドショーなら画像を先読み
        const nextIndex = (currentScreen + 1) % screens.length;
        if (screens[nextIndex] && screens[nextIndex].id === 'slideshow-screen' && screens[nextIndex].slideshowImage) {
            const preloadImg = new Image();
            preloadImg.src = screens[nextIndex].slideshowImage;
        }

        rotationTimeoutId = setTimeout(() => {
            currentScreen = (currentScreen + 1) % screens.length;

            // ロゴアニメーション(最後の画面)が終わったら、ページをリロード
            if (currentScreen === 0) {
                location.reload();
                return; // リロード後は処理を続けない
            }

            rotateScreens();
        }, duration);
    }

    // スペースキーで次の画面に切り替え
    function goToNextScreen() {
        // 現在のタイマーをすべてクリア
        if (rotationTimeoutId) {
            clearTimeout(rotationTimeoutId);
        }
        if (fadeOutTimeoutId) {
            clearTimeout(fadeOutTimeoutId);
        }
        // 次の画面へ
        currentScreen = (currentScreen + 1) % screens.length;
        // ローテーション再開
        rotateScreens();
    }

    // スペースキーのイベントリスナー
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // スクロール防止
            goToNextScreen();
        }
    });

    // ========== ビリヤードロゴアニメーション ==========
    const billiardBalls = [];
    const billiardCueBall = document.getElementById('billiard-cue-ball');
    const billiardCueStick = document.getElementById('billiard-cue-stick');
    const billiardImpact = document.getElementById('billiard-impact');
    const billiardShineLine = document.getElementById('billiard-shine-line');
    const billiardSparkles = [
        document.getElementById('billiard-sparkle1'),
        document.getElementById('billiard-sparkle2'),
        document.getElementById('billiard-sparkle3'),
        document.getElementById('billiard-sparkle4'),
        document.getElementById('billiard-sparkle5')
    ];
    
    const billiardTableWidth = 1920;
    const billiardTableHeight = 1080;
    const billiardPadding = 80;
    
    // ナインボールのダイヤモンド配置（物理的な位置）
    const billiardRackSlots = [
        { x: 1050, y: 540 },
        { x: 1200, y: 440 },
        { x: 1200, y: 640 },
        { x: 1350, y: 340 },
        { x: 1350, y: 540 },
        { x: 1350, y: 740 },
        { x: 1500, y: 440 },
        { x: 1500, y: 640 },
        { x: 1650, y: 540 },
    ];
    
    // シャッフルマップ
    const billiardShuffleMap = [2, 7, 5, 6, 0, 3, 8, 1, 4];
    
    // 手玉の位置
    const billiardCueBallStart = { x: 300, y: 540 };
    const billiardCueBallImpactPos = { x: 950, y: 540 };
    
    // 横一列の位置（奇数回目用）
    const billiardLinePositions = [];
    const billiardLineStartX = 160;
    const billiardLineSpacing = 190;
    for (let i = 0; i < 9; i++) {
        billiardLinePositions.push({ x: billiardLineStartX + i * billiardLineSpacing, y: 540 });
    }
    
    // 3行配置の位置（偶数回目用）
    const billiardMultiLinePositions = [
        { x: 660, y: 340 }, { x: 850, y: 340 }, { x: 1040, y: 340 }, { x: 1230, y: 340 },
        { x: 755, y: 540 }, { x: 945, y: 540 }, { x: 1135, y: 540 },
        { x: 850, y: 740 }, { x: 1040, y: 740 },
    ];
    
    let billiardCurrentFinalPositions = billiardLinePositions;
    let billiardIsLinePattern = false;
    let billiardBallPaths = [];
    let billiardAnimationPhase = 'init';
    let billiardPhaseStartTime = 0;
    let billiardAnimationId = null;
    let billiardStartTime = 0;
    let billiardShineTriggered = false;
    let isBilliardAnimating = false;
    let billiardPattern = 'line'; // 'line' or 'multi'
    
    function billiardGenerateReflectionPath(startPos, endPos, reflections) {
        const path = [{ x: startPos.x, y: startPos.y }];
        for (let i = 0; i < reflections; i++) {
            let nextX, nextY;
            const wallChoice = Math.floor(Math.random() * 4);
            switch (wallChoice) {
                case 0: nextX = billiardPadding + Math.random() * (billiardTableWidth - billiardPadding * 2); nextY = billiardPadding; break;
                case 1: nextX = billiardPadding + Math.random() * (billiardTableWidth - billiardPadding * 2); nextY = billiardTableHeight - billiardPadding; break;
                case 2: nextX = billiardPadding; nextY = billiardPadding + Math.random() * (billiardTableHeight - billiardPadding * 2); break;
                case 3: nextX = billiardTableWidth - billiardPadding; nextY = billiardPadding + Math.random() * (billiardTableHeight - billiardPadding * 2); break;
            }
            path.push({ x: nextX, y: nextY });
        }
        path.push({ x: endPos.x, y: endPos.y });
        return path;
    }
    
    function billiardGenerateAllPaths() {
        billiardBallPaths = [];
        for (let i = 0; i < 9; i++) {
            const startSlot = billiardShuffleMap[i];
            const startPos = billiardRackSlots[startSlot];
            const endPos = billiardCurrentFinalPositions[i];
            const reflections = 2 + Math.floor(Math.random() * 3);
            const path = billiardGenerateReflectionPath(startPos, endPos, reflections);
            billiardBallPaths.push(path);
        }
    }
    
    function billiardGetPositionOnPath(path, progress) {
        if (progress <= 0) return path[0];
        if (progress >= 1) return path[path.length - 1];
        const segments = [];
        let totalLength = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            const length = Math.sqrt(dx * dx + dy * dy);
            segments.push(length);
            totalLength += length;
        }
        const targetLength = progress * totalLength;
        let currentLength = 0;
        for (let i = 0; i < segments.length; i++) {
            if (currentLength + segments[i] >= targetLength) {
                const segmentProgress = (targetLength - currentLength) / segments[i];
                return {
                    x: path[i].x + (path[i + 1].x - path[i].x) * segmentProgress,
                    y: path[i].y + (path[i + 1].y - path[i].y) * segmentProgress
                };
            }
            currentLength += segments[i];
        }
        return path[path.length - 1];
    }
    
    function billiardTriggerShineEffect() {
        if (billiardIsLinePattern) {
            billiardShineLine.style.top = '390px';
            billiardShineLine.style.height = '300px';
        } else {
            billiardShineLine.style.top = '240px';
            billiardShineLine.style.height = '600px';
        }
        billiardShineLine.classList.add('animate');
        
        let sparklePositions;
        if (billiardIsLinePattern) {
            sparklePositions = [
                { x: 250, y: 450, delay: 100 }, { x: 550, y: 500, delay: 200 },
                { x: 900, y: 440, delay: 150 }, { x: 1300, y: 490, delay: 250 }, { x: 1650, y: 460, delay: 300 }
            ];
        } else {
            sparklePositions = [
                { x: 750, y: 280, delay: 100 }, { x: 1140, y: 280, delay: 180 },
                { x: 850, y: 480, delay: 250 }, { x: 750, y: 680, delay: 320 }, { x: 1140, y: 680, delay: 400 }
            ];
        }
        billiardSparkles.forEach((sparkle, i) => {
            sparkle.style.left = `${sparklePositions[i].x}px`;
            sparkle.style.top = `${sparklePositions[i].y}px`;
            setTimeout(() => { sparkle.classList.add('animate'); }, sparklePositions[i].delay);
        });
    }
    
    function billiardResetShineEffect() {
        billiardShineLine.classList.remove('animate');
        billiardSparkles.forEach(sparkle => { sparkle.classList.remove('animate'); });
        billiardShineTriggered = false;
    }
    
    function billiardEaseOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    function initBilliardBalls() {
        billiardBalls.length = 0;
        for (let i = 1; i <= 9; i++) {
            billiardBalls.push(document.getElementById(`billiard-ball-${i}`));
        }
    }
    
    function resetBilliardAnimation() {
        if (billiardAnimationId) {
            cancelAnimationFrame(billiardAnimationId);
        }

        // patternに基づいてレイアウトを決定（交互切り替えではなく固定）
        billiardIsLinePattern = (billiardPattern === 'line');
        billiardCurrentFinalPositions = billiardIsLinePattern ? billiardLinePositions : billiardMultiLinePositions;
        
        billiardGenerateAllPaths();
        
        billiardBalls.forEach((ball, i) => {
            const startSlot = billiardShuffleMap[i];
            ball.style.left = `${billiardRackSlots[startSlot].x}px`;
            ball.style.top = `${billiardRackSlots[startSlot].y}px`;
            ball.style.opacity = '1';
        });
        
        billiardCueBall.style.left = `${billiardCueBallStart.x}px`;
        billiardCueBall.style.top = `${billiardCueBallStart.y}px`;
        billiardCueBall.style.opacity = '1';
        billiardCueStick.style.opacity = '0';
        billiardImpact.classList.remove('show');
        billiardResetShineEffect();
        
        billiardAnimationPhase = 'init';
        billiardStartTime = performance.now();
        billiardPhaseStartTime = billiardStartTime;
    }
    
    function animateBilliard() {
        if (!isBilliardAnimating) return;
        
        const now = performance.now();
        const elapsed = (now - billiardStartTime) / 1000;
        const phaseElapsed = (now - billiardPhaseStartTime) / 1000;
        
        if (elapsed >= 15) {
            resetBilliardAnimation();
            animateBilliard();
            return;
        }
        
        if (elapsed >= 12.5 && !billiardShineTriggered) {
            billiardTriggerShineEffect();
            billiardShineTriggered = true;
        }
        
        switch (billiardAnimationPhase) {
            case 'init':
                if (phaseElapsed > 2) {
                    billiardCueStick.style.opacity = '1';
                    billiardCueStick.style.left = '-250px';
                    billiardCueStick.style.top = '532px';
                    const pullProgress = Math.min((phaseElapsed - 2) / 1, 1);
                    billiardCueStick.style.left = `${-250 - pullProgress * 100}px`;
                }
                if (phaseElapsed >= 3) {
                    billiardAnimationPhase = 'break';
                    billiardPhaseStartTime = now;
                }
                break;
                
            case 'break':
                const breakProgress = Math.min(phaseElapsed / 0.2, 1);
                billiardCueStick.style.left = `${-350 + breakProgress * 250}px`;
                if (breakProgress >= 0.5) billiardCueStick.style.opacity = '0';
                
                const cueBallX = billiardCueBallStart.x + breakProgress * (billiardCueBallImpactPos.x - billiardCueBallStart.x);
                billiardCueBall.style.left = `${cueBallX}px`;
                
                if (cueBallX >= billiardCueBallImpactPos.x - 50 && !billiardImpact.classList.contains('show')) {
                    billiardImpact.style.left = `${billiardCueBallImpactPos.x}px`;
                    billiardImpact.style.top = `${billiardCueBallImpactPos.y}px`;
                    billiardImpact.classList.add('show');
                    billiardCueBall.style.opacity = '0';
                    billiardAnimationPhase = 'reflect';
                    billiardPhaseStartTime = now;
                }
                break;
                
            case 'reflect':
                const reflectProgress = Math.min(phaseElapsed / 8, 1);
                billiardBalls.forEach((ball, i) => {
                    const speedVariation = 0.9 + (i % 3) * 0.05;
                    const adjustedProgress = Math.min(reflectProgress * speedVariation, 1);
                    const easedProgress = billiardEaseOutCubic(adjustedProgress);
                    const pos = billiardGetPositionOnPath(billiardBallPaths[i], easedProgress);
                    ball.style.left = `${pos.x}px`;
                    ball.style.top = `${pos.y}px`;
                });
                
                if (reflectProgress >= 1) {
                    billiardAnimationPhase = 'hold';
                    billiardPhaseStartTime = now;
                    billiardBalls.forEach((ball, i) => {
                        ball.style.left = `${billiardCurrentFinalPositions[i].x}px`;
                        ball.style.top = `${billiardCurrentFinalPositions[i].y}px`;
                    });
                }
                break;
                
            case 'hold':
                if (elapsed >= 14) {
                    billiardAnimationPhase = 'fadeOut';
                    billiardPhaseStartTime = now;
                }
                break;
                
            case 'fadeOut':
                const fadeProgress = Math.min(phaseElapsed / 1, 1);
                billiardBalls.forEach(ball => { ball.style.opacity = 1 - fadeProgress; });
                if (fadeProgress >= 1) billiardAnimationPhase = 'done';
                break;
                
            case 'done':
                break;
        }
        
        billiardAnimationId = requestAnimationFrame(animateBilliard);
    }
    
    function startBilliardAnimation(pattern) {
        if (isBilliardAnimating) return;
        isBilliardAnimating = true;
        billiardPattern = pattern || 'line'; // デフォルトは横1列
        initBilliardBalls();
        resetBilliardAnimation();
        animateBilliard();
    }
    
    function stopBilliardAnimation() {
        if (billiardAnimationId) {
            cancelAnimationFrame(billiardAnimationId);
            billiardAnimationId = null;
        }
        isBilliardAnimating = false;
    }

    // ========== パーティクルロゴアニメーション (省略: 前回のコードと同じ) ==========
    const textPixelData = [
        [20,[[20,28],[39,41],[50,53],[59,67],[79,87],[90,98]]],
        [21,[[20,28],[39,41],[50,53],[59,67],[79,87],[90,98]]],
        [22,[[20,28],[39,41],[48,48],[52,54],[59,68],[79,79],[83,84],[87,88],[96,98]]],
        [23,[[25,28],[39,41],[48,48],[52,54],[65,67],[79,79],[83,84],[87,88],[96,98]]],
        [24,[[26,28],[39,41],[50,51],[65,67],[72,73],[79,88],[91,92],[95,97]]],
        [25,[[23,26],[39,41],[50,51],[65,67],[72,73],[79,88],[91,92],[94,97]]],
        [26,[[23,26],[39,41],[65,67],[72,73],[79,80],[83,84],[87,88],[93,95]]],
        [27,[[23,24],[39,41],[65,67],[72,73],[79,79],[83,84],[87,88],[93,96]]],
        [28,[[23,24],[39,41],[61,73],[79,80],[83,84],[86,88],[90,99]]],
        [29,[[17,19],[23,26],[31,32],[39,41],[59,73],[79,88],[90,99]]],
        [30,[[17,19],[23,26],[31,32],[39,41],[59,74],[82,84],[92,94],[97,99]]],
        [31,[[17,19],[24,28],[31,34],[39,41],[51,53],[57,60],[64,66],[71,75],[83,84],[93,94],[97,99]]],
        [32,[[16,19],[25,28],[32,34],[39,41],[51,53],[57,60],[64,66],[72,75],[79,87],[93,94],[97,98]]],
        [33,[[15,19],[26,28],[32,34],[39,41],[51,53],[57,59],[64,65],[72,75],[79,87],[93,94],[97,98]]],
        [34,[[15,18],[26,28],[32,34],[39,41],[49,53],[57,59],[62,65],[70,73],[79,86],[93,94]]],
        [35,[[15,18],[26,28],[32,34],[39,43],[49,53],[57,59],[62,65],[70,72],[83,84],[93,94]]],
        [36,[[15,18],[20,28],[32,34],[40,51],[59,65],[68,72],[83,84],[93,94]]],
        [37,[[20,26],[40,51],[59,63],[67,72],[78,87],[92,94]]],
        [38,[[20,26],[42,49],[59,63],[67,70],[78,87],[90,94]]],
        [39,[[90,94]]],
        [45,[[50,53],[74,77]]],
        [46,[[17,24],[29,32],[50,53],[74,77],[85,91]]],
        [47,[[17,24],[29,32],[50,53],[74,77],[85,91]]],
        [48,[[17,24],[30,32],[50,53],[63,65],[74,77],[85,91]]],
        [49,[[17,24],[30,35],[45,53],[63,65],[74,77],[85,91]]],
        [50,[[21,23],[30,35],[44,59],[63,66],[74,77],[89,91]]],
        [51,[[20,23],[32,37],[44,60],[64,66],[74,77],[89,92]]],
        [52,[[19,22],[32,38],[44,60],[64,67],[74,77],[89,93]]],
        [53,[[19,22],[32,38],[49,52],[58,60],[64,67],[74,77],[89,93]]],
        [54,[[18,20],[32,38],[49,52],[58,60],[64,67],[74,77],[80,81],[89,93]]],
        [55,[[17,20],[32,34],[37,38],[49,52],[58,60],[65,69],[74,77],[80,81],[89,93]]],
        [56,[[17,20],[32,34],[37,38],[48,51],[58,60],[66,69],[74,81],[89,93]]],
        [57,[[17,20],[32,34],[48,50],[58,60],[66,69],[74,81],[89,93]]],
        [58,[[17,20],[32,34],[48,50],[58,60],[66,69],[74,79],[89,93]]],
        [59,[[17,20],[32,34],[47,50],[58,60],[89,93]]],
        [60,[[17,20],[31,34],[47,50],[58,60],[87,91]]],
        [61,[[17,21],[31,34],[46,49],[57,60],[87,91]]],
        [62,[[17,22],[29,34],[45,49],[56,60],[84,90]]],
        [63,[[19,33],[45,48],[52,59],[78,90]]],
        [64,[[19,32],[44,48],[52,59],[78,90]]],
        [65,[[21,31],[44,47],[52,59],[78,88]]],
        [66,[[21,30],[44,46],[52,57],[78,85]]],
        [71,[[66,69],[81,83]]],
        [72,[[29,38],[41,53],[59,69],[81,83]]],
        [73,[[29,38],[41,53],[59,69],[73,77],[81,83]]],
        [74,[[29,38],[41,43],[51,53],[59,69],[73,77],[81,83]]],
        [75,[[29,31],[36,38],[41,43],[51,53],[63,66],[73,78],[81,83]]],
        [76,[[29,31],[36,38],[41,43],[51,53],[64,66],[75,78],[81,83]]],
        [77,[[29,31],[36,38],[41,53],[64,66],[76,78],[81,83]]],
        [78,[[29,38],[41,53],[59,70],[81,83]]],
        [79,[[29,38],[41,43],[51,53],[59,70],[72,75],[81,83]]],
        [80,[[29,38],[41,43],[51,53],[59,70],[72,76],[81,83]]],
        [81,[[29,31],[36,38],[41,43],[51,53],[64,66],[72,77],[81,83]]],
        [82,[[29,31],[36,38],[41,53],[64,67],[74,77],[81,83]]],
        [83,[[29,31],[36,38],[41,53],[63,68],[81,83]]],
        [84,[[29,38],[41,43],[45,49],[52,53],[61,70],[81,85]]],
        [85,[[29,38],[41,42],[46,48],[52,53],[61,70],[81,86]]],
        [86,[[29,38],[41,42],[46,48],[51,54],[60,70],[72,86]]],
        [87,[[29,31],[36,38],[41,42],[47,54],[59,66],[69,70],[72,86]]],
        [88,[[29,31],[36,38],[41,42],[47,53],[59,62],[64,66],[72,83]]],
        [89,[[29,31],[36,38],[41,42],[47,51],[59,61],[64,66],[81,83]]],
        [90,[[29,31],[35,38],[41,42],[48,51],[59,60],[64,66],[81,83]]],
        [91,[[29,38],[41,43],[45,47],[49,52],[64,66],[81,83]]],
        [92,[[29,38],[40,47],[49,54],[64,66],[81,83]]],
        [93,[[29,38],[40,47],[51,54],[64,66],[81,83]]],
        [94,[[40,45],[51,54],[64,66],[81,83]]]
    ];

    const particleCanvas = document.getElementById('particleCanvas');
    const particleCtx = particleCanvas.getContext('2d');
    
    particleCanvas.width = 1200;
    particleCanvas.height = 1200;
    
    const scale = 1200 / 1024;
    const blockSize = 9 * scale;
    
    // 文字座標を取得
    const targetPositions = [];
    textPixelData.forEach(([gridY, segments]) => {
        segments.forEach(([startGridX, endGridX]) => {
            for (let gridX = startGridX; gridX <= endGridX; gridX++) {
                if ((gridX + gridY) % 3 === 0) {
                    targetPositions.push({
                        x: gridX * blockSize + blockSize / 2,
                        y: gridY * blockSize + blockSize / 2
                    });
                }
            }
        });
    });
    
    const LOOP_DURATION = 25000;

    // 日時テキストのピクセル座標を動的生成
    function generateDateTimePixels(particleCount) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const dateText = `${month}月${day}日`;
        const timeText = `${hours}:${minutes}`;

        const offCanvas = document.createElement('canvas');
        offCanvas.width = particleCanvas.width;
        offCanvas.height = particleCanvas.height;
        const offCtx = offCanvas.getContext('2d');

        // 日付と時刻を2行で描画
        offCtx.fillStyle = 'white';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        // 1行目: 日付
        offCtx.font = 'bold 120px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
        offCtx.fillText(dateText, offCanvas.width / 2, offCanvas.height / 2 - 80);

        // 2行目: 時刻
        offCtx.font = 'bold 140px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
        offCtx.fillText(timeText, offCanvas.width / 2, offCanvas.height / 2 + 100);

        // ピクセルデータを読み取り、座標を抽出
        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const allPositions = [];
        const step = 4; // サンプリング間隔
        for (let y = 0; y < offCanvas.height; y += step) {
            for (let x = 0; x < offCanvas.width; x += step) {
                const idx = (y * offCanvas.width + x) * 4;
                if (imageData.data[idx + 3] > 128) {
                    allPositions.push({ x, y });
                }
            }
        }

        // パーティクル数に合わせて調整
        if (allPositions.length <= particleCount) {
            return allPositions;
        }
        // 均等にサンプリング
        const result = [];
        const ratio = allPositions.length / particleCount;
        for (let i = 0; i < particleCount; i++) {
            result.push(allPositions[Math.floor(i * ratio)]);
        }
        return result;
    }

    // 日時テキスト用の座標（アニメーション開始時に計算）
    let dateTimePositions = [];

    // グラデーションをキャッシュ
    const gradientCache = {};
    function getGradient(size, alpha) {
        const key = `${size}_${Math.round(alpha * 10)}`;
        if (!gradientCache[key]) {
            const grad = particleCtx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
            grad.addColorStop(0, `rgba(255, 230, 150, ${alpha})`);
            grad.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.9})`);
            grad.addColorStop(0.6, `rgba(255, 170, 50, ${alpha * 0.6})`);
            grad.addColorStop(1, 'rgba(255, 140, 0, 0)');
            gradientCache[key] = grad;
        }
        return gradientCache[key];
    }
    
    // パーティクルクラス
    // フェーズ定義:
    //   0-3秒:    日時形成（出現して日時テキストに集合）
    //   3-8秒:    日時維持（微揺れ）
    //   8-13秒:   遷移（日時→クリニック名に再集合）
    //   13-21秒:  クリニック名維持（微揺れ）
    //   21-25秒:  散開（フェードアウト）
    class Particle {
        constructor(targetX, targetY, index) {
            this.index = index;
            this.targetX = targetX;
            this.targetY = targetY;
            this.dateTimeX = null;
            this.dateTimeY = null;
            this.hasDateTimeTarget = false;
            this.reset();
        }

        reset() {
            this.startX = Math.random() * particleCanvas.width;
            this.startY = Math.random() * particleCanvas.height;
            this.x = this.startX;
            this.y = this.startY;

            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.floatOffset = Math.random() * Math.PI * 2;

            this.size = Math.random() * 1.5 + 2;
            this.dynamicSize = this.size;
            this.alpha = 0;
            this.brightness = 0;

            this.flickerSpeed = Math.random() * 0.003 + 0.002;
            this.flickerOffset = Math.random() * Math.PI * 2;

            this.appearDelay = this.index * 2;
            this.gatherDelay = Math.random() * 800;
            this.transitionDelay = Math.random() * 800;
            this.angle = Math.atan2(this.startY - this.targetY, this.startX - this.targetX);
        }

        setDateTimeTarget(x, y) {
            this.dateTimeX = x;
            this.dateTimeY = y;
            this.hasDateTimeTarget = true;
        }

        clearDateTimeTarget() {
            this.dateTimeX = null;
            this.dateTimeY = null;
            this.hasDateTimeTarget = false;
        }

        update(elapsed) {
            this.brightness = 0.8 + Math.sin(elapsed * this.flickerSpeed + this.flickerOffset) * 0.2;

            // フェーズ1: 日時形成 (0-3秒)
            if (elapsed < 3000) {
                if (elapsed > this.appearDelay) {
                    this.alpha = Math.min(1, (elapsed - this.appearDelay) / 800);
                }
                if (this.hasDateTimeTarget) {
                    const p = Math.min(1, elapsed / 3000);
                    const eased = 1 - Math.pow(1 - p, 3);
                    this.x += (this.dateTimeX - this.x) * eased * 0.15;
                    this.y += (this.dateTimeY - this.y) * eased * 0.15;
                    this.dynamicSize = this.size * (1 + eased * 2);
                } else {
                    this.x += this.vx + Math.sin(elapsed * 0.001 + this.floatOffset) * 0.3;
                    this.y += this.vy + Math.cos(elapsed * 0.001 + this.floatOffset) * 0.3;
                    if (this.x < 0 || this.x > particleCanvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > particleCanvas.height) this.vy *= -1;
                    this.dynamicSize = this.size;
                }

            // フェーズ2: 日時維持 (3-8秒)
            } else if (elapsed < 8000) {
                this.alpha = 1;
                if (this.hasDateTimeTarget) {
                    const wobble = Math.sin(elapsed * 0.002 + this.floatOffset) * 0.8;
                    this.x = this.dateTimeX + wobble;
                    this.y = this.dateTimeY + Math.cos(elapsed * 0.0025 + this.floatOffset) * 0.8;
                    this.dynamicSize = this.size * 3;
                } else {
                    this.x += this.vx * 0.3 + Math.sin(elapsed * 0.001 + this.floatOffset) * 0.2;
                    this.y += this.vy * 0.3 + Math.cos(elapsed * 0.001 + this.floatOffset) * 0.2;
                    if (this.x < 0 || this.x > particleCanvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > particleCanvas.height) this.vy *= -1;
                    this.dynamicSize = this.size;
                }

            // フェーズ3: 遷移 日時→クリニック名 (8-13秒)
            } else if (elapsed < 13000) {
                const t = elapsed - 8000;
                if (t >= this.transitionDelay) {
                    const p = Math.min(1, (t - this.transitionDelay) / (5000 - this.transitionDelay));
                    const eased = 1 - Math.pow(1 - p, 3);
                    this.x += (this.targetX - this.x) * eased * 0.12;
                    this.y += (this.targetY - this.y) * eased * 0.12;
                    this.dynamicSize = this.size * (1 + eased * 2);
                } else {
                    if (this.hasDateTimeTarget) {
                        const wobble = Math.sin(elapsed * 0.002 + this.floatOffset) * 0.8;
                        this.x = this.dateTimeX + wobble;
                        this.y = this.dateTimeY + Math.cos(elapsed * 0.0025 + this.floatOffset) * 0.8;
                    } else {
                        this.x += this.vx * 0.3;
                        this.y += this.vy * 0.3;
                    }
                    this.dynamicSize = this.size * 2;
                }
                this.alpha = 1;

            // フェーズ4: クリニック名維持 (13-21秒)
            } else if (elapsed < 21000) {
                const wobble = Math.sin(elapsed * 0.002 + this.floatOffset) * 0.8;
                this.x = this.targetX + wobble;
                this.y = this.targetY + Math.cos(elapsed * 0.0025 + this.floatOffset) * 0.8;
                this.dynamicSize = this.size * 3;
                this.alpha = 1;

            // フェーズ5: 散開 (21-25秒)
            } else {
                const p = (elapsed - 21000) / 4000;
                const eased = p * p;
                const distance = 500 * eased;
                this.x = this.targetX + Math.cos(this.angle) * distance;
                this.y = this.targetY + Math.sin(this.angle) * distance;
                this.dynamicSize = this.size * (3 - 2 * eased);
                this.alpha = 1 - eased;
            }
        }
        
        draw(ctx) {
            if (this.alpha <= 0.05) return;
            
            const finalAlpha = this.alpha * this.brightness;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            
            ctx.fillStyle = getGradient(this.dynamicSize, finalAlpha);
            ctx.fillRect(-this.dynamicSize * 3, -this.dynamicSize * 3, this.dynamicSize * 6, this.dynamicSize * 6);
            
            ctx.globalAlpha = finalAlpha;
            ctx.fillStyle = 'rgb(255, 240, 200)';
            ctx.beginPath();
            ctx.arc(0, 0, this.dynamicSize * 0.6, 0, 6.28);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // パーティクルを生成
    const particles = targetPositions.map((pos, i) => new Particle(pos.x, pos.y, i));
    
    let particleStartTime = null;
    let particleAnimationId = null;
    let isParticleAnimating = false;
    
    function resetParticleAnimation() {
        particleStartTime = Date.now();
        particles.forEach(p => p.reset());

        // 日時テキストのピクセル座標を生成し、パーティクルに割り当て
        dateTimePositions = generateDateTimePixels(particles.length);
        particles.forEach(p => p.clearDateTimeTarget());
        for (let i = 0; i < dateTimePositions.length && i < particles.length; i++) {
            particles[i].setDateTimeTarget(dateTimePositions[i].x, dateTimePositions[i].y);
        }
    }

    function startParticleAnimation() {
        if (isParticleAnimating) return; // 既に実行中なら何もしない
        isParticleAnimating = true;
        resetParticleAnimation();
        animateParticles();
    }

    function stopParticleAnimation() {
        if (particleAnimationId) {
            cancelAnimationFrame(particleAnimationId);
            particleAnimationId = null;
        }
        isParticleAnimating = false;
    }

    function animateParticles() {
        if (!isParticleAnimating) return; // 停止フラグが立っていたら終了

        if (!particleStartTime) particleStartTime = Date.now();

        const now = Date.now();
        const elapsed = now - particleStartTime;

        // アニメーション終了（ループせず1回きり）
        if (elapsed >= LOOP_DURATION) {
            particleCtx.fillStyle = '#000000';
            particleCtx.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
            return;
        }

        // 背景クリア
        particleCtx.fillStyle = '#000000';
        particleCtx.fillRect(0, 0, particleCanvas.width, particleCanvas.height);

        // パーティクルを更新・描画
        particles.forEach(p => {
            p.update(elapsed);
            p.draw(particleCtx);
        });

        particleAnimationId = requestAnimationFrame(animateParticles);
    }

    // ========== ファミコン風ロゴアニメーション ==========
    const famicomCanvas = document.getElementById('famicomCanvas');
    const famicomCtx = famicomCanvas.getContext('2d');
    
    // 1920x1080 表示
    famicomCanvas.width = 1920;
    famicomCanvas.height = 1080;
    
    // ファミコン風カラーパレット
    const FC_PALETTE = {
        black: '#000000',
        white: '#FCFCFC',
        red: '#F83800',
        blue: '#0058F8',
        cyan: '#00E8D8',
        green: '#00A800',
        yellow: '#F8B800',
        orange: '#FCA044',
        pink: '#F878F8',
        purple: '#6844FC'
    };
    
    // 文字ごとの色（ファミコン風にカラフルに）
    const famicomCharColors = [
        FC_PALETTE.cyan,    // ふ
        FC_PALETTE.green,   // じ
        FC_PALETTE.yellow,  // み
        FC_PALETTE.orange,  // 野
        FC_PALETTE.pink,    // ひ
        FC_PALETTE.cyan,    // か
        FC_PALETTE.green,   // り
        FC_PALETTE.white,   // 眼
        FC_PALETTE.yellow   // 科
    ];
    
    const famicomText = 'ふじみ野ひかり眼科';
    const famicomPixelSize = 10;
    const famicomFontSize = 200;
    
    // 文字のピクセルデータを取得
    function getFamicomTextPixels(text, fontSize) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        
        offCanvas.width = famicomCanvas.width;
        offCanvas.height = famicomCanvas.height;
        
        offCtx.fillStyle = '#000';
        offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        
        offCtx.font = `bold ${fontSize}px "Hiragino Kaku Gothic Pro", "メイリオ", sans-serif`;
        offCtx.fillStyle = '#FFF';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);
        
        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const pixels = [];
        
        for (let y = 0; y < offCanvas.height; y += famicomPixelSize) {
            for (let x = 0; x < offCanvas.width; x += famicomPixelSize) {
                const i = (y * offCanvas.width + x) * 4;
                if (imageData.data[i] > 128) {
                    const charIndex = getFamicomCharIndex(x, offCanvas.width, text.length);
                    pixels.push({
                        x: x,
                        y: y,
                        color: famicomCharColors[charIndex] || FC_PALETTE.white
                    });
                }
            }
        }
        
        return pixels;
    }
    
    // X座標から文字インデックスを推定
    function getFamicomCharIndex(x, canvasWidth, charCount) {
        const textWidth = charCount * famicomFontSize * 0.9;
        const startX = (canvasWidth - textWidth) / 2;
        const charWidth = textWidth / charCount;
        const index = Math.floor((x - startX) / charWidth);
        return Math.max(0, Math.min(charCount - 1, index));
    }
    
    // ピクセルデータ
    let famicomAllPixels = [];
    let famicomPixelsByRow = {};
    
    // 初期化
    function initFamicom() {
        famicomAllPixels = getFamicomTextPixels(famicomText, famicomFontSize);
        
        famicomPixelsByRow = {};
        famicomAllPixels.forEach(p => {
            if (!famicomPixelsByRow[p.y]) {
                famicomPixelsByRow[p.y] = [];
            }
            famicomPixelsByRow[p.y].push(p);
        });
    }
    
    // アニメーション状態
    let famicomStartTime = null;
    let famicomAnimationId = null;
    let isFamicomAnimating = false;
    const FAMICOM_LOOP_DURATION = 15000; // 15秒ループ
    
    // 8bit風キラリンエフェクト
    function drawFamicomSparkle(x, y, size, progress) {
        const alpha = Math.sin(progress * Math.PI);
        famicomCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        
        const s = size * (0.5 + progress * 0.5);
        famicomCtx.fillRect(x - s, y - famicomPixelSize/2, s * 2, famicomPixelSize);
        famicomCtx.fillRect(x - famicomPixelSize/2, y - s, famicomPixelSize, s * 2);
    }
    
    // スキャンライン効果
    function drawFamicomScanlines() {
        famicomCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < famicomCanvas.height; y += 4) {
            famicomCtx.fillRect(0, y, famicomCanvas.width, 2);
        }
    }
    
    // メイン描画
    function drawFamicom(timestamp) {
        if (!isFamicomAnimating) return;
        
        if (!famicomStartTime) famicomStartTime = timestamp;
        const elapsed = (timestamp - famicomStartTime) % FAMICOM_LOOP_DURATION;
        const progress = elapsed / FAMICOM_LOOP_DURATION;
        
        // 背景クリア
        famicomCtx.fillStyle = FC_PALETTE.black;
        famicomCtx.fillRect(0, 0, famicomCanvas.width, famicomCanvas.height);
        
        const rows = Object.keys(famicomPixelsByRow).map(Number).sort((a, b) => b - a);
        const totalRows = rows.length;
        
        if (progress < 0.6) {
            // 積み上げフェーズ
            const buildProgress = progress / 0.6;
            const rowsToShow = Math.floor(totalRows * buildProgress);
            
            for (let i = 0; i < rowsToShow; i++) {
                const row = rows[i];
                const pixels = famicomPixelsByRow[row];
                
                pixels.forEach(p => {
                    famicomCtx.fillStyle = p.color;
                    famicomCtx.fillRect(p.x, p.y, famicomPixelSize - 1, famicomPixelSize - 1);
                });
            }
            
            // 現在積み上げ中の行（アニメーション効果）
            if (rowsToShow < totalRows) {
                const currentRow = rows[rowsToShow];
                const rowProgress = (buildProgress * totalRows) % 1;
                const pixels = famicomPixelsByRow[currentRow];
                
                pixels.forEach((p, idx) => {
                    if (idx / pixels.length < rowProgress * 1.5) {
                        famicomCtx.fillStyle = p.color;
                        const dropOffset = Math.max(0, (1 - rowProgress * 2) * 50);
                        famicomCtx.fillRect(p.x, p.y - dropOffset, famicomPixelSize - 1, famicomPixelSize - 1);
                    }
                });
            }
            
        } else if (progress < 0.9) {
            // 完成表示 + キラリン
            
            famicomAllPixels.forEach(p => {
                famicomCtx.fillStyle = p.color;
                famicomCtx.fillRect(p.x, p.y, famicomPixelSize - 1, famicomPixelSize - 1);
            });
            
            // キラリンエフェクト（0.6-0.75の間）
            if (progress < 0.75) {
                const sparkleProgress = (progress - 0.6) / 0.15;
                
                const sparklePositions = [
                    { x: famicomCanvas.width * 0.2, y: famicomCanvas.height * 0.45 },
                    { x: famicomCanvas.width * 0.35, y: famicomCanvas.height * 0.5 },
                    { x: famicomCanvas.width * 0.5, y: famicomCanvas.height * 0.45 },
                    { x: famicomCanvas.width * 0.65, y: famicomCanvas.height * 0.5 },
                    { x: famicomCanvas.width * 0.8, y: famicomCanvas.height * 0.45 }
                ];
                
                sparklePositions.forEach((pos, i) => {
                    const delay = i * 0.15;
                    const localProgress = Math.max(0, Math.min(1, (sparkleProgress - delay) * 2));
                    if (localProgress > 0) {
                        drawFamicomSparkle(pos.x, pos.y, 40, localProgress);
                    }
                });
            }
            
        } else {
            // フェードアウト
            const fadeProgress = (progress - 0.9) / 0.1;
            const alpha = 1 - fadeProgress;
            
            famicomAllPixels.forEach(p => {
                const r = parseInt(p.color.slice(1, 3), 16);
                const g = parseInt(p.color.slice(3, 5), 16);
                const b = parseInt(p.color.slice(5, 7), 16);
                famicomCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                famicomCtx.fillRect(p.x, p.y, famicomPixelSize - 1, famicomPixelSize - 1);
            });
        }
        
        // スキャンライン効果（レトロ感）
        drawFamicomScanlines();
        
        // CRTっぽい周辺減光
        const gradient = famicomCtx.createRadialGradient(
            famicomCanvas.width / 2, famicomCanvas.height / 2, 0,
            famicomCanvas.width / 2, famicomCanvas.height / 2, famicomCanvas.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        famicomCtx.fillStyle = gradient;
        famicomCtx.fillRect(0, 0, famicomCanvas.width, famicomCanvas.height);
        
        famicomAnimationId = requestAnimationFrame(drawFamicom);
    }
    
    function resetFamicomAnimation() {
        famicomStartTime = null;
    }
    
    function startFamicomAnimation() {
        if (isFamicomAnimating) return;
        isFamicomAnimating = true;
        resetFamicomAnimation();
        famicomAnimationId = requestAnimationFrame(drawFamicom);
    }
    
    function stopFamicomAnimation() {
        if (famicomAnimationId) {
            cancelAnimationFrame(famicomAnimationId);
            famicomAnimationId = null;
        }
        isFamicomAnimating = false;
    }

    // ========== 多言語グリッドアニメーション ==========
    function resetMultilangAnimation() {
        // 多言語グリッド画面のアニメーションをリセット
        const multilangScreen = document.getElementById('multilang-grid-screen');
        if (multilangScreen) {
            // アニメーションをリセットするため、一度要素を再描画
            const items = multilangScreen.querySelectorAll('.multilang-item, .multilang-center-title');
            items.forEach(item => {
                item.style.animation = 'none';
                item.offsetHeight; // reflow を強制
                item.style.animation = '';
            });
            // フラッシュオーバーレイもリセット
            const flashOverlay = document.getElementById('multilang-flash-overlay');
            if (flashOverlay) {
                flashOverlay.style.animation = 'none';
                flashOverlay.offsetHeight;
                flashOverlay.style.animation = '';
            }
        }
    }

    // ========== 動画CM機能 ==========
    const videoCMPlayer = document.getElementById('video-cm-player');
    let isVideoCMPlaying = false;
    let videoCMLoopCount = 0; // 現在のループ回数
    let videoCMTargetLoops = 1; // 目標ループ回数

    // イベントハンドラを関数として定義（適切なクリーンアップのため）
    let videoCMMetadataHandler = null;
    let videoCMEndedHandler = null;

    // プリロードキャッシュ: src → { ready: boolean, duration: number }
    const videoPreloadCache = new Map();

    // 画面リスト構築後に呼ばれる: 動画CMソースを事前バッファリング
    function preloadVideoCMs() {
        const videoSources = new Set();
        screens.forEach(s => {
            if (s.id === 'video-cm-screen' && s.videoSrc) {
                videoSources.add(s.videoSrc);
            }
        });
        videoSources.forEach(src => {
            if (videoPreloadCache.has(src)) return;
            const cache = { ready: false, duration: 0 };
            videoPreloadCache.set(src, cache);
            const preloader = document.createElement('video');
            preloader.preload = 'auto';
            preloader.muted = true;
            preloader.src = src;
            preloader.addEventListener('canplaythrough', () => {
                cache.ready = true;
                cache.duration = preloader.duration;
                console.log(`動画プリロード完了: ${src} (${preloader.duration.toFixed(1)}秒)`);
            }, { once: true });
            preloader.load();
        });
    }

    function startVideoCM(src) {
        if (!videoCMPlayer || !src) return;

        // 前回のイベントリスナーを確実にクリア
        cleanupVideoCMListeners();

        // ループカウントをリセット
        videoCMLoopCount = 0;
        videoCMTargetLoops = 1;

        // 動画ソースを設定
        videoCMPlayer.src = src;
        videoCMPlayer.load();

        // プリロード済みの場合はメタデータからループ数を即決定
        const cached = videoPreloadCache.get(src);
        if (cached && cached.ready && cached.duration > 0) {
            videoCMTargetLoops = cached.duration < 15 ? 2 : 1;
            console.log(`動画CM(キャッシュ): ${cached.duration.toFixed(1)}秒 → ${videoCMTargetLoops}周再生`);
        } else {
            // メタデータ読み込み後に動画の長さを確認（フォールバック）
            videoCMMetadataHandler = () => {
                const duration = videoCMPlayer.duration;
                videoCMTargetLoops = duration < 15 ? 2 : 1;
                console.log(`動画CM: ${duration.toFixed(1)}秒 → ${videoCMTargetLoops}周再生`);
            };
            videoCMPlayer.addEventListener('loadedmetadata', videoCMMetadataHandler);
        }

        // 動画終了時の処理
        videoCMEndedHandler = () => {
            videoCMLoopCount++;
            if (videoCMLoopCount < videoCMTargetLoops) {
                // まだループが必要なら最初から再生
                videoCMPlayer.currentTime = 0;
                videoCMPlayer.play();
            }
            // 目標回数に達したら自然に停止（画面切り替えはrotateScreensが管理）
        };
        videoCMPlayer.addEventListener('ended', videoCMEndedHandler);

        // canplaythroughを待ってから再生開始（カクつき防止）
        const tryPlay = () => {
            videoCMPlayer.play().then(() => {
                isVideoCMPlaying = true;
                console.log('動画CM再生開始:', src);
            }).catch(error => {
                console.log('動画CM再生エラー:', error);
                isVideoCMPlaying = false;
            });
        };

        if (videoCMPlayer.readyState >= 4) {
            // 既にバッファ済み（プリロード成功時）
            tryPlay();
        } else {
            // バッファ完了を待ってから再生（最大3秒でタイムアウト）
            const canPlayHandler = () => {
                clearTimeout(fallbackTimer);
                tryPlay();
            };
            videoCMPlayer.addEventListener('canplaythrough', canPlayHandler, { once: true });
            const fallbackTimer = setTimeout(() => {
                videoCMPlayer.removeEventListener('canplaythrough', canPlayHandler);
                console.log('動画CM: バッファ待ちタイムアウト、強制再生開始');
                tryPlay();
            }, 3000);
        }
    }

    // イベントリスナーのクリーンアップ関数
    function cleanupVideoCMListeners() {
        if (videoCMPlayer) {
            if (videoCMMetadataHandler) {
                videoCMPlayer.removeEventListener('loadedmetadata', videoCMMetadataHandler);
                videoCMMetadataHandler = null;
            }
            if (videoCMEndedHandler) {
                videoCMPlayer.removeEventListener('ended', videoCMEndedHandler);
                videoCMEndedHandler = null;
            }
        }
    }

    function stopVideoCM() {
        if (!videoCMPlayer) return;

        videoCMPlayer.pause();
        videoCMPlayer.currentTime = 0;

        // イベントリスナーをクリア
        cleanupVideoCMListeners();

        // 動画リソースを解放（メモリリーク防止）
        videoCMPlayer.removeAttribute('src');
        videoCMPlayer.load(); // srcクリア後にloadを呼ぶことでリソース解放

        isVideoCMPlaying = false;
        videoCMLoopCount = 0;
    }

    // ファミコンロゴ初期化
    initFamicom();

    // ========== メモリ管理 ==========
    // 長時間稼働時のメモリ蓄積を防ぐため、2時間ごとに自動リロード
    const MEMORY_CLEANUP_INTERVAL = 2 * 60 * 60 * 1000; // 2時間
    const pageStartTime = Date.now();

    setInterval(() => {
        const runningTime = Date.now() - pageStartTime;
        if (runningTime >= MEMORY_CLEANUP_INTERVAL) {
            console.log('メモリクリーンアップのため自動リロード実行');
            location.reload();
        }
    }, 60000); // 1分ごとにチェック

    // ========== 天気予報機能 ==========
    // 天気コードからアイコンへの変換
    function getWeatherIcon(code) {
        const codeStr = String(code);
        // 気象庁の天気コード対応表
        if (codeStr.startsWith('100') || codeStr === '100') return '☀️';
        if (codeStr.startsWith('101')) return '🌤️';
        if (codeStr.startsWith('102') || codeStr.startsWith('104')) return '☀️☔';
        if (codeStr.startsWith('103') || codeStr.startsWith('105')) return '☀️🌨️';
        if (codeStr.startsWith('110') || codeStr.startsWith('111')) return '🌤️';
        if (codeStr.startsWith('112') || codeStr.startsWith('113')) return '🌤️☔';
        if (codeStr.startsWith('114') || codeStr.startsWith('115')) return '🌤️🌨️';
        if (codeStr.startsWith('200') || codeStr === '200') return '☁️';
        if (codeStr.startsWith('201') || codeStr.startsWith('202')) return '☁️☔';
        if (codeStr.startsWith('203') || codeStr.startsWith('204')) return '☁️🌨️';
        if (codeStr.startsWith('210') || codeStr.startsWith('211')) return '☁️';
        if (codeStr.startsWith('212') || codeStr.startsWith('213')) return '☁️☔';
        if (codeStr.startsWith('214') || codeStr.startsWith('215')) return '☁️🌨️';
        if (codeStr.startsWith('300') || codeStr === '300') return '🌧️';
        if (codeStr.startsWith('301') || codeStr.startsWith('302')) return '🌧️';
        if (codeStr.startsWith('303') || codeStr.startsWith('304')) return '🌧️🌨️';
        if (codeStr.startsWith('308')) return '⛈️';
        if (codeStr.startsWith('311') || codeStr.startsWith('313')) return '🌧️';
        if (codeStr.startsWith('314') || codeStr.startsWith('315')) return '🌧️🌨️';
        if (codeStr.startsWith('400') || codeStr === '400') return '🌨️';
        if (codeStr.startsWith('401') || codeStr.startsWith('402')) return '🌨️';
        if (codeStr.startsWith('403') || codeStr.startsWith('405')) return '🌨️🌧️';
        if (codeStr.startsWith('406') || codeStr.startsWith('407')) return '🌨️⛈️';
        if (codeStr.startsWith('411') || codeStr.startsWith('413')) return '🌨️';
        return '🌈';
    }

    // 日付ラベルを取得
    function getDayLabel(dateStr, index) {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
        
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        
        let label = '';
        if (diffDays === 0) label = '今日';
        else if (diffDays === 1) label = '明日';
        else if (diffDays === 2) label = '明後日';
        else label = `${diffDays}日後`;
        
        return `${label}<br>${month}/${day}(${weekday})`;
    }

    // ========== 気温データのローカルストレージ管理 ==========
    const WEATHER_TEMPS_KEY = 'weather_temps';

    // 気温データをローカルストレージに保存
    function saveTempsToStorage(tempByDate) {
        try {
            // 既存データを取得
            const existing = JSON.parse(localStorage.getItem(WEATHER_TEMPS_KEY) || '{}');

            // 新しいデータをマージ（今日以降のデータのみ）
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const merged = {};

            // 既存データから今日以降のものを残す
            Object.keys(existing).forEach(dateKey => {
                const [year, month, day] = dateKey.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                if (date >= today) {
                    merged[dateKey] = existing[dateKey];
                }
            });

            // 新しいデータを追加（上書き）
            Object.keys(tempByDate).forEach(dateKey => {
                const data = tempByDate[dateKey];
                if (data.high || data.low) {
                    if (!merged[dateKey]) {
                        merged[dateKey] = {};
                    }
                    // 有効な値のみ保存
                    if (data.high && data.high !== '') {
                        merged[dateKey].high = data.high;
                    }
                    if (data.low && data.low !== '') {
                        merged[dateKey].low = data.low;
                    }
                }
            });

            localStorage.setItem(WEATHER_TEMPS_KEY, JSON.stringify(merged));
            console.log('気温データを保存:', merged);
        } catch (e) {
            console.log('ローカルストレージ保存エラー:', e);
        }
    }

    // ローカルストレージから気温データを取得
    function getTempsFromStorage(dateKey) {
        try {
            const data = JSON.parse(localStorage.getItem(WEATHER_TEMPS_KEY) || '{}');
            return data[dateKey] || { high: null, low: null };
        } catch (e) {
            console.log('ローカルストレージ取得エラー:', e);
            return { high: null, low: null };
        }
    }

    // ========== 天気データのキャッシュ管理 ==========
    let lastWeatherFetch = 0; // 最後にAPIを取得した時刻
    let cachedWeatherHTML = null; // キャッシュされた天気カードHTML
    let cachedUpdateTime = null; // キャッシュされた更新時刻テキスト
    const WEATHER_CACHE_DURATION = 60 * 60 * 1000; // 1時間（ミリ秒）

    // 天気データを取得・表示
    function fetchWeatherData() {
        const weatherCardsEl = document.getElementById('weather-cards');
        const updateTimeEl = document.getElementById('weather-update-time');

        // キャッシュが有効な場合はキャッシュを使用
        const now = Date.now();
        if (cachedWeatherHTML && (now - lastWeatherFetch) < WEATHER_CACHE_DURATION) {
            console.log('天気データ: キャッシュを使用（残り' + Math.round((WEATHER_CACHE_DURATION - (now - lastWeatherFetch)) / 60000) + '分）');
            weatherCardsEl.innerHTML = cachedWeatherHTML;
            if (cachedUpdateTime) updateTimeEl.textContent = cachedUpdateTime;
            return;
        }

        console.log('天気データ: APIから取得');
        fetch('https://www.jma.go.jp/bosai/forecast/data/forecast/110000.json')
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                // 南部（ふじみ野市）のデータを取得
                const timeSeries = data[0].timeSeries;
                
                // 天気情報（3日分）
                const weatherData = timeSeries[0];
                const southern = weatherData.areas.find(a => a.area.code === '110010');
                
                if (!southern) throw new Error('Area not found');
                
                const timeDefines = weatherData.timeDefines;
                const weathers = southern.weathers;
                const weatherCodes = southern.weatherCodes;
                
                // 降水確率（6時間ごと）
                const popData = timeSeries[1];
                const popArea = popData.areas.find(a => a.area.code === '110010');
                const pops = popArea ? popArea.pops : [];
                
                // 気温データ（timeDefinesを参照して最高・最低を正しく判定）
                const tempData = data[0].timeSeries[2];
                const tempTimeDefines = tempData ? tempData.timeDefines : [];
                const tempArea = tempData ? tempData.areas.find(a => a.area.code === '110010' || a.area.name === 'さいたま') : null;
                const temps = tempArea ? tempArea.temps : [];

                // デバッグ: 気温データの確認
                console.log('=== 気温データ デバッグ ===');
                console.log('tempTimeDefines:', tempTimeDefines);
                console.log('temps:', temps);

                // 気温データを日付・種別ごとに整理
                const tempByDate = {};
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
                const currentHour = now.getHours();

                tempTimeDefines.forEach((td, idx) => {
                    const date = new Date(td);
                    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    const hour = date.getHours();
                    console.log(`  [${idx}] ${td} → hour=${hour}, temp=${temps[idx]}`);
                    if (!tempByDate[dateKey]) {
                        tempByDate[dateKey] = { high: null, low: null };
                    }
                    // 時刻で最高・最低を判定（0-6時頃:最低、9-15時頃:最高）
                    if (hour >= 0 && hour <= 6) {
                        // 今日のデータで、すでに7時を過ぎている場合は最低気温データを無視
                        // （APIが最高気温と同じ値を返すため、ローカルストレージの値を優先）
                        const isToday = (dateKey === todayStr);
                        if (isToday && currentHour >= 7) {
                            console.log(`    → 今日の最低気温データをスキップ（現在${currentHour}時、ローカルストレージを優先）`);
                        } else if (temps[idx] && temps[idx] !== '') {
                            tempByDate[dateKey].low = temps[idx];
                        }
                    } else if (hour >= 9 && hour <= 15) {
                        if (temps[idx] && temps[idx] !== '') {
                            tempByDate[dateKey].high = temps[idx];
                        }
                    }
                });
                console.log('tempByDate:', tempByDate);

                // 気温データをローカルストレージに保存（明日以降のデータを保持）
                saveTempsToStorage(tempByDate);

                // カードを生成（データがある日数分）
                let cardsHTML = '';
                // 明後日のデータがあるか確認（天気情報が存在するか）
                let displayDays = Math.min(3, timeDefines.length);
                if (displayDays === 3 && (!weathers[2] || weathers[2] === '')) {
                    displayDays = 2; // 明後日のデータがなければ2日分のみ表示
                }
                
                for (let i = 0; i < displayDays; i++) {
                    const dayLabel = getDayLabel(timeDefines[i], i);
                    const weather = weathers[i] ? weathers[i].replace(/　/g, ' ') : '---';
                    const weatherCode = weatherCodes[i];
                    const icon = getWeatherIcon(weatherCode);

                    // 今日の天気コードをUV計算用にキャッシュ
                    if (i === 0) {
                        cachedWeatherCode = weatherCode;
                    }
                    
                    // 降水確率（その日の最大値を表示）
                    let maxPop = '---';
                    if (pops.length > 0) {
                        // 6時間ごとのデータから該当日の最大を取得
                        const dayPops = [];
                        if (i === 0) {
                            // 今日: 最初の2-4個
                            for (let j = 0; j < Math.min(4, pops.length); j++) {
                                if (pops[j] !== '') dayPops.push(parseInt(pops[j]));
                            }
                        } else if (i === 1) {
                            // 明日: 4-8個目
                            for (let j = 4; j < Math.min(8, pops.length); j++) {
                                if (pops[j] !== '') dayPops.push(parseInt(pops[j]));
                            }
                        } else {
                            // 明後日は週間予報から（簡易表示）
                            maxPop = '---';
                        }
                        if (dayPops.length > 0) {
                            maxPop = Math.max(...dayPops) + '%';
                        }
                    }

                    // 気温（APIデータ → ローカルストレージの順でフォールバック取得）
                    const cardDate = new Date(timeDefines[i]);
                    const cardDateKey = `${cardDate.getFullYear()}-${cardDate.getMonth() + 1}-${cardDate.getDate()}`;

                    // APIからの気温データ
                    let apiHigh = tempByDate[cardDateKey]?.high || null;
                    let apiLow = tempByDate[cardDateKey]?.low || null;

                    // ローカルストレージからフォールバック取得
                    const storedTemps = getTempsFromStorage(cardDateKey);
                    const finalHigh = apiHigh || storedTemps.high;
                    const finalLow = apiLow || storedTemps.low;

                    // 表示用の値（データがあれば°を付ける）
                    const tempHigh = finalHigh ? finalHigh + '°' : null;
                    const tempLow = finalLow ? finalLow + '°' : null;

                    // データがある場合のみ表示
                    const showHighTemp = (tempHigh !== null);
                    const showLowTemp = (tempLow !== null);

                    cardsHTML += `
                        <div class="weather-card">
                            <div class="weather-card-date">${dayLabel}</div>
                            <div class="weather-card-icon">${icon}</div>
                            <div class="weather-card-text">${weather}</div>
                            <div class="weather-card-temps">
                                ${showHighTemp ? `
                                <div class="weather-temp weather-temp-high">
                                    <div class="weather-temp-label">最高</div>
                                    ${tempHigh}
                                </div>
                                ` : ''}
                                ${showLowTemp ? `
                                <div class="weather-temp weather-temp-low">
                                    <div class="weather-temp-label">最低</div>
                                    ${tempLow}
                                </div>
                                ` : ''}
                            </div>
                            <div class="weather-card-rain">
                                <span class="weather-card-rain-icon">☔</span>降水確率 ${maxPop}
                            </div>
                        </div>
                    `;
                }
                
                weatherCardsEl.innerHTML = cardsHTML;

                // 更新日時
                const reportTime = new Date(data[0].reportDatetime);
                const updateTimeText = `${reportTime.getMonth() + 1}/${reportTime.getDate()} ${reportTime.getHours()}:${String(reportTime.getMinutes()).padStart(2, '0')} 発表`;
                updateTimeEl.textContent = updateTimeText;

                // キャッシュを保存
                cachedWeatherHTML = cardsHTML;
                cachedUpdateTime = updateTimeText;
                lastWeatherFetch = Date.now();
                console.log('天気データ: キャッシュを更新');

                weatherDataLoaded = true;
            })
            .catch(error => {
                console.error('天気データ取得エラー:', error);
                weatherCardsEl.innerHTML = '<div class="weather-loading">☁️ データ取得中...</div>';
                weatherDataLoaded = false;
            });
    }

    // 時間帯に応じて天気画面の背景を変更
    function updateWeatherScreenBackground() {
        const weatherScreen = document.getElementById('weather-screen');
        const hour = new Date().getHours();

        // 既存の時間帯クラスを削除
        weatherScreen.classList.remove('time-morning', 'time-noon', 'time-evening', 'time-night');

        // 時間帯に応じたクラスを追加
        if (hour >= 5 && hour < 10) {
            weatherScreen.classList.add('time-morning');  // 朝
        } else if (hour >= 10 && hour < 16) {
            weatherScreen.classList.add('time-noon');     // 昼
        } else if (hour >= 16 && hour < 19) {
            weatherScreen.classList.add('time-evening');  // 夕方
        } else {
            weatherScreen.classList.add('time-night');    // 夜
        }
    }

    // ========== 紫外線情報画面 ==========
    // 埼玉県の月別平均UVインデックス（気象庁データに基づく概算値）
    const UV_DATA_BY_MONTH = {
        1: { clear: 2, cloudy: 1 },   // 1月
        2: { clear: 3, cloudy: 2 },   // 2月
        3: { clear: 5, cloudy: 3 },   // 3月
        4: { clear: 6, cloudy: 4 },   // 4月
        5: { clear: 8, cloudy: 5 },   // 5月
        6: { clear: 9, cloudy: 5 },   // 6月
        7: { clear: 10, cloudy: 6 },  // 7月
        8: { clear: 10, cloudy: 6 },  // 8月
        9: { clear: 7, cloudy: 4 },   // 9月
        10: { clear: 5, cloudy: 3 },  // 10月
        11: { clear: 3, cloudy: 2 },  // 11月
        12: { clear: 2, cloudy: 1 }   // 12月
    };

    // UVレベルの定義（シンプルな1行アドバイス）
    const UV_LEVELS = [
        { max: 2, level: 'low', label: '弱い', color: '#4cd964', advice: '特別な対策は不要です' },
        { max: 5, level: 'moderate', label: '中程度', color: '#ffcc00', advice: '長時間の外出時はサングラス推奨' },
        { max: 7, level: 'high', label: '強い', color: '#ff9500', advice: 'サングラス・帽子で眼を保護しましょう' },
        { max: 10, level: 'very-high', label: '非常に強い', color: '#ff3b30', advice: 'UV400サングラス必須！外出を控えて' },
        { max: Infinity, level: 'extreme', label: '極端に強い', color: '#af52de', advice: '外出を最小限に！眼への影響大' }
    ];

    // キャッシュされた天気コード（天気画面から取得）
    let cachedWeatherCode = null;

    // 天気コードから晴れ/曇りを判定
    function isWeatherClear(weatherCode) {
        if (!weatherCode) return true; // デフォルトは晴れ
        const code = String(weatherCode);
        // 100番台は晴れ、200番台は曇り、300番台以降は雨/雪
        if (code.startsWith('1')) return true;  // 晴れ
        if (code.startsWith('2')) return false; // 曇り
        return false; // 雨・雪は曇り扱い
    }

    // 現在のUVインデックスを取得
    function getCurrentUVIndex() {
        const month = new Date().getMonth() + 1;
        const uvData = UV_DATA_BY_MONTH[month];
        const isClear = isWeatherClear(cachedWeatherCode);
        return isClear ? uvData.clear : uvData.cloudy;
    }

    // UVレベル情報を取得
    function getUVLevelInfo(uvIndex) {
        for (const level of UV_LEVELS) {
            if (uvIndex <= level.max) {
                return level;
            }
        }
        return UV_LEVELS[UV_LEVELS.length - 1];
    }

    // 紫外線画面を更新
    function updateUVScreen() {
        const uvScreen = document.getElementById('uv-screen');
        const uvValueEl = document.getElementById('uv-index-value');
        const uvLevelEl = document.getElementById('uv-index-level');
        const uvGaugeBar = document.getElementById('uv-gauge-bar');
        const uvAdviceText = document.getElementById('uv-advice-text');

        // UVインデックスを取得
        const uvIndex = getCurrentUVIndex();
        const levelInfo = getUVLevelInfo(uvIndex);

        // 数値を更新
        uvValueEl.textContent = uvIndex;

        // レベルラベルを更新
        uvLevelEl.textContent = levelInfo.label;

        // ゲージの位置を更新（0-11+をパーセントに変換）
        const gaugePercent = Math.min((uvIndex / 11) * 100, 100);
        uvGaugeBar.style.setProperty('--gauge-position', `${gaugePercent}%`);
        // CSSの::afterの位置を動的に設定
        uvGaugeBar.style.cssText = `--gauge-pos: ${gaugePercent}%`;

        // 背景色を更新
        uvScreen.classList.remove('uv-level-low', 'uv-level-moderate', 'uv-level-high', 'uv-level-very-high', 'uv-level-extreme');
        uvScreen.classList.add(`uv-level-${levelInfo.level}`);

        // アドバイスを更新（1行テキスト）
        uvAdviceText.textContent = levelInfo.advice;

        console.log(`UV情報: 月=${new Date().getMonth() + 1}, 天気コード=${cachedWeatherCode}, UV=${uvIndex}, レベル=${levelInfo.label}`);
    }

    // ========== 日光浴おすすめ画面 ==========

    // 埼玉県（北緯35.8°）での月別ビタミンD生成に必要な日光浴時間（分）
    // 条件: 正午前後、晴天、顔と手を露出（Fitzpatrick skin type III）
    const SUN_EXPOSURE_BY_MONTH = {
        1:  { clear: 50, cloudy: 120 },  // 冬至後、太陽高度低い
        2:  { clear: 40, cloudy: 90 },
        3:  { clear: 25, cloudy: 50 },
        4:  { clear: 20, cloudy: 40 },
        5:  { clear: 10, cloudy: 25 },
        6:  { clear: 8,  cloudy: 20 },
        7:  { clear: 5,  cloudy: 15 },   // 夏至付近、最も効率的
        8:  { clear: 5,  cloudy: 15 },
        9:  { clear: 10, cloudy: 25 },
        10: { clear: 20, cloudy: 40 },
        11: { clear: 35, cloudy: 80 },
        12: { clear: 50, cloudy: 120 }   // 冬至付近、最も非効率
    };

    // 時間帯による補正倍率（正午基準）
    function getSunExposureTimeMultiplier(hour) {
        if (hour >= 10 && hour < 14) return 1.0;  // 正午前後: 最適
        if (hour >= 8 && hour < 10) return 1.8;   // 午前: やや長め
        if (hour >= 14 && hour < 16) return 1.5;  // 午後: やや長め
        return null; // それ以外: 日光浴に不適な時間帯
    }

    // 雨・雪かどうかを判定
    function isWeatherRainy(weatherCode) {
        if (!weatherCode) return false;
        const code = String(weatherCode);
        return code.startsWith('3') || code.startsWith('4'); // 300番台=雨, 400番台=雪
    }

    // 推奨日光浴時間を計算
    function calculateSunExposure() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const hour = now.getHours();
        const data = SUN_EXPOSURE_BY_MONTH[month];
        const isClear = isWeatherClear(cachedWeatherCode);
        const isRainy = isWeatherRainy(cachedWeatherCode);

        // 雨・雪の場合
        if (isRainy) {
            return { minutes: null, isRainy: true, isOutsideHours: false };
        }

        // 早朝・夜間の場合
        const multiplier = getSunExposureTimeMultiplier(hour);
        if (multiplier === null) {
            const baseMinutes = isClear ? data.clear : data.cloudy;
            return { minutes: baseMinutes, isRainy: false, isOutsideHours: true };
        }

        const baseMinutes = isClear ? data.clear : data.cloudy;
        let adjustedMinutes = Math.round(baseMinutes * multiplier);

        // 5分単位に丸める（見やすさ）
        adjustedMinutes = Math.round(adjustedMinutes / 5) * 5;
        if (adjustedMinutes < 5) adjustedMinutes = 5;
        if (adjustedMinutes > 120) adjustedMinutes = 120;

        return { minutes: adjustedMinutes, isRainy: false, isOutsideHours: false };
    }

    // 日光浴画面を更新
    function updateSunExposureScreen() {
        const timeEl = document.getElementById('sun-exposure-time');
        const conditionEl = document.getElementById('sun-exposure-condition');
        const tipsEl = document.getElementById('sun-exposure-tips');
        const screen = document.getElementById('sun-exposure-screen');

        const result = calculateSunExposure();
        const month = new Date().getMonth() + 1;

        // 背景クラスのリセット
        screen.classList.remove('sun-rainy', 'sun-winter', 'sun-summer');

        if (result.isRainy) {
            // 雨・雪の日
            screen.classList.add('sun-rainy');
            timeEl.textContent = '☂️';
            conditionEl.textContent = '今日は室内で過ごしましょう';
            tipsEl.innerHTML = '<span class="sun-tip-icon">🐟</span><span class="sun-tip-text">ビタミンDは鮭・しらす・きのこ類からも摂れます</span>';
        } else if (result.isOutsideHours) {
            // 早朝・夜間（日中の推奨値を表示）
            timeEl.textContent = '約' + result.minutes + '分';
            conditionEl.textContent = '日中の外出時に太陽を浴びましょう';
            tipsEl.innerHTML = '<span class="sun-tip-icon">🕐</span><span class="sun-tip-text">10時〜14時がおすすめの時間帯です</span>';
        } else {
            // 通常表示
            timeEl.textContent = '約' + result.minutes + '分';
            conditionEl.textContent = '顔と手に日差しを浴びるのが目安です';
            // 季節ごとのアドバイス
            if (month >= 11 || month <= 2) {
                screen.classList.add('sun-winter');
                tipsEl.innerHTML = '<span class="sun-tip-icon">🧣</span><span class="sun-tip-text">冬は日差しが弱いので、意識して外に出ましょう</span>';
            } else if (month >= 6 && month <= 8) {
                screen.classList.add('sun-summer');
                tipsEl.innerHTML = '<span class="sun-tip-icon">🧴</span><span class="sun-tip-text">短時間でOK！長時間の場合は日焼け対策も忘れずに</span>';
            } else {
                tipsEl.innerHTML = '<span class="sun-tip-icon">🚶</span><span class="sun-tip-text">お散歩やお買い物のついでに日光浴しましょう</span>';
            }
        }

        console.log('日光浴情報: 月=' + month + ', 天気コード=' + cachedWeatherCode + ', 推奨=' + (result.minutes ? result.minutes + '分' : '室内') + ', 雨=' + result.isRainy);
    }

    // 初期化
    renderTable(); // テーブルを生成
    highlightCurrentMonthColumn();
    displayCurrentMonthInfo();
    setupPollenAlertScreen();
    updateClock();
    setInterval(updateClock, 1000); // 時計は常に更新(ただしupdateClock内で条件判定)
    // パーティクルアニメーションは最初は開始しない(ロゴ画面表示時に開始)

    // 天気データを事前に取得（最初のローテーション到達前に読み込み完了させる）
    fetchWeatherData();

    // スライドショー設定を読み込んでから画面ローテーション開始
    buildScreensList().then(() => {
        rotateScreens();
    });
});
