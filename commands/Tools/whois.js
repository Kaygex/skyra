const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const sortRanks = (a, b) => b.position > a.position;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['userinfo'],
            botPerms: ['EMBED_LINKS'],
            mode: 1,
            cooldown: 15,

            usage: '[query:advuser]',
            description: 'Who are you?'
        });
    }

    async run(msg, [user = msg.author]) {
        const member = await msg.guild.fetchMember(user).catch(() => null);
        const embed = new MessageEmbed();
        if (member) this.member(member, embed);
        else this.user(user, embed);
        return msg.send({ embed });
    }

    member(member, embed) {
        embed
            .setColor(member.highestRole.color || 0xdfdfdf)
            .setTitle(`${member.user.bot ? '[BOT] ' : ''}${member.user.tag}`)
            .setURL(member.user.displayAvatarURL({ size: 1024 }))
            .setDescription([
                `${member.nickname ? `aka **${member.nickname}**.\n` : ''}`,
                `With an ID of \`${member.user.id}\`,`,
                `this user is **${member.user.presence.status}**${member.user.presence.game ? `, playing: **${member.user.presence.game.name}**` : '.'}`,
                '\n',
                `\nJoined Discord on ${moment.utc(member.user.createdAt).format('D/MM/YYYY [at] HH:mm:ss')}`,
                `\nJoined ${member.guild.name} on ${moment.utc(member.joinedAt).format('D/MM/YYYY [at] HH:mm:ss')}`
            ].join(' '))
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setFooter(`${this.client.user.username} ${this.client.version} | ${member.user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
            .setTimestamp();
        if (member.roles.size > 1) {
            embed.addField('❯ Roles:', member.roles
                .array()
                .slice(1)
                .sort(sortRanks)
                .map(role => role.name)
                .join(', '),
            );
        }

        return embed;
    }

    user(user, embed) {
        return embed
            .setColor(0xdfdfdf)
            .setTitle(`${user.bot ? '[BOT] ' : ''}${user.tag}`)
            .setURL(user.displayAvatarURL({ size: 1024 }))
            .setDescription([
                `With an ID of \`${user.id}\``,
                '\n',
                `Joined Discord at ${moment.utc(user.createdAt).format('D/MM/YYYY [at] HH:mm:ss')}`
            ].join(' '), true)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setFooter(`${this.client.user.username} ${this.client.version} | ES | ${user.id}`, this.client.user.displayAvatarURL({ size: 128 }))
            .setTimestamp();
    }

};