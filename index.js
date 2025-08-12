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

    // checkerboard background
    for (let y = 0; y < height; y += 32) {
        for (let x = 0; x < width; x += 32) {
            ctx.fillStyle = ((x + y) / 32) % 2 === 0 ? '#18191c' : '#202124';
            ctx.fillRect(x, y, 32, 32);
        }
    }

    // rounded border
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.arcTo(8, 8, 16, 8, 8);
    ctx.lineTo(width - 16, 8);
    ctx.arcTo(width - 8, 8, width - 8, 16, 8);
    ctx.lineTo(width - 8, height - 16);
    ctx.arcTo(width - 8, height - 8, width - 16, height - 8, 8);
    ctx.lineTo(16, height - 8);
    ctx.arcTo(8, height - 8, 8, height - 16, 8);
    ctx.closePath();
    ctx.stroke();

    // avatar circle
    try {
        const avatarImg = await loadImage(avatar);
        ctx.save();
        ctx.beginPath();
        ctx.arc(48, 64, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 8, 24, 80, 80);
        ctx.restore();
    } catch (e) {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(48, 64, 40, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    // username
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.fillText(`@${username}`, 110, 32);

    // cash
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#00FF66';
    ctx.fillText(`$${Number(start).toLocaleString()} / $${Number(end).toLocaleString()}`, 110, 72);

    res.setHeader('Content-Type', 'image/png');
    res.end(canvas.toBuffer('image/png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
