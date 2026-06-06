# 图片替换说明

画完图以后，把图片放进 `assets` 文件夹，并且使用下面的文件名覆盖原来的占位图即可。

建议优先使用 PNG。小船、岛屿最好是透明背景 PNG；背景图可以是 PNG 或 JPG，但如果改成 JPG，需要同时改代码里的文件名。

## 最低需要画哪些

最少画这些就够第一版：
- 小船：3 张也可以。`boat_idle.png`、`boat_right_1.png`、`boat_left_1.png`
- 岛屿：5 张。
- 水面长背景：1 张。
- 极地车主视觉：1 张。
- HMI 截图：1 张。

如果你只画 3 张小船图，把 `boat_left_2.png` 复制成 `boat_left_1.png`，把 `boat_right_2.png` 复制成 `boat_right_1.png` 就行。

## 文件比例表

| 文件名 | 建议尺寸 | 比例 | 用途 |
|---|---:|---:|---|
| boat_idle.png | 900 × 560 | 约 16:10 | 小船静止 |
| boat_left_1.png | 900 × 560 | 约 16:10 | 向左划船第 1 帧 |
| boat_left_2.png | 900 × 560 | 约 16:10 | 向左划船第 2 帧 |
| boat_right_1.png | 900 × 560 | 约 16:10 | 向右划船第 1 帧 |
| boat_right_2.png | 900 × 560 | 约 16:10 | 向右划船第 2 帧 |
| map_water_bg.png | 3840 × 960 | 4:1 | 划船地图长背景 |
| scroll_texture.png | 3840 × 1080 | 16:9 | 卷轴纸纹 / 颗粒叠加 |
| island_child.png | 900 × 900 | 1:1 | 儿童饮水项目岛 |
| island_polar.png | 900 × 900 | 1:1 | 极地车 HMI 项目岛 |
| island_ai_home.png | 900 × 900 | 1:1 | AI 智能家居项目岛 |
| island_astory.png | 900 × 900 | 1:1 | ASTORY 项目岛 |
| island_more.png | 900 × 900 | 1:1 | 更多实验岛 |
| polar_rover_hero.png | 1920 × 1080 | 16:9 | 极地车项目主视觉 |
| polar_landscape.png | 2560 × 1100 | 约 21:9 | 极地项目页背景 |
| polar_hmi_screen.png | 1920 × 1080 | 16:9 | HMI 界面截图 |

## 注意

1. 文件名必须一模一样。
2. 图片放在 `assets` 文件夹里。
3. 小船和岛屿建议透明 PNG。
4. 替换完之后刷新 `index.html` 就能看到新图。
5. 上传 GitHub / Vercel 时，整个文件夹一起上传，不要漏掉 `assets` 文件夹。


## v2 更新

- 极地车项目页内容已加厚：加入设计挑战、系统架构、核心流程、交互策略、界面输出、可交互原型、反思。
- 极地车项目页左右边缘不会一滚就退出，需要在边缘继续滚动一小段，右上角会出现返回进度提示。


# 极地车项目页 v3 图片资源

详见 `POLAR_IMAGE_GUIDE.md`。
