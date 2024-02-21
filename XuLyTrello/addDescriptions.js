
const { KeyAndApi } = require('../constants');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const filePath = path.join(KeyAndApi.serverFolder, 'status.txt');
function addDescriptions(cardId, descrpt) {

    axios.put(`https://api.trello.com/1/cards/${cardId}`, {
        desc: descrpt,
        key: KeyAndApi.apiKey,
        token: KeyAndApi.token
    }).then(function (response) {
        // Xử lý thành công


    })
        .catch(function (error) {
            // Xử lý lỗi
            const content = cardId + " :lỗi khi addDescriptions\n";
            fs.appendFile(filePath, content, (err) => {
                if (err) {
                    console.error('Lỗi khi ghi file:', err);
                } else {

                }
            });
        })
        .then(function () {
            // Luôn được thực thi

        });
}
module.exports = addDescriptions;