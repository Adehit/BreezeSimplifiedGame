# Wordle

> 一款基于浏览器的文字猜词游戏

**使用方式**

用浏览器打开主目录下的 `index.html` 即可，推荐使用 `Google Chrome` 、 `Microsoft Edge` 或 `360 安全浏览器` 打开。

#### 附录

* 主目录下的 `DLC.html` 为DLC版本，添加了词库未收录词的合法化按钮以及通过二维码扫描来查看当前单词的功能，方便学校班级内组织活动使用游玩。

* 若想要添加自己的词库，请按照如下方式添加

  1. 保证词库文件是按行分割且每行由 `单词 +（空格）+ 音标（或释义等） ` 的形式组成。

  2. 按如下格式修改文件后，将文件保存为 `词库名称.js ` 到 `Words` 文件夹中 ：

     ```js
     var 词库名称 = ```这是词库文件第一行
     这是第二行
     这是最后一行```
     ```

  3. 在 `DLC.html` 或 `index.html` 中找到如下行并修改：

     ```html
     <script src="Words/CET6.js"></script>
     <script src="Words/NPEE.js"></script>
     <script src="Words/TE4&8.js"></script>
     <script src="Words/词库文件.js"></script>
     <!--省略若干行-->
     <script>
         //省略若干行
         const versions = {'npee': npee, 'cet6':cet6, 'te48': te4_8, '词库名称', 词库变量名称};
         //省略若干行
     </script>
     <!--省略若干行-->
     ```

  4. 在打开网址后将网址加上参数 `vocabulary` ，如下所示：

     ```
     file:///C:/Users/Lenovo/Desktop/Wordle/index.html?vocabulary=词库名称
     ```

* 若想要改变单词的长度，请加上参数 `num` ，支持 $num\in[4,10]$ ，其余情况默认 $num = 5$ 。
