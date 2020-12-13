let time=new Date();
console.log(time.toLocaleTimeString());

var R0 = new LinkedList(),R1 = new LinkedList(),R2 = new LinkedList();
//构建了由R0,R1,R2组成的RL
var RL = [R0,R1,R2];
//构建blocklist
var Bl = new LinkedList();
//分别初始化资源（初始化id和数量），资源队列（即指示每个资源被各进程占有的数量）
//资源占有数量（将进程id和资源占有数量进行拼接后放入资源队列中）
var r1 = new resource('r1',1),r2 = new resource('r2',2),
    r3 = new resource('r3',3),r4 = new resource('r4',4);
var r1_list = new LinkedList(),r2_list = new LinkedList(),
    r3_list = new LinkedList(),r4_list = new LinkedList();
var r1_wlist = new LinkedList(),r2_wlist = new LinkedList(),
    r3_wlist = new LinkedList(),r4_wlist = new LinkedList(); 
var res = [r1,r2,r3,r4],res_list = [r1_list,r2_list,r3_list,r4_list],
    res_wlist = [r1_wlist,r2_wlist,r3_wlist,r4_wlist];
var r1_occu = [],r2_occu = [],r3_occu = [],r4_occu = [];


// 定义一个结点类型构造函数
function Node(elem) {
    this.val = elem;
    this.next = null;
}
function LinkedList() {
    // 定义链表的头结点
    this.head = new Node(null);
    // 定义一个节点，它始终指向链表中的最后一个节点
    this.tail = this.head;
    // 在链表的末尾添加一个节点
    this.append = function (elem) {
        this.tail = this.head;
        let node = new Node(elem);
        //这里每次都将tail重新赋值为最后一个结点是为了处理在destroy结点导致readylist中无结点时，没有办法将新结点append的情况
        while(this.tail.next!=null){
            this.tail = this.tail.next;
        }
        this.tail.next = node;
        // 用this.tail始终指向当前链表的最后一个节点
        this.tail = node;
        //console.log(this.head);
        //console.log(this.tail);
        //console.log(this.tail); 
    };
    // 在第no个节点后面添加一个新节点
    this.insertAt = function (no, elem) {
        let node = new Node(elem);
        let tempNode = this.head;
        for (let i = 0; i < no; i++) {
            if (tempNode.next) {
                tempNode = tempNode.next;
            } else {
                break;
            }
        }
        node.next = tempNode.next;
        tempNode.next = node;
    };
    // no表示要删除节点的前一个节点序号
    this.removeAt = function (no) {
        let tempNode = this.head;
        for (let i = 0; i < no; i++) {
            if (tempNode.next) {
                tempNode = tempNode.next;
            } else {
                break;
            }
        }
        // 获取需要删除的节点node2
        let node2 = tempNode.next;
        if (node2) {
            // 删除节点
            tempNode.next = node2.next;
            if (node2.next == null) {
                // 如果删除的节点的next是null则表示查找到的被删除节点的上一个节点就是尾结点
                this.tail = tempNode;
            }
        }
    };
   
    //通过val寻找结点
    this.find = function(elem){
        var currentNode = this.head;
        while(currentNode.val!=elem){
            currentNode = currentNode.next;
        }
        return currentNode;
    };
    this.removeHeadNode = function(){
        let curr = this.head;
        let currNextVal = curr.next.val;
        curr.next = curr.next.next;
        return currNextVal;
    };
}


//构建PCB结构
function PCB(ID,pri){
    this.PID=ID;
    this.resource=null;
    this.type=null;
    this.priority=pri;
    this.child=null;
    this.parent=null;
}
//进行调度
function scheduler(){
    let p_run_str = '';
    //获取当前最高优先级的进程
    //最后的RL[0].tail.val本来想用跟前面一样的head.next.val，
    //但是不知道为什么一直报错，所以采用了tail.val
    let p = RL[2].head.next?RL[2].head.next.val:
            RL[1].head.next?RL[1].head.next.val:RL[0].tail.val;
    let p_run = find_PID_type('running');
    if(p_run==undefined){
        p.type = 'running';
        console.log(`process ${p.PID} is running`);
        p_run_str += 'process '+ p.PID + ' is running'+'\n';
        return p_run_str;
        //return p.PID;
    }
    else if(p.priority>=p_run.priority){
        p_run.type = 'ready';
        p.type = 'running';
        console.log(`process ${p.PID} is running`);
        p_run_str += 'process '+ p.PID + ' is running'+'\n';
        return p_run_str;
        //return p.PID;
    }
}
//创建PCB
function creaPCB(ID,pri){
    let PCB_str = '';
    var newPCB=new PCB(ID,pri);
    //初始化child和resource为linklist，存储相应信息
    newPCB.child = new LinkedList();
    newPCB.resource = new LinkedList();
    newPCB.type='ready';
    if(RL[pri].head.next==null){
        RL[pri].append(newPCB);
    }
    else{
        //连接父亲结点和兄弟结点
        RL[pri].append(newPCB);
        newPCB.parent = RL[pri].head.next.val;
        RL[pri].head.next.val.child.append(newPCB);
    }
    PCB_str = scheduler();
    return PCB_str;
}

function Iterator(arrayList) {
    // 获取链表的头结点
    this.point = arrayList.head;
    // 判断当前节点是否存在下一个节点，如果存在将当前节点指向下一个节点并返回true，反之返回false
    this.hasNext = function () {
        if (this.point.next) {
            this.point = this.point.next;
            return true;
        } else {
            return false;
        }
    };
    // 获取下一个节点的值
    this.next = function () {
        return this.point;
    }
}
//通过PID寻找PCB,返回的是node的val，也就是PCB的部分，不包括node的next
function find_PID(PID){
    for(let i = 0;i<3;i++){
        //使用迭代器获取在RL中的进程
        iterator = new Iterator(RL[i]);
        while (iterator.hasNext()) {
            if(iterator.next().val.PID==PID)
                return iterator.next().val;
        }
    }
    for(let i = 0;i<4;i++){
        //使用迭代器获取在waiting list中的进程
        //在请求资源时，blocked的进程会被移除出readylist，放入各资源对应的waitinglist中
        //在这里设置获取是为了在后面destroy已经blocked的进程的时候可以找到对应进程
        iterator = new Iterator(res_wlist[i]);
        while (iterator.hasNext()) {
            if(iterator.next().val.PID==PID)
                return iterator.next().val;
        }
    }
}
//通过type寻找PID
function find_PID_type(type){
    for(let i = 0;i<3;i++){
        //使用迭代器获取
        iterator = new Iterator(RL[i]);
        while (iterator.hasNext()) {
            if(iterator.next().val.type==type)
                return iterator.next().val;
        }
    }
}

//通过PID释放进程
function destroy(PID){
    let de_str = '';
    let temp = find_PID(PID);
    let rl_head = RL[temp.priority].head;
    //删除对象的属性，通过垃圾回收将对象删除
    for(let key in temp){
        //当删除到resource时，要调用release函数将资源释放
        if(key == 'resource'){
            let res_head =temp.resource.head;
            while(res_head.next != null){
                console.log(`release ${res_head.next.val[0].RID}`);
                de_str += release(PID,res_head.next.val[0].RID,res_head.next.val[1]);
                res_head = res_head.next;
            }
        }
    }
    while(rl_head.next != null){
        if(rl_head.next.val.PID == PID){
            rl_head.next = rl_head.next.next;
            break;
        }
        rl_head = rl_head.next;
    }
    //递归调用，对子程序调用release
    let temp_child = temp.child.head;
    while(temp_child.next!=null){
        destroy(temp_child.next.val.PID);
        temp_child = temp_child.next;
    }
    scheduler();
    if(de_str == '')
        de_str = '\n';
    return de_str;
}

//resource的定义
function resource(RID,status){
    this.RID = RID;
    this.status = status;
    this.total = status;
    this.waitingList = new LinkedList();
}

function get_res(rid){
    //通过rid获取资源，资源队列，和资源占有数组
    //occu为辅助队列，在request中帮助r_list存储占用情况
    switch(rid){
        case 'r1':
            return [r1,r1_list,r1_occu,r1_wlist];
            break;
        case 'r2':
                return [r2,r2_list,r2_occu,r2_wlist];
                break;
        case 'r3':
                return [r3,r3_list,r3_occu,r3_wlist];
                break;
        case 'r4':
                return [r4,r4_list,r4_occu,r4_wlist];
                break;
    }
}
function request(rid,n){
    //分配资源，n为请求的资源数目，status为资源的剩余量
    let r = get_res(rid)[0];
    let r_list = get_res(rid)[1];
    let occu = get_res(rid)[2];
    let wlist = get_res(rid)[3];
    let p = find_PID_type("running");
    let res_str = '';
    if(n>r.total){
        console.log("请求资源数量大于资源总数");
        res_str = "请求资源数量大于资源总数\n   ";
        return [res_str,0]; 
    }
    if(n<=r.status&&n>0){
        r.status -= n;
        occu.push([p.PID,n]);
        p.resource.append([r,n]);
        //onsole.log(p.resource);
        //使用r_list说明各资源在各进程上被占有的数量
        //数量用数组表示
        r_list.append(occu[occu.length-1]);
        res_str = 'process '+p.PID+' request '+n+' ' +rid+'\n';
        console.log(`process ${p.PID} request ${n} ${rid}`);
        return [res_str,1];
    }
    else{
        p.type = 'blocked';
        RL[p.priority].removeHeadNode();
        //waitinglist每个结点由进程和进程请求资源数量的数组组成
        r.waitingList.append([p,n]);
        wlist.append(p);
        //console.log(r.waitingList);
        res_str = scheduler();
        //避免已经block的进程又被改为running
        res_str += 'process '+p.PID+' is blocked'+'\n';
        p.type = 'blocked';
        return [res_str,2];
    }
}


function release(PID,rid,n){
    //分配资源，n为请求的资源数目，status为资源的剩余量
    //r为请求资源，r_list为r的分配队列。occu为辅助队列
    let r = get_res(rid)[0];
    let r_list = get_res(rid)[1];
    let occu = get_res(rid)[2];
    let p = find_PID(PID);
    r.status = r.status+n;
    let r_head = r_list.head;

    let rel_str = '';
    rel_str += 'release '+n+' '+rid+' \n';
    //从r_list中删除释放结点的占用信息
    while(r_head!=null){
        if(r_head.next.val[0]==PID){
            r_head.next = r_head.next.next;
            break;
        }
        r_head = r_head.next;
    }
    //唤醒waiting list中的首进程
    if(r.waitingList.head.next!=null&&
        r.waitingList.head.next.val[1]<r.status){
                let pcb = r.waitingList.head.next.val[0];
                pcb.type='ready';
                r.status-=n;
                //唤醒进程后，将首结点移除
                let r_wait_head = r.waitingList.head;
                r_wait_head.next = r_wait_head.next.next;
                occu.push([pcb.PID,n]);
                pcb.resource.append([r,n]);
                //使用r_list说明各资源在各进程上被占有的数量
                //数量用数组表示
                r_list.append(occu[occu.length-1]);
                //重新加入ready list
                RL[pcb.priority].append(pcb);
                console.log(`wake up process ${pcb.PID}`);
                rel_str += 'wake up process '+pcb.PID+'\n';
            }
    scheduler();
    return rel_str;
}

function time_out(){
    let to_str = '';
    if(RL[2].head.next==null&&(RL[1].head.next!=null&&RL[1].head.next.next==null)){
        to_str += scheduler();
        
    }
    else{
    //找到当前运行的进程
    let p_run = find_PID_type('running');
    if(!p_run){
        return ;
    }
    //将优先级为2的进程进行降级处理
    if(p_run.priority==2){
        p_run.priority=1;
        //将头结点移除，添加为尾结点
        RL[1].append(p_run);
        RL[2].removeHeadNode();
    }
    else{
    //对同一优先级的进行处理
    p_run.type = 'ready';
    //首尾结点互换位置
    let tail_val = RL[p_run.priority].removeHeadNode();
    RL[p_run.priority].append(tail_val);
    }
    to_str = scheduler();
    to_str += 'process '+p_run.PID+' is ready'+'\n';
    console.log(`process ${p_run.PID} is ready`);
    }
    return to_str;
}

//展示ready list
function display_RL(){
    let ready_list_str = '';
    for(let i = 0;i<3;i++){
        //使用迭代器获取
        iterator = new Iterator(RL[i]);
        let i_str = i+':',str = '';
        //获取RL中pid
        while (iterator.hasNext()) {
            str += iterator.next().val.PID+'-';
        }
        str = str.substr(0,str.length-1);
        str = i_str + str;
        console.log(str);
        ready_list_str += str + '\n';
    }
    return ready_list_str;
}

function display_res(){
    let res_str = '';
    for(let i = 0;i<4;i++){
        //res_list中存储着各个resource的r_list,即资源占用情况表，node是数组形式存储
        //[pid,n],即占用的pid和占用数量n
        let res_head = res_list[i].head;
        let res_used = 0;
        let res_id ='R'+(i+1)+" ";
        //获取r_list里的各资源的使用数量
        while(res_head.next!=null){
            //
            res_used += res_head.next.val[1];
            res_head = res_head.next;
        }
        //total即资源的总量，total-uesd即为剩余的数量
        res_used = res[i].total - res_used;
        console.log(res_id,res_used);
        res_str += res_id +res_used +'\n'; 
    }
    return res_str;
}


function display_block(){
    let wait_p_str = '';
    for(let i = 0;i<4;i++){
        let res_waiting_head = res[i].waitingList.head;
        let wait_p = 'R'+(i+1)+"  ";
        //获取waiting list里的进程id
        while(res_waiting_head.next!=null){
            wait_p += res_waiting_head.next.val[0].PID;
            res_waiting_head = res_waiting_head.next;
        }
        console.log(wait_p);
        wait_p_str += wait_p+'\n';
    }
    return wait_p_str;
}



//处理通过input和button输入的命令
function handle_mes(){
    var p_input = document.getElementById("input_text"),
    p_output = document.getElementById("output_text");
    var but = document.getElementsByTagName("button")[0],
        inp = document.getElementsByTagName("input")[0];
    let temp_str_out = '';
    but.onclick = function(){
        let text = inp.value;
        let command_all = text.split(" ");
        p_input.innerText = p_input.innerText+text+'\n';
        switch(command_all[0]){
            case "init":
                temp_str_out = creaPCB('init',0);
                p_output.innerText +=temp_str_out;
                break;
            case "cr":
                let proce_id = command_all[1],prio = Number(command_all[2]);
                temp_str_out = creaPCB(proce_id,prio);
                p_output.innerText +=temp_str_out;
                break;
            case "de":
                let pro = command_all[1];
                temp_str_out = destroy(pro);
                p_output.innerText +=temp_str_out;
                break;
            case "req":
                let res_id = command_all[1],res_num = Number(command_all[2]);
                temp_str_out = request(res_id,res_num);
                if(temp_str_out[1]==2)
                p_input.innerText +='\n';
                p_output.innerText +=temp_str_out[0];
                break;
            case "rel":
                let p = find_PID_type('running');
                console.log(p.PID);
                let rel_id = command_all[1],rel_num = Number(command_all[2]);
                temp_str_out = release(p.PID,rel_id,rel_num);
                p_output.innerText +=temp_str_out;
            case "to":
                p_input.innerText += '\n';
                temp_str_out = time_out();
                p_output.innerText +=temp_str_out;
                break;
            case "list":
                switch(command_all[1]){
                case "ready":
                p_input.innerText += '\n'+'\n';
                temp_str_out = display_RL();
                p_output.innerText +=temp_str_out;
                break;
            case "block":
                p_input.innerText += '\n'+'\n'+'\n';
                temp_str_out = display_block();
                p_output.innerText +=temp_str_out;
                break;
            case "res":
                p_input.innerText += '\n'+'\n'+'\n';
                temp_str_out = display_res();
                p_output.innerText +=temp_str_out;
                break;
            }
            break;
            default:alert("请输入正确格式的命令");
        }
        return false;
    }
    
}    

function addEvent(func){
    var oldonload = window.onload;
    if(typeof window.onload != 'function'){
        window.onload = func;
    }
    else{
        window.onload = function(){
            oldonload();
            func();
        }
    }
}
addEvent(handle_mes);


//下面这个是一开始的测试用例
/*let init = creaPCB("init",0);
let x = creaPCB("x",1);
let p = creaPCB("p",1);
let q = creaPCB("q",1);
let r = creaPCB("r",1);

display_RL();
time_out();
request("r2",1);
time_out();
request("r3",3);
time_out();
request("r4",3);
display_res();
time_out();
time_out();
request("r3",1);
request("r4",2);
request("r2",2);
display_block();
time_out();
display_RL();
destroy("q");
time_out();
time_out();*/



//本来想做读txt的,但是出现了很多我修不了的bug，所以后来采用输入式的
/*function command_func(command){
    console.log(RL[0].head.next);
    switch(command[0]){
    case "init":
        creaPCB('init',0);
        break;
    case "cr":
        let proce_id = command[1],prio = command[2];
        prio = Number(prio);
        creaPCB(proce_id,prio);
        break;
    case "de":
        let pro = command[1];
        destroy(pro);
        break;
    case "req":
        let res_id = command[1],res_num = command[2];
        request(res_id,res_num);
        break;
    case "to":
        time_out();
        break;
    case "lsd":
        display_RL();
        break;
    case "lb":
        display_block();
        break;
    case "lre":
        display_res();
        break;
    }
}*/
/*let inp = document.getElementsByTagName("input")[0],p_output = document.getElementById("output_text"),
    p_input = document.getElementById("input_text");
function command_get(){
    inp.addEventListener("change",(event)=>{
        let files = event.target.files,reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onerror = function(){
            p_input.innerHTML = "can't open file,error code is " + reader.error.code;
        }
        /*reader.onprogress = function(event){
            p_input.innerHTML = `${event.loaded}/${event.total}`;
        }
        reader.onload = function(){
            let command_all = '';
            p_input.innerHTML = reader.result;
            command_all = reader.result.split("\n");
            p_output.innerHTML = command_all;
            for(let i = 0;i<command_all.length;i++){
                command = command_all[i].split(" ");
                console.log(command);
                command_func(command);
        }
    }
    })
    
}
command_get();*/


