#target photoshop
app.bringToFront();

/*
  AutoSizeAdapter_Complete_CN_FrozenRoles.jsx
  非 UXP / Photoshop ExtendScript(JSX)

  这个版本解决三个问题：
  1. 不强依赖图层命名：用面板手动分配角色。
  2. PSD 有很多废弃图层：未分配的图层不会参与导出。
  3. 自动记忆：把分配结果保存为 PSD 同目录的 .autosize-map.txt，下次打开自动加载。

  使用方式：
  Photoshop > 文件 > 脚本 > 浏览... > 选择本 JSX

  完整中文版支持角色：
  背景主图 / 背景填充 / 背景物体 / 主体 / 主标题 / 副标题 / 其他文字 / 行动按钮 / Logo / 框容器

  设计原则：
  - 用户负责告诉系统“哪个模块是什么”
  - 系统负责按规则自动生成目标尺寸
*/

(function () {
    var OLD_UNITS = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    try {
        main();
    } catch (e) {
        alert("运行失败：\n" + e.message + "\nLine: " + e.line);
    } finally {
        app.preferences.rulerUnits = OLD_UNITS;
    }
})();

function main() {
    if (app.documents.length === 0) {
        alert("请先打开一个 PSD。") ;
        return;
    }

    var doc = app.activeDocument;
    var scene = captureScene(doc);
    if (scene.nodes.length === 0) {
        alert("没有读取到图层。") ;
        return;
    }

    var mapFile = getMapFile(doc);
    var savedMap = loadMap(mapFile);
    var options = showAssignUI(scene, savedMap, mapFile);
    if (!options) return;

    saveMap(mapFile, options.map);

    var logs = [];
    logs.push("AutoSizeAdapter 超横屏修正版 Log");
    logs.push("Source: " + doc.name);
    logs.push("Source Size: " + scene.sourceW + " x " + scene.sourceH);
    logs.push("Map: " + mapFile.fsName);
    logs.push("----------------------------------------");

    for (var i = 0; i < options.targets.length; i++) {
        var t = options.targets[i];
        var oneLog = adaptTarget(doc, scene, options.map, t.w, t.h, options);
        appendArray(logs, oneLog);
    }

    writeLog(options.outputFolder, logs);
    alert("完成。\n导出目录：\n" + options.outputFolder.fsName + "\n\n分配已保存：\n" + mapFile.fsName);
}



/* ============================================================
   UI / Map Helpers - added hotfix
============================================================ */

function makeEntry(role, parentRef) {
    if (!parentRef) parentRef = "__CANVAS__";
    return role + "||" + parentRef;
}

function getEntryRole(entry) {
    if (!entry) return "";
    var s = String(entry);
    var p = s.indexOf("||");
    if (p >= 0) return s.substring(0, p);
    return s;
}

function getEntryParent(entry) {
    if (!entry) return "__CANVAS__";
    var s = String(entry);
    var p = s.indexOf("||");
    if (p >= 0) return s.substring(p + 2);
    return "__CANVAS__";
}

function rebuildParentDrop(drop, scene) {
    drop.removeAll();
    var item = drop.add("item", "画布本身");
    item.parentFullName = "__CANVAS__";
    for (var i = 0; i < scene.nodes.length; i++) {
        var n = scene.nodes[i];
        var label = indent(n.depth) + n.name;
        var it = drop.add("item", label);
        it.parentFullName = n.fullName;
    }
}

function shortPath(p) {
    if (!p || p === "__CANVAS__") return "画布";
    var parts = String(p).split("/");
    return parts[parts.length - 1];
}

/* ============================================================
   UI
============================================================ */

function showAssignUI(scene, savedMap, mapFile) {
    var roles = [
        "忽略",
        "背景主图",
        "背景填充",
        "背景物体",
        "副主体",
        "主体",
        "主标题",
        "副标题",
        "其他文字",
        "行动按钮",
        "底部横幅",
        "Logo",
        "框/容器"
    ];

    var roleMap = {};
    for (var i = 0; i < scene.nodes.length; i++) {
        var n = scene.nodes[i];
        roleMap[n.fullName] = savedMap[n.fullName] || "";
    }

    var win = new Window("dialog", "自动尺寸适配工具 - 中文分配与图层依附对象");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.preferredSize = [760, 620];

    var info = win.add("statictext", undefined, "只需要分配“这是什么”。依附对象默认是画布，也可以让某个模块跟随另一个模块。未分配或【忽略】不会参与导出。分配保存到：" + mapFile.name);
    info.maximumSize.width = 740;

    var mainGroup = win.add("group");
    mainGroup.orientation = "row";
    mainGroup.alignChildren = ["fill", "fill"];

    var leftPanel = mainGroup.add("panel", undefined, "PSD 图层 / 图层组");
    leftPanel.orientation = "column";
    leftPanel.alignChildren = ["fill", "fill"];
    leftPanel.preferredSize = [500, 420];

    var layerList = leftPanel.add("listbox", undefined, [], { multiselect: true });
    layerList.preferredSize = [490, 390];

    var rightPanel = mainGroup.add("panel", undefined, "分配");
    rightPanel.orientation = "column";
    rightPanel.alignChildren = ["fill", "top"];
    rightPanel.preferredSize = [220, 420];

    rightPanel.add("statictext", undefined, "角色：");
    var roleDrop = rightPanel.add("dropdownlist", undefined, roles);
    roleDrop.selection = 0;

    rightPanel.add("statictext", undefined, "依附对象：");
    var parentDrop = rightPanel.add("dropdownlist", undefined, []);
    rebuildParentDrop(parentDrop, scene);
    parentDrop.selection = 0;

    var assignBtn = rightPanel.add("button", undefined, "分配给选中项");
    var clearBtn = rightPanel.add("button", undefined, "清除选中项");
    var guessBtn = rightPanel.add("button", undefined, "按名称粗略猜测");
    var importBtn = rightPanel.add("button", undefined, "导入分配文件");
    var exportBtn = rightPanel.add("button", undefined, "导出分配文件");

    rightPanel.add("statictext", undefined, "角色统计：");
    var summaryList = rightPanel.add("listbox", undefined, []);
    summaryList.preferredSize = [200, 210];

    var sizePanel = win.add("panel", undefined, "目标尺寸：每行一个，格式 宽x高");
    sizePanel.orientation = "column";
    sizePanel.alignChildren = ["fill", "top"];
    var sizeInput = sizePanel.add("edittext", undefined, "1080x1920\n1080x1080\n1200x628", { multiline: true, scrolling: true });
    sizeInput.preferredSize = [720, 80];

    var exportPanel = win.add("panel", undefined, "导出");
    exportPanel.orientation = "row";
    exportPanel.alignChildren = ["left", "center"];

    exportPanel.add("statictext", undefined, "格式：");
    var fmt = exportPanel.add("dropdownlist", undefined, ["PSD", "PSD + PNG预览", "PSD + JPG预览"]);
    fmt.selection = 0;

    exportPanel.add("statictext", undefined, "JPG质量：");
    var jpgQuality = exportPanel.add("edittext", undefined, "90");
    jpgQuality.characters = 5;

    var keepOpen = exportPanel.add("checkbox", undefined, "保留生成文档打开");
    keepOpen.value = false;

    var folderPanel = win.add("group");
    folderPanel.orientation = "row";
    folderPanel.alignChildren = ["fill", "center"];
    folderPanel.add("statictext", undefined, "导出目录：");
    var folderText = folderPanel.add("edittext", undefined, "");
    folderText.characters = 58;
    var chooseBtn = folderPanel.add("button", undefined, "选择");
    var outputFolder = null;

    chooseBtn.onClick = function () {
        var f = Folder.selectDialog("选择导出目录");
        if (f) {
            outputFolder = f;
            folderText.text = f.fsName;
        }
    };

    var bottom = win.add("group");
    bottom.alignment = "right";
    var saveBtn = bottom.add("button", undefined, "保存分配");
    var cancelBtn = bottom.add("button", undefined, "取消");
    var startBtn = bottom.add("button", undefined, "保存并开始");

    function rebuildLayerList() {
        layerList.removeAll();
        for (var i = 0; i < scene.nodes.length; i++) {
            var n = scene.nodes[i];
            var entry = roleMap[n.fullName] || "";
            var r = getEntryRole(entry);
            var p = getEntryParent(entry);
            var pText = (p && p !== "__CANVAS__") ? " @" + shortPath(p) : "";
            var label = (r ? "[" + r + pText + "] " : "[未分配] ") + indent(n.depth) + n.name;
            if (!n.visible) label += "  (hidden)";
            var item = layerList.add("item", label);
            item.nodeIndex = i;
        }
        rebuildSummary();
    }

    function rebuildSummary() {
        summaryList.removeAll();
        var counts = {};
        for (var k in roleMap) {
            if (roleMap.hasOwnProperty(k)) {
                var r = getEntryRole(roleMap[k]);
                if (!r || r === "IGNORE" || r === "忽略") continue;
                counts[r] = (counts[r] || 0) + 1;
            }
        }
        var any = false;
        for (var i = 0; i < roles.length; i++) {
            var rr = roles[i];
            if (counts[rr]) {
                summaryList.add("item", rr + "  " + counts[rr]);
                any = true;
            }
        }
        if (!any) summaryList.add("item", "暂无分配");
    }

    function selectedItems() {
        var sel = layerList.selection;
        var arr = [];
        if (!sel) return arr;
        if (sel instanceof Array) {
            for (var i = 0; i < sel.length; i++) arr.push(sel[i]);
        } else {
            arr.push(sel);
        }
        return arr;
    }

    assignBtn.onClick = function () {
        var arr = selectedItems();
        if (arr.length === 0) return;
        var role = roleDrop.selection ? roleDrop.selection.text : "忽略";
        var parentRef = parentDrop.selection ? parentDrop.selection.parentFullName : "__CANVAS__";
        for (var i = 0; i < arr.length; i++) {
            var node = scene.nodes[arr[i].nodeIndex];
            // 避免把自己设为自己的依附对象。
            if (parentRef === node.fullName) parentRef = "__CANVAS__";
            roleMap[node.fullName] = makeEntry(role, parentRef);
        }
        rebuildLayerList();
    };

    clearBtn.onClick = function () {
        var arr = selectedItems();
        if (arr.length === 0) return;
        for (var i = 0; i < arr.length; i++) {
            var node = scene.nodes[arr[i].nodeIndex];
            roleMap[node.fullName] = "";
        }
        rebuildLayerList();
    };

    guessBtn.onClick = function () {
        for (var i = 0; i < scene.nodes.length; i++) {
            var node = scene.nodes[i];
            if (roleMap[node.fullName]) continue;
            var g = guessRole(node.name);
            if (g) roleMap[node.fullName] = g;
        }
        rebuildLayerList();
    };

    importBtn.onClick = function () {
        var f = File.openDialog("选择分配文件", "*.txt");
        if (!f) return;
        var imported = loadMap(f);
        roleMap = imported;
        rebuildLayerList();
        alert("已导入分配文件：\n" + f.fsName);
    };

    exportBtn.onClick = function () {
        var f = File.saveDialog("导出分配文件", "*.txt");
        if (!f) return;
        saveMap(f, roleMap);
        alert("已导出分配文件：\n" + f.fsName);
    };

    saveBtn.onClick = function () {
        saveMap(mapFile, roleMap);
        alert("已保存分配。") ;
    };

    cancelBtn.onClick = function () {
        win.close(0);
    };

    startBtn.onClick = function () {
        if (!outputFolder) {
            alert("请选择导出目录。") ;
            return;
        }
        var targets = parseTargets(sizeInput.text);
        if (targets.length === 0) {
            alert("请输入至少一个有效尺寸，例如 1200x628。") ;
            return;
        }
        var count = countAssigned(roleMap);
        if (count === 0) {
            alert("至少分配一个模块。") ;
            return;
        }
        win.close(1);
    };

    rebuildLayerList();

    var result = win.show();
    if (result !== 1) return null;

    var q = parseInt(jpgQuality.text, 10);
    if (isNaN(q)) q = 90;
    q = clamp(q, 1, 100);

    return {
        map: roleMap,
        targets: parseTargets(sizeInput.text),
        outputFolder: outputFolder,
        format: fmt.selection.text,
        jpgQuality: q,
        keepOpen: keepOpen.value
    };
}

/* ============================================================
   Scene Capture
============================================================ */

function captureScene(doc) {
    var scene = {
        doc: doc,
        sourceW: toPx(doc.width),
        sourceH: toPx(doc.height),
        nodes: []
    };
    walkLayers(doc.layers, "", 0, scene);
    return scene;
}

function walkLayers(layers, prefix, depth, scene) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var full = prefix ? prefix + "/" + layer.name : layer.name;
        var node = {
            layer: layer,
            name: layer.name,
            fullName: full,
            depth: depth,
            typename: layer.typename,
            visible: safeVisible(layer),
            sourceBox: safeBounds(layer)
        };
        scene.nodes.push(node);
        if (layer.typename === "LayerSet") {
            walkLayers(layer.layers, full, depth + 1, scene);
        }
    }
}

function safeVisible(layer) {
    try { return layer.visible; } catch (e) { return true; }
}

/* ============================================================
   Adapt
============================================================ */

function adaptTarget(sourceDoc, scene, roleMap, targetW, targetH, options) {
    var log = [];
    var sourceRatio = scene.sourceW / scene.sourceH;
    var targetRatio = targetW / targetH;
    var delta = Math.abs(Math.log(targetRatio / sourceRatio));
    var severe = delta >= 0.7;

    log.push("");
    log.push("Target: " + targetW + "x" + targetH + " / delta=" + round2(delta) + " / severe=" + severe);

    var outName = removeExtension(sourceDoc.name) + "_" + targetW + "x" + targetH;
    var targetDoc = app.documents.add(
        UnitValue(targetW, "px"),
        UnitValue(targetH, "px"),
        sourceDoc.resolution,
        outName,
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );

    var assigned = buildAssignedNodes(scene, roleMap);

    duplicateAssignedLayers(sourceDoc, targetDoc, assigned, log);

    var ctx = {
        sourceDoc: sourceDoc,
        targetDoc: targetDoc,
        scene: scene,
        assigned: assigned,
        targetW: targetW,
        targetH: targetH,
        sourceRatio: sourceRatio,
        targetRatio: targetRatio,
        delta: delta,
        severe: severe,
        results: {},
        nodeResults: {},
        log: log
    };

    // 每个被分配的图层/图层组都是独立模块。
    // 第一轮：依附画布的模块。
    processModules(ctx, "canvas");

    // 第二轮：依附其他图层的模块。
    processModules(ctx, "dependent");

    runChecks(ctx);
    exportDoc(targetDoc, outName, options, log);

    if (!options.keepOpen) {
        try { targetDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
    }

    return log;
}

function buildAssignedNodes(scene, roleMap) {
    var out = [];
    for (var i = 0; i < scene.nodes.length; i++) {
        var n = scene.nodes[i];
        var entry = roleMap[n.fullName] || "";
        var role = getEntryRole(entry);
        var parentRef = getEntryParent(entry);
        if (!role || role === "IGNORE" || role === "忽略") continue;
        if (!validBox(n.sourceBox)) continue;
        n.role = normalizeBaseRole(role);
        n.roleRaw = role;
        n.parentRef = parentRef || "__CANVAS__";
        n.targetLayer = null;
        out.push(n);
    }
    return out;
}

function bucketNodes(nodes) {
    var b = {};
    for (var i = 0; i < nodes.length; i++) {
        var role = nodes[i].role;
        var parentRef = nodes[i].parentRef || "__CANVAS__";
        var key = role + "@@" + parentRef;
        if (!b[key]) b[key] = { role: role, parentRef: parentRef, nodes: [] };
        b[key].nodes.push(nodes[i]);
    }
    return b;
}


function duplicateAssignedLayers(sourceDoc, targetDoc, assigned, log) {
    // 只复制被分配的图层/组；如果父组已分配，则跳过子项，避免重复复制。
    var topNodes = [];
    for (var i = 0; i < assigned.length; i++) {
        if (!hasAssignedAncestor(assigned[i], assigned)) topNodes.push(assigned[i]);
    }

    // 从底到顶复制，尽量保持原层级视觉顺序。
    for (var j = topNodes.length - 1; j >= 0; j--) {
        var n = topNodes[j];
        try {
            app.activeDocument = sourceDoc;
            sourceDoc.activeLayer = n.layer;
            var dup = n.layer.duplicate(targetDoc, ElementPlacement.PLACEATBEGINNING);
            n.targetLayer = dup;
            bindChildrenTarget(n, dup, assigned);
            log.push("COPY [" + n.roleRaw + "] " + n.fullName);
        } catch (e) {
            log.push("ERROR copy failed: " + n.fullName + " / " + e.message);
        }
    }
    app.activeDocument = targetDoc;
}

function hasAssignedAncestor(node, assigned) {
    for (var i = 0; i < assigned.length; i++) {
        var p = assigned[i];
        if (p === node) continue;
        if (isAncestorPath(p.fullName, node.fullName)) return true;
    }
    return false;
}

function isAncestorPath(parentPath, childPath) {
    return childPath.indexOf(parentPath + "/") === 0;
}

function bindChildrenTarget(parentNode, duplicatedLayer, assigned) {
    // 如果复制的是组，则把已分配的子节点绑定到复制组里的对应子图层。
    if (parentNode.typename !== "LayerSet") return;
    for (var i = 0; i < assigned.length; i++) {
        var child = assigned[i];
        if (child === parentNode) continue;
        if (!isAncestorPath(parentNode.fullName, child.fullName)) continue;
        var relative = child.fullName.substring(parentNode.fullName.length + 1);
        child.targetLayer = findLayerByRelativePath(duplicatedLayer, relative);
    }
}

function findLayerByRelativePath(groupLayer, relativePath) {
    var parts = relativePath.split("/");
    var cur = groupLayer;
    for (var i = 0; i < parts.length; i++) {
        if (!cur || cur.typename !== "LayerSet") return null;
        cur = findChildByName(cur, parts[i]);
    }
    return cur;
}

function findChildByName(groupLayer, name) {
    for (var i = 0; i < groupLayer.layers.length; i++) {
        if (groupLayer.layers[i].name === name) return groupLayer.layers[i];
    }
    return null;
}

/* ============================================================
   Layout Buckets
============================================================ */

function processModules(ctx, mode) {
    // 兼容旧调用：实际只在第一次调用时统一调度所有模块。
    if (ctx._processedAllModules) return;
    ctx._processedAllModules = true;
    processAllModules(ctx);
}

function processAllModules(ctx) {
    var pending = [];
    for (var i = 0; i < ctx.assigned.length; i++) pending.push(ctx.assigned[i]);

    var guard = 0;
    while (pending.length > 0 && guard < 50) {
        guard++;
        var candidates = [];
        var rest = [];

        for (var i = 0; i < pending.length; i++) {
            var n = pending[i];
            if (canProcessModule(ctx, n, pending)) candidates.push(n);
            else rest.push(n);
        }

        if (candidates.length === 0) {
            // 依赖链无法解决时，剩下的按画布处理，避免整个流程卡死。
            for (var r = 0; r < rest.length; r++) {
                ctx.log.push("WARN 依赖无法解决，按画布处理：" + rest[r].fullName);
                rest[r].parentRef = "__CANVAS__";
            }
            candidates = rest;
            rest = [];
        }

        candidates.sort(function (a, b) {
            return rolePriority(a.role) - rolePriority(b.role);
        });

        for (var j = 0; j < candidates.length; j++) {
            layoutOneModule(ctx, candidates[j]);
        }
        pending = rest;
    }
}

function canProcessModule(ctx, node, pending) {
    // 副标题按画布独立处理，不再等待主标题，也不依附其它模块。
    if (node.role === "SUBTITLE") return true;

    if (!node.parentRef || node.parentRef === "__CANVAS__") return true;
    if (ctx.nodeResults[node.parentRef]) return true;
    return false;
}

function hasPendingRole(pending, role) {
    for (var i = 0; i < pending.length; i++) {
        if (pending[i].role === role) return true;
    }
    return false;
}


function rolePriority(role) {
    if (role === "BG_MAIN") return 10;
    if (role === "BG_FILL") return 20;
    if (role === "BG_OBJECT") return 30;
    if (role === "CORNER_CHAR") return 35;
    if (role === "FRAME") return 40;
    if (role === "SUBJECT") return 50;
    if (role === "TITLE") return 60;
    if (role === "SUBTITLE") return 70;
    if (role === "TEXT") return 80;
    if (role === "CTA") return 90;
    if (role === "BOTTOM_BANNER") return 95;
    if (role === "LOGO") return 100;
    return 999;
}

function layoutOneModule(ctx, node) {
    if (!node || !node.targetLayer || !validBox(node.sourceBox)) return;

    var role = node.role;
    var b = node.sourceBox;
    var targetBox = null;
    var allowNonUniform = false;
    var reason = displayRoleName(role);

    if (node.parentRef && node.parentRef !== "__CANVAS__" && role !== "SUBTITLE") {
        var base = getBasePair(ctx, node.parentRef);
        if (base) {
            if (role === "BG_OBJECT" || role === "CORNER_CHAR") {
                targetBox = boxFollowParentWeak(ctx, b, base.sourceBox, base.targetBox, role);
            } else {
                targetBox = boxFollowParent(ctx, b, base.sourceBox, base.targetBox);
            }
            allowNonUniform = (role === "FRAME" || role === "BG_FILL");
            reason = displayRoleName(role) + " follow " + shortPath(node.parentRef);
        } else {
            ctx.log.push("WARN 依附对象尚未生成，改按画布处理：" + node.fullName + " -> " + node.parentRef);
        }
    }

    if (!targetBox) {
        if (role === "BG_MAIN") {
            targetBox = boxBGMain(ctx, b, node.roleRaw);
        } else if (role === "BG_FILL") {
            targetBox = boxFourEdge(ctx, b);
            allowNonUniform = true;
        } else if (role === "FRAME") {
            targetBox = boxFrameContinuous(ctx, b);
            allowNonUniform = true;
        } else if (role === "BG_OBJECT") {
            targetBox = boxBGObject(ctx, b, node.roleRaw);
        } else if (role === "CORNER_CHAR") {
            targetBox = boxCornerCharacter(ctx, b);
        } else if (role === "SUBJECT") {
            targetBox = boxSubject(ctx, b, node.roleRaw);
        } else if (role === "TITLE") {
            targetBox = boxTitle(ctx, b);
        } else if (role === "SUBTITLE") {
            targetBox = boxSubtitle(ctx, b);
        } else if (role === "TEXT") {
            targetBox = boxText(ctx, b);
        } else if (role === "CTA") {
            targetBox = boxCTA(ctx, b, node.roleRaw);
        } else if (role === "BOTTOM_BANNER") {
            targetBox = boxBottomBanner(ctx, b);
            allowNonUniform = true; // 底部横幅允许横向有限拉伸，用来铺满底栏。
        } else if (role === "LOGO") {
            targetBox = boxLogo(ctx, b, node.roleRaw);
        }
    }

    if (!validBox(targetBox)) return;

    transformLayer(ctx, node, targetBox, allowNonUniform, reason);
    ctx.nodeResults[node.fullName] = targetBox;
    if (!ctx.results[role]) ctx.results[role] = targetBox;
}


function boxBGMain(ctx, b, roleRaw) {
    var scale = Math.max(ctx.targetW / b.width, ctx.targetH / b.height);
    var nw = b.width * scale;
    var nh = b.height * scale;
    var left = (ctx.targetW - nw) / 2;
    var top = (ctx.targetH - nh) / 2;

    if (contains(roleRaw, "偏左") || contains(roleRaw, "LEFT")) left = 0;
    if (contains(roleRaw, "偏右") || contains(roleRaw, "RIGHT")) left = ctx.targetW - nw;
    if (contains(roleRaw, "偏上") || contains(roleRaw, "TOP")) top = 0;
    if (contains(roleRaw, "偏下") || contains(roleRaw, "BOTTOM")) top = ctx.targetH - nh;

    return makeBox(left, top, nw, nh);
}

function boxFourEdge(ctx, b) {
    var left = (b.left / ctx.scene.sourceW) * ctx.targetW;
    var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
    var top = (b.top / ctx.scene.sourceH) * ctx.targetH;
    var bottom = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
    return makeBox(left, top, ctx.targetW - left - right, ctx.targetH - top - bottom);
}


function bottomBannerMaxHeightRatio(ctx) {
    // 越横，底部条越应该扁；越竖，底部条可以稍高。
    return mixValue(0.15, 0.105, landscapeWeight(ctx));
}

function bottomBannerReservedHeight(ctx) {
    return ctx.targetH * bottomBannerMaxHeightRatio(ctx);
}

function limitBoxAboveBottomBanner(ctx, box) {
    var margin = ctx.targetH * 0.035;
    var bottomLimit = ctx.targetH - bottomBannerReservedHeight(ctx) - margin;
    var b = makeBox(box.left, box.top, box.width, box.height);

    if (b.bottom <= bottomLimit) return b;

    // 先尝试整体上移。
    var shiftedTop = bottomLimit - b.height;
    var minTop = ctx.targetH * 0.10;
    if (shiftedTop >= minTop) {
        return makeBox(b.left, shiftedTop, b.width, b.height);
    }

    // 上移不够，再压缩高度，避免和底部横幅撞车。
    var newTop = minTop;
    var newH = bottomLimit - newTop;
    if (newH < ctx.targetH * 0.22) newH = ctx.targetH * 0.22;
    return makeBox(b.left, newTop, b.width, newH);
}

function boxFrameContinuous(ctx, b) {
    var base = boxFourEdge(ctx, b);

    var portrait = portraitWeight(ctx);
    var change = changeWeight(ctx);
    var t = portrait * change;

    // 竖屏内容槽：不是硬切，而是和四边约束连续混合。
    var slotW = ctx.targetW * 0.58;
    var slotH = ctx.targetH * 0.54;
    var slotTop = ctx.targetH * 0.22;

    var subjectSide = subjectHorizontalSide(ctx);
    var slotLeft;
    if (subjectSide === "LEFT") {
        slotLeft = ctx.targetW * 0.36;
    } else if (subjectSide === "RIGHT") {
        slotLeft = ctx.targetW * 0.06;
    } else {
        slotLeft = (ctx.targetW - slotW) / 2;
    }

    if (slotLeft + slotW > ctx.targetW * 0.96) slotLeft = ctx.targetW * 0.96 - slotW;
    if (slotLeft < ctx.targetW * 0.04) slotLeft = ctx.targetW * 0.04;

    var slot = makeBox(slotLeft, slotTop, slotW, slotH);
    var out = mixBox(base, slot, t);

    // 超横屏时给底部横幅留出固定空间，避免框和底栏互撞。
    out = limitBoxAboveBottomBanner(ctx, out);
    return out;
}


function boxBGObject(ctx, b, roleRaw) {
    var priority = parsePriority(roleRaw);
    if (ctx.severe && priority === "P3") {
        // V1 不删除 BG_OBJECT_P3，只是缩小存在感；避免误删。
    }

    var sourceArea = ctx.scene.sourceW * ctx.scene.sourceH;
    var targetArea = ctx.targetW * ctx.targetH;
    var scale = Math.sqrt(targetArea / sourceArea);
    scale = clamp(scale, 0.6, 1.4);
    if (ctx.severe && priority === "P3") scale = scale * 0.75;

    var nw = b.width * scale;
    var nh = b.height * scale;

    var cx = b.centerX / ctx.scene.sourceW;
    var cy = b.centerY / ctx.scene.sourceH;
    var ratioX = cx * ctx.targetW;
    var ratioY = cy * ctx.targetH;

    var corner = nearestCorner(cx, cy);
    var r = ctx.severe ? 0.4 : 0.3;
    var w = Math.max(0, 1 - corner.d / r);
    w = w * w;
    var anchor = anchorCenterForCorner(ctx, b, nw, nh, corner.name);

    var x = anchor.x * w + ratioX * (1 - w);
    var y = anchor.y * w + ratioY * (1 - w);
    return makeBox(x - nw / 2, y - nh / 2, nw, nh);
}


function boxCornerCharacter(ctx, b) {
    // 用于右上/左下这类小人物、小角色、副主体。
    // 它比背景物体更像一个“可识别的小主体”，所以按短边比例缩放，并吸附最近角。
    var sourceShort = Math.min(ctx.scene.sourceW, ctx.scene.sourceH);
    var targetShort = Math.min(ctx.targetW, ctx.targetH);
    var hRatio = b.height / sourceShort;
    hRatio = clamp(hRatio, 0.10, 0.22);

    var nh = targetShort * hRatio;
    if (ctx.severe) nh = nh * 1.08;
    var scale = nh / b.height;
    var nw = b.width * scale;

    var cx = b.centerX / ctx.scene.sourceW;
    var cy = b.centerY / ctx.scene.sourceH;
    var corner = nearestCorner(cx, cy);
    var anchor = anchorCenterForCorner(ctx, b, nw, nh, corner.name);

    return makeBox(anchor.x - nw / 2, anchor.y - nh / 2, nw, nh);
}

function boxSubject(ctx, b, roleRaw) {
    var landscape = landscapeWeight(ctx);
    var portrait = 1 - landscape;

    // 连续变化：越横越接近占满高度，越竖越保留大半身。
    var hRatio = mixValue(0.78, 0.95, landscape);

    var nh = ctx.targetH * hRatio;
    var scale = nh / b.height;
    var nw = b.width * scale;

    var anchorH = autoHorizontalAnchor(b, ctx.scene);
    var bottom = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
    var top = ctx.targetH - bottom - nh;
    var left;

    if (anchorH === "LEFT") {
        left = (b.left / ctx.scene.sourceW) * ctx.targetW;
    } else if (anchorH === "RIGHT") {
        var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        left = ctx.targetW - right - nw;
    } else {
        left = (ctx.targetW - nw) / 2;
    }

    var rawBox = makeBox(left, top, nw, nh);
    var clamped = clampBoxIntoCanvas(rawBox, ctx.targetW, ctx.targetH);

    // 越竖越收进画布，越横越允许左右出血。
    return mixBox(rawBox, clamped, portrait);
}

function boxTitle(ctx, b) {
    var aspect = b.width / b.height;
    var landscape = landscapeWeight(ctx);

    var widthRatio = mixValue(0.78, 0.42, landscape);
    var nw = ctx.targetW * widthRatio;
    var nh = nw / aspect;

    var centeredLeft = (ctx.targetW - nw) / 2;
    var centeredTop = ctx.targetH * 0.08;

    var side = preferredTitleSide(ctx);
    var sideLeft = side === "LEFT" ? ctx.targetW * 0.07 : ctx.targetW - ctx.targetW * 0.07 - nw;
    var sideTop = ctx.targetH * 0.12;

    var left = mixValue(centeredLeft, sideLeft, landscape);
    var top = mixValue(centeredTop, sideTop, landscape);

    return makeBox(left, top, nw, nh);
}

function boxSubtitle(ctx, b) {
    // 副标题不跟随主标题，按“独立图案/独立标签”处理。
    // 保持其在画布中的区域感：原来偏左上，适配后仍偏左上。
    var aspect = b.width / b.height;
    var rawWRatio = b.width / ctx.scene.sourceW;
    var wRatio = clamp(rawWRatio, 0.18, 0.42);
    if (ctx.targetRatio >= 1.3) wRatio = clamp(wRatio * 0.92, 0.16, 0.38);
    var nw = ctx.targetW * wRatio;
    var nh = nw / aspect;

    var cx = b.centerX / ctx.scene.sourceW;
    var cy = b.centerY / ctx.scene.sourceH;

    var left, top;
    if (cx < 0.28) left = (b.left / ctx.scene.sourceW) * ctx.targetW;
    else if (cx > 0.72) {
        var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        left = ctx.targetW - right - nw;
    } else left = cx * ctx.targetW - nw / 2;

    if (cy < 0.28) top = (b.top / ctx.scene.sourceH) * ctx.targetH;
    else if (cy > 0.72) {
        var bottom = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
        top = ctx.targetH - bottom - nh;
    } else top = cy * ctx.targetH - nh / 2;

    return clampBoxIntoCanvas(makeBox(left, top, nw, nh), ctx.targetW, ctx.targetH);
}

function boxText(ctx, b) {
    var aspect = b.width / b.height;
    var widthRatio = ctx.targetRatio >= 1.3 ? 0.26 : (ctx.targetRatio < 0.9 ? 0.58 : 0.50);
    var nw = ctx.targetW * widthRatio;
    var nh = nw / aspect;
    var cx = (b.centerX / ctx.scene.sourceW) * ctx.targetW;
    var cy = (b.centerY / ctx.scene.sourceH) * ctx.targetH;
    return clampBoxIntoCanvas(makeBox(cx - nw / 2, cy - nh / 2, nw, nh), ctx.targetW, ctx.targetH);
}

function boxCTA(ctx, b, roleRaw) {
    var aspect = b.width / b.height;
    var wRatio = ctx.targetRatio >= 1.3 ? 0.25 : (ctx.targetRatio < 0.9 ? 0.42 : 0.34);
    var nw = ctx.targetW * wRatio;
    var nh = nw / aspect;

    var anchorH = autoHorizontalAnchor(b, ctx.scene);
    var bottom = Math.max(((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH, ctx.targetH * 0.05);
    var top = ctx.targetH - bottom - nh;
    var left;

    if (anchorH === "LEFT") left = (b.left / ctx.scene.sourceW) * ctx.targetW;
    else if (anchorH === "RIGHT") {
        var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        left = ctx.targetW - right - nw;
    } else left = (ctx.targetW - nw) / 2;

    return fitBoxIntoSafe(makeBox(left, top, nw, nh), ctx.targetW, ctx.targetH);
}

function boxBottomBanner(ctx, b) {
    var aspect = b.width / b.height;

    // 底部横幅始终横向铺满，但在超横屏中会变扁，避免挤占内容区。
    var desiredW = ctx.targetW * 1.04;
    var naturalW = desiredW;
    var naturalH = naturalW / aspect;

    var minH = ctx.targetH * mixValue(0.075, 0.055, landscapeWeight(ctx));
    var maxH = bottomBannerReservedHeight(ctx);

    if (naturalH > maxH) {
        naturalH = maxH;
        naturalW = naturalH * aspect;
    }
    if (naturalH < minH) {
        naturalH = minH;
        naturalW = naturalH * aspect;
    }

    // 高度受限时，允许横向拉伸；超横屏会更倾向于拉伸而不是变高。
    var stretchLimit = mixValue(1.32, 1.55, landscapeWeight(ctx) * extremeWeight(ctx));
    var finalW = naturalW;
    if (finalW < desiredW) finalW = Math.min(desiredW, naturalW * stretchLimit);

    var finalH = naturalH;
    var left = (ctx.targetW - finalW) / 2;
    var bottom = ctx.targetH * 0.015;
    var top = ctx.targetH - bottom - finalH;

    return makeBox(left, top, finalW, finalH);
}

function boxLogo(ctx, b, roleRaw) {
    var aspect = b.width / b.height;
    var rawW = (b.width / ctx.scene.sourceW) * ctx.targetW;
    var nw = clamp(rawW, ctx.targetW * 0.08, ctx.targetW * 0.15);
    var nh = nw / aspect;
    var hv = autoCornerAnchor(b, ctx.scene);
    var h = hv.h;
    var v = hv.v;

    var top, left;
    if (v === "BOTTOM") {
        var bottom = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
        top = ctx.targetH - bottom - nh;
    } else {
        top = (b.top / ctx.scene.sourceH) * ctx.targetH;
    }

    if (h === "LEFT") {
        left = (b.left / ctx.scene.sourceW) * ctx.targetW;
    } else {
        var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        left = ctx.targetW - right - nw;
    }

    return fitBoxIntoSafe(makeBox(left, top, nw, nh), ctx.targetW, ctx.targetH);
}

/* ============================================================
   Transform
============================================================ */

function transformLayer(ctx, node, newBox, allowNonUniform, reason) {
    var layer = node.targetLayer;
    if (!layer || !validBox(newBox)) return;

    app.activeDocument = ctx.targetDoc;
    unlockLayer(layer);

    var cur = safeBounds(layer);
    if (!validBox(cur)) {
        ctx.log.push("WARN invalid bounds: " + node.fullName);
        return;
    }

    var sx = (newBox.width / cur.width) * 100;
    var sy = (newBox.height / cur.height) * 100;

    if (!allowNonUniform) {
        var s = Math.min(sx, sy);
        sx = s;
        sy = s;
    }

    try {
        layer.resize(sx, sy, AnchorPosition.MIDDLECENTER);
    } catch (e1) {
        ctx.log.push("ERROR resize: " + node.fullName + " / " + e1.message);
        return;
    }

    var after = safeBounds(layer);
    if (!validBox(after)) return;

    var dx = newBox.left - after.left;
    var dy = newBox.top - after.top;

    try {
        layer.translate(UnitValue(dx, "px"), UnitValue(dy, "px"));
        ctx.log.push("OK " + reason + " -> " + node.fullName + " " + boxToString(newBox));
    } catch (e2) {
        ctx.log.push("ERROR move: " + node.fullName + " / " + e2.message);
    }
}

function unlockLayer(layer) {
    try { layer.allLocked = false; } catch (e1) {}
    try { layer.pixelsLocked = false; } catch (e2) {}
    try { layer.positionLocked = false; } catch (e3) {}
    try { layer.transparentPixelsLocked = false; } catch (e4) {}
}

/* ============================================================
   Checks / Export
============================================================ */

function runChecks(ctx) {
    var warnRoles = ["TITLE", "SUBTITLE", "TEXT", "CTA", "BOTTOM_BANNER", "LOGO"];
    for (var i = 0; i < ctx.assigned.length; i++) {
        var n = ctx.assigned[i];
        if (!n.targetLayer) continue;
        if (!arrayContains(warnRoles, n.role)) continue;
        var b = safeBounds(n.targetLayer);
        var vf = visibleFraction(b, ctx.targetW, ctx.targetH);
        if (vf < 0.999) {
            ctx.log.push("WARN may be clipped: " + n.role + " / " + n.fullName);
        }
    }
}

function exportDoc(doc, baseName, options, log) {
    var psdFile = new File(options.outputFolder.fsName + "/" + sanitize(baseName) + ".psd");

    try {
        var psdOptions = new PhotoshopSaveOptions();
        psdOptions.layers = true;
        psdOptions.alphaChannels = true;
        psdOptions.embedColorProfile = true;
        doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);
        log.push("SAVE PSD " + psdFile.fsName);
    } catch (e0) {
        log.push("ERROR save PSD: " + e0.message);
        return;
    }

    if (options.format === "PSD") return;

    var isJPG = options.format.indexOf("JPG") >= 0;
    var ext = isJPG ? ".jpg" : ".png";
    var previewFile = new File(options.outputFolder.fsName + "/" + sanitize(baseName) + ext);
    var opt = new ExportOptionsSaveForWeb();

    if (isJPG) {
        opt.format = SaveDocumentType.JPEG;
        opt.quality = options.jpgQuality;
        opt.optimized = true;
    } else {
        opt.format = SaveDocumentType.PNG;
        opt.PNG8 = false;
        opt.transparency = true;
        opt.interlaced = false;
    }

    try {
        doc.exportDocument(previewFile, ExportType.SAVEFORWEB, opt);
        log.push("EXPORT PREVIEW " + previewFile.fsName);
    } catch (e) {
        log.push("ERROR export preview: " + e.message);
    }
}

function writeLog(folder, lines) {
    try {
        var f = new File(folder.fsName + "/AutoSizeAdapter_CN_WideFix_log.txt");
        f.encoding = "UTF-8";
        f.open("w");
        for (var i = 0; i < lines.length; i++) f.writeln(lines[i]);
        f.close();
    } catch (e) {}
}

/* ============================================================
   Map Persistence
============================================================ */

function getMapFile(doc) {
    var folder;
    try {
        folder = doc.fullName.parent;
    } catch (e) {
        folder = Folder.myDocuments;
    }
    return new File(folder.fsName + "/" + removeExtension(doc.name) + ".autosize-map.txt");
}

function saveMap(file, roleMap) {
    file.encoding = "UTF-8";
    file.open("w");
    file.writeln("# AutoSizeAdapter role map");
    for (var k in roleMap) {
        if (roleMap.hasOwnProperty(k)) {
            var r = roleMap[k];
            if (!r) continue;
            file.writeln(enc(k) + "\t" + r);
        }
    }
    file.close();
}

function loadMap(file) {
    var map = {};
    if (!file.exists) return map;
    file.encoding = "UTF-8";
    if (!file.open("r")) return map;
    while (!file.eof) {
        var line = file.readln();
        if (!line || line.charAt(0) === "#") continue;
        var parts = line.split("\t");
        if (parts.length >= 2) {
            map[dec(parts[0])] = parts[1];
        }
    }
    file.close();
    return map;
}

/* ============================================================
   Parsing / Helpers
============================================================ */

function parseTargets(text) {
    var lines = String(text).split(/\r|\n/);
    var arr = [];
    for (var i = 0; i < lines.length; i++) {
        var s = trim(lines[i]).replace(/\s/g, "");
        var m = s.match(/^(\d+)[xX＊*](\d+)$/);
        if (m) arr.push({ w: parseInt(m[1], 10), h: parseInt(m[2], 10) });
    }
    return arr;
}

function normalizeBaseRole(role) {
    // 分配面板只让用户选择“是什么”，不让用户手选方向。
    // 方向、居中、偏左、偏右、靠上、靠下，全部由脚本根据原位置计算。
    if (startsWith(role, "背景主图") || startsWith(role, "BG_MAIN")) return "BG_MAIN";
    if (startsWith(role, "背景填充") || startsWith(role, "BG_FILL")) return "BG_FILL";
    if (startsWith(role, "背景物体") || startsWith(role, "BG_OBJECT")) return "BG_OBJECT";
    if (startsWith(role, "副主体") || startsWith(role, "角标人物") || startsWith(role, "CORNER_CHAR")) return "CORNER_CHAR";
    if (startsWith(role, "主体") || startsWith(role, "SUBJECT")) return "SUBJECT";
    if (role === "主标题" || role === "TITLE") return "TITLE";
    if (role === "副标题" || role === "SUBTITLE") return "SUBTITLE";
    if (role === "其他文字" || role === "TEXT") return "TEXT";
    if (startsWith(role, "行动按钮") || startsWith(role, "CTA")) return "CTA";
    if (startsWith(role, "底部横幅") || startsWith(role, "BOTTOM_BANNER")) return "BOTTOM_BANNER";
    if (startsWith(role, "Logo") || startsWith(role, "LOGO")) return "LOGO";
    if (role === "框/容器" || role === "FRAME") return "FRAME";
    return role;
}

function guessRole(name) {
    var s = name.toUpperCase();
    if (s.indexOf("BG") >= 0 || s.indexOf("背景") >= 0) return "背景主图";
    if (s.indexOf("小人") >= 0 || s.indexOf("角标") >= 0 || s.indexOf("小角色") >= 0) return "副主体";
    if (s.indexOf("人物") >= 0 || s.indexOf("角色") >= 0 || s.indexOf("主体") >= 0 || s.indexOf("SUBJECT") >= 0) return "主体";
    if (s.indexOf("标题") >= 0 || s.indexOf("TITLE") >= 0) return "主标题";
    if (s.indexOf("副标题") >= 0 || s.indexOf("SUB") >= 0) return "副标题";
    if (s.indexOf("文字") >= 0 || s.indexOf("TEXT") >= 0) return "其他文字";
    if (s.indexOf("底部") >= 0 || s.indexOf("横条") >= 0 || s.indexOf("横幅") >= 0 || s.indexOf("标语") >= 0) return "底部横幅";
    if (s.indexOf("按钮") >= 0 || s.indexOf("CTA") >= 0 || s.indexOf("DOWNLOAD") >= 0 || s.indexOf("下载") >= 0) return "行动按钮";
    if (s.indexOf("LOGO") >= 0 || s.indexOf("标志") >= 0 || s.indexOf("品牌") >= 0) return "Logo";
    if (s.indexOf("框") >= 0 || s.indexOf("容器") >= 0 || s.indexOf("FRAME") >= 0) return "框/容器";
    return "";
}

function parsePriority(roleRaw) {
    if (contains(roleRaw, "P1")) return "P1";
    if (contains(roleRaw, "P2")) return "P2";
    return "P3";
}

function parseHorizontal(roleRaw, def) {
    if (contains(roleRaw, "左") || contains(roleRaw, "LEFT")) return "LEFT";
    if (contains(roleRaw, "右") || contains(roleRaw, "RIGHT")) return "RIGHT";
    if (contains(roleRaw, "居中") || contains(roleRaw, "CENTER")) return "CENTER";
    return def;
}

function parseVertical(roleRaw, def) {
    if (contains(roleRaw, "上") || contains(roleRaw, "TOP")) return "TOP";
    if (contains(roleRaw, "下") || contains(roleRaw, "底部") || contains(roleRaw, "BOTTOM")) return "BOTTOM";
    return def;
}

function autoHorizontalAnchor(box, scene) {
    var cx = box.centerX / scene.sourceW;
    if (cx < 0.42) return "LEFT";
    if (cx > 0.58) return "RIGHT";
    return "CENTER";
}

function autoCornerAnchor(box, scene) {
    var leftD = box.left;
    var rightD = scene.sourceW - box.right;
    var topD = box.top;
    var bottomD = scene.sourceH - box.bottom;
    return {
        h: leftD <= rightD ? "LEFT" : "RIGHT",
        v: topD <= bottomD ? "TOP" : "BOTTOM"
    };
}

function preferredTitleSide(ctx) {
    for (var i = 0; i < ctx.assigned.length; i++) {
        if (ctx.assigned[i].role === "SUBJECT") {
            var h = autoHorizontalAnchor(ctx.assigned[i].sourceBox, ctx.scene);
            if (h === "RIGHT") return "LEFT";
            if (h === "LEFT") return "RIGHT";
            return "LEFT";
        }
    }
    return "LEFT";
}


function findBucketNodes(ctx, role) {
    for (var key in ctx.buckets) {
        if (ctx.buckets.hasOwnProperty(key) && ctx.buckets[key].role === role) {
            return ctx.buckets[key].nodes;
        }
    }
    return null;
}

function getBasePair(ctx, parentFullName) {
    var sourceNode = findNodeByFullName(ctx.scene, parentFullName);
    var targetBox = ctx.nodeResults[parentFullName];
    if (!sourceNode || !validBox(sourceNode.sourceBox) || !validBox(targetBox)) return null;
    return { sourceBox: sourceNode.sourceBox, targetBox: targetBox };
}

function findNodeByFullName(scene, fullName) {
    for (var i = 0; i < scene.nodes.length; i++) {
        if (scene.nodes[i].fullName === fullName) return scene.nodes[i];
    }
    return null;
}

function boxFollowParent(ctx, b, parentSource, parentTarget) {
    var relLeft = (b.left - parentSource.left) / parentSource.width;
    var relTop = (b.top - parentSource.top) / parentSource.height;
    var relW = b.width / parentSource.width;
    var relH = b.height / parentSource.height;
    return makeBox(
        parentTarget.left + relLeft * parentTarget.width,
        parentTarget.top + relTop * parentTarget.height,
        relW * parentTarget.width,
        relH * parentTarget.height
    );
}

function boxFollowParentWeak(ctx, b, parentSource, parentTarget, role) {
    // 对装饰 / 副主体：位置主要跟随父对象，缩放只弱跟随。
    // 这样既能保持“依附关系”，又不会因为父对象大幅拉伸而把装饰缩得太小/放得太大。
    var relCx = (b.centerX - parentSource.left) / parentSource.width;
    var relCy = (b.centerY - parentSource.top) / parentSource.height;

    var parentScaleX = parentTarget.width / parentSource.width;
    var parentScaleY = parentTarget.height / parentSource.height;
    var parentScale = Math.sqrt(Math.abs(parentScaleX * parentScaleY));

    var globalScale = Math.sqrt((ctx.targetW * ctx.targetH) / (ctx.scene.sourceW * ctx.scene.sourceH));
    globalScale = clamp(globalScale, 0.65, 1.35);

    var strength = (role === "CORNER_CHAR") ? 0.22 : 0.15;
    var finalScale = globalScale + (parentScale - globalScale) * strength;
    finalScale = clamp(finalScale, globalScale * 0.90, globalScale * 1.18);

    var nw = b.width * finalScale;
    var nh = b.height * finalScale;

    var cx = parentTarget.left + relCx * parentTarget.width;
    var cy = parentTarget.top + relCy * parentTarget.height;

    return clampBoxIntoCanvas(makeBox(cx - nw / 2, cy - nh / 2, nw, nh), ctx.targetW, ctx.targetH);
}


/* ============================================================
   Geometry
============================================================ */

function safeBounds(layer) {
    try {
        var b = layer.bounds;
        var l = toPx(b[0]);
        var t = toPx(b[1]);
        var r = toPx(b[2]);
        var bo = toPx(b[3]);
        return makeBox(l, t, r - l, bo - t);
    } catch (e) {
        return makeBox(0, 0, 0, 0);
    }
}

function unionBounds(nodes) {
    var first = true;
    var l = 0, t = 0, r = 0, b = 0;
    for (var i = 0; i < nodes.length; i++) {
        var box = nodes[i].sourceBox;
        if (!validBox(box)) continue;
        if (first) {
            l = box.left; t = box.top; r = box.right; b = box.bottom;
            first = false;
        } else {
            if (box.left < l) l = box.left;
            if (box.top < t) t = box.top;
            if (box.right > r) r = box.right;
            if (box.bottom > b) b = box.bottom;
        }
    }
    if (first) return makeBox(0, 0, 0, 0);
    return makeBox(l, t, r - l, b - t);
}

function makeBox(left, top, width, height) {
    return {
        left: left,
        top: top,
        width: width,
        height: height,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2
    };
}

function validBox(b) {
    return b && isFiniteNumber(b.left) && isFiniteNumber(b.top) && b.width > 0.5 && b.height > 0.5;
}

function clampBoxIntoCanvas(box, w, h) {
    var l = box.left;
    var t = box.top;
    if (box.width <= w) {
        if (l < 0) l = 0;
        if (l + box.width > w) l = w - box.width;
    }
    if (box.height <= h) {
        if (t < 0) t = 0;
        if (t + box.height > h) t = h - box.height;
    }
    return makeBox(l, t, box.width, box.height);
}

function fitBoxIntoSafe(box, w, h) {
    var safe = { left: w * 0.04, top: h * 0.04, right: w * 0.96, bottom: h * 0.92 };
    var b = makeBox(box.left, box.top, box.width, box.height);
    var maxW = safe.right - safe.left;
    var maxH = safe.bottom - safe.top;
    if (b.width > maxW || b.height > maxH) {
        var s = Math.min(maxW / b.width, maxH / b.height);
        b = makeBox(b.left, b.top, b.width * s, b.height * s);
    }
    if (b.left < safe.left) b.left = safe.left;
    if (b.top < safe.top) b.top = safe.top;
    if (b.left + b.width > safe.right) b.left = safe.right - b.width;
    if (b.top + b.height > safe.bottom) b.top = safe.bottom - b.height;
    return makeBox(b.left, b.top, b.width, b.height);
}

function visibleFraction(box, w, h) {
    var l = Math.max(0, box.left);
    var t = Math.max(0, box.top);
    var r = Math.min(w, box.right);
    var b = Math.min(h, box.bottom);
    var iw = Math.max(0, r - l);
    var ih = Math.max(0, b - t);
    var area = box.width * box.height;
    if (area <= 0) return 0;
    return (iw * ih) / area;
}

function nearestCorner(cx, cy) {
    var dTL = Math.sqrt(cx * cx + cy * cy);
    var dTR = Math.sqrt((1 - cx) * (1 - cx) + cy * cy);
    var dBL = Math.sqrt(cx * cx + (1 - cy) * (1 - cy));
    var dBR = Math.sqrt((1 - cx) * (1 - cx) + (1 - cy) * (1 - cy));
    var name = "TL";
    var d = dTL;
    if (dTR < d) { name = "TR"; d = dTR; }
    if (dBL < d) { name = "BL"; d = dBL; }
    if (dBR < d) { name = "BR"; d = dBR; }
    return { name: name, d: d };
}

function anchorCenterForCorner(ctx, b, nw, nh, corner) {
    var x, y;
    if (corner === "TL") {
        x = (b.left / ctx.scene.sourceW) * ctx.targetW + nw / 2;
        y = (b.top / ctx.scene.sourceH) * ctx.targetH + nh / 2;
    } else if (corner === "TR") {
        var right = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        x = ctx.targetW - right - nw / 2;
        y = (b.top / ctx.scene.sourceH) * ctx.targetH + nh / 2;
    } else if (corner === "BL") {
        var bottom = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
        x = (b.left / ctx.scene.sourceW) * ctx.targetW + nw / 2;
        y = ctx.targetH - bottom - nh / 2;
    } else {
        var right2 = ((ctx.scene.sourceW - b.right) / ctx.scene.sourceW) * ctx.targetW;
        var bottom2 = ((ctx.scene.sourceH - b.bottom) / ctx.scene.sourceH) * ctx.targetH;
        x = ctx.targetW - right2 - nw / 2;
        y = ctx.targetH - bottom2 - nh / 2;
    }
    return { x: x, y: y };
}



function subjectHorizontalSide(ctx) {
    for (var i = 0; i < ctx.assigned.length; i++) {
        if (ctx.assigned[i].role === "SUBJECT") {
            return autoHorizontalAnchor(ctx.assigned[i].sourceBox, ctx.scene);
        }
    }
    return "CENTER";
}

function displayRoleName(role) {
    if (role === "BG_MAIN") return "背景主图";
    if (role === "BG_FILL") return "背景填充";
    if (role === "BG_OBJECT") return "背景物体";
    if (role === "CORNER_CHAR") return "副主体";
    if (role === "SUBJECT") return "主体";
    if (role === "TITLE") return "主标题";
    if (role === "SUBTITLE") return "副标题";
    if (role === "TEXT") return "其他文字";
    if (role === "CTA") return "行动按钮";
    if (role === "BOTTOM_BANNER") return "底部横幅";
    if (role === "LOGO") return "Logo";
    if (role === "FRAME") return "框/容器";
    return role;
}


function mixValue(a, b, t) {
    return a * (1 - t) + b * t;
}

function mixBox(a, b, t) {
    return makeBox(
        mixValue(a.left, b.left, t),
        mixValue(a.top, b.top, t),
        mixValue(a.width, b.width, t),
        mixValue(a.height, b.height, t)
    );
}

function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
}

function smoothstep(edge0, edge1, x) {
    var t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

function aspectX(ctx) {
    return Math.log(ctx.targetW / ctx.targetH);
}

function landscapeWeight(ctx) {
    return smoothstep(-0.25, 0.35, aspectX(ctx));
}

function portraitWeight(ctx) {
    return 1 - landscapeWeight(ctx);
}

function changeWeight(ctx) {
    var sourceX = Math.log(ctx.scene.sourceW / ctx.scene.sourceH);
    return smoothstep(0.25, 0.90, Math.abs(aspectX(ctx) - sourceX));
}

function extremeWeight(ctx) {
    return smoothstep(0.75, 1.35, Math.abs(aspectX(ctx)));
}

/* ============================================================
   Tiny Utils
============================================================ */

function getMapFileNameSafe(name) { return removeExtension(name) + ".autosize-map.txt"; }
function toPx(v) { try { if (v && v.as) return v.as("px"); } catch (e) {} return Number(v); }
function clamp(v, min, max) { if (v < min) return min; if (v > max) return max; return v; }
function round2(v) { return Math.round(v * 100) / 100; }
function isFiniteNumber(v) { return typeof v === "number" && isFinite(v); }
function startsWith(s, p) { return String(s).indexOf(p) === 0; }
function contains(s, sub) { return String(s).toUpperCase().indexOf(String(sub).toUpperCase()) >= 0; }
function trim(s) { return String(s).replace(/^\s+|\s+$/g, ""); }
function indent(n) { var s = ""; for (var i = 0; i < n; i++) s += "  "; return s; }
function appendArray(a, b) { for (var i = 0; i < b.length; i++) a.push(b[i]); }
function countAssigned(map) { var c = 0; for (var k in map) { if (map.hasOwnProperty(k) && getEntryRole(map[k]) && getEntryRole(map[k]) !== "IGNORE" && getEntryRole(map[k]) !== "忽略") c++; } return c; }
function arrayContains(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return true; return false; }
function removeExtension(name) { return String(name).replace(/\.[^\.]+$/, ""); }
function sanitize(name) { return String(name).replace(/[\\\/\:\*\?\"\<\>\|]/g, "_"); }
function boxToString(b) { return "[" + round2(b.left) + "," + round2(b.top) + "," + round2(b.width) + "x" + round2(b.height) + "]"; }
function enc(s) { try { return encodeURIComponent(s); } catch (e) { return escape(s); } }
function dec(s) { try { return decodeURIComponent(s); } catch (e) { return unescape(s); } }
