const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const app = express();

app.get('/gen-image', async (req, res) => {
    const { avatar, username, start, end } = req.query;
    if (!avatar || !username || !start || !end) {
        res.status(400).send('Missing avatar, username, start, or end');
        return;
    }

    const width = 643, height = 127;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

        // พื้นหลัง checkerboard
        ctx.fillStyle = '#18191c';
        ctx.fillRect(0, 0, width, height);
        const checkerSize = 24;
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let y = 0; y < height; y += checkerSize) {
            for (let x = 0; x < width; x += checkerSize) {
                if ((x / checkerSize + y / checkerSize) % 2 === 0) {
                    ctx.fillStyle = '#23272a';
                    ctx.fillRect(x, y, checkerSize, checkerSize);
                }
            }
        }
        ctx.restore();

    // เงาพื้นหลัง
    ctx.save();
    ctx.shadowColor = "#000a";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#23272A";
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.arcTo(8, 8, 16, 8, 18);
    ctx.lineTo(width - 16, 8);
    ctx.arcTo(width - 8, 8, width - 8, 16, 18);
    ctx.lineTo(width - 8, height - 16);
    ctx.arcTo(width - 8, height - 8, width - 16, height - 8, 18);
    ctx.lineTo(16, height - 8);
    ctx.arcTo(8, height - 8, 8, height - 16, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // กรอบโค้งมนบางๆ
    ctx.save();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.arcTo(8, 8, 16, 8, 12);
    ctx.lineTo(width - 16, 8);
    ctx.arcTo(width - 8, 8, width - 8, 16, 12);
    ctx.lineTo(width - 8, height - 16);
    ctx.arcTo(width - 8, height - 8, width - 16, height - 8, 12);
    ctx.lineTo(16, height - 8);
    ctx.arcTo(8, height - 8, 8, height - 16, 12);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // avatar ใหญ่ขึ้น + ขีดวงกลมรอบ avatar ติดขอบโปรไฟล์
    const avatarX = 59, avatarY = 64, avatarR = 35;
    try {
        const avatarImg = await loadImage(avatar);
        // ขีดวงกลมรอบ avatar (ขนาดเท่ากับ avatar)
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR - 1.25, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        // วาดรูปโปรไฟล์แบบ cover (center crop) ให้เต็มขอบวงกลม
        const imgW = avatarImg.width;
        const imgH = avatarImg.height;
        const destSize = (avatarR - 1.25) * 2;
        let sx = 0, sy = 0, sWidth = imgW, sHeight = imgH;
        if (imgW > imgH) {
            sWidth = imgH;
            sx = (imgW - imgH) / 2;
        } else if (imgH > imgW) {
            sHeight = imgW;
            sy = (imgH - imgW) / 2;
        }
        ctx.drawImage(avatarImg, sx, sy, sWidth, sHeight, avatarX - (avatarR - 1.25), avatarY - (avatarR - 1.25), destSize, destSize);
        ctx.restore();
    } catch (e) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR - 1.25, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // username
    ctx.save();
    ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.fillText(`@${username}`, 110, 29);
    ctx.restore();

    // cash
    ctx.save();
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#2ecc40';
    ctx.textBaseline = 'top';
    const cashText = `$${Number(start).toLocaleString()} / $${Number(end).toLocaleString()}`;
    ctx.fillText(cashText, 110, 65);
    ctx.restore();

    res.setHeader('Content-Type', 'image/png');
    res.end(canvas.toBuffer('image/png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
