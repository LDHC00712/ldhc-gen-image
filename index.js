const express = require('express'); 
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
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

    // พื้นหลัง gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#23272A");
    bgGradient.addColorStop(1, "#2b2d31");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // กรอบโค้งมน + เงา
    ctx.save();
    ctx.shadowColor = "#111a";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.arcTo(width - 8, 8, width - 8, height - 8, 24);
    ctx.arcTo(width - 8, height - 8, 16, height - 8, 24);
    ctx.arcTo(16, height - 8, 16, 8, 24);
    ctx.arcTo(16, 8, width - 8, 8, 24);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // avatar วงกลม + เงา
    try {
        const avatarImg = await loadImage(avatar);
        ctx.save();
        ctx.beginPath();
        ctx.arc(64, 64, 48, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.shadowColor = "#000a";
        ctx.shadowBlur = 10;
        ctx.clip();
        ctx.drawImage(avatarImg, 16, 16, 96, 96);
        ctx.restore();
    } catch (e) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(64, 64, 48, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = "#444";
        ctx.shadowColor = "#000a";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }

    // Username
    ctx.save();
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.shadowColor = "#000a";
    ctx.shadowBlur = 4;
    ctx.fillText(`@${username}`, 130, 32);
    ctx.restore();

    // เงิน
    ctx.save();
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = "#000a";
    ctx.shadowBlur = 4;
    ctx.fillText(`💸 $${Number(start).toLocaleString()} / $${Number(end).toLocaleString()}`, 130, 78);
    ctx.restore();

    // Badge "LEADERBOARD"
    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#5865F2';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(width - 150, 16, 128, 32);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEADERBOARD', width - 86, 32);
    ctx.restore();

    res.setHeader('Content-Type', 'image/png');
    res.end(canvas.toBuffer('image/png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
