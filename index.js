const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const app = express();

app.get('/gen-image', async (req, res) => {
    const { avatar, start, end } = req.query;
    if (!avatar || !start || !end) {
        res.status(400).send('Missing avatar, start, or end');
        return;
    }

    const width = 400, height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, width, height);

    try {
        const avatarImg = await loadImage(avatar);
        ctx.drawImage(avatarImg, 20, 40, 120, 120);
    } catch (e) {
        ctx.fillStyle = '#444';
        ctx.fillRect(20, 40, 120, 120);
    }

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('DHC Progress', 160, 70);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#00FF00';
    ctx.fillText(`$${Number(start).toLocaleString()} > $${Number(end).toLocaleString()}`, 160, 120);

    res.setHeader('Content-Type', 'image/png');
    res.end(canvas.toBuffer('image/png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});