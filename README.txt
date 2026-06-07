Astory 页面包使用说明

1. 直接把整个 astory_package 文件夹放进你的个人网站项目根目录。
2. 打开 astory.html 即可预览。
3. 如果你的网站首页/划船地图要跳转到这个项目，链接写：astory.html
4. 左上角“返回划船地图”默认链接为：index.html?page=2
   如果你的主页面文件名不同，改 astory.html 里的 href 即可。

文件结构：
- astory.html：页面主体
- css/astory.css：全部样式
- js/astory.js：章节切换和故事体验交互
- assets/：占位素材

建议替换的素材：
- assets/astory_cover.svg：项目主视觉或 App 首页
- assets/astory_phone_read.svg：阅读界面截图
- assets/astory_phone_choice.svg：选择界面截图
- assets/astory_phone_result.svg：选择后反馈截图
- assets/astory_android.svg：Android Studio 或代码结构截图
- assets/astory_flow.svg：剧情分支图，可选
- assets/astory_character.svg：角色图，可选

替换图片时，只要保持文件名一致即可。
PNG / JPG 也可以用，但需要同步修改 astory.html 里的图片后缀。
