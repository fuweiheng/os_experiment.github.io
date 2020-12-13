# os_experiment.github.io
uestc os experiment written by js
os实验1--readme by 傅伟恒 2018081308004
注：由于浏览器的原因，本项目在edge的实现和在chrome的实现存在差异，推荐使用chrome打开
1.编程语言组成
   本次实验使用的语言主要为JavaScript HTML CSS
   testshell部分主要使用h5和css3完成页面设计
   页面的动作由js接收实现
2.测试地址
   主要文件已经上传到本人的GitHub仓库，与压缩包内的文件一致，地址   https://github.com/fuweiheng/os_experiment.github.io/tree/master
   同时，也通过GitHub发布了静态网页，可直接输入指定格式命令进行测试，地址
   https://fuweiheng.github.io/os_experiment.github.io/
3.测试命令格式
   init(创建初始进程）
   cr x 1（cr为create关键字，x为进程名称，1为优先级，其中x和1可换成对应进程名称和优先级）
   de q(de为destroy关键字，q为即将被删除的进程名称，q可替换）
   req r1 1(req为request关键字，r1为资源名称，共有r1-r4，4个不同资源，1为请求资源数量）
   rel r1 1(rel为release关键字，r1为资源名称，共有r1-r4，4个不同资源，1为释放资源数量）
   to(time_out,时间中断)
   list ready(展示ready list）
   list block（展示block list）
   list res（展示resource list)
4.使用说明
   在测试网页中的输入框直接按3.中的格式输入对应命令，对应结果则会打印在下方右边的文本框中   而输入的命令则会对应出现在左边下方的文本框中，同时在测试页面中按F12打开控制台，也能查看   和自定义输出
5.程序代码简要说明
   5.1linklist
        自定义链表类型，构建ready list等list
   5.2PCB
        自定义PCB结构类型
   5.3scheduler
        调度函数，在进行创建进程、删除进程、请求资源、释放资源等操作的时候调用调度函数
   5.4createPCB
        创建PCB，初始化进程的资源列表和孩子列表，同时将进程加入到对应优先级的ready list中
   5.5find_PID和find_PID_type
        分别通过进程ID和进程类型寻找并返回PCB
   5.6destroy
        销毁函数，调用销毁函数销毁进程及其孩子，在销毁过程中释放资源，调用release函数
   5.7request
        资源申请，当前处于running状态的进程对资源提出申请，如果申请成功则在进程的资源队列添          加对应信息，如果申请不成功，则将该进程置为block，则从readylist转到资源的waitinglist
   5.8release
        资源释放，当前处于running状态的进程对资源提出释放，释放成功，则打印成功提示，并转调          度函数
   5.9time_out
        时间中断函数，调用时处理当前处于running状态的程序，并调用调度函数
   5.10display_RL、display_res、function display_block
        分别展示ready list、resource list和block list
   5.11handle_mes
        绑定控件，处理输入的命令并调用对应函数，打印相应结果
