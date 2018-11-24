import { Command, klasaUtil } from '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['pull'],
			description: 'Update the bot',
			guarded: true,
			permissionLevel: 10,
			usage: '[branch:string]'
		});
	}

	public async run(message, [branch = 'master']) {
		const pullResponse = await klasaUtil.exec(`git pull origin ${branch}`);
		const upToDate = pullResponse.stdout.includes('Already up-to-date.');
		if (upToDate) return message.sendCode('prolog', 'Already up-to-date.');

		const shouldReboot = !upToDate && ('reboot' in message.flags);
		const response = await message.channel.sendCode('prolog', [pullResponse.stdout, pullResponse.stderr || '✔'].join('-=-=-=-\n'));
		if (!await this.isCurrentBranch(branch)) {
			const switchResponse = await message.channel.sendMessage(`Switching to ${branch}...`);
			const checkoutResponse = await klasaUtil.exec(`git checkout ${branch}`);
			await switchResponse.edit([checkoutResponse.stdout, checkoutResponse.stderr || '✔'].join('-=-=-=-\n'), { code: 'prolog' });
			if (shouldReboot) return this.store.get('reboot').run(message, []);
		} else if (shouldReboot) {
			return this.store.get('reboot').run(message, []);
		}
		return response;
	}

	public async isCurrentBranch(branch) {
		const { stdout } = await klasaUtil.exec('git symbolic-ref --short HEAD');
		return stdout.startsWith(`refs/heads/${branch}`) || stdout.startsWith(branch);
	}

}