// constants.js
const path = require('path');
const os = require('os');

const filePath = path.join(os.homedir(), 'Desktop', "ServerFile", "xlsx");
const KeyAndApi = {
    // Cập nhật với thông tin API Key, Token và URL đính kèm cụ thể
    apiKey: 'eaab65cdb6b3f930891953f93327e65e',
    token: 'ATTA9890326a872fc0376b216d80d4582602fcf88703471fda6cb1b13f33b6c9702008C31C28',
    filePath: path.join(os.homedir(), 'Desktop', "ServerFile","xlsx"),
    // gllm: 'https://sheetdb.io/api/v1/xvqhrhg4y9avq'
    gllm: 'https://sheet.best/api/sheets/e8876c80-1778-414d-ae68-af6b9ec1289c',
    listRunDone: "65d98f472c22ba72b148a5b8",
    listRunErr: "65d98f4484ef9a8a0a55def0",
    Label_fail_sheet: "65d990c495d5d9682154a9dc",
    Label_fail_FIleDesign: "65d99061e3c2ddd5e0dfd1bb",
    listArchive: "65d99028e3d3f16b37010c4e",
    startList: "65d98f40df4df16ca1acfa3f",
    serverFile: "\\\\192.168.1.240\\in",
    serverFolder: path.join(os.homedir(), 'Desktop', "ServerFile"),

};

const SortByProduct = {
    variant_orderId_sku: [
        "PC glass", "PC luminous", "PC led", "print metal", "thot 5mm",
        "cut metal", "3d wood base", "thot den", "thot amazone",
        "PC silicon", "FatherDayZirror", "dia nhua", "mica DZT Style"
    ],
    nameId_orderId_sku: ["NEW transparent ORM 1M", "NEW transparent ORM 2M"]

}
const HWAll = {
    arrMica: ["keyChain mirror",
        "NEW transparent ORM 1M",
        "NEW transparent ORM 2M",
        "ornament mica 1M-fill",
        "ornament mica 2M-fill",
        "ornament mica DZT",
        "ornament led",
        "3d wood base",
        "3d woodBase Teemazing",
        "Acrylic Plaque",
        "ornament qua ta nhom",
        "Acrylic Plaque TMZ",
        "mirror normal StrokFile",
        "photo frame lamp",
        "Acrylic Desk Plaque",
        "mica fix ornament 1M",
        "mica fix ornament 2M",
        "Tumble Name Tag",
        "5L Shaker Ornament",
        "3L Shaker Ornament"

    ],
    arrGo: ["wood orrnament 2layer",
        "ornament go 1M-fill",
        "ornament go 2M-fill",
        "ornament vong huong",
        "wood ornament dls",
        "wood fix ornament 2M", +
        "wood fix ornament 1M",
        "3layer wood ornament",
        "2layer wood ornament",
        "wood fix ornament 1M",
        "wood fix ornament 2M"


    ],
    arrGoXXXXXX: ["FatherDayZirror"],
    arrMica2cm: ["Heart mica 2cm",
        "Acrylic Block"
    ],
    arrNauBan: ["ornament su 1M", "ornament su 2M"]
}
module.exports = { HWAll, KeyAndApi, SortByProduct };