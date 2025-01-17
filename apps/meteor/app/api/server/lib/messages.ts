import { IMessage, IUser } from '@rocket.chat/core-typings';

import { canAccessRoomAsync } from '../../../authorization/server/functions/canAccessRoom';
import { Rooms, Messages, Users } from '../../../models/server/raw';
import { getValue } from '../../../settings/server/raw';

export async function findMentionedMessages({
	uid,
	roomId,
	pagination: { offset, count, sort },
}: {
	uid: string;
	roomId: string;
	pagination: { offset: number; count: number; sort: [string, number][] };
}): Promise<{
	messages: IMessage[];
	count: number;
	offset: number;
	total: number;
}> {
	const room = await Rooms.findOneById(roomId);
	if (!(await canAccessRoomAsync(room, { _id: uid }))) {
		throw new Error('error-not-allowed');
	}
	const user: IUser | null = await Users.findOneById(uid, { fields: { username: 1 } });
	if (!user) {
		throw new Error('invalid-user');
	}

	const cursor = await Messages.findVisibleByMentionAndRoomId(user.username, roomId, {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const total = await cursor.count();

	const messages = await cursor.toArray();

	return {
		messages,
		count: messages.length,
		offset,
		total,
	};
}

export async function findStarredMessages({
	uid,
	roomId,
	pagination: { offset, count, sort },
}: {
	uid: string;
	roomId: string;
	pagination: { offset: number; count: number; sort: [string, number][] };
}): Promise<{
	messages: IMessage[];
	count: number;
	offset: any;
	total: number;
}> {
	const room = await Rooms.findOneById(roomId);
	if (!(await canAccessRoomAsync(room, { _id: uid }))) {
		throw new Error('error-not-allowed');
	}
	const user = await Users.findOneById(uid, { fields: { username: 1 } });
	if (!user) {
		throw new Error('invalid-user');
	}

	const cursor = await Messages.findStarredByUserAtRoom(uid, roomId, {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const total = await cursor.count();

	const messages = await cursor.toArray();

	return {
		messages,
		count: messages.length,
		offset,
		total,
	};
}

export async function findSnippetedMessageById({ uid, messageId }: { uid: string; messageId: string }): Promise<IMessage> {
	if (!(await getValue('Message_AllowSnippeting'))) {
		throw new Error('error-not-allowed');
	}

	if (!uid) {
		throw new Error('invalid-user');
	}

	const snippet = await Messages.findOne({ _id: messageId, snippeted: true });

	if (!snippet) {
		throw new Error('invalid-message');
	}

	const room = await Rooms.findOneById(snippet.rid);

	if (!room) {
		throw new Error('invalid-message');
	}

	if (!(await canAccessRoomAsync(room, { _id: uid }))) {
		throw new Error('error-not-allowed');
	}

	return snippet;
}

export async function findSnippetedMessages({
	uid,
	roomId,
	pagination: { offset, count, sort },
}: {
	uid: string;
	roomId: string;
	pagination: { offset: number; count: number; sort: [string, number][] };
}): Promise<{
	messages: IMessage[];
	count: number;
	offset: number;
	total: number;
}> {
	if (!(await getValue('Message_AllowSnippeting'))) {
		throw new Error('error-not-allowed');
	}
	const room = await Rooms.findOneById(roomId);

	if (!(await canAccessRoomAsync(room, { _id: uid }))) {
		throw new Error('error-not-allowed');
	}

	const cursor = await Messages.findSnippetedByRoom(roomId, {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const total = await cursor.count();

	const messages = await cursor.toArray();

	return {
		messages,
		count: messages.length,
		offset,
		total,
	};
}

export async function findDiscussionsFromRoom({
	uid,
	roomId,
	text,
	pagination: { offset, count, sort },
}: {
	uid: string;
	roomId: string;
	text: string;
	pagination: { offset: number; count: number; sort: [string, number][] };
}): Promise<{
	messages: IMessage[];
	count: number;
	offset: number;
	total: number;
}> {
	const room = await Rooms.findOneById(roomId);

	if (!(await canAccessRoomAsync(room, { _id: uid }))) {
		throw new Error('error-not-allowed');
	}

	const cursor = Messages.findDiscussionsByRoomAndText(roomId, text, {
		sort: sort || { ts: -1 },
		skip: offset,
		limit: count,
	});

	const total = await cursor.count();

	const messages = await cursor.toArray();

	return {
		messages,
		count: messages.length,
		offset,
		total,
	};
}
