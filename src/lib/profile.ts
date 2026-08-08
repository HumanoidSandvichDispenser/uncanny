import type { ProfileGetResponse } from '@sandvichxyz/pecans';

// HACK: pecans doesn't declare `follow` yet
export type ProfileGet = ProfileGetResponse & {
	follow: {
		following: boolean;
		followsYou: boolean;
	};
};
