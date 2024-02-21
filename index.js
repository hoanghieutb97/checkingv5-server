

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
const InPutexcel = require('./calFunctionExcel/InPutexcel');
const cal_ArrayDeleteCardId = require('./calFunctionServer/cal_ArrayDeleteCardId');
const cal_getLinkFileTool = require('./calFunctionServer/cal_getLinkFileTool');
const tachState = require('./calFunctionExcel/tachState');
const moveToRunDone = require('./XuLyTrello/moveToRunDone');
const addDescriptions = require('./XuLyTrello/addDescriptions');
const addDateImage = require('./XuLyTrello/addDateImage');

const fs = require('fs').promises;
const { KeyAndApi } = require('./constants');

global.listIP = [];
global.listTrello = [];
app.post('/Ipclient', (req, res) => {

    { // cap nhat trang thai cua list ip
        let isDuplicate = false; // Biến để kiểm tra xem có item trùng IP không

        for (let i = 0; i < listIP.length; i++) {
            if (listIP[i].ip[0] === req.body.ip[0]) {
                listIP[i] = { ...req.body };
                isDuplicate = true;
                break; // Thoát khỏi vòng lặp
            }
        }

        if (!isDuplicate) { // them ip neu chua co
            listIP.push({ ...req.body });
        }
    }

    if (global.listTrello.length > 0) {
        if ((req.body.cardId)) {

            { // xóa hàng chờ và thêm nội dung description vào trello
                var descrpt = cal_getLinkFileTool(req.body.cardId, global.listTrello);
                if (descrpt) {
                    addDescriptions(req.body.cardId, descrpt);
                    // addDateImage(req.body.cardId, descrpt);
                }
                var newListTrello = cal_ArrayDeleteCardId(req.body.cardId, global.listTrello);
                global.listTrello = newListTrello;
            }


            if (req.body.err) { // nếu pts_status lỗi hoặc không thì xư lý
                // listIP = listIP.map(item => {
                //     if (item.ip[0] === req.body.ip[0]) return { ...req.body }
                //     return item
                // })

                axios.put(`https://api.trello.com/1/cards/${req.body.cardId}`, {
                    idList: KeyAndApi.listRunErr,
                    key: KeyAndApi.apiKey,
                    token: KeyAndApi.token
                })
                axios.get(`http://${req.body.ip[0]}:4444/checkAwaitPhotoshop`);


            }
            else {
                console.log("move to run done !  ", req.body.cardId);
                moveToRunDone(req.body.cardId);
                axios.get(`http://${req.body.ip[0]}:4444/checkAwaitPhotoshop`);
            }


        } else {
            if ((req.body.state == "awaitReady")) { // chay script
                let isBreak = false; // Biến cờ
                for (let i = 0; i < listIP.length && !isBreak; i++) {
                    if (listIP[i].ip[0] == req.body.ip[0]) {

                        for (let j = 0; j < global.listTrello.length; j++) {
                            if (global.listTrello[j].state == "awaitReady") {
                                global.listTrello[j].state = "busy";
                                listIP[i] = { ...req.body, state: "busy" };

                                chayscript(listIP[i], { ...global.listTrello[j].json, cardId: global.listTrello[j].cardId });
                                isBreak = true; // Đặt cờ
                                break; // Thoát khỏi vòng lặp trong
                            }
                        }

                    }

                }

            }
        }

    }



    function chayscript(listIP, JSONFILE) {
        var ip = listIP.ip[0]

        const url = `http://${ip}:4444/photoshopScriptTrello`;
        axios.post(url, JSONFILE, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => { console.log(response.data) }) // Axios tự động chuyển đổi JSON
            .catch(err => console.error('Error:', err));

    }



    res.status(200).send('oke');
});

// Thiết lập một endpoint để nhận webhook từ Trello
app.post('/webhook/trello', (req, res) => {



    if ((req.body.action.type == "addAttachmentToCard")) {  // Định nghĩa URL và dữ liệu cần gửi
        var nameAttachment = req.body.action.data.attachment.name.split(".").pop();
        if (nameAttachment == "xlsx") {
            var data = {
                url: req.body.action.data.attachment.url,
                cardId: req.body.action.data.card.id,

            };

            // Cập nhật với thông tin API Key, Token và URL đính kèm cụ thể
            const apiKey = KeyAndApi.apiKey;
            const token = KeyAndApi.token;
            const attachmentUrl = data.url;

            // Thiết lập header cho request
            const headers = {
                "Authorization": `OAuth oauth_consumer_key="${apiKey}", oauth_token="${token}"`
            };
            const directoryPath = KeyAndApi.filePath;
            // Thực hiện GET request để tải file

            fetch(attachmentUrl, { headers: headers })
                .then(response => {
                    // Kiểm tra nếu response không thành công
                    if (!response.ok) {
                        throw new Error(`Error! status: ${response.status}`);
                    }
                    return response.buffer();
                })
                .then(buffer => {
                    const fileName = attachmentUrl.split('/').pop();  // Lấy tên file từ URL
                    const filePath = path.join(directoryPath, fileName); // Tạo đường dẫn đầy đủ
                    return fs.writeFile(filePath, buffer).then(() => {
                        console.log(`Đã tải và lưu attachment: ${filePath}`);
                        return filePath; // Trả lại đường dẫn file cho chuỗi promise tiếp theo
                    });




                }).then(filePath => {
                    // Sau khi ghi file hoàn tất, gọi InPutexcel

                    return InPutexcel(filePath);

                }).then(JSONFILE => {
                    // console.trace(JSONFILE.value.items);
                    console.log("Trang thai chay tool: ", JSONFILE.stt);
                    if (JSONFILE.stt) {
                        data = { ...data, json: JSONFILE.value, state: "awaitReady" }

                        listTrello = [...listTrello, data];


                        for (let i = 0; i < listIP.length; i++) {
                            if (listIP[i].state == "awaitReady") {
                                listIP[i].state == "busy";
                                const url = `http://${listIP[i].ip[0]}:4444/checkAwaitPhotoshop`;
                                axios.get(url).then(function (response) {
                                    // Xử lý thành công


                                })
                                    .catch(function (error) {
                                        console.log("loi checkAwaitPhotoshop", error);
                                    })

                                break;
                            }
                        }

                    }
                    else { //file json không đảm bảo thì kéo sang lỗi
                        tachState(JSONFILE.value.items, req.body.action.data.card.id);

                    }


                    const longText = JSONFILE.value.items.map(itemx => (itemx.orderId)).join("\n");
                    var url2 = `https://api.trello.com/1/cards/${req.body.action.data.card.id}/actions/comments?key=${KeyAndApi.apiKey}&token=${KeyAndApi.token}`
                    axios.post(url2, { text: longText + "\n" + req.body.action.data.card.id }, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    })
                    addDateImage(req.body.action.data.card.id, JSONFILE.value.items);
                }
                )
                .catch(err => console.log('Có lỗi:', err));


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
