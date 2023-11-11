const fs = require('fs');
const gm = require('gm');
const path = require("path");
const qrCode = require('qrcode');

// Задний фонн купона
const pathPNGWhite = path.join(__dirname, "..", "templates", "bg-green.png");
const pathPNGBlack = path.join(__dirname, "..", "templates", "bg-pink.png");

// Шрифты
const pathTTFMedium = path.join(__dirname, "..", "fonts", "TTFirsNeue-Medium.ttf");
const pathTTFBold = path.join(__dirname, "..", "fonts", "TTFirsNeue-DemiBold.ttf");

// Путь для сохранения QR
const pathQRDir = path.join(__dirname, "..", "temp");

// Цвета шрифтов светлого купона
const colorWhite1 = "#31AD70";
const colorWhite2 = "#1D1E1C";

// Цвета шрифтов тёмного купона
const colorBlack1 = "#EB9DB7";
const colorBlack2 = "#DCDDDC";

// Констаты масштабирования шрифтов
const delta = 5.95 * 0.2099 * 2;
const deltaFont = 0.2099 * 2;

async function generate(receiver, amount, style, code){
    return new Promise((resolve, reject) => {
        try {
            let template;
            let color1;
            let color2;
            if (style === '0') {
                template = pathPNGWhite;
                color1 = colorWhite1;
                color2 = colorWhite2;
            } else if (style === '1') {
                template = pathPNGBlack;
                color1 = colorBlack1;
                color2 = colorBlack2;
            } else {
                reject("Undefined style");
            }

            const pathQR = pathQRDir + '/' + code + '.png';

            // Сохранение QR на диск
            qrCode.toFile(pathQR, code, {
                color: {
                    dark: color1,
                    light: '#0000'
                },
                width: 500,
                height: 500,
                errorCorrectionLevel: 'H'
            }, function (err) {
                if (err) throw err;
            });

            // НОВОЕ ИЗОБРАЖЕНИЕ ИЗ ШАБЛОНА ФОНА
            let image = gm(template);

            image.fill(color1);
            image.stroke(color1);
            image.font(pathTTFMedium, 527 * deltaFont);

            // ПОДАРОЧНЫЙ СЕРТФИКАТ
            image.drawText(75 * delta, 150 * delta, "ПОДАРОЧНЫЙ");
            image.drawText(441 * delta, 240 * delta, "СЕРТИФИКАТ");

            // ФИО
            image.fill(color2);
            image.stroke(color2);
            image.font(pathTTFMedium, 450 * deltaFont);
            image.drawText(71 * delta, 400 * delta, receiver);

            // НОМИНАЛ КУПОНА
            image.fill(color2);
            image.stroke(color2);
            image.font(pathTTFMedium, 527 * deltaFont);
            image.drawText(71 * delta, 500 * delta, parseInt(amount).toLocaleString('ru-RU') + " РУБЛЕЙ");

            // ТЕКСТ ПРО МЕНЕДЖЕРА
            image.fill(color2);
            image.stroke(color2);
            image.font(pathTTFMedium, 150 * deltaFont);
            image.drawText(71 * delta, 560 * delta, "Чтобы активировать сертификат, пожалуйста, сообщите");
            image.drawText(71 * delta, 590 * delta, "менеджеру промокод указанный ниже");

            // КУПОН
            image.fill(color2);
            image.stroke(color2);
            image.font(pathTTFBold, 180 * deltaFont);
            image.drawText(71 * delta, 640 * delta, code);

            // QR код
            image.draw('image over 3410,1296 500,500 "' + pathQR + '"');

            // РЕНДЕР ИЗОБРАЖЕНИЯ
            image.toBuffer('PNG',function (err, buffer) {
                if (err) {
                    console.log(err);
                    reject("error");
                } else {
                    console.log(`Coupon for ${receiver} generated`);
                    resolve(buffer);
                }
                // Удаление временных файлов
                fs.rm (
                    pathQR,
                    { recursive: false },
                    (_) => {}
                )
            })
        } catch (err) {
            console.log(err);
            reject("error");
        }
    });
}

module.exports = {
    generate
};
