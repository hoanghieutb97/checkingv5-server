
const { KeyAndApi } = require('../constants');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const filePath = path.join(KeyAndApi.serverFolder, 'status.txt');
const FormData = require('form-data');

function addNewCardXlsx(fileName) {
    const CARD_ID = "your-card-id-here";
    const activeFile = path.join(KeyAndApi.serverFolder, 'tachState', fileName + ".xlsx"); // Đường dẫn tới file bạn muốn tải lên

    axios.post(`https://api.trello.com/1/cards?key=${KeyAndApi.apiKey}&token=${KeyAndApi.token}`, {
        name: fileName,

        idList: KeyAndApi.startList,
    })
        .then((response) => {
            uploadFileToTrello(response.data.id, activeFile);
            // console.log('Card created successfully. Card ID:', response.data.id);

        })
        .catch((error) => {

            const content = fileName + " :lỗi khi addNewCardXlsx\n";
            fs.appendFile(filePath, content, (err) => {
                if (err) {
                    console.error('Lỗi khi ghi file:', err);
                } else {

                }
            });
            console.error('Error creating card:', error);
        });


    async function uploadFileToTrello(cardId, activeFile) {
        const formData = new FormData();
        formData.append('key', KeyAndApi.apiKey);
        formData.append('token', KeyAndApi.token);
        formData.append('file', fs.createReadStream(activeFile));

        try {
            const response = await axios.post(`https://api.trello.com/1/cards/${cardId}/attachments`, formData, {
                headers: formData.getHeaders(),
            });
            // console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file to Trello:', error);
        }
    }


}
module.exports = addNewCardXlsx;