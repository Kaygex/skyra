import { isFunction } from '@klasa/utils';
import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { ratelimit } from '@utils/util';
import { Language } from 'klasa';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export default class extends Route {

	@ratelimit(2, 2500)
	public get(request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const language = (lang && this.client.languages.get(lang as string)) ?? this.client.languages.default;
		const commands = (category
			? this.client.commands.filter(cmd => cmd.category === category)
			: this.client.commands
		).filter(cmd => cmd.permissionLevel < 9);

		const serializedCommands = commands.map(cmd => ({
			bucket: cmd.bucket,
			category: cmd.category,
			cooldown: cmd.cooldown,
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			description: isFunction(cmd.description) ? cmd.description(language as Language) : cmd.description,
			guarded: cmd.guarded,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			requiredPermissions: cmd.requiredPermissions.toArray(),
			usage: cmd.usageString
		}));
		return response.json(serializedCommands);
	}

}
