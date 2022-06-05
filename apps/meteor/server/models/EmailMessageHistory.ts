import { IndexSpecification } from 'mongodb';
import type { InsertOneWriteOpResult, WithId } from 'mongodb';
import { IEmailMessageHistory } from '@rocket.chat/core-typings';
import { IEmailMessageHistoryModel } from '@rocket.chat/model-typings';
import { registerModel } from '@rocket.chat/models';

import { ModelClass } from './ModelClass';
import { trashCollection } from '../database/trash';
import { db, prefix } from '../database/utils';

export class EmailMessageHistory extends ModelClass<IEmailMessageHistory> implements IEmailMessageHistoryModel {
	protected modelIndexes(): IndexSpecification[] {
		return [{ key: { createdAt: 1 }, expireAfterSeconds: 60 * 60 * 24 }];
	}

	async create({ _id, email }: IEmailMessageHistory): Promise<InsertOneWriteOpResult<WithId<IEmailMessageHistory>>> {
		return this.insertOne({
			_id,
			email,
			createdAt: new Date(),
		});
	}
}

const col = db.collection(`${prefix}email_message_history`);
registerModel('IEmailInboxModel', new EmailMessageHistory(col, trashCollection) as IEmailMessageHistoryModel);