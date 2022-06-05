import type { UpdateWriteOpResult } from 'mongodb';
import type { IInvite } from '@rocket.chat/core-typings';
import type { IInvitesModel } from '@rocket.chat/model-typings';
import { registerModel } from '@rocket.chat/models';

import { ModelClass } from './ModelClass';
import { trashCollection } from '../database/trash';
import { db, prefix } from '../database/utils';

export class Invites extends ModelClass<IInvite> implements IInvitesModel {
	findOneByUserRoomMaxUsesAndExpiration(userId: string, rid: string, maxUses: number, daysToExpire: number): Promise<IInvite | null> {
		return this.findOne({
			rid,
			userId,
			days: daysToExpire,
			maxUses,
			...(daysToExpire > 0 ? { expires: { $gt: new Date() } } : {}),
			...(maxUses > 0 ? { uses: { $lt: maxUses } } : {}),
		});
	}

	increaseUsageById(_id: string, uses = 1): Promise<UpdateWriteOpResult> {
		return this.updateOne(
			{ _id },
			{
				$inc: {
					uses,
				},
			},
		);
	}

	async countUses(): Promise<number> {
		const [result] = await this.col
			.aggregate<{ totalUses: number } | undefined>([{ $group: { _id: null, totalUses: { $sum: '$uses' } } }])
			.toArray();

		return result?.totalUses || 0;
	}
}

const col = db.collection(`${prefix}invites`);
registerModel('IInvitesModel', new Invites(col, trashCollection) as IInvitesModel);