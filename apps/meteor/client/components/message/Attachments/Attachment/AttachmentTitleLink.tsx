import React, { FC } from 'react';

import Title from './AttachmentTitle';

const AttachmentTitleLink: FC<{ link: string; title?: string | undefined }> = ({ link, title }) => (
	<Title is='a' href={`${link}?download`} color={undefined} target='_blank' download={title} rel='noopener noreferrer'>
		{title}
	</Title>
);

export default AttachmentTitleLink;
