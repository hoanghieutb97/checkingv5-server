

// //////////////////////////////////////////////////////////////////////////
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const fetch = require('node-fetch');
const express = require('express');
const app = express();
const port = 3010;
app.use(cors()); // Sử dụng CORS middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Cho phép xử lý JSON payload
const cal_ArrayDeleteCardId = require('./calFunctionServer/cal_ArrayDeleteCardId');
const cal_getLinkFileTool = require('./calFunctionServer/cal_getLinkFileTool');
const moveToRunDone = require('./XuLyTrello/moveToRunDone');
const addDescriptions = require('./XuLyTrello/addDescriptions');
const webHookTrello = require('./XuLyTrello/webHookTrello');
const checkCreateCard = require('./XuLyTrello/checkCreateCard');



const fs = require('fs').promises;
const { KeyAndApi } = require('./constants');
const checkAwaitPhotoshop = require('./fetchClient/checkAwaitPhotoshop');
const runScriptTool = require('./fetchClient/runScriptTool');
const cal_newIPClient = require('./calFunctionServer/cal_newIPClient');

global.listIP = [];
global.listTrello = [];
checkCreateCard();  // xu ly loi up file va tao the
getListTrelloAuto(); // xu ly lkoi ko chay tiep
async function getListTrelloAuto() {
    console.log("global.listTrello.length---------------", global.listTrello.length);
    if (global.listTrello.length == 0)
        axios.get(`https://api.trello.com/1/lists/${KeyAndApi.startList}/cards?key=${KeyAndApi.apiKey}&token=${KeyAndApi.token}`)
            .then(async responseAll => {
                global.listTrello = [];
                let listCard = responseAll.data.map(item => ({ cardId: item.id, nameCard: item.name }));
                console.log("listCard************ ", listCard.length);
                var newLtCard = []
                for (let i = 0; i < listCard.length; i++) {
                    const url = `https://api.trello.com/1/cards/${listCard[i].cardId}/attachments?key=${KeyAndApi.apiKey}&token=${KeyAndApi.token}`;

                    try {
                        const response = (await axios.get(url)).data;

                        for (let j = 0; j < response.length; j++) {
                            var fileName = response[j].name;
                            fileName = fileName.split(".").pop();
                            if (fileName == "xlsx") newLtCard.push({
                                cardId: listCard[i].cardId,
                                url: response[j].url,
                                nameCard: listCard[i].nameCard,
                                sttDateImg: response.length == 1 ? true : false
                            })
                        }




                    } catch (error) {

                    }

                }
                function delay(time) {
                    return new Promise(resolve => setTimeout(resolve, time));
                }

                // Hàm chính sử dụng vòng lặp và đợi
                async function processCards(newLtCard) {
                    for (let j = 0; j < newLtCard.length; j++) {
                        await webHookTrello(newLtCard[j], newLtCard[j].sttDateImg);
                        await delay(1000);
                    }
                }
                processCards(newLtCard);
            })
            .catch(error => console.error('There was an error!', error));
    setTimeout(getListTrelloAuto, 180000); // Thử lại sau 30 phút mặc định
};

app.post('/reactSendTrello', async (req, res) => {
    global.listTrello = [];
    var listCard = req.body.data;
    var newLtCard = []
    for (let i = 0; i < listCard.length; i++) {
        const url = `https://api.trello.com/1/cards/${listCard[i].cardId}/attachments?key=${KeyAndApi.apiKey}&token=${KeyAndApi.token}`;

        try {
            const response = (await axios.get(url)).data;

            for (let j = 0; j < response.length; j++) {
                var fileName = response[j].name;
                fileName = fileName.split(".").pop();
                if (fileName == "xlsx") newLtCard.push({
                    cardId: listCard[i].cardId,
                    url: response[j].url,
                    nameCard: listCard[i].nameCard,
                    sttDateImg: response.length == 1 ? true : false
                })
            }




        } catch (error) {

        }

    }
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // Hàm chính sử dụng vòng lặp và đợi
    async function processCards(newLtCard) {
        for (let j = 0; j < newLtCard.length; j++) {
            await webHookTrello(newLtCard[j], newLtCard[j].sttDateImg);
            await delay(1000);
        }
    }
    processCards(newLtCard);
    res.status(200).send('oke');
});

app.post('/Ipclient', (req, res) => {
    console.log("connect ip______ ", req.body.ip[0], "-", req.body.state, global.listTrello.length);
    global.listIP = cal_newIPClient(global.listIP, req.body); // cập nhật listIP khi có req từ client

    if (global.listTrello.length > 0) {
        if ((req.body.cardId)) {

            { // xóa hàng chờ và thêm nội dung description vào trello
                var descrpt = cal_getLinkFileTool(req.body.cardId, global.listTrello);
                if (descrpt) {
                    addDescriptions(req.body.cardId, descrpt);
                }
                var newListTrello = cal_ArrayDeleteCardId(req.body.cardId, global.listTrello);
                global.listTrello = newListTrello;
            }
            if (req.body.err) { // nếu pts_status lỗi hoặc không thì xư lý
                axios.put(`https://api.trello.com/1/cards/${req.body.cardId}`, {
                    idList: KeyAndApi.listRunErr,
                    key: KeyAndApi.apiKey,
                    token: KeyAndApi.token
                })

                axios.get(`http://${req.body.ip[0]}:4444/checkAwaitPhotoshop`)
                    .then(response => {
                        // Xử lý phản hồi ở đây
                    })
                    .catch(error => {
                        // Xử lý lỗi ở đây
                    });




            }
            else {
                console.log("move to run done !  ", req.body.cardId);
                moveToRunDone(req.body.cardId);
                checkAwaitPhotoshop(req.body.ip[0]);

            }


        } else if ((req.body.state == "awaitReady")) {

            let isBreak = false; // Biến cờ
            for (let i = 0; i < listIP.length && !isBreak; i++) {
                if (listIP[i].ip[0] == req.body.ip[0]) {
                    for (let j = 0; j < global.listTrello.length; j++) {
                        if (global.listTrello[j].state == "awaitReady") {
                            global.listTrello[j].state = "busy";
                            listIP[i] = { ...req.body, state: "busy" };

                            var JSONFILE = { ...global.listTrello[j].json, cardId: global.listTrello[j].cardId }
                            var runsc = runScriptTool(listIP[i].ip[0], JSONFILE);
                            if (!runsc) {
                                var newListTrello = cal_ArrayDeleteCardId(global.listTrello[j].cardId, global.listTrello);
                                global.listTrello = newListTrello;
                            }
                            isBreak = true; // Đặt cờ
                            break; // Thoát khỏi vòng lặp trong
                        }
                    }

                }
            }
        }

    }





    res.status(200).send('oke');
});

// Thiết lập một endpoint để nhận webhook từ Trello
app.post('/webhook/trello', async (req, res) => {



    if ((req.body.action.type == "addAttachmentToCard")) {  // Định nghĩa URL và dữ liệu cần gửi
        var nameAttachment = req.body.action.data.attachment.name.split(".").pop();
        if (nameAttachment == "xlsx") {
            var data = {
                url: req.body.action.data.attachment.url,
                cardId: req.body.action.data.card.id,
                nameCard: req.body.action.data.card.name
            };

            await webHookTrello(data, true);

        }
    }
    // // Phản hồi lại Trello để biết rằng đã nhận được webhook
    res.status(200).send('Success 3010');
});




app.get('/webhook/trello', (req, res) => {  // để chạy api kích hoạt weebhook trello
    console.log('Webhook received! get');

    res.status(200).send('Success');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


///// khai bao weebhook
/////   https://api.trello.com/1/webhooks?key=4ab2789218e562d5eee1b5cc9c0a72f6&token=ATTAe7cd4c745f63ae54df2577566a5bc194802e80367f2327bb9259058ba41232162FEC0C48&callbackURL=https://a4d8-101-99-6-103.ngrok-free.app/webhook/trello&idModel=659392077c1ff60559669e1f
