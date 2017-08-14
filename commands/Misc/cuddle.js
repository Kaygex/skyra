const { Command } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { roundImage } = require('../../functions/canvas');
const { readFile } = require('fs-nextra');
const { join, resolve } = require('path');
const Canvas = require('canvas');

const template = resolve(join(__dirname, '../../assets/images/memes/cuddle.png'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            cooldown: 30,

            usage: '<user:advuser>',
            description: 'Cuddle somebody!'
        });
    }

    async run(msg, [user]) {
        const output = await this.generate(msg, user);
        return msg.channel.send({ files: [{ attachment: output, name: 'Cuddle.png' }] });
    }

    async generate(msg, user) {
        const canvas = new Canvas(636, 366);
        const background = new Canvas.Image();
        const man = new Canvas.Image();
        const woman = new Canvas.Image();
        const ctx = canvas.getContext('2d');

        if (user.id === msg.author.id) user = this.client.user;

        /* Get the buffers from both profile avatars */
        const [bgBuffer, manBuffer, womanBuffer] = await Promise.all([
            readFile(template),
            fetchAvatar(msg.author, 256),
            fetchAvatar(user, 256)
        ]);
        background.src = bgBuffer;
        man.src = manBuffer;
        woman.src = womanBuffer;

        background.onload = () => ctx.drawImage(background, 0, 0, 636, 366);
        roundImage(ctx, man, 238, 63, 70);
        roundImage(ctx, woman, 377, 111, 69);

        return canvas.toBuffer();
    }

};