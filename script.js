let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let addFlag = false;
let modalCont = document.querySelector(".modal-cont");
let removeFlag = false;
let textareaCont = document.querySelector(".textarea-cont");

let colors = ["pink", "grey", "red", "black"];
let modalPriorityColor = colors[colors.length - 1];
let allPriorityColors = document.querySelectorAll(".priority-color");

let mainCont = document.querySelector(".main-cont");


let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketArr = [];

if(localStorage.getItem("jira_tickets")) {
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
}

addBtn.addEventListener("click", (e)=> {
    // display modal 
    // generate ticket
    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    }
    else {
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx)=> {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
    })
})

modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if(key === "Enter") {
        createTicket(modalPriorityColor, textareaCont.value);
        addFlag = false;
        setModalToDefault();
    }
})

function createTicket(ticketColor, ticketTask, ticketId) {
    let id = ticketId || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class","ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
        </div>
    `;
    mainCont.appendChild(ticketCont);

    if(!ticketId) {
        ticketArr.push({ticketColor, ticketTask, ticketId:id});
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    }

    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

function handleRemoval(ticket, id) {
    ticket.addEventListener("click", (e)=> {
        if(!removeFlag)
        return ;

        let idx = getTicketIdx(id);
        ticketArr.splice(idx,1);
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
        ticket.remove();
    })
}

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");

    ticketLock.addEventListener("click", (e)=>{
        let idx = getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        ticketArr[idx].ticketIdx = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

function handleColor(ticket, id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e)=> {
        let currentTicketColor = ticketColor.classList[1];
        let idx = getTicketIdx(id);

        let currentTicketColorIdx = colors.findIndex((color) =>{
            return currentTicketColor === color;
        })
        let newTicketColorIdx = (currentTicketColorIdx+1)%colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        ticketArr[idx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx)=> {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");

}

// filtering the tickets wrt color
let toolBoxColors = document.querySelectorAll(".color");

for(let  i=0;i < toolBoxColors.length ; i++){
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for (let i=0;i<allTicketCont.length;i++){
            allTicketCont[i].remove();
        }

        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for(let i= 0;i< allTicketCont.length;i++) {
            allTicketCont[i].remove();
        }

        ticketArr.forEach((ticektObj, idx) => {
            createTicket( ticektObj.ticketColor, ticektObj.ticketTask, ticektObj.ticketId);
        })
    })
}

function getTicketIdx(id) {
    let ticketIdx = ticketArr.findIndex((ticketObj)=> {
        return ticketObj.ticketId === id;
    })

    return ticketIdx;
}